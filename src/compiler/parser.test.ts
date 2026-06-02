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
      const call = stmt?.kind === "ExpressionStatement" ? stmt.expression : undefined;
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
      const stmt = ast.body.at(0);
      const call = stmt?.kind === "ExpressionStatement" ? stmt.expression : undefined;
      if (call?.kind === "CallExpression") {
        expect(call.args).toHaveLength(2);
        expect(call.args.at(0)?.label).toBe("title");
        expect(call.args.at(1)?.label).toBe("body");
      }
    });

    it("should parse a call with unlabeled arguments", () => {
      const ast = parse('show("hello");');
      const stmt = ast.body.at(0);
      const call = stmt?.kind === "ExpressionStatement" ? stmt.expression : undefined;
      if (call?.kind === "CallExpression") {
        expect(call.args.at(0)?.label).toBeUndefined();
      }
    });

    it("should parse a call with keyword argument labels", () => {
      const ast = parse('doThing(in: "folder", for: "user");');
      const stmt = ast.body.at(0);
      const call = stmt?.kind === "ExpressionStatement" ? stmt.expression : undefined;
      if (call?.kind === "CallExpression") {
        expect(call.args.at(0)?.label).toBe("in");
        expect(call.args.at(1)?.label).toBe("for");
      }
    });

    it("should parse member call expressions", () => {
      const ast = parse('Scan.parse("data");');
      const stmt = ast.body.at(0);
      const call = stmt?.kind === "ExpressionStatement" ? stmt.expression : undefined;
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

  describe("assignment", () => {
    it("should parse simple assignment", () => {
      const ast = parse("x = 42;");
      const stmt = ast.body.at(0);
      expect(stmt).toMatchObject({
        kind: "Assignment",
      });
      if (stmt?.kind === "Assignment") {
        expect(stmt.place).toMatchObject({
          kind: "Place",
          root: "x",
          accessors: [],
        });
        expect(stmt.value).toMatchObject({
          kind: "NumberLiteral",
          value: 42,
        });
      }
    });

    it("should parse field assignment", () => {
      const ast = parse('x.name = "hello";');
      const stmt = ast.body.at(0);
      if (stmt?.kind === "Assignment") {
        expect(stmt.place.root).toBe("x");
        expect(stmt.place.accessors).toHaveLength(1);
        expect(stmt.place.accessors.at(0)).toMatchObject({
          kind: "FieldAccessor",
          name: "name",
        });
      }
    });

    it("should parse subscript assignment", () => {
      const ast = parse("xs[0] = 99;");
      const stmt = ast.body.at(0);
      if (stmt?.kind === "Assignment") {
        expect(stmt.place.root).toBe("xs");
        expect(stmt.place.accessors).toHaveLength(1);
        expect(stmt.place.accessors.at(0)?.kind).toBe("SubscriptAccessor");
      }
    });

    it("should parse chained field and subscript assignment", () => {
      const ast = parse("x.items[0].name = 99;");
      const stmt = ast.body.at(0);
      if (stmt?.kind === "Assignment") {
        expect(stmt.place.root).toBe("x");
        expect(stmt.place.accessors).toHaveLength(3);
        expect(stmt.place.accessors.at(0)?.kind).toBe("FieldAccessor");
        expect(stmt.place.accessors.at(1)?.kind).toBe("SubscriptAccessor");
        expect(stmt.place.accessors.at(2)?.kind).toBe("FieldAccessor");
      }
    });

    it("should error on assignment to non-place expression", () => {
      expect(() => parse("42 = x;")).toThrow(ParseError);
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
      const stmt = ast.body.at(0);
      expect(stmt?.kind === "ExpressionStatement" ? stmt.expression.kind : undefined).toBe(
        "CallExpression",
      );
    });
  });

  describe("arithmetic expressions", () => {
    it("should parse addition", () => {
      const ast = parse("let x = a + b;");
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration") {
        expect(decl.initializer).toMatchObject({
          kind: "BinaryExpression",
          operator: "+",
        });
      }
    });

    it("should parse multiplication with higher precedence than addition", () => {
      const ast = parse("let x = a + b * c;");
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration") {
        const expr = decl.initializer;
        expect(expr.kind).toBe("BinaryExpression");
        if (expr.kind === "BinaryExpression") {
          expect(expr.operator).toBe("+");
          expect(expr.left).toMatchObject({ kind: "Identifier", name: "a" });
          expect(expr.right).toMatchObject({
            kind: "BinaryExpression",
            operator: "*",
          });
        }
      }
    });

    it("should parse left-associative addition", () => {
      const ast = parse("let x = a + b + c;");
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration") {
        const expr = decl.initializer;
        if (expr.kind === "BinaryExpression") {
          expect(expr.operator).toBe("+");
          expect(expr.left).toMatchObject({
            kind: "BinaryExpression",
            operator: "+",
          });
          expect(expr.right).toMatchObject({ kind: "Identifier", name: "c" });
        }
      }
    });

    it("should parse all arithmetic operators", () => {
      for (const op of ["+", "-", "*", "/", "%"]) {
        const ast = parse(`let x = a ${op} b;`);
        const decl = ast.body.at(0);
        if (decl?.kind === "LetDeclaration") {
          expect(decl.initializer).toMatchObject({
            kind: "BinaryExpression",
            operator: op,
          });
        }
      }
    });

    it("should parse unary negation", () => {
      const ast = parse("let x = -a;");
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration") {
        expect(decl.initializer).toMatchObject({
          kind: "UnaryExpression",
          operator: "-",
        });
        if (decl.initializer.kind === "UnaryExpression") {
          expect(decl.initializer.operand).toMatchObject({
            kind: "Identifier",
            name: "a",
          });
        }
      }
    });

    it("should parse unary negation of parenthesized expression", () => {
      const ast = parse("let x = -(a + b);");
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration") {
        expect(decl.initializer.kind).toBe("UnaryExpression");
        if (decl.initializer.kind === "UnaryExpression") {
          expect(decl.initializer.operand.kind).toBe("BinaryExpression");
        }
      }
    });

    it("should give unary higher precedence than multiplication", () => {
      const ast = parse("let x = -a * b;");
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration") {
        expect(decl.initializer).toMatchObject({
          kind: "BinaryExpression",
          operator: "*",
        });
        if (decl.initializer.kind === "BinaryExpression") {
          expect(decl.initializer.left).toMatchObject({
            kind: "UnaryExpression",
            operator: "-",
          });
        }
      }
    });
  });

  describe("nil coalescing", () => {
    it("should parse nil coalescing", () => {
      const ast = parse("let x = a ?? b;");
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration") {
        expect(decl.initializer).toMatchObject({
          kind: "CoalesceExpression",
        });
        if (decl.initializer.kind === "CoalesceExpression") {
          expect(decl.initializer.left).toMatchObject({
            kind: "Identifier",
            name: "a",
          });
          expect(decl.initializer.right).toMatchObject({
            kind: "Identifier",
            name: "b",
          });
        }
      }
    });

    it("should give ?? lower precedence than +", () => {
      const ast = parse("let x = a + b ?? c;");
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration") {
        expect(decl.initializer.kind).toBe("CoalesceExpression");
        if (decl.initializer.kind === "CoalesceExpression") {
          expect(decl.initializer.left.kind).toBe("BinaryExpression");
        }
      }
    });
  });

  describe("optional chaining", () => {
    it("should parse optional member access", () => {
      const ast = parse("let x = a?.name;");
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration") {
        expect(decl.initializer).toMatchObject({
          kind: "OptionalMemberExpression",
          property: "name",
        });
        if (decl.initializer.kind === "OptionalMemberExpression") {
          expect(decl.initializer.object).toMatchObject({
            kind: "Identifier",
            name: "a",
          });
        }
      }
    });
  });

  describe("subscript expressions", () => {
    it("should parse subscript access", () => {
      const ast = parse("let x = xs[0];");
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration") {
        expect(decl.initializer).toMatchObject({
          kind: "SubscriptExpression",
        });
        if (decl.initializer.kind === "SubscriptExpression") {
          expect(decl.initializer.object).toMatchObject({
            kind: "Identifier",
            name: "xs",
          });
          expect(decl.initializer.index).toMatchObject({
            kind: "NumberLiteral",
            value: 0,
          });
        }
      }
    });
  });

  describe("string interpolation", () => {
    it("should parse interpolated string with one expression", () => {
      const ast = parse('let x = "hello ${name}";');
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration") {
        expect(decl.initializer.kind).toBe("InterpolatedString");
        if (decl.initializer.kind === "InterpolatedString") {
          expect(decl.initializer.parts).toHaveLength(2);
          expect(decl.initializer.parts.at(0)).toMatchObject({
            kind: "TextPart",
            value: "hello ",
          });
          expect(decl.initializer.parts.at(1)).toMatchObject({
            kind: "ExpressionPart",
          });
        }
      }
    });

    it("should parse interpolated string with trailing text", () => {
      const ast = parse('let x = "hello ${name} world";');
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration" && decl.initializer.kind === "InterpolatedString") {
        expect(decl.initializer.parts).toHaveLength(3);
        expect(decl.initializer.parts.at(2)).toMatchObject({
          kind: "TextPart",
          value: " world",
        });
      }
    });

    it("should parse interpolated string with multiple expressions", () => {
      const ast = parse('let x = "${a} and ${b}";');
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration" && decl.initializer.kind === "InterpolatedString") {
        expect(decl.initializer.parts).toHaveLength(4);
        expect(decl.initializer.parts.at(0)?.kind).toBe("TextPart");
        expect(decl.initializer.parts.at(1)?.kind).toBe("ExpressionPart");
        expect(decl.initializer.parts.at(2)?.kind).toBe("TextPart");
        expect(decl.initializer.parts.at(3)?.kind).toBe("ExpressionPart");
      }
    });

    it("should parse complex expression inside interpolation", () => {
      const ast = parse('let x = "result: ${a + b}";');
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration" && decl.initializer.kind === "InterpolatedString") {
        const exprPart = decl.initializer.parts.at(1);
        if (exprPart?.kind === "ExpressionPart") {
          expect(exprPart.expression.kind).toBe("BinaryExpression");
        }
      }
    });
  });

  describe("list literals", () => {
    it("should parse empty list", () => {
      const ast = parse("let x = [];");
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration") {
        expect(decl.initializer).toMatchObject({
          kind: "ListLiteral",
          elements: [],
        });
      }
    });

    it("should parse list with elements", () => {
      const ast = parse("let x = [1, 2, 3];");
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration" && decl.initializer.kind === "ListLiteral") {
        expect(decl.initializer.elements).toHaveLength(3);
      }
    });

    it("should parse list with trailing comma", () => {
      const ast = parse("let x = [1, 2,];");
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration" && decl.initializer.kind === "ListLiteral") {
        expect(decl.initializer.elements).toHaveLength(2);
      }
    });
  });

  describe("dictionary literals", () => {
    it("should parse empty dictionary", () => {
      const ast = parse("let x = {:};");
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration") {
        expect(decl.initializer).toMatchObject({
          kind: "DictionaryLiteral",
          entries: [],
        });
      }
    });

    it("should parse dictionary with entries", () => {
      const ast = parse('let x = {"name": "Alice", "age": 30};');
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration" && decl.initializer.kind === "DictionaryLiteral") {
        expect(decl.initializer.entries).toHaveLength(2);
        expect(decl.initializer.entries.at(0)?.key).toMatchObject({
          kind: "StringLiteral",
          value: "name",
        });
        expect(decl.initializer.entries.at(0)?.value).toMatchObject({
          kind: "StringLiteral",
          value: "Alice",
        });
      }
    });

    it("should parse dictionary with trailing comma", () => {
      const ast = parse('let x = {"a": 1,};');
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration" && decl.initializer.kind === "DictionaryLiteral") {
        expect(decl.initializer.entries).toHaveLength(1);
      }
    });

    it("should reject bare {} as empty dictionary", () => {
      expect(() => parse("let x = {};")).toThrow(ParseError);
    });
  });
});
