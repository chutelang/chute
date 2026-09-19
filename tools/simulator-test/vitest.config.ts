import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tools/simulator-test/*.test.ts"],
    testTimeout: 60_000,
    hookTimeout: 300_000,
    reporters: "verbose",
  },
});
