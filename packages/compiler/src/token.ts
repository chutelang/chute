export interface Span {
  start: number;
  end: number;
}

export enum TokenKind {
  // Literals
  Number,
  Quantity,
  String,
  StringStart,
  StringMiddle,
  StringEnd,
  RawString,

  // Identifiers and special
  Identifier,
  HashIndex,
  Underscore,

  // Keywords
  Action,
  And,
  As,
  Case,
  Contains,
  Else,
  Enum,
  Export,
  False,
  For,
  Func,
  HasPrefix,
  HasSuffix,
  If,
  Import,
  In,
  Input,
  Is,
  Let,
  Menu,
  Nil,
  Not,
  Or,
  Record,
  Repeat,
  Return,
  Shortcut,
  True,
  Var,

  // Delimiters
  LeftParen,
  RightParen,
  LeftBrace,
  RightBrace,
  LeftBracket,
  RightBracket,

  // Punctuation
  Semicolon,
  Colon,
  Comma,
  Dot,
  At,

  // Operators
  Plus,
  Minus,
  Star,
  Slash,
  Percent,
  Equal,
  EqualEqual,
  BangEqual,
  Less,
  LessEqual,
  Greater,
  GreaterEqual,
  Question,
  QuestionQuestion,
  QuestionDot,
  Pipe,
  PipeQuestion,
  Arrow,
  DotDotDot,
  BangContains,

  // End of file
  Eof,
}

export interface Token {
  kind: TokenKind;
  span: Span;
  value?: string | undefined;
}

const KEYWORDS: ReadonlyMap<string, TokenKind> = new Map([
  ["action", TokenKind.Action],
  ["and", TokenKind.And],
  ["as", TokenKind.As],
  ["case", TokenKind.Case],
  ["contains", TokenKind.Contains],
  ["else", TokenKind.Else],
  ["enum", TokenKind.Enum],
  ["export", TokenKind.Export],
  ["false", TokenKind.False],
  ["for", TokenKind.For],
  ["func", TokenKind.Func],
  ["hasPrefix", TokenKind.HasPrefix],
  ["hasSuffix", TokenKind.HasSuffix],
  ["if", TokenKind.If],
  ["import", TokenKind.Import],
  ["in", TokenKind.In],
  ["input", TokenKind.Input],
  ["is", TokenKind.Is],
  ["let", TokenKind.Let],
  ["menu", TokenKind.Menu],
  ["nil", TokenKind.Nil],
  ["not", TokenKind.Not],
  ["or", TokenKind.Or],
  ["record", TokenKind.Record],
  ["repeat", TokenKind.Repeat],
  ["return", TokenKind.Return],
  ["shortcut", TokenKind.Shortcut],
  ["true", TokenKind.True],
  ["var", TokenKind.Var],
]);

export function keywordKind(word: string): TokenKind | undefined {
  return KEYWORDS.get(word);
}
