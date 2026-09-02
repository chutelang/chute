import { describe, expect, it } from "vitest";
import { getStdlibModule, getStdlibModuleNames } from "./stdlib.ts";

describe("stdlib modules", () => {
  describe("getStdlibModuleNames", () => {
    it("should return all category names", () => {
      const names = getStdlibModuleNames();
      expect(names).toContain("Scripting");
      expect(names).toContain("Web");
      expect(names).toContain("Text");
      expect(names).toContain("Media");
      expect(names).toContain("Settings");
      expect(names.length).toBeGreaterThan(10);
    });
  });

  describe("getStdlibModule", () => {
    it("should return a scope for a valid module name", () => {
      const scope = getStdlibModule("Scripting");
      expect(scope).toBeDefined();
    });

    it("should return undefined for an invalid module name", () => {
      const scope = getStdlibModule("NonExistent");
      expect(scope).toBeUndefined();
    });

    it("should contain actions in the returned scope", () => {
      const scope = getStdlibModule("Scripting");
      expect(scope).toBeDefined();
      const binding = scope?.lookup("askForInput");
      expect(binding).toBeDefined();
      expect(binding?.type.kind).toBe("action");
    });

    it("should have correct runtime identifier on actions", () => {
      const scope = getStdlibModule("Web");
      expect(scope).toBeDefined();
      const binding = scope?.lookup("getContentsOfUrl");
      expect(binding).toBeDefined();
      if (binding?.type.kind === "action") {
        expect(binding.type.runtimeIdentifier).toBe("is.workflow.actions.downloadurl");
      }
    });

    it("should have typed parameters on actions", () => {
      const scope = getStdlibModule("Web");
      expect(scope).toBeDefined();
      const binding = scope?.lookup("getContentsOfUrl");
      expect(binding).toBeDefined();
      if (binding?.type.kind === "action") {
        const urlParam = binding.type.params.find((p) => p.label === "WFURL");
        expect(urlParam).toBeDefined();
        expect(urlParam?.type.kind).toBe("text");
      }
    });
  });
});
