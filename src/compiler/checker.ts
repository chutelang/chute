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
}

interface Binding {
  type: ChuteType;
  mutable: boolean;
}
