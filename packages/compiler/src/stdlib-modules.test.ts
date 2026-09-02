import { describe, expect, it } from "vitest";
import { getStdlibModule, getStdlibModuleNames } from "./stdlib.ts";
import { Lexer } from "./lexer.ts";
import { Parser } from "./parser.ts";
import { check } from "./checker.ts";
import { CompileError } from "./diagnostic.ts";
import type { Program } from "./ast.ts";

function parse(source: string): Program {
  return new Parser(new Lexer(source).tokenize()).parse();
}

function checkSource(source: string): void {
  check(parse(source));
}

describe("stdlib modules", () => {
  describe("getStdlibModuleNames", () => {
    it("should return all category names", () => {
      const names = getStdlibModuleNames();
      expect(names).toContain("Scripting");
      expect(names).toContain("Web");
      expect(names).toContain("Text");
      expect(names).toContain("Media");
      expect(names).toContain("Settings");
      expect(names.length).toBeGreaterThan(10);
    });
  });

  describe("getStdlibModule", () => {
    it("should return a scope for a valid module name", () => {
      const scope = getStdlibModule("Scripting");
      expect(scope).toBeDefined();
    });

    it("should return undefined for an invalid module name", () => {
      const scope = getStdlibModule("NonExistent");
      expect(scope).toBeUndefined();
    });

    it("should contain actions in the returned scope", () => {
      const scope = getStdlibModule("Scripting");
      expect(scope).toBeDefined();
      const binding = scope?.lookup("askForInput");
      expect(binding).toBeDefined();
      expect(binding?.type.kind).toBe("action");
    });

    it("should have correct runtime identifier on actions", () => {
      const scope = getStdlibModule("Web");
      expect(scope).toBeDefined();
      const binding = scope?.lookup("getContentsOfUrl");
      expect(binding).toBeDefined();
      if (binding?.type.kind === "action") {
        expect(binding.type.runtimeIdentifier).toBe("is.workflow.actions.downloadurl");
      }
    });

    it("should have typed parameters on actions", () => {
      const scope = getStdlibModule("Web");
      expect(scope).toBeDefined();
      const binding = scope?.lookup("getContentsOfUrl");
      expect(binding).toBeDefined();
      if (binding?.type.kind === "action") {
        const urlParam = binding.type.params.find((p) => p.label === "WFURL");
        expect(urlParam).toBeDefined();
        expect(urlParam?.type.kind).toBe("text");
      }
    });
  });

  describe("package imports", () => {
    it("should resolve a package import and allow qualified action call", () => {
      expect(() =>
        checkSource(`
          import Scripting;
          Scripting.askForInput(WFAskActionPrompt: "What is your name?");
        `),
      ).not.toThrow();
    });

    it("should reject an unknown package import", () => {
      expect(() =>
        checkSource(`
          import FakeModule;
        `),
      ).toThrow(CompileError);
    });

    it("should reject access to nonexistent action in a valid module", () => {
      expect(() =>
        checkSource(`
          import Scripting;
          Scripting.totallyFakeAction(x: "hello");
        `),
      ).toThrow(CompileError);
    });

    it("should support aliased package imports", () => {
      expect(() =>
        checkSource(`
          import Scripting as S;
          S.askForInput(WFAskActionPrompt: "hello");
        `),
      ).not.toThrow();
    });

    it("should allow importing multiple modules", () => {
      expect(() =>
        checkSource(`
          import Scripting;
          import Web;
          Scripting.askForInput(WFAskActionPrompt: "URL?");
          Web.getContentsOfUrl(WFURL: "https://example.com");
        `),
      ).not.toThrow();
    });
  });
});
