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
import { analyze, resolveDefinition, resolveHover, getCompletions } from "./analyzer.ts";
import type { AnalysisResult, CompletionItem } from "./analyzer.ts";
import { buildLineMap, offsetToPosition, positionToOffset } from "./positions.ts";
import type { LineMap } from "./positions.ts";

interface DocumentState {
  analysis: AnalysisResult;
  lineMap: LineMap;
}

export function startServer(): void {
  const connection = createConnection(ProposedFeatures.all);
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
        value: "```chute\n" + hoverText + "\n```",
      },
    };
  });

  connection.onCompletion((params: CompletionParams) => {
    const state = documentStates.get(params.textDocument.uri);
    if (!state) {
      return [];
    }

    const items = getCompletions(state.analysis);
    return items.map(toLspCompletionItem);
  });

  documents.listen(connection);
  connection.listen();
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
};
