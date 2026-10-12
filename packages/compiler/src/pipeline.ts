import { Lexer } from "./lexer.ts";
import { Parser } from "./parser.ts";
import { checkForCompilation } from "./checker.ts";
import type { CheckOptions } from "./checker.ts";
import { lower } from "./lower.ts";
import { codegen } from "./codegen.ts";

export type CompileOptions = CheckOptions;

export interface CompileResult {
  main: string;
}

export function compile(source: string, options?: CompileOptions): CompileResult {
  const tokens = new Lexer(source).tokenize();
  const ast = new Parser(tokens).parse();
  const checked = checkForCompilation(ast, options);
  const result = lower(ast, { imports: checked.imports });
  return {
    main: codegen(result.main),
  };
}
