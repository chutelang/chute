import { describe, expect, it } from "vitest";
import { Lexer } from "./lexer.ts";
import { Parser } from "./parser.ts";
import { check } from "./checker.ts";
import { lower } from "./lower.ts";
import type { Program } from "./ast.ts";
import type { ActionIR, CompilationResult } from "./ir.ts";

function parse(source: string): Program {
  return new Parser(new Lexer(source).tokenize()).parse();
}

function lowerSourceResult(source: string): CompilationResult {
  const ast = parse(source);
  check(ast);
  return lower(ast);
}

function lowerSource(source: string): ActionIR[] {
  return lowerSourceResult(source).main.actions;
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

    it("should preserve the left operand across a compound right operand", () => {
      const actions = lowerSource(
        'shortcut { name: "Test" } let a = 1; let b = 2; let c = 3; let d = a + b * c;',
      );

      const identifiers = actions.map((action) => action.identifier);
      expect(identifiers).toEqual([
        "is.workflow.actions.number",
        "is.workflow.actions.setvariable",
        "is.workflow.actions.number",
        "is.workflow.actions.setvariable",
        "is.workflow.actions.number",
        "is.workflow.actions.setvariable",
        "is.workflow.actions.getvariable",
        "is.workflow.actions.setvariable",
        "is.workflow.actions.getvariable",
        "is.workflow.actions.math",
        "is.workflow.actions.setvariable",
        "is.workflow.actions.getvariable",
        "is.workflow.actions.math",
        "is.workflow.actions.setvariable",
      ]);

      // getvariable(a) [index 6] is immediately followed by a setvariable
      // that saves "a" into a temp before the compound right operand
      // (b * c) is lowered and overwrites the magic variable.
      const savedName = actions.at(7)?.parameters.get("WFVariableName");
      expect(savedName).toBeDefined();

      // the inner multiplication uses c directly as its operand.
      const multiply = actions.at(9);
      expect(multiply?.parameters.get("WFMathOperation")).toBe("×");
      expect(multiply?.parameters.get("WFMathOperand")).toMatchObject({
        kind: "VariableRef",
        name: "c",
      });

      // the saved "a" value is restored right before the outer addition,
      // so the addition combines a with (b * c) instead of (b * c) with
      // itself.
      const restore = actions.at(11);
      expect(restore?.identifier).toBe("is.workflow.actions.getvariable");
      expect(restore?.parameters.get("WFVariable")).toMatchObject({
        kind: "VariableRef",
        name: savedName,
      });

      const add = actions.at(12);
      expect(add?.parameters.get("WFMathOperation")).toBe("+");
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

  describe("if statement", () => {
    it("should lower if to conditional start/end", () => {
      const actions = lowerSource(
        'shortcut { name: "Test" } let x = 5; if x > 3 { showAlert(text: "big"); }',
      );
      const conditionals = actions.filter(
        (a) => a.identifier === "is.workflow.actions.conditional",
      );
      expect(conditionals).toHaveLength(2);
      expect(conditionals.at(0)?.parameters.get("WFControlFlowMode")).toBe(0);
      expect(conditionals.at(1)?.parameters.get("WFControlFlowMode")).toBe(2);
      const groupId = conditionals.at(0)?.groupingIdentifier;
      expect(groupId).toBeDefined();
      expect(conditionals.at(1)?.groupingIdentifier).toBe(groupId);
    });

    it("should lower if/else to conditional start/otherwise/end", () => {
      const actions = lowerSource(
        'shortcut { name: "Test" } let x = 5; if x > 3 { showAlert(text: "big"); } else { showAlert(text: "small"); }',
      );
      const conditionals = actions.filter(
        (a) => a.identifier === "is.workflow.actions.conditional",
      );
      expect(conditionals).toHaveLength(3);
      expect(conditionals.at(0)?.parameters.get("WFControlFlowMode")).toBe(0);
      expect(conditionals.at(1)?.parameters.get("WFControlFlowMode")).toBe(1);
      expect(conditionals.at(2)?.parameters.get("WFControlFlowMode")).toBe(2);
    });
  });

  describe("for statement", () => {
    it("should lower for to repeat.each start/end", () => {
      const actions = lowerSource(
        'shortcut { name: "Test" } let items = [1, 2]; for item in items { showAlert(text: "go"); }',
      );
      const repeats = actions.filter((a) => a.identifier === "is.workflow.actions.repeat.each");
      expect(repeats).toHaveLength(2);
      expect(repeats.at(0)?.parameters.get("WFControlFlowMode")).toBe(0);
      expect(repeats.at(1)?.parameters.get("WFControlFlowMode")).toBe(2);
      const groupId = repeats.at(0)?.groupingIdentifier;
      expect(groupId).toBeDefined();
      expect(repeats.at(1)?.groupingIdentifier).toBe(groupId);
    });

    it("should emit setvariable for loop variable after repeat start", () => {
      const actions = lowerSource(
        'shortcut { name: "Test" } let items = [1, 2]; for item in items { showAlert(text: "go"); }',
      );
      const repeatIdx = actions.findIndex(
        (a) => a.identifier === "is.workflow.actions.repeat.each",
      );
      const nextAction = actions.at(repeatIdx + 1);
      expect(nextAction?.identifier).toBe("is.workflow.actions.setvariable");
      expect(nextAction?.parameters.get("WFVariableName")).toBe("item");
    });
  });

  describe("repeat statement", () => {
    it("should lower repeat to repeat.count start/end", () => {
      const actions = lowerSource('shortcut { name: "Test" } repeat 5 { showAlert(text: "go"); }');
      const repeats = actions.filter((a) => a.identifier === "is.workflow.actions.repeat.count");
      expect(repeats).toHaveLength(2);
      expect(repeats.at(0)?.parameters.get("WFControlFlowMode")).toBe(0);
      expect(repeats.at(0)?.parameters.get("WFRepeatCount")).toBe(5);
      expect(repeats.at(1)?.parameters.get("WFControlFlowMode")).toBe(2);
    });
  });

  describe("menu statement", () => {
    it("should lower menu to choosefrommenu start/cases/end", () => {
      const actions = lowerSource(`
        shortcut { name: "Test" }
        menu "Pick" {
          case "A" { showAlert(text: "a"); }
          case "B" { showAlert(text: "b"); }
        }
      `);
      const menus = actions.filter((a) => a.identifier === "is.workflow.actions.choosefrommenu");
      expect(menus).toHaveLength(4);
      expect(menus.at(0)?.parameters.get("WFControlFlowMode")).toBe(0);
      expect(menus.at(1)?.parameters.get("WFControlFlowMode")).toBe(1);
      expect(menus.at(1)?.parameters.get("WFMenuItemTitle")).toBe("A");
      expect(menus.at(2)?.parameters.get("WFControlFlowMode")).toBe(1);
      expect(menus.at(2)?.parameters.get("WFMenuItemTitle")).toBe("B");
      expect(menus.at(3)?.parameters.get("WFControlFlowMode")).toBe(2);
    });
  });

  describe("ternary expression", () => {
    it("should lower ternary to conditional actions", () => {
      const actions = lowerSource(
        'shortcut { name: "Test" } let x = 5; let y = x > 3 ? "big" : "small";',
      );
      const conditionals = actions.filter(
        (a) => a.identifier === "is.workflow.actions.conditional",
      );
      expect(conditionals).toHaveLength(3);
      expect(conditionals.at(0)?.parameters.get("WFControlFlowMode")).toBe(0);
      expect(conditionals.at(1)?.parameters.get("WFControlFlowMode")).toBe(1);
      expect(conditionals.at(2)?.parameters.get("WFControlFlowMode")).toBe(2);
    });
  });

  describe("#index", () => {
    it("should lower #index to getvariable for Repeat Index", () => {
      const actions = lowerSource(
        'shortcut { name: "Test" } let items = [1, 2]; for item in items { let idx = #index; }',
      );
      const getVars = actions.filter((a) => a.identifier === "is.workflow.actions.getvariable");
      const indexRef = getVars.find((a) => {
        const v = a.parameters.get("WFVariable");
        return (
          v &&
          typeof v === "object" &&
          "kind" in v &&
          v.kind === "VariableRef" &&
          v.name === "Repeat Index"
        );
      });
      expect(indexRef).toBeDefined();
    });
  });

  describe("enum declarations", () => {
    it("should emit no actions for enum declaration itself", () => {
      const actions = lowerSource(
        'shortcut { name: "Test" } enum Color { red = "RED", blue = "BLUE" }',
      );
      expect(actions).toHaveLength(0);
    });

    it("should lower enum member access to backing string", () => {
      const actions = lowerSource(
        'shortcut { name: "Test" } enum Color { red = "RED", blue = "BLUE" } let c = Color.red;',
      );
      expect(actions.at(0)?.identifier).toBe("is.workflow.actions.gettext");
      expect(actions.at(0)?.parameters.get("WFTextActionText")).toBe("RED");
      expect(actions.at(1)?.identifier).toBe("is.workflow.actions.setvariable");
      expect(actions.at(1)?.parameters.get("WFVariableName")).toBe("c");
    });

    it("should lower enum with implicit case values to case name", () => {
      const actions = lowerSource(
        'shortcut { name: "Test" } enum Dir { north, south } let d = Dir.north;',
      );
      expect(actions.at(0)?.parameters.get("WFTextActionText")).toBe("north");
    });

    it("should lower enum with default value to prefixed name", () => {
      const actions = lowerSource(
        'shortcut { name: "Test" } enum Status = "st" { active, done } let s = Status.active;',
      );
      expect(actions.at(0)?.parameters.get("WFTextActionText")).toBe("st.active");
    });

    it("should lower dot-name expression to backing string", () => {
      const actions = lowerSource(
        'shortcut { name: "Test" } enum Color { red = "RED", blue = "BLUE" } let c: Color = .red;',
      );
      expect(actions.at(0)?.identifier).toBe("is.workflow.actions.gettext");
      expect(actions.at(0)?.parameters.get("WFTextActionText")).toBe("RED");
    });
  });

  describe("record declarations", () => {
    it("should emit no actions for record declaration itself", () => {
      const actions = lowerSource(
        'shortcut { name: "Test" } record Point { x: Number, y: Number }',
      );
      expect(actions).toHaveLength(0);
    });

    it("should lower record construction to dictionary with field keys", () => {
      const actions = lowerSource(
        'shortcut { name: "Test" } record Point { x: Number, y: Number } let p = Point(x: 1, y: 2);',
      );

      const dictAction = actions.find((a) => a.identifier === "is.workflow.actions.dictionary");
      expect(dictAction).toBeDefined();

      const setKeyActions = actions.filter(
        (a) => a.identifier === "is.workflow.actions.setvalueforkey",
      );
      expect(setKeyActions).toHaveLength(2);
      expect(setKeyActions.at(0)?.parameters.get("WFDictionaryKey")).toBe("x");
      expect(setKeyActions.at(0)?.parameters.get("WFDictionaryValue")).toBe(1);
      expect(setKeyActions.at(1)?.parameters.get("WFDictionaryKey")).toBe("y");
      expect(setKeyActions.at(1)?.parameters.get("WFDictionaryValue")).toBe(2);
    });

    it("should lower record field access to getvalueforkey", () => {
      const actions = lowerSource(
        'shortcut { name: "Test" } record Point { x: Number, y: Number } let p = Point(x: 1, y: 2); let a = p.x;',
      );
      const getKeyActions = actions.filter(
        (a) => a.identifier === "is.workflow.actions.getvalueforkey",
      );
      expect(getKeyActions).toHaveLength(1);
      expect(getKeyActions.at(0)?.parameters.get("WFDictionaryKey")).toBe("x");
    });
  });

  describe("let destructuring", () => {
    it("should lower let destructure to getvalueforkey per binding", () => {
      const actions = lowerSource(
        'shortcut { name: "Test" } record Point { x: Number, y: Number } let p = Point(x: 1, y: 2); let { x, y } = p;',
      );
      const getKeyActions = actions.filter(
        (a) => a.identifier === "is.workflow.actions.getvalueforkey",
      );
      expect(getKeyActions).toHaveLength(2);
      expect(getKeyActions.at(0)?.parameters.get("WFDictionaryKey")).toBe("x");
      expect(getKeyActions.at(1)?.parameters.get("WFDictionaryKey")).toBe("y");

      const setVarActions = actions.filter(
        (a) => a.identifier === "is.workflow.actions.setvariable",
      );
      const lastSetVars = setVarActions.slice(-2);
      expect(lastSetVars.at(0)?.parameters.get("WFVariableName")).toBe("x");
      expect(lastSetVars.at(1)?.parameters.get("WFVariableName")).toBe("y");
    });
  });

  describe("function declarations", () => {
    it("should emit no actions in main for function declaration", () => {
      const result = lowerSourceResult(
        'shortcut { name: "Test" } func greet() { showAlert(text: "hi"); }',
      );
      expect(result.main.actions).toHaveLength(0);
    });

    it("should produce a sub-shortcut for each function", () => {
      const result = lowerSourceResult(
        'shortcut { name: "Test" } func greet() { showAlert(text: "hi"); }',
      );
      expect(result.subShortcuts).toHaveLength(1);
      expect(result.subShortcuts.at(0)?.name).toContain("greet");
    });

    it("should lower function call to runworkflow action", () => {
      const result = lowerSourceResult(`
        shortcut { name: "Test" }
        func greet() { showAlert(text: "hi"); }
        greet();
      `);
      const runActions = result.main.actions.filter(
        (a) => a.identifier === "is.workflow.actions.runworkflow",
      );
      expect(runActions).toHaveLength(1);
    });

    it("should pass arguments as dictionary in function call", () => {
      const result = lowerSourceResult(`
        shortcut { name: "Test" }
        func add(a: Number, b: Number) -> Number { return a + b; }
        let result = add(a: 1, b: 2);
      `);
      const runActions = result.main.actions.filter(
        (a) => a.identifier === "is.workflow.actions.runworkflow",
      );
      expect(runActions).toHaveLength(1);
    });

    it("should emit output action for return statement", () => {
      const result = lowerSourceResult(`
        shortcut { name: "Test" }
        func add(a: Number, b: Number) -> Number { return a + b; }
      `);
      const sub = result.subShortcuts.at(0);
      const outputActions = sub?.actions.filter(
        (a) => a.identifier === "is.workflow.actions.output",
      );
      expect(outputActions?.length).toBeGreaterThanOrEqual(1);
    });

    it("should fill default parameter values at the call site", () => {
      const result = lowerSourceResult(`
        shortcut { name: "Test" }
        func greet(name: Text = "World") -> Text { return name; }
        let msg = greet();
      `);
      const runActions = result.main.actions.filter(
        (a) => a.identifier === "is.workflow.actions.runworkflow",
      );
      expect(runActions).toHaveLength(1);
    });

    it("should derive sub-shortcut name from function name plus content hash", () => {
      const result = lowerSourceResult(`
        shortcut { name: "Test" }
        func greet() { showAlert(text: "hi"); }
      `);
      const subName = result.subShortcuts.at(0)?.name;
      expect(subName).toMatch(/^greet_[a-f0-9]+$/);
    });
  });
});
