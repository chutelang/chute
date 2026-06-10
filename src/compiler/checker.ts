import type { Span } from "./token.ts";
import type {
  Assignment,
  BaseType,
  BinaryExpression,
  CallExpression,
  CoalesceExpression,
  Condition,
  DictionaryLiteral,
  Expression,
  ForStatement,
  Identifier,
  IfStatement,
  InterpolatedString,
  LetDeclaration,
  ListLiteral,
  MenuStatement,
  NamedType,
  OptionalMemberExpression,
  Program,
  RepeatStatement,
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
  | { kind: "any" };

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
}

export function check(program: Program): void {
  const scope = new Scope(undefined);
  for (const stmt of program.body) {
    checkStatement(stmt, scope);
  }
}

function checkStatement(stmt: Statement, scope: Scope): void {
  switch (stmt.kind) {
    case "ExpressionStatement":
      inferType(stmt.expression, scope);
      return;
    case "LetDeclaration":
      checkLetDeclaration(stmt, scope);
      return;
    case "VarDeclaration":
      checkVarDeclaration(stmt, scope);
      return;
    case "Assignment":
      checkAssignment(stmt, scope);
      return;
    case "IfStatement":
      checkIfStatement(stmt, scope);
      return;
    case "ForStatement":
      checkForStatement(stmt, scope);
      return;
    case "RepeatStatement":
      checkRepeatStatement(stmt, scope);
      return;
    case "MenuStatement":
      checkMenuStatement(stmt, scope);
      return;
    default:
      assertNever(stmt);
  }
}

function checkLetDeclaration(decl: LetDeclaration, scope: Scope): void {
  if (scope.hasOwn(decl.name)) {
    throw new CheckError(`variable '${decl.name}' is already declared in this scope`, decl.span);
  }

  const bindingType = checkDeclarationInitializer(decl, scope);
  scope.define(decl.name, bindingType, false);
}

function checkVarDeclaration(decl: VarDeclaration, scope: Scope): void {
  if (scope.hasOwn(decl.name)) {
    throw new CheckError(`variable '${decl.name}' is already declared in this scope`, decl.span);
  }

  const bindingType = checkDeclarationInitializer(decl, scope);
  scope.define(decl.name, bindingType, true);
}

function checkDeclarationInitializer(
  decl: LetDeclaration | VarDeclaration,
  scope: Scope,
): ChuteType {
  const initializerType = inferType(decl.initializer, scope);

  if (!decl.typeAnnotation) {
    return initializerType;
  }

  const annotationType = typeFromAnnotation(decl.typeAnnotation);
  if (!isAssignable(initializerType, annotationType)) {
    throw new CheckError(
      `cannot assign ${describeType(initializerType)} to ${describeType(annotationType)}`,
      decl.span,
    );
  }

  return annotationType;
}

function checkAssignment(assign: Assignment, scope: Scope): void {
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

  const valueType = inferType(assign.value, scope);

  for (const accessor of assign.place.accessors) {
    if (accessor.kind === "SubscriptAccessor") {
      inferType(accessor.index, scope);
    }
  }

  if (assign.place.accessors.length === 0 && !isAssignable(valueType, binding.type)) {
    throw new CheckError(
      `cannot assign ${describeType(valueType)} to variable of type ${describeType(binding.type)}`,
      assign.span,
    );
  }
}

function inferType(expr: Expression, scope: Scope): ChuteType {
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
      return inferBinaryExpression(expr, scope);
    case "UnaryExpression":
      return inferUnaryExpression(expr, scope);
    case "CoalesceExpression":
      return inferCoalesceExpression(expr, scope);
    case "MemberExpression":
      inferType(expr.object, scope);
      return { kind: "any" };
    case "OptionalMemberExpression":
      return inferOptionalMemberExpression(expr, scope);
    case "SubscriptExpression":
      return inferSubscriptExpression(expr, scope);
    case "InterpolatedString":
      return inferInterpolatedString(expr, scope);
    case "ListLiteral":
      return inferListLiteral(expr, scope);
    case "DictionaryLiteral":
      return inferDictionaryLiteral(expr, scope);
    case "CallExpression":
      return inferCallExpression(expr, scope);
    case "TernaryExpression":
      return inferTernaryExpression(expr, scope);
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

function inferBinaryExpression(expr: BinaryExpression, scope: Scope): ChuteType {
  const leftType = inferType(expr.left, scope);
  const rightType = inferType(expr.right, scope);

  requireNumber(leftType, expr.left.span);
  requireNumber(rightType, expr.right.span);

  return { kind: "number" };
}

function inferUnaryExpression(expr: UnaryExpression, scope: Scope): ChuteType {
  const operandType = inferType(expr.operand, scope);
  requireNumber(operandType, expr.operand.span);
  return { kind: "number" };
}

function inferCoalesceExpression(expr: CoalesceExpression, scope: Scope): ChuteType {
  const leftType = inferType(expr.left, scope);
  const rightType = inferType(expr.right, scope);

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

function inferOptionalMemberExpression(expr: OptionalMemberExpression, scope: Scope): ChuteType {
  const objectType = inferType(expr.object, scope);

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

function inferSubscriptExpression(expr: SubscriptExpression, scope: Scope): ChuteType {
  const objectType = inferType(expr.object, scope);
  inferType(expr.index, scope);

  if (objectType.kind === "list") {
    return objectType.element;
  }

  if (objectType.kind === "dictionary" || objectType.kind === "any") {
    return { kind: "any" };
  }

  throw new CheckError(`cannot subscript ${describeType(objectType)}`, expr.object.span);
}

function inferInterpolatedString(expr: InterpolatedString, scope: Scope): ChuteType {
  for (const part of expr.parts) {
    if (part.kind === "ExpressionPart") {
      inferType(part.expression, scope);
    }
  }
  return { kind: "text" };
}

function inferListLiteral(expr: ListLiteral, scope: Scope): ChuteType {
  const first = expr.elements.at(0);
  if (!first) {
    return {
      kind: "list",
      element: {
        kind: "any",
      },
    };
  }

  const elementType = inferType(first, scope);

  for (const element of expr.elements.slice(1)) {
    const type = inferType(element, scope);
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

function inferDictionaryLiteral(expr: DictionaryLiteral, scope: Scope): ChuteType {
  for (const entry of expr.entries) {
    inferType(entry.key, scope);
    inferType(entry.value, scope);
  }
  return { kind: "dictionary" };
}

function inferCallExpression(expr: CallExpression, scope: Scope): ChuteType {
  for (const arg of expr.args) {
    inferType(arg.value, scope);
  }
  return { kind: "any" };
}

function requireNumber(type: ChuteType, span: Span): void {
  if (type.kind !== "number" && type.kind !== "any") {
    throw new CheckError(`expected Number, got ${describeType(type)}`, span);
  }
}

function typeFromAnnotation(annotation: TypeAnnotation): ChuteType {
  const base = baseTypeFromAnnotation(annotation.base);
  return annotation.optional
    ? {
        kind: "optional",
        inner: base,
      }
    : base;
}

function baseTypeFromAnnotation(base: BaseType): ChuteType {
  switch (base.kind) {
    case "NamedType":
      return namedTypeFromAnnotation(base);
    case "ListType":
      return {
        kind: "list",
        element: typeFromAnnotation(base.elementType),
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

function namedTypeFromAnnotation(named: NamedType): ChuteType {
  switch (named.name) {
    case "Text":
      return { kind: "text" };
    case "Number":
      return { kind: "number" };
    case "Boolean":
      return { kind: "boolean" };
    case "Dictionary":
      return { kind: "dictionary" };
    default:
      return { kind: "any" };
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
    case "any":
      return "any";
    default:
      return assertNever(type);
  }
}

function checkIfStatement(stmt: IfStatement, scope: Scope): void {
  checkCondition(stmt.condition, scope);

  const bodyScope = new Scope(scope);
  const narrowing = extractNilNarrowing(stmt.condition, scope);
  if (narrowing && narrowing.branch === "body") {
    bodyScope.define(narrowing.name, narrowing.narrowedType, narrowing.mutable);
  }

  for (const s of stmt.body) {
    checkStatement(s, bodyScope);
  }

  if (stmt.elseBody) {
    if (Array.isArray(stmt.elseBody)) {
      const elseScope = new Scope(scope);
      if (narrowing && narrowing.branch === "else") {
        elseScope.define(narrowing.name, narrowing.narrowedType, narrowing.mutable);
      }
      for (const s of stmt.elseBody) {
        checkStatement(s, elseScope);
      }
    } else {
      checkIfStatement(stmt.elseBody, scope);
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

function checkForStatement(stmt: ForStatement, scope: Scope): void {
  const iterableType = inferType(stmt.iterable, scope);
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
    checkStatement(s, bodyScope);
  }
}

function checkRepeatStatement(stmt: RepeatStatement, scope: Scope): void {
  const countType = inferType(stmt.count, scope);
  requireNumber(countType, stmt.count.span);
  const bodyScope = new Scope(scope);
  for (const s of stmt.body) {
    checkStatement(s, bodyScope);
  }
}

function checkMenuStatement(stmt: MenuStatement, scope: Scope): void {
  inferType(stmt.prompt, scope);
  for (const c of stmt.cases) {
    const caseScope = new Scope(scope);
    if (stmt.variable) {
      caseScope.define(stmt.variable, { kind: "text" }, false);
    }
    for (const s of c.body) {
      checkStatement(s, caseScope);
    }
  }
}

function checkCondition(cond: Condition, scope: Scope): void {
  switch (cond.kind) {
    case "OrCondition":
      checkCondition(cond.left, scope);
      checkCondition(cond.right, scope);
      return;
    case "AndCondition":
      checkCondition(cond.left, scope);
      checkCondition(cond.right, scope);
      return;
    case "NotCondition":
      checkCondition(cond.operand, scope);
      return;
    case "Comparison":
      inferType(cond.left, scope);
      inferType(cond.right, scope);
      return;
    case "RangeTest":
      inferType(cond.subject, scope);
      inferType(cond.low, scope);
      inferType(cond.high, scope);
      return;
    case "TypeTest":
      inferType(cond.subject, scope);
      return;
    case "BooleanReference":
      inferType(cond.subject, scope);
      return;
    case "BooleanLiteralCondition":
      return;
    default:
      assertNever(cond);
  }
}

function inferTernaryExpression(expr: TernaryExpression, scope: Scope): ChuteType {
  checkCondition(expr.condition, scope);
  const consequentType = inferType(expr.consequent, scope);
  const alternateType = inferType(expr.alternate, scope);

  if (isAssignable(alternateType, consequentType)) {
    return consequentType;
  }
  if (isAssignable(consequentType, alternateType)) {
    return alternateType;
  }
  return { kind: "any" };
}

function assertNever(value: never): never {
  throw new Error(`unhandled case: ${JSON.stringify(value)}`);
}
