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
});
