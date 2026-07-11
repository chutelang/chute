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

  describe("if statements", () => {
    it("should parse if with comparison condition", () => {
      const ast = parse("if x > 5 { showAlert(text: x); }");
      const stmt = ast.body.at(0);
      expect(stmt?.kind).toBe("IfStatement");
      if (stmt?.kind === "IfStatement") {
        expect(stmt.condition).toMatchObject({
          kind: "Comparison",
          operator: ">",
        });
        expect(stmt.body).toHaveLength(1);
        expect(stmt.elseBody).toBeUndefined();
      }
    });

    it("should parse if/else", () => {
      const ast = parse("if x == 1 { showAlert(text: x); } else { showResult(text: x); }");
      const stmt = ast.body.at(0);
      if (stmt?.kind === "IfStatement") {
        expect(stmt.condition).toMatchObject({
          kind: "Comparison",
          operator: "==",
        });
        expect(stmt.body).toHaveLength(1);
        expect(Array.isArray(stmt.elseBody)).toBe(true);
        if (Array.isArray(stmt.elseBody)) {
          expect(stmt.elseBody).toHaveLength(1);
        }
      }
    });

    it("should parse if/else if/else chain", () => {
      const ast = parse(`
        if x > 10 {
          showAlert(text: x);
        } else if x > 5 {
          showResult(text: x);
        } else {
          showAlert(text: x);
        }
      `);
      const stmt = ast.body.at(0);
      if (stmt?.kind === "IfStatement") {
        expect(stmt.elseBody).toMatchObject({
          kind: "IfStatement",
        });
        if (stmt.elseBody && !Array.isArray(stmt.elseBody)) {
          expect(Array.isArray(stmt.elseBody.elseBody)).toBe(true);
        }
      }
    });

    it("should parse boolean reference condition", () => {
      const ast = parse("if flag { showAlert(text: flag); }");
      const stmt = ast.body.at(0);
      if (stmt?.kind === "IfStatement") {
        expect(stmt.condition).toMatchObject({
          kind: "BooleanReference",
        });
      }
    });

    it("should parse not condition", () => {
      const ast = parse("if not flag { showAlert(text: flag); }");
      const stmt = ast.body.at(0);
      if (stmt?.kind === "IfStatement") {
        expect(stmt.condition).toMatchObject({
          kind: "NotCondition",
        });
        if (stmt.condition.kind === "NotCondition") {
          expect(stmt.condition.operand).toMatchObject({
            kind: "BooleanReference",
          });
        }
      }
    });

    it("should parse and/or conditions", () => {
      const ast = parse("if x > 1 and y < 10 { showAlert(text: x); }");
      const stmt = ast.body.at(0);
      if (stmt?.kind === "IfStatement") {
        expect(stmt.condition.kind).toBe("AndCondition");
      }
    });

    it("should parse or with lower precedence than and", () => {
      const ast = parse("if a or b and c { showAlert(text: a); }");
      const stmt = ast.body.at(0);
      if (stmt?.kind === "IfStatement") {
        expect(stmt.condition.kind).toBe("OrCondition");
        if (stmt.condition.kind === "OrCondition") {
          expect(stmt.condition.left).toMatchObject({
            kind: "BooleanReference",
          });
          expect(stmt.condition.right.kind).toBe("AndCondition");
        }
      }
    });

    it("should parse all comparison operators", () => {
      const ops = ["==", "!=", ">", ">=", "<", "<="];
      for (const op of ops) {
        const ast = parse(`if x ${op} 5 { showAlert(text: x); }`);
        const stmt = ast.body.at(0);
        if (stmt?.kind === "IfStatement") {
          expect(stmt.condition).toMatchObject({
            kind: "Comparison",
            operator: op,
          });
        }
      }
    });

    it("should parse contains and string comparison operators", () => {
      const ops = ["contains", "!contains", "hasPrefix", "hasSuffix"];
      for (const op of ops) {
        const src =
          op === "!contains"
            ? `if x !contains "y" { showAlert(text: x); }`
            : `if x ${op} "y" { showAlert(text: x); }`;
        const ast = parse(src);
        const stmt = ast.body.at(0);
        if (stmt?.kind === "IfStatement") {
          expect(stmt.condition).toMatchObject({
            kind: "Comparison",
            operator: op,
          });
        }
      }
    });

    it("should parse range test condition", () => {
      const ast = parse("if x in 1...10 { showAlert(text: x); }");
      const stmt = ast.body.at(0);
      if (stmt?.kind === "IfStatement") {
        expect(stmt.condition).toMatchObject({
          kind: "RangeTest",
        });
        if (stmt.condition.kind === "RangeTest") {
          expect(stmt.condition.subject).toMatchObject({ kind: "Identifier", name: "x" });
          expect(stmt.condition.low).toMatchObject({ kind: "NumberLiteral", value: 1 });
          expect(stmt.condition.high).toMatchObject({ kind: "NumberLiteral", value: 10 });
        }
      }
    });

    it("should parse type test condition", () => {
      const ast = parse("if x is Text { showAlert(text: x); }");
      const stmt = ast.body.at(0);
      if (stmt?.kind === "IfStatement") {
        expect(stmt.condition).toMatchObject({
          kind: "TypeTest",
        });
        if (stmt.condition.kind === "TypeTest") {
          expect(stmt.condition.testType).toMatchObject({
            kind: "NamedType",
            name: "Text",
          });
        }
      }
    });

    it("should parse nil comparison", () => {
      const ast = parse("if x == nil { showAlert(text: x); }");
      const stmt = ast.body.at(0);
      if (stmt?.kind === "IfStatement") {
        expect(stmt.condition).toMatchObject({
          kind: "Comparison",
          operator: "==",
        });
        if (stmt.condition.kind === "Comparison") {
          expect(stmt.condition.right).toMatchObject({ kind: "NilLiteral" });
        }
      }
    });

    it("should parse boolean literal condition true", () => {
      const ast = parse("if true { showAlert(text: x); }");
      const stmt = ast.body.at(0);
      if (stmt?.kind === "IfStatement") {
        expect(stmt.condition).toMatchObject({
          kind: "BooleanLiteralCondition",
          value: true,
        });
      }
    });

    it("should parse parenthesized condition", () => {
      const ast = parse("if (x > 5) and y { showAlert(text: x); }");
      const stmt = ast.body.at(0);
      if (stmt?.kind === "IfStatement") {
        expect(stmt.condition.kind).toBe("AndCondition");
      }
    });
  });

  describe("for statements", () => {
    it("should parse for...in loop", () => {
      const ast = parse("for item in items { showAlert(text: item); }");
      const stmt = ast.body.at(0);
      expect(stmt?.kind).toBe("ForStatement");
      if (stmt?.kind === "ForStatement") {
        expect(stmt.variable).toBe("item");
        expect(stmt.iterable).toMatchObject({ kind: "Identifier", name: "items" });
        expect(stmt.body).toHaveLength(1);
      }
    });
  });

  describe("repeat statements", () => {
    it("should parse repeat loop", () => {
      const ast = parse("repeat 5 { showAlert(text: x); }");
      const stmt = ast.body.at(0);
      expect(stmt?.kind).toBe("RepeatStatement");
      if (stmt?.kind === "RepeatStatement") {
        expect(stmt.count).toMatchObject({ kind: "NumberLiteral", value: 5 });
        expect(stmt.body).toHaveLength(1);
      }
    });

    it("should parse repeat with expression count", () => {
      const ast = parse("repeat n { showAlert(text: x); }");
      const stmt = ast.body.at(0);
      if (stmt?.kind === "RepeatStatement") {
        expect(stmt.count).toMatchObject({ kind: "Identifier", name: "n" });
      }
    });
  });

  describe("menu statements", () => {
    it("should parse menu with cases", () => {
      const ast = parse(`
        menu "Choose" {
          case "Option A" {
            showAlert(text: x);
          }
          case "Option B" {
            showResult(text: x);
          }
        }
      `);
      const stmt = ast.body.at(0);
      expect(stmt?.kind).toBe("MenuStatement");
      if (stmt?.kind === "MenuStatement") {
        expect(stmt.prompt).toMatchObject({ kind: "StringLiteral", value: "Choose" });
        expect(stmt.cases).toHaveLength(2);
        expect(stmt.cases.at(0)?.label).toBe("Option A");
        expect(stmt.cases.at(1)?.label).toBe("Option B");
      }
    });

    it("should parse menu with variable binding", () => {
      const ast = parse(`
        menu "Pick" -> choice {
          case "A" { showAlert(text: choice); }
        }
      `);
      const stmt = ast.body.at(0);
      if (stmt?.kind === "MenuStatement") {
        expect(stmt.variable).toBe("choice");
        expect(stmt.variableType).toBeUndefined();
      }
    });

    it("should parse menu with typed variable binding", () => {
      const ast = parse(`
        menu "Pick" -> choice: Text {
          case "A" { showAlert(text: choice); }
        }
      `);
      const stmt = ast.body.at(0);
      if (stmt?.kind === "MenuStatement") {
        expect(stmt.variable).toBe("choice");
        expect(stmt.variableType).toMatchObject({
          kind: "TypeAnnotation",
          base: { kind: "NamedType", name: "Text" },
        });
      }
    });
  });

  describe("ternary expressions", () => {
    it("should parse ternary with comparison condition", () => {
      const ast = parse('let x = a > 5 ? "big" : "small";');
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration") {
        expect(decl.initializer.kind).toBe("TernaryExpression");
        if (decl.initializer.kind === "TernaryExpression") {
          expect(decl.initializer.condition).toMatchObject({
            kind: "Comparison",
            operator: ">",
          });
          expect(decl.initializer.consequent).toMatchObject({
            kind: "StringLiteral",
            value: "big",
          });
          expect(decl.initializer.alternate).toMatchObject({
            kind: "StringLiteral",
            value: "small",
          });
        }
      }
    });

    it("should parse ternary with boolean reference condition", () => {
      const ast = parse('let x = flag ? "yes" : "no";');
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration" && decl.initializer.kind === "TernaryExpression") {
        expect(decl.initializer.condition).toMatchObject({
          kind: "BooleanReference",
        });
      }
    });

    it("should parse ternary with not condition", () => {
      const ast = parse('let x = not flag ? "no" : "yes";');
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration" && decl.initializer.kind === "TernaryExpression") {
        expect(decl.initializer.condition.kind).toBe("NotCondition");
      }
    });
  });

  describe("#index expression", () => {
    it("should parse #index in expression position", () => {
      const ast = parse("let x = #index;");
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration") {
        expect(decl.initializer).toMatchObject({ kind: "HashIndexExpression" });
      }
    });
  });

  describe("enum declarations", () => {
    it("should parse enum with explicit case values", () => {
      const ast = parse(`
        enum Color {
          red = "RED",
          blue = "BLUE",
        }
      `);
      const stmt = ast.body.at(0);
      expect(stmt?.kind).toBe("EnumDeclaration");
      if (stmt?.kind === "EnumDeclaration") {
        expect(stmt.name).toBe("Color");
        expect(stmt.exported).toBe(false);
        expect(stmt.defaultValue).toBeUndefined();
        expect(stmt.cases).toHaveLength(2);
        expect(stmt.cases.at(0)).toMatchObject({
          kind: "EnumCase",
          name: "red",
          value: "RED",
        });
        expect(stmt.cases.at(1)).toMatchObject({
          kind: "EnumCase",
          name: "blue",
          value: "BLUE",
        });
      }
    });

    it("should parse enum with implicit case values", () => {
      const ast = parse("enum Direction { north, south, east, west }");
      const stmt = ast.body.at(0);
      if (stmt?.kind === "EnumDeclaration") {
        expect(stmt.cases).toHaveLength(4);
        expect(stmt.cases.at(0)).toMatchObject({
          name: "north",
          value: undefined,
        });
      }
    });

    it("should parse enum with default value", () => {
      const ast = parse(`enum Status = "status" { active, inactive }`);
      const stmt = ast.body.at(0);
      if (stmt?.kind === "EnumDeclaration") {
        expect(stmt.defaultValue).toBe("status");
        expect(stmt.cases).toHaveLength(2);
      }
    });

    it("should parse exported enum", () => {
      const ast = parse('export enum Color { red = "R" }');
      const stmt = ast.body.at(0);
      if (stmt?.kind === "EnumDeclaration") {
        expect(stmt.exported).toBe(true);
        expect(stmt.name).toBe("Color");
      }
    });

    it("should parse enum with trailing comma", () => {
      const ast = parse("enum X { a, b, }");
      const stmt = ast.body.at(0);
      if (stmt?.kind === "EnumDeclaration") {
        expect(stmt.cases).toHaveLength(2);
      }
    });

    it("should reject empty enum with clear error", () => {
      expect(() => parse("enum Empty {}")).toThrow("enum requires at least one case");
    });
  });

  describe("record declarations", () => {
    it("should parse record with typed fields", () => {
      const ast = parse(`
        record Point {
          x: Number,
          y: Number,
        }
      `);
      const stmt = ast.body.at(0);
      expect(stmt?.kind).toBe("RecordDeclaration");
      if (stmt?.kind === "RecordDeclaration") {
        expect(stmt.name).toBe("Point");
        expect(stmt.exported).toBe(false);
        expect(stmt.fields).toHaveLength(2);
        expect(stmt.fields.at(0)).toMatchObject({
          kind: "RecordField",
          name: "x",
        });
        expect(stmt.fields.at(0)?.type.base).toMatchObject({
          kind: "NamedType",
          name: "Number",
        });
      }
    });

    it("should parse empty record", () => {
      const ast = parse("record Empty {}");
      const stmt = ast.body.at(0);
      if (stmt?.kind === "RecordDeclaration") {
        expect(stmt.fields).toHaveLength(0);
      }
    });

    it("should parse exported record", () => {
      const ast = parse("export record Point { x: Number }");
      const stmt = ast.body.at(0);
      if (stmt?.kind === "RecordDeclaration") {
        expect(stmt.exported).toBe(true);
      }
    });

    it("should parse record with optional field type", () => {
      const ast = parse("record User { name: Text, email: Text? }");
      const stmt = ast.body.at(0);
      if (stmt?.kind === "RecordDeclaration") {
        expect(stmt.fields.at(1)?.type.optional).toBe(true);
      }
    });
  });

  describe("dot-name expressions", () => {
    it("should parse dot-name in expression position", () => {
      const ast = parse("let x = .north;");
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration") {
        expect(decl.initializer).toMatchObject({
          kind: "DotNameExpression",
          name: "north",
        });
      }
    });
  });

  describe("let destructuring", () => {
    it("should parse let destructure with two bindings", () => {
      const ast = parse("let { x, y } = point;");
      const stmt = ast.body.at(0);
      expect(stmt?.kind).toBe("LetDestructure");
      if (stmt?.kind === "LetDestructure") {
        expect(stmt.names).toEqual(["x", "y"]);
        expect(stmt.initializer).toMatchObject({
          kind: "Identifier",
          name: "point",
        });
      }
    });

    it("should parse let destructure with trailing comma", () => {
      const ast = parse("let { a, b, } = rec;");
      const stmt = ast.body.at(0);
      if (stmt?.kind === "LetDestructure") {
        expect(stmt.names).toEqual(["a", "b"]);
      }
    });

    it("should parse let destructure with single binding", () => {
      const ast = parse("let { name } = user;");
      const stmt = ast.body.at(0);
      if (stmt?.kind === "LetDestructure") {
        expect(stmt.names).toEqual(["name"]);
      }
    });
  });

  describe("function declarations", () => {
    it("should parse func with no parameters", () => {
      const ast = parse('func greet() { showAlert(text: "hi"); }');
      const func = ast.body.at(0);
      expect(func?.kind).toBe("FunctionDeclaration");
      if (func?.kind === "FunctionDeclaration") {
        expect(func.name).toBe("greet");
        expect(func.params).toHaveLength(0);
        expect(func.returnType).toBeUndefined();
        expect(func.body).toHaveLength(1);
      }
    });

    it("should parse func with typed parameters", () => {
      const ast = parse("func add(a: Number, b: Number) -> Number { return a + b; }");
      const func = ast.body.at(0);
      expect(func?.kind).toBe("FunctionDeclaration");
      if (func?.kind === "FunctionDeclaration") {
        expect(func.name).toBe("add");
        expect(func.params).toHaveLength(2);
        expect(func.params.at(0)?.name).toBe("a");
        expect(func.params.at(1)?.name).toBe("b");
        expect(func.returnType).toBeDefined();
      }
    });

    it("should parse func with default parameter values", () => {
      const ast = parse('func greet(name: Text = "World") { showAlert(text: name); }');
      const func = ast.body.at(0);
      if (func?.kind === "FunctionDeclaration") {
        expect(func.params.at(0)?.defaultValue).toBeDefined();
      }
    });

    it("should parse exported func", () => {
      const ast = parse('export func greet() { showAlert(text: "hi"); }');
      const func = ast.body.at(0);
      if (func?.kind === "FunctionDeclaration") {
        expect(func.exported).toBe(true);
      }
    });
  });

  describe("return statements", () => {
    it("should parse return with expression", () => {
      const ast = parse("func add(a: Number, b: Number) -> Number { return a + b; }");
      const func = ast.body.at(0);
      if (func?.kind === "FunctionDeclaration") {
        const ret = func.body.at(0);
        expect(ret?.kind).toBe("ReturnStatement");
        if (ret?.kind === "ReturnStatement") {
          expect(ret.value).toBeDefined();
        }
      }
    });

    it("should parse bare return", () => {
      const ast = parse('func greet() { showAlert(text: "hi"); return; }');
      const func = ast.body.at(0);
      if (func?.kind === "FunctionDeclaration") {
        const ret = func.body.at(1);
        expect(ret?.kind).toBe("ReturnStatement");
        if (ret?.kind === "ReturnStatement") {
          expect(ret.value).toBeUndefined();
        }
      }
    });
  });

  describe("pipelines", () => {
    it("should parse a simple |> pipeline", () => {
      const ast = parse("let x = a |> foo;");
      const decl = ast.body.at(0);
      expect(decl?.kind).toBe("LetDeclaration");
      if (decl?.kind === "LetDeclaration") {
        expect(decl.initializer.kind).toBe("PipelineExpression");
        if (decl.initializer.kind === "PipelineExpression") {
          expect(decl.initializer.input.kind).toBe("Identifier");
          expect(decl.initializer.stages).toHaveLength(1);
          expect(decl.initializer.stages.at(0)?.operator).toBe("|>");
          expect(decl.initializer.stages.at(0)?.callee).toMatchObject({
            kind: "Identifier",
            name: "foo",
          });
          expect(decl.initializer.stages.at(0)?.args).toEqual([]);
        }
      }
    });

    it("should parse a multi-stage pipeline", () => {
      const ast = parse("let x = a |> foo |> bar;");
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration") {
        const pipe = decl.initializer;
        expect(pipe.kind).toBe("PipelineExpression");
        if (pipe.kind === "PipelineExpression") {
          expect(pipe.stages).toHaveLength(2);
          expect(pipe.stages.at(1)?.callee).toMatchObject({
            kind: "Identifier",
            name: "bar",
          });
        }
      }
    });

    it("should parse |>? optional pipeline operator", () => {
      const ast = parse("let x = a |>? foo |> bar;");
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration" && decl.initializer.kind === "PipelineExpression") {
        expect(decl.initializer.stages.at(0)?.operator).toBe("|>?");
        expect(decl.initializer.stages.at(1)?.operator).toBe("|>");
      }
    });

    it("should parse a stage with arguments", () => {
      const ast = parse('let x = a |> foo(label: "hi");');
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration" && decl.initializer.kind === "PipelineExpression") {
        const stage = decl.initializer.stages.at(0);
        expect(stage?.args).toHaveLength(1);
        expect(stage?.args.at(0)?.label).toBe("label");
      }
    });

    it("should parse a stage with _ placeholder", () => {
      const ast = parse("let x = a |> foo(_, label: b);");
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration" && decl.initializer.kind === "PipelineExpression") {
        const stage = decl.initializer.stages.at(0);
        expect(stage?.args).toHaveLength(2);
        expect(stage?.args.at(0)?.value.kind).toBe("PlaceholderExpression");
      }
    });

    it("should parse a qualified stage name", () => {
      const ast = parse("let x = a |> Scan.parse;");
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration" && decl.initializer.kind === "PipelineExpression") {
        const stage = decl.initializer.stages.at(0);
        expect(stage?.callee.kind).toBe("MemberExpression");
        if (stage?.callee.kind === "MemberExpression") {
          expect(stage.callee.object).toMatchObject({
            kind: "Identifier",
            name: "Scan",
          });
          expect(stage.callee.property).toBe("parse");
        }
      }
    });

    it("should parse a static member stage name", () => {
      const ast = parse("let x = a |> helpers.Scan.parse;");
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration" && decl.initializer.kind === "PipelineExpression") {
        const stage = decl.initializer.stages.at(0);
        expect(stage?.callee.kind).toBe("MemberExpression");
        if (stage?.callee.kind === "MemberExpression") {
          expect(stage.callee.property).toBe("parse");
          expect(stage.callee.object.kind).toBe("MemberExpression");
        }
      }
    });

    it("should parse pipeline in expression statement", () => {
      const ast = parse("a |> doSomething;");
      const stmt = ast.body.at(0);
      expect(stmt?.kind).toBe("ExpressionStatement");
      if (stmt?.kind === "ExpressionStatement") {
        expect(stmt.expression.kind).toBe("PipelineExpression");
      }
    });
  });

  describe("action declarations", () => {
    it("should parse action with no parameters", () => {
      const ast = parse('action doThing() = "com.example.dothing";');
      const decl = ast.body.at(0);
      expect(decl?.kind).toBe("ActionDeclaration");
      if (decl?.kind === "ActionDeclaration") {
        expect(decl.name).toBe("doThing");
        expect(decl.params).toHaveLength(0);
        expect(decl.returnType).toBeUndefined();
        expect(decl.runtimeIdentifier).toBe("com.example.dothing");
        expect(decl.attributes).toHaveLength(0);
        expect(decl.exported).toBe(false);
      }
    });

    it("should parse action with typed parameters", () => {
      const ast = parse('action sendMessage(to: Text, body: Text) = "com.example.send";');
      const decl = ast.body.at(0);
      if (decl?.kind === "ActionDeclaration") {
        expect(decl.params).toHaveLength(2);
        expect(decl.params.at(0)?.label).toBe("to");
        expect(decl.params.at(0)?.name).toBe("to");
        expect(decl.params.at(1)?.label).toBe("body");
      }
    });

    it("should parse action with keyword parameter labels", () => {
      const ast = parse('action search(in: Text, for: Text) -> List<Text> = "com.example.search";');
      const decl = ast.body.at(0);
      if (decl?.kind === "ActionDeclaration") {
        expect(decl.params).toHaveLength(2);
        expect(decl.params.at(0)?.label).toBe("in");
        expect(decl.params.at(0)?.name).toBe("in");
        expect(decl.params.at(1)?.label).toBe("for");
        expect(decl.returnType).toBeDefined();
      }
    });

    it("should parse action with return type", () => {
      const ast = parse('action getClipboard() -> Text = "is.workflow.actions.getclipboard";');
      const decl = ast.body.at(0);
      if (decl?.kind === "ActionDeclaration") {
        expect(decl.returnType).toBeDefined();
      }
    });

    it("should parse action with default parameter value", () => {
      const ast = parse(
        'action notify(body: Text, title: Text = "Alert") = "is.workflow.actions.notification";',
      );
      const decl = ast.body.at(0);
      if (decl?.kind === "ActionDeclaration") {
        expect(decl.params.at(1)?.defaultValue).toBeDefined();
      }
    });

    it("should parse exported action", () => {
      const ast = parse('export action doThing() = "com.example.dothing";');
      const decl = ast.body.at(0);
      if (decl?.kind === "ActionDeclaration") {
        expect(decl.exported).toBe(true);
      }
    });

    it("should parse action parameter with separate label and name", () => {
      const ast = parse(
        'action showAlert(text WFAlertActionTitle: Text) = "is.workflow.actions.alert";',
      );
      const decl = ast.body.at(0);
      if (decl?.kind === "ActionDeclaration") {
        expect(decl.params).toHaveLength(1);
        expect(decl.params.at(0)?.label).toBe("text");
        expect(decl.params.at(0)?.name).toBe("WFAlertActionTitle");
      }
    });

    it("should default name to label when only one identifier given", () => {
      const ast = parse('action doThing(text: Text) = "com.example.do";');
      const decl = ast.body.at(0);
      if (decl?.kind === "ActionDeclaration") {
        expect(decl.params.at(0)?.label).toBe("text");
        expect(decl.params.at(0)?.name).toBe("text");
      }
    });

    it("should parse keyword as label with separate name", () => {
      const ast = parse('action search(in WFSearchIn: Text) = "com.example.search";');
      const decl = ast.body.at(0);
      if (decl?.kind === "ActionDeclaration") {
        expect(decl.params.at(0)?.label).toBe("in");
        expect(decl.params.at(0)?.name).toBe("WFSearchIn");
      }
    });
  });

  describe("export let", () => {
    it("should parse export let declaration", () => {
      const ast = parse('export let greeting = "hello";');
      const decl = ast.body.at(0);
      expect(decl?.kind).toBe("LetDeclaration");
      if (decl?.kind === "LetDeclaration") {
        expect(decl.exported).toBe(true);
        expect(decl.name).toBe("greeting");
      }
    });

    it("should parse non-exported let with exported false", () => {
      const ast = parse("let x = 42;");
      const decl = ast.body.at(0);
      if (decl?.kind === "LetDeclaration") {
        expect(decl.exported).toBe(false);
      }
    });
  });

  describe("attributes", () => {
    it("should parse action with one attribute", () => {
      const ast = parse('action doThing() = "com.example.dothing" @retry(enabled: true);');
      const decl = ast.body.at(0);
      if (decl?.kind === "ActionDeclaration") {
        expect(decl.attributes).toHaveLength(1);
        expect(decl.attributes.at(0)?.name).toBe("retry");
        expect(decl.attributes.at(0)?.args).toHaveLength(1);
      }
    });

    it("should parse action with multiple attributes", () => {
      const ast = parse(
        'action doThing() = "com.example.dothing" @retry(enabled: true) @platform(min: ios17);',
      );
      const decl = ast.body.at(0);
      if (decl?.kind === "ActionDeclaration") {
        expect(decl.attributes).toHaveLength(2);
      }
    });

    it("should parse attribute with no arguments", () => {
      const ast = parse('action doThing() = "com.example.dothing" @deprecated;');
      const decl = ast.body.at(0);
      if (decl?.kind === "ActionDeclaration") {
        expect(decl.attributes).toHaveLength(1);
        expect(decl.attributes.at(0)?.name).toBe("deprecated");
        expect(decl.attributes.at(0)?.args).toBeUndefined();
      }
    });

    it("should parse attribute with bare identifier value", () => {
      const ast = parse('action doThing() = "com.example.dothing" @platform(min: ios17);');
      const decl = ast.body.at(0);
      if (decl?.kind === "ActionDeclaration") {
        const arg = decl.attributes.at(0)?.args?.at(0);
        expect(arg?.label).toBe("min");
        expect(arg?.value.kind).toBe("AttributeIdentifier");
      }
    });

    it("should parse attribute with positional value", () => {
      const ast = parse('action doThing() = "com.example.dothing" @timeout(30);');
      const decl = ast.body.at(0);
      if (decl?.kind === "ActionDeclaration") {
        const arg = decl.attributes.at(0)?.args?.at(0);
        expect(arg?.label).toBeUndefined();
        expect(arg?.value.kind).toBe("MetadataNumber");
      }
    });
  });

  describe("import declarations", () => {
    it("should parse string import with alias", () => {
      const ast = parse('import "./helpers" as H;');
      expect(ast.imports).toHaveLength(1);
      expect(ast.imports.at(0)?.path).toBe("./helpers");
      expect(ast.imports.at(0)?.alias).toBe("H");
      expect(ast.imports.at(0)?.isPackage).toBe(false);
    });

    it("should parse package import with default alias", () => {
      const ast = parse("import Toolbox;");
      expect(ast.imports).toHaveLength(1);
      expect(ast.imports.at(0)?.path).toBe("Toolbox");
      expect(ast.imports.at(0)?.alias).toBe("Toolbox");
      expect(ast.imports.at(0)?.isPackage).toBe(true);
    });

    it("should parse package import with explicit alias", () => {
      const ast = parse("import Toolbox as TB;");
      expect(ast.imports).toHaveLength(1);
      expect(ast.imports.at(0)?.alias).toBe("TB");
      expect(ast.imports.at(0)?.isPackage).toBe(true);
    });

    it("should parse multiple imports", () => {
      const ast = parse('import "./a" as A; import "./b" as B;');
      expect(ast.imports).toHaveLength(2);
    });

    it("should parse imports before shortcut metadata", () => {
      const ast = parse('import "./helpers" as H; shortcut { name: "Test" }');
      expect(ast.imports).toHaveLength(1);
      expect(ast.metadata).toBeDefined();
    });
  });
});
