import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import { parseShortcutManifest } from "./macos-helpers.ts";

const [manifestPath, command, ...commandPrefix] = process.argv.slice(2);
if (!manifestPath || !command) {
  throw new Error("Usage: run-guest-vitest.ts MANIFEST COMMAND [COMMAND_PREFIX...]");
}
const manifest = parseShortcutManifest(JSON.parse(fs.readFileSync(manifestPath, "utf8")));
const result = spawnSync(
  command,
  [
    ...commandPrefix,
    "exec",
    "vitest",
    "run",
    "--config",
    "tools/simulator-test/vitest.config.ts",
    ...manifest.vitestArgs,
  ],
  { stdio: "inherit" },
);
if (result.error) {
  throw result.error;
}
process.exit(result.status ?? 1);
