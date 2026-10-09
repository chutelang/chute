import { describe, expect, it } from "vitest";
import { codegen, utf16Length } from "./codegen.ts";
import type { ShortcutIR, InterpolatedText, ParameterValue } from "./ir.ts";

function makeIR(parameters: Map<string, ParameterValue>): ShortcutIR {
  return {
    name: "Test",
    actions: [
      {
        identifier: "is.workflow.actions.getvariable",
        uuid: "00000000-0000-0000-0000-000000000001",
        parameters,
      },
    ],
  };
}

describe("codegen", () => {
  describe("aggrandizements", () => {
    it("should emit coercion aggrandizement on picker variable ref", () => {
      const params = new Map<string, ParameterValue>([
        [
          "WFVariable",
          {
            kind: "VariableRef",
            name: "myVar",
            aggrandizements: [
              {
                kind: "coercion",
                itemClass: "WFDateContentItem",
              },
            ],
          },
        ],
      ]);
      const result = codegen(makeIR(params));
      expect(result).toContain("Aggrandizements");
      expect(result).toContain("WFCoercionVariableAggrandizement");
      expect(result).toContain("CoercionItemClass");
      expect(result).toContain("WFDateContentItem");
    });

    it("should emit property aggrandizement on picker variable ref", () => {
      const params = new Map<string, ParameterValue>([
        [
          "WFVariable",
          {
            kind: "VariableRef",
            name: "myDate",
            aggrandizements: [
              {
                kind: "property",
                name: "Year",
                userInfo: 4,
              },
            ],
          },
        ],
      ]);
      const result = codegen(makeIR(params));
      expect(result).toContain("Aggrandizements");
      expect(result).toContain("WFPropertyVariableAggrandizement");
      expect(result).toContain("PropertyName");
      expect(result).toContain("Year");
      expect(result).toContain("PropertyUserInfo");
      expect(result).toContain("<integer>4</integer>");
    });

    it("should omit aggrandizements key when absent", () => {
      const params = new Map<string, ParameterValue>([
        [
          "WFVariable",
          {
            kind: "VariableRef",
            name: "myVar",
          },
        ],
      ]);
      const result = codegen(makeIR(params));
      expect(result).not.toContain("Aggrandizements");
    });

    it("should emit aggrandizements in interpolated text variable parts", () => {
      const params = new Map<string, ParameterValue>([
        [
          "WFText",
          {
            kind: "InterpolatedText",
            parts: [
              {
                kind: "text",
                value: "Year: ",
              },
              {
                kind: "variable",
                name: "myDate",
                aggrandizements: [
                  {
                    kind: "property",
                    name: "Year",
                    userInfo: 4,
                  },
                ],
              },
            ],
          },
        ],
      ]);
      const result = codegen(makeIR(params));
      expect(result).toContain("Aggrandizements");
      expect(result).toContain("WFPropertyVariableAggrandizement");
    });

    it("should emit multiple aggrandizements in order", () => {
      const params = new Map<string, ParameterValue>([
        [
          "WFVariable",
          {
            kind: "VariableRef",
            name: "myVar",
            aggrandizements: [
              {
                kind: "coercion",
                itemClass: "WFDateContentItem",
              },
              {
                kind: "property",
                name: "Year",
                userInfo: 4,
              },
            ],
          },
        ],
      ]);
      const result = codegen(makeIR(params));
      const aggIdx = result.indexOf("Aggrandizements");
      const coercionIdx = result.indexOf("WFCoercionVariableAggrandizement");
      const propertyIdx = result.indexOf("WFPropertyVariableAggrandizement");
      expect(aggIdx).toBeGreaterThan(-1);
      expect(coercionIdx).toBeLessThan(propertyIdx);
    });
  });
});

function makeInterpolatedTextIR(text: InterpolatedText): ShortcutIR {
  return {
    name: "Test",
    actions: [
      {
        identifier: "is.workflow.actions.gettext",
        uuid: "00000000-0000-0000-0000-000000000001",
        parameters: new Map([["WFTextActionText", text]]),
      },
    ],
  };
}

describe("utf16Length", () => {
  it("should count BMP characters as 1 code unit each", () => {
    expect(utf16Length("hello")).toBe(5);
  });

  it("should count astral plane characters as 2 code units", () => {
    expect(utf16Length("\u{1F389}")).toBe(2);
  });

  it("should handle mixed BMP and astral plane characters", () => {
    expect(utf16Length("Hi \u{1F389} ok")).toBe(8);
  });
});

describe("attachmentsByRange positions", () => {
  it("should use UTF-16 code unit positions after emoji", () => {
    const text: InterpolatedText = {
      kind: "InterpolatedText",
      parts: [
        { kind: "text", value: "Party \u{1F389} " },
        { kind: "variable", name: "myVar" },
      ],
    };
    const result = codegen(makeInterpolatedTextIR(text));
    expect(result).toContain("{9, 1}");
  });

  it("should handle multiple emoji before a variable", () => {
    const text: InterpolatedText = {
      kind: "InterpolatedText",
      parts: [
        { kind: "text", value: "\u{1F389}\u{1F389}" },
        { kind: "variable", name: "myVar" },
      ],
    };
    const result = codegen(makeInterpolatedTextIR(text));
    expect(result).toContain("{4, 1}");
  });

  it("should handle variable at position 0", () => {
    const text: InterpolatedText = {
      kind: "InterpolatedText",
      parts: [{ kind: "variable", name: "myVar" }],
    };
    const result = codegen(makeInterpolatedTextIR(text));
    expect(result).toContain("{0, 1}");
  });

  it("should offset subsequent variables correctly", () => {
    const text: InterpolatedText = {
      kind: "InterpolatedText",
      parts: [
        { kind: "text", value: "A" },
        { kind: "variable", name: "first" },
        { kind: "text", value: "B" },
        { kind: "variable", name: "second" },
      ],
    };
    const result = codegen(makeInterpolatedTextIR(text));
    expect(result).toContain("{1, 1}");
    expect(result).toContain("{3, 1}");
  });
});
