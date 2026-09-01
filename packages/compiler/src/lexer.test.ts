import { describe, expect, it } from "vitest";
import { Lexer } from "./lexer.ts";
import { CompileError, DiagnosticCode } from "./diagnostic.ts";
import { TokenKind } from "./token.ts";
import type { Token } from "./token.ts";

function expectDiagnosticCode(fn: () => unknown, code: DiagnosticCode): void {
  try {
    fn();
    expect.unreachable("expected CompileError to be thrown");
  } catch (e) {
    expect(e).toBeInstanceOf(CompileError);
    const err = e as CompileError;
    expect(err.diagnostics.some((d) => d.code === code)).toBe(true);
  }
}

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
      expectDiagnosticCode(() => kinds("/* oops"), DiagnosticCode.UnterminatedComment);
    });
  });

  describe("keywords", () => {
    it("should recognize all keywords", () => {
      const kws = [
        "action",
        "as",
        "case",
        "const",
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
        "record",
        "repeat",
        "return",
        "shortcut",
        "true",
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

    it("should treat and/or/not as identifiers", () => {
      for (const word of ["and", "or", "not", "var"]) {
        expect(kinds(word)).toEqual([TokenKind.Identifier, TokenKind.Eof]);
        expect(values(word)).toEqual([word]);
      }
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
      expectDiagnosticCode(() => tokens('"oops'), DiagnosticCode.UnterminatedString);
    });

    it("should error on invalid escape", () => {
      expectDiagnosticCode(() => tokens('"\\q"'), DiagnosticCode.InvalidEscape);
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
      expectDiagnosticCode(() => tokens('#"oops'), DiagnosticCode.UnterminatedRawString);
    });
  });

  describe("#index", () => {
    it("should tokenize #index", () => {
      expect(kinds("#index")).toEqual([TokenKind.HashIndex, TokenKind.Eof]);
    });

    it("should error on unknown # token", () => {
      expectDiagnosticCode(() => kinds("#foo"), DiagnosticCode.UnexpectedHashToken);
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
      expect(kinds("== != <= >= ?? ?. |> |>? -> ... && ||")).toEqual([
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
        TokenKind.AmpAmp,
        TokenKind.PipePipe,
        TokenKind.Eof,
      ]);
    });

    it("should tokenize !contains as a single token", () => {
      expect(kinds("!contains")).toEqual([TokenKind.BangContains, TokenKind.Eof]);
    });

    it("should not match !containsX as !contains", () => {
      expect(kinds("!containsX")).toEqual([TokenKind.Bang, TokenKind.Identifier, TokenKind.Eof]);
    });

    it("should tokenize standalone ! as Bang", () => {
      expect(kinds("!")).toEqual([TokenKind.Bang, TokenKind.Eof]);
    });

    it("should tokenize !x as Bang followed by identifier", () => {
      expect(kinds("!x")).toEqual([TokenKind.Bang, TokenKind.Identifier, TokenKind.Eof]);
    });

    it("should tokenize && as AmpAmp", () => {
      expect(kinds("&&")).toEqual([TokenKind.AmpAmp, TokenKind.Eof]);
    });

    it("should tokenize || as PipePipe", () => {
      expect(kinds("||")).toEqual([TokenKind.PipePipe, TokenKind.Eof]);
    });

    it("should error on standalone &", () => {
      expectDiagnosticCode(() => kinds("&"), DiagnosticCode.UnexpectedCharacter);
    });

    it("should error on standalone |", () => {
      expectDiagnosticCode(() => kinds("|"), DiagnosticCode.UnexpectedCharacter);
    });
  });

  describe("spans", () => {
    it("should track byte offsets", () => {
      const toks = tokens("ab cd");
      expect(toks.at(0)?.span).toEqual({ start: 0, end: 2 });
      expect(toks.at(1)?.span).toEqual({ start: 3, end: 5 });
    });
  });

  describe("multi-error collection", () => {
    it("should collect multiple errors from a single source", () => {
      try {
        kinds("~ ^");
        expect.unreachable("expected CompileError to be thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(CompileError);
        const err = e as CompileError;
        expect(err.diagnostics).toHaveLength(2);
        expect(err.diagnostics[0]?.code).toBe(DiagnosticCode.UnexpectedCharacter);
        expect(err.diagnostics[1]?.code).toBe(DiagnosticCode.UnexpectedCharacter);
      }
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
