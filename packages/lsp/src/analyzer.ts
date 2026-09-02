import { Lexer, Parser, checkCollecting, CompileError, describeType } from "@chutelang/compiler";
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

  let hoverText: string | undefined;

  if (ident.context === "namespace-member" && ident.namespaceName) {
    const ns = result.scope.lookupNamespace(ident.namespaceName);
    if (ns) {
      const binding = ns.lookup(ident.name);
      if (binding) {
        hoverText = formatTypeHover(ident.name, binding.type);
      } else {
        const typeDef = ns.lookupType(ident.name);
        if (typeDef) {
          hoverText = formatTypeHover(ident.name, typeDef);
        }
      }
    }
  } else {
    const binding = result.scope.lookup(ident.name);
    if (binding) {
      hoverText = formatTypeHover(ident.name, binding.type);
    } else {
      const typeDef = result.scope.lookupType(ident.name);
      if (typeDef) {
        hoverText = formatTypeHover(ident.name, typeDef);
      }
    }
  }

  if (!hoverText) {
    return undefined;
  }

  const docComment = findDocComment(ident, result.definitions);
  if (docComment) {
    hoverText += formatDocCommentMarkdown(docComment);
  }

  return hoverText;
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
