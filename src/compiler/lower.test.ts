import { describe, expect, it } from "vitest";
import { Lexer } from "./lexer.ts";
import { Parser } from "./parser.ts";
import { lower } from "./lower.ts";
import type { Program } from "./ast.ts";
import type { ActionIR } from "./ir.ts";

function parse(source: string): Program {
  return new Parser(new Lexer(source).tokenize()).parse();
}

function lowerSource(source: string): ActionIR[] {
  return lower(parse(source)).actions;
}

describe("lower", () => {
  describe("let declarations", () => {
    it("should lower let with string to text + setvariable", () => {
      const actions = lowerSource('shortcut { name: "Test" } let x = "hello";');
      expect(actions).toHaveLength(2);
      expect(actions.at(0)?.identifier).toBe("is.workflow.actions.gettext");
      expect(actions.at(1)?.identifier).toBe("is.workflow.actions.setvariable");
      expect(actions.at(1)?.parameters.get("WFVariableName")).toBe("x");
    });

    it("should lower let with number to number + setvariable", () => {
      const actions = lowerSource('shortcut { name: "Test" } let x = 42;');
      expect(actions.at(0)?.identifier).toBe("is.workflow.actions.number");
      expect(actions.at(0)?.parameters.get("WFNumberActionNumber")).toBe(42);
      expect(actions.at(1)?.identifier).toBe("is.workflow.actions.setvariable");
    });
  });

  describe("assignment", () => {
    it("should lower assignment to setvariable", () => {
      const actions = lowerSource('shortcut { name: "Test" } var x = 1; x = 2;');
      expect(actions).toHaveLength(4);
      expect(actions.at(3)?.identifier).toBe("is.workflow.actions.setvariable");
    });
  });

  describe("arithmetic", () => {
    it("should lower addition to getvariable + math", () => {
      const actions = lowerSource('shortcut { name: "Test" } let a = 1; let b = 2; let c = a + b;');
      const mathActions = actions.filter((a) => a.identifier === "is.workflow.actions.math");
      expect(mathActions).toHaveLength(1);
      expect(mathActions.at(0)?.parameters.get("WFMathOperation")).toBe("+");
    });
  });

  describe("nil coalescing", () => {
    it("should lower ?? to conditional actions", () => {
      const actions = lowerSource(
        'shortcut { name: "Test" } let a: Number? = nil; let b = a ?? 0;',
      );
      const conditionals = actions.filter(
        (a) => a.identifier === "is.workflow.actions.conditional",
      );
      expect(conditionals).toHaveLength(3);
      expect(conditionals.at(0)?.parameters.get("WFControlFlowMode")).toBe(0);
      expect(conditionals.at(1)?.parameters.get("WFControlFlowMode")).toBe(1);
      expect(conditionals.at(2)?.parameters.get("WFControlFlowMode")).toBe(2);
      const groupId = conditionals.at(0)?.groupingIdentifier;
      expect(groupId).toBeDefined();
      expect(conditionals.at(1)?.groupingIdentifier).toBe(groupId);
      expect(conditionals.at(2)?.groupingIdentifier).toBe(groupId);
    });
  });

  describe("string interpolation", () => {
    it("should lower interpolated string to text action with attachments", () => {
      const actions = lowerSource(
        'shortcut { name: "Test" } let name = "world"; let g = "hello ${name}";',
      );
      const textActions = actions.filter((a) => a.identifier === "is.workflow.actions.gettext");
      expect(textActions.length).toBeGreaterThanOrEqual(1);
      const lastText = textActions.at(textActions.length - 1);
      const param = lastText?.parameters.get("WFTextActionText");
      expect(param).toMatchObject({ kind: "InterpolatedText" });
    });
  });
});
