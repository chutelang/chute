import { TokenKind } from "./token.ts";
import type { Token, Span } from "./token.ts";
import type {
  Argument,
  Assignment,
  BaseType,
  BinaryExpression,
  BinaryOperator,
  CallExpression,
  ComparisonOperator,
  Condition,
  DictionaryEntry,
  DictionaryLiteral,
  EnumCaseNode,
  EnumDeclaration,
  Expression,
  ForStatement,
  FunctionDeclaration,
  FunctionParameter,
  IfStatement,
  InterpolatedPart,
  InterpolatedString,
  LetDeclaration,
  LetDestructure,
  ListLiteral,
  ListType,
  MemberExpression,
  MenuCase,
  MenuStatement,
  MetadataField,
  MetadataValue,
  OptionalMemberExpression,
  PipelineExpression,
  PipelineOperator,
  PipelineStage,
  Place,
  PlaceAccessor,
  Program,
  QuantityType,
  RecordDeclaration,
  RecordFieldNode,
  RepeatStatement,
  ReturnStatement,
  ShortcutMetadata,
  Statement,
  SubscriptExpression,
  TernaryExpression,
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
    if (this.check(TokenKind.Export)) {
      return this.parseExportedDeclaration();
    }
    if (this.check(TokenKind.Enum)) {
      return this.parseEnumDeclaration(false);
    }
    if (this.check(TokenKind.Record)) {
      return this.parseRecordDeclaration(false);
    }
    if (this.check(TokenKind.Func)) {
      return this.parseFunctionDeclaration(false);
    }
    if (this.check(TokenKind.Return)) {
      return this.parseReturnStatement();
    }
    if (this.check(TokenKind.Let)) {
      return this.parseLetOrDestructure();
    }
    if (this.check(TokenKind.Var)) {
      return this.parseVarDeclaration();
    }
    if (this.check(TokenKind.If)) {
      return this.parseIfStatement();
    }
    if (this.check(TokenKind.For)) {
      return this.parseForStatement();
    }
    if (this.check(TokenKind.Repeat)) {
      return this.parseRepeatStatement();
    }
    if (this.check(TokenKind.Menu)) {
      return this.parseMenuStatement();
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

  private parseExportedDeclaration(): Statement {
    const start = this.expect(TokenKind.Export).span.start;

    if (this.check(TokenKind.Enum)) {
      const decl = this.parseEnumDeclaration(true);
      decl.span.start = start;
      return decl;
    }
    if (this.check(TokenKind.Record)) {
      const decl = this.parseRecordDeclaration(true);
      decl.span.start = start;
      return decl;
    }
    if (this.check(TokenKind.Func)) {
      const decl = this.parseFunctionDeclaration(true);
      decl.span.start = start;
      return decl;
    }

    throw this.error(
      `expected 'enum', 'record', or 'func' after 'export', got ${tokenKindName(this.peek().kind)}`,
      this.peek().span,
    );
  }

  private parseEnumDeclaration(exported: boolean): EnumDeclaration {
    const start = this.expect(TokenKind.Enum).span.start;
    const name = tokenValue(this.expect(TokenKind.Identifier));

    let defaultValue: string | undefined;
    if (this.check(TokenKind.Equal)) {
      this.advance();
      defaultValue = tokenValue(this.expect(TokenKind.String));
    }

    this.expect(TokenKind.LeftBrace);

    if (this.check(TokenKind.RightBrace)) {
      throw this.error("enum requires at least one case", this.peek().span);
    }

    const cases: EnumCaseNode[] = [];
    cases.push(this.parseEnumCase());

    while (this.check(TokenKind.Comma)) {
      this.advance();
      if (this.check(TokenKind.RightBrace)) break;
      cases.push(this.parseEnumCase());
    }

    const end = this.expect(TokenKind.RightBrace).span.end;
    return {
      kind: "EnumDeclaration",
      span: { start, end },
      exported,
      name,
      defaultValue,
      cases,
    };
  }

  private parseEnumCase(): EnumCaseNode {
    const nameTok = this.expect(TokenKind.Identifier);
    let value: string | undefined;
    let end = nameTok.span.end;

    if (this.check(TokenKind.Equal)) {
      this.advance();
      const valTok = this.expect(TokenKind.String);
      value = tokenValue(valTok);
      end = valTok.span.end;
    }

    return {
      kind: "EnumCase",
      span: { start: nameTok.span.start, end },
      name: tokenValue(nameTok),
      value,
    };
  }

  private parseRecordDeclaration(exported: boolean): RecordDeclaration {
    const start = this.expect(TokenKind.Record).span.start;
    const name = tokenValue(this.expect(TokenKind.Identifier));

    this.expect(TokenKind.LeftBrace);
    const fields: RecordFieldNode[] = [];

    while (!this.check(TokenKind.RightBrace)) {
      fields.push(this.parseRecordField());
      if (!this.check(TokenKind.RightBrace)) {
        this.expect(TokenKind.Comma);
      }
    }

    const end = this.expect(TokenKind.RightBrace).span.end;
    return {
      kind: "RecordDeclaration",
      span: { start, end },
      exported,
      name,
      fields,
    };
  }

  private parseRecordField(): RecordFieldNode {
    const nameTok = this.expect(TokenKind.Identifier);
    const type = this.parseTypeAnnotationWithColon();
    return {
      kind: "RecordField",
      span: { start: nameTok.span.start, end: type.span.end },
      name: tokenValue(nameTok),
      type,
    };
  }

  private parseFunctionDeclaration(exported: boolean): FunctionDeclaration {
    const start = this.expect(TokenKind.Func).span.start;
    const name = tokenValue(this.expect(TokenKind.Identifier));
    this.expect(TokenKind.LeftParen);

    const params: FunctionParameter[] = [];
    while (!this.check(TokenKind.RightParen)) {
      params.push(this.parseFunctionParameter());
      if (!this.check(TokenKind.RightParen)) {
        this.expect(TokenKind.Comma);
      }
    }
    this.expect(TokenKind.RightParen);

    let returnType: TypeAnnotation | undefined;
    if (this.check(TokenKind.Arrow)) {
      this.advance();
      returnType = this.parseTypeAnnotation();
    }

    const block = this.parseBlock();

    return {
      kind: "FunctionDeclaration",
      span: { start, end: block.end },
      exported,
      name,
      params,
      returnType,
      body: block.stmts,
    };
  }

  private parseFunctionParameter(): FunctionParameter {
    const nameTok = this.expect(TokenKind.Identifier);
    const type = this.parseTypeAnnotationWithColon();

    let defaultValue: Expression | undefined;
    if (this.check(TokenKind.Equal)) {
      this.advance();
      defaultValue = this.parseExpression();
    }

    return {
      kind: "FunctionParameter",
      span: { start: nameTok.span.start, end: (defaultValue ?? type).span.end },
      name: tokenValue(nameTok),
      type,
      defaultValue,
    };
  }

  private parseReturnStatement(): ReturnStatement {
    const start = this.expect(TokenKind.Return).span.start;

    if (this.check(TokenKind.Semicolon)) {
      const end = this.advance().span.end;
      return {
        kind: "ReturnStatement",
        span: { start, end },
        value: undefined,
      };
    }

    const value = this.parseExpression();
    const end = this.expect(TokenKind.Semicolon).span.end;
    return {
      kind: "ReturnStatement",
      span: { start, end },
      value,
    };
  }

  private parseLetOrDestructure(): LetDeclaration | LetDestructure {
    const lookahead = this.tokens.at(this.pos + 1);
    if (lookahead?.kind === TokenKind.LeftBrace) {
      return this.parseLetDestructure();
    }
    return this.parseLetDeclaration();
  }

  private parseLetDestructure(): LetDestructure {
    const start = this.expect(TokenKind.Let).span.start;
    this.expect(TokenKind.LeftBrace);

    const names: string[] = [];
    names.push(tokenValue(this.expect(TokenKind.Identifier)));
    while (this.check(TokenKind.Comma)) {
      this.advance();
      if (this.check(TokenKind.RightBrace)) break;
      names.push(tokenValue(this.expect(TokenKind.Identifier)));
    }
    this.expect(TokenKind.RightBrace);

    this.expect(TokenKind.Equal);
    const initializer = this.parseExpression();
    const end = this.expect(TokenKind.Semicolon).span.end;
    return {
      kind: "LetDestructure",
      span: { start, end },
      names,
      initializer,
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

  private parseIfStatement(): IfStatement {
    const start = this.expect(TokenKind.If).span.start;
    const condition = this.parseCondition();
    const block = this.parseBlock();

    let elseBody: Statement[] | IfStatement | undefined;
    let end = block.end;
    if (this.check(TokenKind.Else)) {
      this.advance();
      if (this.check(TokenKind.If)) {
        const elseIf = this.parseIfStatement();
        elseBody = elseIf;
        end = elseIf.span.end;
      } else {
        const elseBlock = this.parseBlock();
        elseBody = elseBlock.stmts;
        end = elseBlock.end;
      }
    }

    return {
      kind: "IfStatement",
      span: { start, end },
      condition,
      body: block.stmts,
      elseBody,
    };
  }

  private parseForStatement(): ForStatement {
    const start = this.expect(TokenKind.For).span.start;
    const variable = tokenValue(this.expect(TokenKind.Identifier));
    this.expect(TokenKind.In);
    const iterable = this.parseExpression();
    const block = this.parseBlock();
    return {
      kind: "ForStatement",
      span: { start, end: block.end },
      variable,
      iterable,
      body: block.stmts,
    };
  }

  private parseRepeatStatement(): RepeatStatement {
    const start = this.expect(TokenKind.Repeat).span.start;
    const count = this.parsePostfix();
    const block = this.parseBlock();
    return {
      kind: "RepeatStatement",
      span: { start, end: block.end },
      count,
      body: block.stmts,
    };
  }

  private parseMenuStatement(): MenuStatement {
    const start = this.expect(TokenKind.Menu).span.start;
    const prompt = this.parseExpression();

    let variable: string | undefined;
    let variableType: TypeAnnotation | undefined;
    if (this.check(TokenKind.Arrow)) {
      this.advance();
      variable = tokenValue(this.expect(TokenKind.Identifier));
      if (this.check(TokenKind.Colon)) {
        variableType = this.parseTypeAnnotationWithColon();
      }
    }

    this.expect(TokenKind.LeftBrace);
    const cases: MenuCase[] = [];
    while (this.check(TokenKind.Case)) {
      cases.push(this.parseMenuCase());
    }
    const end = this.expect(TokenKind.RightBrace).span.end;

    return {
      kind: "MenuStatement",
      span: { start, end },
      prompt,
      variable,
      variableType,
      cases,
    };
  }

  private parseMenuCase(): MenuCase {
    const start = this.expect(TokenKind.Case).span.start;
    const labelTok = this.peek();
    let label: string;

    if (labelTok.kind === TokenKind.String || labelTok.kind === TokenKind.RawString) {
      this.advance();
      label = tokenValue(labelTok);
    } else if (labelTok.kind === TokenKind.Dot) {
      this.advance();
      const nameTok = this.expect(TokenKind.Identifier);
      label = `.${tokenValue(nameTok)}`;
    } else {
      throw this.error(
        `expected string or dot name in menu case, got ${tokenKindName(labelTok.kind)}`,
        labelTok.span,
      );
    }

    const block = this.parseBlock();

    return {
      kind: "MenuCase",
      span: { start, end: block.end },
      label,
      body: block.stmts,
    };
  }

  private parseBlock(): { stmts: Statement[]; end: number } {
    this.expect(TokenKind.LeftBrace);
    const stmts: Statement[] = [];
    while (!this.check(TokenKind.RightBrace)) {
      stmts.push(this.parseStatement());
    }
    const end = this.expect(TokenKind.RightBrace).span.end;
    return { stmts, end };
  }

  private parseCondition(): Condition {
    let left = this.parseConjunction();
    while (this.check(TokenKind.Or)) {
      this.advance();
      const right = this.parseConjunction();
      left = {
        kind: "OrCondition",
        span: { start: left.span.start, end: right.span.end },
        left,
        right,
      };
    }
    return left;
  }

  private parseConjunction(): Condition {
    let left = this.parseConditionAtom();
    while (this.check(TokenKind.And)) {
      this.advance();
      const right = this.parseConditionAtom();
      left = {
        kind: "AndCondition",
        span: { start: left.span.start, end: right.span.end },
        left,
        right,
      };
    }
    return left;
  }

  private parseConditionAtom(): Condition {
    if (this.check(TokenKind.Not)) {
      const start = this.advance().span.start;
      const operand = this.parseConditionAtom();
      return {
        kind: "NotCondition",
        span: { start, end: operand.span.end },
        operand,
      };
    }

    if (this.check(TokenKind.True)) {
      const tok = this.advance();
      return {
        kind: "BooleanLiteralCondition",
        span: tok.span,
        value: true,
      };
    }

    if (this.check(TokenKind.False)) {
      const tok = this.advance();
      return {
        kind: "BooleanLiteralCondition",
        span: tok.span,
        value: false,
      };
    }

    if (this.check(TokenKind.LeftParen)) {
      const start = this.advance().span.start;
      const inner = this.parseCondition();
      const end = this.expect(TokenKind.RightParen).span.end;

      if (
        isComparisonOp(this.peek().kind) ||
        this.check(TokenKind.In) ||
        this.check(TokenKind.Is)
      ) {
        const wrappedExpr = conditionToExpression(inner);
        return this.finishConditionAfterAdditive(wrappedExpr);
      }

      return {
        ...inner,
        span: { start, end },
      };
    }

    const left = this.parseAdditive();
    return this.finishConditionAfterAdditive(left);
  }

  private finishConditionAfterAdditive(left: Expression): Condition {
    const tok = this.peek();

    if (isComparisonOp(tok.kind)) {
      const operator = comparisonOpFromToken(tok.kind);
      this.advance();
      const right = this.parseCoalesce();
      return {
        kind: "Comparison",
        span: { start: left.span.start, end: right.span.end },
        left,
        operator,
        right,
      };
    }

    if (this.check(TokenKind.In)) {
      this.advance();
      const low = this.parseCoalesce();
      this.expect(TokenKind.DotDotDot);
      const high = this.parseCoalesce();
      return {
        kind: "RangeTest",
        span: { start: left.span.start, end: high.span.end },
        subject: left,
        low,
        high,
      };
    }

    if (this.check(TokenKind.Is)) {
      this.advance();
      const testType = this.parseBaseType();
      return {
        kind: "TypeTest",
        span: { start: left.span.start, end: testType.span.end },
        subject: left,
        testType,
      };
    }

    return {
      kind: "BooleanReference",
      span: left.span,
      subject: left,
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
    if (this.check(TokenKind.Not)) {
      return this.parseTernaryWithConditionStart();
    }
    return this.parsePipelineOrTernary();
  }

  private parseTernaryWithConditionStart(): TernaryExpression {
    const cond = this.parseCondition();
    this.expect(TokenKind.Question);
    const consequent = this.parseExpression();
    this.expect(TokenKind.Colon);
    const alternate = this.parseExpression();
    return {
      kind: "TernaryExpression",
      span: { start: cond.span.start, end: alternate.span.end },
      condition: cond,
      consequent,
      alternate,
    };
  }

  private parsePipelineOrTernary(): Expression {
    const left = this.parseAdditive();

    if (this.check(TokenKind.Question)) {
      const cond = this.finishConditionAfterAdditive(left);
      if (cond.kind !== "BooleanReference" || this.check(TokenKind.Question)) {
        const fullCond = this.finishConditionChaining(cond);
        return this.finishTernaryTail(fullCond);
      }
    }

    if (isComparisonOp(this.peek().kind) || this.check(TokenKind.Is)) {
      const cond = this.finishConditionAfterAdditive(left);
      const fullCond = this.finishConditionChaining(cond);
      return this.finishTernaryTail(fullCond);
    }

    if (this.check(TokenKind.In) && this.isRangeTestAhead()) {
      const cond = this.finishConditionAfterAdditive(left);
      const fullCond = this.finishConditionChaining(cond);
      return this.finishTernaryTail(fullCond);
    }

    return this.finishPipeline(this.finishCoalesce(left));
  }

  private finishPipeline(input: Expression): Expression {
    if (!this.check(TokenKind.Pipe) && !this.check(TokenKind.PipeQuestion)) {
      return input;
    }

    const stages: PipelineStage[] = [];

    while (this.check(TokenKind.Pipe) || this.check(TokenKind.PipeQuestion)) {
      const opToken = this.advance();
      const operator: PipelineOperator = opToken.kind === TokenKind.Pipe ? "|>" : "|>?";
      const stage = this.parsePipelineStage(operator, opToken.span.start);
      stages.push(stage);
    }

    return {
      kind: "PipelineExpression",
      span: { start: input.span.start, end: stages.at(-1)!.span.end },
      input,
      stages,
    } satisfies PipelineExpression;
  }

  private parsePipelineStage(operator: PipelineOperator, opStart: number): PipelineStage {
    const callee = this.parseQualifiedName();

    let args: Argument[] = [];
    let end = callee.span.end;

    if (this.check(TokenKind.LeftParen)) {
      this.advance();
      while (!this.check(TokenKind.RightParen)) {
        args.push(this.parsePipelineArgument());
        if (!this.check(TokenKind.RightParen)) {
          this.expect(TokenKind.Comma);
        }
      }
      end = this.expect(TokenKind.RightParen).span.end;
    }

    return {
      kind: "PipelineStage",
      span: { start: opStart, end },
      operator,
      callee,
      args,
    };
  }

  private parseQualifiedName(): Expression {
    const tok = this.expect(TokenKind.Identifier);
    let expr: Expression = { kind: "Identifier", span: tok.span, name: tokenValue(tok) };

    while (this.check(TokenKind.Dot)) {
      this.advance();
      const prop = this.expect(TokenKind.Identifier);
      expr = {
        kind: "MemberExpression",
        span: { start: expr.span.start, end: prop.span.end },
        object: expr,
        property: tokenValue(prop),
      };
    }

    return expr;
  }

  private parsePipelineArgument(): Argument {
    if (this.check(TokenKind.Underscore)) {
      const tok = this.advance();
      return {
        kind: "Argument",
        span: tok.span,
        label: undefined,
        value: { kind: "PlaceholderExpression", span: tok.span },
      };
    }

    const first = this.peek();
    const lookahead = this.tokens.at(this.pos + 1);

    if (
      (first.kind === TokenKind.Identifier || isKeyword(first.kind)) &&
      lookahead?.kind === TokenKind.Colon
    ) {
      const afterColon = this.tokens.at(this.pos + 2);
      if (afterColon?.kind === TokenKind.Underscore) {
        this.advance();
        this.advance();
        const uTok = this.advance();
        const label = first.value ?? keywordText(first.kind);
        return {
          kind: "Argument",
          span: { start: first.span.start, end: uTok.span.end },
          label,
          value: { kind: "PlaceholderExpression", span: uTok.span },
        };
      }
    }

    return this.parseArgument();
  }

  private finishConditionChaining(cond: Condition): Condition {
    let result = cond;
    while (this.check(TokenKind.And)) {
      this.advance();
      const right = this.parseConditionAtom();
      result = {
        kind: "AndCondition",
        span: { start: result.span.start, end: right.span.end },
        left: result,
        right,
      };
    }
    while (this.check(TokenKind.Or)) {
      this.advance();
      const right = this.parseConjunction();
      result = {
        kind: "OrCondition",
        span: { start: result.span.start, end: right.span.end },
        left: result,
        right,
      };
    }
    return result;
  }

  private finishTernaryTail(cond: Condition): TernaryExpression {
    this.expect(TokenKind.Question);
    const consequent = this.parseExpression();
    this.expect(TokenKind.Colon);
    const alternate = this.parseExpression();
    return {
      kind: "TernaryExpression",
      span: { start: cond.span.start, end: alternate.span.end },
      condition: cond,
      consequent,
      alternate,
    };
  }

  private isRangeTestAhead(): boolean {
    let depth = 0;
    let pos = this.pos;
    while (pos < this.tokens.length) {
      const tok = this.tokens.at(pos);
      if (!tok || tok.kind === TokenKind.Eof) break;
      if (tok.kind === TokenKind.DotDotDot && depth === 0) return true;
      if (tok.kind === TokenKind.LeftParen || tok.kind === TokenKind.LeftBracket) depth++;
      if (tok.kind === TokenKind.RightParen || tok.kind === TokenKind.RightBracket) depth--;
      if (tok.kind === TokenKind.Semicolon || tok.kind === TokenKind.LeftBrace) break;
      pos++;
    }
    return false;
  }

  private finishCoalesce(left: Expression): Expression {
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

  private parseCoalesce(): Expression {
    return this.finishCoalesce(this.parseAdditive());
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
      const afterColon = this.tokens.at(this.pos + 2);
      if (afterColon?.kind === TokenKind.Underscore) {
        this.advance();
        this.advance();
        const uTok = this.advance();
        const label = first.value ?? keywordText(first.kind);
        return {
          kind: "Argument",
          span: { start: first.span.start, end: uTok.span.end },
          label,
          value: { kind: "PlaceholderExpression", span: uTok.span },
        };
      }

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

    if (first.kind === TokenKind.Underscore) {
      const tok = this.advance();
      return {
        kind: "Argument",
        span: tok.span,
        label: undefined,
        value: { kind: "PlaceholderExpression", span: tok.span },
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

    if (tok.kind === TokenKind.Dot) {
      this.advance();
      const nameTok = this.expect(TokenKind.Identifier);
      return {
        kind: "DotNameExpression",
        span: { start: tok.span.start, end: nameTok.span.end },
        name: tokenValue(nameTok),
      };
    }

    if (tok.kind === TokenKind.HashIndex) {
      this.advance();
      return { kind: "HashIndexExpression", span: tok.span };
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

function isComparisonOp(kind: TokenKind): boolean {
  return (
    kind === TokenKind.EqualEqual ||
    kind === TokenKind.BangEqual ||
    kind === TokenKind.Greater ||
    kind === TokenKind.GreaterEqual ||
    kind === TokenKind.Less ||
    kind === TokenKind.LessEqual ||
    kind === TokenKind.Contains ||
    kind === TokenKind.BangContains ||
    kind === TokenKind.HasPrefix ||
    kind === TokenKind.HasSuffix
  );
}

function comparisonOpFromToken(kind: TokenKind): ComparisonOperator {
  switch (kind) {
    case TokenKind.EqualEqual:
      return "==";
    case TokenKind.BangEqual:
      return "!=";
    case TokenKind.Greater:
      return ">";
    case TokenKind.GreaterEqual:
      return ">=";
    case TokenKind.Less:
      return "<";
    case TokenKind.LessEqual:
      return "<=";
    case TokenKind.Contains:
      return "contains";
    case TokenKind.BangContains:
      return "!contains";
    case TokenKind.HasPrefix:
      return "hasPrefix";
    case TokenKind.HasSuffix:
      return "hasSuffix";
    default:
      throw new Error(`not a comparison operator: ${kind}`);
  }
}

function conditionToExpression(cond: import("./ast.ts").Condition): Expression {
  if (cond.kind === "BooleanReference") {
    return cond.subject;
  }
  throw new ParseError("expected expression in parentheses", cond.span);
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
