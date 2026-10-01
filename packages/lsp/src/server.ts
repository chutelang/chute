import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  TextDocumentSyncKind,
  CompletionItemKind,
  DiagnosticSeverity,
  MarkupKind,
} from "vscode-languageserver/node";
import type {
  InitializeResult,
  Diagnostic as LspDiagnostic,
  CompletionItem as LspCompletionItem,
  TextDocumentChangeEvent,
  DefinitionParams,
  HoverParams,
  CompletionParams,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import {
  analyze,
  resolveDefinition,
  resolveHover,
  getCompletions,
  getNamespaceCompletions,
  getEnumCaseCompletions,
  getImportCompletions,
} from "./analyzer.ts";
import type { AnalysisResult, CompletionItem } from "./analyzer.ts";
import { buildLineMap, offsetToPosition, positionToOffset } from "./positions.ts";
import type { LineMap } from "./positions.ts";

interface DocumentState {
  analysis: AnalysisResult;
  lineMap: LineMap;
}

export function startServer(): void {
  const connection = createConnection(process.stdin, process.stdout);
  const documents = new TextDocuments(TextDocument);
  const documentStates = new Map<string, DocumentState>();

  connection.onInitialize((): InitializeResult => {
    return {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Full,
        completionProvider: {
          triggerCharacters: ["."],
        },
        hoverProvider: true,
        definitionProvider: true,
      },
    };
  });

  function validateDocument(document: TextDocument): void {
    const text = document.getText();
    const lineMap = buildLineMap(text);
    const result = analyze(text);

    documentStates.set(document.uri, {
      analysis: result,
      lineMap,
    });

    const diagnostics: LspDiagnostic[] = result.diagnostics.map((d) => ({
      range: {
        start: offsetToPosition(lineMap, d.span.start),
        end: offsetToPosition(lineMap, d.span.end),
      },
      severity: d.severity === "error" ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
      code: d.code,
      source: "chute",
      message: d.message,
    }));

    connection.sendDiagnostics({
      uri: document.uri,
      diagnostics,
    });
  }

  documents.onDidChangeContent((change: TextDocumentChangeEvent<TextDocument>) => {
    validateDocument(change.document);
  });

  documents.onDidSave((event: TextDocumentChangeEvent<TextDocument>) => {
    validateDocument(event.document);
  });

  documents.onDidClose((event: TextDocumentChangeEvent<TextDocument>) => {
    documentStates.delete(event.document.uri);
    connection.sendDiagnostics({
      uri: event.document.uri,
      diagnostics: [],
    });
  });

  connection.onDefinition((params: DefinitionParams) => {
    const state = documentStates.get(params.textDocument.uri);
    if (!state) {
      return null;
    }

    const offset = positionToOffset(state.lineMap, params.position);
    const defSpan = resolveDefinition(state.analysis, offset);
    if (!defSpan) {
      return null;
    }

    return {
      uri: params.textDocument.uri,
      range: {
        start: offsetToPosition(state.lineMap, defSpan.start),
        end: offsetToPosition(state.lineMap, defSpan.end),
      },
    };
  });

  connection.onHover((params: HoverParams) => {
    const state = documentStates.get(params.textDocument.uri);
    if (!state) {
      return null;
    }

    const offset = positionToOffset(state.lineMap, params.position);
    const hoverText = resolveHover(state.analysis, offset);
    if (!hoverText) {
      return null;
    }

    return {
      contents: {
        kind: MarkupKind.Markdown,
        value: hoverText,
      },
    };
  });

  connection.onCompletion((params: CompletionParams) => {
    const state = documentStates.get(params.textDocument.uri);
    if (!state) {
      return [];
    }

    const doc = documents.get(params.textDocument.uri);
    if (doc) {
      const offset = positionToOffset(state.lineMap, params.position);
      const text = doc.getText();

      if (isImportContext(text, offset)) {
        return getImportCompletions().map(toLspCompletionItem);
      }

      const enumContext = extractEnumContext(text, offset);
      if (enumContext) {
        return getEnumCaseCompletions(
          state.analysis,
          enumContext.callee,
          enumContext.namespace,
          enumContext.argIndex,
        ).map(toLspCompletionItem);
      }

      const namespaceName = extractNamespacePrefix(text, offset);
      if (namespaceName) {
        return getNamespaceCompletions(state.analysis, namespaceName).map(toLspCompletionItem);
      }
    }

    const items = getCompletions(state.analysis);
    return items.map(toLspCompletionItem);
  });

  documents.listen(connection);
  connection.listen();
}

interface EnumContext {
  callee: string;
  namespace: string | undefined;
  argIndex: number;
}

function extractEnumContext(text: string, offset: number): EnumContext | undefined {
  let i = offset - 1;
  while (i >= 0 && /[a-zA-Z0-9_]/.test(text.charAt(i))) {
    i--;
  }
  if (i < 0 || text.charAt(i) !== ".") {
    return undefined;
  }
  i--;
  while (i >= 0 && /\s/.test(text.charAt(i))) {
    i--;
  }
  if (i < 0 || (text.charAt(i) !== "," && text.charAt(i) !== "(")) {
    return undefined;
  }

  let commaCount = 0;
  let depth = 0;
  while (i >= 0) {
    const ch = text.charAt(i);
    if (ch === ")" || ch === "]" || ch === "}") {
      depth++;
    } else if (ch === "[" || ch === "{") {
      depth--;
    } else if (ch === "(") {
      if (depth === 0) {
        break;
      }
      depth--;
    } else if (ch === "," && depth === 0) {
      commaCount++;
    }
    i--;
  }
  if (i < 0 || text.charAt(i) !== "(") {
    return undefined;
  }
  i--;

  while (i >= 0 && /\s/.test(text.charAt(i))) {
    i--;
  }
  const calleeEnd = i + 1;
  while (i >= 0 && /[a-zA-Z0-9_]/.test(text.charAt(i))) {
    i--;
  }
  const callee = text.slice(i + 1, calleeEnd);
  if (callee.length === 0) {
    return undefined;
  }

  let namespace: string | undefined;
  if (i >= 0 && text.charAt(i) === ".") {
    const dotPos = i;
    i--;
    while (i >= 0 && /[a-zA-Z0-9_]/.test(text.charAt(i))) {
      i--;
    }
    const ns = text.slice(i + 1, dotPos);
    if (ns.length > 0 && /[A-Z]/.test(ns.charAt(0))) {
      namespace = ns;
    }
  }

  return { callee, namespace, argIndex: commaCount };
}

function isImportContext(text: string, offset: number): boolean {
  let i = offset - 1;
  while (i >= 0 && /[a-zA-Z0-9_]/.test(text.charAt(i))) {
    i--;
  }
  while (i >= 0 && /\s/.test(text.charAt(i))) {
    i--;
  }
  return i >= 5 && text.slice(i - 5, i + 1) === "import";
}

function extractNamespacePrefix(text: string, offset: number): string | undefined {
  let i = offset - 1;
  while (i >= 0 && /[a-zA-Z0-9_]/.test(text.charAt(i))) {
    i--;
  }
  if (i < 0 || text.charAt(i) !== ".") {
    return undefined;
  }
  const dotPos = i;
  i--;
  while (i >= 0 && /[a-zA-Z0-9_]/.test(text.charAt(i))) {
    i--;
  }
  const name = text.slice(i + 1, dotPos);
  if (name.length === 0 || !/[A-Z]/.test(name.charAt(0))) {
    return undefined;
  }
  return name;
}

function toLspCompletionItem(item: CompletionItem): LspCompletionItem {
  const result: LspCompletionItem = {
    label: item.label,
    kind: completionKindMap[item.kind],
  };
  if (item.detail) {
    result.detail = item.detail;
  }
  return result;
}

const completionKindMap: Record<CompletionItem["kind"], CompletionItemKind> = {
  variable: CompletionItemKind.Variable,
  function: CompletionItemKind.Function,
  action: CompletionItemKind.Method,
  enum: CompletionItemKind.Enum,
  record: CompletionItemKind.Struct,
  keyword: CompletionItemKind.Keyword,
  "enum-case": CompletionItemKind.EnumMember,
  field: CompletionItemKind.Field,
  module: CompletionItemKind.Module,
};
