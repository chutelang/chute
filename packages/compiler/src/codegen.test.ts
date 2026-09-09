import { describe, expect, it } from "vitest";
import { codegen } from "./codegen.ts";
import type { ShortcutIR, ParameterValue } from "./ir.ts";

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
