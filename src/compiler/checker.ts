import type { Span } from "./token.ts";
import type {
  Expression,
  Identifier,
  LetDeclaration,
  NamedType,
  Program,
  Statement,
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
    case "Assignment":
      return;
    default:
      assertNever(stmt);
  }
}

function checkLetDeclaration(decl: LetDeclaration, scope: Scope): void {
  const initializerType = inferType(decl.initializer, scope);
  scope.define(decl.name, initializerType, false);
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
    case "UnaryExpression":
    case "CoalesceExpression":
    case "MemberExpression":
    case "OptionalMemberExpression":
    case "SubscriptExpression":
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
