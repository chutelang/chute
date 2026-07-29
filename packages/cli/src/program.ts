import { Command } from "commander";
import { build, type BuildOptions } from "./commands/build.ts";
import { fmt, type FmtOptions } from "./commands/fmt.ts";
import { init } from "./commands/init.ts";
import { run } from "./commands/run.ts";
import { startServer } from "@chute-lang/lsp";

const VERSION = "0.1.0";

export function createProgram(): Command {
  const program = new Command()
    .name("chute")
    .description("A strongly-typed language that compiles to Siri Shortcuts.")
    .version(VERSION, "-v, --version");

  program
    .command("init")
    .description("Create a new chute project")
    .argument("[directory]", "target directory", ".")
    .action((directory: string) => {
      init(directory);
    });

  program
    .command("build")
    .description("Compile .chute files to .shortcut")
    .argument("[files...]", "files to compile (defaults to all in sourceDir)")
    .option("--no-sign", "skip signing the output")
    .action((files: string[], options: BuildOptions) => {
      build(files, options);
    });

  program
    .command("check")
    .description("Type-check and lint .chute files")
    .argument("[files...]", "files to check (defaults to all in sourceDir)")
    .action(stub("check"));

  program
    .command("fmt")
    .description("Format .chute files")
    .argument("[files...]", "files to format (defaults to all in sourceDir)")
    .option("--check", "exit nonzero if any file would change")
    .action((files: string[], options: FmtOptions) => {
      fmt(files, options);
    });

  program
    .command("lsp")
    .description("Start the language server")
    .action(() => {
      startServer();
    });

  program
    .command("run")
    .description("Build and open a shortcut")
    .argument("<file>", "the .chute file to run")
    .action((file: string) => {
      run(file);
    });

  return program;
}

function stub(name: string): () => void {
  return () => {
    process.stderr.write(`chute ${name}: not yet implemented\n`);
    process.exitCode = 1;
  };
}
