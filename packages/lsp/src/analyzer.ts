import { Lexer, Parser, checkCollecting, CompileError, describeType, getStdlibModuleNames } from "@chutelang/compiler";
import type { Program, Diagnostic, Span, ChuteType, Scope, DocComment } from "@chutelang/compiler";
import type { SymbolInfo, IdentifierAtOffset } from "./find-node.ts";
import { collectDefinitions, findIdentifierAtOffset } from "./find-node.ts";

export interface AnalysisResult {
  diagnostics: Diagnostic[];
  ast: Program | undefined;
  scope: Scope | undefined;
  definitions: SymbolInfo[];
}

export function analyze(source: string): AnalysisResult {
  let tokens;
  try {
    tokens = new Lexer(source).tokenize();
  } catch (e) {
    if (e instanceof CompileError) {
      return {
        diagnostics: e.diagnostics,
        ast: undefined,
        scope: undefined,
        definitions: [],
      };
    }
    throw e;
  }

  const parseResult = new Parser(tokens).parseCollecting();
  const ast = parseResult.program;
  const definitions = collectDefinitions(ast);

  let checkResult: { diagnostics: Diagnostic[]; scope: Scope } | undefined;
  try {
    checkResult = checkCollecting(ast);
  } catch {
    // Checker may throw on severely broken ASTs — fall through with no scope
  }

  return {
    diagnostics:
      parseResult.diagnostics.length > 0
        ? parseResult.diagnostics
        : (checkResult?.diagnostics ?? []),
    ast,
    scope: checkResult?.scope,
    definitions,
  };
}

export function resolveDefinition(result: AnalysisResult, offset: number): Span | undefined {
  if (!result.ast) {
    return undefined;
  }

  const ident = findIdentifierAtOffset(result.ast, offset);
  if (!ident) {
    return undefined;
  }

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
    if (!def) {
      continue;
    }
    if (def.name === ident.name) {
      return def.span;
    }
  }
  return undefined;
}

export function resolveHover(result: AnalysisResult, offset: number): string | undefined {
  if (!result.ast || !result.scope) {
    return undefined;
  }

  const ident = findIdentifierAtOffset(result.ast, offset);
  if (!ident) {
    return undefined;
  }

  let hover: HoverParts | undefined;

  if (ident.context === "namespace-member" && ident.namespaceName) {
    const ns = result.scope.lookupNamespace(ident.namespaceName);
    if (ns) {
      const binding = ns.lookup(ident.name);
      if (binding) {
        hover = formatTypeHover(ident.name, binding.type);
      } else {
        const typeDef = ns.lookupType(ident.name);
        if (typeDef) {
          hover = formatTypeHover(ident.name, typeDef);
        }
      }
    }
  } else {
    const binding = result.scope.lookup(ident.name);
    if (binding) {
      hover = formatTypeHover(ident.name, binding.type);
    } else {
      const typeDef = result.scope.lookupType(ident.name);
      if (typeDef) {
        hover = formatTypeHover(ident.name, typeDef);
      }
    }
  }

  if (!hover) {
    return undefined;
  }

  let markdown = "```chute\n" + hover.signature + "\n```";

  if (hover.description) {
    markdown += "\n\n" + hover.description;
  }

  const docComment = findDocComment(ident, result.definitions);
  if (docComment) {
    markdown += formatDocCommentMarkdown(docComment);
  }

  return markdown;
}

function findDocComment(
  ident: IdentifierAtOffset,
  definitions: SymbolInfo[],
): DocComment | undefined {
  for (let i = definitions.length - 1; i >= 0; i--) {
    const def = definitions[i];
    if (!def) {
      continue;
    }
    if (def.name === ident.name && def.docComment) {
      return def.docComment;
    }
  }
  return undefined;
}

function formatDocCommentMarkdown(doc: DocComment): string {
  let result = "\n\n---\n\n";

  if (doc.description.length > 0) {
    result += doc.description + "\n";
  }

  const params = doc.tags.filter((t) => t.kind === "param");
  if (params.length > 0) {
    result += "\n";
    for (const param of params) {
      if (param.name) {
        result += `**@param** \`${param.name}\` — ${param.body}\n\n`;
      }
    }
  }

  const examples = doc.tags.filter((t) => t.kind === "example");
  if (examples.length > 0) {
    for (const example of examples) {
      result += "\n**@example**\n```chute\n" + example.body + "\n```\n";
    }
  }

  return result;
}

interface HoverParts {
  signature: string;
  description?: string;
}

function formatTypeHover(name: string, type: ChuteType): HoverParts {
  switch (type.kind) {
    case "function":
      return { signature: formatFunctionSignature(type) };
    case "action": {
      const parts: HoverParts = { signature: formatActionSignature(type) };
      if (type.description) {
        parts.description = type.description;
      }
      return parts;
    }
    case "enum":
      return {
        signature: `(enum) ${type.name}\n\n${[...type.cases.keys()].map((c) => `  .${c}`).join("\n")}`,
      };
    case "record":
      return {
        signature: `(record) ${type.name}\n\n${[...type.fields.entries()].map(([n, t]) => `  ${n}: ${describeType(t)}`).join("\n")}`,
      };
    default:
      return { signature: `(${describeTypeKind(type)}) ${name}: ${describeType(type)}` };
  }
}

function describeTypeKind(type: ChuteType): string {
  switch (type.kind) {
    case "opaque":
      return "const";
    default:
      return "const";
  }
}

function formatParamType(type: ChuteType): string {
  if (type.kind === "enum") {
    return [...type.cases.keys()].map((c) => `.${c}`).join(" | ");
  }
  return describeType(type);
}

function formatFunctionSignature(type: ChuteType & { kind: "function" }): string {
  const paramLines = type.params.map((p) => {
    const optional = p.hasDefault ? "?" : "";
    return `  ${p.name}${optional}: ${formatParamType(p.type)}`;
  });
  const ret = type.returnType ? `: ${describeType(type.returnType)}` : "";

  if (paramLines.length === 0) {
    return `(function) ${type.name}()${ret}`;
  }
  if (paramLines.length === 1) {
    const p = type.params[0];
    if (p) {
      const optional = p.hasDefault ? "?" : "";
      const inline = `${p.name}${optional}: ${formatParamType(p.type)}`;
      if (inline.length < 60) {
        return `(function) ${type.name}(${inline})${ret}`;
      }
    }
  }
  return `(function) ${type.name}(\n${paramLines.join(",\n")}\n)${ret}`;
}

function formatActionSignature(type: ChuteType & { kind: "action" }): string {
  const paramLines = type.params.map((p) => {
    const optional = p.hasDefault ? "?" : "";
    return `  ${p.label}${optional}: ${formatParamType(p.type)}`;
  });
  const ret = type.returnType ? `: ${describeType(type.returnType)}` : "";

  if (paramLines.length === 0) {
    return `(action) ${type.name}()${ret}`;
  }
  if (paramLines.length <= 2) {
    const inline = type.params
      .map((p) => {
        const optional = p.hasDefault ? "?" : "";
        return `${p.label}${optional}: ${formatParamType(p.type)}`;
      })
      .join(", ");
    if (inline.length < 60) {
      return `(action) ${type.name}(${inline})${ret}`;
    }
  }
  return `(action) ${type.name}(\n${paramLines.join(",\n")}\n)${ret}`;
}

const KEYWORDS = [
  "action",
  "as",
  "case",
  "const",
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
  "record",
  "repeat",
  "return",
  "shortcut",
  "true",
];

export function getEnumCaseCompletions(
  result: AnalysisResult,
  calleeName: string,
  namespaceName: string | undefined,
  argIndex: number,
): CompletionItem[] {
  if (!result.scope) {
    return [];
  }

  let calleeType: ChuteType | undefined;
  if (namespaceName) {
    const ns = result.scope.lookupNamespace(namespaceName);
    if (ns) {
      calleeType = ns.lookup(calleeName)?.type;
    }
  } else {
    calleeType = result.scope.lookup(calleeName)?.type;
  }

  if (!calleeType) {
    return [];
  }

  let params: Array<{ type: ChuteType }> | undefined;
  if (calleeType.kind === "action") {
    params = calleeType.params;
  } else if (calleeType.kind === "function") {
    params = calleeType.params;
  }
  if (!params) {
    return [];
  }

  const param = params.at(argIndex);
  if (!param || param.type.kind !== "enum") {
    return [];
  }

  const items: CompletionItem[] = [];
  for (const caseName of param.type.cases.keys()) {
    items.push({
      label: caseName,
      kind: "enum-case",
    });
  }
  return items;
}

export function getImportCompletions(): CompletionItem[] {
  return getStdlibModuleNames().map((name) => ({
    label: name,
    kind: "module" as const,
  }));
}

export interface CompletionItem {
  label: string;
  kind: "variable" | "function" | "action" | "enum" | "record" | "keyword" | "enum-case" | "field" | "module";
  detail?: string;
}

export function getNamespaceCompletions(
  result: AnalysisResult,
  namespaceName: string,
): CompletionItem[] {
  if (!result.scope) {
    return [];
  }

  const ns = result.scope.lookupNamespace(namespaceName);
  if (!ns) {
    return [];
  }

  const items: CompletionItem[] = [];
  for (const [name, binding] of ns.allBindings()) {
    items.push({
      label: name,
      kind:
        binding.type.kind === "function"
          ? "function"
          : binding.type.kind === "action"
            ? "action"
            : "variable",
      detail: describeType(binding.type),
    });
  }

  const typeDef = result.scope.lookupType(namespaceName);
  if (typeDef?.kind === "enum") {
    for (const caseName of typeDef.cases.keys()) {
      items.push({
        label: caseName,
        kind: "enum-case",
      });
    }
  }
  if (typeDef?.kind === "record") {
    for (const [fieldName, fieldType] of typeDef.fields.entries()) {
      items.push({
        label: fieldName,
        kind: "field",
        detail: describeType(fieldType),
      });
    }
  }

  return deduplicateCompletions(items);
}

export function getCompletions(result: AnalysisResult): CompletionItem[] {
  const items: CompletionItem[] = [];

  for (const def of result.definitions) {
    if (def.kind === "enum-case" || def.kind === "field") {
      continue;
    }
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
  for (const [name, binding] of scope.allBindings()) {
    if (seen.has(name)) {
      continue;
    }
    seen.add(name);
    items.push({
      label: name,
      kind:
        binding.type.kind === "function"
          ? "function"
          : binding.type.kind === "action"
            ? "action"
            : "variable",
      detail: describeType(binding.type),
    });
  }
}

function deduplicateCompletions(items: CompletionItem[]): CompletionItem[] {
  const seen = new Set<string>();
  const result: CompletionItem[] = [];
  for (const item of items) {
    if (seen.has(item.label)) {
      continue;
    }
    seen.add(item.label);
    result.push(item);
  }
  return result;
}
