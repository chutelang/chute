import type {
  Assignment,
  BinaryExpression,
  BinaryOperator,
  CallExpression,
  Expression,
  LetDeclaration,
  Program,
  Statement,
  UnaryExpression,
  VarDeclaration,
} from "./ast.ts";
import type { ActionIR, ParameterValue, ShortcutIR } from "./ir.ts";

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
  const ctx: LowerContext = { uuidCounter: 0, tempCounter: 0 };

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
    default:
      assertNever(stmt);
  }
}

function lowerExpressionStatement(expr: Expression, actions: ActionIR[], ctx: LowerContext): void {
  if (expr.kind !== "CallExpression") {
    throw new LowerError(`expression statements must be action calls, got ${expr.kind}`);
  }

  actions.push(lowerCall(expr, actions, ctx));
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
    case "BinaryExpression":
      lowerBinaryExpression(expr, actions, ctx);
      return;
    case "UnaryExpression":
      lowerUnaryExpression(expr, actions, ctx);
      return;
    default:
      throw new LowerError(`unsupported expression: ${expr.kind}`);
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
      return { kind: "VariableRef", name: expr.name };
    default:
      throw new LowerError(`unsupported expression in action argument: ${expr.kind}`);
  }
}

function lowerBinaryExpression(
  expr: BinaryExpression,
  actions: ActionIR[],
  ctx: LowerContext,
): void {
  lowerExpression(expr.left, actions, ctx);
  const operand = lowerToParamValue(expr.right, actions, ctx);

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

function makeTextAction(value: string, ctx: LowerContext): ActionIR {
  const parameters = new Map<string, ParameterValue>();
  parameters.set("WFTextActionText", value);
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
  parameters.set("WFVariable", { kind: "VariableRef", name });
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

function assertNever(value: never): never {
  throw new LowerError(`unhandled case: ${JSON.stringify(value)}`);
}
