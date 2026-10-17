import type { Span } from "./token.ts";
import { DiagnosticCode, CompileError } from "./diagnostic.ts";
import type { Diagnostic } from "./diagnostic.ts";
import type { ResolvedFileImport } from "./checker.ts";
import { resolveEnumBackingValue, resolveStageCalleeName } from "./ast.ts";
import type {
  ActionDeclaration,
  Assignment,
  BinaryExpression,
  BinaryOperator,
  CallExpression,
  CoalesceExpression,
  CoercionExpression,
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
  MemberExpression,
  MenuStatement,
  OptionalMemberExpression,
  PipelineExpression,
  PipelineStage,
  Program,
  RepeatStatement,
  ReturnStatement,
  Statement,
  SubscriptExpression,
  TernaryExpression,
  UnaryExpression,
} from "./ast.ts";
import type {
  ActionIR,
  Aggrandizement,
  CompilationResult,
  ConditionInput,
  InterpolatedText,
  InterpolatedTextPart,
  ParameterValue,
} from "./ir.ts";
import type { ResolvedProperty } from "./ast.ts";
import { getContentItemClass } from "./coercion.ts";
import { getStdlibModule, getParameterSlot } from "./stdlib.ts";

export class LowerError extends Error {
  constructor(
    message: string,
    public span: Span = { start: 0, end: 0 },
    public code: DiagnosticCode = DiagnosticCode.UnsupportedExpression,
  ) {
    super(message);
  }
}

interface NamespaceAction {
  runtimeIdentifier: string;
  inputLabel?: string;
}

/**
 * Key a namespace action's overload is stored under in the module's action
 * map, so a call site can look up the exact overload the checker resolved
 * via `resolvedCall?.overloadIndex` instead of always getting the last-registered
 * binding for that name.
 */
function moduleNamespace(path: string): string {
  return `__chute_module:${path}`;
}

function qualifyModuleReferences(
  program: Program,
  path: string,
  imports: ResolvedFileImport[],
): void {
  const aliases = new Map(
    imports.map((resolved) => [resolved.declaration.alias, moduleNamespace(resolved.path)]),
  );
  const names = new Map<string, string>();
  for (const stmt of program.body) {
    if (
      stmt.kind === "ConstDeclaration" ||
      stmt.kind === "FunctionDeclaration" ||
      stmt.kind === "ActionDeclaration" ||
      stmt.kind === "EnumDeclaration" ||
      stmt.kind === "RecordDeclaration"
    ) {
      names.set(stmt.name, `${moduleNamespace(path)}.${stmt.name}`);
    }
  }

  const addDeclaration = (value: unknown, scope: Set<string>): void => {
    if (!value || typeof value !== "object") {
      return;
    }
    const stmt = value as Record<string, unknown>;
    if (
      (stmt.kind === "ConstDeclaration" ||
        stmt.kind === "LetDeclaration" ||
        stmt.kind === "FunctionDeclaration" ||
        stmt.kind === "ActionDeclaration" ||
        stmt.kind === "EnumDeclaration" ||
        stmt.kind === "RecordDeclaration") &&
      typeof stmt.name === "string"
    ) {
      scope.add(stmt.name);
    } else if (
      (stmt.kind === "ConstDestructure" || stmt.kind === "LetDestructure") &&
      Array.isArray(stmt.names)
    ) {
      for (const name of stmt.names) {
        if (typeof name === "string") {
          scope.add(name);
        }
      }
    }
  };

  const visit = (value: unknown, shadowed: Set<string>): void => {
    if (Array.isArray(value)) {
      for (const item of value) {
        visit(item, shadowed);
      }
      return;
    }
    if (!value || typeof value !== "object") {
      return;
    }

    const node = value as Record<string, unknown>;
    if (node.kind === "MemberExpression") {
      const object = node.object as { kind?: string; name?: string } | undefined;
      if (object?.kind === "Identifier" && object.name && !shadowed.has(object.name)) {
        const qualified = aliases.get(object.name);
        if (qualified) {
          object.name = qualified;
        }
      }
    }
    if (node.kind === "Identifier" && typeof node.name === "string" && !shadowed.has(node.name)) {
      node.name = names.get(node.name) ?? node.name;
      return;
    }
    if (node.kind === "FunctionDeclaration") {
      for (const param of node.params as Array<{ defaultValue?: unknown }>) {
        visit(param.defaultValue, shadowed);
      }
      const bodyScope = new Set(shadowed);
      for (const param of node.params as Array<{ name: string }>) {
        bodyScope.add(param.name);
      }
      visitStatementList(node.body as unknown[], bodyScope);
      return;
    }
    if (node.kind === "ActionDeclaration") {
      for (const param of node.params as Array<{ defaultValue?: unknown }>) {
        visit(param.defaultValue, shadowed);
      }
      return;
    }
    if (node.kind === "IfStatement") {
      visit(node.condition, shadowed);
      visitStatementList(node.body as unknown[], new Set(shadowed));
      if (Array.isArray(node.elseBody)) {
        visitStatementList(node.elseBody, new Set(shadowed));
      } else {
        visit(node.elseBody, new Set(shadowed));
      }
      return;
    }
    if (node.kind === "ForStatement") {
      visit(node.iterable, shadowed);
      const bodyScope = new Set(shadowed);
      if (typeof node.variable === "string") {
        bodyScope.add(node.variable);
      }
      visitStatementList(node.body as unknown[], bodyScope);
      return;
    }
    if (node.kind === "RepeatStatement") {
      visit(node.count, shadowed);
      visitStatementList(node.body as unknown[], new Set(shadowed));
      return;
    }
    if (node.kind === "MenuStatement") {
      visit(node.prompt, shadowed);
      for (const menuCase of node.cases as Array<{ body: unknown[] }>) {
        const caseScope = new Set(shadowed);
        if (typeof node.variable === "string") {
          caseScope.add(node.variable);
        }
        visitStatementList(menuCase.body, caseScope);
      }
      return;
    }
    for (const child of Object.values(node)) {
      visit(child, shadowed);
    }
  };

  const visitStatementList = (statements: unknown[], shadowed: Set<string>): void => {
    for (const stmt of statements) {
      visit(stmt, shadowed);
      addDeclaration(stmt, shadowed);
    }
  };

  // Top-level declarations are module bindings, not lexical shadows.
  for (const stmt of program.body) {
    visit(stmt, new Set());
  }
}

function collectFileImports(
  imports: ResolvedFileImport[],
  functions: Map<string, FunctionDeclaration>,
  actions: Map<string, ActionDeclaration[]>,
  enums: Map<string, Map<string, string>>,
  records: Set<string>,
  namespaceActions: Map<string, Map<string, NamespaceAction>>,
  namespaceFunctions: Map<string, Map<string, NamespaceFunction>>,
  namespaceConstants: Map<string, Map<string, string>>,
  namespaceEnums: Map<string, Map<string, Map<string, string>>>,
  namespaceRecords: Map<string, Set<string>>,
  importedConstants: ImportedConstant[],
  collectedModules: Set<string>,
  root = true,
): void {
  for (const resolved of imports) {
    qualifyModuleReferences(resolved.program, resolved.path, resolved.imports);
    const namespace = root ? resolved.declaration.alias : moduleNamespace(resolved.path);
    const runtimeNamespace = moduleNamespace(resolved.path);
    collectFileImports(
      resolved.imports,
      functions,
      actions,
      enums,
      records,
      namespaceActions,
      namespaceFunctions,
      namespaceConstants,
      namespaceEnums,
      namespaceRecords,
      importedConstants,
      collectedModules,
      false,
    );
    const moduleActions = new Map<string, NamespaceAction>();
    const moduleFunctions = new Map<string, NamespaceFunction>();
    const moduleConstants = new Map<string, string>();
    const moduleEnums = new Map<string, Map<string, string>>();
    const moduleRecords = new Set<string>();
    const actionOverloads = new Map<string, number>();
    for (const stmt of resolved.program.body) {
      if (!("name" in stmt) || typeof stmt.name !== "string") {
        continue;
      }
      const runtimeName = `${runtimeNamespace}.${stmt.name}`;
      const exported = "exported" in stmt && stmt.exported;
      if (stmt.kind === "FunctionDeclaration") {
        functions.set(runtimeName, stmt);
        if (exported) {
          moduleFunctions.set(stmt.name, { runtimeName, declaration: stmt });
        }
      } else if (stmt.kind === "ActionDeclaration") {
        const existing = actions.get(runtimeName);
        if (existing) {
          existing.push(stmt);
        } else {
          actions.set(runtimeName, [stmt]);
        }
        if (exported) {
          const index = actionOverloads.get(stmt.name) ?? 0;
          const action = {
            runtimeIdentifier: stmt.runtimeIdentifier,
          };
          moduleActions.set(namespaceOverloadKey(stmt.name, index), action);
          if (index === 0) {
            moduleActions.set(stmt.name, action);
          }
          actionOverloads.set(stmt.name, index + 1);
        }
      } else if (stmt.kind === "ConstDeclaration") {
        if (!collectedModules.has(resolved.path)) {
          importedConstants.push({ runtimeName, declaration: stmt });
        }
        if (exported) {
          moduleConstants.set(stmt.name, runtimeName);
        }
      } else if (stmt.kind === "EnumDeclaration") {
        const cases = new Map<string, string>();
        for (const enumCase of stmt.cases) {
          cases.set(
            enumCase.name,
            resolveEnumBackingValue(enumCase.name, enumCase.value, stmt.defaultValue),
          );
        }
        enums.set(runtimeName, cases);
        if (exported) {
          moduleEnums.set(stmt.name, cases);
        }
      } else if (stmt.kind === "RecordDeclaration") {
        records.add(runtimeName);
        if (exported) {
          moduleRecords.add(stmt.name);
        }
      }
    }
    collectedModules.add(resolved.path);
    namespaceActions.set(namespace, moduleActions);
    namespaceFunctions.set(namespace, moduleFunctions);
    namespaceConstants.set(namespace, moduleConstants);
    namespaceEnums.set(namespace, moduleEnums);
    namespaceRecords.set(namespace, moduleRecords);
  }
}
function namespaceOverloadKey(name: string, overloadIndex: number): string {
  return `${name}__overload_${overloadIndex}`;
}

interface ImportedConstant {
  runtimeName: string;
  declaration: ConstDeclaration;
}

interface NamespaceFunction {
  runtimeName: string;
  declaration: FunctionDeclaration;
}

export interface LowerOptions {
  imports?: ResolvedFileImport[];
}

interface LowerContext {
  uuidCounter: number;
  tempCounter: number;
  enums: Map<string, Map<string, string>>;
  records: Set<string>;
  functions: Map<string, FunctionDeclaration>;
  actions: Map<string, ActionDeclaration[]>;
  namespaceActions: Map<string, Map<string, NamespaceAction>>;
  namespaceFunctions: Map<string, Map<string, NamespaceFunction>>;
  namespaceConstants: Map<string, Map<string, string>>;
  namespaceEnums: Map<string, Map<string, Map<string, string>>>;
  namespaceRecords: Map<string, Set<string>>;
  shortcutName: string;
}

export function lower(program: Program, options?: LowerOptions): CompilationResult {
  const name = extractName(program);
  const actions: ActionIR[] = [];
  const enums = new Map<string, Map<string, string>>();
  const records = new Set<string>();
  const functions = new Map<string, FunctionDeclaration>();
  const actionDecls = new Map<string, ActionDeclaration[]>();
  const collectedErrors: Diagnostic[] = [];

  for (const stmt of program.body) {
    if (stmt.kind === "EnumDeclaration") {
      collectEnum(stmt, enums);
    } else if (stmt.kind === "RecordDeclaration") {
      records.add(stmt.name);
    } else if (stmt.kind === "FunctionDeclaration") {
      functions.set(stmt.name, stmt);
    } else if (stmt.kind === "ActionDeclaration") {
      // Multiple declarations with the same name are overloads (validated by
      // the checker); keep them in declaration order so `resolvedCall?.overloadIndex`
      // set by the checker can index directly into this array.
      const existing = actionDecls.get(stmt.name);
      if (existing) {
        existing.push(stmt);
      } else {
        actionDecls.set(stmt.name, [stmt]);
      }
    }
  }

  const namespaceFunctions = new Map<string, Map<string, NamespaceFunction>>();
  const namespaceActions = new Map<string, Map<string, NamespaceAction>>();
  const namespaceConstants = new Map<string, Map<string, string>>();
  const namespaceEnums = new Map<string, Map<string, Map<string, string>>>();
  const namespaceRecords = new Map<string, Set<string>>();
  const importedConstants: ImportedConstant[] = [];
  for (const imp of program.imports) {
    if (!imp.isPackage) {
      continue;
    }
    const moduleScope = getStdlibModule(imp.path);
    if (!moduleScope) {
      continue;
    }
    const moduleActions = new Map<string, NamespaceAction>();
    for (const [name, binding] of moduleScope.allBindings()) {
      if (binding.type.kind === "action") {
        moduleActions.set(name, {
          runtimeIdentifier: binding.type.runtimeIdentifier,
          ...(binding.type.inputLabel !== undefined ? { inputLabel: binding.type.inputLabel } : {}),
        });
      } else if (binding.type.kind === "overloadedAction") {
        // Store each overload under an indexed key so a call site with a
        // `resolvedCall?.overloadIndex` can look up its exact overload; also store
        // the first overload under the plain name as a fallback for callers
        // that never went through overload resolution (e.g. none exist yet
        // today, but this keeps behavior sane if one is looked up directly).
        binding.type.overloads.forEach((overload, index) => {
          const nsAction: NamespaceAction = {
            runtimeIdentifier: overload.runtimeIdentifier,
          };
          moduleActions.set(namespaceOverloadKey(name, index), nsAction);
          if (index === 0) {
            moduleActions.set(name, nsAction);
          }
        });
      }
    }
    namespaceActions.set(imp.alias, moduleActions);
  }

  collectFileImports(
    options?.imports ?? [],
    functions,
    actionDecls,
    enums,
    records,
    namespaceActions,
    namespaceFunctions,
    namespaceConstants,
    namespaceEnums,
    namespaceRecords,
    importedConstants,
    new Set(),
  );

  const ctx: LowerContext = {
    uuidCounter: 0,
    tempCounter: 0,
    enums,
    records,
    functions,
    actions: actionDecls,
    namespaceActions,
    namespaceFunctions,
    namespaceConstants,
    namespaceEnums,
    namespaceRecords,
    shortcutName: name,
  };

  for (const imported of importedConstants) {
    lowerExpression(imported.declaration.initializer, actions, ctx);
    actions.push(makeSetVariableAction(imported.runtimeName, ctx));
  }

  if (functions.size > 0) {
    try {
      emitFunctionDispatchBlock(functions, actions, ctx);
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
    main: {
      name,
      actions,
      acceptsInput: functions.size > 0,
    },
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

function emitFunctionDispatchBlock(
  functions: Map<string, FunctionDeclaration>,
  actions: ActionIR[],
  ctx: LowerContext,
): void {
  const inputTempName = nextTempName(ctx);
  const setInputParams = new Map<string, ParameterValue>();
  setInputParams.set("WFInput", { kind: "ExtensionInputRef" });
  setInputParams.set("WFVariableName", inputTempName);
  actions.push({
    identifier: "is.workflow.actions.setvariable",
    uuid: nextUuid(ctx),
    parameters: setInputParams,
  });

  actions.push(makeGetVariableAction(inputTempName, ctx));
  const keyParams = new Map<string, ParameterValue>();
  keyParams.set("WFDictionaryKey", "__chute_fn");
  actions.push({
    identifier: "is.workflow.actions.getvalueforkey",
    uuid: nextUuid(ctx),
    parameters: keyParams,
  });

  const rawFnTempName = nextTempName(ctx);
  actions.push(makeSetVariableAction(rawFnTempName, ctx));

  const outerGroupId = nextUuid(ctx);
  actions.push(makeGetVariableAction(rawFnTempName, ctx));
  actions.push(
    makeConditionalAction(0, outerGroupId, ctx, {
      WFCondition: 100,
      WFInput: makeConditionInput(rawFnTempName),
    }),
  );

  const coerceParams = new Map<string, ParameterValue>();
  coerceParams.set("WFTextActionText", {
    kind: "InterpolatedText",
    parts: [{ kind: "variable", name: rawFnTempName }],
  });
  actions.push({
    identifier: "is.workflow.actions.gettext",
    uuid: nextUuid(ctx),
    parameters: coerceParams,
  });

  const fnNameTempName = nextTempName(ctx);
  actions.push(makeSetVariableAction(fnNameTempName, ctx));

  for (const [name, decl] of functions) {
    const fnGroupId = nextUuid(ctx);
    actions.push(makeGetVariableAction(fnNameTempName, ctx));
    actions.push(
      makeConditionalAction(0, fnGroupId, ctx, {
        WFCondition: 4,
        WFConditionalActionString: name,
        WFInput: makeConditionInput(fnNameTempName),
      }),
    );

    for (const param of decl.params) {
      actions.push(makeGetVariableAction(inputTempName, ctx));
      const paramKeyParams = new Map<string, ParameterValue>();
      paramKeyParams.set("WFDictionaryKey", param.name);
      actions.push({
        identifier: "is.workflow.actions.getvalueforkey",
        uuid: nextUuid(ctx),
        parameters: paramKeyParams,
      });
      actions.push(makeSetVariableAction(param.name, ctx));
    }

    for (const stmt of decl.body) {
      lowerStatement(stmt, actions, ctx);
    }

    const lastStmt = decl.body.at(-1);
    if (!lastStmt || lastStmt.kind !== "ReturnStatement") {
      actions.push({
        identifier: "is.workflow.actions.output",
        uuid: nextUuid(ctx),
        parameters: new Map<string, ParameterValue>(),
      });
    }

    actions.push(makeConditionalAction(2, fnGroupId, ctx));
  }

  actions.push(makeConditionalAction(2, outerGroupId, ctx));
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
      lowerDestructure(stmt, actions, ctx);
      return;
    case "LetDestructure":
      lowerDestructure(stmt, actions, ctx);
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
  if (decl.initializer.kind === "NilLiteral") {
    // Skip the Nothing action — a Set Variable with no input sets the variable to empty
    actions.push(makeSetVariableAction(decl.name, ctx));
    return;
  }
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
  const parameters = new Map<string, ParameterValue>();
  if (stmt.value) {
    lowerExpression(stmt.value, actions, ctx);
    const tempName = nextTempName(ctx);
    actions.push(makeSetVariableAction(tempName, ctx));
    parameters.set("WFOutput", { kind: "VariableRef", name: tempName });
  }
  actions.push({
    identifier: "is.workflow.actions.output",
    uuid: nextUuid(ctx),
    parameters,
  });
}

function lowerExpression(expr: Expression, actions: ActionIR[], ctx: LowerContext): void {
  switch (expr.kind) {
    case "CallExpression":
      if (expr.callee.kind === "Identifier" && ctx.records.has(expr.callee.name)) {
        lowerRecordConstruction(expr, actions, ctx);
        return;
      }
      if (
        expr.callee.kind === "MemberExpression" &&
        expr.callee.object.kind === "Identifier" &&
        ctx.namespaceRecords.get(expr.callee.object.name)?.has(expr.callee.property)
      ) {
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
      if (expr.object.kind === "Identifier") {
        const importedConstant = ctx.namespaceConstants.get(expr.object.name)?.get(expr.property);
        if (importedConstant) {
          actions.push(makeGetVariableAction(importedConstant, ctx));
          return;
        }
      }
      if (expr.object.kind === "MemberExpression" && expr.object.object.kind === "Identifier") {
        const importedEnum = ctx.namespaceEnums
          .get(expr.object.object.name)
          ?.get(expr.object.property);
        const backingValue = importedEnum?.get(expr.property);
        if (backingValue !== undefined) {
          actions.push(makeTextAction(backingValue, ctx));
          return;
        }
      }
      if (expr.object.kind === "Identifier" && ctx.enums.has(expr.object.name)) {
        lowerEnumMemberAccess(expr.object.name, expr.property, expr.span, actions, ctx);
        return;
      }
      if (expr.resolvedProperty) {
        lowerOpaquePropertyAccess(expr, actions, ctx);
        return;
      }
      lowerKeyedAccess(expr.object, expr.property, actions, ctx);
      return;
    case "OptionalMemberExpression":
      if (expr.resolvedProperty) {
        lowerOpaquePropertyAccess(expr, actions, ctx);
        return;
      }
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
    case "CoercionExpression":
      lowerCoercionExpression(expr, actions, ctx);
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

function lowerNamespaceActionCall(
  expr: CallExpression,
  nsAction: NamespaceAction,
  parentActions: ActionIR[],
  ctx: LowerContext,
): ActionIR {
  const parameters = new Map<string, ParameterValue>();
  for (const binding of expr.resolvedCall?.bindings ?? []) {
    if (binding.source !== "argument" || binding.argumentIndex === undefined) {
      continue;
    }
    const arg = expr.args.at(binding.argumentIndex);
    if (!arg) {
      continue;
    }
    if (binding.label === nsAction.inputLabel) {
      lowerExpression(arg.value, parentActions, ctx);
      continue;
    }
    const slot = getParameterSlot(nsAction.runtimeIdentifier, binding.runtimeKey);
    if (arg.value.kind === "ListLiteral") {
      parameters.set(binding.runtimeKey, lowerListItems(arg.value, parentActions, ctx));
      continue;
    }
    if (
      slot === "picker" &&
      (arg.value.kind === "StringLiteral" || arg.value.kind === "NumberLiteral")
    ) {
      lowerExpression(arg.value, parentActions, ctx);
      const tempName = nextTempName(ctx);
      parentActions.push(makeSetVariableAction(tempName, ctx));
      parameters.set(binding.runtimeKey, { kind: "VariableRef", name: tempName });
    } else {
      parameters.set(binding.runtimeKey, lowerToParamValue(arg.value, parentActions, ctx));
    }
  }
  return { identifier: nsAction.runtimeIdentifier, uuid: nextUuid(ctx), parameters };
}
function lowerCall(expr: CallExpression, actions: ActionIR[], ctx: LowerContext): ActionIR {
  if (expr.callee.kind === "MemberExpression" && expr.callee.object.kind === "Identifier") {
    const nsActions = ctx.namespaceActions.get(expr.callee.object.name);
    const nsAction =
      expr.resolvedCall?.overloadIndex !== undefined
        ? nsActions?.get(
            namespaceOverloadKey(expr.callee.property, expr.resolvedCall?.overloadIndex),
          )
        : nsActions?.get(expr.callee.property);
    if (nsAction) {
      return lowerNamespaceActionCall(expr, nsAction, actions, ctx);
    }
    const nsFunction = ctx.namespaceFunctions
      .get(expr.callee.object.name)
      ?.get(expr.callee.property);
    if (nsFunction) {
      return lowerFunctionCall(expr, nsFunction.declaration, actions, ctx, nsFunction.runtimeName);
    }
  }

  if (expr.callee.kind !== "Identifier") {
    throw new LowerError("only direct action calls are supported in this subset", expr.callee.span);
  }

  const actionName = expr.callee.name;
  const funcDecl = ctx.functions.get(actionName);

  if (funcDecl) {
    return lowerFunctionCall(expr, funcDecl, actions, ctx);
  }

  const actionDecl = ctx.actions.get(actionName)?.at(expr.resolvedCall?.overloadIndex ?? 0);

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
  runtimeName = decl.name,
): ActionIR {
  const entries: import("./ir.ts").DictEntry[] = [
    { itemType: 0, key: "__chute_fn", value: runtimeName },
  ];
  for (const binding of expr.resolvedCall?.bindings ?? []) {
    const valueExpr =
      binding.source === "argument" && binding.argumentIndex !== undefined
        ? expr.args.at(binding.argumentIndex)?.value
        : decl.params.at(binding.parameterIndex)?.defaultValue;
    if (!valueExpr) {
      continue;
    }
    entries.push({
      itemType: collectionItemType(valueExpr),
      key: binding.runtimeKey,
      value: wrapAsTextToken(lowerToParamValue(valueExpr, actions, ctx)),
    });
  }
  const dictParams = new Map<string, ParameterValue>();
  dictParams.set("WFItems", { kind: "DictItems", entries });
  actions.push({
    identifier: "is.workflow.actions.dictionary",
    uuid: nextUuid(ctx),
    parameters: dictParams,
  });
  const dictTempName = nextTempName(ctx);
  actions.push(makeSetVariableAction(dictTempName, ctx));
  const runParams = new Map<string, ParameterValue>();
  runParams.set("WFWorkflow", { kind: "SelfRef", name: ctx.shortcutName });
  runParams.set("WFInput", { kind: "VariableRef", name: dictTempName });
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
  for (const binding of expr.resolvedCall?.bindings ?? []) {
    const valueExpr =
      binding.source === "argument" && binding.argumentIndex !== undefined
        ? expr.args.at(binding.argumentIndex)?.value
        : decl.params.at(binding.parameterIndex)?.defaultValue;
    if (valueExpr) {
      parameters.set(binding.runtimeKey, lowerToParamValue(valueExpr, parentActions, ctx));
    }
  }
  return { identifier: decl.runtimeIdentifier, uuid: nextUuid(ctx), parameters };
}
function lowerBinaryExpression(
  expr: BinaryExpression,
  actions: ActionIR[],
  ctx: LowerContext,
): void {
  lowerExpression(expr.left, actions, ctx);
  const operand = lowerOperandPreservingMagicVariable(expr.right, actions, ctx);

  const parameters = new Map<string, ParameterValue>();
  if (expr.operator === "%") {
    parameters.set("WFMathOperation", "…");
    parameters.set("WFScientificMathOperation", "Modulus");
    parameters.set("WFScientificMathOperand", operand);
  } else {
    parameters.set("WFMathOperation", mathOperationSymbol(expr.operator));
    parameters.set("WFMathOperand", operand);
  }

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
  const coalesceTempName = captureConditionVariable(expr.left, actions, ctx);
  actions.push(
    makeConditionalAction(0, groupId, ctx, {
      WFCondition: 100,
      WFInput: makeConditionInput(coalesceTempName),
    }),
  );

  actions.push(makeGetVariableAction(coalesceTempName, ctx));
  actions.push(makeConditionalAction(1, groupId, ctx));

  lowerExpression(expr.right, actions, ctx);
  actions.push(makeConditionalAction(2, groupId, ctx));
}

function collectionItemType(expr: Expression): number {
  if (expr.kind === "NumberLiteral") {
    return 3;
  }
  if (expr.kind === "BooleanLiteral") {
    return 4;
  }
  return 0; // Text
}

function lowerListItems(
  expr: ListLiteral,
  actions: ActionIR[],
  ctx: LowerContext,
): import("./ir.ts").ListItems {
  const items: import("./ir.ts").ListItem[] = expr.elements.map((el) => ({
    itemType: collectionItemType(el),
    value: lowerToParamValue(el, actions, ctx),
  }));

  return { kind: "ListItems", items };
}

function lowerListLiteral(expr: ListLiteral, actions: ActionIR[], ctx: LowerContext): void {
  const parameters = new Map<string, ParameterValue>();
  parameters.set("WFItems", lowerListItems(expr, actions, ctx));

  actions.push({
    identifier: "is.workflow.actions.list",
    uuid: nextUuid(ctx),
    parameters,
  });
}

function wrapAsTextToken(value: ParameterValue): ParameterValue {
  if (typeof value === "number") {
    return {
      kind: "InterpolatedText",
      parts: [{ kind: "text", value: String(value) }],
    };
  }
  return value;
}

function lowerDictionaryLiteral(
  expr: DictionaryLiteral,
  actions: ActionIR[],
  ctx: LowerContext,
): void {
  const entries: import("./ir.ts").DictEntry[] = expr.entries.map((entry) => ({
    itemType: collectionItemType(entry.value),
    key: lowerToParamValue(entry.key, actions, ctx),
    value: wrapAsTextToken(lowerToParamValue(entry.value, actions, ctx)),
  }));

  const parameters = new Map<string, ParameterValue>();
  parameters.set("WFItems", { kind: "DictItems", entries });

  actions.push({
    identifier: "is.workflow.actions.dictionary",
    uuid: nextUuid(ctx),
    parameters,
  });
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

function aggrandizementFromResolved(resolved: ResolvedProperty): Aggrandizement {
  switch (resolved.kind) {
    case "property":
      return {
        kind: "property",
        name: resolved.shortcutsName,
        ...(resolved.userInfo !== undefined ? { userInfo: resolved.userInfo } : {}),
      };
    case "dateFormat":
      return { kind: "dateFormat", format: resolved.format };
    case "urlComponent":
      throw new Error("urlComponent properties do not use aggrandizements");
  }
}

function lowerOpaquePropertyAccess(
  expr: MemberExpression | OptionalMemberExpression,
  actions: ActionIR[],
  ctx: LowerContext,
): void {
  const objectName = resolveVariableName(expr.object, actions, ctx);
  const resolved = expr.resolvedProperty;
  if (!resolved) {
    throw new LowerError(`missing resolved property for '${expr.property}'`, expr.span);
  }

  if (resolved.kind === "urlComponent") {
    const parameters = new Map<string, ParameterValue>();
    parameters.set("WFURL", {
      kind: "VariableRef",
      name: objectName,
    });
    parameters.set("WFURLComponent", resolved.component);
    actions.push({
      identifier: "is.workflow.actions.geturlcomponent",
      uuid: nextUuid(ctx),
      parameters,
    });
    return;
  }

  if (resolved.kind === "dateFormat") {
    actions.push(makeGetVariableAction(objectName, ctx));
    const parameters = new Map<string, ParameterValue>();
    parameters.set("WFDateFormatStyle", "Custom");
    parameters.set("WFDateFormat", resolved.format);
    actions.push({
      identifier: "is.workflow.actions.format.date",
      uuid: nextUuid(ctx),
      parameters,
    });
    return;
  }

  const parameters = new Map<string, ParameterValue>();
  parameters.set("WFVariable", {
    kind: "VariableRef",
    name: objectName,
    aggrandizements: [aggrandizementFromResolved(resolved)],
  });
  actions.push({
    identifier: "is.workflow.actions.getvariable",
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
  if (isSideEffectFreeValue(expr, ctx)) {
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
function isSideEffectFreeValue(expr: Expression, ctx: LowerContext): boolean {
  switch (expr.kind) {
    case "StringLiteral":
    case "NumberLiteral":
    case "BooleanLiteral":
    case "Identifier":
    case "DotNameExpression":
      return true;
    case "MemberExpression":
      return expr.object.kind === "Identifier" && ctx.enums.has(expr.object.name);
    case "InterpolatedString":
      return expr.parts.every(
        (part) => part.kind === "TextPart" || part.expression.kind === "Identifier",
      );
    case "CoercionExpression":
      return expr.expression.kind === "Identifier";
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
    case "MemberExpression": {
      if (expr.object.kind === "Identifier" && ctx.enums.has(expr.object.name)) {
        const backingValue = ctx.enums.get(expr.object.name)?.get(expr.property);
        if (backingValue !== undefined) {
          return backingValue;
        }
      }
      lowerExpression(expr, actions, ctx);
      break;
    }
    case "DotNameExpression": {
      if (expr.resolvedBackingValue !== undefined) {
        return expr.resolvedBackingValue;
      }
      lowerExpression(expr, actions, ctx);
      break;
    }
    case "InterpolatedString":
      return buildInterpolatedText(expr, actions, ctx);
    case "CoercionExpression": {
      if (expr.targetType === "Text") {
        const innerName = resolveVariableName(expr.expression, actions, ctx);
        const itemClass = getContentItemClass(expr.targetType);
        if (!itemClass) {
          throw new LowerError(`no content item class for type '${expr.targetType}'`, expr.span);
        }
        return {
          kind: "VariableRef",
          name: innerName,
          aggrandizements: [
            {
              kind: "coercion",
              itemClass,
            },
          ],
        };
      }
      lowerExpression(expr, actions, ctx);
      break;
    }
    default:
      lowerExpression(expr, actions, ctx);
      break;
  }
  const tempName = nextTempName(ctx);
  actions.push(makeSetVariableAction(tempName, ctx));
  return {
    kind: "VariableRef",
    name: tempName,
  };
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

function captureConditionVariable(
  expr: Expression,
  actions: ActionIR[],
  ctx: LowerContext,
): string {
  if (expr.kind === "Identifier") {
    return expr.name;
  }
  const tempName = nextTempName(ctx);
  actions.push(makeSetVariableAction(tempName, ctx));
  return tempName;
}

function makeConditionInput(name: string): ConditionInput {
  return {
    kind: "ConditionInput",
    reference: { kind: "VariableRef", name },
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
  startParams.set("WFMenuItems", {
    kind: "StringArray",
    values: stmt.cases.map((c) => c.label),
  });
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
    caseParams.set("WFMenuItemAttributedTitle", c.label);
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

function lowerCoercionExpression(
  expr: CoercionExpression,
  actions: ActionIR[],
  ctx: LowerContext,
): void {
  const objectName = resolveVariableName(expr.expression, actions, ctx);
  const itemClass = getContentItemClass(expr.targetType);
  if (!itemClass) {
    throw new LowerError(`no content item class for type '${expr.targetType}'`, expr.span);
  }

  const parameters = new Map<string, ParameterValue>();
  parameters.set("WFVariable", {
    kind: "VariableRef",
    name: objectName,
    aggrandizements: [
      {
        kind: "coercion",
        itemClass,
      },
    ],
  });
  actions.push({
    identifier: "is.workflow.actions.getvariable",
    uuid: nextUuid(ctx),
    parameters,
  });

  if (expr.targetType !== "Text") {
    emitCoercionNilFallback(actions, ctx);
  }
}

function emitCoercionNilFallback(actions: ActionIR[], ctx: LowerContext): void {
  const tempName = nextTempName(ctx);
  actions.push(makeSetVariableAction(tempName, ctx));

  // Failed conversions render as "No" on iOS and "false" on macOS.
  // Compare text explicitly so Shortcuts cannot interpret a numeric zero as false.
  const textUuid = nextUuid(ctx);
  const textInput: ConditionInput = {
    kind: "ConditionInput",
    reference: { kind: "ActionOutputRef", outputName: "Text", outputUUID: textUuid },
  };
  actions.push({
    identifier: "is.workflow.actions.gettext",
    uuid: nextUuid(ctx),
    parameters: new Map<string, ParameterValue>([
      ["UUID", textUuid],
      [
        "WFTextActionText",
        {
          kind: "InterpolatedText",
          parts: [{ kind: "variable", name: tempName }],
        },
      ],
    ]),
  });
  const groupId = nextUuid(ctx);
  actions.push(
    makeConditionalAction(0, groupId, ctx, {
      WFCondition: 4,
      WFConditionalActionString: "No",
      WFInput: textInput,
    }),
  );
  actions.push(makeNothingAction(ctx));
  actions.push(makeConditionalAction(1, groupId, ctx));
  const macGroupId = nextUuid(ctx);
  actions.push(
    makeConditionalAction(0, macGroupId, ctx, {
      WFCondition: 4,
      WFConditionalActionString: "false",
      WFInput: textInput,
    }),
  );
  actions.push(makeNothingAction(ctx));
  actions.push(makeConditionalAction(1, macGroupId, ctx));
  actions.push(makeGetVariableAction(tempName, ctx));
  actions.push(makeConditionalAction(2, macGroupId, ctx));
  actions.push(makeConditionalAction(2, groupId, ctx));
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

  const useDirectNumericIdentifier =
    cond.left.kind === "Identifier" && cond.right.kind === "NumberLiteral";
  let leftVarName: string;
  if (useDirectNumericIdentifier && cond.left.kind === "Identifier") {
    leftVarName = cond.left.name;
  } else {
    lowerExpression(cond.left, actions, ctx);
    leftVarName = captureConditionVariable(cond.left, actions, ctx);
  }

  const rightValue = lowerOperandPreservingMagicVariable(cond.right, actions, ctx);
  const isTextOperator =
    cond.operator === "contains" ||
    cond.operator === "!contains" ||
    cond.operator === "hasPrefix" ||
    cond.operator === "hasSuffix";
  const condCode = comparisonConditionCode(cond.operator, isTextOperator);

  const extra: Record<string, ParameterValue> = {
    WFCondition: condCode,
    WFInput: makeConditionInput(leftVarName),
  };

  if (typeof rightValue === "number") {
    extra["WFNumberValue"] = String(rightValue);
    extra["WFInput"] = {
      kind: "ConditionInput",
      reference: {
        kind: "VariableRef",
        name: leftVarName,
        aggrandizements: [{ kind: "coercion", itemClass: "WFNumberContentItem" }],
      },
    };
  } else {
    extra["WFConditionalActionString"] = rightValue;

    const rawName = nextTempName(ctx);
    actions.push(makeSetVariableAction(rawName, ctx));
    const coerceParams = new Map<string, ParameterValue>();
    coerceParams.set("WFTextActionText", {
      kind: "InterpolatedText",
      parts: [{ kind: "variable", name: rawName }],
    });
    const outputUuid = nextUuid(ctx);
    coerceParams.set("UUID", outputUuid);
    const textAction: ActionIR = {
      identifier: "is.workflow.actions.gettext",
      uuid: nextUuid(ctx),
      parameters: coerceParams,
    };
    actions.push(textAction);
    extra["WFInput"] = {
      kind: "ConditionInput",
      reference: {
        kind: "ActionOutputRef",
        outputName: "Text",
        outputUUID: outputUuid,
      },
    };
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
  const subjectVarName = captureConditionVariable(cond.subject, actions, ctx);
  const lowValue = lowerOperandPreservingMagicVariable(cond.low, actions, ctx);
  const highValue = lowerToParamValue(cond.high, actions, ctx);

  const extra: Record<string, ParameterValue> = {
    WFCondition: 999,
    WFInput: makeConditionInput(subjectVarName),
    WFNumberValue: typeof lowValue === "number" ? String(lowValue) : lowValue,
    WFAnotherNumber: typeof highValue === "number" ? String(highValue) : highValue,
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
  const varName = captureConditionVariable(cond.subject, actions, ctx);

  const extra: Record<string, ParameterValue> = {
    WFCondition: 100,
    WFInput: makeConditionInput(varName),
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
  const varName = captureConditionVariable(subject, actions, ctx);

  const extra: Record<string, ParameterValue> = {
    WFCondition: 100,
    WFInput: makeConditionInput(varName),
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
  actions.push(
    makeConditionalAction(0, groupId, ctx, {
      WFCondition: 4,
      WFNumberValue: "0",
      WFInput: makeConditionInput(tempName),
    }),
  );
  thenBranch();
  if (elseBranch) {
    actions.push(makeConditionalAction(1, groupId, ctx));
    elseBranch();
  }
  actions.push(makeConditionalAction(2, groupId, ctx));
}

function comparisonConditionCode(
  op: import("./ast.ts").ComparisonOperator,
  isText = false,
): number {
  if (isText) {
    switch (op) {
      case "==":
        return 4;
      case "!=":
        return 5;
      case "contains":
        return 99;
      case "!contains":
        return 999;
      case "hasPrefix":
        return 8;
      case "hasSuffix":
        return 9;
      default:
        return 4;
    }
  }
  switch (op) {
    case "==":
      return 4;
    case "!=":
      return 5;
    case ">":
      return 2;
    case ">=":
      return 3;
    case "<":
      return 0;
    case "<=":
      return 1;
    case "contains":
      return 99;
    case "!contains":
      return 999;
    case "hasPrefix":
      return 8;
    case "hasSuffix":
      return 9;
  }
}

function lowerDestructure(
  stmt: ConstDestructure | LetDestructure,
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
  const entries: import("./ir.ts").DictEntry[] = [];

  for (const arg of expr.args) {
    if (!arg.label) {
      throw new LowerError(
        "record construction requires labeled arguments",
        arg.value.span,
        DiagnosticCode.ScopeError,
      );
    }

    entries.push({
      itemType: collectionItemType(arg.value),
      key: arg.label,
      value: wrapAsTextToken(lowerToParamValue(arg.value, actions, ctx)),
    });
  }

  const parameters = new Map<string, ParameterValue>();
  parameters.set("WFItems", { kind: "DictItems", entries });

  actions.push({
    identifier: "is.workflow.actions.dictionary",
    uuid: nextUuid(ctx),
    parameters,
  });
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

  const pipelineTempName = nextTempName(ctx);
  actions.push(makeSetVariableAction(pipelineTempName, ctx));
  actions.push(makeGetVariableAction(pipelineTempName, ctx));

  const groupId = nextUuid(ctx);
  actions.push(
    makeConditionalAction(0, groupId, ctx, {
      WFCondition: 100,
      WFInput: makeConditionInput(pipelineTempName),
    }),
  );

  for (const stage of expr.stages.slice(optionalIndex)) {
    lowerPipelineStage(stage, actions, ctx);
  }

  actions.push(makeConditionalAction(1, groupId, ctx));
  actions.push(makeNothingAction(ctx));
  actions.push(makeConditionalAction(2, groupId, ctx));
}

function lowerPipelineStage(stage: PipelineStage, actions: ActionIR[], ctx: LowerContext): void {
  if (stage.callee.kind === "CoercionExpression") {
    const targetType = stage.callee.targetType;
    const itemClass = getContentItemClass(targetType);
    if (!itemClass) {
      throw new LowerError(`no content item class for type '${targetType}'`, stage.span);
    }
    const tempName = nextTempName(ctx);
    actions.push(makeSetVariableAction(tempName, ctx));
    const parameters = new Map<string, ParameterValue>();
    parameters.set("WFVariable", {
      kind: "VariableRef",
      name: tempName,
      aggrandizements: [
        {
          kind: "coercion",
          itemClass,
        },
      ],
    });
    actions.push({
      identifier: "is.workflow.actions.getvariable",
      uuid: nextUuid(ctx),
      parameters,
    });
    if (targetType !== "Text") {
      emitCoercionNilFallback(actions, ctx);
    }
    return;
  }

  if (
    stage.callee.kind === "MemberExpression" &&
    stage.callee.object.kind === "PlaceholderExpression" &&
    stage.callee.resolvedProperty
  ) {
    const resolved = stage.callee.resolvedProperty;
    const tempName = nextTempName(ctx);
    actions.push(makeSetVariableAction(tempName, ctx));

    if (resolved.kind === "urlComponent") {
      const parameters = new Map<string, ParameterValue>();
      parameters.set("WFURL", {
        kind: "VariableRef",
        name: tempName,
      });
      parameters.set("WFURLComponent", resolved.component);
      actions.push({
        identifier: "is.workflow.actions.geturlcomponent",
        uuid: nextUuid(ctx),
        parameters,
      });
    } else if (resolved.kind === "dateFormat") {
      actions.push(makeGetVariableAction(tempName, ctx));
      const parameters = new Map<string, ParameterValue>();
      parameters.set("WFDateFormatStyle", "Custom");
      parameters.set("WFDateFormat", resolved.format);
      actions.push({
        identifier: "is.workflow.actions.format.date",
        uuid: nextUuid(ctx),
        parameters,
      });
    } else {
      const parameters = new Map<string, ParameterValue>();
      parameters.set("WFVariable", {
        kind: "VariableRef",
        name: tempName,
        aggrandizements: [aggrandizementFromResolved(resolved)],
      });
      actions.push({
        identifier: "is.workflow.actions.getvariable",
        uuid: nextUuid(ctx),
        parameters,
      });
    }
    return;
  }

  if (
    stage.callee.kind === "MemberExpression" &&
    stage.callee.object.kind === "PlaceholderExpression" &&
    !stage.callee.resolvedProperty
  ) {
    const tempName = nextTempName(ctx);
    actions.push(makeSetVariableAction(tempName, ctx));
    actions.push(makeGetVariableAction(tempName, ctx));
    const parameters = new Map<string, ParameterValue>();
    parameters.set("WFDictionaryKey", stage.callee.property);
    actions.push({
      identifier: "is.workflow.actions.getvalueforkey",
      uuid: nextUuid(ctx),
      parameters,
    });
    return;
  }

  if (stage.callee.kind === "MemberExpression" && stage.callee.object.kind === "Identifier") {
    const nsActions = ctx.namespaceActions.get(stage.callee.object.name);
    const nsAction =
      stage.resolvedCall?.overloadIndex !== undefined
        ? nsActions?.get(
            namespaceOverloadKey(stage.callee.property, stage.resolvedCall?.overloadIndex),
          )
        : nsActions?.get(stage.callee.property);
    if (nsAction) {
      lowerPipelineActionStage(stage, nsAction.runtimeIdentifier, undefined, actions, ctx);
      return;
    }
  }

  const calleeName = resolveStageCalleeName(stage.callee);
  const funcDecl = calleeName ? ctx.functions.get(calleeName) : undefined;

  if (funcDecl) {
    lowerPipelineFunctionStage(stage, funcDecl, actions, ctx);
    return;
  }

  const actionDecl = calleeName
    ? ctx.actions.get(calleeName)?.at(stage.resolvedCall?.overloadIndex ?? 0)
    : undefined;
  if (actionDecl) {
    lowerPipelineActionStage(stage, actionDecl.runtimeIdentifier, actionDecl, actions, ctx);
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

  const entries: import("./ir.ts").DictEntry[] = [];
  for (const binding of stage.resolvedCall?.bindings ?? []) {
    if (binding.source === "pipelineInput") {
      entries.push({
        itemType: 0,
        key: binding.runtimeKey,
        value: { kind: "VariableRef", name: pipedTempName },
      });
      continue;
    }
    const valueExpr =
      binding.source === "argument" && binding.argumentIndex !== undefined
        ? stage.args.at(binding.argumentIndex)?.value
        : decl.params.at(binding.parameterIndex)?.defaultValue;
    if (!valueExpr) {
      continue;
    }
    entries.push({
      itemType: collectionItemType(valueExpr),
      key: binding.runtimeKey,
      value: wrapAsTextToken(lowerToParamValue(valueExpr, actions, ctx)),
    });
  }

  entries.push({
    itemType: 0,
    key: "__chute_fn",
    value: decl.name,
  });

  const dictParams = new Map<string, ParameterValue>();
  dictParams.set("WFItems", { kind: "DictItems", entries });
  actions.push({
    identifier: "is.workflow.actions.dictionary",
    uuid: nextUuid(ctx),
    parameters: dictParams,
  });

  const dictTempName = nextTempName(ctx);
  actions.push(makeSetVariableAction(dictTempName, ctx));

  const runParams = new Map<string, ParameterValue>();
  runParams.set("WFWorkflow", { kind: "SelfRef", name: ctx.shortcutName });
  runParams.set("WFInput", { kind: "VariableRef", name: dictTempName });
  actions.push({
    identifier: "is.workflow.actions.runworkflow",
    uuid: nextUuid(ctx),
    parameters: runParams,
  });
}

function lowerPipelineActionStage(
  stage: PipelineStage,
  runtimeIdentifier: string,
  declaration: ActionDeclaration | undefined,
  actions: ActionIR[],
  ctx: LowerContext,
): void {
  const parameters = new Map<string, ParameterValue>();
  for (const binding of stage.resolvedCall?.bindings ?? []) {
    if (binding.source === "pipelineInput") {
      continue;
    }
    const valueExpr =
      binding.source === "argument" && binding.argumentIndex !== undefined
        ? stage.args.at(binding.argumentIndex)?.value
        : declaration?.params.at(binding.parameterIndex)?.defaultValue;
    if (!valueExpr) {
      continue;
    }
    parameters.set(binding.runtimeKey, lowerToParamValue(valueExpr, actions, ctx));
  }

  actions.push({
    identifier: runtimeIdentifier,
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
