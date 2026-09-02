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
  describe("const declarations", () => {
    it("should lower const with string to text + setvariable", () => {
      const actions = lowerSource('shortcut { name: "Test" } const x = "hello";');
      expect(actions).toHaveLength(2);
      expect(actions.at(0)?.identifier).toBe("is.workflow.actions.gettext");
      expect(actions.at(1)?.identifier).toBe("is.workflow.actions.setvariable");
      expect(actions.at(1)?.parameters.get("WFVariableName")).toBe("x");
    });

    it("should lower const with number to number + setvariable", () => {
      const actions = lowerSource('shortcut { name: "Test" } const x = 42;');
      expect(actions.at(0)?.identifier).toBe("is.workflow.actions.number");
      expect(actions.at(0)?.parameters.get("WFNumberActionNumber")).toBe(42);
      expect(actions.at(1)?.identifier).toBe("is.workflow.actions.setvariable");
    });
  });

  describe("assignment", () => {
    it("should lower assignment to setvariable", () => {
      const actions = lowerSource('shortcut { name: "Test" } let x = 1; x = 2;');
      expect(actions).toHaveLength(4);
      expect(actions.at(3)?.identifier).toBe("is.workflow.actions.setvariable");
    });
  });

  describe("arithmetic", () => {
    it("should lower addition to getvariable + math", () => {
      const actions = lowerSource(
        'shortcut { name: "Test" } const a = 1; const b = 2; const c = a + b;',
      );
      const mathActions = actions.filter((a) => a.identifier === "is.workflow.actions.math");
      expect(mathActions).toHaveLength(1);
      expect(mathActions.at(0)?.parameters.get("WFMathOperation")).toBe("+");
    });

    it("should preserve the left operand across a compound right operand", () => {
      const actions = lowerSource(
        'shortcut { name: "Test" } const a = 1; const b = 2; const c = 3; const d = a + b * c;',
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
        'shortcut { name: "Test" } const a: Number? = nil; const b = a ?? 0;',
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
        'shortcut { name: "Test" } const name = "world"; const g = "hello ${name}";',
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
        'shortcut { name: "Test" } action alert(text: Text) = "is.workflow.actions.alert"; const x = 5; if (x > 3) { alert(text: "big"); }',
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
        'shortcut { name: "Test" } action alert(text: Text) = "is.workflow.actions.alert"; const x = 5; if (x > 3) { alert(text: "big"); } else { alert(text: "small"); }',
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
        'shortcut { name: "Test" } action alert(text: Text) = "is.workflow.actions.alert"; const items = [1, 2]; for item in items { alert(text: "go"); }',
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
        'shortcut { name: "Test" } action alert(text: Text) = "is.workflow.actions.alert"; const items = [1, 2]; for item in items { alert(text: "go"); }',
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
      const actions = lowerSource('shortcut { name: "Test" } action alert(text: Text) = "is.workflow.actions.alert"; repeat 5 { alert(text: "go"); }');
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
        action alert(text: Text) = "is.workflow.actions.alert";
        menu "Pick" {
          case "A" { alert(text: "a"); }
          case "B" { alert(text: "b"); }
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
        'shortcut { name: "Test" } const x = 5; const y = x > 3 ? "big" : "small";',
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
        'shortcut { name: "Test" } const items = [1, 2]; for item in items { const idx = #index; }',
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
        'shortcut { name: "Test" } enum Color { red = "RED", blue = "BLUE" } const c = Color.red;',
      );
      expect(actions.at(0)?.identifier).toBe("is.workflow.actions.gettext");
      expect(actions.at(0)?.parameters.get("WFTextActionText")).toBe("RED");
      expect(actions.at(1)?.identifier).toBe("is.workflow.actions.setvariable");
      expect(actions.at(1)?.parameters.get("WFVariableName")).toBe("c");
    });

    it("should lower enum with implicit case values to case name", () => {
      const actions = lowerSource(
        'shortcut { name: "Test" } enum Dir { north, south } const d = Dir.north;',
      );
      expect(actions.at(0)?.parameters.get("WFTextActionText")).toBe("north");
    });

    it("should lower enum with default value to prefixed name", () => {
      const actions = lowerSource(
        'shortcut { name: "Test" } enum Status = "st" { active, done } const s = Status.active;',
      );
      expect(actions.at(0)?.parameters.get("WFTextActionText")).toBe("st.active");
    });

    it("should lower dot-name expression to backing string", () => {
      const actions = lowerSource(
        'shortcut { name: "Test" } enum Color { red = "RED", blue = "BLUE" } const c: Color = .red;',
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
        'shortcut { name: "Test" } record Point { x: Number, y: Number } const p = Point(x: 1, y: 2);',
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
        'shortcut { name: "Test" } record Point { x: Number, y: Number } const p = Point(x: 1, y: 2); const a = p.x;',
      );
      const getKeyActions = actions.filter(
        (a) => a.identifier === "is.workflow.actions.getvalueforkey",
      );
      expect(getKeyActions).toHaveLength(1);
      expect(getKeyActions.at(0)?.parameters.get("WFDictionaryKey")).toBe("x");
    });
  });

  describe("const destructuring", () => {
    it("should lower const destructure to getvalueforkey per binding", () => {
      const actions = lowerSource(
        'shortcut { name: "Test" } record Point { x: Number, y: Number } const p = Point(x: 1, y: 2); const { x, y } = p;',
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
        'shortcut { name: "Test" } action alert(text: Text) = "is.workflow.actions.alert"; func greet() { alert(text: "hi"); }',
      );
      expect(result.main.actions).toHaveLength(0);
    });

    it("should produce a sub-shortcut for each function", () => {
      const result = lowerSourceResult(
        'shortcut { name: "Test" } action alert(text: Text) = "is.workflow.actions.alert"; func greet() { alert(text: "hi"); }',
      );
      expect(result.subShortcuts).toHaveLength(1);
      expect(result.subShortcuts.at(0)?.name).toContain("greet");
    });

    it("should lower function call to runworkflow action", () => {
      const result = lowerSourceResult(`
        shortcut { name: "Test" }
        action alert(text: Text) = "is.workflow.actions.alert";
        func greet() { alert(text: "hi"); }
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
        const result = add(a: 1, b: 2);
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
        const msg = greet();
      `);
      const runActions = result.main.actions.filter(
        (a) => a.identifier === "is.workflow.actions.runworkflow",
      );
      expect(runActions).toHaveLength(1);
    });

    it("should derive sub-shortcut name from function name plus content hash", () => {
      const result = lowerSourceResult(`
        shortcut { name: "Test" }
        action alert(text: Text) = "is.workflow.actions.alert";
        func greet() { alert(text: "hi"); }
      `);
      const subName = result.subShortcuts.at(0)?.name;
      expect(subName).toMatch(/^greet_[a-f0-9]+$/);
    });

    it("should derive the same sub-shortcut name regardless of source position", () => {
      const resultA = lowerSourceResult(`
        shortcut { name: "Test" }
        func add(a: Number, b: Number) -> Number { return a + b; }
      `);
      const resultB = lowerSourceResult(`
        shortcut { name: "Test" }


        func add(a: Number, b: Number) -> Number { return a + b; }
      `);
      expect(resultA.subShortcuts.at(0)?.name).toBe(resultB.subShortcuts.at(0)?.name);
    });

    it("should restore the input dictionary before extracting each parameter", () => {
      const result = lowerSourceResult(`
        shortcut { name: "Test" }
        func add(a: Number, b: Number) -> Number { return a + b; }
      `);
      const sub = result.subShortcuts.at(0);
      const actions = sub?.actions ?? [];

      const identifiers = actions.map((a) => a.identifier);
      expect(identifiers.slice(0, 8)).toEqual([
        "is.workflow.actions.getvariable",
        "is.workflow.actions.setvariable",
        "is.workflow.actions.getvariable",
        "is.workflow.actions.getvalueforkey",
        "is.workflow.actions.setvariable",
        "is.workflow.actions.getvariable",
        "is.workflow.actions.getvalueforkey",
        "is.workflow.actions.setvariable",
      ]);

      const firstGetVariable = actions.at(0);
      expect(firstGetVariable?.parameters.get("WFVariable")).toEqual({
        kind: "VariableRef",
        name: "Shortcut Input",
      });

      const firstDictionaryKey = actions.at(3);
      expect(firstDictionaryKey?.parameters.get("WFDictionaryKey")).toBe("a");

      const secondDictionaryKey = actions.at(6);
      expect(secondDictionaryKey?.parameters.get("WFDictionaryKey")).toBe("b");

      const restoreBeforeSecondExtraction = actions.at(5);
      const tempName = actions.at(1)?.parameters.get("WFVariableName") as string | undefined;
      expect(
        (
          restoreBeforeSecondExtraction?.parameters.get("WFVariable") as
            | { kind: "VariableRef"; name: string }
            | undefined
        )?.name,
      ).toBe(tempName);
    });
  });

  describe("pipelines", () => {
    it("should lower a single-stage function pipeline", () => {
      const actions = lowerSource(`
        func double(n: Number) -> Number { return n * 2; }
        const x = 5 |> double;
      `);

      const runWorkflow = actions.filter((a) => a.identifier === "is.workflow.actions.runworkflow");
      expect(runWorkflow).toHaveLength(1);
    });

    it("should lower a multi-stage pipeline", () => {
      const actions = lowerSource(`
        func double(n: Number) -> Number { return n * 2; }
        func triple(n: Number) -> Number { return n * 3; }
        const x = 5 |> double |> triple;
      `);

      const runWorkflow = actions.filter((a) => a.identifier === "is.workflow.actions.runworkflow");
      expect(runWorkflow).toHaveLength(2);
    });

    it("should lower |>? with a nil-check conditional", () => {
      const actions = lowerSource(`
        func double(n: Number) -> Number { return n * 2; }
        const x: Number? = nil;
        const y = x |>? double;
      `);

      const conditionals = actions.filter(
        (a) => a.identifier === "is.workflow.actions.conditional",
      );
      expect(conditionals.length).toBeGreaterThanOrEqual(2);
    });

    it("should lower pipeline as expression statement", () => {
      const actions = lowerSource(`
        action alert(text: Text) = "is.workflow.actions.alert";
        const x = "hello";
        x |> alert;
      `);

      const alert = actions.find((a) => a.identifier === "is.workflow.actions.alert");
      expect(alert).toBeDefined();
    });

    it("should lower pipeline with _ placeholder in explicit position", () => {
      const actions = lowerSource(`
        func add(a: Number, b: Number) -> Number { return a + b; }
        const x = 5 |> add(b: 10, a: _);
      `);

      const runWorkflow = actions.filter((a) => a.identifier === "is.workflow.actions.runworkflow");
      expect(runWorkflow).toHaveLength(1);
    });

    it("should wrap all stages from |>? onward in one conditional", () => {
      const actions = lowerSource(`
        func double(n: Number) -> Number { return n * 2; }
        func triple(n: Number) -> Number { return n * 3; }
        const x: Number? = nil;
        const y = x |>? double |> triple;
      `);

      const conditionals = actions.filter(
        (a) => a.identifier === "is.workflow.actions.conditional",
      );
      const runWorkflows = actions.filter(
        (a) => a.identifier === "is.workflow.actions.runworkflow",
      );

      expect(conditionals).toHaveLength(3);

      const condStart = actions.indexOf(conditionals.at(0)!);
      const condEnd = actions.indexOf(conditionals.at(2)!);
      const runIndices = runWorkflows.map((r) => actions.indexOf(r));
      for (const ri of runIndices) {
        expect(ri).toBeGreaterThan(condStart);
        expect(ri).toBeLessThan(condEnd);
      }
    });
  });

  describe("action declarations", () => {
    it("should emit no actions in main for action declaration", () => {
      const result = lowerSource(
        'shortcut { name: "Test" } action doThing() = "com.example.dothing";',
      );
      expect(result).toHaveLength(0);
    });

    it("should lower action call to the runtime identifier", () => {
      const result = lowerSource(`
        shortcut { name: "Test" }
        action doThing(text: Text) = "com.example.dothing";
        doThing(text: "hello");
      `);
      const action = result.find((a) => a.identifier === "com.example.dothing");
      expect(action).toBeDefined();
    });

    it("should map action parameters to their labels as keys", () => {
      const result = lowerSource(`
        shortcut { name: "Test" }
        action sendMessage(to: Text, body: Text) = "com.example.send";
        sendMessage(to: "alice", body: "hello");
      `);
      const action = result.find((a) => a.identifier === "com.example.send");
      expect(action?.parameters.get("to")).toBe("alice");
      expect(action?.parameters.get("body")).toBe("hello");
    });

    it("should fill default parameter values at the call site", () => {
      const result = lowerSource(`
        shortcut { name: "Test" }
        action notify(body: Text, title: Text = "Alert") = "is.workflow.actions.notification";
        notify(body: "done");
      `);
      const action = result.find((a) => a.identifier === "is.workflow.actions.notification");
      expect(action?.parameters.get("body")).toBe("done");
      expect(action?.parameters.get("title")).toBe("Alert");
    });

    it("should lower declared action as pipeline stage", () => {
      const result = lowerSource(`
        shortcut { name: "Test" }
        action transform(mode: Text) -> Text = "com.example.transform";
        const x = "hello" |> transform(mode: "upper");
      `);
      const action = result.find((a) => a.identifier === "com.example.transform");
      expect(action).toBeDefined();
      expect(action?.parameters.get("mode")).toBe("upper");
    });

    it("should lower declared action as bare pipeline stage", () => {
      const result = lowerSource(`
        shortcut { name: "Test" }
        action process() -> Text = "com.example.process";
        const x = "hello" |> process;
      `);
      const action = result.find((a) => a.identifier === "com.example.process");
      expect(action).toBeDefined();
    });

    it("should use param name (not label) as plist key when they differ", () => {
      const result = lowerSource(`
        shortcut { name: "Test" }
        action showAlert(text WFAlertActionTitle: Text) = "is.workflow.actions.alert";
        showAlert(text: "hello");
      `);
      const action = result.find((a) => a.identifier === "is.workflow.actions.alert");
      expect(action).toBeDefined();
      expect(action?.parameters.get("WFAlertActionTitle")).toBe("hello");
      expect(action?.parameters.has("text")).toBe(false);
    });

    it("should use param name in pipeline declared action stage", () => {
      const result = lowerSource(`
        shortcut { name: "Test" }
        action transform(mode WFTransformMode: Text) -> Text = "com.example.transform";
        const x = "hello" |> transform(mode: "upper");
      `);
      const action = result.find((a) => a.identifier === "com.example.transform");
      expect(action?.parameters.get("WFTransformMode")).toBe("upper");
      expect(action?.parameters.has("mode")).toBe(false);
    });
  });

  describe("stdlib integration", () => {
    it("should lower showAlert using inline declaration with correct plist key", () => {
      const result = lowerSource(`
        shortcut { name: "Test" }
        action showAlert(text WFAlertActionTitle: Text) = "is.workflow.actions.alert";
        showAlert(text: "hello");
      `);
      const action = result.find((a) => a.identifier === "is.workflow.actions.alert");
      expect(action).toBeDefined();
      expect(action?.parameters.get("WFAlertActionTitle")).toBe("hello");
    });

    it("should lower showResult using inline declaration", () => {
      const result = lowerSource(`
        shortcut { name: "Test" }
        action showResult(text Text: Text) = "is.workflow.actions.showresult";
        showResult(text: "done");
      `);
      const action = result.find((a) => a.identifier === "is.workflow.actions.showresult");
      expect(action).toBeDefined();
      expect(action?.parameters.get("Text")).toBe("done");
    });

    it("should allow user action to shadow stdlib", () => {
      const result = lowerSource(`
        shortcut { name: "Test" }
        action showAlert(msg: Text) = "custom.alert";
        showAlert(msg: "hello");
      `);
      const action = result.find((a) => a.identifier === "custom.alert");
      expect(action).toBeDefined();
      expect(action?.parameters.get("msg")).toBe("hello");
    });

    it("should lower namespace-qualified action call from stdlib module", () => {
      const result = lowerSource(`
        import Notification;
        shortcut { name: "Test" }
        Notification.showAlert(WFAlertActionTitle: "hello");
      `);
      const action = result.find((a) => a.identifier === "is.workflow.actions.alert");
      expect(action).toBeDefined();
      expect(action?.parameters.get("WFAlertActionTitle")).toBe("hello");
    });

    it("should lower aliased namespace-qualified action call", () => {
      const result = lowerSource(`
        import Notification as N;
        shortcut { name: "Test" }
        N.showAlert(WFAlertActionTitle: "hello");
      `);
      const action = result.find((a) => a.identifier === "is.workflow.actions.alert");
      expect(action).toBeDefined();
      expect(action?.parameters.get("WFAlertActionTitle")).toBe("hello");
    });

    it("should lower namespace-qualified action in pipeline", () => {
      const result = lowerSource(`
        import Notification;
        shortcut { name: "Test" }
        "hello" |> Notification.showAlert(WFAlertActionTitle: _);
      `);
      const action = result.find((a) => a.identifier === "is.workflow.actions.alert");
      expect(action).toBeDefined();
    });
  });
});
