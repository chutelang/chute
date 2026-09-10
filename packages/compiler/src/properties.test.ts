import { describe, expect, it } from "vitest";
import { getProperty, getProperties, getPropertyNames } from "./properties.ts";

describe("properties", () => {
  describe("getProperty", () => {
    it("should return property definition for Date.year", () => {
      const prop = getProperty("Date", "year");
      expect(prop).toBeDefined();
      expect(prop?.shortcutsName).toBe("Year");
      expect(prop?.returnType).toEqual({ kind: "number" });
    });

    it("should return property definition for URL.host", () => {
      const prop = getProperty("URL", "host");
      expect(prop).toBeDefined();
      expect(prop?.shortcutsName).toBe("Host");
      expect(prop?.returnType).toEqual({ kind: "text" });
    });

    it("should return undefined for unknown property", () => {
      expect(getProperty("Date", "foo")).toBeUndefined();
    });

    it("should return undefined for unknown type", () => {
      expect(getProperty("NotAType", "year")).toBeUndefined();
    });
  });

  describe("getProperties", () => {
    it("should return all properties for Date", () => {
      const props = getProperties("Date");
      expect(props.length).toBeGreaterThan(0);
      const names = props.map((p) => p.chuteName);
      expect(names).toContain("year");
      expect(names).toContain("month");
      expect(names).toContain("day");
    });

    it("should return empty array for unknown type", () => {
      expect(getProperties("NotAType")).toEqual([]);
    });
  });

  describe("getPropertyNames", () => {
    it("should return camelCase names for Date", () => {
      const names = getPropertyNames("Date");
      expect(names).toContain("year");
      expect(names).toContain("month");
      expect(names).toContain("day");
    });

    it("should return empty array for type with no properties", () => {
      expect(getPropertyNames("Article")).toEqual([]);
    });
  });
});
