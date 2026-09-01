import type { Span } from "./token.ts";
import { DiagnosticCode, CompileError } from "./diagnostic.ts";
import type { Diagnostic } from "./diagnostic.ts";
import { resolveEnumBackingValue, resolveStageCalleeName } from "./ast.ts";
import type {
  ActionDeclaration,
  Assignment,
  BinaryExpression,
  BinaryOperator,
  CallExpression,
  CoalesceExpression,
  Condition,
  ConstDeclaration,
  ConstDestructure,
  DictionaryLiteral,
  EnumDeclaration,
  Expression,
  ForStatement,
  FunctionDeclaration,
  IfStatement,
  InterpolatedString,
  LetDeclaration,
  LetDestructure,
  ListLiteral,
  MenuStatement,
  PipelineExpression,
  PipelineStage,
  Program,
  RecordDeclaration,
  RepeatStatement,
  ReturnStatement,
  Statement,
  SubscriptExpression,
  TernaryExpression,
  UnaryExpression,
} from "./ast.ts";
import type {
  ActionIR,
  CompilationResult,
  InterpolatedText,
  InterpolatedTextPart,
  ParameterValue,
  ShortcutIR,
} from "./ir.ts";
import { getStdlibActions } from "./stdlib.ts";

export class LowerError extends Error {
  constructor(
    message: string,
    public span: Span = { start: 0, end: 0 },
    public code: DiagnosticCode = DiagnosticCode.UnsupportedExpression,
  ) {
    super(message);
  }
}

interface LowerContext {
  uuidCounter: number;
  tempCounter: number;
  enums: Map<string, Map<string, string>>;
  records: Set<string>;
  functions: Map<string, FunctionDeclaration>;
  actions: Map<string, ActionDeclaration>;
  subShortcuts: ShortcutIR[];
}

export function lower(program: Program): CompilationResult {
  const name = extractName(program);
  const actions: ActionIR[] = [];
  const enums = new Map<string, Map<string, string>>();
  const records = new Set<string>();
  const functions = new Map<string, FunctionDeclaration>();
  const actionDecls = new Map<string, ActionDeclaration>(getStdlibActions());
  const collectedErrors: Diagnostic[] = [];

  for (const stmt of program.body) {
    if (stmt.kind === "EnumDeclaration") {
      collectEnum(stmt, enums);
    } else if (stmt.kind === "RecordDeclaration") {
      records.add(stmt.name);
    } else if (stmt.kind === "FunctionDeclaration") {
      functions.set(stmt.name, stmt);
    } else if (stmt.kind === "ActionDeclaration") {
      actionDecls.set(stmt.name, stmt);
    }
  }

  const subShortcuts: ShortcutIR[] = [];

  const ctx: LowerContext = {
    uuidCounter: 0,
    tempCounter: 0,
    enums,
    records,
    functions,
    actions: actionDecls,
    subShortcuts,
  };

  for (const [, decl] of functions) {
    try {
      const subShortcut = lowerFunctionToSubShortcut(decl, ctx);
      subShortcuts.push(subShortcut);
    } catch (e) {
      if (e instanceof LowerError) {
        collectedErrors.push(lowerErrorToDiagnostic(e));
      } else {
        throw e;
      }
    }
  }

  for (const stmt of program.body) {
    try {
      lowerStatement(stmt, actions, ctx);
    } catch (e) {
      if (e instanceof LowerError) {
        collectedErrors.push(lowerErrorToDiagnostic(e));
      } else {
        throw e;
      }
    }
  }

  if (collectedErrors.length > 0) {
    throw new CompileError(collectedErrors);
  }

  return {
    main: { name, actions },
    subShortcuts,
  };
}

function lowerErrorToDiagnostic(e: LowerError): Diagnostic {
  return {
    code: e.code,
    severity: "error",
    message: e.message,
    span: e.span,
  };
}

function lowerFunctionToSubShortcut(decl: FunctionDeclaration, ctx: LowerContext): ShortcutIR {
  const subCtx: LowerContext = {
    uuidCounter: 0,
    tempCounter: 0,
    enums: ctx.enums,
    records: ctx.records,
    functions: ctx.functions,
    actions: ctx.actions,
    subShortcuts: ctx.subShortcuts,
  };

  const actions: ActionIR[] = [];

  if (decl.params.length > 0) {
    const inputTempName = nextTempName(subCtx);
    actions.push(makeGetVariableAction("Shortcut Input", subCtx));
    actions.push(makeSetVariableAction(inputTempName, subCtx));

    for (const param of decl.params) {
      actions.push(makeGetVariableAction(inputTempName, subCtx));

      const parameters = new Map<string, ParameterValue>();
      parameters.set("WFDictionaryKey", param.name);
      actions.push({
        identifier: "is.workflow.actions.getvalueforkey",
        uuid: nextUuid(subCtx),
        parameters,
      });
      actions.push(makeSetVariableAction(param.name, subCtx));
    }
  }

  for (const stmt of decl.body) {
    lowerStatement(stmt, actions, subCtx);
  }

  const subName = deriveFunctionShortcutName(decl);
  return { name: subName, actions };
}

function deriveFunctionShortcutName(decl: FunctionDeclaration): string {
  const content = JSON.stringify(
    stripSpans({
      params: decl.params.map((p) => ({
        name: p.name,
        type: p.type,
      })),
      body: decl.body,
      returnType: decl.returnType,
    }),
  );
  const hash = simpleHash(content);
  return `${decl.name}_${hash}`;
}

/**
 * Removes `span` fields recursively so that source positions don.t affect
 * content hashes.
 */
function stripSpans(obj: unknown): unknown {
  if (obj === null || obj === undefined || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(stripSpans);
  }
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (key === "span") {
      continue;
    }
    result[key] = stripSpans(value);
  }
  return result;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return (hash >>> 0).toString(16);
}

function collectEnum(decl: EnumDeclaration, enums: Map<string, Map<string, string>>): void {
  const cases = new Map<string, string>();
  for (const c of decl.cases) {
    cases.set(c.name, resolveEnumBackingValue(c.name, c.value, decl.defaultValue));
  }
  enums.set(decl.name, cases);
}

function extractName(program: Program): string {
  if (!program.metadata) {
    return "Untitled Shortcut";
  }

  for (const field of program.metadata.fields) {
    if (field.name === "name" && field.value.kind === "MetadataString") {
      return field.value.value;
    }
  }

  return "Untitled Shortcut";
}

function lowerStatement(stmt: Statement, actions: ActionIR[], ctx: LowerContext): void {
  switch (stmt.kind) {
    case "ExpressionStatement":
      lowerExpressionStatement(stmt.expression, actions, ctx);
      return;
    case "ConstDeclaration":
      lowerDeclaration(stmt, actions, ctx);
      return;
    case "LetDeclaration":
      lowerDeclaration(stmt, actions, ctx);
      return;
    case "Assignment":
      lowerAssignment(stmt, actions, ctx);
      return;
    case "IfStatement":
      lowerIfStatement(stmt, actions, ctx);
      return;
    case "ForStatement":
      lowerForStatement(stmt, actions, ctx);
      return;
    case "RepeatStatement":
      lowerRepeatStatement(stmt, actions, ctx);
      return;
    case "MenuStatement":
      lowerMenuStatement(stmt, actions, ctx);
      return;
    case "ConstDestructure":
      lowerConstDestructure(stmt, actions, ctx);
      return;
    case "LetDestructure":
      lowerLetDestructure(stmt, actions, ctx);
      return;
    case "EnumDeclaration":
      return;
    case "RecordDeclaration":
      return;
    case "FunctionDeclaration":
      return;
    case "ReturnStatement":
      lowerReturnStatement(stmt, actions, ctx);
      return;
    case "ActionDeclaration":
      return;
    default:
      assertNever(stmt);
  }
}

function lowerExpressionStatement(expr: Expression, actions: ActionIR[], ctx: LowerContext): void {
  if (expr.kind !== "CallExpression" && expr.kind !== "PipelineExpression") {
    throw new LowerError(`expression statements must be action calls, got ${expr.kind}`, expr.span);
  }

  lowerExpression(expr, actions, ctx);
}

function lowerDeclaration(
  decl: ConstDeclaration | LetDeclaration,
  actions: ActionIR[],
  ctx: LowerContext,
): void {
  lowerExpression(decl.initializer, actions, ctx);
  actions.push(makeSetVariableAction(decl.name, ctx));
}

function lowerAssignment(assign: Assignment, actions: ActionIR[], ctx: LowerContext): void {
  if (assign.place.accessors.length > 0) {
    throw new LowerError("assignment to nested places is not yet supported", assign.span);
  }

  lowerExpression(assign.value, actions, ctx);
  actions.push(makeSetVariableAction(assign.place.root, ctx));
}

function lowerReturnStatement(stmt: ReturnStatement, actions: ActionIR[], ctx: LowerContext): void {
  if (stmt.value) {
    lowerExpression(stmt.value, actions, ctx);
  }
  actions.push({
    identifier: "is.workflow.actions.output",
    uuid: nextUuid(ctx),
    parameters: new Map(),
  });
}

function lowerExpression(expr: Expression, actions: ActionIR[], ctx: LowerContext): void {
  switch (expr.kind) {
    case "CallExpression":
      if (expr.callee.kind === "Identifier" && ctx.records.has(expr.callee.name)) {
        lowerRecordConstruction(expr, actions, ctx);
        return;
      }
      actions.push(lowerCall(expr, actions, ctx));
      return;
    case "StringLiteral":
      actions.push(makeTextAction(expr.value, ctx));
      return;
    case "NumberLiteral":
      actions.push(makeNumberAction(expr.value, ctx));
      return;
    case "BooleanLiteral":
      actions.push(makeTextAction(expr.value ? "true" : "false", ctx));
      return;
    case "NilLiteral":
      actions.push(makeNothingAction(ctx));
      return;
    case "Identifier":
      actions.push(makeGetVariableAction(expr.name, ctx));
      return;
    case "InterpolatedString":
      actions.push(makeInterpolatedTextAction(expr, actions, ctx));
      return;
    case "BinaryExpression":
      lowerBinaryExpression(expr, actions, ctx);
      return;
    case "UnaryExpression":
      lowerUnaryExpression(expr, actions, ctx);
      return;
    case "CoalesceExpression":
      lowerCoalesceExpression(expr, actions, ctx);
      return;
    case "ListLiteral":
      lowerListLiteral(expr, actions, ctx);
      return;
    case "DictionaryLiteral":
      lowerDictionaryLiteral(expr, actions, ctx);
      return;
    case "MemberExpression":
      if (expr.object.kind === "Identifier" && ctx.enums.has(expr.object.name)) {
        lowerEnumMemberAccess(expr.object.name, expr.property, expr.span, actions, ctx);
        return;
      }
      lowerKeyedAccess(expr.object, expr.property, actions, ctx);
      return;
    case "OptionalMemberExpression":
      lowerKeyedAccess(expr.object, expr.property, actions, ctx);
      return;
    case "SubscriptExpression":
      lowerSubscriptExpression(expr, actions, ctx);
      return;
    case "TernaryExpression":
      lowerTernaryExpression(expr, actions, ctx);
      return;
    case "DotNameExpression":
      lowerDotNameExpression(expr, actions, ctx);
      return;
    case "PipelineExpression":
      lowerPipelineExpression(expr, actions, ctx);
      return;
    case "PlaceholderExpression":
      throw new LowerError(
        "'_' placeholder cannot appear outside a pipeline stage",
        expr.span,
        DiagnosticCode.PipelineError,
      );
    case "HashIndexExpression":
      lowerHashIndexExpression(actions, ctx);
      return;
    default:
      assertNever(expr);
  }
}

function lowerCall(expr: CallExpression, actions: ActionIR[], ctx: LowerContext): ActionIR {
  if (expr.callee.kind !== "Identifier") {
    throw new LowerError("only direct action calls are supported in this subset", expr.callee.span);
  }

  const actionName = expr.callee.name;
  const funcDecl = ctx.functions.get(actionName);

  if (funcDecl) {
    return lowerFunctionCall(expr, funcDecl, actions, ctx);
  }

  const actionDecl = ctx.actions.get(actionName);

  if (actionDecl) {
    return lowerDeclaredActionCall(expr, actionDecl, actions, ctx);
  }

  throw new LowerError(
    `unknown action: ${actionName}`,
    expr.callee.span,
    DiagnosticCode.UnknownAction,
  );
}

function lowerFunctionCall(
  expr: CallExpression,
  decl: FunctionDeclaration,
  actions: ActionIR[],
  ctx: LowerContext,
): ActionIR {
  actions.push({
    identifier: "is.workflow.actions.dictionary",
    uuid: nextUuid(ctx),
    parameters: new Map(),
  });

  const provided = new Map<string, Expression>();
  for (const arg of expr.args) {
    if (arg.label) {
      provided.set(arg.label, arg.value);
    }
  }

  for (const param of decl.params) {
    const valueExpr = provided.get(param.name) ?? param.defaultValue;
    if (!valueExpr) {
      continue;
    }

    const key = param.name;
    const value = lowerToParamValue(valueExpr, actions, ctx);

    const parameters = new Map<string, ParameterValue>();
    parameters.set("WFDictionaryKey", key);
    parameters.set("WFDictionaryValue", value);

    actions.push({
      identifier: "is.workflow.actions.setvalueforkey",
      uuid: nextUuid(ctx),
      parameters,
    });
  }

  const subName = deriveFunctionShortcutName(decl);

  const runParams = new Map<string, ParameterValue>();
  runParams.set("WFWorkflowName", subName);

  return {
    identifier: "is.workflow.actions.runworkflow",
    uuid: nextUuid(ctx),
    parameters: runParams,
  };
}

function lowerDeclaredActionCall(
  expr: CallExpression,
  decl: ActionDeclaration,
  parentActions: ActionIR[],
  ctx: LowerContext,
): ActionIR {
  const parameters = new Map<string, ParameterValue>();

  const provided = new Map<string, Expression>();
  for (const arg of expr.args) {
    if (arg.label) {
      provided.set(arg.label, arg.value);
    }
  }

  for (const param of decl.params) {
    const valueExpr = provided.get(param.label) ?? param.defaultValue;
    if (!valueExpr) {
      continue;
    }
    parameters.set(param.name, lowerToParamValue(valueExpr, parentActions, ctx));
  }

  return {
    identifier: decl.runtimeIdentifier,
    uuid: nextUuid(ctx),
    parameters,
  };
}

function lowerBinaryExpression(
  expr: BinaryExpression,
  actions: ActionIR[],
  ctx: LowerContext,
): void {
  lowerExpression(expr.left, actions, ctx);
  const operand = lowerOperandPreservingMagicVariable(expr.right, actions, ctx);

  const parameters = new Map<string, ParameterValue>();
  parameters.set("WFMathOperation", mathOperationSymbol(expr.operator));
  parameters.set("WFMathOperand", operand);

  actions.push({
    identifier: "is.workflow.actions.math",
    uuid: nextUuid(ctx),
    parameters,
  });
}

function lowerUnaryExpression(expr: UnaryExpression, actions: ActionIR[], ctx: LowerContext): void {
  lowerExpression(expr.operand, actions, ctx);

  const parameters = new Map<string, ParameterValue>();
  parameters.set("WFMathOperation", "×");
  parameters.set("WFMathOperand", -1);

  actions.push({
    identifier: "is.workflow.actions.math",
    uuid: nextUuid(ctx),
    parameters,
  });
}

function lowerCoalesceExpression(
  expr: CoalesceExpression,
  actions: ActionIR[],
  ctx: LowerContext,
): void {
  const groupId = nextUuid(ctx);

  lowerExpression(expr.left, actions, ctx);
  actions.push(makeConditionalAction(0, groupId, ctx, { WFCondition: 100 }));

  lowerExpression(expr.left, actions, ctx);
  actions.push(makeConditionalAction(1, groupId, ctx));

  lowerExpression(expr.right, actions, ctx);
  actions.push(makeConditionalAction(2, groupId, ctx));
}

function lowerListLiteral(expr: ListLiteral, actions: ActionIR[], ctx: LowerContext): void {
  for (const element of expr.elements) {
    lowerExpression(element, actions, ctx);
  }

  actions.push({
    identifier: "is.workflow.actions.list",
    uuid: nextUuid(ctx),
    parameters: new Map(),
  });
}

function lowerDictionaryLiteral(
  expr: DictionaryLiteral,
  actions: ActionIR[],
  ctx: LowerContext,
): void {
  actions.push({
    identifier: "is.workflow.actions.dictionary",
    uuid: nextUuid(ctx),
    parameters: new Map(),
  });

  for (const entry of expr.entries) {
    const key = lowerToParamValue(entry.key, actions, ctx);
    const value = lowerToParamValue(entry.value, actions, ctx);

    const parameters = new Map<string, ParameterValue>();
    parameters.set("WFDictionaryKey", key);
    parameters.set("WFDictionaryValue", value);

    actions.push({
      identifier: "is.workflow.actions.setvalueforkey",
      uuid: nextUuid(ctx),
      parameters,
    });
  }
}

function lowerKeyedAccess(
  object: Expression,
  key: string,
  actions: ActionIR[],
  ctx: LowerContext,
): void {
  lowerExpression(object, actions, ctx);

  const parameters = new Map<string, ParameterValue>();
  parameters.set("WFDictionaryKey", key);

  actions.push({
    identifier: "is.workflow.actions.getvalueforkey",
    uuid: nextUuid(ctx),
    parameters,
  });
}

function lowerSubscriptExpression(
  expr: SubscriptExpression,
  actions: ActionIR[],
  ctx: LowerContext,
): void {
  lowerExpression(expr.object, actions, ctx);
  const key = lowerOperandPreservingMagicVariable(expr.index, actions, ctx);

  const parameters = new Map<string, ParameterValue>();
  parameters.set("WFDictionaryKey", key);

  actions.push({
    identifier: "is.workflow.actions.getvalueforkey",
    uuid: nextUuid(ctx),
    parameters,
  });
}

/**
 * Lowers an operand expression to a `ParameterValue` while preserving the
 * caller.s current magic variable.
 *
 * `lowerToParamValue` can emit actions for a complex operand, such as a nested
 * binary expression), and those actions overwrite the magic variable. If the
 * caller still needs the magic variable it was holding before this operand
 * was lowered (e.g. the left side of `a + b * c`), that value must be saved
 * to a temp variable first and restored afterward.
 */
function lowerOperandPreservingMagicVariable(
  expr: Expression,
  actions: ActionIR[],
  ctx: LowerContext,
): ParameterValue {
  if (isSideEffectFreeValue(expr)) {
    return lowerToParamValue(expr, actions, ctx);
  }

  const savedName = nextTempName(ctx);
  actions.push(makeSetVariableAction(savedName, ctx));

  const value = lowerToParamValue(expr, actions, ctx);

  actions.push(makeGetVariableAction(savedName, ctx));

  return value;
}

/**
 * Returns `true` if `lowerToParamValue` can.t emit actions or overwrite the
 * current magic variable.
 */
function isSideEffectFreeValue(expr: Expression): boolean {
  switch (expr.kind) {
    case "StringLiteral":
    case "NumberLiteral":
    case "BooleanLiteral":
    case "Identifier":
      return true;
    case "InterpolatedString":
      return expr.parts.every(
        (part) => part.kind === "TextPart" || part.expression.kind === "Identifier",
      );
    default:
      return false;
  }
}

function lowerToParamValue(
  expr: Expression,
  actions: ActionIR[],
  ctx: LowerContext,
): ParameterValue {
  switch (expr.kind) {
    case "StringLiteral":
      return expr.value;
    case "NumberLiteral":
      return expr.value;
    case "BooleanLiteral":
      return expr.value;
    case "Identifier":
      return {
        kind: "VariableRef",
        name: expr.name,
      };
    case "InterpolatedString":
      return buildInterpolatedText(expr, actions, ctx);
    default: {
      lowerExpression(expr, actions, ctx);
      const tempName = nextTempName(ctx);
      actions.push(makeSetVariableAction(tempName, ctx));
      return {
        kind: "VariableRef",
        name: tempName,
      };
    }
  }
}

function buildInterpolatedText(
  expr: InterpolatedString,
  actions: ActionIR[],
  ctx: LowerContext,
): InterpolatedText {
  const parts: InterpolatedTextPart[] = [];

  for (const part of expr.parts) {
    if (part.kind === "TextPart") {
      parts.push({
        kind: "text",
        value: part.value,
      });
    } else {
      parts.push({
        kind: "variable",
        name: resolveVariableName(part.expression, actions, ctx),
      });
    }
  }

  return {
    kind: "InterpolatedText",
    parts,
  };
}

function resolveVariableName(expr: Expression, actions: ActionIR[], ctx: LowerContext): string {
  if (expr.kind === "Identifier") {
    return expr.name;
  }

  lowerExpression(expr, actions, ctx);
  const tempName = nextTempName(ctx);
  actions.push(makeSetVariableAction(tempName, ctx));
  return tempName;
}

function makeTextAction(value: string, ctx: LowerContext): ActionIR {
  const parameters = new Map<string, ParameterValue>();
  parameters.set("WFTextActionText", value);
  return {
    identifier: "is.workflow.actions.gettext",
    uuid: nextUuid(ctx),
    parameters,
  };
}

function makeInterpolatedTextAction(
  expr: InterpolatedString,
  actions: ActionIR[],
  ctx: LowerContext,
): ActionIR {
  const text = buildInterpolatedText(expr, actions, ctx);
  const parameters = new Map<string, ParameterValue>();
  parameters.set("WFTextActionText", text);
  return {
    identifier: "is.workflow.actions.gettext",
    uuid: nextUuid(ctx),
    parameters,
  };
}

function makeNumberAction(value: number, ctx: LowerContext): ActionIR {
  const parameters = new Map<string, ParameterValue>();
  parameters.set("WFNumberActionNumber", value);
  return {
    identifier: "is.workflow.actions.number",
    uuid: nextUuid(ctx),
    parameters,
  };
}

function makeNothingAction(ctx: LowerContext): ActionIR {
  return {
    identifier: "is.workflow.actions.nothing",
    uuid: nextUuid(ctx),
    parameters: new Map(),
  };
}

function makeGetVariableAction(name: string, ctx: LowerContext): ActionIR {
  const parameters = new Map<string, ParameterValue>();
  parameters.set("WFVariable", {
    kind: "VariableRef",
    name,
  });
  return {
    identifier: "is.workflow.actions.getvariable",
    uuid: nextUuid(ctx),
    parameters,
  };
}

function makeSetVariableAction(name: string, ctx: LowerContext): ActionIR {
  const parameters = new Map<string, ParameterValue>();
  parameters.set("WFVariableName", name);
  return {
    identifier: "is.workflow.actions.setvariable",
    uuid: nextUuid(ctx),
    parameters,
  };
}

function makeConditionalAction(
  mode: number,
  groupId: string,
  ctx: LowerContext,
  extra?: Record<string, ParameterValue>,
): ActionIR {
  const parameters = new Map<string, ParameterValue>();

  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      parameters.set(key, value);
    }
  }

  parameters.set("WFControlFlowMode", mode);

  return {
    identifier: "is.workflow.actions.conditional",
    uuid: nextUuid(ctx),
    parameters,
    groupingIdentifier: groupId,
  };
}

function mathOperationSymbol(operator: BinaryOperator): string {
  switch (operator) {
    case "+":
      return "+";
    case "-":
      return "-";
    case "*":
      return "×";
    case "/":
      return "÷";
    case "%":
      return "Mod";
    default:
      return assertNever(operator);
  }
}

function nextUuid(ctx: LowerContext): string {
  const id = ctx.uuidCounter;
  ctx.uuidCounter += 1;
  return `00000000-0000-0000-0000-${id.toString().padStart(12, "0")}`;
}

function nextTempName(ctx: LowerContext): string {
  const id = ctx.tempCounter;
  ctx.tempCounter += 1;
  return `__chute_tmp_${id}`;
}

function lowerIfStatement(stmt: IfStatement, actions: ActionIR[], ctx: LowerContext): void {
  emitConditionBlock(
    stmt.condition,
    actions,
    ctx,
    () => {
      for (const s of stmt.body) {
        lowerStatement(s, actions, ctx);
      }
    },
    stmt.elseBody
      ? () => {
          if (Array.isArray(stmt.elseBody)) {
            for (const s of stmt.elseBody) {
              lowerStatement(s, actions, ctx);
            }
          } else if (stmt.elseBody) {
            lowerIfStatement(stmt.elseBody, actions, ctx);
          }
        }
      : undefined,
  );
}

function lowerForStatement(stmt: ForStatement, actions: ActionIR[], ctx: LowerContext): void {
  const groupId = nextUuid(ctx);

  lowerExpression(stmt.iterable, actions, ctx);

  const parameters = new Map<string, ParameterValue>();
  parameters.set("WFControlFlowMode", 0);
  actions.push({
    identifier: "is.workflow.actions.repeat.each",
    uuid: nextUuid(ctx),
    parameters,
    groupingIdentifier: groupId,
  });

  actions.push(makeSetVariableAction(stmt.variable, ctx));

  for (const s of stmt.body) {
    lowerStatement(s, actions, ctx);
  }

  const endParams = new Map<string, ParameterValue>();
  endParams.set("WFControlFlowMode", 2);
  actions.push({
    identifier: "is.workflow.actions.repeat.each",
    uuid: nextUuid(ctx),
    parameters: endParams,
    groupingIdentifier: groupId,
  });
}

function lowerRepeatStatement(stmt: RepeatStatement, actions: ActionIR[], ctx: LowerContext): void {
  const groupId = nextUuid(ctx);
  const count = lowerToParamValue(stmt.count, actions, ctx);

  const parameters = new Map<string, ParameterValue>();
  parameters.set("WFControlFlowMode", 0);
  parameters.set("WFRepeatCount", count);
  actions.push({
    identifier: "is.workflow.actions.repeat.count",
    uuid: nextUuid(ctx),
    parameters,
    groupingIdentifier: groupId,
  });

  for (const s of stmt.body) {
    lowerStatement(s, actions, ctx);
  }

  const endParams = new Map<string, ParameterValue>();
  endParams.set("WFControlFlowMode", 2);
  actions.push({
    identifier: "is.workflow.actions.repeat.count",
    uuid: nextUuid(ctx),
    parameters: endParams,
    groupingIdentifier: groupId,
  });
}

function lowerMenuStatement(stmt: MenuStatement, actions: ActionIR[], ctx: LowerContext): void {
  const groupId = nextUuid(ctx);
  const prompt = lowerToParamValue(stmt.prompt, actions, ctx);

  const startParams = new Map<string, ParameterValue>();
  startParams.set("WFControlFlowMode", 0);
  startParams.set("WFMenuPrompt", prompt);
  const items: string[] = stmt.cases.map((c) => c.label);
  startParams.set("WFMenuItems", items.join("\n"));
  actions.push({
    identifier: "is.workflow.actions.choosefrommenu",
    uuid: nextUuid(ctx),
    parameters: startParams,
    groupingIdentifier: groupId,
  });

  for (const c of stmt.cases) {
    const caseParams = new Map<string, ParameterValue>();
    caseParams.set("WFControlFlowMode", 1);
    caseParams.set("WFMenuItemTitle", c.label);
    actions.push({
      identifier: "is.workflow.actions.choosefrommenu",
      uuid: nextUuid(ctx),
      parameters: caseParams,
      groupingIdentifier: groupId,
    });

    for (const s of c.body) {
      lowerStatement(s, actions, ctx);
    }
  }

  const endParams = new Map<string, ParameterValue>();
  endParams.set("WFControlFlowMode", 2);
  actions.push({
    identifier: "is.workflow.actions.choosefrommenu",
    uuid: nextUuid(ctx),
    parameters: endParams,
    groupingIdentifier: groupId,
  });
}

function lowerTernaryExpression(
  expr: TernaryExpression,
  actions: ActionIR[],
  ctx: LowerContext,
): void {
  emitConditionBlock(
    expr.condition,
    actions,
    ctx,
    () => {
      lowerExpression(expr.consequent, actions, ctx);
    },
    () => {
      lowerExpression(expr.alternate, actions, ctx);
    },
  );
}

function lowerHashIndexExpression(actions: ActionIR[], ctx: LowerContext): void {
  actions.push(makeGetVariableAction("Repeat Index", ctx));
}

function emitConditionBlock(
  cond: Condition,
  actions: ActionIR[],
  ctx: LowerContext,
  thenBranch: () => void,
  elseBranch: (() => void) | undefined,
): void {
  switch (cond.kind) {
    case "Comparison":
      emitComparisonBlock(cond, actions, ctx, thenBranch, elseBranch);
      return;
    case "RangeTest":
      emitRangeTestBlock(cond, actions, ctx, thenBranch, elseBranch);
      return;
    case "TypeTest":
      emitTypeTestBlock(cond, actions, ctx, thenBranch, elseBranch);
      return;
    case "BooleanReference":
      emitBoolRefBlock(cond.subject, false, actions, ctx, thenBranch, elseBranch);
      return;
    case "BooleanLiteralCondition":
      if (cond.value) {
        thenBranch();
      } else if (elseBranch) {
        elseBranch();
      }
      return;
    case "NotCondition":
      emitConditionBlock(cond.operand, actions, ctx, elseBranch ?? (() => {}), thenBranch);
      return;
    case "AndCondition":
      emitConditionBlock(
        cond.left,
        actions,
        ctx,
        () => {
          emitConditionBlock(cond.right, actions, ctx, thenBranch, elseBranch);
        },
        elseBranch,
      );
      return;
    case "OrCondition":
      emitOrConditionBlock(cond, actions, ctx, thenBranch, elseBranch);
      return;
  }
}

function emitComparisonBlock(
  cond: import("./ast.ts").Comparison,
  actions: ActionIR[],
  ctx: LowerContext,
  thenBranch: () => void,
  elseBranch: (() => void) | undefined,
): void {
  const groupId = nextUuid(ctx);

  lowerExpression(cond.left, actions, ctx);
  const rightValue = lowerOperandPreservingMagicVariable(cond.right, actions, ctx);
  const condCode = comparisonConditionCode(cond.operator);

  const extra: Record<string, ParameterValue> = {
    WFCondition: condCode,
  };

  if (typeof rightValue === "number") {
    extra["WFNumberValue"] = rightValue;
  } else {
    extra["WFConditionalActionString"] = rightValue;
  }

  actions.push(makeConditionalAction(0, groupId, ctx, extra));
  thenBranch();
  if (elseBranch) {
    actions.push(makeConditionalAction(1, groupId, ctx));
    elseBranch();
  }
  actions.push(makeConditionalAction(2, groupId, ctx));
}

function emitRangeTestBlock(
  cond: import("./ast.ts").RangeTest,
  actions: ActionIR[],
  ctx: LowerContext,
  thenBranch: () => void,
  elseBranch: (() => void) | undefined,
): void {
  const groupId = nextUuid(ctx);

  lowerExpression(cond.subject, actions, ctx);
  const lowValue = lowerOperandPreservingMagicVariable(cond.low, actions, ctx);
  const highValue = lowerToParamValue(cond.high, actions, ctx);

  const extra: Record<string, ParameterValue> = {
    WFCondition: 999,
    WFNumberValue: lowValue,
    WFAnotherNumber: highValue,
  };

  actions.push(makeConditionalAction(0, groupId, ctx, extra));
  thenBranch();
  if (elseBranch) {
    actions.push(makeConditionalAction(1, groupId, ctx));
    elseBranch();
  }
  actions.push(makeConditionalAction(2, groupId, ctx));
}

function emitTypeTestBlock(
  cond: import("./ast.ts").TypeTest,
  actions: ActionIR[],
  ctx: LowerContext,
  thenBranch: () => void,
  elseBranch: (() => void) | undefined,
): void {
  const groupId = nextUuid(ctx);

  lowerExpression(cond.subject, actions, ctx);

  const extra: Record<string, ParameterValue> = {
    WFCondition: 100,
  };

  actions.push(makeConditionalAction(0, groupId, ctx, extra));
  thenBranch();
  if (elseBranch) {
    actions.push(makeConditionalAction(1, groupId, ctx));
    elseBranch();
  }
  actions.push(makeConditionalAction(2, groupId, ctx));
}

function emitBoolRefBlock(
  subject: Expression,
  _negate: boolean,
  actions: ActionIR[],
  ctx: LowerContext,
  thenBranch: () => void,
  elseBranch: (() => void) | undefined,
): void {
  const groupId = nextUuid(ctx);

  lowerExpression(subject, actions, ctx);

  const extra: Record<string, ParameterValue> = {
    WFCondition: 100,
  };

  actions.push(makeConditionalAction(0, groupId, ctx, extra));
  thenBranch();
  if (elseBranch) {
    actions.push(makeConditionalAction(1, groupId, ctx));
    elseBranch();
  }
  actions.push(makeConditionalAction(2, groupId, ctx));
}

function emitOrConditionBlock(
  cond: import("./ast.ts").OrCondition,
  actions: ActionIR[],
  ctx: LowerContext,
  thenBranch: () => void,
  elseBranch: (() => void) | undefined,
): void {
  const tempName = nextTempName(ctx);
  actions.push(makeNumberAction(0, ctx));
  actions.push(makeSetVariableAction(tempName, ctx));

  emitConditionBlock(
    cond.left,
    actions,
    ctx,
    () => {
      actions.push(makeNumberAction(1, ctx));
      actions.push(makeSetVariableAction(tempName, ctx));
    },
    undefined,
  );

  emitConditionBlock(
    cond.right,
    actions,
    ctx,
    () => {
      actions.push(makeNumberAction(1, ctx));
      actions.push(makeSetVariableAction(tempName, ctx));
    },
    undefined,
  );

  const groupId = nextUuid(ctx);
  actions.push(makeGetVariableAction(tempName, ctx));
  actions.push(makeConditionalAction(0, groupId, ctx, { WFCondition: 4, WFNumberValue: 0 }));
  thenBranch();
  if (elseBranch) {
    actions.push(makeConditionalAction(1, groupId, ctx));
    elseBranch();
  }
  actions.push(makeConditionalAction(2, groupId, ctx));
}

function comparisonConditionCode(op: import("./ast.ts").ComparisonOperator): number {
  switch (op) {
    case "==":
      return 0;
    case "!=":
      return 1;
    case ">":
      return 4;
    case ">=":
      return 4;
    case "<":
      return 5;
    case "<=":
      return 5;
    case "contains":
      return 8;
    case "!contains":
      return 9;
    case "hasPrefix":
      return 2;
    case "hasSuffix":
      return 3;
  }
}

function lowerConstDestructure(
  stmt: ConstDestructure,
  actions: ActionIR[],
  ctx: LowerContext,
): void {
  lowerExpression(stmt.initializer, actions, ctx);
  const sourceName = nextTempName(ctx);
  actions.push(makeSetVariableAction(sourceName, ctx));

  for (const name of stmt.names) {
    actions.push(makeGetVariableAction(sourceName, ctx));

    const parameters = new Map<string, ParameterValue>();
    parameters.set("WFDictionaryKey", name);
    actions.push({
      identifier: "is.workflow.actions.getvalueforkey",
      uuid: nextUuid(ctx),
      parameters,
    });

    actions.push(makeSetVariableAction(name, ctx));
  }
}

function lowerLetDestructure(stmt: LetDestructure, actions: ActionIR[], ctx: LowerContext): void {
  lowerExpression(stmt.initializer, actions, ctx);
  const sourceName = nextTempName(ctx);
  actions.push(makeSetVariableAction(sourceName, ctx));

  for (const name of stmt.names) {
    actions.push(makeGetVariableAction(sourceName, ctx));

    const parameters = new Map<string, ParameterValue>();
    parameters.set("WFDictionaryKey", name);
    actions.push({
      identifier: "is.workflow.actions.getvalueforkey",
      uuid: nextUuid(ctx),
      parameters,
    });

    actions.push(makeSetVariableAction(name, ctx));
  }
}

function lowerEnumMemberAccess(
  enumName: string,
  caseName: string,
  span: Span,
  actions: ActionIR[],
  ctx: LowerContext,
): void {
  const cases = ctx.enums.get(enumName);
  const backingValue = cases?.get(caseName);
  if (backingValue === undefined) {
    throw new LowerError(
      `unknown enum case '${enumName}.${caseName}'`,
      span,
      DiagnosticCode.UnknownMember,
    );
  }
  actions.push(makeTextAction(backingValue, ctx));
}

function lowerDotNameExpression(
  expr: import("./ast.ts").DotNameExpression,
  actions: ActionIR[],
  ctx: LowerContext,
): void {
  if (expr.resolvedBackingValue === undefined) {
    throw new LowerError(`cannot resolve dot-name '.${expr.name}'`, expr.span);
  }
  actions.push(makeTextAction(expr.resolvedBackingValue, ctx));
}

function lowerRecordConstruction(
  expr: CallExpression,
  actions: ActionIR[],
  ctx: LowerContext,
): void {
  actions.push({
    identifier: "is.workflow.actions.dictionary",
    uuid: nextUuid(ctx),
    parameters: new Map(),
  });

  for (const arg of expr.args) {
    if (!arg.label) {
      throw new LowerError(
        "record construction requires labeled arguments",
        arg.value.span,
        DiagnosticCode.ScopeError,
      );
    }

    const key = arg.label;
    const value = lowerToParamValue(arg.value, actions, ctx);

    const parameters = new Map<string, ParameterValue>();
    parameters.set("WFDictionaryKey", key);
    parameters.set("WFDictionaryValue", value);

    actions.push({
      identifier: "is.workflow.actions.setvalueforkey",
      uuid: nextUuid(ctx),
      parameters,
    });
  }
}

function lowerPipelineExpression(
  expr: PipelineExpression,
  actions: ActionIR[],
  ctx: LowerContext,
): void {
  lowerExpression(expr.input, actions, ctx);

  const optionalIndex = expr.stages.findIndex((s) => s.operator === "|>?");

  if (optionalIndex === -1) {
    for (const stage of expr.stages) {
      lowerPipelineStage(stage, actions, ctx);
    }
    return;
  }

  for (const stage of expr.stages.slice(0, optionalIndex)) {
    lowerPipelineStage(stage, actions, ctx);
  }

  const groupId = nextUuid(ctx);
  actions.push(makeConditionalAction(0, groupId, ctx, { WFCondition: 100 }));

  for (const stage of expr.stages.slice(optionalIndex)) {
    lowerPipelineStage(stage, actions, ctx);
  }

  actions.push(makeConditionalAction(1, groupId, ctx));
  actions.push(makeNothingAction(ctx));
  actions.push(makeConditionalAction(2, groupId, ctx));
}

function lowerPipelineStage(stage: PipelineStage, actions: ActionIR[], ctx: LowerContext): void {
  const calleeName = resolveStageCalleeName(stage.callee);
  const funcDecl = calleeName ? ctx.functions.get(calleeName) : undefined;

  if (funcDecl) {
    lowerPipelineFunctionStage(stage, funcDecl, actions, ctx);
    return;
  }

  const actionDecl = calleeName ? ctx.actions.get(calleeName) : undefined;
  if (actionDecl) {
    lowerPipelineDeclaredActionStage(stage, actionDecl, actions, ctx);
    return;
  }

  throw new LowerError(
    `unknown action: ${calleeName ?? "unknown"}`,
    stage.callee.span,
    DiagnosticCode.UnknownAction,
  );
}

function lowerPipelineFunctionStage(
  stage: PipelineStage,
  decl: FunctionDeclaration,
  actions: ActionIR[],
  ctx: LowerContext,
): void {
  const pipedTempName = nextTempName(ctx);
  actions.push(makeSetVariableAction(pipedTempName, ctx));

  actions.push({
    identifier: "is.workflow.actions.dictionary",
    uuid: nextUuid(ctx),
    parameters: new Map(),
  });

  const hasPlaceholder = stage.args.some((a) => a.value.kind === "PlaceholderExpression");
  const provided = new Map<string, Expression>();

  if (hasPlaceholder) {
    for (const arg of stage.args) {
      if (arg.value.kind === "PlaceholderExpression") {
        const targetName = arg.label ?? decl.params.at(0)?.name;
        if (targetName) {
          provided.set(targetName, arg.value);
          const value: ParameterValue = { kind: "VariableRef", name: pipedTempName };
          const parameters = new Map<string, ParameterValue>();
          parameters.set("WFDictionaryKey", targetName);
          parameters.set("WFDictionaryValue", value);
          actions.push({
            identifier: "is.workflow.actions.setvalueforkey",
            uuid: nextUuid(ctx),
            parameters,
          });
        }
      } else if (arg.label) {
        provided.set(arg.label, arg.value);
        const value = lowerToParamValue(arg.value, actions, ctx);
        const parameters = new Map<string, ParameterValue>();
        parameters.set("WFDictionaryKey", arg.label);
        parameters.set("WFDictionaryValue", value);
        actions.push({
          identifier: "is.workflow.actions.setvalueforkey",
          uuid: nextUuid(ctx),
          parameters,
        });
      }
    }
  } else {
    const firstParam = decl.params.at(0);
    if (firstParam) {
      provided.set(firstParam.name, stage.callee);
      const value: ParameterValue = { kind: "VariableRef", name: pipedTempName };
      const parameters = new Map<string, ParameterValue>();
      parameters.set("WFDictionaryKey", firstParam.name);
      parameters.set("WFDictionaryValue", value);
      actions.push({
        identifier: "is.workflow.actions.setvalueforkey",
        uuid: nextUuid(ctx),
        parameters,
      });
    }

    for (const arg of stage.args) {
      if (arg.label) {
        provided.set(arg.label, arg.value);
        const value = lowerToParamValue(arg.value, actions, ctx);
        const parameters = new Map<string, ParameterValue>();
        parameters.set("WFDictionaryKey", arg.label);
        parameters.set("WFDictionaryValue", value);
        actions.push({
          identifier: "is.workflow.actions.setvalueforkey",
          uuid: nextUuid(ctx),
          parameters,
        });
      }
    }
  }

  for (const param of decl.params) {
    if (!provided.has(param.name) && param.defaultValue) {
      const value = lowerToParamValue(param.defaultValue, actions, ctx);
      const parameters = new Map<string, ParameterValue>();
      parameters.set("WFDictionaryKey", param.name);
      parameters.set("WFDictionaryValue", value);
      actions.push({
        identifier: "is.workflow.actions.setvalueforkey",
        uuid: nextUuid(ctx),
        parameters,
      });
    }
  }

  const subName = deriveFunctionShortcutName(decl);
  const runParams = new Map<string, ParameterValue>();
  runParams.set("WFWorkflowName", subName);
  actions.push({
    identifier: "is.workflow.actions.runworkflow",
    uuid: nextUuid(ctx),
    parameters: runParams,
  });
}

function lowerPipelineDeclaredActionStage(
  stage: PipelineStage,
  decl: import("./ast.ts").ActionDeclaration,
  actions: ActionIR[],
  ctx: LowerContext,
): void {
  const parameters = new Map<string, ParameterValue>();

  const provided = new Map<string, Expression>();
  for (const arg of stage.args) {
    if (arg.value.kind === "PlaceholderExpression") {
      continue;
    }
    if (arg.label) {
      provided.set(arg.label, arg.value);
    }
  }

  for (const param of decl.params) {
    const valueExpr = provided.get(param.label) ?? param.defaultValue;
    if (!valueExpr) {
      continue;
    }
    parameters.set(param.name, lowerToParamValue(valueExpr, actions, ctx));
  }

  actions.push({
    identifier: decl.runtimeIdentifier,
    uuid: nextUuid(ctx),
    parameters,
  });
}

function assertNever(value: never): never {
  throw new LowerError(
    `unhandled case: ${JSON.stringify(value)}`,
    { start: 0, end: 0 },
    DiagnosticCode.InternalError,
  );
}
