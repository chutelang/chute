import { describe, it, expect } from "vitest";
import { analyze, resolveDefinition, resolveHover, getCompletions } from "./analyzer.ts";
import { buildLineMap, offsetToPosition, positionToOffset } from "./positions.ts";
import { findIdentifierAtOffset } from "./find-node.ts";

describe("positions", () => {
  it("should convert offset to line/column position", () => {
    const map = buildLineMap("hello\nworld\nfoo");
    expect(offsetToPosition(map, 0)).toEqual({ line: 0, character: 0 });
    expect(offsetToPosition(map, 5)).toEqual({ line: 0, character: 5 });
    expect(offsetToPosition(map, 6)).toEqual({ line: 1, character: 0 });
    expect(offsetToPosition(map, 11)).toEqual({ line: 1, character: 5 });
    expect(offsetToPosition(map, 12)).toEqual({ line: 2, character: 0 });
  });

  it("should convert position to offset", () => {
    const map = buildLineMap("hello\nworld\nfoo");
    expect(positionToOffset(map, { line: 0, character: 0 })).toBe(0);
    expect(positionToOffset(map, { line: 1, character: 0 })).toBe(6);
    expect(positionToOffset(map, { line: 2, character: 2 })).toBe(14);
  });

  it("should handle single-line text", () => {
    const map = buildLineMap("hello");
    expect(offsetToPosition(map, 0)).toEqual({ line: 0, character: 0 });
    expect(offsetToPosition(map, 4)).toEqual({ line: 0, character: 4 });
  });

  it("should handle empty text", () => {
    const map = buildLineMap("");
    expect(offsetToPosition(map, 0)).toEqual({ line: 0, character: 0 });
  });
});

describe("diagnostics", () => {
  it("should report lexer errors", () => {
    const result = analyze('let x = "unterminated');
    expect(result.diagnostics.length).toBeGreaterThan(0);
    expect(result.diagnostics[0]?.message).toContain("unterminated");
  });

  it("should report parser errors", () => {
    const result = analyze("let x =;");
    expect(result.diagnostics.length).toBeGreaterThan(0);
  });

  it("should report type checker errors", () => {
    const result = analyze("let x: Number = true;");
    expect(result.diagnostics.length).toBeGreaterThan(0);
    expect(result.diagnostics[0]?.message).toContain("cannot assign");
  });

  it("should report warnings for unknown quantity units", () => {
    const result = analyze("let x: Quantity<parsecs> = 5;");
    expect(result.diagnostics.some((d) => d.severity === "warning")).toBe(true);
    expect(result.diagnostics.some((d) => d.message.includes("parsecs"))).toBe(true);
  });

  it("should return empty diagnostics for valid source", () => {
    const result = analyze('let x = "hello";');
    expect(result.diagnostics).toEqual([]);
  });

  it("should return AST and scope for valid source", () => {
    const result = analyze('let x = "hello";');
    expect(result.ast).toBeDefined();
    expect(result.scope).toBeDefined();
  });

  it("should return AST and scope even with type errors", () => {
    const result = analyze("let x: Number = true;\nlet y = 42;");
    expect(result.ast).toBeDefined();
    expect(result.scope).toBeDefined();
  });
});

describe("go-to-definition", () => {
  it("should resolve a variable reference to its declaration", () => {
    const source = 'let greeting = "hello";\nshowAlert(text: greeting);';
    const result = analyze(source);
    const offset = source.indexOf("greeting);");
    const defSpan = resolveDefinition(result, offset);
    expect(defSpan).toBeDefined();
    expect(defSpan?.start).toBe(0);
  });

  it("should resolve a function call to its declaration", () => {
    const source =
      'func greet(name: Text) -> Text {\n  return "hi";\n}\nlet x = greet(name: "world");';
    const result = analyze(source);
    const offset = source.lastIndexOf("greet");
    const defSpan = resolveDefinition(result, offset);
    expect(defSpan).toBeDefined();
    expect(defSpan?.start).toBe(0);
  });

  it("should return undefined for unknown identifiers outside the AST", () => {
    const source = "let x = 42;";
    const result = analyze(source);
    const defSpan = resolveDefinition(result, 100);
    expect(defSpan).toBeUndefined();
  });

  it("should resolve a reference to a variable used in an expression", () => {
    const source = "let x = 1;\nlet y = x + 2;";
    const result = analyze(source);
    const offset = source.lastIndexOf("x");
    const defSpan = resolveDefinition(result, offset);
    expect(defSpan).toBeDefined();
    expect(defSpan?.start).toBe(0);
  });
});

describe("hover", () => {
  it("should show type for a variable", () => {
    const source = 'let greeting = "hello";\nshowAlert(text: greeting);';
    const result = analyze(source);
    const offset = source.indexOf("greeting);");
    const hover = resolveHover(result, offset);
    expect(hover).toBe("greeting: Text");
  });

  it("should show function signature", () => {
    const source =
      'func greet(name: Text) -> Text {\n  return "hi";\n}\nlet x = greet(name: "world");';
    const result = analyze(source);
    const offset = source.lastIndexOf("greet");
    const hover = resolveHover(result, offset);
    expect(hover).toBe("func greet(name: Text) -> Text");
  });

  it("should show action signature for stdlib actions", () => {
    const source = 'showAlert(text: "hello");';
    const result = analyze(source);
    const offset = source.indexOf("showAlert");
    const hover = resolveHover(result, offset);
    expect(hover).toContain("action showAlert");
  });

  it("should return undefined for non-identifiers", () => {
    const source = "let x = 42;";
    const result = analyze(source);
    const hover = resolveHover(result, 8);
    expect(hover).toBeUndefined();
  });

  it("should show number type for numeric variable", () => {
    const source = "let count = 42;\nlet y = count;";
    const result = analyze(source);
    const offset = source.lastIndexOf("count");
    const hover = resolveHover(result, offset);
    expect(hover).toBe("count: Number");
  });
});

describe("autocomplete", () => {
  it("should include keywords", () => {
    const result = analyze("");
    const items = getCompletions(result);
    const labels = items.map((i) => i.label);
    expect(labels).toContain("let");
    expect(labels).toContain("var");
    expect(labels).toContain("func");
    expect(labels).toContain("if");
    expect(labels).toContain("for");
    expect(labels).toContain("enum");
    expect(labels).toContain("record");
    expect(labels).toContain("import");
  });

  it("should include stdlib actions", () => {
    const result = analyze("");
    const items = getCompletions(result);
    const labels = items.map((i) => i.label);
    expect(labels).toContain("showAlert");
    expect(labels).toContain("showResult");
    expect(labels).toContain("getClipboard");
  });

  it("should include user-defined variables", () => {
    const source = "let myVar = 42;";
    const result = analyze(source);
    const items = getCompletions(result);
    const labels = items.map((i) => i.label);
    expect(labels).toContain("myVar");
  });

  it("should include user-defined functions", () => {
    const source = 'func greet(name: Text) -> Text {\n  return "hi";\n}';
    const result = analyze(source);
    const items = getCompletions(result);
    const labels = items.map((i) => i.label);
    expect(labels).toContain("greet");
  });

  it("should include user-defined enums and records", () => {
    const source = "enum Color { red, green }\nrecord Point { x: Number, y: Number }";
    const result = analyze(source);
    const items = getCompletions(result);
    const labels = items.map((i) => i.label);
    expect(labels).toContain("Color");
    expect(labels).toContain("Point");
  });

  it("should include the input variable", () => {
    const result = analyze("");
    const items = getCompletions(result);
    const labels = items.map((i) => i.label);
    expect(labels).toContain("input");
  });

  it("should not have duplicate entries", () => {
    const result = analyze("");
    const items = getCompletions(result);
    const labels = items.map((i) => i.label);
    const unique = new Set(labels);
    expect(labels.length).toBe(unique.size);
  });
});

describe("collectDefinitions", () => {
  it("should collect let and var declarations", () => {
    const result = analyze("let x = 1;\nvar y = 2;");
    const names = result.definitions.map((d) => d.name);
    expect(names).toContain("x");
    expect(names).toContain("y");
  });

  it("should collect function declarations and parameters", () => {
    const result = analyze('func greet(name: Text) -> Text {\n  return "hi";\n}');
    const names = result.definitions.map((d) => d.name);
    expect(names).toContain("greet");
    expect(names).toContain("name");
  });

  it("should collect enum declarations with cases", () => {
    const result = analyze("enum Color { red, green }");
    const names = result.definitions.map((d) => d.name);
    expect(names).toContain("Color");
    expect(names).toContain("Color.red");
    expect(names).toContain("Color.green");
  });

  it("should collect record declarations with fields", () => {
    const result = analyze("record Point { x: Number, y: Number }");
    const names = result.definitions.map((d) => d.name);
    expect(names).toContain("Point");
    expect(names).toContain("Point.x");
    expect(names).toContain("Point.y");
  });
});

describe("findIdentifierAtOffset", () => {
  it("should find identifier references", () => {
    const source = "let x = 42;\nlet y = x;";
    const result = analyze(source);
    const ast = result.ast;
    if (!ast) throw new Error("expected AST");
    const ident = findIdentifierAtOffset(ast, source.lastIndexOf("x"));
    expect(ident).toBeDefined();
    expect(ident?.name).toBe("x");
    expect(ident?.context).toBe("reference");
  });

  it("should find member expressions on enum access", () => {
    const source = "enum Color { red, green }\nlet c = Color.red;";
    const result = analyze(source);
    const ast = result.ast;
    if (!ast) throw new Error("expected AST");
    const offset = source.lastIndexOf("red");
    const ident = findIdentifierAtOffset(ast, offset);
    expect(ident).toBeDefined();
    expect(ident?.name).toBe("red");
  });

  it("should return undefined for non-identifier positions", () => {
    const source = "let x = 42;";
    const result = analyze(source);
    const ast = result.ast;
    if (!ast) throw new Error("expected AST");
    const ident = findIdentifierAtOffset(ast, 8);
    expect(ident).toBeUndefined();
  });
});

describe("incremental analysis", () => {
  it("should produce independent results for different sources", () => {
    const result1 = analyze("let x = 1;");
    const result2 = analyze("let y = 2;");
    expect(result1.definitions.map((d) => d.name)).toContain("x");
    expect(result1.definitions.map((d) => d.name)).not.toContain("y");
    expect(result2.definitions.map((d) => d.name)).toContain("y");
    expect(result2.definitions.map((d) => d.name)).not.toContain("x");
  });

  it("should only re-analyze the changed source", () => {
    const result1 = analyze("let x = 1;");
    expect(result1.diagnostics).toEqual([]);

    const result2 = analyze("let x: Number = true;");
    expect(result2.diagnostics.length).toBeGreaterThan(0);

    expect(result1.diagnostics).toEqual([]);
  });
});

describe("LSP server stdio integration", () => {
  it("should respond to initialize request over JSON-RPC", async () => {
    const { PassThrough } = await import("node:stream");
    const { createConnection, TextDocuments, ProposedFeatures, TextDocumentSyncKind } =
      await import("vscode-languageserver/node");
    const { TextDocument } = await import("vscode-languageserver-textdocument");

    const inputStream = new PassThrough();
    const outputStream = new PassThrough();

    const connection = createConnection(ProposedFeatures.all, inputStream, outputStream);
    const documents = new TextDocuments(TextDocument);

    connection.onInitialize(() => ({
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Full,
        completionProvider: { triggerCharacters: ["."] },
        hoverProvider: true,
        definitionProvider: true,
      },
    }));

    documents.listen(connection);
    connection.listen();

    const initRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        processId: process.pid,
        rootUri: null,
        capabilities: {},
      },
    };

    const content = JSON.stringify(initRequest);
    const message = `Content-Length: ${Buffer.byteLength(content)}\r\n\r\n${content}`;

    const response = await new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("LSP server did not respond within timeout"));
      }, 5000);

      let buffer = "";
      outputStream.on("data", (data: Buffer) => {
        buffer += data.toString();
        const headerMatch = buffer.match(/Content-Length: (\d+)\r\n\r\n/);
        if (headerMatch) {
          const headerEnd = buffer.indexOf("\r\n\r\n") + 4;
          const bodyLength = parseInt(headerMatch[1]!, 10);
          if (buffer.length >= headerEnd + bodyLength) {
            clearTimeout(timeout);
            resolve(buffer.slice(headerEnd, headerEnd + bodyLength));
          }
        }
      });

      inputStream.write(message);
    });

    const parsed = JSON.parse(response);
    expect(parsed.id).toBe(1);
    expect(parsed.result.capabilities.hoverProvider).toBe(true);
    expect(parsed.result.capabilities.definitionProvider).toBe(true);
    expect(parsed.result.capabilities.completionProvider).toBeDefined();

    connection.dispose();
  }, 10000);
});
