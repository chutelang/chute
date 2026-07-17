import { describe, expect, it } from "vitest";
import { renderDiagnostic, renderDiagnostics } from "./render-diagnostic.ts";
import { DiagnosticCode } from "./diagnostic.ts";
import type { Diagnostic } from "./diagnostic.ts";

describe("renderDiagnostic", () => {
  it("should render a single-line error with underline", () => {
    const source = "let x = foo;";
    const d: Diagnostic = {
      code: DiagnosticCode.UndefinedVariable,
      severity: "error",
      message: "undefined variable 'foo'",
      span: { start: 8, end: 11 },
    };
    expect(renderDiagnostic(source, d, { color: false })).toMatchSnapshot();
  });

  it("should render a warning", () => {
    const source = "let x = 5bananas;";
    const d: Diagnostic = {
      code: DiagnosticCode.UnknownUnit,
      severity: "warning",
      message: "unknown quantity unit 'bananas'",
      span: { start: 8, end: 17 },
    };
    expect(renderDiagnostic(source, d, { color: false })).toMatchSnapshot();
  });

  it("should render an error with a suggestion", () => {
    const source = "let d = {};";
    const d: Diagnostic = {
      code: DiagnosticCode.InvalidDictionarySyntax,
      severity: "error",
      message: "empty dictionary must use {:} syntax",
      span: { start: 8, end: 10 },
      suggestion: "use {:} instead of {}",
    };
    expect(renderDiagnostic(source, d, { color: false })).toMatchSnapshot();
  });

  it("should render with correct line and column numbers", () => {
    const source = "let a = 1;\nlet b = 2;\nlet c = foo;";
    const d: Diagnostic = {
      code: DiagnosticCode.UndefinedVariable,
      severity: "error",
      message: "undefined variable 'foo'",
      span: { start: 30, end: 33 },
    };
    const output = renderDiagnostic(source, d, { color: false });
    expect(output).toContain("3:9");
    expect(output).toMatchSnapshot();
  });

  it("should render with a custom file name", () => {
    const source = "let x = foo;";
    const d: Diagnostic = {
      code: DiagnosticCode.UndefinedVariable,
      severity: "error",
      message: "undefined variable 'foo'",
      span: { start: 8, end: 11 },
    };
    const output = renderDiagnostic(source, d, {
      color: false,
      filePath: "hello.chute",
    });
    expect(output).toContain("hello.chute");
    expect(output).toMatchSnapshot();
  });

  it("should handle errors on the first character", () => {
    const source = "@foo;";
    const d: Diagnostic = {
      code: DiagnosticCode.UnexpectedCharacter,
      severity: "error",
      message: "unexpected character: @",
      span: { start: 0, end: 1 },
    };
    expect(renderDiagnostic(source, d, { color: false })).toMatchSnapshot();
  });

  it("should handle single-character span", () => {
    const source = "let x = !;";
    const d: Diagnostic = {
      code: DiagnosticCode.UnexpectedCharacter,
      severity: "error",
      message: "unexpected character: !",
      span: { start: 8, end: 8 },
    };
    const output = renderDiagnostic(source, d, { color: false });
    expect(output).toContain("^");
    expect(output).toMatchSnapshot();
  });

  it("should render with color when enabled", () => {
    const source = "let x = foo;";
    const d: Diagnostic = {
      code: DiagnosticCode.UndefinedVariable,
      severity: "error",
      message: "undefined variable 'foo'",
      span: { start: 8, end: 11 },
    };
    const output = renderDiagnostic(source, d, { color: true });
    expect(output).toContain("\x1b[");
    expect(output).toMatchSnapshot();
  });
});

describe("renderDiagnostics", () => {
  it("should render multiple diagnostics separated by blank lines", () => {
    const source = "let x = foo;\nlet y = bar;";
    const diagnostics: Diagnostic[] = [
      {
        code: DiagnosticCode.UndefinedVariable,
        severity: "error",
        message: "undefined variable 'foo'",
        span: { start: 8, end: 11 },
      },
      {
        code: DiagnosticCode.UndefinedVariable,
        severity: "error",
        message: "undefined variable 'bar'",
        span: { start: 21, end: 24 },
      },
    ];
    expect(renderDiagnostics(source, diagnostics, { color: false })).toMatchSnapshot();
  });

  it("should render a summary line", () => {
    const source = 'let x = foo;\nvar y = 5;\ny = "hi";';
    const diagnostics: Diagnostic[] = [
      {
        code: DiagnosticCode.UndefinedVariable,
        severity: "error",
        message: "undefined variable 'foo'",
        span: { start: 8, end: 11 },
      },
      {
        code: DiagnosticCode.TypeMismatch,
        severity: "error",
        message: "cannot assign Text to Number",
        span: { start: 27, end: 31 },
      },
      {
        code: DiagnosticCode.UnknownUnit,
        severity: "warning",
        message: "unknown quantity unit 'bananas'",
        span: { start: 14, end: 19 },
      },
    ];
    const output = renderDiagnostics(source, diagnostics, { color: false });
    expect(output).toContain("2 errors");
    expect(output).toContain("1 warning");
    expect(output).toMatchSnapshot();
  });

  it("should return empty string for no diagnostics", () => {
    expect(renderDiagnostics("", [], { color: false })).toBe("");
  });
});
