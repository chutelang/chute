import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: "esm",
  target: "node24",
  clean: true,
  noExternal: [/^@chute-lang\//],
  banner: { js: "#!/usr/bin/env node" },
});
