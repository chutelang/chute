import type { Span } from "./token.ts";

export class CheckError extends Error {
  constructor(
    message: string,
    public span: Span,
  ) {
    super(message);
  }
}
