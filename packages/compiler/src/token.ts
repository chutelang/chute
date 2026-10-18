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

  // Doc comments
  DocComment,

  // Keywords
  Action,
  As,
  Case,
  Const,
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
  Record,
  Repeat,
  Return,
  Shortcut,
  True,

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
  AmpAmp,
  PipePipe,
  Bang,

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
  ["as", TokenKind.As],
  ["case", TokenKind.Case],
  ["const", TokenKind.Const],
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
  ["record", TokenKind.Record],
  ["repeat", TokenKind.Repeat],
  ["return", TokenKind.Return],
  ["shortcut", TokenKind.Shortcut],
  ["true", TokenKind.True],
]);

export function keywordKind(word: string): TokenKind | undefined {
  return KEYWORDS.get(word);
}
export function isKeyword(kind: TokenKind): boolean {
  return kind >= TokenKind.Action && kind <= TokenKind.True;
}

const KEYWORD_TEXTS: ReadonlyMap<TokenKind, string> = new Map(
  [...KEYWORDS].map(([text, kind]) => [kind, text]),
);

export function keywordText(kind: TokenKind): string {
  return KEYWORD_TEXTS.get(kind) ?? (TokenKind[kind] ?? "unknown").toLowerCase();
}

export function tokenKindName(kind: TokenKind): string {
  const names: Record<number, string> = {
    [TokenKind.Number]: "number",
    [TokenKind.Quantity]: "quantity",
    [TokenKind.String]: "string",
    [TokenKind.StringStart]: "string",
    [TokenKind.StringMiddle]: "string",
    [TokenKind.StringEnd]: "string",
    [TokenKind.RawString]: "raw string",
    [TokenKind.Identifier]: "identifier",
    [TokenKind.HashIndex]: "#index",
    [TokenKind.Underscore]: "_",
    [TokenKind.LeftParen]: "'('",
    [TokenKind.RightParen]: "')'",
    [TokenKind.LeftBrace]: "'{'",
    [TokenKind.RightBrace]: "'}'",
    [TokenKind.LeftBracket]: "'['",
    [TokenKind.RightBracket]: "']'",
    [TokenKind.Semicolon]: "';'",
    [TokenKind.Colon]: "':'",
    [TokenKind.Comma]: "','",
    [TokenKind.Dot]: "'.'",
    [TokenKind.At]: "'@'",
    [TokenKind.Plus]: "'+'",
    [TokenKind.Minus]: "'-'",
    [TokenKind.Star]: "'*'",
    [TokenKind.Slash]: "'/'",
    [TokenKind.Percent]: "'%'",
    [TokenKind.Equal]: "'='",
    [TokenKind.EqualEqual]: "'=='",
    [TokenKind.BangEqual]: "'!='",
    [TokenKind.Less]: "'<'",
    [TokenKind.LessEqual]: "'<='",
    [TokenKind.Greater]: "'>'",
    [TokenKind.GreaterEqual]: "'>='",
    [TokenKind.Question]: "'?'",
    [TokenKind.QuestionQuestion]: "'??'",
    [TokenKind.QuestionDot]: "'?.'",
    [TokenKind.Pipe]: "'|>'",
    [TokenKind.PipeQuestion]: "'|>?'",
    [TokenKind.Arrow]: "'->'",
    [TokenKind.DotDotDot]: "'...'",
    [TokenKind.BangContains]: "'!contains'",
    [TokenKind.AmpAmp]: "'&&'",
    [TokenKind.PipePipe]: "'||'",
    [TokenKind.Bang]: "'!'",
    [TokenKind.Eof]: "end of file",
  };
  return names[kind] ?? `keyword '${(TokenKind[kind] ?? "unknown").toLowerCase()}'`;
}
