import { describe, expect, it } from "vitest";
import { parseDocComment } from "./doc-comment.ts";

describe("parseDocComment", () => {
  it("should parse a simple description", () => {
    const result = parseDocComment("* Hello world", { start: 0, end: 15 });
    expect(result.description).toBe("Hello world");
    expect(result.tags).toEqual([]);
  });

  it("should strip leading * from each line", () => {
    const raw = `*
 * Line one
 * Line two
 `;
    const result = parseDocComment(raw, { start: 0, end: raw.length + 4 });
    expect(result.description).toBe("Line one\nLine two");
  });

  it("should parse without leading * on lines", () => {
    const raw = `*
 Hello world
 `;
    const result = parseDocComment(raw, { start: 0, end: raw.length + 4 });
    expect(result.description).toBe("Hello world");
  });

  it("should parse @param tags", () => {
    const raw = `*
 * A function
 * @param name The person's name
 * @param age How old they are
 `;
    const result = parseDocComment(raw, { start: 0, end: raw.length + 4 });
    expect(result.description).toBe("A function");
    expect(result.tags).toHaveLength(2);
    expect(result.tags.at(0)).toMatchObject({
      kind: "param",
      name: "name",
      body: "The person's name",
    });
    expect(result.tags.at(1)).toMatchObject({
      kind: "param",
      name: "age",
      body: "How old they are",
    });
  });

  it("should parse @example tags", () => {
    const raw = `*
 * Does a thing.
 * @example
 * doThing()
 `;
    const result = parseDocComment(raw, { start: 0, end: raw.length + 4 });
    expect(result.description).toBe("Does a thing.");
    expect(result.tags).toHaveLength(1);
    expect(result.tags.at(0)).toMatchObject({
      kind: "example",
      body: "doThing()",
    });
  });

  it("should handle multi-line @param descriptions via continuation", () => {
    const raw = `*
 * @param query The search query to execute. Can include
 *   wildcards and boolean operators.
 * @param limit Max results
 `;
    const result = parseDocComment(raw, { start: 0, end: raw.length + 4 });
    expect(result.tags.at(0)?.body).toBe(
      "The search query to execute. Can include\nwildcards and boolean operators.",
    );
    expect(result.tags.at(1)?.body).toBe("Max results");
  });

  it("should handle multi-line @example via continuation", () => {
    const raw = `*
 * @example
 * const x = 1;
 * const y = 2;
 * @param z A number
 `;
    const result = parseDocComment(raw, { start: 0, end: raw.length + 4 });
    expect(result.tags.at(0)?.kind).toBe("example");
    expect(result.tags.at(0)?.body).toBe("const x = 1;\nconst y = 2;");
    expect(result.tags.at(1)?.kind).toBe("param");
  });

  it("should preserve unknown tags", () => {
    const raw = `*
 * @deprecated Use newThing instead
 `;
    const result = parseDocComment(raw, { start: 0, end: raw.length + 4 });
    expect(result.tags.at(0)).toMatchObject({
      kind: "unknown",
      name: undefined,
      body: "Use newThing instead",
    });
  });

  it("should produce spans for tags", () => {
    const raw = `* @param x A number`;
    const result = parseDocComment(raw, { start: 3, end: 24 });
    const tag = result.tags.at(0);
    expect(tag?.span.start).toBeGreaterThanOrEqual(3);
    expect(tag?.span.end).toBeLessThanOrEqual(24);
  });

  it("should produce a span for the param name", () => {
    const raw = `* @param myVar A variable`;
    const result = parseDocComment(raw, { start: 3, end: 30 });
    const tag = result.tags.at(0);
    expect(tag?.name).toBe("myVar");
    expect(tag?.nameSpan).toBeDefined();
  });

  it("should preserve the original tag name for unknown tags", () => {
    const raw = `*
 * @deprecated Use newThing instead
 `;
    const result = parseDocComment(raw, { start: 0, end: raw.length + 4 });
    expect(result.tags.at(0)?.tagName).toBe("deprecated");
  });

  it("should set tagName to param for @param tags", () => {
    const raw = `* @param x A number`;
    const result = parseDocComment(raw, { start: 3, end: 24 });
    expect(result.tags.at(0)?.tagName).toBe("param");
  });

  it("should set tagName to example for @example tags", () => {
    const raw = `*
 * @example
 * doThing()
 `;
    const result = parseDocComment(raw, { start: 0, end: raw.length + 4 });
    expect(result.tags.at(0)?.tagName).toBe("example");
  });
});
