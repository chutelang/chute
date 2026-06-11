import type {
  Assignment,
  BinaryExpression,
  BinaryOperator,
  CallExpression,
  CoalesceExpression,
  Condition,
  DictionaryLiteral,
  Expression,
  ForStatement,
  IfStatement,
  InterpolatedString,
  LetDeclaration,
  ListLiteral,
  MenuStatement,
  Program,
  RepeatStatement,
  Statement,
  SubscriptExpression,
  TernaryExpression,
  UnaryExpression,
  VarDeclaration,
} from "./ast.ts";
import type {
  ActionIR,
  InterpolatedText,
  InterpolatedTextPart,
  ParameterValue,
  ShortcutIR,
} from "./ir.ts";

interface BuiltinAction {
  identifier: string;
  params: Record<string, string>;
}

const BUILTIN_ACTIONS: ReadonlyMap<string, BuiltinAction> = new Map([
  [
    "showAlert",
    {
      identifier: "is.workflow.actions.alert",
      params: { text: "WFAlertActionTitle" },
    },
  ],
  [
    "showResult",
    {
      identifier: "is.workflow.actions.showresult",
      params: { text: "Text" },
    },
  ],
  [
    "notification",
    {
      identifier: "is.workflow.actions.notification",
      params: {
        body: "WFNotificationActionBody",
        title: "WFNotificationActionTitle",
      },
    },
  ],
]);

export class LowerError extends Error {
  constructor(message: string) {
    super(message);
  }
}

interface LowerContext {
  uuidCounter: number;
  tempCounter: number;
}

export function lower(program: Program): ShortcutIR {
  const name = extractName(program);
  const actions: ActionIR[] = [];
  const ctx: LowerContext = {
    uuidCounter: 0,
    tempCounter: 0,
  };

  for (const stmt of program.body) {
    lowerStatement(stmt, actions, ctx);
  }

  return { name, actions };
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
    case "LetDeclaration":
      lowerDeclaration(stmt, actions, ctx);
      return;
    case "VarDeclaration":
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
    case "LetDestructure":
      lowerLetDestructure(stmt, actions, ctx);
      return;
    case "EnumDeclaration":
      return;
    case "RecordDeclaration":
      return;
    default:
      assertNever(stmt);
  }
}

function lowerExpressionStatement(expr: Expression, actions: ActionIR[], ctx: LowerContext): void {
  if (expr.kind !== "CallExpression") {
    throw new LowerError(`expression statements must be action calls, got ${expr.kind}`);
  }

  lowerExpression(expr, actions, ctx);
}

function lowerDeclaration(
  decl: LetDeclaration | VarDeclaration,
  actions: ActionIR[],
  ctx: LowerContext,
): void {
  lowerExpression(decl.initializer, actions, ctx);
  actions.push(makeSetVariableAction(decl.name, ctx));
}

function lowerAssignment(assign: Assignment, actions: ActionIR[], ctx: LowerContext): void {
  if (assign.place.accessors.length > 0) {
    throw new LowerError("assignment to nested places is not yet supported");
  }

  lowerExpression(assign.value, actions, ctx);
  actions.push(makeSetVariableAction(assign.place.root, ctx));
}

function lowerExpression(expr: Expression, actions: ActionIR[], ctx: LowerContext): void {
  switch (expr.kind) {
    case "CallExpression":
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
    case "HashIndexExpression":
      lowerHashIndexExpression(actions, ctx);
      return;
    default:
      assertNever(expr);
  }
}

function lowerCall(expr: CallExpression, actions: ActionIR[], ctx: LowerContext): ActionIR {
  if (expr.callee.kind !== "Identifier") {
    throw new LowerError("only direct action calls are supported in this subset");
  }

  const actionName = expr.callee.name;
  const builtin = BUILTIN_ACTIONS.get(actionName);

  if (!builtin) {
    throw new LowerError(`unknown action: ${actionName}`);
  }

  const parameters = new Map<string, ParameterValue>();

  for (const arg of expr.args) {
    if (!arg.label) {
      throw new LowerError(`action arguments must be labeled`);
    }

    const paramKey = builtin.params[arg.label];
    if (!paramKey) {
      throw new LowerError(`unknown parameter '${arg.label}' for action '${actionName}'`);
    }

    parameters.set(paramKey, lowerToParamValue(arg.value, actions, ctx));
  }

  return {
    identifier: builtin.identifier,
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
 * Lowers an operand expression to a ParameterValue while preserving the
 * caller's current magic variable across the process.
 *
 * lowerToParamValue may emit actions for a complex operand (e.g. a nested
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
 * True when lowering this expression via lowerToParamValue cannot emit any
 * actions, and therefore cannot clobber the current magic variable.
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

function lowerLetDestructure(
  _stmt: import("./ast.ts").LetDestructure,
  _actions: ActionIR[],
  _ctx: LowerContext,
): void {
  throw new LowerError("let destructuring is not yet lowered");
}

function lowerDotNameExpression(
  _expr: import("./ast.ts").DotNameExpression,
  _actions: ActionIR[],
  _ctx: LowerContext,
): void {
  throw new LowerError("dot-name expressions are not yet lowered");
}

function assertNever(value: never): never {
  throw new LowerError(`unhandled case: ${JSON.stringify(value)}`);
}
