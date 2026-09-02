import type { Span } from "./token.ts";

export type Severity = "error" | "warning";

export enum DiagnosticCode {
  // Lexer (CHT001-CHT099)
  UnterminatedComment = "CHT001",
  UnterminatedString = "CHT002",
  InvalidEscape = "CHT003",
  UnexpectedCharacter = "CHT004",
  UnterminatedRawString = "CHT005",
  UnexpectedHashToken = "CHT006",

  // Parser (CHT100-CHT199)
  UnexpectedToken = "CHT100",
  UnexpectedEndOfInput = "CHT101",
  EmptyEnum = "CHT102",
  InvalidDictionarySyntax = "CHT103",
  InvalidAssignmentTarget = "CHT104",

  // Checker (CHT200-CHT299)
  TypeMismatch = "CHT200",
  UndefinedVariable = "CHT201",
  DuplicateDeclaration = "CHT202",
  MissingArgument = "CHT203",
  UnknownMember = "CHT204",
  ImmutableAssignment = "CHT205",
  ImportError = "CHT206",
  PipelineError = "CHT207",
  ScopeError = "CHT208",
  DuplicateArgument = "CHT209",
  LibraryRestriction = "CHT210",
  InvalidOperand = "CHT211",
  ContextualTypeRequired = "CHT212",

  // Lowerer (CHT300-CHT399)
  UnsupportedExpression = "CHT300",
  UnknownAction = "CHT301",
  InternalError = "CHT302",

  // Warnings (CHT900-CHT999)
  UnknownUnit = "CHT900",
  RecursiveCall = "CHT901",
  DocParamNotFound = "CHT902",
  DocParamDuplicate = "CHT903",
  DocParamOnVariable = "CHT904",
}

export interface Diagnostic {
  code: DiagnosticCode;
  severity: Severity;
  message: string;
  span: Span;
  suggestion?: string;
}

export class CompileError extends Error {
  constructor(public diagnostics: Diagnostic[]) {
    const count = diagnostics.length;
    const label = count === 1 ? "1 diagnostic" : `${count} diagnostics`;
    super(`compilation failed with ${label}`);
  }
}
