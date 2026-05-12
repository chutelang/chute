import type { Program, Expression } from "./ast.ts";
import type { ShortcutIR, ActionIR, ParameterValue } from "./ir.ts";

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

export function lower(program: Program): ShortcutIR {
  const name = extractName(program);
  const actions: ActionIR[] = [];

  for (const stmt of program.body) {
    if (stmt.kind !== "ExpressionStatement") {
      throw new LowerError(`unsupported statement: ${stmt.kind}`);
    }

    if (stmt.expression.kind !== "CallExpression") {
      throw new LowerError(
        `expression statements must be action calls, got ${stmt.expression.kind}`,
      );
    }

    actions.push(lowerCall(stmt.expression));
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

function lowerCall(expr: Expression): ActionIR {
  if (expr.kind !== "CallExpression") {
    throw new LowerError(`expected call expression, got ${expr.kind}`);
  }

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

    parameters.set(paramKey, lowerValue(arg.value));
  }

  return { identifier: builtin.identifier, parameters };
}

function lowerValue(expr: Expression): ParameterValue {
  switch (expr.kind) {
    case "StringLiteral":
      return expr.value;
    case "NumberLiteral":
      return expr.value;
    case "BooleanLiteral":
      return expr.value;
    default:
      throw new LowerError(`unsupported expression in action argument: ${expr.kind}`);
  }
}
