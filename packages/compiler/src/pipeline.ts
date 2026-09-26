import { Lexer } from "./lexer.ts";
import { Parser } from "./parser.ts";
import { check } from "./checker.ts";
import { lower } from "./lower.ts";
import { codegen } from "./codegen.ts";

export interface CompileResult {
  main: string;
}

export function compile(source: string): CompileResult {
  const tokens = new Lexer(source).tokenize();
  const ast = new Parser(tokens).parse();
  check(ast);
  const result = lower(ast);
  return {
    main: codegen(result.main),
  };
}
