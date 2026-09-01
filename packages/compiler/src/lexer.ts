import { TokenKind, keywordKind } from "./token.ts";
import type { Token } from "./token.ts";
import { DiagnosticCode, CompileError } from "./diagnostic.ts";
import type { Diagnostic } from "./diagnostic.ts";

export class LexerError extends Error {
  constructor(
    message: string,
    public offset: number,
    public code: DiagnosticCode = DiagnosticCode.UnexpectedCharacter,
  ) {
    super(message);
  }
}

export class Lexer {
  private source: string;
  private pos: number;
  private interpStack: number[];
  private diagnostics: Diagnostic[];

  constructor(source: string) {
    this.source = source;
    this.pos = 0;
    this.interpStack = [];
    this.diagnostics = [];
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];
    for (;;) {
      try {
        const tok = this.next();
        tokens.push(tok);
        if (tok.kind === TokenKind.Eof) {
          break;
        }
      } catch (e) {
        if (e instanceof LexerError) {
          this.diagnostics.push({
            code: e.code,
            severity: "error",
            message: e.message,
            span: { start: e.offset, end: Math.max(e.offset + 1, this.pos) },
          });
          if (this.pos <= e.offset) {
            this.pos = e.offset + 1;
          }
        } else {
          throw e;
        }
      }
    }
    if (this.diagnostics.length > 0) {
      throw new CompileError(this.diagnostics);
    }
    return tokens;
  }

  private next(): Token {
    const docToken = this.skipWhitespaceAndComments();
    if (docToken) {
      return docToken;
    }

    if (this.pos >= this.source.length) {
      return this.makeToken(TokenKind.Eof, this.pos, this.pos);
    }

    const ch = this.source.charAt(this.pos);

    if (ch === '"') {
      return this.scanString();
    }
    if (ch === "#") {
      return this.scanHash();
    }
    if (isDigit(ch)) {
      return this.scanNumber();
    }
    if (isIdentStart(ch)) {
      return this.scanIdentifierOrKeyword();
    }

    return this.scanPunctuation();
  }

  private skipWhitespaceAndComments(): Token | undefined {
    while (this.pos < this.source.length) {
      const ch = this.source.charAt(this.pos);

      if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
        this.pos++;
        continue;
      }

      if (ch === "/" && this.pos + 1 < this.source.length) {
        const next = this.source.charAt(this.pos + 1);
        if (next === "/") {
          this.skipLineComment();
          continue;
        }
        if (next === "*") {
          const doc = this.scanBlockComment();
          if (doc) {
            return this.makeToken(TokenKind.DocComment, doc.start, doc.end, doc.value);
          }
          continue;
        }
      }

      break;
    }
    return undefined;
  }

  private skipLineComment(): void {
    this.pos += 2;
    while (this.pos < this.source.length && this.source.charAt(this.pos) !== "\n") {
      this.pos++;
    }
  }

  private scanBlockComment(): { value: string; start: number; end: number } | undefined {
    const start = this.pos;
    const isDoc =
      this.pos + 2 < this.source.length &&
      this.source.charAt(this.pos + 2) === "*" &&
      (this.pos + 3 >= this.source.length || this.source.charAt(this.pos + 3) !== "/");
    this.pos += isDoc ? 3 : 2;
    const contentStart = this.pos;
    while (this.pos + 1 < this.source.length) {
      if (this.source.charAt(this.pos) === "*" && this.source.charAt(this.pos + 1) === "/") {
        const contentEnd = this.pos;
        this.pos += 2;
        if (isDoc) {
          const value = this.source.slice(contentStart, contentEnd);
          if (value.trim().length > 0) {
            return { value, start, end: this.pos };
          }
        }
        return undefined;
      }
      this.pos++;
    }
    throw new LexerError("unterminated block comment", start, DiagnosticCode.UnterminatedComment);
  }

  private scanString(): Token {
    return this.scanStringContent(true);
  }

  private scanStringContent(isStart: boolean): Token {
    const spanStart = isStart ? this.pos++ : this.pos;
    let value = "";

    while (this.pos < this.source.length) {
      const ch = this.source.charAt(this.pos);

      if (ch === '"') {
        this.pos++;
        const kind = isStart ? TokenKind.String : TokenKind.StringEnd;
        return this.makeToken(kind, spanStart, this.pos, value);
      }

      if (
        ch === "$" &&
        this.pos + 1 < this.source.length &&
        this.source.charAt(this.pos + 1) === "{"
      ) {
        this.pos += 2;
        this.interpStack.push(0);
        const kind = isStart ? TokenKind.StringStart : TokenKind.StringMiddle;
        return this.makeToken(kind, spanStart, this.pos, value);
      }

      if (ch === "\\") {
        value += this.scanEscape();
        continue;
      }

      value += ch;
      this.pos++;
    }

    throw new LexerError("unterminated string", spanStart, DiagnosticCode.UnterminatedString);
  }

  private scanEscape(): string {
    const start = this.pos;
    this.pos++;
    if (this.pos >= this.source.length) {
      throw new LexerError("unterminated escape sequence", start, DiagnosticCode.InvalidEscape);
    }
    const ch = this.source.charAt(this.pos);
    this.pos++;
    switch (ch) {
      case "\\":
        return "\\";
      case '"':
        return '"';
      case "n":
        return "\n";
      case "t":
        return "\t";
      case "r":
        return "\r";
      case "$":
        return "$";
      default:
        throw new LexerError(
          `invalid escape sequence: \\${ch}`,
          start,
          DiagnosticCode.InvalidEscape,
        );
    }
  }

  private scanHash(): Token {
    const start = this.pos;

    if (this.pos + 1 < this.source.length) {
      const next = this.source.charAt(this.pos + 1);

      if (next === '"' || next === "#") {
        return this.scanRawString();
      }
    }

    this.pos++;
    const wordStart = this.pos;
    while (this.pos < this.source.length && isIdentContinue(this.source.charAt(this.pos))) {
      this.pos++;
    }
    const word = this.source.slice(wordStart, this.pos);
    if (word === "index") {
      return this.makeToken(TokenKind.HashIndex, start, this.pos, "#index");
    }
    throw new LexerError(`unexpected token: #${word}`, start, DiagnosticCode.UnexpectedHashToken);
  }

  private scanRawString(): Token {
    const start = this.pos;
    let hashes = 0;
    while (this.pos < this.source.length && this.source.charAt(this.pos) === "#") {
      hashes++;
      this.pos++;
    }
    if (this.pos >= this.source.length || this.source.charAt(this.pos) !== '"') {
      throw new LexerError(
        "expected '\"' after '#' in raw string",
        start,
        DiagnosticCode.UnterminatedRawString,
      );
    }
    this.pos++;

    let value = "";

    while (this.pos < this.source.length) {
      if (this.source.charAt(this.pos) === '"') {
        let matched = 1;
        while (
          matched <= hashes &&
          this.pos + matched < this.source.length &&
          this.source.charAt(this.pos + matched) === "#"
        ) {
          matched++;
        }
        if (matched === hashes + 1) {
          this.pos += matched;
          return this.makeToken(TokenKind.RawString, start, this.pos, value);
        }
      }
      value += this.source.charAt(this.pos);
      this.pos++;
    }

    throw new LexerError("unterminated raw string", start, DiagnosticCode.UnterminatedRawString);
  }

  private scanNumber(): Token {
    const start = this.pos;

    while (this.pos < this.source.length && isDigit(this.source.charAt(this.pos))) {
      this.pos++;
    }

    if (
      this.pos < this.source.length &&
      this.source.charAt(this.pos) === "." &&
      this.pos + 1 < this.source.length &&
      isDigit(this.source.charAt(this.pos + 1))
    ) {
      this.pos++;
      while (this.pos < this.source.length && isDigit(this.source.charAt(this.pos))) {
        this.pos++;
      }
    }

    if (this.pos < this.source.length && isIdentStart(this.source.charAt(this.pos))) {
      while (this.pos < this.source.length && isIdentContinue(this.source.charAt(this.pos))) {
        this.pos++;
      }
      return this.makeToken(
        TokenKind.Quantity,
        start,
        this.pos,
        this.source.slice(start, this.pos),
      );
    }

    return this.makeToken(TokenKind.Number, start, this.pos, this.source.slice(start, this.pos));
  }

  private scanIdentifierOrKeyword(): Token {
    const start = this.pos;
    while (this.pos < this.source.length && isIdentContinue(this.source.charAt(this.pos))) {
      this.pos++;
    }
    const word = this.source.slice(start, this.pos);

    if (word === "_") {
      return this.makeToken(TokenKind.Underscore, start, this.pos);
    }

    const kw = keywordKind(word);
    if (kw !== undefined) {
      return this.makeToken(kw, start, this.pos);
    }

    return this.makeToken(TokenKind.Identifier, start, this.pos, word);
  }

  private scanPunctuation(): Token {
    const start = this.pos;
    const ch = this.source.charAt(this.pos);
    const next = this.pos + 1 < this.source.length ? this.source.charAt(this.pos + 1) : "";

    switch (ch) {
      case "(":
        this.pos++;
        return this.makeToken(TokenKind.LeftParen, start, this.pos);
      case ")":
        this.pos++;
        return this.makeToken(TokenKind.RightParen, start, this.pos);
      case "[":
        this.pos++;
        return this.makeToken(TokenKind.LeftBracket, start, this.pos);
      case "]":
        this.pos++;
        return this.makeToken(TokenKind.RightBracket, start, this.pos);
      case ";":
        this.pos++;
        return this.makeToken(TokenKind.Semicolon, start, this.pos);
      case ":":
        this.pos++;
        return this.makeToken(TokenKind.Colon, start, this.pos);
      case ",":
        this.pos++;
        return this.makeToken(TokenKind.Comma, start, this.pos);
      case "@":
        this.pos++;
        return this.makeToken(TokenKind.At, start, this.pos);
      case "+":
        this.pos++;
        return this.makeToken(TokenKind.Plus, start, this.pos);
      case "*":
        this.pos++;
        return this.makeToken(TokenKind.Star, start, this.pos);
      case "%":
        this.pos++;
        return this.makeToken(TokenKind.Percent, start, this.pos);

      case "{":
        this.pos++;
        if (this.interpStack.length > 0) {
          const i = this.interpStack.length - 1;
          this.interpStack[i] = (this.interpStack[i] ?? 0) + 1;
        }
        return this.makeToken(TokenKind.LeftBrace, start, this.pos);

      case "}":
        if (this.interpStack.length > 0 && this.interpStack[this.interpStack.length - 1] === 0) {
          this.interpStack.pop();
          this.pos++;
          return this.scanStringContent(false);
        }
        this.pos++;
        if (this.interpStack.length > 0) {
          const i = this.interpStack.length - 1;
          this.interpStack[i] = (this.interpStack[i] ?? 0) - 1;
        }
        return this.makeToken(TokenKind.RightBrace, start, this.pos);

      case ".":
        if (
          next === "." &&
          this.pos + 2 < this.source.length &&
          this.source.charAt(this.pos + 2) === "."
        ) {
          this.pos += 3;
          return this.makeToken(TokenKind.DotDotDot, start, this.pos);
        }
        this.pos++;
        return this.makeToken(TokenKind.Dot, start, this.pos);

      case "-":
        if (next === ">") {
          this.pos += 2;
          return this.makeToken(TokenKind.Arrow, start, this.pos);
        }
        this.pos++;
        return this.makeToken(TokenKind.Minus, start, this.pos);

      case "/":
        this.pos++;
        return this.makeToken(TokenKind.Slash, start, this.pos);

      case "=":
        if (next === "=") {
          this.pos += 2;
          return this.makeToken(TokenKind.EqualEqual, start, this.pos);
        }
        this.pos++;
        return this.makeToken(TokenKind.Equal, start, this.pos);

      case "!":
        if (next === "=") {
          this.pos += 2;
          return this.makeToken(TokenKind.BangEqual, start, this.pos);
        }
        if (this.source.slice(this.pos, this.pos + 9) === "!contains") {
          const afterWord = this.pos + 9;
          if (afterWord >= this.source.length || !isIdentContinue(this.source.charAt(afterWord))) {
            this.pos = afterWord;
            return this.makeToken(TokenKind.BangContains, start, this.pos);
          }
        }
        this.pos++;
        return this.makeToken(TokenKind.Bang, start, this.pos);

      case "<":
        if (next === "=") {
          this.pos += 2;
          return this.makeToken(TokenKind.LessEqual, start, this.pos);
        }
        this.pos++;
        return this.makeToken(TokenKind.Less, start, this.pos);

      case ">":
        if (next === "=") {
          this.pos += 2;
          return this.makeToken(TokenKind.GreaterEqual, start, this.pos);
        }
        this.pos++;
        return this.makeToken(TokenKind.Greater, start, this.pos);

      case "?":
        if (next === "?") {
          this.pos += 2;
          return this.makeToken(TokenKind.QuestionQuestion, start, this.pos);
        }
        if (next === ".") {
          this.pos += 2;
          return this.makeToken(TokenKind.QuestionDot, start, this.pos);
        }
        this.pos++;
        return this.makeToken(TokenKind.Question, start, this.pos);

      case "|":
        if (next === ">") {
          if (this.pos + 2 < this.source.length && this.source.charAt(this.pos + 2) === "?") {
            this.pos += 3;
            return this.makeToken(TokenKind.PipeQuestion, start, this.pos);
          }
          this.pos += 2;
          return this.makeToken(TokenKind.Pipe, start, this.pos);
        }
        if (next === "|") {
          this.pos += 2;
          return this.makeToken(TokenKind.PipePipe, start, this.pos);
        }
        throw new LexerError(`unexpected character: |`, start);

      case "&":
        if (next === "&") {
          this.pos += 2;
          return this.makeToken(TokenKind.AmpAmp, start, this.pos);
        }
        throw new LexerError(`unexpected character: &`, start);

      default:
        throw new LexerError(`unexpected character: ${ch}`, start);
    }
  }

  private makeToken(kind: TokenKind, start: number, end: number, value?: string): Token {
    const token: Token = { kind, span: { start, end } };
    if (value !== undefined) {
      token.value = value;
    }
    return token;
  }
}

function isDigit(ch: string): boolean {
  return ch >= "0" && ch <= "9";
}

function isIdentStart(ch: string): boolean {
  return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || ch === "_";
}

function isIdentContinue(ch: string): boolean {
  return isIdentStart(ch) || isDigit(ch);
}
