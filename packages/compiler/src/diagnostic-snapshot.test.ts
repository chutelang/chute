import { describe, expect, it } from "vitest";
import { compile } from "./pipeline.ts";
import { CompileError } from "./diagnostic.ts";
import { renderDiagnostics } from "./render-diagnostic.ts";

function renderErrors(source: string, filePath = "test.chute"): string {
  try {
    compile(source);
    return "";
  } catch (e) {
    if (e instanceof CompileError) {
      return renderDiagnostics(source, e.diagnostics, {
        color: false,
        filePath,
      });
    }
    throw e;
  }
}

describe("diagnostic snapshots", () => {
  describe("lexer errors", () => {
    it("should render unterminated string", () => {
      expect(renderErrors('"hello')).toMatchSnapshot();
    });

    it("should render unexpected character", () => {
      expect(renderErrors("~")).toMatchSnapshot();
    });

    it("should render multiple lexer errors", () => {
      expect(renderErrors("~ ^")).toMatchSnapshot();
    });

    it("should render unterminated block comment", () => {
      expect(renderErrors("/* oops")).toMatchSnapshot();
    });
  });

  describe("parser errors", () => {
    it("should render missing semicolon", () => {
      expect(renderErrors('shortcut { name: "Test" }\nlet x = 42')).toMatchSnapshot();
    });

    it("should render empty dictionary error", () => {
      expect(renderErrors('shortcut { name: "T" }\nlet x = {};')).toMatchSnapshot();
    });
  });

  describe("checker errors", () => {
    it("should render undefined variable", () => {
      expect(
        renderErrors(`shortcut { name: "T" }
let x = foo;`),
      ).toMatchSnapshot();
    });

    it("should render type mismatch", () => {
      expect(
        renderErrors(`shortcut { name: "T" }
let x: Number = "hello";`),
      ).toMatchSnapshot();
    });

    it("should render immutable assignment", () => {
      expect(
        renderErrors(`shortcut { name: "T" }
let x = 1;
x = 2;`),
      ).toMatchSnapshot();
    });

    it("should render multiple checker errors across statements", () => {
      expect(
        renderErrors(`shortcut { name: "T" }
let x = foo;
let y = bar;`),
      ).toMatchSnapshot();
    });
  });

  describe("warnings with errors", () => {
    it("should render warnings alongside errors", () => {
      const source = `shortcut { name: "T" }
let x: Quantity<parsecs> = 5;
let y = badVar;`;
      expect(renderErrors(source)).toMatchSnapshot();
    });
  });

  describe("file path in output", () => {
    it("should include the file path", () => {
      const output = renderErrors('"oops', "src/hello.chute");
      expect(output).toContain("src/hello.chute");
      expect(output).toMatchSnapshot();
    });
  });

  describe("multi-line source context", () => {
    it("should show the correct source line for errors deep in the file", () => {
      const source = `shortcut { name: "T" }
let a = 1;
let b = 2;
let c = 3;
let d = 4;
let e = foo;`;
      const output = renderErrors(source);
      expect(output).toContain("6:");
      expect(output).toMatchSnapshot();
    });
  });
});
