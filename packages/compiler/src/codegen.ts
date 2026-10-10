import { build as buildPlist } from "plist";
import type {
  ActionIR,
  ActionOutputRef,
  Aggrandizement,
  DictItems,
  InterpolatedText,
  ListItems,
  ParameterValue,
  SelfRef,
  ShortcutIR,
  StringArray,
  VariableRef,
  WorkflowRef,
} from "./ir.ts";
import type { InputSlot } from "./coercion.ts";
import { getParameterSlot } from "./stdlib.ts";

const OBJECT_REPLACEMENT_CHAR = "￼";

type PlistValue = string | number | boolean | PlistValue[] | { [key: string]: PlistValue };

export function codegen(ir: ShortcutIR): string {
  const workflow: Record<string, PlistValue> = {
    WFWorkflowClientVersion: "1",
    WFWorkflowHasOutputFallback: false,
    WFWorkflowHasShortcutInputVariables: ir.acceptsInput ?? false,
    WFWorkflowIcon: {
      WFWorkflowIconGlyphNumber: 59511,
      WFWorkflowIconStartColor: 4274264319,
    },
    WFWorkflowImportQuestions: [],
    WFWorkflowInputContentItemClasses: ir.acceptsInput ? ["WFContentItem"] : [],
    WFWorkflowMinimumClientVersion: 900,
    WFWorkflowMinimumClientVersionString: "900",
    WFWorkflowName: ir.name,
    WFWorkflowTypes: ["NCWidget", "WatchKit"],
    WFWorkflowActions: ir.actions.map((action) => buildAction(action)),
  };

  return buildPlist(workflow) + "\n";
}

function buildAction(action: ActionIR): PlistValue {
  const result: Record<string, PlistValue> = {
    WFWorkflowActionIdentifier: action.identifier,
    UUID: action.uuid,
  };

  const params: Record<string, PlistValue> = {};
  for (const [key, value] of action.parameters) {
    params[key] = buildParamValue(value, action.identifier, key);
  }
  if (action.groupingIdentifier !== undefined) {
    params["GroupingIdentifier"] = action.groupingIdentifier;
  }
  result["WFWorkflowActionParameters"] = params;

  return result;
}

function buildParamValue(value: ParameterValue, actionIdentifier: string, key: string): PlistValue {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "boolean") {
    return value;
  }

  switch (value.kind) {
    case "StringArray":
      return buildStringArray(value);
    case "VariableRef":
      return buildVariableRef(value, getParameterSlot(actionIdentifier, key));
    case "ActionOutputRef":
      return buildActionOutputRef(value);
    case "ExtensionInputRef":
      return buildExtensionInputRef();
    case "WorkflowRef":
      return buildWorkflowRef(value);
    case "SelfRef":
      return buildSelfRef(value);
    case "ListItems":
      return buildListItems(value, actionIdentifier);
    case "DictItems":
      return buildDictItems(value, actionIdentifier);
    case "InterpolatedText":
      return buildInterpolatedText(value);
  }
}

function buildStringArray(value: StringArray): PlistValue {
  return value.values;
}

function buildVariableRef(ref: VariableRef, slot: InputSlot): PlistValue {
  if (slot === "picker") {
    const inner: Record<string, PlistValue> = {
      Type: "Variable",
      VariableName: ref.name,
    };
    if (ref.aggrandizements && ref.aggrandizements.length > 0) {
      inner["Aggrandizements"] = buildAggrandizements(ref.aggrandizements);
    }
    return {
      WFSerializationType: "WFTextTokenAttachment",
      Value: inner,
    };
  }

  const attachment: Record<string, PlistValue> = {
    Type: "Variable",
    VariableName: ref.name,
  };
  if (ref.aggrandizements && ref.aggrandizements.length > 0) {
    attachment["Aggrandizements"] = buildAggrandizements(ref.aggrandizements);
  }
  return {
    WFSerializationType: "WFTextTokenString",
    Value: {
      string: OBJECT_REPLACEMENT_CHAR,
      attachmentsByRange: {
        "{0, 1}": attachment,
      },
    },
  };
}

function buildActionOutputRef(ref: ActionOutputRef): PlistValue {
  return {
    WFSerializationType: "WFTextTokenAttachment",
    Value: {
      Type: "ActionOutput",
      OutputName: ref.outputName,
      OutputUUID: ref.outputUUID,
    },
  };
}

function buildExtensionInputRef(): PlistValue {
  return {
    Value: {
      Type: "ExtensionInput",
    },
    WFSerializationType: "WFTextTokenAttachment",
  };
}

function buildWorkflowRef(ref: WorkflowRef): PlistValue {
  return {
    WFSerializationType: "WFDictionaryFieldValue",
    Value: {
      WFWorkflowName: ref.name,
    },
  };
}

function buildSelfRef(ref: SelfRef): PlistValue {
  return {
    isSelf: true,
    workflowName: ref.name,
  };
}

export function utf16Length(str: string): number {
  let length = 0;
  for (const ch of str) {
    const cp = ch.codePointAt(0) ?? 0;
    length += cp >= 0x10000 ? 2 : 1;
  }
  return length;
}

function buildInterpolatedText(text: InterpolatedText): PlistValue {
  let combined = "";
  const attachments: Record<string, PlistValue> = {};

  for (const part of text.parts) {
    if (part.kind === "text") {
      combined += part.value;
    } else {
      const attachment: Record<string, PlistValue> = {
        Type: "Variable",
        VariableName: part.name,
      };
      if (part.aggrandizements && part.aggrandizements.length > 0) {
        attachment["Aggrandizements"] = buildAggrandizements(part.aggrandizements);
      }
      attachments[`{${utf16Length(combined)}, 1}`] = attachment;
      combined += OBJECT_REPLACEMENT_CHAR;
    }
  }

  return {
    WFSerializationType: "WFTextTokenString",
    Value: {
      string: combined,
      attachmentsByRange: attachments,
    },
  };
}

function buildAggrandizements(aggrandizements: Aggrandizement[]): PlistValue {
  return aggrandizements.map((agg) => {
    if (agg.kind === "coercion") {
      return {
        Type: "WFCoercionVariableAggrandizement",
        CoercionItemClass: agg.itemClass,
      };
    }
    if (agg.kind === "dateFormat") {
      return {
        Type: "WFDateFormatVariableAggrandizement",
        WFDateFormatStyle: "Custom",
        WFDateFormat: agg.format,
        WFISO8601IncludeTime: false,
      };
    }
    const result: Record<string, PlistValue> = {
      Type: "WFPropertyVariableAggrandizement",
      PropertyName: agg.name,
    };
    if (typeof agg.userInfo === "number" || typeof agg.userInfo === "string") {
      result["PropertyUserInfo"] = agg.userInfo;
    }
    return result;
  });
}

function buildTokenValue(value: ParameterValue, actionIdentifier: string): PlistValue {
  if (typeof value === "string") {
    return {
      WFSerializationType: "WFTextTokenString",
      Value: {
        string: value,
      },
    };
  }
  if (typeof value === "number") {
    return {
      WFSerializationType: "WFTextTokenString",
      Value: {
        string: String(value),
      },
    };
  }
  if (typeof value === "boolean") {
    return {
      WFSerializationType: "WFNumberSubstitutableState",
      Value: value,
    };
  }
  if (value.kind === "VariableRef") {
    return buildVariableRef(value, getParameterSlot(actionIdentifier, ""));
  }
  if (value.kind === "InterpolatedText") {
    return buildInterpolatedText(value);
  }
  return {
    WFSerializationType: "WFTextTokenString",
    Value: {
      string: String(value),
    },
  };
}

function buildListItems(list: ListItems, actionIdentifier: string): PlistValue {
  return list.items.map((item) => ({
    WFItemType: item.itemType,
    WFValue: buildTokenValue(item.value, actionIdentifier),
  }));
}

function buildDictItems(dict: DictItems, actionIdentifier: string): PlistValue {
  return {
    Value: {
      WFDictionaryFieldValueItems: dict.entries.map((entry) => ({
        WFItemType: entry.itemType,
        WFKey: buildTokenValue(entry.key, actionIdentifier),
        WFValue: buildTokenValue(entry.value, actionIdentifier),
      })),
    },
  };
}
