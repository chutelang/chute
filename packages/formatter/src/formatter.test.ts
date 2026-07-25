import { describe, expect, it } from "vitest";
import { format } from "./formatter.ts";

function expectFormat(input: string, expected: string): void {
  const result = format(input);
  expect(result).toBe(expected);
}

function expectIdempotent(input: string): void {
  const result = format(input);
  expect(format(result)).toBe(result);
}

describe("format", () => {
  describe("empty and minimal programs", () => {
    it("should format an empty program", () => {
      expectFormat("", "");
    });

    it("should format a single expression statement", () => {
      expectFormat('showAlert(text: "hello");', 'showAlert(text: "hello");\n');
    });
  });

  describe("imports", () => {
    it("should format an import statement", () => {
      expectFormat('  import   "math"   as   Math ;', 'import "math" as Math;\n');
    });

    it("should format a package import", () => {
      expectFormat("import   Utils   as  U ;", "import Utils as U;\n");
    });

    it("should format a package import with default alias", () => {
      expectFormat("import   Toolbox ;", "import Toolbox;\n");
    });

    it("should format multiple imports", () => {
      expectFormat(
        `import "a" as A;
import "b" as B;`,
        `import "a" as A;
import "b" as B;
`,
      );
    });
  });

  describe("metadata", () => {
    it("should format a shortcut block", () => {
      expectFormat(
        'shortcut{name:"Test",color:.Red,icon:.Heart}',
        `shortcut {
  name: "Test",
  color: .Red,
  icon: .Heart,
}
`,
      );
    });

    it("should format metadata with list values", () => {
      expectFormat(
        'shortcut{name:"T",types:[1,2,3]}',
        `shortcut {
  name: "T",
  types: [1, 2, 3],
}
`,
      );
    });

    it("should format metadata with dot-name with args", () => {
      expectFormat(
        'shortcut{name:"T",icon:.symbol("star")}',
        `shortcut {
  name: "T",
  icon: .symbol("star"),
}
`,
      );
    });
  });

  describe("let and var declarations", () => {
    it("should format a let declaration", () => {
      expectFormat("let  x  =  1 ;", "let x = 1;\n");
    });

    it("should format a let with type annotation", () => {
      expectFormat("let x:Number=1;", "let x: Number = 1;\n");
    });

    it("should format an exported let", () => {
      expectFormat("export  let  x = 1;", "export let x = 1;\n");
    });

    it("should format a var declaration", () => {
      expectFormat("var  x  =  1 ;", "var x = 1;\n");
    });

    it("should format a let destructure", () => {
      expectFormat("let  { a , b } = getValues() ;", "let {a, b} = getValues();\n");
    });

    it("should format optional type annotation", () => {
      expectFormat("let x:Number?=nil;", "let x: Number? = nil;\n");
    });

    it("should format list type annotation", () => {
      expectFormat("let x:List<Number>  =  [];", "let x: List<Number> = [];\n");
    });
  });

  describe("assignment", () => {
    it("should format a simple assignment", () => {
      expectFormat("x  =  1 ;", "x = 1;\n");
    });

    it("should format a field assignment", () => {
      expectFormat("x . y  =  1 ;", "x.y = 1;\n");
    });

    it("should format a subscript assignment", () => {
      expectFormat("x [ 0 ]  =  1 ;", "x[0] = 1;\n");
    });
  });

  describe("if statements", () => {
    it("should format a simple if", () => {
      expectFormat(
        'if x==1{showAlert(text:"yes");}',
        `if x == 1 {
  showAlert(text: "yes");
}
`,
      );
    });

    it("should format if-else", () => {
      expectFormat(
        "if x==1{a();}else{b();}",
        `if x == 1 {
  a();
} else {
  b();
}
`,
      );
    });

    it("should format if-else if-else", () => {
      expectFormat(
        "if x==1{a();}else if x==2{b();}else{c();}",
        `if x == 1 {
  a();
} else if x == 2 {
  b();
} else {
  c();
}
`,
      );
    });

    it("should format compound conditions", () => {
      expectFormat(
        "if x==1 and y==2{a();}",
        `if x == 1 and y == 2 {
  a();
}
`,
      );
    });

    it("should format not condition", () => {
      expectFormat(
        "if not x{a();}",
        `if not x {
  a();
}
`,
      );
    });

    it("should format range test", () => {
      expectFormat(
        "if x in 1...10{a();}",
        `if x in 1...10 {
  a();
}
`,
      );
    });

    it("should format type test", () => {
      expectFormat(
        "if x is Number{a();}",
        `if x is Number {
  a();
}
`,
      );
    });
  });

  describe("for statements", () => {
    it("should format a for loop", () => {
      expectFormat(
        "for item in list{process(item);}",
        `for item in list {
  process(item);
}
`,
      );
    });
  });

  describe("repeat statements", () => {
    it("should format a repeat loop", () => {
      expectFormat(
        "repeat 5{doStuff();}",
        `repeat 5 {
  doStuff();
}
`,
      );
    });
  });

  describe("menu statements", () => {
    it("should format a menu", () => {
      expectFormat(
        'menu "Choose" -> choice: Text{case "A"{a();}case "B"{b();}}',
        `menu "Choose" -> choice: Text {
  case "A" {
    a();
  }
  case "B" {
    b();
  }
}
`,
      );
    });

    it("should format a menu without variable binding", () => {
      expectFormat(
        'menu "Pick"{case "X"{x();}}',
        `menu "Pick" {
  case "X" {
    x();
  }
}
`,
      );
    });
  });

  describe("enum declarations", () => {
    it("should format an enum", () => {
      expectFormat(
        "enum Color{Red,Green,Blue}",
        `enum Color {
  Red,
  Green,
  Blue,
}
`,
      );
    });

    it("should format an enum with default value", () => {
      expectFormat(
        'enum Color="WFColor"{Red,Green="custom"}',
        `enum Color = "WFColor" {
  Red,
  Green = "custom",
}
`,
      );
    });

    it("should format an exported enum", () => {
      expectFormat(
        "export enum Dir{Up,Down}",
        `export enum Dir {
  Up,
  Down,
}
`,
      );
    });
  });

  describe("record declarations", () => {
    it("should format a record", () => {
      expectFormat(
        "record Point{x:Number,y:Number}",
        `record Point {
  x: Number,
  y: Number,
}
`,
      );
    });

    it("should format a record with optional fields", () => {
      expectFormat(
        "record Person{name:Text,age:Number?}",
        `record Person {
  name: Text,
  age: Number?,
}
`,
      );
    });
  });

  describe("function declarations", () => {
    it("should format a function", () => {
      expectFormat(
        "func add(a:Number,b:Number)->Number{return a+b;}",
        `func add(a: Number, b: Number) -> Number {
  return a + b;
}
`,
      );
    });

    it("should format a function with default parameter", () => {
      expectFormat(
        'func greet(name:Text="World")->Text{return "Hello";}',
        `func greet(name: Text = "World") -> Text {
  return "Hello";
}
`,
      );
    });

    it("should format an exported function", () => {
      expectFormat(
        "export func noop(){return;}",
        `export func noop() {
  return;
}
`,
      );
    });

    it("should format a void return", () => {
      expectFormat("return;", "return;\n");
    });
  });

  describe("action declarations", () => {
    it("should format an action declaration", () => {
      expectFormat(
        'action showAlert(text msg:Text)->Text="is.workflow.actions.alert";',
        'action showAlert(text msg: Text) -> Text = "is.workflow.actions.alert";\n',
      );
    });

    it("should format an action with attributes", () => {
      expectFormat(
        'action doThing(in val:Text)="rt.id" @savesTo(output);',
        'action doThing(in val: Text) = "rt.id" @savesTo(output);\n',
      );
    });

    it("should format an exported action", () => {
      expectFormat(
        'export action myAction(label param:Number)->Text="x.y.z";',
        'export action myAction(label param: Number) -> Text = "x.y.z";\n',
      );
    });

    it("should not duplicate label when label equals name", () => {
      expectFormat(
        'action doThing(value:Text)="com.example";',
        'action doThing(value: Text) = "com.example";\n',
      );
    });
  });

  describe("expressions", () => {
    it("should format a call with no args", () => {
      expectFormat("foo ( ) ;", "foo();\n");
    });

    it("should format a call with args", () => {
      expectFormat("foo ( 1 , 2 , 3 ) ;", "foo(1, 2, 3);\n");
    });

    it("should format a call with labeled args", () => {
      expectFormat('foo(text:"hi",count:5);', 'foo(text: "hi", count: 5);\n');
    });

    it("should format member access", () => {
      expectFormat("a . b . c ;", "a.b.c;\n");
    });

    it("should format optional member access", () => {
      expectFormat("a ?. b ;", "a?.b;\n");
    });

    it("should format subscript access", () => {
      expectFormat("a [ 0 ] ;", "a[0];\n");
    });

    it("should format binary expressions", () => {
      expectFormat("x + y * z;", "x + y * z;\n");
    });

    it("should format unary negation", () => {
      expectFormat("- x ;", "-x;\n");
    });

    it("should format nil coalescing", () => {
      expectFormat('x ?? "default" ;', 'x ?? "default";\n');
    });

    it("should format ternary expression", () => {
      expectFormat("x == 1 ? a : b ;", "x == 1 ? a : b;\n");
    });

    it("should format string literal", () => {
      expectFormat('"hello world" ;', '"hello world";\n');
    });

    it("should format interpolated string", () => {
      expectFormat('"hello ${name} today" ;', '"hello ${name} today";\n');
    });

    it("should format list literal", () => {
      expectFormat("[ 1 , 2 , 3 ] ;", "[1, 2, 3];\n");
    });

    it("should format empty list", () => {
      expectFormat("[ ] ;", "[];\n");
    });

    it("should format dictionary literal", () => {
      expectFormat('{ "a" : 1 , "b" : 2 } ;', '{"a": 1, "b": 2};\n');
    });

    it("should format empty dictionary", () => {
      expectFormat("let x = {:};", "let x = {:};\n");
    });

    it("should format dot name expression", () => {
      expectFormat(". Red ;", ".Red;\n");
    });

    it("should format hash index", () => {
      expectFormat("#index ;", "#index;\n");
    });

    it("should format boolean and nil literals", () => {
      expectFormat("true ;", "true;\n");
      expectFormat("false ;", "false;\n");
      expectFormat("nil ;", "nil;\n");
    });

    it("should format pipeline expression", () => {
      expectFormat("input |> step1 |> step2;", "input |> step1 |> step2;\n");
    });

    it("should format pipeline with optional stage", () => {
      expectFormat("input |>? step1;", "input |>? step1;\n");
    });

    it("should format pipeline with arguments", () => {
      expectFormat("input |> transform(label: _);", "input |> transform(label: _);\n");
    });

    it("should format raw string", () => {
      expectFormat('#"raw string"# ;', '#"raw string"#;\n');
    });
  });

  describe("comments", () => {
    it("should preserve a leading comment", () => {
      expectFormat(
        `// comment
let x = 1;`,
        `// comment
let x = 1;
`,
      );
    });

    it("should preserve a trailing comment", () => {
      expectFormat("let x = 1; // comment", "let x = 1; // comment\n");
    });

    it("should preserve comments between statements", () => {
      expectFormat(
        `let x = 1;
// between
let y = 2;`,
        `let x = 1;
// between
let y = 2;
`,
      );
    });

    it("should preserve block comments", () => {
      expectFormat(
        `/* block comment */
let x = 1;`,
        `/* block comment */
let x = 1;
`,
      );
    });

    it("should preserve comment at end of file", () => {
      expectFormat(
        `let x = 1;
// end comment`,
        `let x = 1;
// end comment
`,
      );
    });

    it("should preserve standalone comment", () => {
      expectFormat("// just a comment", "// just a comment\n");
    });

    it("should preserve comment inside block", () => {
      expectFormat(
        `if x == 1 {
  // inside
  a();
}`,
        `if x == 1 {
  // inside
  a();
}
`,
      );
    });

    it("should preserve trailing comment on block", () => {
      expectFormat(
        `if x == 1 { // condition
  a();
}`,
        `if x == 1 { // condition
  a();
}
`,
      );
    });
  });

  describe("blank lines", () => {
    it("should add blank line between imports and metadata", () => {
      expectFormat(
        `import "a" as A;
shortcut{name:"T"}`,
        `import "a" as A;

shortcut {
  name: "T",
}
`,
      );
    });

    it("should add blank line between metadata and body", () => {
      expectFormat(
        `shortcut{name:"T"}
let x = 1;`,
        `shortcut {
  name: "T",
}

let x = 1;
`,
      );
    });
  });

  describe("indentation", () => {
    it("should indent nested blocks", () => {
      expectFormat(
        "if x==1{if y==2{a();}}",
        `if x == 1 {
  if y == 2 {
    a();
  }
}
`,
      );
    });
  });

  describe("idempotency", () => {
    it("should be idempotent for a complex program", () => {
      const source = `import "math" as Math;

shortcut {
  name: "Test",
  color: .Red,
}

// Global state
let x: Number = 1;
var y = "hello";

enum Color {
  Red,
  Green,
  Blue,
}

record Point {
  x: Number,
  y: Number,
}

func add(a: Number, b: Number) -> Number {
  return a + b;
}

if x == 1 {
  showAlert(text: "yes");
} else {
  showAlert(text: "no");
}

for item in list {
  process(item);
}
`;
      expectIdempotent(source);
    });
  });

  describe("qualified types", () => {
    it("should format a qualified type annotation", () => {
      expectFormat("let x: Math.Vector = v;", "let x: Math.Vector = v;\n");
    });
  });

  describe("comparison operators", () => {
    it("should format all comparison operators", () => {
      expectFormat("if x != y {a();}", "if x != y {\n  a();\n}\n");
      expectFormat("if x < y {a();}", "if x < y {\n  a();\n}\n");
      expectFormat("if x <= y {a();}", "if x <= y {\n  a();\n}\n");
      expectFormat("if x > y {a();}", "if x > y {\n  a();\n}\n");
      expectFormat("if x >= y {a();}", "if x >= y {\n  a();\n}\n");
      expectFormat("if x contains y {a();}", "if x contains y {\n  a();\n}\n");
      expectFormat("if x !contains y {a();}", "if x !contains y {\n  a();\n}\n");
      expectFormat("if x hasPrefix y {a();}", "if x hasPrefix y {\n  a();\n}\n");
      expectFormat("if x hasSuffix y {a();}", "if x hasSuffix y {\n  a();\n}\n");
    });
  });
});
