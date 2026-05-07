import { Lexer } from "./lexer.ts";
import { Parser } from "./parser.ts";
import { lower } from "./lower.ts";
import { codegen } from "./codegen.ts";

export function compile(source: string): string {
  const tokens = new Lexer(source).tokenize();
  const ast = new Parser(tokens).parse();
  const ir = lower(ast);
  return codegen(ir);
}
