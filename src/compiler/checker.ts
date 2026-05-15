import type { Span } from "./token.ts";

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

function assertNever(value: never): never {
  throw new Error(`unhandled case: ${JSON.stringify(value)}`);
}

interface Binding {
  type: ChuteType;
  mutable: boolean;
}
