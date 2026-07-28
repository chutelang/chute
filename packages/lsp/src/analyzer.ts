import {
  Lexer,
  Parser,
  checkCollecting,
  CompileError,
  TokenKind,
  describeType,
} from "@chute-lang/compiler";
import type { Program, Diagnostic, Span, ChuteType, Scope, Token } from "@chute-lang/compiler";
import type { SymbolInfo, IdentifierAtOffset } from "./find-node.ts";
import { collectDefinitions, findIdentifierAtOffset } from "./find-node.ts";

export interface AnalysisResult {
  diagnostics: Diagnostic[];
  ast: Program | undefined;
  scope: Scope | undefined;
  definitions: SymbolInfo[];
  tokens: Token[];
}

export function analyze(source: string): AnalysisResult {
  let tokens: Token[];
  try {
    tokens = new Lexer(source).tokenize();
  } catch (e) {
    if (e instanceof CompileError) {
      return {
        diagnostics: e.diagnostics,
        ast: undefined,
        scope: undefined,
        definitions: [],
        tokens: [],
      };
    }
    throw e;
  }

  let ast: Program;
  try {
    ast = new Parser(tokens).parse();
  } catch (e) {
    if (e instanceof CompileError) {
      return {
        diagnostics: e.diagnostics,
        ast: undefined,
        scope: undefined,
        definitions: [],
        tokens,
      };
    }
    throw e;
  }

  const checkResult = checkCollecting(ast);
  const definitions = collectDefinitions(ast);

  return {
    diagnostics: checkResult.diagnostics,
    ast,
    scope: checkResult.scope,
    definitions,
    tokens,
  };
}

export function resolveDefinition(result: AnalysisResult, offset: number): Span | undefined {
  if (!result.ast) return undefined;

  const ident = findIdentifierAtOffset(result.ast, offset);
  if (!ident) return undefined;

  return findDefinitionSpan(ident, result.definitions);
}

function findDefinitionSpan(
  ident: IdentifierAtOffset,
  definitions: SymbolInfo[],
): Span | undefined {
  if (ident.context === "definition") {
    return ident.span;
  }

  for (let i = definitions.length - 1; i >= 0; i--) {
    const def = definitions[i];
    if (!def) continue;
    if (def.name === ident.name) {
      return def.span;
    }
  }
  return undefined;
}

export function resolveHover(result: AnalysisResult, offset: number): string | undefined {
  if (!result.ast || !result.scope) return undefined;

  const ident = findIdentifierAtOffset(result.ast, offset);
  if (!ident) return undefined;

  if (ident.context === "namespace-member" && ident.namespaceName) {
    const ns = result.scope.lookupNamespace(ident.namespaceName);
    if (ns) {
      const binding = ns.lookup(ident.name);
      if (binding) return formatTypeHover(ident.name, binding.type);
      const typeDef = ns.lookupType(ident.name);
      if (typeDef) return formatTypeHover(ident.name, typeDef);
    }
    return undefined;
  }

  const binding = result.scope.lookup(ident.name);
  if (binding) return formatTypeHover(ident.name, binding.type);

  const typeDef = result.scope.lookupType(ident.name);
  if (typeDef) return formatTypeHover(ident.name, typeDef);

  return undefined;
}

function formatTypeHover(name: string, type: ChuteType): string {
  switch (type.kind) {
    case "function":
      return formatFunctionSignature(type);
    case "action":
      return formatActionSignature(type);
    case "enum":
      return formatEnumType(type);
    case "record":
      return formatRecordType(type);
    default:
      return `${name}: ${describeType(type)}`;
  }
}

function formatFunctionSignature(type: ChuteType & { kind: "function" }): string {
  const params = type.params.map((p) => `${p.name}: ${describeType(p.type)}`).join(", ");
  const ret = type.returnType ? ` -> ${describeType(type.returnType)}` : "";
  return `func ${type.name}(${params})${ret}`;
}

function formatActionSignature(type: ChuteType & { kind: "action" }): string {
  const params = type.params.map((p) => `${p.label}: ${describeType(p.type)}`).join(", ");
  const ret = type.returnType ? ` -> ${describeType(type.returnType)}` : "";
  return `action ${type.name}(${params})${ret}`;
}

function formatEnumType(type: ChuteType & { kind: "enum" }): string {
  const cases = [...type.cases.keys()].join(", ");
  return `enum ${type.name} { ${cases} }`;
}

function formatRecordType(type: ChuteType & { kind: "record" }): string {
  const fields = [...type.fields.entries()]
    .map(([name, t]) => `${name}: ${describeType(t)}`)
    .join(", ");
  return `record ${type.name} { ${fields} }`;
}

const KEYWORDS = [
  "action",
  "and",
  "as",
  "case",
  "contains",
  "else",
  "enum",
  "export",
  "false",
  "for",
  "func",
  "hasPrefix",
  "hasSuffix",
  "if",
  "import",
  "in",
  "input",
  "is",
  "let",
  "menu",
  "nil",
  "not",
  "or",
  "record",
  "repeat",
  "return",
  "shortcut",
  "true",
  "var",
];

export interface CompletionItem {
  label: string;
  kind: "variable" | "function" | "action" | "enum" | "record" | "keyword" | "enum-case" | "field";
  detail?: string;
}

export function getCompletions(result: AnalysisResult): CompletionItem[] {
  const items: CompletionItem[] = [];

  for (const kw of KEYWORDS) {
    items.push({
      label: kw,
      kind: "keyword",
    });
  }

  for (const def of result.definitions) {
    if (def.kind === "enum-case" || def.kind === "field") continue;
    items.push({
      label: def.name,
      kind: def.kind === "parameter" ? "variable" : def.kind === "import" ? "variable" : def.kind,
    });
  }

  if (result.scope) {
    addScopeCompletions(result.scope, items);
  }

  return deduplicateCompletions(items);
}

function addScopeCompletions(scope: Scope, items: CompletionItem[]): void {
  const seen = new Set(items.map((i) => i.label));
  const parent = getStdlibScopeBindings(scope);
  for (const [name, type] of parent) {
    if (seen.has(name)) continue;
    seen.add(name);
    items.push({
      label: name,
      kind: type.kind === "function" ? "function" : type.kind === "action" ? "action" : "variable",
      detail: describeType(type),
    });
  }
}

function getStdlibScopeBindings(scope: Scope): Map<string, ChuteType> {
  const result = new Map<string, ChuteType>();
  collectBindingsFromScope(scope, result);
  return result;
}

function collectBindingsFromScope(scope: Scope, out: Map<string, ChuteType>): void {
  const names = [
    "showAlert",
    "showResult",
    "notification",
    "nothing",
    "comment",
    "ask",
    "chooseFromList",
    "wait",
    "exitShortcut",
    "getClipboard",
    "setClipboard",
    "getBatteryLevel",
    "getCurrentDate",
    "getDeviceDetails",
    "count",
    "base64Encode",
    "hash",
    "generateUUID",
    "urlEncode",
    "runShortcut",
    "openApp",
    "getText",
    "changeCase",
    "replaceText",
    "splitText",
    "combineText",
    "matchText",
    "speak",
    "dictateText",
    "openURL",
    "getContentsOfURL",
    "searchWeb",
    "showWebPage",
    "expandURL",
    "getURLsFromInput",
    "share",
    "getFile",
    "saveFile",
    "deleteFiles",
    "createFolder",
    "renameFile",
    "richTextFromMarkdown",
    "markdownFromRichText",
    "addNewEvent",
    "getUpcomingEvents",
    "addNewReminder",
    "getUpcomingReminders",
    "selectContact",
    "addNewContact",
    "phone",
    "getCurrentLocation",
    "getDirections",
    "searchLocalBusiness",
    "takePicture",
    "selectPhotos",
    "getLatestPhotos",
    "saveToPhotoAlbum",
    "encodeMedia",
    "trimMedia",
    "setVolume",
    "setBrightness",
    "setAirplaneMode",
    "setWiFi",
    "setBluetooth",
    "setDoNotDisturb",
    "setCellularData",
    "setLowPowerMode",
    "setAppearance",
    "setFlashlight",
    "logHealthSample",
    "findHealthSamples",
    "input",
  ];

  for (const name of names) {
    const binding = scope.lookup(name);
    if (binding) {
      out.set(name, binding.type);
    }
  }
}

function deduplicateCompletions(items: CompletionItem[]): CompletionItem[] {
  const seen = new Set<string>();
  const result: CompletionItem[] = [];
  for (const item of items) {
    if (seen.has(item.label)) continue;
    seen.add(item.label);
    result.push(item);
  }
  return result;
}
