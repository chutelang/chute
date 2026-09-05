import { describe, expect, it } from "vitest";
import { getCoercionAction, canCoerce, getValidTargets } from "./coercion.ts";
import type { ChuteType } from "./checker.ts";

describe("coercion", () => {
  describe("getCoercionAction", () => {
    it("should return action identifier for Number", () => {
      expect(getCoercionAction("Number")).toBe("is.workflow.actions.detect.number");
    });

    it("should return action identifier for Text", () => {
      expect(getCoercionAction("Text")).toBe("is.workflow.actions.detect.text");
    });

    it("should return action identifier for Date", () => {
      expect(getCoercionAction("Date")).toBe("is.workflow.actions.detect.date");
    });

    it("should return undefined for non-coercion type", () => {
      expect(getCoercionAction("Boolean")).toBeUndefined();
    });
  });

  describe("canCoerce", () => {
    it("should allow text to number", () => {
      const source: ChuteType = { kind: "text" };
      expect(canCoerce(source, "Number")).toBe(true);
    });

    it("should allow any source to skip validation", () => {
      const source: ChuteType = { kind: "any" };
      expect(canCoerce(source, "Number")).toBe(true);
    });

    it("should reject invalid pairs", () => {
      const source: ChuteType = { kind: "boolean" };
      expect(canCoerce(source, "Number")).toBe(false);
    });
  });

  describe("getValidTargets", () => {
    it("should list valid targets for text", () => {
      const source: ChuteType = { kind: "text" };
      const targets = getValidTargets(source);
      expect(targets).toContain("Number");
      expect(targets).toContain("Date");
      expect(targets).toContain("URL");
    });

    it("should return all targets for any", () => {
      const source: ChuteType = { kind: "any" };
      const targets = getValidTargets(source);
      expect(targets.length).toBeGreaterThan(0);
    });
  });
});
