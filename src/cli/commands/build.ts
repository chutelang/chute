import * as fs from "node:fs";
import * as path from "node:path";
import { compile } from "../../compiler/pipeline.ts";

export function build(files: string[]): void {
  if (files.length === 0) {
    process.stderr.write("chute build: no input files\n");
    process.exitCode = 1;
    return;
  }

  for (const file of files) {
    buildFile(file);
  }
}

function buildFile(file: string): void {
  const resolved = path.resolve(file);

  if (!fs.existsSync(resolved)) {
    process.stderr.write(`chute build: file not found: ${file}\n`);
    process.exitCode = 1;
    return;
  }

  const source = fs.readFileSync(resolved, "utf-8");
  const plist = compile(source);

  const outDir = path.dirname(resolved);
  const baseName = path.basename(resolved, ".chute");
  const outPath = path.join(outDir, `${baseName}.plist`);

  fs.writeFileSync(outPath, plist);
  process.stdout.write(`${outPath}\n`);
}
