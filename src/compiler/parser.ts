import { TokenKind } from "./token.ts";
import type { Token, Span } from "./token.ts";
import type {
  Argument,
  Assignment,
  BaseType,
  BinaryExpression,
  BinaryOperator,
  CallExpression,
  DictionaryEntry,
  DictionaryLiteral,
  Expression,
  InterpolatedPart,
  InterpolatedString,
  LetDeclaration,
  ListLiteral,
  ListType,
  MemberExpression,
  MetadataField,
  MetadataValue,
  OptionalMemberExpression,
  Place,
  PlaceAccessor,
  Program,
  QuantityType,
  ShortcutMetadata,
  Statement,
  SubscriptExpression,
  TypeAnnotation,
  VarDeclaration,
} from "./ast.ts";

export class ParseError extends Error {
  constructor(
    message: string,
    public span: Span,
  ) {
    super(message);
  }
}

export class Parser {
  private tokens: Token[];
  private pos: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.pos = 0;
  }

  parse(): Program {
    const start = this.peek().span.start;
    let metadata: ShortcutMetadata | undefined;

    if (this.check(TokenKind.Shortcut)) {
      metadata = this.parseShortcutMetadata();
    }

    const body: Statement[] = [];
    while (!this.check(TokenKind.Eof)) {
      body.push(this.parseStatement());
    }

    return {
      kind: "Program",
      span: { start, end: this.peek().span.end },
      metadata,
      body,
    };
  }

  private parseShortcutMetadata(): ShortcutMetadata {
    const start = this.expect(TokenKind.Shortcut).span.start;
    this.expect(TokenKind.LeftBrace);

    const fields: MetadataField[] = [];
    while (!this.check(TokenKind.RightBrace)) {
      fields.push(this.parseMetadataField());
      if (!this.check(TokenKind.RightBrace)) {
        this.expect(TokenKind.Comma);
      }
    }

    const end = this.expect(TokenKind.RightBrace).span.end;
    return { kind: "ShortcutMetadata", span: { start, end }, fields };
  }

  private parseMetadataField(): MetadataField {
    const name = this.expect(TokenKind.Identifier);
    this.expect(TokenKind.Colon);
    const value = this.parseMetadataValue();
    return {
      kind: "MetadataField",
      span: { start: name.span.start, end: value.span.end },
      name: tokenValue(name),
      value,
    };
  }

  private parseMetadataValue(): MetadataValue {
    const tok = this.peek();

    if (tok.kind === TokenKind.String || tok.kind === TokenKind.RawString) {
      this.advance();
      return { kind: "MetadataString", span: tok.span, value: tokenValue(tok) };
    }

    if (tok.kind === TokenKind.Minus) {
      this.advance();
      const num = this.expect(TokenKind.Number);
      return {
        kind: "MetadataNumber",
        span: { start: tok.span.start, end: num.span.end },
        value: -Number(tokenValue(num)),
        negative: true,
      };
    }

    if (tok.kind === TokenKind.Number || tok.kind === TokenKind.Quantity) {
      this.advance();
      return {
        kind: "MetadataNumber",
        span: tok.span,
        value: Number(tokenValue(tok)),
        negative: false,
      };
    }

    if (tok.kind === TokenKind.True || tok.kind === TokenKind.False) {
      this.advance();
      return {
        kind: "MetadataBoolean",
        span: tok.span,
        value: tok.kind === TokenKind.True,
      };
    }

    if (tok.kind === TokenKind.Nil) {
      this.advance();
      return { kind: "MetadataNil", span: tok.span };
    }

    if (tok.kind === TokenKind.LeftBracket) {
      return this.parseMetadataList();
    }

    if (tok.kind === TokenKind.Dot) {
      return this.parseMetadataDotName();
    }

    throw this.error(`expected metadata value, got ${tokenKindName(tok.kind)}`, tok.span);
  }

  private parseMetadataList(): MetadataValue {
    const start = this.expect(TokenKind.LeftBracket).span.start;
    const elements: MetadataValue[] = [];

    while (!this.check(TokenKind.RightBracket)) {
      elements.push(this.parseMetadataValue());
      if (!this.check(TokenKind.RightBracket)) {
        this.expect(TokenKind.Comma);
      }
    }

    const end = this.expect(TokenKind.RightBracket).span.end;
    return { kind: "MetadataList", span: { start, end }, elements };
  }

  private parseMetadataDotName(): MetadataValue {
    const start = this.expect(TokenKind.Dot).span.start;
    const name = this.expect(TokenKind.Identifier);

    let args: MetadataValue[] | undefined;
    let end = name.span.end;

    if (this.check(TokenKind.LeftParen)) {
      this.advance();
      args = [];
      while (!this.check(TokenKind.RightParen)) {
        args.push(this.parseMetadataValue());
        if (!this.check(TokenKind.RightParen)) {
          this.expect(TokenKind.Comma);
        }
      }
      end = this.expect(TokenKind.RightParen).span.end;
    }

    return {
      kind: "MetadataDotName",
      span: { start, end },
      name: tokenValue(name),
      args,
    };
  }

  private parseStatement(): Statement {
    if (this.check(TokenKind.Let)) {
      return this.parseLetDeclaration();
    }
    if (this.check(TokenKind.Var)) {
      return this.parseVarDeclaration();
    }

    const expr = this.parseExpression();

    if (this.check(TokenKind.Equal)) {
      return this.parseAssignment(expr);
    }

    const end = this.expect(TokenKind.Semicolon).span.end;
    return {
      kind: "ExpressionStatement",
      span: { start: expr.span.start, end },
      expression: expr,
    };
  }

  private parseAssignment(target: Expression): Assignment {
    this.expect(TokenKind.Equal);
    const value = this.parseExpression();
    const end = this.expect(TokenKind.Semicolon).span.end;
    return {
      kind: "Assignment",
      span: { start: target.span.start, end },
      place: exprToPlace(target),
      value,
    };
  }

  private parseLetDeclaration(): LetDeclaration {
    const start = this.expect(TokenKind.Let).span.start;
    const name = this.expect(TokenKind.Identifier);
    const typeAnnotation = this.check(TokenKind.Colon)
      ? this.parseTypeAnnotationWithColon()
      : undefined;
    this.expect(TokenKind.Equal);
    const initializer = this.parseExpression();
    const end = this.expect(TokenKind.Semicolon).span.end;
    return {
      kind: "LetDeclaration",
      span: { start, end },
      name: tokenValue(name),
      typeAnnotation,
      initializer,
    };
  }

  private parseVarDeclaration(): VarDeclaration {
    const start = this.expect(TokenKind.Var).span.start;
    const name = this.expect(TokenKind.Identifier);
    const typeAnnotation = this.check(TokenKind.Colon)
      ? this.parseTypeAnnotationWithColon()
      : undefined;
    this.expect(TokenKind.Equal);
    const initializer = this.parseExpression();
    const end = this.expect(TokenKind.Semicolon).span.end;
    return {
      kind: "VarDeclaration",
      span: { start, end },
      name: tokenValue(name),
      typeAnnotation,
      initializer,
    };
  }

  private parseTypeAnnotationWithColon(): TypeAnnotation {
    this.expect(TokenKind.Colon);
    return this.parseTypeAnnotation();
  }

  private parseTypeAnnotation(): TypeAnnotation {
    const base = this.parseBaseType();
    let optional = false;
    let end = base.span.end;

    if (this.check(TokenKind.Question)) {
      optional = true;
      end = this.advance().span.end;
    }

    return {
      kind: "TypeAnnotation",
      span: { start: base.span.start, end },
      base,
      optional,
    };
  }

  private parseBaseType(): BaseType {
    const tok = this.peek();

    if (tok.kind === TokenKind.Identifier) {
      const name = tokenValue(tok);

      if (name === "List") {
        return this.parseListType();
      }

      if (name === "Quantity") {
        return this.parseQuantityType();
      }

      this.advance();
      if (this.check(TokenKind.Dot)) {
        this.advance();
        const nameTok = this.expect(TokenKind.Identifier);
        return {
          kind: "NamedType",
          span: { start: tok.span.start, end: nameTok.span.end },
          qualifier: name,
          name: tokenValue(nameTok),
        };
      }

      return {
        kind: "NamedType",
        span: tok.span,
        qualifier: undefined,
        name,
      };
    }

    throw this.error(`expected type, got ${tokenKindName(tok.kind)}`, tok.span);
  }

  private parseListType(): ListType {
    const start = this.advance().span.start;
    this.expect(TokenKind.Less);
    const elementType = this.parseTypeAnnotation();
    const end = this.expect(TokenKind.Greater).span.end;
    return {
      kind: "ListType",
      span: { start, end },
      elementType,
    };
  }

  private parseQuantityType(): QuantityType {
    const start = this.advance().span.start;
    this.expect(TokenKind.Less);
    const unit = this.expect(TokenKind.Identifier);
    const end = this.expect(TokenKind.Greater).span.end;
    return {
      kind: "QuantityType",
      span: { start, end },
      unit: tokenValue(unit),
    };
  }

  private parseExpression(): Expression {
    return this.parseCoalesce();
  }

  private parseCoalesce(): Expression {
    let left = this.parseAdditive();
    while (this.check(TokenKind.QuestionQuestion)) {
      this.advance();
      const right = this.parseAdditive();
      left = {
        kind: "CoalesceExpression",
        span: { start: left.span.start, end: right.span.end },
        left,
        right,
      };
    }
    return left;
  }

  private parseAdditive(): Expression {
    let left = this.parseMultiplicative();
    while (this.check(TokenKind.Plus) || this.check(TokenKind.Minus)) {
      const op = this.advance();
      const operator: BinaryOperator = op.kind === TokenKind.Plus ? "+" : "-";
      const right = this.parseMultiplicative();
      left = {
        kind: "BinaryExpression",
        span: { start: left.span.start, end: right.span.end },
        operator,
        left,
        right,
      } satisfies BinaryExpression;
    }
    return left;
  }

  private parseMultiplicative(): Expression {
    let left = this.parseUnary();
    while (
      this.check(TokenKind.Star) ||
      this.check(TokenKind.Slash) ||
      this.check(TokenKind.Percent)
    ) {
      const op = this.advance();
      const operator: BinaryOperator =
        op.kind === TokenKind.Star ? "*" : op.kind === TokenKind.Slash ? "/" : "%";
      const right = this.parseUnary();
      left = {
        kind: "BinaryExpression",
        span: { start: left.span.start, end: right.span.end },
        operator,
        left,
        right,
      } satisfies BinaryExpression;
    }
    return left;
  }

  private parseUnary(): Expression {
    if (this.check(TokenKind.Minus)) {
      const op = this.advance();
      const operand = this.parsePostfix();
      return {
        kind: "UnaryExpression",
        span: { start: op.span.start, end: operand.span.end },
        operator: "-",
        operand,
      };
    }
    return this.parsePostfix();
  }

  private parsePostfix(): Expression {
    let expr = this.parsePrimary();

    for (;;) {
      if (this.check(TokenKind.LeftParen)) {
        expr = this.parseCallArguments(expr);
      } else if (this.check(TokenKind.Dot)) {
        expr = this.parseMemberAccess(expr);
      } else if (this.check(TokenKind.QuestionDot)) {
        expr = this.parseOptionalMemberAccess(expr);
      } else if (this.check(TokenKind.LeftBracket)) {
        expr = this.parseSubscript(expr);
      } else {
        break;
      }
    }

    return expr;
  }

  private parseOptionalMemberAccess(object: Expression): OptionalMemberExpression {
    this.advance();
    const prop = this.expect(TokenKind.Identifier);
    return {
      kind: "OptionalMemberExpression",
      span: { start: object.span.start, end: prop.span.end },
      object,
      property: tokenValue(prop),
    };
  }

  private parseSubscript(object: Expression): SubscriptExpression {
    this.advance(); // consume [
    const index = this.parseExpression();
    const end = this.expect(TokenKind.RightBracket).span.end;
    return {
      kind: "SubscriptExpression",
      span: { start: object.span.start, end },
      object,
      index,
    };
  }

  private parseCallArguments(callee: Expression): CallExpression {
    this.advance();
    const args: Argument[] = [];

    while (!this.check(TokenKind.RightParen)) {
      args.push(this.parseArgument());
      if (!this.check(TokenKind.RightParen)) {
        this.expect(TokenKind.Comma);
      }
    }

    const end = this.expect(TokenKind.RightParen).span.end;
    return {
      kind: "CallExpression",
      span: { start: callee.span.start, end },
      callee,
      args,
    };
  }

  private parseMemberAccess(object: Expression): MemberExpression {
    this.advance();
    const prop = this.expect(TokenKind.Identifier);
    return {
      kind: "MemberExpression",
      span: { start: object.span.start, end: prop.span.end },
      object,
      property: tokenValue(prop),
    };
  }

  private parseArgument(): Argument {
    const first = this.peek();
    const lookahead = this.tokens.at(this.pos + 1);

    if (
      (first.kind === TokenKind.Identifier || isKeyword(first.kind)) &&
      lookahead?.kind === TokenKind.Colon
    ) {
      this.advance();
      this.advance();
      const value = this.parseExpression();
      const label = first.value ?? keywordText(first.kind);
      return {
        kind: "Argument",
        span: { start: first.span.start, end: value.span.end },
        label,
        value,
      };
    }

    const value = this.parseExpression();
    return {
      kind: "Argument",
      span: value.span,
      label: undefined,
      value,
    };
  }

  private parsePrimary(): Expression {
    const tok = this.peek();

    if (tok.kind === TokenKind.Identifier) {
      this.advance();
      return { kind: "Identifier", span: tok.span, name: tokenValue(tok) };
    }

    if (tok.kind === TokenKind.StringStart) {
      return this.parseInterpolatedString();
    }

    if (tok.kind === TokenKind.String || tok.kind === TokenKind.RawString) {
      this.advance();
      return { kind: "StringLiteral", span: tok.span, value: tokenValue(tok) };
    }

    if (tok.kind === TokenKind.LeftBracket) {
      return this.parseListLiteral();
    }

    if (tok.kind === TokenKind.LeftBrace) {
      return this.parseDictionaryLiteral();
    }

    if (tok.kind === TokenKind.Number) {
      this.advance();
      return { kind: "NumberLiteral", span: tok.span, value: Number(tokenValue(tok)) };
    }

    if (tok.kind === TokenKind.True || tok.kind === TokenKind.False) {
      this.advance();
      return { kind: "BooleanLiteral", span: tok.span, value: tok.kind === TokenKind.True };
    }

    if (tok.kind === TokenKind.Nil) {
      this.advance();
      return { kind: "NilLiteral", span: tok.span };
    }

    if (tok.kind === TokenKind.LeftParen) {
      this.advance();
      const expr = this.parseExpression();
      this.expect(TokenKind.RightParen);
      return expr;
    }

    throw this.error(`expected expression, got ${tokenKindName(tok.kind)}`, tok.span);
  }

  private parseInterpolatedString(): InterpolatedString {
    const startTok = this.expect(TokenKind.StringStart);
    const parts: InterpolatedPart[] = [];
    const start = startTok.span.start;

    parts.push({
      kind: "TextPart",
      span: startTok.span,
      value: tokenValue(startTok),
    });

    for (;;) {
      const expr = this.parseExpression();
      parts.push({
        kind: "ExpressionPart",
        span: expr.span,
        expression: expr,
      });

      const next = this.peek();
      if (next.kind === TokenKind.StringEnd) {
        this.advance();
        if (tokenValue(next).length > 0) {
          parts.push({
            kind: "TextPart",
            span: next.span,
            value: tokenValue(next),
          });
        }
        return {
          kind: "InterpolatedString",
          span: { start, end: next.span.end },
          parts,
        };
      }

      if (next.kind === TokenKind.StringMiddle) {
        this.advance();
        if (tokenValue(next).length > 0) {
          parts.push({
            kind: "TextPart",
            span: next.span,
            value: tokenValue(next),
          });
        }
        continue;
      }

      throw this.error(`expected string continuation, got ${tokenKindName(next.kind)}`, next.span);
    }
  }

  private parseListLiteral(): ListLiteral {
    const start = this.expect(TokenKind.LeftBracket).span.start;
    const elements: Expression[] = [];

    while (!this.check(TokenKind.RightBracket)) {
      elements.push(this.parseExpression());
      if (!this.check(TokenKind.RightBracket)) {
        this.expect(TokenKind.Comma);
      }
    }

    const end = this.expect(TokenKind.RightBracket).span.end;
    return {
      kind: "ListLiteral",
      span: { start, end },
      elements,
    };
  }

  private parseDictionaryLiteral(): DictionaryLiteral {
    const start = this.expect(TokenKind.LeftBrace).span.start;

    if (this.check(TokenKind.Colon)) {
      this.advance();
      const end = this.expect(TokenKind.RightBrace).span.end;
      return {
        kind: "DictionaryLiteral",
        span: { start, end },
        entries: [],
      };
    }

    if (this.check(TokenKind.RightBrace)) {
      throw new ParseError("empty dictionary must use {:} syntax", this.peek().span);
    }

    const entries: DictionaryEntry[] = [];
    while (!this.check(TokenKind.RightBrace)) {
      const key = this.parseCoalesce();
      this.expect(TokenKind.Colon);
      const value = this.parseExpression();
      entries.push({
        kind: "DictionaryEntry",
        span: { start: key.span.start, end: value.span.end },
        key,
        value,
      });
      if (!this.check(TokenKind.RightBrace)) {
        this.expect(TokenKind.Comma);
      }
    }

    const end = this.expect(TokenKind.RightBrace).span.end;
    return {
      kind: "DictionaryLiteral",
      span: { start, end },
      entries,
    };
  }

  private peek(): Token {
    const tok = this.tokens.at(this.pos);
    if (!tok) {
      throw new ParseError("unexpected end of input", { start: 0, end: 0 });
    }
    return tok;
  }

  private check(kind: TokenKind): boolean {
    return this.peek().kind === kind;
  }

  private advance(): Token {
    const tok = this.peek();
    this.pos++;
    return tok;
  }

  private expect(kind: TokenKind): Token {
    const tok = this.peek();
    if (tok.kind !== kind) {
      throw this.error(`expected ${tokenKindName(kind)}, got ${tokenKindName(tok.kind)}`, tok.span);
    }
    return this.advance();
  }

  private error(message: string, span: Span): ParseError {
    return new ParseError(message, span);
  }
}

function exprToPlace(expr: Expression): Place {
  const accessors: PlaceAccessor[] = [];
  let current = expr;

  while (current.kind === "MemberExpression" || current.kind === "SubscriptExpression") {
    if (current.kind === "MemberExpression") {
      accessors.push({
        kind: "FieldAccessor",
        span: current.span,
        name: current.property,
      });
      current = current.object;
    } else {
      accessors.push({
        kind: "SubscriptAccessor",
        span: current.span,
        index: current.index,
      });
      current = current.object;
    }
  }

  if (current.kind !== "Identifier") {
    throw new ParseError("assignment target must be a variable, field, or subscript", expr.span);
  }

  accessors.reverse();
  return {
    kind: "Place",
    span: expr.span,
    root: current.name,
    accessors,
  };
}

function tokenValue(tok: Token): string {
  if (tok.value === undefined) {
    throw new Error(`token ${tokenKindName(tok.kind)} has no value`);
  }
  return tok.value;
}

function isKeyword(kind: TokenKind): boolean {
  return kind >= TokenKind.Action && kind <= TokenKind.Var;
}

const KEYWORD_TEXTS: ReadonlyMap<TokenKind, string> = new Map([
  [TokenKind.Action, "action"],
  [TokenKind.And, "and"],
  [TokenKind.As, "as"],
  [TokenKind.Case, "case"],
  [TokenKind.Contains, "contains"],
  [TokenKind.Else, "else"],
  [TokenKind.Enum, "enum"],
  [TokenKind.Export, "export"],
  [TokenKind.False, "false"],
  [TokenKind.For, "for"],
  [TokenKind.Func, "func"],
  [TokenKind.HasPrefix, "hasPrefix"],
  [TokenKind.HasSuffix, "hasSuffix"],
  [TokenKind.If, "if"],
  [TokenKind.Import, "import"],
  [TokenKind.In, "in"],
  [TokenKind.Input, "input"],
  [TokenKind.Is, "is"],
  [TokenKind.Let, "let"],
  [TokenKind.Menu, "menu"],
  [TokenKind.Nil, "nil"],
  [TokenKind.Not, "not"],
  [TokenKind.Or, "or"],
  [TokenKind.Record, "record"],
  [TokenKind.Repeat, "repeat"],
  [TokenKind.Return, "return"],
  [TokenKind.Shortcut, "shortcut"],
  [TokenKind.True, "true"],
  [TokenKind.Var, "var"],
]);

function keywordText(kind: TokenKind): string {
  return KEYWORD_TEXTS.get(kind) ?? (TokenKind[kind] ?? "unknown").toLowerCase();
}

function tokenKindName(kind: TokenKind): string {
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
    [TokenKind.Eof]: "end of file",
  };
  return names[kind] ?? `keyword '${(TokenKind[kind] ?? "unknown").toLowerCase()}'`;
}
