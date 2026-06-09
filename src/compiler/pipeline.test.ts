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

  it("should compile if/else statement", () => {
    const source = `shortcut {
  name: "IfElse",
}

let x = 5;
if x > 3 {
  showAlert(text: "big");
} else {
  showAlert(text: "small");
}`;

    expect(compile(source)).toMatchSnapshot();
  });

  it("should compile for loop", () => {
    const source = `shortcut {
  name: "ForLoop",
}

let items = [1, 2, 3];
for item in items {
  showAlert(text: "item");
}`;

    expect(compile(source)).toMatchSnapshot();
  });

  it("should compile repeat loop", () => {
    const source = `shortcut {
  name: "Repeat",
}

repeat 3 {
  showAlert(text: "again");
}`;

    expect(compile(source)).toMatchSnapshot();
  });

  it("should compile menu statement", () => {
    const source = `shortcut {
  name: "Menu",
}

menu "Choose one" {
  case "Option A" {
    showAlert(text: "A");
  }
  case "Option B" {
    showAlert(text: "B");
  }
}`;

    expect(compile(source)).toMatchSnapshot();
  });

  it("should compile ternary expression", () => {
    const source = `shortcut {
  name: "Ternary",
}

let x = 5;
let result = x > 3 ? "big" : "small";
showAlert(text: result);`;

    expect(compile(source)).toMatchSnapshot();
  });
});
