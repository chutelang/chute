import type { Span } from "./token.ts";
import type {
  Assignment,
  BaseType,
  BinaryExpression,
  CoalesceExpression,
  Expression,
  Identifier,
  LetDeclaration,
  NamedType,
  OptionalMemberExpression,
  Program,
  Statement,
  SubscriptExpression,
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
    case "ListLiteral":
    case "DictionaryLiteral":
    case "CallExpression":
      return { kind: "any" };
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

function assertNever(value: never): never {
  throw new Error(`unhandled case: ${JSON.stringify(value)}`);
}

interface Binding {
  type: ChuteType;
  mutable: boolean;
}
