import { describe, expect, it } from "vitest";
import { getStdlibActions, getStdlibScope, KNOWN_QUANTITY_UNITS } from "./stdlib.ts";

describe("stdlib", () => {
  it("should return a scope with showAlert binding", () => {
    const scope = getStdlibScope();
    const binding = scope.lookup("showAlert");
    expect(binding).toBeDefined();
    expect(binding?.type.kind).toBe("action");
  });

  it("should return a scope with showResult binding", () => {
    const scope = getStdlibScope();
    const binding = scope.lookup("showResult");
    expect(binding).toBeDefined();
    expect(binding?.type.kind).toBe("action");
  });

  it("should return action declarations map with showAlert", () => {
    const actions = getStdlibActions();
    const decl = actions.get("showAlert");
    expect(decl).toBeDefined();
    expect(decl?.runtimeIdentifier).toBe("is.workflow.actions.alert");
  });

  it("should include actions from multiple categories", () => {
    const actions = getStdlibActions();
    expect(actions.has("showAlert")).toBe(true);
    expect(actions.has("openURL")).toBe(true);
    expect(actions.has("getCurrentLocation")).toBe(true);
    expect(actions.has("takePicture")).toBe(true);
  });

  it("should have matching label and plist key for showAlert text param", () => {
    const actions = getStdlibActions();
    const decl = actions.get("showAlert");
    const param = decl?.params.at(0);
    expect(param?.label).toBe("text");
    expect(param?.name).toBe("WFAlertActionTitle");
  });

  it("should include known quantity units", () => {
    expect(KNOWN_QUANTITY_UNITS.has("meters")).toBe(true);
    expect(KNOWN_QUANTITY_UNITS.has("celsius")).toBe(true);
    expect(KNOWN_QUANTITY_UNITS.has("kilograms")).toBe(true);
  });

  it("should not include unknown quantity units", () => {
    expect(KNOWN_QUANTITY_UNITS.has("parsecs")).toBe(false);
  });
});
