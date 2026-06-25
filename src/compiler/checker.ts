import type { Span } from "./token.ts";
import { resolveEnumBackingValue } from "./ast.ts";
import type {
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
  | { kind: "any" };

export class CheckWarning {
  constructor(
    public message: string,
    public span: Span,
  ) {}
}

interface CheckContext {
  expectedReturnType: ChuteType | undefined;
  currentFunction: string | undefined;
  warnings: CheckWarning[];
}

export class CheckError extends Error {
  constructor(
    message: string,
    public span: Span,
  ) {
    super(message);
  }
}

interface Binding {
  type: ChuteType;
  mutable: boolean;
}

export class Scope {
  private bindings = new Map<string, Binding>();
  private types = new Map<string, ChuteType>();
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
}

export function check(program: Program): CheckWarning[] {
  const scope = new Scope(undefined);
  const context: CheckContext = {
    expectedReturnType: undefined,
    currentFunction: undefined,
    warnings: [],
  };
  for (const stmt of program.body) {
    checkStatement(stmt, scope, context);
  }
  return context.warnings;
}

function checkStatement(stmt: Statement, scope: Scope, context: CheckContext): void {
  switch (stmt.kind) {
    case "ExpressionStatement":
      inferType(stmt.expression, scope, context);
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
    default:
      assertNever(stmt);
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
  if (expr.callee.kind === "Identifier") {
    const typeDef = scope.lookupType(expr.callee.name);
    if (typeDef?.kind === "record") {
      return checkRecordConstruction(expr, typeDef, scope, context);
    }

    const binding = scope.lookup(expr.callee.name);
    if (binding?.type.kind === "function") {
      return checkFunctionCall(expr, binding.type, scope, context);
    }
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

  if (context.currentFunction === funcType.name) {
    context.warnings.push(
      new CheckWarning(
        `recursive call to '${funcType.name}' — each level starts a complete shortcut run, so deep recursion is slow`,
        expr.span,
      ),
    );
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

function checkFunctionDeclaration(
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

  const bodyScope = new Scope(scope);
  for (const p of params) {
    bodyScope.define(p.name, p.type, false);
  }

  const bodyContext: CheckContext = {
    expectedReturnType: returnType,
    currentFunction: decl.name,
    warnings: context.warnings,
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

function assertNever(value: never): never {
  throw new Error(`unhandled case: ${JSON.stringify(value)}`);
}
