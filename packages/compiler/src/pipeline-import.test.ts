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
