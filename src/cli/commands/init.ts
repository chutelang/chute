import * as fs from "node:fs";
import * as path from "node:path";

const CHUTE_JSON_TEMPLATE = (name: string): string =>
  JSON.stringify(
    {
      $schema: "https://chute-lang.dev/schema/chute.schema.json",
      name,
      version: "1.0.0",
      sourceDir: "./src",
      outDir: "./build",
      sign: true,
    },
    null,
    2,
  ) + "\n";

const MAIN_CHUTE_TEMPLATE = `shortcut {
  name: "Hello World",
  description: "A shortcut created with Chute",
}

showAlert(text: "Hello from Chute!");
`;

const GITIGNORE_TEMPLATE = `build/
node_modules/
`;

export function init(directory: string): void {
  const target = path.resolve(directory);

  if (fs.existsSync(path.join(target, "chute.json"))) {
    process.stderr.write(`chute init: chute.json already exists in ${target}\n`);
    process.exitCode = 1;
    return;
  }

  const projectName = path.basename(target);
  const srcDir = path.join(target, "src");

  fs.mkdirSync(srcDir, { recursive: true });

  fs.writeFileSync(path.join(target, "chute.json"), CHUTE_JSON_TEMPLATE(projectName));
  fs.writeFileSync(path.join(srcDir, "main.chute"), MAIN_CHUTE_TEMPLATE);
  fs.writeFileSync(path.join(target, ".gitignore"), GITIGNORE_TEMPLATE);

  process.stdout.write(`Created chute project in ${target}\n`);
}
