import type { Span } from "./token.ts";
import type { Program } from "./ast.ts";

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
    void stmt;
    void scope;
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
