import { describe, expect, it } from "vitest";
import { Lexer, LexerError } from "./lexer.ts";
import { TokenKind } from "./token.ts";
import type { Token } from "./token.ts";

function kinds(source: string): TokenKind[] {
  return new Lexer(source).tokenize().map((t) => t.kind);
}

function values(source: string): Array<string | undefined> {
  return new Lexer(source)
    .tokenize()
    .filter((t) => t.kind !== TokenKind.Eof)
    .map((t) => t.value);
}

function tokens(source: string): Token[] {
  return new Lexer(source).tokenize();
}

describe("Lexer", () => {
  describe("whitespace and comments", () => {
    it("should skip whitespace", () => {
      expect(kinds("  \t\n\r  ")).toEqual([TokenKind.Eof]);
    });

    it("should skip line comments", () => {
      expect(kinds("// comment\n42")).toEqual([TokenKind.Number, TokenKind.Eof]);
    });

    it("should skip block comments", () => {
      expect(kinds("/* comment */42")).toEqual([TokenKind.Number, TokenKind.Eof]);
    });

    it("should error on unterminated block comment", () => {
      expect(() => kinds("/* oops")).toThrow(LexerError);
    });
  });

  describe("keywords", () => {
    it("should recognize all keywords", () => {
      const kws = [
        "action",
        "and",
        "as",
        "case",
        "contains",
        "else",
        "enum",
        "export",
        "false",
        "for",
        "func",
        "hasPrefix",
        "hasSuffix",
        "if",
        "import",
        "in",
        "input",
        "is",
        "let",
        "menu",
        "nil",
        "not",
        "or",
        "record",
        "repeat",
        "return",
        "shortcut",
        "true",
        "var",
      ];
      for (const kw of kws) {
        const toks = tokens(kw);
        expect(toks.at(0)?.kind).not.toBe(TokenKind.Identifier);
        expect(toks.at(0)?.kind).not.toBe(TokenKind.Eof);
      }
    });

    it("should not match keyword prefixes as keywords", () => {
      expect(kinds("actions")).toEqual([TokenKind.Identifier, TokenKind.Eof]);
      expect(values("actions")).toEqual(["actions"]);
    });
  });

  describe("identifiers", () => {
    it("should tokenize simple identifiers", () => {
      expect(kinds("foo")).toEqual([TokenKind.Identifier, TokenKind.Eof]);
      expect(values("foo")).toEqual(["foo"]);
    });

    it("should tokenize identifiers starting with underscore", () => {
      expect(kinds("_foo")).toEqual([TokenKind.Identifier, TokenKind.Eof]);
    });

    it("should treat lone underscore as Underscore token", () => {
      expect(kinds("_")).toEqual([TokenKind.Underscore, TokenKind.Eof]);
    });
  });

  describe("numbers", () => {
    it("should tokenize integers", () => {
      expect(values("42")).toEqual(["42"]);
    });

    it("should tokenize decimals", () => {
      expect(values("3.14")).toEqual(["3.14"]);
    });

    it("should not consume dot without following digit", () => {
      expect(kinds("1.foo")).toEqual([
        TokenKind.Number,
        TokenKind.Dot,
        TokenKind.Identifier,
        TokenKind.Eof,
      ]);
    });

    it("should tokenize 1...5 as number, dotdotdot, number", () => {
      expect(kinds("1...5")).toEqual([
        TokenKind.Number,
        TokenKind.DotDotDot,
        TokenKind.Number,
        TokenKind.Eof,
      ]);
    });
  });

  describe("quantities", () => {
    it("should tokenize number with unit suffix", () => {
      expect(kinds("5min")).toEqual([TokenKind.Quantity, TokenKind.Eof]);
      expect(values("5min")).toEqual(["5min"]);
    });

    it("should tokenize decimal quantity", () => {
      expect(values("1.5hr")).toEqual(["1.5hr"]);
    });

    it("should not form quantity with space", () => {
      expect(kinds("5 min")).toEqual([TokenKind.Number, TokenKind.Identifier, TokenKind.Eof]);
    });
  });

  describe("strings", () => {
    it("should tokenize simple strings", () => {
      const toks = tokens('"hello"');
      expect(toks.at(0)?.kind).toBe(TokenKind.String);
      expect(toks.at(0)?.value).toBe("hello");
    });

    it("should handle escape sequences", () => {
      expect(tokens('"a\\nb"').at(0)?.value).toBe("a\nb");
      expect(tokens('"a\\tb"').at(0)?.value).toBe("a\tb");
      expect(tokens('"a\\rb"').at(0)?.value).toBe("a\rb");
      expect(tokens('"a\\\\"').at(0)?.value).toBe("a\\");
      expect(tokens('"a\\""').at(0)?.value).toBe('a"');
      expect(tokens('"a\\$"').at(0)?.value).toBe("a$");
    });

    it("should treat $ not followed by { as plain character", () => {
      expect(tokens('"$a"').at(0)?.value).toBe("$a");
    });

    it("should error on unterminated string", () => {
      expect(() => tokens('"oops')).toThrow(LexerError);
    });

    it("should error on invalid escape", () => {
      expect(() => tokens('"\\q"')).toThrow(LexerError);
    });
  });

  describe("string interpolation", () => {
    it("should tokenize string with interpolation", () => {
      expect(kinds('"hello ${name}"')).toEqual([
        TokenKind.StringStart,
        TokenKind.Identifier,
        TokenKind.StringEnd,
        TokenKind.Eof,
      ]);
    });

    it("should preserve string segment values", () => {
      const toks = tokens('"hello ${name} world"');
      expect(toks.at(0)?.kind).toBe(TokenKind.StringStart);
      expect(toks.at(0)?.value).toBe("hello ");
      expect(toks.at(1)?.kind).toBe(TokenKind.Identifier);
      expect(toks.at(2)?.kind).toBe(TokenKind.StringEnd);
      expect(toks.at(2)?.value).toBe(" world");
    });

    it("should handle multiple interpolations", () => {
      expect(kinds('"${a} and ${b}"')).toEqual([
        TokenKind.StringStart,
        TokenKind.Identifier,
        TokenKind.StringMiddle,
        TokenKind.Identifier,
        TokenKind.StringEnd,
        TokenKind.Eof,
      ]);
    });

    it("should handle nested braces in interpolation", () => {
      expect(kinds('"${f({:})}"')).toEqual([
        TokenKind.StringStart,
        TokenKind.Identifier,
        TokenKind.LeftParen,
        TokenKind.LeftBrace,
        TokenKind.Colon,
        TokenKind.RightBrace,
        TokenKind.RightParen,
        TokenKind.StringEnd,
        TokenKind.Eof,
      ]);
    });
  });

  describe("raw strings", () => {
    it("should tokenize raw strings", () => {
      const toks = tokens('#"hello"#');
      expect(toks.at(0)?.kind).toBe(TokenKind.RawString);
      expect(toks.at(0)?.value).toBe("hello");
    });

    it("should tokenize raw strings with multiple hashes", () => {
      const toks = tokens('##"has "# inside"##');
      expect(toks.at(0)?.kind).toBe(TokenKind.RawString);
      expect(toks.at(0)?.value).toBe('has "# inside');
    });

    it("should error on unterminated raw string", () => {
      expect(() => tokens('#"oops')).toThrow(LexerError);
    });
  });

  describe("#index", () => {
    it("should tokenize #index", () => {
      expect(kinds("#index")).toEqual([TokenKind.HashIndex, TokenKind.Eof]);
    });

    it("should error on unknown # token", () => {
      expect(() => kinds("#foo")).toThrow(LexerError);
    });
  });

  describe("operators and punctuation", () => {
    it("should tokenize single-char operators", () => {
      expect(kinds("( ) { } [ ] ; : , . @ + - * / % = < > ?")).toEqual([
        TokenKind.LeftParen,
        TokenKind.RightParen,
        TokenKind.LeftBrace,
        TokenKind.RightBrace,
        TokenKind.LeftBracket,
        TokenKind.RightBracket,
        TokenKind.Semicolon,
        TokenKind.Colon,
        TokenKind.Comma,
        TokenKind.Dot,
        TokenKind.At,
        TokenKind.Plus,
        TokenKind.Minus,
        TokenKind.Star,
        TokenKind.Slash,
        TokenKind.Percent,
        TokenKind.Equal,
        TokenKind.Less,
        TokenKind.Greater,
        TokenKind.Question,
        TokenKind.Eof,
      ]);
    });

    it("should tokenize multi-char operators", () => {
      expect(kinds("== != <= >= ?? ?. |> |>? -> ...")).toEqual([
        TokenKind.EqualEqual,
        TokenKind.BangEqual,
        TokenKind.LessEqual,
        TokenKind.GreaterEqual,
        TokenKind.QuestionQuestion,
        TokenKind.QuestionDot,
        TokenKind.Pipe,
        TokenKind.PipeQuestion,
        TokenKind.Arrow,
        TokenKind.DotDotDot,
        TokenKind.Eof,
      ]);
    });

    it("should tokenize !contains as a single token", () => {
      expect(kinds("!contains")).toEqual([TokenKind.BangContains, TokenKind.Eof]);
    });

    it("should not match !containsX as !contains", () => {
      expect(() => kinds("!containsX")).toThrow(LexerError);
    });
  });

  describe("spans", () => {
    it("should track byte offsets", () => {
      const toks = tokens("ab cd");
      expect(toks.at(0)?.span).toEqual({ start: 0, end: 2 });
      expect(toks.at(1)?.span).toEqual({ start: 3, end: 5 });
    });
  });

  describe("full programs", () => {
    it("should tokenize hello world shortcut", () => {
      const source = `shortcut {
  name: "Hello World",
}

showAlert(text: "Hello from Chute!");`;

      const toks = tokens(source).filter((t) => t.kind !== TokenKind.Eof);
      const expected = [
        TokenKind.Shortcut,
        TokenKind.LeftBrace,
        TokenKind.Identifier,
        TokenKind.Colon,
        TokenKind.String,
        TokenKind.Comma,
        TokenKind.RightBrace,
        TokenKind.Identifier,
        TokenKind.LeftParen,
        TokenKind.Identifier,
        TokenKind.Colon,
        TokenKind.String,
        TokenKind.RightParen,
        TokenKind.Semicolon,
      ];
      expect(toks.map((t) => t.kind)).toEqual(expected);
    });
  });
});
