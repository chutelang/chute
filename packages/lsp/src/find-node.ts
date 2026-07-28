import type {
  Program,
  Statement,
  Expression,
  Condition,
  Span,
  ImportDeclaration,
  FunctionDeclaration,
  ActionDeclaration,
  EnumDeclaration,
  RecordDeclaration,
  LetDeclaration,
  VarDeclaration,
  LetDestructure,
  PipelineStage,
} from "@chute-lang/compiler";

export interface SymbolInfo {
  name: string;
  span: Span;
  kind:
    | "variable"
    | "function"
    | "action"
    | "enum"
    | "record"
    | "import"
    | "parameter"
    | "field"
    | "enum-case";
}

export function collectDefinitions(program: Program): SymbolInfo[] {
  const defs: SymbolInfo[] = [];

  for (const imp of program.imports) {
    defs.push({
      name: imp.alias,
      span: imp.span,
      kind: "import",
    });
  }

  for (const stmt of program.body) {
    collectStatementDefinitions(stmt, defs);
  }

  return defs;
}

function collectStatementDefinitions(stmt: Statement, defs: SymbolInfo[]): void {
  switch (stmt.kind) {
    case "LetDeclaration":
      defs.push({
        name: stmt.name,
        span: stmt.span,
        kind: "variable",
      });
      break;
    case "VarDeclaration":
      defs.push({
        name: stmt.name,
        span: stmt.span,
        kind: "variable",
      });
      break;
    case "LetDestructure":
      for (const name of stmt.names) {
        defs.push({
          name,
          span: stmt.span,
          kind: "variable",
        });
      }
      break;
    case "FunctionDeclaration":
      defs.push({
        name: stmt.name,
        span: stmt.span,
        kind: "function",
      });
      for (const param of stmt.params) {
        defs.push({
          name: param.name,
          span: param.span,
          kind: "parameter",
        });
      }
      for (const s of stmt.body) {
        collectStatementDefinitions(s, defs);
      }
      break;
    case "ActionDeclaration":
      defs.push({
        name: stmt.name,
        span: stmt.span,
        kind: "action",
      });
      break;
    case "EnumDeclaration":
      defs.push({
        name: stmt.name,
        span: stmt.span,
        kind: "enum",
      });
      for (const c of stmt.cases) {
        defs.push({
          name: `${stmt.name}.${c.name}`,
          span: c.span,
          kind: "enum-case",
        });
      }
      break;
    case "RecordDeclaration":
      defs.push({
        name: stmt.name,
        span: stmt.span,
        kind: "record",
      });
      for (const f of stmt.fields) {
        defs.push({
          name: `${stmt.name}.${f.name}`,
          span: f.span,
          kind: "field",
        });
      }
      break;
    case "IfStatement":
      for (const s of stmt.body) {
        collectStatementDefinitions(s, defs);
      }
      if (stmt.elseBody) {
        if (Array.isArray(stmt.elseBody)) {
          for (const s of stmt.elseBody) {
            collectStatementDefinitions(s, defs);
          }
        } else {
          collectStatementDefinitions(stmt.elseBody, defs);
        }
      }
      break;
    case "ForStatement":
      defs.push({
        name: stmt.variable,
        span: stmt.span,
        kind: "variable",
      });
      for (const s of stmt.body) {
        collectStatementDefinitions(s, defs);
      }
      break;
    case "RepeatStatement":
      for (const s of stmt.body) {
        collectStatementDefinitions(s, defs);
      }
      break;
    case "MenuStatement":
      for (const c of stmt.cases) {
        for (const s of c.body) {
          collectStatementDefinitions(s, defs);
        }
      }
      break;
    default:
      break;
  }
}

export interface IdentifierAtOffset {
  name: string;
  span: Span;
  context: "reference" | "member" | "namespace-member" | "definition";
  namespaceName?: string;
}

export function findIdentifierAtOffset(
  program: Program,
  offset: number,
): IdentifierAtOffset | undefined {
  for (const imp of program.imports) {
    if (containsOffset(imp.span, offset)) {
      return {
        name: imp.alias,
        span: imp.span,
        context: "definition",
      };
    }
  }

  for (const stmt of program.body) {
    const result = findInStatement(stmt, offset);
    if (result) return result;
  }

  return undefined;
}

function containsOffset(span: Span, offset: number): boolean {
  return offset >= span.start && offset < span.end;
}

function findInStatement(stmt: Statement, offset: number): IdentifierAtOffset | undefined {
  if (!containsOffset(stmt.span, offset)) return undefined;

  switch (stmt.kind) {
    case "ExpressionStatement":
      return findInExpression(stmt.expression, offset);
    case "LetDeclaration":
      return findInLetDeclaration(stmt, offset);
    case "VarDeclaration":
      return findInVarDeclaration(stmt, offset);
    case "LetDestructure":
      return findInLetDestructure(stmt, offset);
    case "Assignment":
      return findInExpression(stmt.value, offset);
    case "IfStatement":
      return findInIfStatement(stmt, offset);
    case "ForStatement":
      return findInForStatement(stmt, offset);
    case "RepeatStatement":
      return findInRepeatStatement(stmt, offset);
    case "MenuStatement":
      return findInMenuStatement(stmt, offset);
    case "FunctionDeclaration":
      return findInFunctionDeclaration(stmt, offset);
    case "ReturnStatement":
      if (stmt.value) return findInExpression(stmt.value, offset);
      return undefined;
    case "EnumDeclaration":
    case "RecordDeclaration":
    case "ActionDeclaration":
      return undefined;
    default:
      return undefined;
  }
}

function findInLetDeclaration(
  decl: LetDeclaration,
  offset: number,
): IdentifierAtOffset | undefined {
  return findInExpression(decl.initializer, offset);
}

function findInVarDeclaration(
  decl: VarDeclaration,
  offset: number,
): IdentifierAtOffset | undefined {
  return findInExpression(decl.initializer, offset);
}

function findInLetDestructure(
  decl: LetDestructure,
  offset: number,
): IdentifierAtOffset | undefined {
  return findInExpression(decl.initializer, offset);
}

function findInIfStatement(
  stmt: import("@chute-lang/compiler").IfStatement,
  offset: number,
): IdentifierAtOffset | undefined {
  const condResult = findInCondition(stmt.condition, offset);
  if (condResult) return condResult;

  for (const s of stmt.body) {
    const result = findInStatement(s, offset);
    if (result) return result;
  }

  if (stmt.elseBody) {
    if (Array.isArray(stmt.elseBody)) {
      for (const s of stmt.elseBody) {
        const result = findInStatement(s, offset);
        if (result) return result;
      }
    } else {
      return findInStatement(stmt.elseBody, offset);
    }
  }

  return undefined;
}

function findInForStatement(
  stmt: import("@chute-lang/compiler").ForStatement,
  offset: number,
): IdentifierAtOffset | undefined {
  const iterResult = findInExpression(stmt.iterable, offset);
  if (iterResult) return iterResult;

  for (const s of stmt.body) {
    const result = findInStatement(s, offset);
    if (result) return result;
  }

  return undefined;
}

function findInRepeatStatement(
  stmt: import("@chute-lang/compiler").RepeatStatement,
  offset: number,
): IdentifierAtOffset | undefined {
  const countResult = findInExpression(stmt.count, offset);
  if (countResult) return countResult;

  for (const s of stmt.body) {
    const result = findInStatement(s, offset);
    if (result) return result;
  }

  return undefined;
}

function findInMenuStatement(
  stmt: import("@chute-lang/compiler").MenuStatement,
  offset: number,
): IdentifierAtOffset | undefined {
  const promptResult = findInExpression(stmt.prompt, offset);
  if (promptResult) return promptResult;

  for (const c of stmt.cases) {
    for (const s of c.body) {
      const result = findInStatement(s, offset);
      if (result) return result;
    }
  }

  return undefined;
}

function findInFunctionDeclaration(
  decl: FunctionDeclaration,
  offset: number,
): IdentifierAtOffset | undefined {
  for (const param of decl.params) {
    if (param.defaultValue && containsOffset(param.defaultValue.span, offset)) {
      return findInExpression(param.defaultValue, offset);
    }
  }

  for (const s of decl.body) {
    const result = findInStatement(s, offset);
    if (result) return result;
  }

  return undefined;
}

function findInExpression(expr: Expression, offset: number): IdentifierAtOffset | undefined {
  if (!containsOffset(expr.span, offset)) return undefined;

  switch (expr.kind) {
    case "Identifier":
      return {
        name: expr.name,
        span: expr.span,
        context: "reference",
      };
    case "MemberExpression": {
      const objResult = findInExpression(expr.object, offset);
      if (objResult) return objResult;
      if (expr.object.kind === "Identifier") {
        return {
          name: expr.property,
          span: expr.span,
          context: "namespace-member",
          namespaceName: expr.object.name,
        };
      }
      return {
        name: expr.property,
        span: expr.span,
        context: "member",
      };
    }
    case "OptionalMemberExpression": {
      const objResult = findInExpression(expr.object, offset);
      if (objResult) return objResult;
      return {
        name: expr.property,
        span: expr.span,
        context: "member",
      };
    }
    case "CallExpression": {
      for (const arg of expr.args) {
        const argResult = findInExpression(arg.value, offset);
        if (argResult) return argResult;
      }
      return findInExpression(expr.callee, offset);
    }
    case "BinaryExpression": {
      const leftResult = findInExpression(expr.left, offset);
      if (leftResult) return leftResult;
      return findInExpression(expr.right, offset);
    }
    case "UnaryExpression":
      return findInExpression(expr.operand, offset);
    case "CoalesceExpression": {
      const leftResult = findInExpression(expr.left, offset);
      if (leftResult) return leftResult;
      return findInExpression(expr.right, offset);
    }
    case "TernaryExpression": {
      const condResult = findInCondition(expr.condition, offset);
      if (condResult) return condResult;
      const consResult = findInExpression(expr.consequent, offset);
      if (consResult) return consResult;
      return findInExpression(expr.alternate, offset);
    }
    case "SubscriptExpression": {
      const objResult = findInExpression(expr.object, offset);
      if (objResult) return objResult;
      return findInExpression(expr.index, offset);
    }
    case "InterpolatedString":
      for (const part of expr.parts) {
        if (part.kind === "ExpressionPart") {
          const result = findInExpression(part.expression, offset);
          if (result) return result;
        }
      }
      return undefined;
    case "ListLiteral":
      for (const el of expr.elements) {
        const result = findInExpression(el, offset);
        if (result) return result;
      }
      return undefined;
    case "DictionaryLiteral":
      for (const entry of expr.entries) {
        const keyResult = findInExpression(entry.key, offset);
        if (keyResult) return keyResult;
        const valResult = findInExpression(entry.value, offset);
        if (valResult) return valResult;
      }
      return undefined;
    case "PipelineExpression": {
      const inputResult = findInExpression(expr.input, offset);
      if (inputResult) return inputResult;
      for (const stage of expr.stages) {
        const stageResult = findInPipelineStage(stage, offset);
        if (stageResult) return stageResult;
      }
      return undefined;
    }
    default:
      return undefined;
  }
}

function findInPipelineStage(stage: PipelineStage, offset: number): IdentifierAtOffset | undefined {
  if (!containsOffset(stage.span, offset)) return undefined;
  const calleeResult = findInExpression(stage.callee, offset);
  if (calleeResult) return calleeResult;
  for (const arg of stage.args) {
    const argResult = findInExpression(arg.value, offset);
    if (argResult) return argResult;
  }
  return undefined;
}

function findInCondition(cond: Condition, offset: number): IdentifierAtOffset | undefined {
  if (!containsOffset(cond.span, offset)) return undefined;

  switch (cond.kind) {
    case "OrCondition":
    case "AndCondition": {
      const leftResult = findInCondition(cond.left, offset);
      if (leftResult) return leftResult;
      return findInCondition(cond.right, offset);
    }
    case "NotCondition":
      return findInCondition(cond.operand, offset);
    case "Comparison": {
      const leftResult = findInExpression(cond.left, offset);
      if (leftResult) return leftResult;
      return findInExpression(cond.right, offset);
    }
    case "RangeTest": {
      const subjResult = findInExpression(cond.subject, offset);
      if (subjResult) return subjResult;
      const lowResult = findInExpression(cond.low, offset);
      if (lowResult) return lowResult;
      return findInExpression(cond.high, offset);
    }
    case "TypeTest":
      return findInExpression(cond.subject, offset);
    case "BooleanReference":
      return findInExpression(cond.subject, offset);
    case "BooleanLiteralCondition":
      return undefined;
    default:
      return undefined;
  }
}
