import { describe, expect, it } from "vitest";
import { extractComments } from "./comment.ts";

describe("extractComments", () => {
  it("should return empty array for source with no comments", () => {
    expect(extractComments("let x = 1;")).toEqual([]);
  });

  it("should extract a line comment", () => {
    const comments = extractComments("// hello");
    expect(comments).toEqual([
      {
        text: " hello",
        span: { start: 0, end: 8 },
        isBlock: false,
        isDoc: false,
      },
    ]);
  });

  it("should extract a block comment", () => {
    const comments = extractComments("/* hello */");
    expect(comments).toEqual([
      {
        text: " hello ",
        span: { start: 0, end: 11 },
        isBlock: true,
        isDoc: false,
      },
    ]);
  });

  it("should extract multiple comments", () => {
    const source = `// first
let x = 1; // second
/* third */`;
    const comments = extractComments(source);
    expect(comments).toHaveLength(3);
    expect(comments[0]?.text).toBe(" first");
    expect(comments[0]?.isBlock).toBe(false);
    expect(comments[1]?.text).toBe(" second");
    expect(comments[1]?.isBlock).toBe(false);
    expect(comments[2]?.text).toBe(" third ");
    expect(comments[2]?.isBlock).toBe(true);
  });

  it("should not extract comment-like content inside strings", () => {
    const comments = extractComments(`let x = "// not a comment";`);
    expect(comments).toEqual([]);
  });

  it("should not extract comment-like content inside block strings", () => {
    const comments = extractComments(`let x = "/* not a comment */";`);
    expect(comments).toEqual([]);
  });

  it("should not extract comment-like content inside interpolated strings", () => {
    const comments = extractComments(`let x = "before \${y // nope} after";`);
    expect(comments).toEqual([]);
  });

  it("should not extract comment-like content inside raw strings", () => {
    const comments = extractComments(`let x = #"// not a comment"#;`);
    expect(comments).toEqual([]);
  });

  it("should not extract comment-like content inside multi-hash raw strings", () => {
    const comments = extractComments(`let x = ##"// not "# a comment"##;`);
    expect(comments).toEqual([]);
  });

  it("should extract comment after a string", () => {
    const source = `let x = "hello"; // comment`;
    const comments = extractComments(source);
    expect(comments).toHaveLength(1);
    expect(comments[0]?.text).toBe(" comment");
  });

  it("should handle multiline block comments", () => {
    const source = `/* line 1
line 2
line 3 */`;
    const comments = extractComments(source);
    expect(comments).toHaveLength(1);
    expect(comments[0]?.text).toBe(` line 1\nline 2\nline 3 `);
    expect(comments[0]?.isBlock).toBe(true);
  });

  it("should mark a doc comment as isDoc", () => {
    const comments = extractComments("/** hello */");
    expect(comments[0]?.isDoc).toBe(true);
  });

  it("should not mark a regular block comment as isDoc", () => {
    const comments = extractComments("/* hello */");
    expect(comments[0]?.isDoc).toBe(false);
  });

  it("should not mark an empty doc-style comment as isDoc", () => {
    const comments = extractComments("/** */");
    expect(comments[0]?.isDoc).toBe(false);
  });

  it("should not mark a line comment as isDoc", () => {
    const comments = extractComments("// hello");
    expect(comments[0]?.isDoc).toBe(false);
  });

  it("should track correct spans", () => {
    const source = `let x = 1; // trailing`;
    const comments = extractComments(source);
    expect(comments).toHaveLength(1);
    expect(comments[0]?.span.start).toBe(11);
    expect(comments[0]?.span.end).toBe(22);
    expect(source.slice(comments[0]?.span.start, comments[0]?.span.end)).toBe("// trailing");
  });
});
