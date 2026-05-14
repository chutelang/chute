import type { Span } from "./token.ts";

export interface Program {
  kind: "Program";
  span: Span;
  metadata: ShortcutMetadata | undefined;
  body: Statement[];
}

export interface ShortcutMetadata {
  kind: "ShortcutMetadata";
  span: Span;
  fields: MetadataField[];
}

export interface MetadataField {
  kind: "MetadataField";
  span: Span;
  name: string;
  value: MetadataValue;
}

export type MetadataValue =
  | MetadataString
  | MetadataNumber
  | MetadataBoolean
  | MetadataNil
  | MetadataList
  | MetadataDotName;

export interface MetadataString {
  kind: "MetadataString";
  span: Span;
  value: string;
}

export interface MetadataNumber {
  kind: "MetadataNumber";
  span: Span;
  value: number;
  negative: boolean;
}

export interface MetadataBoolean {
  kind: "MetadataBoolean";
  span: Span;
  value: boolean;
}

export interface MetadataNil {
  kind: "MetadataNil";
  span: Span;
}

export interface MetadataList {
  kind: "MetadataList";
  span: Span;
  elements: MetadataValue[];
}

export interface MetadataDotName {
  kind: "MetadataDotName";
  span: Span;
  name: string;
  args: MetadataValue[] | undefined;
}

export type Statement = ExpressionStatement | LetDeclaration | VarDeclaration | Assignment;

export interface Assignment {
  kind: "Assignment";
  span: Span;
  place: Place;
  value: Expression;
}

export interface Place {
  kind: "Place";
  span: Span;
  root: string;
  accessors: PlaceAccessor[];
}

export type PlaceAccessor = FieldAccessor | SubscriptAccessor;

export interface FieldAccessor {
  kind: "FieldAccessor";
  span: Span;
  name: string;
}

export interface SubscriptAccessor {
  kind: "SubscriptAccessor";
  span: Span;
  index: Expression;
}

export interface ExpressionStatement {
  kind: "ExpressionStatement";
  span: Span;
  expression: Expression;
}

export interface LetDeclaration {
  kind: "LetDeclaration";
  span: Span;
  name: string;
  typeAnnotation: TypeAnnotation | undefined;
  initializer: Expression;
}

export interface VarDeclaration {
  kind: "VarDeclaration";
  span: Span;
  name: string;
  typeAnnotation: TypeAnnotation | undefined;
  initializer: Expression;
}

export interface TypeAnnotation {
  kind: "TypeAnnotation";
  span: Span;
  base: BaseType;
  optional: boolean;
}

export type BaseType = NamedType | ListType | QuantityType;

export interface NamedType {
  kind: "NamedType";
  span: Span;
  qualifier: string | undefined;
  name: string;
}

export interface ListType {
  kind: "ListType";
  span: Span;
  elementType: TypeAnnotation;
}

export interface QuantityType {
  kind: "QuantityType";
  span: Span;
  unit: string;
}

export type Expression =
  | CallExpression
  | MemberExpression
  | OptionalMemberExpression
  | SubscriptExpression
  | BinaryExpression
  | UnaryExpression
  | CoalesceExpression
  | Identifier
  | StringLiteral
  | NumberLiteral
  | BooleanLiteral
  | NilLiteral
  | InterpolatedString
  | ListLiteral
  | DictionaryLiteral;

export interface CallExpression {
  kind: "CallExpression";
  span: Span;
  callee: Expression;
  args: Argument[];
}

export interface MemberExpression {
  kind: "MemberExpression";
  span: Span;
  object: Expression;
  property: string;
}

export interface OptionalMemberExpression {
  kind: "OptionalMemberExpression";
  span: Span;
  object: Expression;
  property: string;
}

export interface SubscriptExpression {
  kind: "SubscriptExpression";
  span: Span;
  object: Expression;
  index: Expression;
}

export type BinaryOperator = "+" | "-" | "*" | "/" | "%";

export interface BinaryExpression {
  kind: "BinaryExpression";
  span: Span;
  operator: BinaryOperator;
  left: Expression;
  right: Expression;
}

export interface UnaryExpression {
  kind: "UnaryExpression";
  span: Span;
  operator: "-";
  operand: Expression;
}

export interface CoalesceExpression {
  kind: "CoalesceExpression";
  span: Span;
  left: Expression;
  right: Expression;
}

export interface Argument {
  kind: "Argument";
  span: Span;
  label: string | undefined;
  value: Expression;
}

export interface Identifier {
  kind: "Identifier";
  span: Span;
  name: string;
}

export interface StringLiteral {
  kind: "StringLiteral";
  span: Span;
  value: string;
}

export interface NumberLiteral {
  kind: "NumberLiteral";
  span: Span;
  value: number;
}

export interface BooleanLiteral {
  kind: "BooleanLiteral";
  span: Span;
  value: boolean;
}

export interface NilLiteral {
  kind: "NilLiteral";
  span: Span;
}

export interface InterpolatedString {
  kind: "InterpolatedString";
  span: Span;
  parts: InterpolatedPart[];
}

export type InterpolatedPart = TextPart | ExpressionPart;

export interface TextPart {
  kind: "TextPart";
  span: Span;
  value: string;
}

export interface ExpressionPart {
  kind: "ExpressionPart";
  span: Span;
  expression: Expression;
}

export interface ListLiteral {
  kind: "ListLiteral";
  span: Span;
  elements: Expression[];
}

export interface DictionaryLiteral {
  kind: "DictionaryLiteral";
  span: Span;
  entries: DictionaryEntry[];
}

export interface DictionaryEntry {
  kind: "DictionaryEntry";
  span: Span;
  key: Expression;
  value: Expression;
}
