import type { ActionIR, ParameterValue, ShortcutIR } from "./ir.ts";

export function codegen(ir: ShortcutIR): string {
  const lines: string[] = [];

  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push(
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
  );
  lines.push('<plist version="1.0">');
  lines.push("<dict>");

  emitKeyString(lines, 1, "WFWorkflowClientVersion", "1");

  emitKey(lines, 1, "WFWorkflowHasOutputFallback");
  emitBool(lines, 1, false);

  emitKey(lines, 1, "WFWorkflowHasShortcutInputVariables");
  emitBool(lines, 1, false);

  emitKey(lines, 1, "WFWorkflowIcon");
  emitIndent(lines, 1, "<dict>");
  emitKeyInteger(lines, 2, "WFWorkflowIconGlyphNumber", 59511);
  emitKeyInteger(lines, 2, "WFWorkflowIconStartColor", 4274264319);
  emitIndent(lines, 1, "</dict>");

  emitKey(lines, 1, "WFWorkflowImportQuestions");
  emitIndent(lines, 1, "<array/>");

  emitKey(lines, 1, "WFWorkflowInputContentItemClasses");
  emitIndent(lines, 1, "<array/>");

  emitKeyInteger(lines, 1, "WFWorkflowMinimumClientVersion", 900);

  emitKeyString(lines, 1, "WFWorkflowMinimumClientVersionString", "900");

  emitKeyString(lines, 1, "WFWorkflowName", ir.name);

  emitKey(lines, 1, "WFWorkflowTypes");
  emitIndent(lines, 1, "<array>");
  emitIndent(lines, 2, "<string>NCWidget</string>");
  emitIndent(lines, 2, "<string>WatchKit</string>");
  emitIndent(lines, 1, "</array>");

  emitKey(lines, 1, "WFWorkflowActions");
  emitIndent(lines, 1, "<array>");

  for (const action of ir.actions) {
    emitAction(lines, 2, action);
  }

  emitIndent(lines, 1, "</array>");

  lines.push("</dict>");
  lines.push("</plist>");
  lines.push("");

  return lines.join("\n");
}

function emitAction(lines: string[], depth: number, action: ActionIR): void {
  emitIndent(lines, depth, "<dict>");
  emitKeyString(lines, depth + 1, "WFWorkflowActionIdentifier", action.identifier);
  emitKeyString(lines, depth + 1, "UUID", action.uuid);

  if (action.parameters.size > 0 || action.groupingIdentifier !== undefined) {
    emitKey(lines, depth + 1, "WFWorkflowActionParameters");
    emitIndent(lines, depth + 1, "<dict>");
    for (const [key, value] of action.parameters) {
      emitKeyValue(lines, depth + 2, key, value);
    }
    if (action.groupingIdentifier !== undefined) {
      emitKeyString(lines, depth + 2, "GroupingIdentifier", action.groupingIdentifier);
    }
    emitIndent(lines, depth + 1, "</dict>");
  }

  emitIndent(lines, depth, "</dict>");
}

function emitKeyValue(lines: string[], depth: number, key: string, value: ParameterValue): void {
  if (typeof value === "string") {
    emitKeyString(lines, depth, key, value);
  } else if (typeof value === "number") {
    if (Number.isInteger(value)) {
      emitKeyInteger(lines, depth, key, value);
    } else {
      emitKey(lines, depth, key);
      emitIndent(lines, depth, `<real>${value}</real>`);
    }
  } else {
    emitKey(lines, depth, key);
    emitBool(lines, depth, value);
  }
}

function emitKey(lines: string[], depth: number, key: string): void {
  emitIndent(lines, depth, `<key>${escapeXml(key)}</key>`);
}

function emitKeyString(lines: string[], depth: number, key: string, value: string): void {
  emitKey(lines, depth, key);
  emitIndent(lines, depth, `<string>${escapeXml(value)}</string>`);
}

function emitKeyInteger(lines: string[], depth: number, key: string, value: number): void {
  emitKey(lines, depth, key);
  emitIndent(lines, depth, `<integer>${value}</integer>`);
}

function emitBool(lines: string[], depth: number, value: boolean): void {
  emitIndent(lines, depth, value ? "<true/>" : "<false/>");
}

function emitIndent(lines: string[], depth: number, text: string): void {
  lines.push("\t".repeat(depth) + text);
}

function escapeXml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
