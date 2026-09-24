import type {
  ActionIR,
  ActionOutputRef,
  Aggrandizement,
  DictItems,
  InterpolatedText,
  ListItems,
  ParameterValue,
  ShortcutIR,
  VariableRef,
  WorkflowRef,
} from "./ir.ts";
import type { InputSlot } from "./coercion.ts";
import { getParameterSlot } from "./stdlib.ts";

const OBJECT_REPLACEMENT_CHAR = "￼";
const OBJECT_REPLACEMENT_ENTITY = "&#xFFFC;";

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
  emitBool(lines, 1, ir.acceptsInput ?? false);

  emitKey(lines, 1, "WFWorkflowIcon");
  emitIndent(lines, 1, "<dict>");
  emitKeyInteger(lines, 2, "WFWorkflowIconGlyphNumber", 59511);
  emitKeyInteger(lines, 2, "WFWorkflowIconStartColor", 4274264319);
  emitIndent(lines, 1, "</dict>");

  emitKey(lines, 1, "WFWorkflowImportQuestions");
  emitIndent(lines, 1, "<array/>");

  emitKey(lines, 1, "WFWorkflowInputContentItemClasses");
  if (ir.acceptsInput) {
    emitIndent(lines, 1, "<array>");
    emitIndent(lines, 2, "<string>WFContentItem</string>");
    emitIndent(lines, 1, "</array>");
  } else {
    emitIndent(lines, 1, "<array/>");
  }

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
      emitKeyValue(lines, depth + 2, key, value, action.identifier);
    }
    if (action.groupingIdentifier !== undefined) {
      emitKeyString(lines, depth + 2, "GroupingIdentifier", action.groupingIdentifier);
    }
    emitIndent(lines, depth + 1, "</dict>");
  }

  emitIndent(lines, depth, "</dict>");
}

function emitKeyValue(
  lines: string[],
  depth: number,
  key: string,
  value: ParameterValue,
  actionIdentifier: string,
): void {
  if (typeof value === "string") {
    emitKeyString(lines, depth, key, value);
    return;
  }

  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      emitKeyInteger(lines, depth, key, value);
    } else {
      emitKey(lines, depth, key);
      emitIndent(lines, depth, `<real>${value}</real>`);
    }
    return;
  }

  if (typeof value === "boolean") {
    emitKey(lines, depth, key);
    emitBool(lines, depth, value);
    return;
  }

  emitKey(lines, depth, key);
  if (value.kind === "VariableRef") {
    emitVariableRef(lines, depth, value, getParameterSlot(actionIdentifier, key));
  } else if (value.kind === "ActionOutputRef") {
    emitActionOutputRef(lines, depth, value);
  } else if (value.kind === "ExtensionInputRef") {
    emitExtensionInputRef(lines, depth);
  } else if (value.kind === "WorkflowRef") {
    emitWorkflowRef(lines, depth, value);
  } else if (value.kind === "ListItems") {
    emitListItems(lines, depth, value, actionIdentifier);
  } else if (value.kind === "DictItems") {
    emitDictItems(lines, depth, value, actionIdentifier);
  } else {
    emitInterpolatedText(lines, depth, value);
  }
}

/**
 * A variable reference is serialized differently depending on the parameter it
 * fills. A variable picker takes a bare WFTextTokenAttachment whose Value is the
 * attachment itself; a text or number field takes a WFTextTokenString holding
 * the variable in attachmentsByRange. Emitting one shape in the other slot binds
 * nothing, and the action silently runs on empty input.
 */
function emitVariableRef(lines: string[], depth: number, ref: VariableRef, slot: InputSlot): void {
  emitIndent(lines, depth, "<dict>");

  if (slot === "picker") {
    emitKeyString(lines, depth + 1, "WFSerializationType", "WFTextTokenAttachment");
    emitKey(lines, depth + 1, "Value");
    emitIndent(lines, depth + 1, "<dict>");
    emitKeyString(lines, depth + 2, "Type", "Variable");
    emitKeyString(lines, depth + 2, "VariableName", ref.name);
    if (ref.aggrandizements && ref.aggrandizements.length > 0) {
      emitAggrandizements(lines, depth + 2, ref.aggrandizements);
    }
    emitIndent(lines, depth + 1, "</dict>");
  } else {
    emitKeyString(lines, depth + 1, "WFSerializationType", "WFTextTokenString");
    emitKey(lines, depth + 1, "Value");
    emitIndent(lines, depth + 1, "<dict>");
    emitKeyRawString(lines, depth + 2, "string", OBJECT_REPLACEMENT_ENTITY);
    emitKey(lines, depth + 2, "attachmentsByRange");
    emitIndent(lines, depth + 2, "<dict>");
    emitAttachmentEntry(lines, depth + 3, 0, ref.name, ref.aggrandizements);
    emitIndent(lines, depth + 2, "</dict>");
    emitIndent(lines, depth + 1, "</dict>");
  }

  emitIndent(lines, depth, "</dict>");
}

function emitInterpolatedText(lines: string[], depth: number, text: InterpolatedText): void {
  const { combined, ranges } = buildCombinedText(text);

  emitIndent(lines, depth, "<dict>");
  emitKeyString(lines, depth + 1, "WFSerializationType", "WFTextTokenString");
  emitKey(lines, depth + 1, "Value");
  emitIndent(lines, depth + 1, "<dict>");
  emitKeyRawString(lines, depth + 2, "string", xmlEscapeWithAttachments(combined));
  emitKey(lines, depth + 2, "attachmentsByRange");
  emitIndent(lines, depth + 2, "<dict>");
  for (const range of ranges) {
    emitAttachmentEntry(lines, depth + 3, range.offset, range.name, range.aggrandizements);
  }
  emitIndent(lines, depth + 2, "</dict>");
  emitIndent(lines, depth + 1, "</dict>");
  emitIndent(lines, depth, "</dict>");
}

function emitAttachmentEntry(
  lines: string[],
  depth: number,
  offset: number,
  name: string,
  aggrandizements?: Aggrandizement[],
): void {
  emitKey(lines, depth, `{${offset}, 1}`);
  emitIndent(lines, depth, "<dict>");
  emitKeyString(lines, depth + 1, "Type", "Variable");
  emitKeyString(lines, depth + 1, "VariableName", name);
  if (aggrandizements && aggrandizements.length > 0) {
    emitAggrandizements(lines, depth + 1, aggrandizements);
  }
  emitIndent(lines, depth, "</dict>");
}

function emitAggrandizements(
  lines: string[],
  depth: number,
  aggrandizements: Aggrandizement[],
): void {
  emitKey(lines, depth, "Aggrandizements");
  emitIndent(lines, depth, "<array>");
  for (const agg of aggrandizements) {
    emitIndent(lines, depth + 1, "<dict>");
    if (agg.kind === "coercion") {
      emitKeyString(lines, depth + 2, "Type", "WFCoercionVariableAggrandizement");
      emitKeyString(lines, depth + 2, "CoercionItemClass", agg.itemClass);
    } else if (agg.kind === "dateFormat") {
      emitKeyString(lines, depth + 2, "Type", "WFDateFormatVariableAggrandizement");
      emitKeyString(lines, depth + 2, "WFDateFormatStyle", "Custom");
      emitKeyString(lines, depth + 2, "WFDateFormat", agg.format);
      emitKey(lines, depth + 2, "WFISO8601IncludeTime");
      emitBool(lines, depth + 2, false);
    } else {
      emitKeyString(lines, depth + 2, "Type", "WFPropertyVariableAggrandizement");
      emitKeyString(lines, depth + 2, "PropertyName", agg.name);
      if (typeof agg.userInfo === "number") {
        emitKeyInteger(lines, depth + 2, "PropertyUserInfo", agg.userInfo);
      } else if (typeof agg.userInfo === "string") {
        emitKeyString(lines, depth + 2, "PropertyUserInfo", agg.userInfo);
      }
    }
    emitIndent(lines, depth + 1, "</dict>");
  }
  emitIndent(lines, depth, "</array>");
}

interface AttachmentRange {
  offset: number;
  name: string;
  aggrandizements?: Aggrandizement[];
}

function buildCombinedText(text: InterpolatedText): {
  combined: string;
  ranges: AttachmentRange[];
} {
  let combined = "";
  const ranges: AttachmentRange[] = [];

  for (const part of text.parts) {
    if (part.kind === "text") {
      combined += part.value;
    } else {
      ranges.push({
        offset: combined.length,
        name: part.name,
        ...(part.aggrandizements !== undefined ? { aggrandizements: part.aggrandizements } : {}),
      });
      combined += OBJECT_REPLACEMENT_CHAR;
    }
  }

  return {
    combined,
    ranges,
  };
}

function xmlEscapeWithAttachments(text: string): string {
  return escapeXml(text).replaceAll(OBJECT_REPLACEMENT_CHAR, OBJECT_REPLACEMENT_ENTITY);
}

function emitExtensionInputRef(lines: string[], depth: number): void {
  emitIndent(lines, depth, "<dict>");
  emitKey(lines, depth + 1, "Value");
  emitIndent(lines, depth + 1, "<dict>");
  emitKeyString(lines, depth + 2, "Type", "ExtensionInput");
  emitIndent(lines, depth + 1, "</dict>");
  emitKeyString(lines, depth + 1, "WFSerializationType", "WFTextTokenAttachment");
  emitIndent(lines, depth, "</dict>");
}

function emitWorkflowRef(lines: string[], depth: number, ref: WorkflowRef): void {
  emitIndent(lines, depth, "<dict>");
  emitKeyString(lines, depth + 1, "WFSerializationType", "WFDictionaryFieldValue");
  emitKey(lines, depth + 1, "Value");
  emitIndent(lines, depth + 1, "<dict>");
  emitKeyString(lines, depth + 2, "WFWorkflowName", ref.name);
  emitIndent(lines, depth + 1, "</dict>");
  emitIndent(lines, depth, "</dict>");
}

function emitActionOutputRef(
  lines: string[],
  depth: number,
  ref: ActionOutputRef,
): void {
  emitIndent(lines, depth, "<dict>");
  emitKeyString(lines, depth + 1, "WFSerializationType", "WFTextTokenAttachment");
  emitKey(lines, depth + 1, "Value");
  emitIndent(lines, depth + 1, "<dict>");
  emitKeyString(lines, depth + 2, "Type", "ActionOutput");
  emitKeyString(lines, depth + 2, "OutputName", ref.outputName);
  emitKeyString(lines, depth + 2, "OutputUUID", ref.outputUUID);
  emitIndent(lines, depth + 1, "</dict>");
  emitIndent(lines, depth, "</dict>");
}

function emitTokenValue(
  lines: string[],
  depth: number,
  value: ParameterValue,
  actionIdentifier: string,
): void {
  if (typeof value === "string") {
    emitIndent(lines, depth, "<dict>");
    emitKeyString(lines, depth + 1, "WFSerializationType", "WFTextTokenString");
    emitKey(lines, depth + 1, "Value");
    emitIndent(lines, depth + 1, "<dict>");
    emitKeyRawString(lines, depth + 2, "string", xmlEscapeWithAttachments(value));
    emitIndent(lines, depth + 1, "</dict>");
    emitIndent(lines, depth, "</dict>");
  } else if (typeof value === "number") {
    emitIndent(lines, depth, "<dict>");
    emitKeyString(lines, depth + 1, "WFSerializationType", "WFTextTokenString");
    emitKey(lines, depth + 1, "Value");
    emitIndent(lines, depth + 1, "<dict>");
    emitKeyRawString(lines, depth + 2, "string", String(value));
    emitIndent(lines, depth + 1, "</dict>");
    emitIndent(lines, depth, "</dict>");
  } else if (typeof value !== "boolean" && value.kind === "VariableRef") {
    emitVariableRef(lines, depth, value, getParameterSlot(actionIdentifier, ""));
  } else if (typeof value !== "boolean" && value.kind === "InterpolatedText") {
    emitInterpolatedText(lines, depth, value);
  } else {
    emitIndent(lines, depth, "<dict>");
    emitKeyString(lines, depth + 1, "WFSerializationType", "WFTextTokenString");
    emitKey(lines, depth + 1, "Value");
    emitIndent(lines, depth + 1, "<dict>");
    emitKeyRawString(lines, depth + 2, "string", String(value));
    emitIndent(lines, depth + 1, "</dict>");
    emitIndent(lines, depth, "</dict>");
  }
}

function emitListItems(
  lines: string[],
  depth: number,
  list: ListItems,
  actionIdentifier: string,
): void {
  emitIndent(lines, depth, "<array>");
  for (const item of list.items) {
    emitIndent(lines, depth + 1, "<dict>");
    emitKeyInteger(lines, depth + 2, "WFItemType", item.itemType);
    emitKey(lines, depth + 2, "WFValue");
    emitTokenValue(lines, depth + 2, item.value, actionIdentifier);
    emitIndent(lines, depth + 1, "</dict>");
  }
  emitIndent(lines, depth, "</array>");
}

function emitDictItems(
  lines: string[],
  depth: number,
  dict: DictItems,
  actionIdentifier: string,
): void {
  emitIndent(lines, depth, "<dict>");
  emitKey(lines, depth + 1, "Value");
  emitIndent(lines, depth + 1, "<dict>");
  emitKey(lines, depth + 2, "WFDictionaryFieldValueItems");
  emitIndent(lines, depth + 2, "<array>");
  for (const entry of dict.entries) {
    emitIndent(lines, depth + 3, "<dict>");
    emitKeyInteger(lines, depth + 4, "WFItemType", entry.itemType);
    emitKey(lines, depth + 4, "WFKey");
    emitTokenValue(lines, depth + 4, entry.key, actionIdentifier);
    emitKey(lines, depth + 4, "WFValue");
    emitTokenValue(lines, depth + 4, entry.value, actionIdentifier);
    emitIndent(lines, depth + 3, "</dict>");
  }
  emitIndent(lines, depth + 2, "</array>");
  emitIndent(lines, depth + 1, "</dict>");
  emitIndent(lines, depth, "</dict>");
}

function emitKey(lines: string[], depth: number, key: string): void {
  emitIndent(lines, depth, `<key>${escapeXml(key)}</key>`);
}

function emitKeyString(lines: string[], depth: number, key: string, value: string): void {
  emitKey(lines, depth, key);
  emitIndent(lines, depth, `<string>${escapeXml(value)}</string>`);
}

function emitKeyRawString(lines: string[], depth: number, key: string, raw: string): void {
  emitKey(lines, depth, key);
  emitIndent(lines, depth, `<string>${raw}</string>`);
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
