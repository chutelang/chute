import { describe, expect, it } from "vitest";
import { CompileError, DiagnosticCode } from "./diagnostic.ts";
import type { Diagnostic } from "./diagnostic.ts";

describe("Diagnostic", () => {
  it("should represent an error with all fields", () => {
    const d: Diagnostic = {
      code: DiagnosticCode.UndefinedVariable,
      severity: "error",
      message: "undefined variable 'x'",
      span: { start: 10, end: 11 },
    };
    expect(d.code).toBe("CHT201");
    expect(d.severity).toBe("error");
    expect(d.span).toEqual({ start: 10, end: 11 });
  });

  it("should represent a warning", () => {
    const d: Diagnostic = {
      code: DiagnosticCode.UnknownUnit,
      severity: "warning",
      message: "unknown quantity unit 'foo'",
      span: { start: 0, end: 5 },
    };
    expect(d.severity).toBe("warning");
  });

  it("should support an optional suggestion", () => {
    const d: Diagnostic = {
      code: DiagnosticCode.InvalidDictionarySyntax,
      severity: "error",
      message: "empty dictionary must use {:} syntax",
      span: { start: 0, end: 2 },
      suggestion: "use {:} for an empty dictionary",
    };
    expect(d.suggestion).toBe("use {:} for an empty dictionary");
  });
});

describe("CompileError", () => {
  it("should carry multiple diagnostics", () => {
    const diagnostics: Diagnostic[] = [
      {
        code: DiagnosticCode.UndefinedVariable,
        severity: "error",
        message: "undefined variable 'x'",
        span: { start: 10, end: 11 },
      },
      {
        code: DiagnosticCode.TypeMismatch,
        severity: "error",
        message: "cannot assign Text to Number",
        span: { start: 20, end: 30 },
      },
    ];
    const err = new CompileError(diagnostics);
    expect(err).toBeInstanceOf(Error);
    expect(err.diagnostics).toHaveLength(2);
    expect(err.message).toBe("compilation failed with 2 diagnostics");
  });

  it("should use singular for one diagnostic", () => {
    const err = new CompileError([
      {
        code: DiagnosticCode.UnexpectedCharacter,
        severity: "error",
        message: "unexpected character: @",
        span: { start: 0, end: 1 },
      },
    ]);
    expect(err.message).toBe("compilation failed with 1 diagnostic");
  });
});
