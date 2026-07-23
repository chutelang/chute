import { Lexer } from "./lexer.ts";
import { Parser } from "./parser.ts";
import { extractComments } from "./comment.ts";
import type { SourceComment } from "./comment.ts";
import type {
  ActionDeclaration,
  Argument,
  Assignment,
  Attribute,
  AttributeArgument,
  AttributeValue,
  BaseType,
  Condition,
  DictionaryEntry,
  EnumCaseNode,
  EnumDeclaration,
  Expression,
  ForStatement,
  FunctionDeclaration,
  FunctionParameter,
  IfStatement,
  ImportDeclaration,
  MenuCase,
  MenuStatement,
  MetadataField,
  MetadataValue,
  PipelineStage,
  Place,
  Program,
  RecordDeclaration,
  RecordFieldNode,
  RepeatStatement,
  ShortcutMetadata,
  Statement,
  TypeAnnotation,
} from "./ast.ts";

export interface FormatOptions {
  maxWidth?: number;
}

export function format(source: string, options?: FormatOptions): string {
  if (source.trim() === "") return "";

  const tokens = new Lexer(source).tokenize();
  const ast = new Parser(tokens).parse();
  const comments = extractComments(source);
  const printer = new Printer(source, comments, options?.maxWidth ?? 120);
  return printer.print(ast);
}

class Printer {
  private source: string;
  private comments: SourceComment[];
  private commentIndex: number;
  private output: string;
  private indent: number;
  private maxWidth: number;

  constructor(source: string, comments: SourceComment[], maxWidth: number) {
    this.source = source;
    this.comments = comments;
    this.commentIndex = 0;
    this.output = "";
    this.indent = 0;
    this.maxWidth = maxWidth;
  }

  print(program: Program): string {
    this.printProgram(program);
    this.emitRemainingComments();
    return this.output;
  }

  private printProgram(program: Program): void {
    for (let i = 0; i < program.imports.length; i++) {
      this.emitLeadingComments(program.imports[i]!.span.start);
      this.printImport(program.imports[i]!);
      this.emitTrailingComment(program.imports[i]!.span.end);
      this.writeLine();
    }

    if (program.metadata) {
      if (program.imports.length > 0) {
        this.writeLine();
      }
      this.emitLeadingComments(program.metadata.span.start);
      this.printMetadata(program.metadata);
      this.emitTrailingComment(program.metadata.span.end);
      this.writeLine();
    }

    if (program.body.length > 0) {
      if (program.imports.length > 0 || program.metadata) {
        if (!(program.metadata && this.output.endsWith("\n\n"))) {
          if (program.imports.length > 0 && !program.metadata) {
            this.writeLine();
          } else if (program.metadata) {
            this.writeLine();
          }
        }
      }
    }

    this.printBody(
      program.body,
      program.metadata?.span.end ?? program.imports.at(-1)?.span.end ?? 0,
    );
  }

  private printBody(statements: Statement[], afterPos: number): void {
    for (let i = 0; i < statements.length; i++) {
      this.emitLeadingComments(statements[i]!.span.start);
      this.printStatement(statements[i]!);
      this.emitTrailingComment(statements[i]!.span.end);
      this.writeLine();
    }
  }

  private printStatement(stmt: Statement): void {
    switch (stmt.kind) {
      case "ExpressionStatement":
        this.writeIndent();
        this.printExpression(stmt.expression);
        this.write(";");
        break;
      case "LetDeclaration":
        this.writeIndent();
        if (stmt.exported) this.write("export ");
        this.write("let ");
        this.write(stmt.name);
        if (stmt.typeAnnotation) {
          this.write(": ");
          this.printTypeAnnotation(stmt.typeAnnotation);
        }
        this.write(" = ");
        this.printExpression(stmt.initializer);
        this.write(";");
        break;
      case "LetDestructure":
        this.writeIndent();
        this.write("let {");
        this.write(stmt.names.join(", "));
        this.write("} = ");
        this.printExpression(stmt.initializer);
        this.write(";");
        break;
      case "VarDeclaration":
        this.writeIndent();
        this.write("var ");
        this.write(stmt.name);
        if (stmt.typeAnnotation) {
          this.write(": ");
          this.printTypeAnnotation(stmt.typeAnnotation);
        }
        this.write(" = ");
        this.printExpression(stmt.initializer);
        this.write(";");
        break;
      case "Assignment":
        this.writeIndent();
        this.printPlace(stmt.place);
        this.write(" = ");
        this.printExpression(stmt.value);
        this.write(";");
        break;
      case "IfStatement":
        this.printIfStatement(stmt);
        break;
      case "ForStatement":
        this.printForStatement(stmt);
        break;
      case "RepeatStatement":
        this.printRepeatStatement(stmt);
        break;
      case "MenuStatement":
        this.printMenuStatement(stmt);
        break;
      case "EnumDeclaration":
        this.printEnumDeclaration(stmt);
        break;
      case "RecordDeclaration":
        this.printRecordDeclaration(stmt);
        break;
      case "FunctionDeclaration":
        this.printFunctionDeclaration(stmt);
        break;
      case "ReturnStatement":
        this.writeIndent();
        if (stmt.value) {
          this.write("return ");
          this.printExpression(stmt.value);
        } else {
          this.write("return");
        }
        this.write(";");
        break;
      case "ActionDeclaration":
        this.printActionDeclaration(stmt);
        break;
    }
  }

  private printImport(imp: ImportDeclaration): void {
    this.writeIndent();
    this.write("import ");
    if (imp.isPackage) {
      this.write(imp.path);
      if (imp.alias !== imp.path) {
        this.write(" as ");
        this.write(imp.alias);
      }
    } else {
      this.write('"');
      this.write(imp.path);
      this.write('" as ');
      this.write(imp.alias);
    }
    this.write(";");
  }

  private printMetadata(meta: ShortcutMetadata): void {
    this.writeIndent();
    this.write("shortcut {");
    this.writeLine();
    this.indent++;
    for (const field of meta.fields) {
      this.writeIndent();
      this.write(field.name);
      this.write(": ");
      this.printMetadataValue(field.value);
      this.write(",");
      this.writeLine();
    }
    this.indent--;
    this.writeIndent();
    this.write("}");
  }

  private printMetadataValue(value: MetadataValue): void {
    switch (value.kind) {
      case "MetadataString":
        this.write('"');
        this.write(escapeString(value.value));
        this.write('"');
        break;
      case "MetadataNumber":
        if (value.negative) this.write("-");
        this.write(String(Math.abs(value.value)));
        break;
      case "MetadataBoolean":
        this.write(value.value ? "true" : "false");
        break;
      case "MetadataNil":
        this.write("nil");
        break;
      case "MetadataList":
        this.write("[");
        for (let i = 0; i < value.elements.length; i++) {
          if (i > 0) this.write(", ");
          this.printMetadataValue(value.elements[i]!);
        }
        this.write("]");
        break;
      case "MetadataDotName":
        this.write(".");
        this.write(value.name);
        if (value.args) {
          this.write("(");
          for (let i = 0; i < value.args.length; i++) {
            if (i > 0) this.write(", ");
            this.printMetadataValue(value.args[i]!);
          }
          this.write(")");
        }
        break;
    }
  }

  private printExpression(expr: Expression): void {
    switch (expr.kind) {
      case "Identifier":
        this.write(expr.name);
        break;
      case "NumberLiteral":
        this.write(this.source.slice(expr.span.start, expr.span.end));
        break;
      case "StringLiteral":
        this.write(this.source.slice(expr.span.start, expr.span.end));
        break;
      case "BooleanLiteral":
        this.write(expr.value ? "true" : "false");
        break;
      case "NilLiteral":
        this.write("nil");
        break;
      case "InterpolatedString":
        this.printInterpolatedString(expr);
        break;
      case "DotNameExpression":
        this.write(".");
        this.write(expr.name);
        break;
      case "HashIndexExpression":
        this.write("#index");
        break;
      case "PlaceholderExpression":
        this.write("_");
        break;
      case "ListLiteral":
        if (expr.elements.length === 0) {
          this.write("[]");
        } else {
          this.write("[");
          for (let i = 0; i < expr.elements.length; i++) {
            if (i > 0) this.write(", ");
            this.printExpression(expr.elements[i]!);
          }
          this.write("]");
        }
        break;
      case "DictionaryLiteral":
        if (expr.entries.length === 0) {
          this.write("{:}");
        } else {
          this.write("{");
          for (let i = 0; i < expr.entries.length; i++) {
            if (i > 0) this.write(", ");
            this.printDictionaryEntry(expr.entries[i]!);
          }
          this.write("}");
        }
        break;
      case "CallExpression":
        this.printExpression(expr.callee);
        this.write("(");
        for (let i = 0; i < expr.args.length; i++) {
          if (i > 0) this.write(", ");
          this.printArgument(expr.args[i]!);
        }
        this.write(")");
        break;
      case "MemberExpression":
        this.printExpression(expr.object);
        this.write(".");
        this.write(expr.property);
        break;
      case "OptionalMemberExpression":
        this.printExpression(expr.object);
        this.write("?.");
        this.write(expr.property);
        break;
      case "SubscriptExpression":
        this.printExpression(expr.object);
        this.write("[");
        this.printExpression(expr.index);
        this.write("]");
        break;
      case "BinaryExpression":
        this.printExpression(expr.left);
        this.write(` ${expr.operator} `);
        this.printExpression(expr.right);
        break;
      case "UnaryExpression":
        this.write(expr.operator);
        this.printExpression(expr.operand);
        break;
      case "CoalesceExpression":
        this.printExpression(expr.left);
        this.write(" ?? ");
        this.printExpression(expr.right);
        break;
      case "TernaryExpression":
        this.printCondition(expr.condition);
        this.write(" ? ");
        this.printExpression(expr.consequent);
        this.write(" : ");
        this.printExpression(expr.alternate);
        break;
      case "PipelineExpression":
        this.printExpression(expr.input);
        for (const stage of expr.stages) {
          this.printPipelineStage(stage);
        }
        break;
    }
  }

  private printInterpolatedString(expr: import("./ast.ts").InterpolatedString): void {
    this.write('"');
    for (const part of expr.parts) {
      if (part.kind === "TextPart") {
        this.write(escapeString(part.value));
      } else {
        this.write("${");
        this.printExpression(part.expression);
        this.write("}");
      }
    }
    this.write('"');
  }

  private printPipelineStage(stage: PipelineStage): void {
    this.write(stage.operator === "|>" ? " |> " : " |>? ");
    this.printExpression(stage.callee);
    if (stage.args.length > 0) {
      this.write("(");
      for (let i = 0; i < stage.args.length; i++) {
        if (i > 0) this.write(", ");
        this.printArgument(stage.args[i]!);
      }
      this.write(")");
    }
  }

  private printArgument(arg: Argument): void {
    if (arg.label) {
      this.write(arg.label);
      this.write(": ");
    }
    this.printExpression(arg.value);
  }

  private printDictionaryEntry(entry: DictionaryEntry): void {
    this.printExpression(entry.key);
    this.write(": ");
    this.printExpression(entry.value);
  }

  private printCondition(cond: Condition): void {
    switch (cond.kind) {
      case "Comparison":
        this.printExpression(cond.left);
        this.write(` ${cond.operator} `);
        this.printExpression(cond.right);
        break;
      case "AndCondition":
        this.printCondition(cond.left);
        this.write(" and ");
        this.printCondition(cond.right);
        break;
      case "OrCondition":
        this.printCondition(cond.left);
        this.write(" or ");
        this.printCondition(cond.right);
        break;
      case "NotCondition":
        this.write("not ");
        this.printCondition(cond.operand);
        break;
      case "RangeTest":
        this.printExpression(cond.subject);
        this.write(" in ");
        this.printExpression(cond.low);
        this.write("...");
        this.printExpression(cond.high);
        break;
      case "TypeTest":
        this.printExpression(cond.subject);
        this.write(" is ");
        this.printBaseType(cond.testType);
        break;
      case "BooleanReference":
        this.printExpression(cond.subject);
        break;
      case "BooleanLiteralCondition":
        this.write(cond.value ? "true" : "false");
        break;
    }
  }

  private printPlace(place: Place): void {
    this.write(place.root);
    for (const accessor of place.accessors) {
      if (accessor.kind === "FieldAccessor") {
        this.write(".");
        this.write(accessor.name);
      } else {
        this.write("[");
        this.printExpression(accessor.index);
        this.write("]");
      }
    }
  }

  private printTypeAnnotation(ta: TypeAnnotation): void {
    this.printBaseType(ta.base);
    if (ta.optional) this.write("?");
  }

  private printBaseType(bt: BaseType): void {
    switch (bt.kind) {
      case "NamedType":
        if (bt.qualifier) {
          this.write(bt.qualifier);
          this.write(".");
        }
        this.write(bt.name);
        break;
      case "ListType":
        this.write("List<");
        this.printTypeAnnotation(bt.elementType);
        this.write(">");
        break;
      case "QuantityType":
        this.write("Quantity<");
        this.write(bt.unit);
        this.write(">");
        break;
    }
  }

  private printIfStatement(stmt: IfStatement, isElseIf = false): void {
    if (!isElseIf) this.writeIndent();
    this.write("if ");
    this.printCondition(stmt.condition);
    this.write(" {");
    const blockEndPos = stmt.span.end;
    this.emitTrailingComment(this.findOpenBraceEnd(stmt));
    this.writeLine();
    this.indent++;
    this.printBody(stmt.body, stmt.condition.span.end);
    this.emitDanglingComments(blockEndPos);
    this.indent--;
    this.writeIndent();
    this.write("}");
    if (stmt.elseBody !== undefined) {
      if (Array.isArray(stmt.elseBody)) {
        this.write(" else {");
        this.writeLine();
        this.indent++;
        this.printBody(stmt.elseBody, stmt.span.end);
        this.indent--;
        this.writeIndent();
        this.write("}");
      } else {
        this.write(" else ");
        this.printIfStatement(stmt.elseBody, true);
      }
    }
  }

  private printForStatement(stmt: ForStatement): void {
    this.writeIndent();
    this.write("for ");
    this.write(stmt.variable);
    this.write(" in ");
    this.printExpression(stmt.iterable);
    this.write(" {");
    this.writeLine();
    this.indent++;
    this.printBody(stmt.body, stmt.iterable.span.end);
    this.indent--;
    this.writeIndent();
    this.write("}");
  }

  private printRepeatStatement(stmt: RepeatStatement): void {
    this.writeIndent();
    this.write("repeat ");
    this.printExpression(stmt.count);
    this.write(" {");
    this.writeLine();
    this.indent++;
    this.printBody(stmt.body, stmt.count.span.end);
    this.indent--;
    this.writeIndent();
    this.write("}");
  }

  private printMenuStatement(stmt: MenuStatement): void {
    this.writeIndent();
    this.write("menu ");
    this.printExpression(stmt.prompt);
    if (stmt.variable) {
      this.write(" -> ");
      this.write(stmt.variable);
      if (stmt.variableType) {
        this.write(": ");
        this.printTypeAnnotation(stmt.variableType);
      }
    }
    this.write(" {");
    this.writeLine();
    this.indent++;
    for (const c of stmt.cases) {
      this.emitLeadingComments(c.span.start);
      this.printMenuCase(c);
      this.writeLine();
    }
    this.indent--;
    this.writeIndent();
    this.write("}");
  }

  private printMenuCase(c: MenuCase): void {
    this.writeIndent();
    this.write('case "');
    this.write(escapeString(c.label));
    this.write('" {');
    this.writeLine();
    this.indent++;
    this.printBody(c.body, c.span.start);
    this.indent--;
    this.writeIndent();
    this.write("}");
  }

  private printEnumDeclaration(stmt: EnumDeclaration): void {
    this.writeIndent();
    if (stmt.exported) this.write("export ");
    this.write("enum ");
    this.write(stmt.name);
    if (stmt.defaultValue !== undefined) {
      this.write(' = "');
      this.write(escapeString(stmt.defaultValue));
      this.write('"');
    }
    this.write(" {");
    this.writeLine();
    this.indent++;
    for (const c of stmt.cases) {
      this.emitLeadingComments(c.span.start);
      this.printEnumCase(c);
      this.writeLine();
    }
    this.indent--;
    this.writeIndent();
    this.write("}");
  }

  private printEnumCase(c: EnumCaseNode): void {
    this.writeIndent();
    this.write(c.name);
    if (c.value !== undefined) {
      this.write(' = "');
      this.write(escapeString(c.value));
      this.write('"');
    }
    this.write(",");
  }

  private printRecordDeclaration(stmt: RecordDeclaration): void {
    this.writeIndent();
    if (stmt.exported) this.write("export ");
    this.write("record ");
    this.write(stmt.name);
    this.write(" {");
    this.writeLine();
    this.indent++;
    for (const field of stmt.fields) {
      this.emitLeadingComments(field.span.start);
      this.writeIndent();
      this.write(field.name);
      this.write(": ");
      this.printTypeAnnotation(field.type);
      this.write(",");
      this.writeLine();
    }
    this.indent--;
    this.writeIndent();
    this.write("}");
  }

  private printFunctionDeclaration(stmt: FunctionDeclaration): void {
    this.writeIndent();
    if (stmt.exported) this.write("export ");
    this.write("func ");
    this.write(stmt.name);
    this.write("(");
    for (let i = 0; i < stmt.params.length; i++) {
      if (i > 0) this.write(", ");
      this.printFunctionParameter(stmt.params[i]!);
    }
    this.write(")");
    if (stmt.returnType) {
      this.write(" -> ");
      this.printTypeAnnotation(stmt.returnType);
    }
    this.write(" {");
    this.writeLine();
    this.indent++;
    this.printBody(stmt.body, stmt.span.start);
    this.indent--;
    this.writeIndent();
    this.write("}");
  }

  private printFunctionParameter(param: FunctionParameter): void {
    this.write(param.name);
    this.write(": ");
    this.printTypeAnnotation(param.type);
    if (param.defaultValue) {
      this.write(" = ");
      this.printExpression(param.defaultValue);
    }
  }

  private printActionDeclaration(stmt: ActionDeclaration): void {
    this.writeIndent();
    if (stmt.exported) this.write("export ");
    this.write("action ");
    this.write(stmt.name);
    this.write("(");
    for (let i = 0; i < stmt.params.length; i++) {
      if (i > 0) this.write(", ");
      this.printActionParameter(stmt.params[i]!);
    }
    this.write(")");
    if (stmt.returnType) {
      this.write(" -> ");
      this.printTypeAnnotation(stmt.returnType);
    }
    this.write(' = "');
    this.write(escapeString(stmt.runtimeIdentifier));
    this.write('"');
    for (const attr of stmt.attributes) {
      this.write(" ");
      this.printAttribute(attr);
    }
    this.write(";");
  }

  private printActionParameter(param: import("./ast.ts").ActionParameter): void {
    this.write(param.label);
    this.write(" ");
    this.write(param.name);
    this.write(": ");
    this.printTypeAnnotation(param.type);
    if (param.defaultValue) {
      this.write(" = ");
      this.printExpression(param.defaultValue);
    }
  }

  private printAttribute(attr: Attribute): void {
    this.write("@");
    this.write(attr.name);
    if (attr.args) {
      this.write("(");
      for (let i = 0; i < attr.args.length; i++) {
        if (i > 0) this.write(", ");
        this.printAttributeArgument(attr.args[i]!);
      }
      this.write(")");
    }
  }

  private printAttributeArgument(arg: AttributeArgument): void {
    if (arg.label) {
      this.write(arg.label);
      this.write(": ");
    }
    this.printAttributeValue(arg.value);
  }

  private printAttributeValue(val: AttributeValue): void {
    switch (val.kind) {
      case "MetadataString":
        this.write('"');
        this.write(escapeString(val.value));
        this.write('"');
        break;
      case "MetadataNumber":
        if (val.negative) this.write("-");
        this.write(String(Math.abs(val.value)));
        break;
      case "MetadataBoolean":
        this.write(val.value ? "true" : "false");
        break;
      case "MetadataNil":
        this.write("nil");
        break;
      case "AttributeIdentifier":
        this.write(val.name);
        break;
    }
  }

  // Comment handling

  private emitLeadingComments(beforePos: number): void {
    while (this.commentIndex < this.comments.length) {
      const comment = this.comments[this.commentIndex]!;
      if (comment.span.start >= beforePos) break;
      this.writeIndent();
      this.writeComment(comment);
      this.writeLine();
      this.commentIndex++;
    }
  }

  private emitTrailingComment(afterPos: number): void {
    if (this.commentIndex >= this.comments.length) return;
    const comment = this.comments[this.commentIndex]!;
    if (comment.span.start < afterPos) return;
    if (!this.isOnSameLine(afterPos, comment.span.start)) return;
    this.write(" ");
    this.writeComment(comment);
    this.commentIndex++;
  }

  private emitDanglingComments(beforePos: number): void {
    while (this.commentIndex < this.comments.length) {
      const comment = this.comments[this.commentIndex]!;
      if (comment.span.start >= beforePos) break;
      this.writeIndent();
      this.writeComment(comment);
      this.writeLine();
      this.commentIndex++;
    }
  }

  private emitRemainingComments(): void {
    while (this.commentIndex < this.comments.length) {
      const comment = this.comments[this.commentIndex]!;
      if (this.output.length > 0 && !this.output.endsWith("\n")) {
        if (this.isOnSameLine(this.lastNodeEnd(), comment.span.start)) {
          this.write(" ");
        } else {
          this.writeLine();
        }
      }
      this.writeComment(comment);
      this.writeLine();
      this.commentIndex++;
    }
  }

  private writeComment(comment: SourceComment): void {
    if (comment.isBlock) {
      this.write("/*");
      this.write(comment.text);
      this.write("*/");
    } else {
      this.write("//");
      this.write(comment.text);
    }
  }

  private isOnSameLine(posA: number, posB: number): boolean {
    const slice = this.source.slice(posA, posB);
    return !slice.includes("\n");
  }

  private findOpenBraceEnd(stmt: IfStatement): number {
    const bodyStart = stmt.body[0]?.span.start ?? stmt.span.end;
    for (let i = stmt.condition.span.end; i < bodyStart; i++) {
      if (this.source.charAt(i) === "{") return i + 1;
    }
    return stmt.condition.span.end;
  }

  private lastNodeEnd(): number {
    return this.source.length;
  }

  // Output helpers

  private write(text: string): void {
    this.output += text;
  }

  private writeLine(): void {
    this.output += "\n";
  }

  private writeIndent(): void {
    for (let i = 0; i < this.indent; i++) {
      this.output += "  ";
    }
  }
}

function escapeString(value: string): string {
  let result = "";
  for (const ch of value) {
    switch (ch) {
      case "\\":
        result += "\\\\";
        break;
      case '"':
        result += '\\"';
        break;
      case "\n":
        result += "\\n";
        break;
      case "\t":
        result += "\\t";
        break;
      case "\r":
        result += "\\r";
        break;
      case "$":
        result += "\\$";
        break;
      default:
        result += ch;
    }
  }
  return result;
}
