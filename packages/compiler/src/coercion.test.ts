import { describe, expect, it } from "vitest";
import { getCoercionAction, canCoerce, getValidTargets, getContentItemClass } from "./coercion.ts";
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

    it("should list only the measured targets for an opaque source", () => {
      const source: ChuteType = { kind: "opaque", name: "Email" };
      expect(getValidTargets(source).sort()).toEqual(["Email", "Image", "Text", "URL"]);
    });
  });

  describe("getContentItemClass", () => {
    it("should return content item class for Date", () => {
      expect(getContentItemClass("Date")).toBe("WFDateContentItem");
    });

    it("should return content item class for Number", () => {
      expect(getContentItemClass("Number")).toBe("WFNumberContentItem");
    });

    it("should return content item class for Text", () => {
      expect(getContentItemClass("Text")).toBe("WFStringContentItem");
    });

    it("should return content item class for URL", () => {
      expect(getContentItemClass("URL")).toBe("WFURLContentItem");
    });

    it("should return undefined for non-coercion type", () => {
      expect(getContentItemClass("Boolean")).toBeUndefined();
    });
  });

  describe("empirical pairs", () => {
    const opaque = (name: string): ChuteType => ({ kind: "opaque", name });

    it("should allow every source to reach Text", () => {
      for (const source of [
        { kind: "number" } as const,
        { kind: "boolean" } as const,
        { kind: "dictionary" } as const,
        opaque("Date"),
        opaque("Location"),
      ]) {
        expect(canCoerce(source, "Text")).toBe(true);
      }
    });

    it("should distinguish opaque sources rather than treating them alike", () => {
      // A Date yields epoch seconds; other opaque types return a Boolean.
      expect(canCoerce(opaque("Date"), "Number")).toBe(true);
      expect(canCoerce(opaque("URL"), "Number")).toBe(false);
      expect(canCoerce(opaque("Email"), "Number")).toBe(false);
    });

    it("should reject non-numeric sources for Number", () => {
      expect(canCoerce({ kind: "dictionary" }, "Number")).toBe(false);
      expect(canCoerce({ kind: "boolean" }, "Number")).toBe(false);
    });

    it("should reject Date from a number at any magnitude", () => {
      expect(canCoerce({ kind: "number" }, "Date")).toBe(false);
      expect(canCoerce({ kind: "text" }, "Date")).toBe(true);
    });

    it("should render most sources to Image, but not a URL", () => {
      expect(canCoerce({ kind: "number" }, "Image")).toBe(true);
      expect(canCoerce({ kind: "dictionary" }, "Image")).toBe(true);
      expect(canCoerce(opaque("Location"), "Image")).toBe(true);
      expect(canCoerce(opaque("URL"), "Image")).toBe(false);
    });

    it("should not reach Contact from anything but a Contact", () => {
      expect(canCoerce({ kind: "text" }, "Contact")).toBe(false);
      expect(canCoerce({ kind: "dictionary" }, "Contact")).toBe(false);
      expect(canCoerce(opaque("Email"), "Contact")).toBe(false);
      expect(canCoerce(opaque("Contact"), "Contact")).toBe(true);
    });

    it("should derive links and handles from a Contact", () => {
      expect(canCoerce(opaque("Contact"), "URL")).toBe(true);
      expect(canCoerce(opaque("Contact"), "Email")).toBe(true);
      expect(canCoerce(opaque("Contact"), "Phone")).toBe(true);
      expect(canCoerce(opaque("Contact"), "Location")).toBe(true);
    });

    it("should build mailto and tel links from Email and Phone", () => {
      expect(canCoerce(opaque("Email"), "URL")).toBe(true);
      expect(canCoerce(opaque("Phone"), "URL")).toBe(true);
      expect(canCoerce(opaque("Date"), "URL")).toBe(false);
    });

    it("should stay permissive for opaque types that were never measured", () => {
      expect(canCoerce(opaque("Article"), "Number")).toBe(true);
      expect(canCoerce(opaque("Article"), "Contact")).toBe(true);
    });

    it("should look through an optional source", () => {
      expect(canCoerce({ kind: "optional", inner: opaque("Date") }, "Number")).toBe(true);
      expect(canCoerce({ kind: "optional", inner: opaque("URL") }, "Number")).toBe(false);
      expect(canCoerce({ kind: "optional", inner: { kind: "any" } }, "Contact")).toBe(true);
    });
  });
});
