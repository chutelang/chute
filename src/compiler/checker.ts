import type { Span } from "./token.ts";
import { Lexer } from "./lexer.ts";
import { Parser } from "./parser.ts";
import { resolveEnumBackingValue, resolveStageCalleeName } from "./ast.ts";
import type {
  ImportDeclaration,
  ActionDeclaration,
  Assignment,
  BaseType,
  BinaryExpression,
  CallExpression,
  CoalesceExpression,
  Condition,
  DictionaryLiteral,
  EnumDeclaration,
  Expression,
  ForStatement,
  FunctionDeclaration,
  Identifier,
  IfStatement,
  InterpolatedString,
  LetDeclaration,
  LetDestructure,
  ListLiteral,
  MemberExpression,
  MenuStatement,
  NamedType,
  OptionalMemberExpression,
  PipelineExpression,
  Program,
  RecordDeclaration,
  RepeatStatement,
  ReturnStatement,
  Statement,
  SubscriptExpression,
  TernaryExpression,
  TypeAnnotation,
  UnaryExpression,
  VarDeclaration,
} from "./ast.ts";

export type ChuteType =
  | { kind: "text" }
  | { kind: "number" }
  | { kind: "boolean" }
  | { kind: "nil" }
  | { kind: "optional"; inner: ChuteType }
  | { kind: "list"; element: ChuteType }
  | { kind: "dictionary" }
  | { kind: "quantity"; unit: string }
  | { kind: "enum"; name: string; cases: Map<string, string> }
  | { kind: "record"; name: string; fields: Map<string, ChuteType> }
  | {
      kind: "function";
      name: string;
      params: Array<{ name: string; type: ChuteType; hasDefault: boolean }>;
      returnType: ChuteType | undefined;
    }
  | {
      kind: "action";
      name: string;
      runtimeIdentifier: string;
      params: Array<{ label: string; type: ChuteType; hasDefault: boolean }>;
      returnType: ChuteType | undefined;
    }
  | { kind: "any" };

export class CheckWarning {
  constructor(
    public message: string,
    public span: Span,
  ) {}
}

interface CallEdge {
  caller: string;
  callee: string;
  span: Span;
}

interface CheckContext {
  expectedReturnType: ChuteType | undefined;
  currentFunction: string | undefined;
  warnings: CheckWarning[];
  callEdges: CallEdge[];
}

export class CheckError extends Error {
  constructor(
    message: string,
    public span: Span,
  ) {
    super(message);
  }
}

export interface FileResolver {
  resolve(importingFile: string, importPath: string): string;
  read(resolvedPath: string): string;
}

export interface CheckOptions {
  resolver?: FileResolver;
  filePath?: string;
}

interface Binding {
  type: ChuteType;
  mutable: boolean;
}

export class Scope {
  private bindings = new Map<string, Binding>();
  private types = new Map<string, ChuteType>();
  private namespaces = new Map<string, Scope>();
  private parent: Scope | undefined;

  constructor(parent: Scope | undefined) {
    this.parent = parent;
  }

  hasOwn(name: string): boolean {
    return this.bindings.has(name);
  }

  define(name: string, type: ChuteType, mutable: boolean): void {
    this.bindings.set(name, { type, mutable });
  }

  lookup(name: string): Binding | undefined {
    const own = this.bindings.get(name);
    if (own) {
      return own;
    }
    return this.parent?.lookup(name);
  }

  defineType(name: string, type: ChuteType): void {
    this.types.set(name, type);
  }

  lookupType(name: string): ChuteType | undefined {
    const own = this.types.get(name);
    if (own) {
      return own;
    }
    return this.parent?.lookupType(name);
  }

  defineNamespace(name: string, scope: Scope): void {
    this.namespaces.set(name, scope);
  }

  lookupNamespace(name: string): Scope | undefined {
    const own = this.namespaces.get(name);
    if (own) return own;
    return this.parent?.lookupNamespace(name);
  }
}

export function check(program: Program, options?: CheckOptions): CheckWarning[] {
  const scope = new Scope(undefined);
  const context: CheckContext = {
    expectedReturnType: undefined,
    currentFunction: undefined,
    warnings: [],
    callEdges: [],
  };

  scope.define("input", { kind: "any" }, false);

  const resolver = options?.resolver;
  const filePath = options?.filePath ?? "<main>";
  const importAliases = new Set<string>();

  if (resolver && program.imports.length > 0) {
    const resolving = new Set<string>([filePath]);
    resolveImports(program.imports, scope, context, resolver, filePath, resolving, importAliases);
  }

  for (const stmt of program.body) {
    if ("name" in stmt && typeof stmt.name === "string" && importAliases.has(stmt.name)) {
      throw new CheckError(
        `declaration '${stmt.name}' conflicts with import alias '${stmt.name}'`,
        stmt.span,
      );
    }
  }

  for (const stmt of program.body) {
    if (stmt.kind === "FunctionDeclaration") {
      registerFunctionSignature(stmt, scope, context);
    } else if (stmt.kind === "EnumDeclaration") {
      checkEnumDeclaration(stmt, scope);
    } else if (stmt.kind === "RecordDeclaration") {
      checkRecordDeclaration(stmt, scope);
    } else if (stmt.kind === "ActionDeclaration") {
      checkActionDeclaration(stmt, scope, context);
    }
  }

  for (const stmt of program.body) {
    if (
      stmt.kind === "EnumDeclaration" ||
      stmt.kind === "RecordDeclaration" ||
      stmt.kind === "ActionDeclaration"
    ) {
      continue;
    }
    checkStatement(stmt, scope, context);
  }

  detectRecursiveCycles(context);

  return context.warnings;
}

function resolveImports(
  imports: ImportDeclaration[],
  scope: Scope,
  context: CheckContext,
  resolver: FileResolver,
  currentFile: string,
  resolving: Set<string>,
  importAliases: Set<string>,
): void {
  const seenAliases = new Set<string>();

  for (const imp of imports) {
    if (seenAliases.has(imp.alias)) {
      throw new CheckError(`duplicate import alias '${imp.alias}'`, imp.span);
    }
    seenAliases.add(imp.alias);
    importAliases.add(imp.alias);

    if (imp.isPackage) {
      continue;
    }

    let resolvedPath: string;
    try {
      resolvedPath = resolver.resolve(currentFile, imp.path);
    } catch (e) {
      throw new CheckError(
        `cannot resolve import '${imp.path}': ${e instanceof Error ? e.message : String(e)}`,
        imp.span,
      );
    }

    if (resolving.has(resolvedPath)) {
      throw new CheckError(`import cycle detected: '${imp.path}'`, imp.span);
    }

    resolving.add(resolvedPath);

    let source: string;
    try {
      source = resolver.read(resolvedPath);
    } catch (e) {
      throw new CheckError(
        `cannot read import '${imp.path}': ${e instanceof Error ? e.message : String(e)}`,
        imp.span,
      );
    }
    const libTokens = new Lexer(source).tokenize();
    const libAst = new Parser(libTokens).parse();

    validateLibrary(libAst, imp.span);

    const libScope = new Scope(undefined);
    const libAliases = new Set<string>();
    if (libAst.imports.length > 0) {
      resolveImports(
        libAst.imports,
        libScope,
        context,
        resolver,
        resolvedPath,
        resolving,
        libAliases,
      );
    }

    for (const stmt of libAst.body) {
      if (stmt.kind === "FunctionDeclaration") {
        registerFunctionSignature(stmt, libScope, context);
      } else if (stmt.kind === "EnumDeclaration") {
        checkEnumDeclaration(stmt, libScope);
      } else if (stmt.kind === "RecordDeclaration") {
        checkRecordDeclaration(stmt, libScope);
      } else if (stmt.kind === "ActionDeclaration") {
        checkActionDeclaration(stmt, libScope, context);
      } else if (stmt.kind === "LetDeclaration") {
        checkLetDeclaration(stmt, libScope, context);
      }
    }

    for (const stmt of libAst.body) {
      if (stmt.kind === "FunctionDeclaration") {
        checkFunctionDeclaration(stmt, libScope, context);
      }
    }

    const namespaceScope = new Scope(undefined);
    for (const stmt of libAst.body) {
      if (!("exported" in stmt) || !stmt.exported) continue;

      if (stmt.kind === "FunctionDeclaration") {
        const binding = libScope.lookup(stmt.name);
        if (binding) namespaceScope.define(stmt.name, binding.type, false);
      } else if (stmt.kind === "ActionDeclaration") {
        const binding = libScope.lookup(stmt.name);
        if (binding) namespaceScope.define(stmt.name, binding.type, false);
      } else if (stmt.kind === "EnumDeclaration") {
        const typeDef = libScope.lookupType(stmt.name);
        if (typeDef) {
          namespaceScope.defineType(stmt.name, typeDef);
          namespaceScope.define(stmt.name, typeDef, false);
        }
      } else if (stmt.kind === "RecordDeclaration") {
        const typeDef = libScope.lookupType(stmt.name);
        if (typeDef) {
          namespaceScope.defineType(stmt.name, typeDef);
          namespaceScope.define(stmt.name, typeDef, false);
        }
      }
    }

    scope.defineNamespace(imp.alias, namespaceScope);
    resolving.delete(resolvedPath);
  }
}

function validateLibrary(ast: Program, importSpan: Span): void {
  if (ast.metadata) {
    throw new CheckError("libraries cannot contain a shortcut block", importSpan);
  }

  for (const stmt of ast.body) {
    if (stmt.kind === "VarDeclaration") {
      throw new CheckError("libraries cannot contain var declarations", stmt.span);
    }

    const isDeclaration =
      stmt.kind === "LetDeclaration" ||
      stmt.kind === "LetDestructure" ||
      stmt.kind === "FunctionDeclaration" ||
      stmt.kind === "ActionDeclaration" ||
      stmt.kind === "EnumDeclaration" ||
      stmt.kind === "RecordDeclaration";

    if (!isDeclaration) {
      throw new CheckError("libraries cannot contain statements", stmt.span);
    }
  }
}

function checkStatement(stmt: Statement, scope: Scope, context: CheckContext): void {
  switch (stmt.kind) {
    case "ExpressionStatement":
      checkExpressionStatement(stmt.expression, scope, context);
      return;
    case "LetDeclaration":
      checkLetDeclaration(stmt, scope, context);
      return;
    case "VarDeclaration":
      checkVarDeclaration(stmt, scope, context);
      return;
    case "Assignment":
      checkAssignment(stmt, scope, context);
      return;
    case "IfStatement":
      checkIfStatement(stmt, scope, context);
      return;
    case "ForStatement":
      checkForStatement(stmt, scope, context);
      return;
    case "RepeatStatement":
      checkRepeatStatement(stmt, scope, context);
      return;
    case "MenuStatement":
      checkMenuStatement(stmt, scope, context);
      return;
    case "LetDestructure":
      checkLetDestructure(stmt, scope, context);
      return;
    case "EnumDeclaration":
      checkEnumDeclaration(stmt, scope);
      return;
    case "RecordDeclaration":
      checkRecordDeclaration(stmt, scope);
      return;
    case "FunctionDeclaration":
      checkFunctionDeclaration(stmt, scope, context);
      return;
    case "ReturnStatement":
      checkReturnStatement(stmt, scope, context);
      return;
    case "ActionDeclaration":
      checkActionDeclaration(stmt, scope, context);
      return;
    default:
      assertNever(stmt);
  }
}

function checkExpressionStatement(expr: Expression, scope: Scope, context: CheckContext): void {
  inferType(expr, scope, context);

  if (expr.kind === "PipelineExpression") {
    const lastStage = expr.stages.at(-1);
    if (lastStage) {
      const calleeName = resolveStageCalleeName(lastStage.callee);
      if (calleeName) {
        const binding = scope.lookup(calleeName);
        if (binding?.type.kind === "function") {
          throw new CheckError(
            `pipeline expression statement must end in an action call`,
            lastStage.span,
          );
        }
      }
    }
  }
}

function checkLetDeclaration(decl: LetDeclaration, scope: Scope, context: CheckContext): void {
  if (scope.hasOwn(decl.name)) {
    throw new CheckError(`variable '${decl.name}' is already declared in this scope`, decl.span);
  }

  const bindingType = checkDeclarationInitializer(decl, scope, context);
  scope.define(decl.name, bindingType, false);
}

function checkVarDeclaration(decl: VarDeclaration, scope: Scope, context: CheckContext): void {
  if (scope.hasOwn(decl.name)) {
    throw new CheckError(`variable '${decl.name}' is already declared in this scope`, decl.span);
  }

  const bindingType = checkDeclarationInitializer(decl, scope, context);
  scope.define(decl.name, bindingType, true);
}

function checkDeclarationInitializer(
  decl: LetDeclaration | VarDeclaration,
  scope: Scope,
  context: CheckContext,
): ChuteType {
  if (!decl.typeAnnotation) {
    return inferType(decl.initializer, scope, context);
  }

  const annotationType = typeFromAnnotation(decl.typeAnnotation, scope);
  const initializerType = inferTypeWithHint(decl.initializer, scope, annotationType, context);
  if (!isAssignable(initializerType, annotationType)) {
    throw new CheckError(
      `cannot assign ${describeType(initializerType)} to ${describeType(annotationType)}`,
      decl.span,
    );
  }

  return annotationType;
}

function checkAssignment(assign: Assignment, scope: Scope, context: CheckContext): void {
  const binding = scope.lookup(assign.place.root);
  if (!binding) {
    throw new CheckError(`undefined variable '${assign.place.root}'`, assign.place.span);
  }

  if (!binding.mutable) {
    throw new CheckError(
      `cannot assign to '${assign.place.root}' because it is a let binding`,
      assign.span,
    );
  }

  const hint = assign.place.accessors.length === 0 ? binding.type : undefined;
  const valueType = inferTypeWithHint(assign.value, scope, hint, context);

  for (const accessor of assign.place.accessors) {
    if (accessor.kind === "SubscriptAccessor") {
      inferType(accessor.index, scope, context);
    }
  }

  if (assign.place.accessors.length === 0 && !isAssignable(valueType, binding.type)) {
    throw new CheckError(
      `cannot assign ${describeType(valueType)} to variable of type ${describeType(binding.type)}`,
      assign.span,
    );
  }
}

function inferTypeWithHint(
  expr: Expression,
  scope: Scope,
  hint: ChuteType | undefined,
  context: CheckContext,
): ChuteType {
  if (expr.kind === "DotNameExpression" && hint?.kind === "enum") {
    const backingValue = hint.cases.get(expr.name);
    if (backingValue === undefined) {
      throw new CheckError(`'${expr.name}' is not a case of enum '${hint.name}'`, expr.span);
    }
    expr.resolvedBackingValue = backingValue;
    return hint;
  }
  return inferType(expr, scope, context);
}

function inferType(expr: Expression, scope: Scope, context: CheckContext): ChuteType {
  switch (expr.kind) {
    case "StringLiteral":
      return { kind: "text" };
    case "NumberLiteral":
      return { kind: "number" };
    case "BooleanLiteral":
      return { kind: "boolean" };
    case "NilLiteral":
      return { kind: "nil" };
    case "Identifier":
      return inferIdentifier(expr, scope);
    case "BinaryExpression":
      return inferBinaryExpression(expr, scope, context);
    case "UnaryExpression":
      return inferUnaryExpression(expr, scope, context);
    case "CoalesceExpression":
      return inferCoalesceExpression(expr, scope, context);
    case "MemberExpression":
      return inferMemberExpression(expr, scope, context);
    case "OptionalMemberExpression":
      return inferOptionalMemberExpression(expr, scope, context);
    case "SubscriptExpression":
      return inferSubscriptExpression(expr, scope, context);
    case "InterpolatedString":
      return inferInterpolatedString(expr, scope, context);
    case "ListLiteral":
      return inferListLiteral(expr, scope, context);
    case "DictionaryLiteral":
      return inferDictionaryLiteral(expr, scope, context);
    case "CallExpression":
      return inferCallExpression(expr, scope, context);
    case "TernaryExpression":
      return inferTernaryExpression(expr, scope, context);
    case "PipelineExpression":
      return inferPipelineExpression(expr, scope, context);
    case "PlaceholderExpression":
      throw new CheckError(
        `'_' placeholder can only be used in pipeline stage arguments`,
        expr.span,
      );
    case "DotNameExpression":
      throw new CheckError(`cannot resolve '.${expr.name}' without a contextual type`, expr.span);
    case "HashIndexExpression":
      return { kind: "number" };
    default:
      return assertNever(expr);
  }
}

function inferIdentifier(expr: Identifier, scope: Scope): ChuteType {
  const binding = scope.lookup(expr.name);
  if (!binding) {
    throw new CheckError(`undefined variable '${expr.name}'`, expr.span);
  }
  return binding.type;
}

function inferBinaryExpression(
  expr: BinaryExpression,
  scope: Scope,
  context: CheckContext,
): ChuteType {
  const leftType = inferType(expr.left, scope, context);
  const rightType = inferType(expr.right, scope, context);

  requireNumber(leftType, expr.left.span);
  requireNumber(rightType, expr.right.span);

  return { kind: "number" };
}

function inferUnaryExpression(
  expr: UnaryExpression,
  scope: Scope,
  context: CheckContext,
): ChuteType {
  const operandType = inferType(expr.operand, scope, context);
  requireNumber(operandType, expr.operand.span);
  return { kind: "number" };
}

function inferCoalesceExpression(
  expr: CoalesceExpression,
  scope: Scope,
  context: CheckContext,
): ChuteType {
  const leftType = inferType(expr.left, scope, context);
  const rightType = inferType(expr.right, scope, context);

  if (leftType.kind === "any") {
    return rightType;
  }

  if (leftType.kind !== "optional") {
    throw new CheckError(
      `'??' requires an optional left operand, got ${describeType(leftType)}`,
      expr.left.span,
    );
  }

  if (!isAssignable(rightType, leftType.inner)) {
    throw new CheckError(
      `right operand of ?? must be assignable to ${describeType(leftType.inner)}`,
      expr.right.span,
    );
  }

  return leftType.inner;
}

function inferMemberExpression(
  expr: MemberExpression,
  scope: Scope,
  context: CheckContext,
): ChuteType {
  if (expr.object.kind === "Identifier") {
    const ns = scope.lookupNamespace(expr.object.name);
    if (ns) {
      const binding = ns.lookup(expr.property);
      if (binding) return binding.type;

      const typeDef = ns.lookupType(expr.property);
      if (typeDef) return typeDef;

      throw new CheckError(
        `'${expr.property}' is not exported from '${expr.object.name}'`,
        expr.span,
      );
    }

    const typeDef = scope.lookupType(expr.object.name);
    if (typeDef?.kind === "enum") {
      const backingValue = typeDef.cases.get(expr.property);
      if (backingValue === undefined) {
        throw new CheckError(
          `'${expr.property}' is not a case of enum '${typeDef.name}'`,
          expr.span,
        );
      }
      return typeDef;
    }
  }

  const objectType = inferType(expr.object, scope, context);

  if (objectType.kind === "record") {
    const fieldType = objectType.fields.get(expr.property);
    if (!fieldType) {
      throw new CheckError(
        `record '${objectType.name}' has no field '${expr.property}'`,
        expr.span,
      );
    }
    return fieldType;
  }

  return { kind: "any" };
}

function inferOptionalMemberExpression(
  expr: OptionalMemberExpression,
  scope: Scope,
  context: CheckContext,
): ChuteType {
  const objectType = inferType(expr.object, scope, context);

  if (objectType.kind !== "optional" && objectType.kind !== "any") {
    throw new CheckError(
      `'?.' requires an optional object, got ${describeType(objectType)}`,
      expr.object.span,
    );
  }

  return {
    kind: "optional",
    inner: {
      kind: "any",
    },
  };
}

function inferSubscriptExpression(
  expr: SubscriptExpression,
  scope: Scope,
  context: CheckContext,
): ChuteType {
  const objectType = inferType(expr.object, scope, context);
  inferType(expr.index, scope, context);

  if (objectType.kind === "list") {
    return objectType.element;
  }

  if (objectType.kind === "dictionary" || objectType.kind === "any") {
    return { kind: "any" };
  }

  throw new CheckError(`cannot subscript ${describeType(objectType)}`, expr.object.span);
}

function inferInterpolatedString(
  expr: InterpolatedString,
  scope: Scope,
  context: CheckContext,
): ChuteType {
  for (const part of expr.parts) {
    if (part.kind === "ExpressionPart") {
      inferType(part.expression, scope, context);
    }
  }
  return { kind: "text" };
}

function inferListLiteral(expr: ListLiteral, scope: Scope, context: CheckContext): ChuteType {
  const first = expr.elements.at(0);
  if (!first) {
    return {
      kind: "list",
      element: {
        kind: "any",
      },
    };
  }

  const elementType = inferType(first, scope, context);

  for (const element of expr.elements.slice(1)) {
    const type = inferType(element, scope, context);
    if (!isAssignable(type, elementType)) {
      throw new CheckError(
        `list elements must have a consistent type: expected ${describeType(elementType)}, got ${describeType(type)}`,
        element.span,
      );
    }
  }

  return {
    kind: "list",
    element: elementType,
  };
}

function inferDictionaryLiteral(
  expr: DictionaryLiteral,
  scope: Scope,
  context: CheckContext,
): ChuteType {
  for (const entry of expr.entries) {
    inferType(entry.key, scope, context);
    inferType(entry.value, scope, context);
  }
  return { kind: "dictionary" };
}

function inferCallExpression(expr: CallExpression, scope: Scope, context: CheckContext): ChuteType {
  if (expr.callee.kind === "MemberExpression" && expr.callee.object.kind === "Identifier") {
    const ns = scope.lookupNamespace(expr.callee.object.name);
    if (ns) {
      const binding = ns.lookup(expr.callee.property);
      if (binding?.type.kind === "function") {
        return checkFunctionCall(expr, binding.type, scope, context);
      }
      if (binding?.type.kind === "action") {
        return checkActionCall(expr, binding.type, scope, context);
      }
      const typeDef = ns.lookupType(expr.callee.property);
      if (typeDef?.kind === "record") {
        return checkRecordConstruction(expr, typeDef, scope, context);
      }
      throw new CheckError(
        `'${expr.callee.property}' is not exported from '${expr.callee.object.name}'`,
        expr.callee.span,
      );
    }
  }

  if (expr.callee.kind === "Identifier") {
    const typeDef = scope.lookupType(expr.callee.name);
    if (typeDef?.kind === "record") {
      return checkRecordConstruction(expr, typeDef, scope, context);
    }

    const binding = scope.lookup(expr.callee.name);
    if (binding?.type.kind === "function") {
      return checkFunctionCall(expr, binding.type, scope, context);
    }
    if (binding?.type.kind === "action") {
      return checkActionCall(expr, binding.type, scope, context);
    }
  }

  if (expr.callee.kind !== "Identifier") {
    inferType(expr.callee, scope, context);
  }
  for (const arg of expr.args) {
    inferType(arg.value, scope, context);
  }
  return { kind: "any" };
}

function checkFunctionCall(
  expr: CallExpression,
  funcType: ChuteType & { kind: "function" },
  scope: Scope,
  context: CheckContext,
): ChuteType {
  const provided = new Map<string, Expression>();

  for (const arg of expr.args) {
    if (!arg.label) {
      throw new CheckError(`function calls require labeled arguments`, arg.span);
    }

    const param = funcType.params.find((p) => p.name === arg.label);
    if (!param) {
      throw new CheckError(`function '${funcType.name}' has no parameter '${arg.label}'`, arg.span);
    }

    if (provided.has(arg.label)) {
      throw new CheckError(`duplicate argument '${arg.label}' in function call`, arg.span);
    }
    provided.set(arg.label, arg.value);

    const argType = inferTypeWithHint(arg.value, scope, param.type, context);
    if (!isAssignable(argType, param.type)) {
      throw new CheckError(
        `cannot pass ${describeType(argType)} for parameter '${arg.label}' of type ${describeType(param.type)}`,
        arg.span,
      );
    }
  }

  for (const param of funcType.params) {
    if (!provided.has(param.name) && !param.hasDefault) {
      throw new CheckError(
        `missing argument '${param.name}' in call to '${funcType.name}'`,
        expr.span,
      );
    }
  }

  if (context.currentFunction) {
    context.callEdges.push({
      caller: context.currentFunction,
      callee: funcType.name,
      span: expr.span,
    });
  }

  return funcType.returnType ?? { kind: "any" };
}

function checkRecordConstruction(
  expr: CallExpression,
  recordType: ChuteType & { kind: "record" },
  scope: Scope,
  context: CheckContext,
): ChuteType {
  const provided = new Set<string>();

  for (const arg of expr.args) {
    if (!arg.label) {
      throw new CheckError(`record construction requires labeled arguments`, arg.span);
    }

    const fieldType = recordType.fields.get(arg.label);
    if (!fieldType) {
      throw new CheckError(`record '${recordType.name}' has no field '${arg.label}'`, arg.span);
    }

    if (provided.has(arg.label)) {
      throw new CheckError(`duplicate field '${arg.label}' in record construction`, arg.span);
    }
    provided.add(arg.label);

    const argType = inferTypeWithHint(arg.value, scope, fieldType, context);
    if (!isAssignable(argType, fieldType)) {
      throw new CheckError(
        `cannot assign ${describeType(argType)} to field '${arg.label}' of type ${describeType(fieldType)}`,
        arg.span,
      );
    }
  }

  for (const [fieldName] of recordType.fields) {
    if (!provided.has(fieldName)) {
      throw new CheckError(
        `missing field '${fieldName}' in construction of record '${recordType.name}'`,
        expr.span,
      );
    }
  }

  return recordType;
}

function requireNumber(type: ChuteType, span: Span): void {
  if (type.kind !== "number" && type.kind !== "any") {
    throw new CheckError(`expected Number, got ${describeType(type)}`, span);
  }
}

function typeFromAnnotation(annotation: TypeAnnotation, scope: Scope): ChuteType {
  const base = baseTypeFromAnnotation(annotation.base, scope);
  return annotation.optional
    ? {
        kind: "optional",
        inner: base,
      }
    : base;
}

function baseTypeFromAnnotation(base: BaseType, scope: Scope): ChuteType {
  switch (base.kind) {
    case "NamedType":
      return namedTypeFromAnnotation(base, scope);
    case "ListType":
      return {
        kind: "list",
        element: typeFromAnnotation(base.elementType, scope),
      };
    case "QuantityType":
      return {
        kind: "quantity",
        unit: base.unit,
      };
    default:
      return assertNever(base);
  }
}

function namedTypeFromAnnotation(named: NamedType, scope: Scope): ChuteType {
  switch (named.name) {
    case "Text":
      return { kind: "text" };
    case "Number":
      return { kind: "number" };
    case "Boolean":
      return { kind: "boolean" };
    case "Dictionary":
      return { kind: "dictionary" };
    default: {
      const typeDef = scope.lookupType(named.name);
      if (typeDef) {
        return typeDef;
      }
      return { kind: "any" };
    }
  }
}

function isAssignable(source: ChuteType, target: ChuteType): boolean {
  if (source.kind === "any" || target.kind === "any") {
    return true;
  }

  if (source.kind === "nil" && target.kind === "optional") {
    return true;
  }

  if (target.kind === "optional") {
    if (source.kind === "optional") {
      return isAssignable(source.inner, target.inner);
    }
    return isAssignable(source, target.inner);
  }

  if (source.kind === "optional") {
    return false;
  }

  if (source.kind !== target.kind) {
    return false;
  }

  if (source.kind === "list" && target.kind === "list") {
    return isAssignable(source.element, target.element);
  }

  if (source.kind === "quantity" && target.kind === "quantity") {
    return source.unit === target.unit;
  }

  if (source.kind === "enum" && target.kind === "enum") {
    return source.name === target.name;
  }

  if (source.kind === "record" && target.kind === "record") {
    return source.name === target.name;
  }

  return true;
}

function describeType(type: ChuteType): string {
  switch (type.kind) {
    case "text":
      return "Text";
    case "number":
      return "Number";
    case "boolean":
      return "Boolean";
    case "nil":
      return "nil";
    case "optional":
      return `${describeType(type.inner)}?`;
    case "list":
      return `List<${describeType(type.element)}>`;
    case "dictionary":
      return "Dictionary";
    case "quantity":
      return `Quantity<${type.unit}>`;
    case "enum":
      return type.name;
    case "record":
      return type.name;
    case "function":
      return `func ${type.name}`;
    case "action":
      return `action ${type.name}`;
    case "any":
      return "any";
    default:
      return assertNever(type);
  }
}

function checkIfStatement(stmt: IfStatement, scope: Scope, context: CheckContext): void {
  checkCondition(stmt.condition, scope, context);

  const bodyScope = new Scope(scope);
  const narrowing = extractNilNarrowing(stmt.condition, scope);
  if (narrowing && narrowing.branch === "body") {
    bodyScope.define(narrowing.name, narrowing.narrowedType, narrowing.mutable);
  }

  for (const s of stmt.body) {
    checkStatement(s, bodyScope, context);
  }

  if (stmt.elseBody) {
    if (Array.isArray(stmt.elseBody)) {
      const elseScope = new Scope(scope);
      if (narrowing && narrowing.branch === "else") {
        elseScope.define(narrowing.name, narrowing.narrowedType, narrowing.mutable);
      }
      for (const s of stmt.elseBody) {
        checkStatement(s, elseScope, context);
      }
    } else {
      checkIfStatement(stmt.elseBody, scope, context);
    }
  }
}

interface NilNarrowing {
  name: string;
  narrowedType: ChuteType;
  mutable: boolean;
  branch: "body" | "else";
}

function extractNilNarrowing(cond: Condition, scope: Scope): NilNarrowing | undefined {
  if (cond.kind !== "Comparison") return undefined;
  if (cond.operator !== "==" && cond.operator !== "!=") return undefined;

  let identName: string | undefined;
  let isNilRight = false;

  if (cond.left.kind === "Identifier" && cond.right.kind === "NilLiteral") {
    identName = cond.left.name;
    isNilRight = true;
  } else if (cond.right.kind === "Identifier" && cond.left.kind === "NilLiteral") {
    identName = cond.right.name;
    isNilRight = true;
  }

  if (!identName || !isNilRight) return undefined;

  const binding = scope.lookup(identName);
  if (!binding || binding.type.kind !== "optional") return undefined;

  const narrowedType = binding.type.inner;
  const mutable = binding.mutable;

  if (cond.operator === "!=") {
    return { name: identName, narrowedType, mutable, branch: "body" };
  }
  return { name: identName, narrowedType, mutable, branch: "else" };
}

function checkForStatement(stmt: ForStatement, scope: Scope, context: CheckContext): void {
  const iterableType = inferType(stmt.iterable, scope, context);
  const bodyScope = new Scope(scope);

  if (iterableType.kind === "list") {
    bodyScope.define(stmt.variable, iterableType.element, false);
  } else if (iterableType.kind === "any") {
    bodyScope.define(stmt.variable, { kind: "any" }, false);
  } else {
    throw new CheckError(
      `for...in requires a list, got ${describeType(iterableType)}`,
      stmt.iterable.span,
    );
  }

  for (const s of stmt.body) {
    checkStatement(s, bodyScope, context);
  }
}

function checkRepeatStatement(stmt: RepeatStatement, scope: Scope, context: CheckContext): void {
  const countType = inferType(stmt.count, scope, context);
  requireNumber(countType, stmt.count.span);
  const bodyScope = new Scope(scope);
  for (const s of stmt.body) {
    checkStatement(s, bodyScope, context);
  }
}

function checkMenuStatement(stmt: MenuStatement, scope: Scope, context: CheckContext): void {
  inferType(stmt.prompt, scope, context);
  for (const c of stmt.cases) {
    const caseScope = new Scope(scope);
    if (stmt.variable) {
      caseScope.define(stmt.variable, { kind: "text" }, false);
    }
    for (const s of c.body) {
      checkStatement(s, caseScope, context);
    }
  }
}

function checkCondition(cond: Condition, scope: Scope, context: CheckContext): void {
  switch (cond.kind) {
    case "OrCondition":
      checkCondition(cond.left, scope, context);
      checkCondition(cond.right, scope, context);
      return;
    case "AndCondition":
      checkCondition(cond.left, scope, context);
      checkCondition(cond.right, scope, context);
      return;
    case "NotCondition":
      checkCondition(cond.operand, scope, context);
      return;
    case "Comparison":
      inferType(cond.left, scope, context);
      inferType(cond.right, scope, context);
      return;
    case "RangeTest":
      inferType(cond.subject, scope, context);
      inferType(cond.low, scope, context);
      inferType(cond.high, scope, context);
      return;
    case "TypeTest":
      inferType(cond.subject, scope, context);
      return;
    case "BooleanReference":
      inferType(cond.subject, scope, context);
      return;
    case "BooleanLiteralCondition":
      return;
    default:
      assertNever(cond);
  }
}

function inferTernaryExpression(
  expr: TernaryExpression,
  scope: Scope,
  context: CheckContext,
): ChuteType {
  checkCondition(expr.condition, scope, context);
  const consequentType = inferType(expr.consequent, scope, context);
  const alternateType = inferType(expr.alternate, scope, context);

  if (isAssignable(alternateType, consequentType)) {
    return consequentType;
  }
  if (isAssignable(consequentType, alternateType)) {
    return alternateType;
  }
  return { kind: "any" };
}

function checkLetDestructure(stmt: LetDestructure, scope: Scope, context: CheckContext): void {
  const initializerType = inferType(stmt.initializer, scope, context);

  if (initializerType.kind !== "record" && initializerType.kind !== "any") {
    throw new CheckError(
      `let destructuring requires a record, got ${describeType(initializerType)}`,
      stmt.span,
    );
  }

  for (const name of stmt.names) {
    if (scope.hasOwn(name)) {
      throw new CheckError(`variable '${name}' is already declared in this scope`, stmt.span);
    }

    if (initializerType.kind === "record") {
      const fieldType = initializerType.fields.get(name);
      if (!fieldType) {
        throw new CheckError(`record '${initializerType.name}' has no field '${name}'`, stmt.span);
      }
      scope.define(name, fieldType, false);
    } else {
      scope.define(name, { kind: "any" }, false);
    }
  }
}

function checkEnumDeclaration(stmt: EnumDeclaration, scope: Scope): void {
  if (scope.lookupType(stmt.name)) {
    throw new CheckError(`type '${stmt.name}' is already declared`, stmt.span);
  }

  const cases = new Map<string, string>();

  for (const c of stmt.cases) {
    if (cases.has(c.name)) {
      throw new CheckError(`duplicate enum case '${c.name}'`, c.span);
    }

    cases.set(c.name, resolveEnumBackingValue(c.name, c.value, stmt.defaultValue));
  }

  const enumType: ChuteType = {
    kind: "enum",
    name: stmt.name,
    cases,
  };

  scope.defineType(stmt.name, enumType);
}

function checkRecordDeclaration(stmt: RecordDeclaration, scope: Scope): void {
  if (scope.lookupType(stmt.name)) {
    throw new CheckError(`type '${stmt.name}' is already declared`, stmt.span);
  }

  const fields = new Map<string, ChuteType>();

  for (const f of stmt.fields) {
    if (fields.has(f.name)) {
      throw new CheckError(`duplicate record field '${f.name}'`, f.span);
    }
    fields.set(f.name, typeFromAnnotation(f.type, scope));
  }

  const recordType: ChuteType = {
    kind: "record",
    name: stmt.name,
    fields,
  };

  scope.defineType(stmt.name, recordType);
}

function registerFunctionSignature(
  decl: FunctionDeclaration,
  scope: Scope,
  context: CheckContext,
): void {
  if (scope.hasOwn(decl.name)) {
    throw new CheckError(`'${decl.name}' is already declared in this scope`, decl.span);
  }

  const params: Array<{ name: string; type: ChuteType; hasDefault: boolean }> = [];
  const paramNames = new Set<string>();

  for (const p of decl.params) {
    if (paramNames.has(p.name)) {
      throw new CheckError(`duplicate parameter '${p.name}'`, p.span);
    }
    paramNames.add(p.name);

    const paramType = typeFromAnnotation(p.type, scope);

    if (p.defaultValue) {
      const defaultType = inferTypeWithHint(p.defaultValue, scope, paramType, context);
      if (!isAssignable(defaultType, paramType)) {
        throw new CheckError(
          `default value of type ${describeType(defaultType)} is not assignable to parameter type ${describeType(paramType)}`,
          p.defaultValue.span,
        );
      }
    }

    params.push({
      name: p.name,
      type: paramType,
      hasDefault: p.defaultValue !== undefined,
    });
  }

  const returnType = decl.returnType ? typeFromAnnotation(decl.returnType, scope) : undefined;

  const funcType: ChuteType = {
    kind: "function",
    name: decl.name,
    params,
    returnType,
  };

  scope.define(decl.name, funcType, false);
}

function checkFunctionDeclaration(
  decl: FunctionDeclaration,
  scope: Scope,
  context: CheckContext,
): void {
  const binding = scope.lookup(decl.name);
  if (!binding || binding.type.kind !== "function") return;

  const funcType = binding.type;

  const bodyScope = new Scope(scope);
  for (const p of funcType.params) {
    bodyScope.define(p.name, p.type, false);
  }

  const bodyContext: CheckContext = {
    expectedReturnType: funcType.returnType,
    currentFunction: decl.name,
    warnings: context.warnings,
    callEdges: context.callEdges,
  };

  for (const s of decl.body) {
    checkStatement(s, bodyScope, bodyContext);
  }
}

function checkReturnStatement(stmt: ReturnStatement, scope: Scope, context: CheckContext): void {
  if (context.currentFunction === undefined) {
    throw new CheckError(`'return' can only be used inside a function`, stmt.span);
  }

  if (context.expectedReturnType === undefined) {
    if (stmt.value) {
      inferType(stmt.value, scope, context);
      throw new CheckError(
        `cannot return a value from a function without a return type`,
        stmt.span,
      );
    }
    return;
  }

  if (!stmt.value) {
    throw new CheckError(
      `function expects a return value of type ${describeType(context.expectedReturnType)}`,
      stmt.span,
    );
  }

  const valueType = inferTypeWithHint(stmt.value, scope, context.expectedReturnType, context);
  if (!isAssignable(valueType, context.expectedReturnType)) {
    throw new CheckError(
      `cannot return ${describeType(valueType)} from function expecting ${describeType(context.expectedReturnType)}`,
      stmt.span,
    );
  }
}

function detectRecursiveCycles(context: CheckContext): void {
  const adjacency = new Map<string, CallEdge[]>();
  for (const edge of context.callEdges) {
    const existing = adjacency.get(edge.caller);
    if (existing) {
      existing.push(edge);
    } else {
      adjacency.set(edge.caller, [edge]);
    }
  }

  const visited = new Set<string>();
  const inStack = new Set<string>();
  const warned = new Set<string>();

  function dfs(node: string): void {
    if (visited.has(node)) return;
    visited.add(node);
    inStack.add(node);

    const edges = adjacency.get(node);
    if (edges) {
      for (const edge of edges) {
        if (inStack.has(edge.callee) && !warned.has(edge.callee)) {
          warned.add(edge.callee);
          warned.add(node);
          context.warnings.push(
            new CheckWarning(
              `recursive call to '${edge.callee}' — each level starts a complete shortcut run, so deep recursion is slow`,
              edge.span,
            ),
          );
        } else if (!visited.has(edge.callee)) {
          dfs(edge.callee);
        }
      }
    }

    inStack.delete(node);
  }

  for (const node of adjacency.keys()) {
    dfs(node);
  }
}

function inferPipelineExpression(
  expr: PipelineExpression,
  scope: Scope,
  context: CheckContext,
): ChuteType {
  let currentType = inferType(expr.input, scope, context);
  let isOptionalPipeline = false;

  for (const stage of expr.stages) {
    if (stage.operator === "|>?") {
      if (currentType.kind !== "optional" && currentType.kind !== "any") {
        throw new CheckError(
          `'|>?' requires an optional input, got ${describeType(currentType)}`,
          stage.span,
        );
      }
      isOptionalPipeline = true;
      if (currentType.kind === "optional") {
        currentType = currentType.inner;
      }
    }

    currentType = inferStageType(stage, currentType, scope, context);
  }

  if (isOptionalPipeline) {
    return {
      kind: "optional",
      inner: currentType,
    };
  }
  return currentType;
}

function inferStageType(
  stage: import("./ast.ts").PipelineStage,
  inputType: ChuteType,
  scope: Scope,
  context: CheckContext,
): ChuteType {
  const calleeName = resolveStageCalleeName(stage.callee);
  if (!calleeName) {
    for (const arg of stage.args) {
      if (arg.value.kind !== "PlaceholderExpression") {
        inferType(arg.value, scope, context);
      }
    }
    return { kind: "any" };
  }

  const binding = scope.lookup(calleeName);
  if (binding?.type.kind === "function") {
    return inferPipelineFunctionCall(stage, binding.type, inputType, scope, context);
  }

  for (const arg of stage.args) {
    if (arg.value.kind !== "PlaceholderExpression") {
      inferType(arg.value, scope, context);
    }
  }
  return { kind: "any" };
}

function inferPipelineFunctionCall(
  stage: import("./ast.ts").PipelineStage,
  funcType: ChuteType & { kind: "function" },
  inputType: ChuteType,
  scope: Scope,
  context: CheckContext,
): ChuteType {
  const hasPlaceholder = stage.args.some((a) => a.value.kind === "PlaceholderExpression");
  const provided = new Map<string, Expression>();

  if (hasPlaceholder) {
    for (const arg of stage.args) {
      if (arg.value.kind === "PlaceholderExpression") {
        if (arg.label) {
          const param = funcType.params.find((p) => p.name === arg.label);
          if (param && !isAssignable(inputType, param.type)) {
            throw new CheckError(
              `cannot pass ${describeType(inputType)} for parameter '${arg.label}' of type ${describeType(param.type)}`,
              arg.span,
            );
          }
          provided.set(arg.label, arg.value);
        } else {
          const firstParam = funcType.params.at(0);
          if (firstParam) {
            if (!isAssignable(inputType, firstParam.type)) {
              throw new CheckError(
                `cannot pass ${describeType(inputType)} for parameter '${firstParam.name}' of type ${describeType(firstParam.type)}`,
                arg.span,
              );
            }
            provided.set(firstParam.name, arg.value);
          }
        }
      } else {
        if (arg.label) {
          const param = funcType.params.find((p) => p.name === arg.label);
          if (!param) {
            throw new CheckError(
              `function '${funcType.name}' has no parameter '${arg.label}'`,
              arg.span,
            );
          }
          const argType = inferTypeWithHint(arg.value, scope, param.type, context);
          if (!isAssignable(argType, param.type)) {
            throw new CheckError(
              `cannot pass ${describeType(argType)} for parameter '${arg.label}' of type ${describeType(param.type)}`,
              arg.span,
            );
          }
          provided.set(arg.label, arg.value);
        }
      }
    }
  } else {
    const firstParam = funcType.params.at(0);
    if (firstParam) {
      if (!isAssignable(inputType, firstParam.type)) {
        throw new CheckError(
          `cannot pass ${describeType(inputType)} for parameter '${firstParam.name}' of type ${describeType(firstParam.type)}`,
          stage.span,
        );
      }
      provided.set(firstParam.name, stage.callee);
    }

    for (const arg of stage.args) {
      if (arg.label) {
        const param = funcType.params.find((p) => p.name === arg.label);
        if (!param) {
          throw new CheckError(
            `function '${funcType.name}' has no parameter '${arg.label}'`,
            arg.span,
          );
        }
        const argType = inferTypeWithHint(arg.value, scope, param.type, context);
        if (!isAssignable(argType, param.type)) {
          throw new CheckError(
            `cannot pass ${describeType(argType)} for parameter '${arg.label}' of type ${describeType(param.type)}`,
            arg.span,
          );
        }
        provided.set(arg.label, arg.value);
      }
    }
  }

  for (const param of funcType.params) {
    if (!provided.has(param.name) && !param.hasDefault) {
      throw new CheckError(
        `missing argument '${param.name}' in pipeline call to '${funcType.name}'`,
        stage.span,
      );
    }
  }

  if (context.currentFunction) {
    context.callEdges.push({
      caller: context.currentFunction,
      callee: funcType.name,
      span: stage.span,
    });
  }

  return funcType.returnType ?? { kind: "any" };
}

function checkActionDeclaration(
  decl: ActionDeclaration,
  scope: Scope,
  context: CheckContext,
): void {
  if (scope.hasOwn(decl.name)) {
    throw new CheckError(`'${decl.name}' is already declared in this scope`, decl.span);
  }

  const params: Array<{ label: string; type: ChuteType; hasDefault: boolean }> = [];
  const paramLabels = new Set<string>();

  for (const p of decl.params) {
    if (paramLabels.has(p.label)) {
      throw new CheckError(`duplicate parameter '${p.label}'`, p.span);
    }
    paramLabels.add(p.label);

    const paramType = typeFromAnnotation(p.type, scope);

    if (p.defaultValue) {
      const defaultType = inferTypeWithHint(p.defaultValue, scope, paramType, context);
      if (!isAssignable(defaultType, paramType)) {
        throw new CheckError(
          `default value of type ${describeType(defaultType)} is not assignable to parameter type ${describeType(paramType)}`,
          p.defaultValue.span,
        );
      }
    }

    params.push({
      label: p.label,
      type: paramType,
      hasDefault: p.defaultValue !== undefined,
    });
  }

  const returnType = decl.returnType ? typeFromAnnotation(decl.returnType, scope) : undefined;

  const actionType: ChuteType = {
    kind: "action",
    name: decl.name,
    runtimeIdentifier: decl.runtimeIdentifier,
    params,
    returnType,
  };

  scope.define(decl.name, actionType, false);
}

function checkActionCall(
  expr: CallExpression,
  actionType: ChuteType & { kind: "action" },
  scope: Scope,
  context: CheckContext,
): ChuteType {
  const provided = new Map<string, Expression>();

  for (const arg of expr.args) {
    if (!arg.label) {
      throw new CheckError(`action calls require labeled arguments`, arg.span);
    }

    const param = actionType.params.find((p) => p.label === arg.label);
    if (!param) {
      throw new CheckError(`action '${actionType.name}' has no parameter '${arg.label}'`, arg.span);
    }

    if (provided.has(arg.label)) {
      throw new CheckError(`duplicate argument '${arg.label}' in action call`, arg.span);
    }
    provided.set(arg.label, arg.value);

    const argType = inferTypeWithHint(arg.value, scope, param.type, context);
    if (!isAssignable(argType, param.type)) {
      throw new CheckError(
        `cannot pass ${describeType(argType)} for parameter '${arg.label}' of type ${describeType(param.type)}`,
        arg.span,
      );
    }
  }

  for (const param of actionType.params) {
    if (!provided.has(param.label) && !param.hasDefault) {
      throw new CheckError(
        `missing argument '${param.label}' in call to '${actionType.name}'`,
        expr.span,
      );
    }
  }

  return actionType.returnType ?? { kind: "any" };
}

function assertNever(value: never): never {
  throw new Error(`unhandled case: ${JSON.stringify(value)}`);
}
