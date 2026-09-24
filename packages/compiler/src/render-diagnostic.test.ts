import { describe, expect, it } from "vitest";
import { renderDiagnostic, renderDiagnostics } from "./render-diagnostic.ts";
import { DiagnosticCode } from "./diagnostic.ts";
import type { Diagnostic } from "./diagnostic.ts";
import { Lexer } from "./lexer.ts";
import { Parser } from "./parser.ts";
import type { Program, Expression, Statement } from "./ast.ts";

function parse(source: string): Program {
  return new Parser(new Lexer(source).tokenize()).parse();
}

function findExpression(
  stmts: Statement[],
  pred: (e: Expression) => boolean,
): Expression | undefined {
  for (const stmt of stmts) {
    if (stmt.kind === "ConstDeclaration" || stmt.kind === "LetDeclaration") {
      if (pred(stmt.initializer)) {
        return stmt.initializer;
      }
    }
    if (stmt.kind === "Assignment") {
      if (pred(stmt.value)) {
        return stmt.value;
      }
    }
  }
  return undefined;
}

describe("renderDiagnostic", () => {
  it("should render a single-line error with underline", () => {
    const source = "const x = foo;";
    const ast = parse(source);
    const fooExpr = findExpression(ast.body, (e) => e.kind === "Identifier" && e.name === "foo");
    const d: Diagnostic = {
      code: DiagnosticCode.UndefinedVariable,
      severity: "error",
      message: "undefined variable 'foo'",
      span: fooExpr?.span ?? { start: 0, end: 0 },
    };
    expect(renderDiagnostic(source, d, { color: false })).toMatchSnapshot();
  });

  it("should render a warning", () => {
    const source = "const x: Quantity<bananas> = 5;";
    const ast = parse(source);
    const decl = ast.body[0];
    const typeSpan =
      decl?.kind === "ConstDeclaration" ? decl.typeAnnotation?.base.span : undefined;
    const d: Diagnostic = {
      code: DiagnosticCode.UnknownUnit,
      severity: "warning",
      message: "unknown quantity unit 'bananas'",
      span: typeSpan ?? { start: 0, end: 0 },
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
    };
    expect(renderDiagnostic(source, d, { color: false })).toMatchSnapshot();
  });

  it("should render with correct line and column numbers", () => {
    const source = "const a = 1;\nconst b = 2;\nconst c = foo;";
    const ast = parse(source);
    const fooExpr = findExpression(ast.body, (e) => e.kind === "Identifier" && e.name === "foo");
    const d: Diagnostic = {
      code: DiagnosticCode.UndefinedVariable,
      severity: "error",
      message: "undefined variable 'foo'",
      span: fooExpr?.span ?? { start: 0, end: 0 },
    };
    const output = renderDiagnostic(source, d, { color: false });
    expect(output).toContain("3:11");
    expect(output).toMatchSnapshot();
  });

  it("should render with a custom file name", () => {
    const source = "const x = foo;";
    const ast = parse(source);
    const fooExpr = findExpression(ast.body, (e) => e.kind === "Identifier" && e.name === "foo");
    const d: Diagnostic = {
      code: DiagnosticCode.UndefinedVariable,
      severity: "error",
      message: "undefined variable 'foo'",
      span: fooExpr?.span ?? { start: 0, end: 0 },
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
    const ast = parse(source);
    const fooExpr = findExpression(ast.body, (e) => e.kind === "Identifier" && e.name === "foo");
    const d: Diagnostic = {
      code: DiagnosticCode.UndefinedVariable,
      severity: "error",
      message: "undefined variable 'foo'",
      span: fooExpr?.span ?? { start: 0, end: 0 },
    };
    const output = renderDiagnostic(source, d, { color: true });
    expect(output).toContain("\x1b[");
    expect(output).toMatchSnapshot();
  });
});

describe("renderDiagnostics", () => {
  it("should render multiple diagnostics separated by blank lines", () => {
    const source = "const x = foo;\nconst y = bar;";
    const ast = parse(source);
    const fooExpr = findExpression(ast.body, (e) => e.kind === "Identifier" && e.name === "foo");
    const barExpr = findExpression(ast.body, (e) => e.kind === "Identifier" && e.name === "bar");
    const diagnostics: Diagnostic[] = [
      {
        code: DiagnosticCode.UndefinedVariable,
        severity: "error",
        message: "undefined variable 'foo'",
        span: fooExpr?.span ?? { start: 0, end: 0 },
      },
      {
        code: DiagnosticCode.UndefinedVariable,
        severity: "error",
        message: "undefined variable 'bar'",
        span: barExpr?.span ?? { start: 0, end: 0 },
      },
    ];
    expect(renderDiagnostics(source, diagnostics, { color: false })).toMatchSnapshot();
  });

  it("should render a summary line", () => {
    const source = 'const x = foo;\nlet y: Quantity<bananas> = 5;\ny = "hi";';
    const ast = parse(source);
    const fooExpr = findExpression(ast.body, (e) => e.kind === "Identifier" && e.name === "foo");
    const hiExpr = findExpression(ast.body, (e) => e.kind === "StringLiteral" && e.value === "hi");
    const yDecl = ast.body.find(
      (s) => s.kind === "LetDeclaration" && s.name === "y",
    );
    const unitSpan =
      yDecl?.kind === "LetDeclaration" ? yDecl.typeAnnotation?.base.span : undefined;
    const diagnostics: Diagnostic[] = [
      {
        code: DiagnosticCode.UndefinedVariable,
        severity: "error",
        message: "undefined variable 'foo'",
        span: fooExpr?.span ?? { start: 0, end: 0 },
      },
      {
        code: DiagnosticCode.TypeMismatch,
        severity: "error",
        message: "cannot assign Text to Number",
        span: hiExpr?.span ?? { start: 0, end: 0 },
      },
      {
        code: DiagnosticCode.UnknownUnit,
        severity: "warning",
        message: "unknown quantity unit 'bananas'",
        span: unitSpan ?? { start: 0, end: 0 },
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
