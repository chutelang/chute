import { describe, expect, it } from "vitest";
import { Lexer } from "./lexer.ts";
import { Parser, ParseError } from "./parser.ts";
import type { Program } from "./ast.ts";

function parse(source: string): Program {
  const tokens = new Lexer(source).tokenize();
  return new Parser(tokens).parse();
}

describe("Parser", () => {
  describe("empty program", () => {
    it("should parse an empty source", () => {
      const ast = parse("");
      expect(ast.kind).toBe("Program");
      expect(ast.metadata).toBeUndefined();
      expect(ast.body).toEqual([]);
    });
  });

  describe("shortcut metadata", () => {
    it("should parse an empty shortcut block", () => {
      const ast = parse("shortcut {}");
      expect(ast.metadata).toBeDefined();
      expect(ast.metadata?.fields).toEqual([]);
    });

    it("should parse metadata with string fields", () => {
      const ast = parse('shortcut { name: "Hello", description: "A shortcut" }');
      const fields = ast.metadata?.fields ?? [];
      expect(fields).toHaveLength(2);
      expect(fields.at(0)?.name).toBe("name");
      expect(fields.at(0)?.value).toMatchObject({
        kind: "MetadataString",
        value: "Hello",
      });
      expect(fields.at(1)?.name).toBe("description");
    });

    it("should parse metadata with trailing comma", () => {
      const ast = parse('shortcut { name: "Hello", }');
      expect(ast.metadata?.fields).toHaveLength(1);
    });

    it("should parse metadata with number values", () => {
      const ast = parse("shortcut { count: 42 }");
      expect(ast.metadata?.fields.at(0)?.value).toMatchObject({
        kind: "MetadataNumber",
        value: 42,
      });
    });

    it("should parse metadata with negative numbers", () => {
      const ast = parse("shortcut { offset: -5 }");
      expect(ast.metadata?.fields.at(0)?.value).toMatchObject({
        kind: "MetadataNumber",
        value: -5,
        negative: true,
      });
    });

    it("should parse metadata with boolean values", () => {
      const ast = parse("shortcut { enabled: true, hidden: false }");
      expect(ast.metadata?.fields.at(0)?.value).toMatchObject({
        kind: "MetadataBoolean",
        value: true,
      });
      expect(ast.metadata?.fields.at(1)?.value).toMatchObject({
        kind: "MetadataBoolean",
        value: false,
      });
    });

    it("should parse metadata with nil value", () => {
      const ast = parse("shortcut { icon: nil }");
      expect(ast.metadata?.fields.at(0)?.value).toMatchObject({
        kind: "MetadataNil",
      });
    });

    it("should parse metadata with list values", () => {
      const ast = parse('shortcut { tags: ["a", "b"] }');
      const list = ast.metadata?.fields.at(0)?.value;
      expect(list?.kind).toBe("MetadataList");
      if (list?.kind === "MetadataList") {
        expect(list.elements).toHaveLength(2);
      }
    });

    it("should parse metadata with dot name values", () => {
      const ast = parse("shortcut { color: .blue }");
      expect(ast.metadata?.fields.at(0)?.value).toMatchObject({
        kind: "MetadataDotName",
        name: "blue",
      });
    });

    it("should parse metadata dot name with arguments", () => {
      const ast = parse('shortcut { icon: .symbol("star") }');
      const val = ast.metadata?.fields.at(0)?.value;
      expect(val?.kind).toBe("MetadataDotName");
      if (val?.kind === "MetadataDotName") {
        expect(val.name).toBe("symbol");
        expect(val.args).toHaveLength(1);
      }
    });
  });

  describe("expression statements", () => {
    it("should parse a simple call", () => {
      const ast = parse('showAlert(text: "hello");');
      expect(ast.body).toHaveLength(1);
      const stmt = ast.body.at(0);
      expect(stmt?.kind).toBe("ExpressionStatement");
      const call = stmt?.expression;
      expect(call?.kind).toBe("CallExpression");
      if (call?.kind === "CallExpression") {
        expect(call.callee).toMatchObject({ kind: "Identifier", name: "showAlert" });
        expect(call.args).toHaveLength(1);
        expect(call.args.at(0)?.label).toBe("text");
        expect(call.args.at(0)?.value).toMatchObject({ kind: "StringLiteral", value: "hello" });
      }
    });

    it("should parse a call with multiple arguments", () => {
      const ast = parse('notify(title: "Hi", body: "There");');
      const call = ast.body.at(0)?.expression;
      if (call?.kind === "CallExpression") {
        expect(call.args).toHaveLength(2);
        expect(call.args.at(0)?.label).toBe("title");
        expect(call.args.at(1)?.label).toBe("body");
      }
    });

    it("should parse a call with unlabeled arguments", () => {
      const ast = parse('show("hello");');
      const call = ast.body.at(0)?.expression;
      if (call?.kind === "CallExpression") {
        expect(call.args.at(0)?.label).toBeUndefined();
      }
    });

    it("should parse a call with keyword argument labels", () => {
      const ast = parse('doThing(in: "folder", for: "user");');
      const call = ast.body.at(0)?.expression;
      if (call?.kind === "CallExpression") {
        expect(call.args.at(0)?.label).toBe("in");
        expect(call.args.at(1)?.label).toBe("for");
      }
    });

    it("should parse member call expressions", () => {
      const ast = parse('Scan.parse("data");');
      const call = ast.body.at(0)?.expression;
      if (call?.kind === "CallExpression") {
        expect(call.callee).toMatchObject({
          kind: "MemberExpression",
          property: "parse",
        });
      }
    });
  });

  describe("error handling", () => {
    it("should error on missing semicolon", () => {
      expect(() => parse('showAlert(text: "hello")')).toThrow(ParseError);
    });

    it("should error on unexpected token in metadata", () => {
      expect(() => parse("shortcut { 42 }")).toThrow(ParseError);
    });
  });

  describe("let declarations", () => {
    it("should parse a let declaration with string initializer", () => {
      const ast = parse('let x = "hello";');
      expect(ast.body).toHaveLength(1);
      const decl = ast.body.at(0);
      expect(decl).toMatchObject({
        kind: "LetDeclaration",
        name: "x",
        typeAnnotation: undefined,
      });
      if (decl?.kind === "LetDeclaration") {
        expect(decl.initializer).toMatchObject({
          kind: "StringLiteral",
          value: "hello",
        });
      }
    });

    it("should parse a let declaration with type annotation", () => {
      const ast = parse('let x: Text = "hello";');
      const decl = ast.body.at(0);
      expect(decl).toMatchObject({
        kind: "LetDeclaration",
        name: "x",
      });
      if (decl?.kind === "LetDeclaration") {
        expect(decl.typeAnnotation).toMatchObject({
          kind: "TypeAnnotation",
          optional: false,
          base: {
            kind: "NamedType",
            name: "Text",
            qualifier: undefined,
          },
        });
      }
    });

    it("should parse a let with optional type annotation", () => {
      const ast = parse("let x: Number? = nil;");
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration") {
        expect(decl.typeAnnotation?.optional).toBe(true);
        expect(decl.typeAnnotation?.base).toMatchObject({
          kind: "NamedType",
          name: "Number",
        });
      }
    });

    it("should parse a let with List type", () => {
      const ast = parse("let xs: List<Number> = nil;");
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration") {
        expect(decl.typeAnnotation?.base).toMatchObject({
          kind: "ListType",
        });
        if (decl.typeAnnotation?.base.kind === "ListType") {
          expect(decl.typeAnnotation.base.elementType).toMatchObject({
            kind: "TypeAnnotation",
            base: { kind: "NamedType", name: "Number" },
          });
        }
      }
    });

    it("should parse a let with Quantity type", () => {
      const ast = parse("let d: Quantity<km> = nil;");
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration") {
        expect(decl.typeAnnotation?.base).toMatchObject({
          kind: "QuantityType",
          unit: "km",
        });
      }
    });

    it("should parse a let with qualified type", () => {
      const ast = parse("let r: helpers.Receipt = nil;");
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration") {
        expect(decl.typeAnnotation?.base).toMatchObject({
          kind: "NamedType",
          qualifier: "helpers",
          name: "Receipt",
        });
      }
    });
  });

  describe("var declarations", () => {
    it("should parse a var declaration", () => {
      const ast = parse("var count = 0;");
      expect(ast.body.at(0)).toMatchObject({
        kind: "VarDeclaration",
        name: "count",
      });
    });

    it("should parse a var declaration with type annotation", () => {
      const ast = parse("var count: Number = 0;");
      const decl = ast.body.at(0);
      if (decl?.kind === "VarDeclaration") {
        expect(decl.typeAnnotation).toMatchObject({
          kind: "TypeAnnotation",
          base: { kind: "NamedType", name: "Number" },
        });
      }
    });
  });

  describe("full programs", () => {
    it("should parse hello world shortcut", () => {
      const source = `shortcut {
  name: "Hello World",
  description: "A shortcut created with Chute",
}

showAlert(text: "Hello from Chute!");`;

      const ast = parse(source);
      expect(ast.metadata?.fields).toHaveLength(2);
      expect(ast.body).toHaveLength(1);
      expect(ast.body.at(0)?.expression.kind).toBe("CallExpression");
    });
  });
});
