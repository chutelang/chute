import { describe, expect, it } from "vitest";
import { compile } from "./pipeline.ts";

describe("compile", () => {
  it("should compile hello world to a valid plist", () => {
    const source = `shortcut {
  name: "Hello World",
  description: "A shortcut created with Chute",
}

showAlert(text: "Hello from Chute!");`;

    expect(compile(source)).toMatchSnapshot();
  });

  it("should compile multiple actions", () => {
    const source = `shortcut {
  name: "Multi",
}

showAlert(text: "first");
showResult(text: "second");`;

    expect(compile(source)).toMatchSnapshot();
  });

  it("should compile let declaration with variable use", () => {
    const source = `shortcut {
  name: "Variables",
}

let greeting = "Hello";
showAlert(text: greeting);`;

    expect(compile(source)).toMatchSnapshot();
  });

  it("should compile arithmetic expression", () => {
    const source = `shortcut {
  name: "Math",
}

let a = 10;
let b = 20;
let c = a + b;
showResult(text: "done");`;

    expect(compile(source)).toMatchSnapshot();
  });

  it("should compile string interpolation", () => {
    const source = `shortcut {
  name: "Interpolation",
}

let name = "World";
showAlert(text: "Hello \${name}!");`;

    expect(compile(source)).toMatchSnapshot();
  });

  it("should compile nil coalescing", () => {
    const source = `shortcut {
  name: "Coalesce",
}

let x: Number? = nil;
let y = x ?? 42;
showResult(text: "done");`;

    expect(compile(source)).toMatchSnapshot();
  });
});
