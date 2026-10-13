import { describe, expect, it } from "vitest";
import { compile } from "./pipeline.ts";
import type { FileResolver } from "./checker.ts";
import { CompileError } from "./diagnostic.ts";

function resolver(files: Record<string, string>): FileResolver {
  return {
    resolve: (_from, path) => path,
    read: (path) => {
      const source = files[path];
      if (source === undefined) {
        throw new Error(`missing: ${path}`);
      }
      return source;
    },
  };
}

describe("compile file imports", () => {
  it("compiles exported actions", () => {
    const result = compile(
      'import "./actions" as A; shortcut { name: "Test" } A.notify("hello");',
      {
        resolver: resolver({
          "./actions": 'export action notify(text: Text) = "com.example.notify";',
        }),
        filePath: "main.chute",
      },
    );
    expect(result.main).toContain("com.example.notify");
  });

  it("compiles exported functions", () => {
    const result = compile(
      'import "./helpers" as H; shortcut { name: "Test" } const x = H.identity("hello");',
      {
        resolver: resolver({
          "./helpers": "export func identity(value: Text) -> Text { return value; }",
        }),
        filePath: "main.chute",
      },
    );
    expect(result.main).toContain("__chute_module:./helpers.identity");
    expect(result.main).toContain("is.workflow.actions.runworkflow");
  });

  it("lowers a function call through a nested import", () => {
    const reads: string[] = [];
    const base = resolver({
      "./outer": 'import "./inner" as I; export func outer() -> Text { return I.value(); }',
      "./inner": 'export func value() -> Text { return "nested"; }',
    });
    const trackingResolver: FileResolver = {
      resolve: base.resolve,
      read: (path) => {
        reads.push(path);
        return base.read(path);
      },
    };
    const result = compile('import "./outer" as O; const value = O.outer();', {
      resolver: trackingResolver,
      filePath: "main.chute",
    });
    expect(result.main).toContain("__chute_module:./inner.value");
    expect(reads).toEqual(["./outer", "./inner"]);
  });

  it("keeps reused nested aliases module-qualified", () => {
    const result = compile(
      'import "./outer-a" as A; import "./outer-b" as B; const a = A.outer(); const b = B.outer();',
      {
        resolver: resolver({
          "./outer-a": 'import "./inner-a" as I; export func outer() -> Text { return I.value(); }',
          "./outer-b": 'import "./inner-b" as I; export func outer() -> Text { return I.value(); }',
          "./inner-a": 'export func value() -> Text { return "a"; }',
          "./inner-b": 'export func value() -> Text { return "b"; }',
        }),
        filePath: "main.chute",
      },
    );
    expect(result.main).toContain("__chute_module:./inner-a.value");
    expect(result.main).toContain("__chute_module:./inner-b.value");
  });

  it("compiles exported constants with path-qualified storage", () => {
    const result = compile(
      'import "./a" as A; import "./b" as B; const a = A.value; const b = B.value;',
      {
        resolver: resolver({
          "./a": 'export const value = "a";',
          "./b": 'export const value = "b";',
        }),
        filePath: "main.chute",
      },
    );
    expect(result.main).toContain("__chute_module:./a.value");
    expect(result.main).toContain("__chute_module:./b.value");
  });

  it("initializes nested imported constants before their dependents", () => {
    const result = compile('import "./outer" as O; const value = O.value;', {
      resolver: resolver({
        "./outer": 'import "./inner" as I; export const value = I.value;',
        "./inner": 'export const value = "nested";',
      }),
      filePath: "main.chute",
    });
    expect(result.main.indexOf("__chute_module:./inner.value")).toBeLessThan(
      result.main.indexOf("__chute_module:./outer.value"),
    );
  });

  it("compiles exported enum cases without runtime enum state", () => {
    const result = compile('import "./types" as T; const color = T.Color.red;', {
      resolver: resolver({
        "./types": 'export enum Color { red = "RED" }',
      }),
      filePath: "main.chute",
    });
    expect(result.main).toContain("RED");
    expect(result.main).not.toContain("__chute_module:./types.Color");
  });

  it("compiles exported record construction and field access", () => {
    const result = compile(
      'import "./types" as T; const point = T.Point(x: 1, y: 2); const x = point.x;',
      {
        resolver: resolver({
          "./types": "export record Point { x: Number, y: Number }",
        }),
        filePath: "main.chute",
      },
    );
    expect(result.main).toContain("WFItems");
    expect(result.main).toContain("WFDictionaryKey");
    expect(result.main).toContain("<string>x</string>");
    expect(result.main).not.toContain("__chute_module:./types.Point");
  });

  it("initializes private constants used by exported constants", () => {
    const result = compile('import "./values" as V; const value = V.value;', {
      resolver: resolver({
        "./values": 'const privateValue = "private"; export const value = privateValue;',
      }),
      filePath: "main.chute",
    });
    expect(result.main).toContain("__chute_module:./values.privateValue");
    expect(result.main).toContain("__chute_module:./values.value");
  });

  it("rejects private constant capture from exported functions", () => {
    // Functions intentionally receive a restricted scope containing callables,
    // namespaces, types, and input. Module constants cannot be captured.
    expect(() =>
      compile('import "./helpers" as H; const value = H.value();', {
        resolver: resolver({
          "./helpers":
            'const privateValue = "private"; export func value() -> Text { return privateValue; }',
        }),
        filePath: "main.chute",
      }),
    ).toThrow(CompileError);
  });

  it("resolves private helpers in exported functions", () => {
    const result = compile('import "./helpers" as H; const value = H.outer();', {
      resolver: resolver({
        "./helpers":
          'func inner() -> Text { return "private"; } export func outer() -> Text { return inner(); }',
      }),
      filePath: "main.chute",
    });
    expect(result.main).toContain("__chute_module:./helpers.inner");
  });

  it("qualifies module references in function parameter defaults", () => {
    const result = compile('import "./helpers" as H; const value = H.echo();', {
      resolver: resolver({
        "./helpers":
          'func fallback() -> Text { return "fallback"; } export func echo(value: Text = fallback()) -> Text { return value; }',
      }),
      filePath: "main.chute",
    });
    expect(result.main).toContain("__chute_module:./helpers.fallback");
  });

  it("preserves parameter and local shadowing of module declarations", () => {
    const result = compile('import "./helpers" as H; const value = H.echo("argument");', {
      resolver: resolver({
        "./helpers":
          'const value = "module"; export func echo(value: Text) -> Text { const copy = value; return copy; }',
      }),
      filePath: "main.chute",
    });
    expect(result.main).toContain("__chute_module:./helpers.value");
    expect(result.main).toContain("<string>value</string>");
    expect(result.main).toContain("<string>copy</string>");
  });
  it("rejects parameters that shadow imported namespace aliases", () => {
    let error: unknown;
    try {
      compile('import "./outer" as O; const value = O.read(O.Payload(value: "local"));', {
        resolver: resolver({
          "./outer":
            'import "./inner" as I; export record Payload { value: Text } export func read(I: Payload) -> Text { return I.value; }',
          "./inner": 'export const other = "module";',
        }),
        filePath: "main.chute",
      });
    } catch (caught) {
      error = caught;
    }
    expect(error).toBeInstanceOf(CompileError);
    expect(
      error instanceof CompileError
        ? error.diagnostics.some(
            (diagnostic) => diagnostic.message === "'value' is not exported from 'I'",
          )
        : false,
    ).toBe(true);
  });

  it("reports missing files", () => {
    expect(() =>
      compile('import "./missing" as M;', {
        resolver: resolver({}),
        filePath: "main.chute",
      }),
    ).toThrow(CompileError);
  });

  it("reports import cycles", () => {
    expect(() =>
      compile('import "./a" as A;', {
        resolver: resolver({
          "./a": 'import "./b" as B; export const a = "a";',
          "./b": 'import "./a" as A; export const b = "b";',
        }),
        filePath: "main.chute",
      }),
    ).toThrow(CompileError);
  });
});
