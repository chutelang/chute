import { describe, expect, it } from "vitest";
import { renderDiagnostic, renderDiagnostics } from "./render-diagnostic.ts";
import { DiagnosticCode } from "./diagnostic.ts";
import type { Diagnostic } from "./diagnostic.ts";

describe("renderDiagnostic", () => {
  it("should render a single-line error with underline", () => {
    const source = "const x = foo;";
    const d: Diagnostic = {
      code: DiagnosticCode.UndefinedVariable,
      severity: "error",
      message: "undefined variable 'foo'",
      span: { start: 10, end: 13 },
    };
    expect(renderDiagnostic(source, d, { color: false })).toMatchSnapshot();
  });

  it("should render a warning", () => {
    const source = "const x = 5bananas;";
    const d: Diagnostic = {
      code: DiagnosticCode.UnknownUnit,
      severity: "warning",
      message: "unknown quantity unit 'bananas'",
      span: { start: 10, end: 19 },
    };
    expect(renderDiagnostic(source, d, { color: false })).toMatchSnapshot();
  });

  it("should render an error with a suggestion", () => {
    const source = "const d = {};";
    const d: Diagnostic = {
      code: DiagnosticCode.InvalidDictionarySyntax,
      severity: "error",
      message: "empty dictionary must use {:} syntax",
      span: { start: 10, end: 12 },
      suggestion: "use {:} instead of {}",
    };
    expect(renderDiagnostic(source, d, { color: false })).toMatchSnapshot();
  });

  it("should render with correct line and column numbers", () => {
    const source = "const a = 1;\nconst b = 2;\nconst c = foo;";
    const d: Diagnostic = {
      code: DiagnosticCode.UndefinedVariable,
      severity: "error",
      message: "undefined variable 'foo'",
      span: { start: 36, end: 39 },
    };
    const output = renderDiagnostic(source, d, { color: false });
    expect(output).toContain("3:11");
    expect(output).toMatchSnapshot();
  });

  it("should render with a custom file name", () => {
    const source = "const x = foo;";
    const d: Diagnostic = {
      code: DiagnosticCode.UndefinedVariable,
      severity: "error",
      message: "undefined variable 'foo'",
      span: { start: 10, end: 13 },
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
    const source = "const x = !;";
    const d: Diagnostic = {
      code: DiagnosticCode.UnexpectedCharacter,
      severity: "error",
      message: "unexpected character: !",
      span: { start: 10, end: 10 },
    };
    const output = renderDiagnostic(source, d, { color: false });
    expect(output).toContain("^");
    expect(output).toMatchSnapshot();
  });

  it("should render with color when enabled", () => {
    const source = "const x = foo;";
    const d: Diagnostic = {
      code: DiagnosticCode.UndefinedVariable,
      severity: "error",
      message: "undefined variable 'foo'",
      span: { start: 10, end: 13 },
    };
    const output = renderDiagnostic(source, d, { color: true });
    expect(output).toContain("\x1b[");
    expect(output).toMatchSnapshot();
  });
});

describe("renderDiagnostics", () => {
  it("should render multiple diagnostics separated by blank lines", () => {
    const source = "const x = foo;\nconst y = bar;";
    const diagnostics: Diagnostic[] = [
      {
        code: DiagnosticCode.UndefinedVariable,
        severity: "error",
        message: "undefined variable 'foo'",
        span: { start: 10, end: 13 },
      },
      {
        code: DiagnosticCode.UndefinedVariable,
        severity: "error",
        message: "undefined variable 'bar'",
        span: { start: 25, end: 28 },
      },
    ];
    expect(renderDiagnostics(source, diagnostics, { color: false })).toMatchSnapshot();
  });

  it("should render a summary line", () => {
    const source = 'const x = foo;\nlet y = 5;\ny = "hi";';
    const diagnostics: Diagnostic[] = [
      {
        code: DiagnosticCode.UndefinedVariable,
        severity: "error",
        message: "undefined variable 'foo'",
        span: { start: 10, end: 13 },
      },
      {
        code: DiagnosticCode.TypeMismatch,
        severity: "error",
        message: "cannot assign Text to Number",
        span: { start: 29, end: 33 },
      },
      {
        code: DiagnosticCode.UnknownUnit,
        severity: "warning",
        message: "unknown quantity unit 'bananas'",
        span: { start: 16, end: 21 },
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
