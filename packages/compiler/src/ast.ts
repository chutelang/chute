import type { Span } from "./token.ts";

export interface Program {
  kind: "Program";
  span: Span;
  imports: ImportDeclaration[];
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

export type Statement =
  | ExpressionStatement
  | ConstDeclaration
  | ConstDestructure
  | LetDeclaration
  | LetDestructure
  | Assignment
  | IfStatement
  | ForStatement
  | RepeatStatement
  | MenuStatement
  | EnumDeclaration
  | RecordDeclaration
  | FunctionDeclaration
  | ReturnStatement
  | ActionDeclaration;

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

export interface ConstDeclaration {
  kind: "ConstDeclaration";
  span: Span;
  exported: boolean;
  name: string;
  typeAnnotation: TypeAnnotation | undefined;
  initializer: Expression;
}

export interface ConstDestructure {
  kind: "ConstDestructure";
  span: Span;
  names: string[];
  initializer: Expression;
}

export interface LetDeclaration {
  kind: "LetDeclaration";
  span: Span;
  exported: boolean;
  name: string;
  typeAnnotation: TypeAnnotation | undefined;
  initializer: Expression;
}

export interface LetDestructure {
  kind: "LetDestructure";
  span: Span;
  names: string[];
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
  | TernaryExpression
  | PipelineExpression
  | Identifier
  | StringLiteral
  | NumberLiteral
  | BooleanLiteral
  | NilLiteral
  | InterpolatedString
  | ListLiteral
  | DictionaryLiteral
  | DotNameExpression
  | HashIndexExpression
  | PlaceholderExpression;

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

export interface TernaryExpression {
  kind: "TernaryExpression";
  span: Span;
  condition: Condition;
  consequent: Expression;
  alternate: Expression;
}

export interface DotNameExpression {
  kind: "DotNameExpression";
  span: Span;
  name: string;
  resolvedBackingValue?: string;
}

export interface HashIndexExpression {
  kind: "HashIndexExpression";
  span: Span;
}

export type PipelineOperator = "|>" | "|>?";

export interface PipelineStage {
  kind: "PipelineStage";
  span: Span;
  operator: PipelineOperator;
  callee: Expression;
  args: Argument[];
}

export interface PipelineExpression {
  kind: "PipelineExpression";
  span: Span;
  input: Expression;
  stages: PipelineStage[];
}

export interface PlaceholderExpression {
  kind: "PlaceholderExpression";
  span: Span;
}

// Conditions appear only in `if` statements, ternary expressions, and `for` guards.

export type Condition =
  | OrCondition
  | AndCondition
  | NotCondition
  | Comparison
  | RangeTest
  | TypeTest
  | BooleanReference
  | BooleanLiteralCondition;

export interface OrCondition {
  kind: "OrCondition";
  span: Span;
  left: Condition;
  right: Condition;
}

export interface AndCondition {
  kind: "AndCondition";
  span: Span;
  left: Condition;
  right: Condition;
}

export interface NotCondition {
  kind: "NotCondition";
  span: Span;
  operand: Condition;
}

export type ComparisonOperator =
  | "=="
  | "!="
  | ">"
  | ">="
  | "<"
  | "<="
  | "contains"
  | "!contains"
  | "hasPrefix"
  | "hasSuffix";

export interface Comparison {
  kind: "Comparison";
  span: Span;
  left: Expression;
  operator: ComparisonOperator;
  right: Expression;
}

export interface RangeTest {
  kind: "RangeTest";
  span: Span;
  subject: Expression;
  low: Expression;
  high: Expression;
}

export interface TypeTest {
  kind: "TypeTest";
  span: Span;
  subject: Expression;
  testType: BaseType;
}

export interface BooleanReference {
  kind: "BooleanReference";
  span: Span;
  subject: Expression;
}

export interface BooleanLiteralCondition {
  kind: "BooleanLiteralCondition";
  span: Span;
  value: boolean;
}

// Control flow statements

export interface IfStatement {
  kind: "IfStatement";
  span: Span;
  condition: Condition;
  body: Statement[];
  elseBody: Statement[] | IfStatement | undefined;
}

export interface ForStatement {
  kind: "ForStatement";
  span: Span;
  variable: string;
  iterable: Expression;
  body: Statement[];
}

export interface RepeatStatement {
  kind: "RepeatStatement";
  span: Span;
  count: Expression;
  body: Statement[];
}

export interface MenuStatement {
  kind: "MenuStatement";
  span: Span;
  prompt: Expression;
  variable: string | undefined;
  variableType: TypeAnnotation | undefined;
  cases: MenuCase[];
}

export interface MenuCase {
  kind: "MenuCase";
  span: Span;
  label: string;
  body: Statement[];
}

export interface EnumDeclaration {
  kind: "EnumDeclaration";
  span: Span;
  exported: boolean;
  name: string;
  defaultValue: string | undefined;
  cases: EnumCaseNode[];
}

export interface EnumCaseNode {
  kind: "EnumCase";
  span: Span;
  name: string;
  value: string | undefined;
}

export interface RecordDeclaration {
  kind: "RecordDeclaration";
  span: Span;
  exported: boolean;
  name: string;
  fields: RecordFieldNode[];
}

export interface RecordFieldNode {
  kind: "RecordField";
  span: Span;
  name: string;
  type: TypeAnnotation;
}

export interface FunctionParameter {
  kind: "FunctionParameter";
  span: Span;
  name: string;
  type: TypeAnnotation;
  defaultValue: Expression | undefined;
}

export interface FunctionDeclaration {
  kind: "FunctionDeclaration";
  span: Span;
  exported: boolean;
  name: string;
  params: FunctionParameter[];
  returnType: TypeAnnotation | undefined;
  body: Statement[];
}

export interface ReturnStatement {
  kind: "ReturnStatement";
  span: Span;
  value: Expression | undefined;
}

export interface ActionParameter {
  kind: "ActionParameter";
  span: Span;
  label: string;
  name: string;
  type: TypeAnnotation;
  defaultValue: Expression | undefined;
}

export type AttributeValue =
  | MetadataString
  | MetadataNumber
  | MetadataBoolean
  | MetadataNil
  | AttributeIdentifier;

export interface AttributeIdentifier {
  kind: "AttributeIdentifier";
  span: Span;
  name: string;
}

export interface AttributeArgument {
  kind: "AttributeArgument";
  span: Span;
  label: string | undefined;
  value: AttributeValue;
}

export interface Attribute {
  kind: "Attribute";
  span: Span;
  name: string;
  args: AttributeArgument[] | undefined;
}

export interface ActionDeclaration {
  kind: "ActionDeclaration";
  span: Span;
  exported: boolean;
  name: string;
  params: ActionParameter[];
  returnType: TypeAnnotation | undefined;
  runtimeIdentifier: string;
  attributes: Attribute[];
}

export interface ImportDeclaration {
  kind: "ImportDeclaration";
  span: Span;
  path: string;
  alias: string;
  isPackage: boolean;
}

export function resolveEnumBackingValue(
  caseName: string,
  caseValue: string | undefined,
  enumDefault: string | undefined,
): string {
  if (caseValue !== undefined) {
    return caseValue;
  }
  if (enumDefault !== undefined) {
    return `${enumDefault}.${caseName}`;
  }
  return caseName;
}

export function resolveStageCalleeName(callee: Expression): string | undefined {
  if (callee.kind === "Identifier") {
    return callee.name;
  }
  if (callee.kind === "MemberExpression") {
    return resolveStageCalleeName(callee.object);
  }
  return undefined;
}
