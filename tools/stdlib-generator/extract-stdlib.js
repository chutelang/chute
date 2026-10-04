#!/usr/bin/env node
//
// Post-processes tools/data/chute_actions.json (390 raw actions from the
// runtime extractor) into packages/compiler/data/stdlib.json (the structured
// format the compiler will consume).
//
// Usage:
//   node tools/extract-stdlib.js                          # default paths
//   node tools/extract-stdlib.js path/to/raw.json         # custom input

import * as fs from "node:fs";
import * as path from "node:path";

const TOOLS_DIR = import.meta.dirname;

const INPUT_PATH = process.argv[2] || path.join(TOOLS_DIR, "data", "chute_actions.json");

const OUTPUT_PATH = path.join(TOOLS_DIR, "..", "..", "packages", "compiler", "data", "stdlib.json");

const CATEGORY_MAP_PATH = path.join(TOOLS_DIR, "data", "category-map.json");

const CONTENT_TYPES_PATH = path.join(
  TOOLS_DIR,
  "..",
  "..",
  "packages",
  "compiler",
  "data",
  "content-types.json",
);

const TYPE_MAP = {
  WFTextInputParameter: "Text",
  WFNumberFieldParameter: "Number",
  WFSwitchParameter: "Boolean",
  WFEnumerationParameter: "Text",
  WFExpandingParameter: "Any",
  WFVariablePickerParameter: "Any",
  WFDateFieldParameter: "Text",
  WFTimeIntervalParameter: "Number",
  WFStepperParameter: "Number",
  WFSliderParameter: "Number",
  WFContentArrayParameter: "List<Any>",
  WFDictionaryParameter: "Dictionary",
  WFLocationFieldParameter: "Text",
  WFLocationParameter: "Text",
  WFEmailAddressFieldParameter: "Text",
  WFPhoneNumberFieldParameter: "Text",
  WFURLParameter: "Text",
  WFStorageServicePickerParameter: "Text",
  WFCalendarPickerParameter: "Text",
  WFContactFieldParameter: "Text",
  WFContactHandleFieldParameter: "Text",
  WFAppPickerParameter: "Text",
  WFAccountPickerParameter: "Text",
  WFWorkflowPickerParameter: "Text",
  WFQuantityTypePickerParameter: "Text",
  WFUnitTypePickerParameter: "Text",
  WFDynamicEnumerationParameter: "Text",
  WFIntentAppPickerParameter: "Text",
  WFArchiveFormatParameter: "Text",
  WFFilterParameter: "Any",
  WFContentPickerParameter: "Any",
  WFCustomDateFormatParameter: "Text",
  WFCountryFieldParameter: "Text",
  WFNetworkPickerParameter: "Text",
  WFFilePickerParameter: "File",
  WFMediaRoutePickerParameter: "Text",
  WFDurationQuantityFieldParameter: "Number",
  WFColorPickerParameter: "Text",
  WFUnitQuantityFieldParameter: "Number",
  WFHealthQuantityFieldParameter: "Number",
  WFCurrencyQuantityFieldParameter: "Number",
  WFVariableFieldParameter: "Text",
  WFPlaylistPickerParameter: "Text",
  WFPodcastPickerParameter: "Text",
  WFRemindersListPickerParameter: "Text",
  WFPhotoAlbumPickerParameter: "Text",
  WFMapsAppPickerParameter: "Text",
  WFSpeakTextLanguagePickerParameter: "Text",
  WFSpeakTextVoicePickerParameter: "Text",
  WFDictateTextLanguagePickerParameter: "Text",
  WFHomePickerParameter: "Text",
  WFHomeServicePickerParameter: "Text",
  WFHomeCharacteristicPickerParameter: "Text",
  WFHomeAccessoryPickerParameter: "Text",
  WFLocationAccuracyParameter: "Text",
  WFImageConvertFormatPickerParameter: "Text",
  WFMakeImageFromPDFPageImageFormatParameter: "Text",
  WFMakeImageFromPDFPageColorspaceParameter: "Text",
  WFMeasurementUnitPickerParameter: "Text",
  WFDisplayPickerParameter: "Text",
  WFFontPickerParameter: "Text",
  WFMediaPickerParameter: "Media",
  WFOSAScriptEditorParameter: "Text",
  WFTagFieldParameter: "Text",
  WFDynamicTagFieldParameter: "Text",
  WFWorkflowFolderPickerParameter: "Text",
  WFFocusModesPickerParameter: "Text",
  WFFileLabelColorPickerParameter: "Text",
  WFGetDistanceUnitPickerParameter: "Text",
  WFListeningModePickerParameter: "Text",
  WFMailSenderPickerParameter: "Text",
  WFSSHKeyParameter: "Text",
  WFiTunesStoreCountryPickerParameter: "Text",
  WFEvernoteNotebookPickerParameter: "Text",
  WFEvernoteTagsTagFieldParameter: "List<Text>",
  WFTrelloBoardPickerParameter: "Text",
  WFTrelloListPickerParameter: "Text",
  WFSlackChannelPickerParameter: "Text",
  WFTodoistProjectPickerParameter: "Text",
  WFTumblrBlogPickerParameter: "Text",
  WFTumblrComposeInAppParameter: "Boolean",
  WFSearchLocalBusinessesRadiusParameter: "Number",
  WFRideOptionParameter: "Text",
  WFPaymentMethodParameter: "Text",
  WFSpotlightSearchResultTypePickerParameter: "Text",
  WFLightroomPresetPickerParameter: "Text",
  WFFitnessWorkoutTypePickerParameter: "Text",
  WFWorkoutGoalQuantityFieldParameter: "Number",
  WFWorkoutTypePickerParameter: "Text",
  WFHealthQuantityAdditionalFieldParameter: "Number",
  WFHealthQuantityAdditionalPickerParameter: "Text",
  WFHealthCategoryPickerParameter: "Text",
  WFHealthCategoryAdditionalPickerParameter: "Text",
  WFHealthActionStartDateFieldParameter: "Text",
  WFHealthActionEndDateFieldParameter: "Text",
  WFAskLLMModelParameter: "Text",
  WFGenerativeResultTypePickerParameter: "Text",
  WFChooseFromMenuArrayParameter: "List<Any>",
  WFInputTypeParameter: "Text",
  WFInputSurfaceParameter: "Text",
  WFUIRecordingEventParameter: "Any",
  WFAirDropVisibilityParameter: "Text",
  WFDateActionPickerModeParameter: "Text",
  WFDateActionYearPickerParameter: "Text",
  WFHomeAreaPickerParameter: "Text",
  WFLocalePickerParameter: "Text",
  WFPosterPickerParameter: "Text",
  WFTimeZonePickerParameter: "Text",
  WFTranslateTextLanguagePickerParameter: "Text",
  WFVPNPickerParameter: "Text",
};

const PICKER_KEY_TYPE_MAP = {
  WFImage: "Image",
  WFMusic: "Media",
  WFInputGIF: "Media",
  WFContactPhoto: "Image",
  WFImages: "Image",
  WFPlaylistItems: "Media",
  WFMetadataArtwork: "Image",
  WFCustomMaskImage: "Image",
  WFInputMedia: "Media",
  WFMedia: "Media",
  WFHTML: "RichText",
  WFArchive: "File",
  WFDocument: "File",
  WFDictionary: "Dictionary",
  WFWindow: "Window",
  WFEvent: "CalendarEvent",
  WFProduct: "App",
  WFInputEvents: "CalendarEvent",
  WFInputReminders: "Reminder",
  ImageInput: "Image",
  ThumbnailImage: "Image",
  WFParentTask: "Reminder",
  WFTrelloAttachments: "File",
  WFMediaItems: "Media",
};

function toCamelCase(name) {
  return name
    .split(/[\s\-_]+/)
    .filter((w) => w.length > 0)
    .map((word, i) => {
      if (i === 0) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join("");
}

function nameFromIdentifier(identifier) {
  const segments = identifier.replace(/^is\.workflow\.actions\./, "").split(".");
  if (segments.length <= 1) {
    return toCamelCase(segments[0] || identifier);
  }
  const reversed = [...segments].reverse();
  return reversed
    .map((seg, i) => {
      const words = seg.split(/[-_]+/);
      if (i === 0) {
        return words.map((w) => w.toLowerCase()).join("");
      }
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
    })
    .join("");
}

function mapParameter(raw, unmappedClasses) {
  const cls = raw.Class ?? null;
  if (cls && !(cls in TYPE_MAP)) {
    unmappedClasses.add(cls);
  }

  const isEnum = cls === "WFEnumerationParameter" && raw.Items && raw.Items.length > 0;

  let chuteType;
  if (isEnum) {
    chuteType = "Enum";
  } else if (cls === "WFVariablePickerParameter" && raw.Key && PICKER_KEY_TYPE_MAP[raw.Key]) {
    chuteType = PICKER_KEY_TYPE_MAP[raw.Key];
  } else {
    chuteType = TYPE_MAP[cls] ?? "Any";
  }

  const result = {
    key: raw.Key ?? null,
    label: raw.Label ?? null,
    class: cls,
    chuteType,
    required: raw.Required === true,
    defaultValue: raw.DefaultValue ?? null,
  };

  if (raw.Items) {
    result.items = raw.Items;
  }
  if (raw.AllowedValueTypes) {
    result.allowedValueTypes = raw.AllowedValueTypes;
  }
  if (raw.DisallowedVariableTypes) {
    result.disallowedVariableTypes = raw.DisallowedVariableTypes;
  }
  if (raw.RequiredResources) {
    result.requiredResources = raw.RequiredResources;
  }
  if (raw.Description) {
    result.description = raw.Description;
  }
  if (raw.Placeholder) {
    result.placeholder = raw.Placeholder;
  }
  if (raw.Multiline != null) {
    result.multiline = raw.Multiline;
  }
  if (raw.KeyboardType) {
    result.keyboardType = raw.KeyboardType;
  }
  if (raw.TextContentType) {
    result.textContentType = raw.TextContentType;
  }
  if (raw.DisableAutocorrection) {
    result.disableAutocorrection = true;
  }

  return result;
}

const CONTENT_ITEM_PROPERTIES = {
  WFCalendarEventContentItem: [
    "Title",
    "Location",
    "Start Date",
    "End Date",
    "Calendar",
    "Is All Day",
    "Notes",
    "URL",
    "Has Alarms",
    "Duration",
    "Attendees",
    "Organizer",
    "Creation Date",
    "Last Modified Date",
    "Time Zone",
  ],
  WFReminderContentItem: [
    "Title",
    "Is Completed",
    "Completion Date",
    "Due Date",
    "Reminder List",
    "Has Alarms",
    "Priority",
    "Notes",
    "Creation Date",
    "Last Modified Date",
  ],
  WFContactContentItem: [
    "First Name",
    "Middle Name",
    "Last Name",
    "Birthday",
    "Prefix",
    "Suffix",
    "Nickname",
    "Company",
    "Job Title",
    "Department",
    "Email Addresses",
    "Phone Numbers",
    "URLs",
    "Notes",
    "Street Address",
    "City",
    "State",
    "ZIP Code",
    "Country",
    "Has Photo",
    "Photo",
    "Group",
  ],
  WFEKParticipantContentItem: ["Name", "Email Address", "Is Me", "Role", "Status"],
  WFImageContentItem: [
    "Width",
    "Height",
    "Date Taken",
    "Camera Make",
    "Camera Model",
    "Is a Screenshot",
    "Location",
    "Duration",
    "Frame Rate",
    "File Size",
    "File Extension",
    "Name",
    "Album",
    "Media Type",
    "Photo Type",
    "Time Taken",
    "Metadata Dictionary",
    "Is Favorite",
    "Is Hidden",
    "Creation Date",
    "Last Modified Date",
  ],
  WFPhotoMediaContentItem: [
    "Width",
    "Height",
    "Date Taken",
    "Camera Make",
    "Camera Model",
    "Is a Screenshot",
    "Location",
    "Duration",
    "Frame Rate",
    "File Size",
    "File Extension",
    "Name",
    "Album",
    "Media Type",
    "Photo Type",
    "Time Taken",
    "Metadata Dictionary",
    "Is Favorite",
    "Is Hidden",
    "Creation Date",
    "Last Modified Date",
  ],
  WFMPMediaContentItem: [
    "Title",
    "Artist",
    "Album Artist",
    "Album",
    "Genre",
    "Composer",
    "Date Added",
    "Duration",
    "Play Count",
    "Has Album Artwork",
    "Album Artwork",
    "Skip Count",
    "Rating",
    "Comments",
    "Is Explicit",
    "Lyrics",
    "Release Date",
    "Last Played Date",
    "Is Cloud Item",
    "Album Track Number",
    "Disc Number",
  ],
  WFGenericFileContentItem: [
    "Name",
    "File Extension",
    "File Size",
    "Creation Date",
    "Last Modified Date",
    "File Path",
  ],
  WFLocationContentItem: [
    "Name",
    "Street",
    "City",
    "State",
    "ZIP Code",
    "Country",
    "Phone Number",
    "URL",
    "Latitude",
    "Longitude",
    "Altitude",
  ],
  WFArticleContentItem: [
    "Title",
    "Author",
    "Published Date",
    "URL",
    "Number of Words",
    "Main Image URL",
    "Excerpt",
    "Body",
  ],
  WFWeatherDataContentItem: [
    "Date",
    "Condition",
    "Temperature",
    "High Temperature",
    "Low Temperature",
    "Feels Like",
    "Humidity",
    "Visibility",
    "Pressure",
    "Dew Point",
    "UV Index",
    "Wind Speed",
    "Wind Direction",
    "Precipitation Chance",
    "Precipitation Amount",
    "Sunrise Time",
    "Sunset Time",
    "Air Quality Index",
    "Air Quality Category",
    "Location",
  ],
  WFSafariWebPageContentItem: ["Page Contents", "Page Selection", "Page URL", "Name"],
  WFWorkflowContentItem: [
    "Name",
    "Action Count",
    "File Size",
    "Creation Date",
    "Last Modified Date",
    "Folder",
    "Icon",
    "Icon Color",
    "Icon Glyph",
  ],
  WFAppContentItem: ["Name"],
  WFAppStoreAppContentItem: [
    "Name",
    "Artist",
    "Price",
    "Store URL",
    "Store ID",
    "Rating",
    "Rating Count",
    "Release Date",
    "Artwork",
    "Artwork URL",
    "Supported Languages",
    "Is Universal",
    "Category",
    "Description",
    "Version",
    "Release Notes",
    "Content Rating",
    "Minimum OS Version",
    "File Size",
    "Supported Devices",
    "Currency Code",
    "Screenshot URLs",
    "iPad Screenshot URLs",
  ],
};

const SETTER_EXTRA_PARAMS = {
  WFCalendarEventContentItem: [
    {
      property: "Duration",
      params: [
        {
          Key: "WFDurationUnit",
          Label: "Duration Unit",
          Class: "WFEnumerationParameter",
          Items: ["minutes", "hours", "days"],
          DefaultValue: null,
          Required: false,
        },
      ],
    },
  ],
  WFReminderContentItem: [
    {
      property: "Priority",
      params: [
        {
          Key: "WFPriorityLevel",
          Label: "Priority Level",
          Class: "WFEnumerationParameter",
          Items: ["None", "Low", "Medium", "High"],
          DefaultValue: null,
          Required: false,
        },
      ],
    },
  ],
};

function synthesizeSpecialActionTypes(raw) {
  const cls = raw.ActionClass;
  const contentItemClass = raw.WFContentItemClass;
  if (!contentItemClass) {
    return {};
  }

  const properties = CONTENT_ITEM_PROPERTIES[contentItemClass] ?? [];

  if (cls === "WFContentItemFilterAction") {
    const params = [
      {
        Key: "WFContentItemSortProperty",
        Label: "Sort by",
        Class: "WFEnumerationParameter",
        Items: properties,
        DefaultValue: null,
        Required: false,
      },
      {
        Key: "WFContentItemSortOrder",
        Label: "Order",
        Class: "WFEnumerationParameter",
        Items: ["Latest First", "Oldest First"],
        DefaultValue: null,
        Required: false,
      },
      {
        Key: "WFContentItemLimit",
        Label: "Limit",
        Class: "WFSwitchParameter",
        DefaultValue: false,
        Required: false,
      },
      {
        Key: "WFContentItemLimitNumber",
        Label: "Limit",
        Class: "WFStepperParameter",
        DefaultValue: 5,
        Required: false,
      },
    ];

    return {
      parameters: params,
      output: {
        Multiple: true,
        Types: [contentItemClass],
      },
    };
  }

  if (cls === "WFContentItemPropertiesAction") {
    const params =
      properties.length > 0
        ? [
            {
              Key: "WFContentItemPropertyName",
              Label: "Get",
              Class: "WFEnumerationParameter",
              Items: properties,
              DefaultValue: null,
              Required: true,
            },
          ]
        : [];

    return {
      parameters: params,
      input: {
        Multiple: true,
        Required: true,
        Types: [contentItemClass],
      },
    };
  }

  if (cls === "WFContentItemSetterAction") {
    const extraParamDefs = SETTER_EXTRA_PARAMS[contentItemClass] ?? [];
    const specializedProperties = extraParamDefs.map((e) => e.property);

    const overloads = [];

    for (const extra of extraParamDefs) {
      overloads.push({
        parameters: [
          {
            Key: "WFContentItemPropertyName",
            Label: "Property",
            Class: "WFEnumerationParameter",
            Items: [extra.property],
            DefaultValue: null,
            Required: true,
          },
          {
            Key: "WFPropertyValue",
            Label: "Value",
            Class: "WFVariablePickerParameter",
            DefaultValue: null,
            Required: true,
          },
          ...extra.params,
        ],
        output: {
          Multiple: false,
          Types: [contentItemClass],
        },
      });
    }

    const catchAllProperties = properties.filter((p) => !specializedProperties.includes(p));

    if (catchAllProperties.length > 0 || properties.length === 0) {
      overloads.push({
        parameters: [
          {
            Key: "WFContentItemPropertyName",
            Label: "Property",
            Class: "WFEnumerationParameter",
            Items: catchAllProperties.length > 0 ? catchAllProperties : properties,
            DefaultValue: null,
            Required: true,
          },
          {
            Key: "WFPropertyValue",
            Label: "Value",
            Class: "WFVariablePickerParameter",
            DefaultValue: null,
            Required: true,
          },
        ],
        output: {
          Multiple: false,
          Types: [contentItemClass],
        },
      });
    }

    return {
      input: {
        Multiple: false,
        Required: true,
        Types: [contentItemClass],
      },
      output: {
        Multiple: false,
        Types: [contentItemClass],
      },
      overloads: overloads.length > 1 ? overloads : undefined,
      parameters: overloads.length <= 1 && overloads[0] ? overloads[0].parameters : undefined,
    };
  }

  return {};
}

function mapAction(identifier, raw, unmappedClasses) {
  const displayName = raw.Name || raw._intentTitle || identifier.split(".").pop() || identifier;

  const keywords =
    typeof raw.ActionKeywords === "string"
      ? raw.ActionKeywords.split("|").filter((k) => k.length > 0)
      : raw.ActionKeywords || [];

  const synthesized = synthesizeSpecialActionTypes(raw);

  const result = {
    identifier,
    name: toCamelCase(displayName),
    displayName,
    actionClass: raw.ActionClass ?? null,
    description: null,
    keywords,
    parameters: (raw.Parameters || synthesized.parameters || []).map((p) =>
      mapParameter(p, unmappedClasses),
    ),
    input: raw.Input ?? synthesized.input ?? null,
    output: raw.Output ?? synthesized.output ?? null,
    requiredResources: raw.RequiredResources || [],
  };

  if (synthesized.overloads) {
    result.overloads = synthesized.overloads.map((overload) => ({
      parameters: overload.parameters.map((p) => mapParameter(p, unmappedClasses)),
      output: overload.output,
    }));
  }

  if (raw.Description) {
    if (typeof raw.Description === "string") {
      result.description = {
        summary: raw.Description,
        input: null,
        result: null,
      };
    } else {
      result.description = {
        summary: raw.Description.DescriptionSummary ?? null,
        input: raw.Description.DescriptionInput ?? null,
        result: raw.Description.DescriptionResult ?? null,
        note: raw.Description.DescriptionNote ?? null,
      };
    }
  }

  if (raw.ParameterSummary) {
    result.parameterSummary = raw.ParameterSummary;
  }
  if (raw.IconColor) {
    result.iconColor = raw.IconColor;
  }
  if (raw.IconSymbol) {
    result.iconSymbol = raw.IconSymbol;
  }
  if (raw.Hidden) {
    result.hidden = true;
  }
  if (raw.Subcategory) {
    result.subcategory = raw.Subcategory;
  }
  if (raw.BlocksOutput) {
    result.blocksOutput = true;
  }
  if (raw.InputPassthrough) {
    result.inputPassthrough = true;
  }
  if (raw.ResidentCompatible) {
    result.residentCompatible = true;
  }

  if (raw.IntentIdentifier) {
    result.intentIdentifier = raw.IntentIdentifier;
  }
  if (raw.ParameterOverrides) {
    result.parameterOverrides = raw.ParameterOverrides;
  }
  if (raw._intentParameters) {
    result.intentParameters = raw._intentParameters;
  }

  return result;
}

// --- Main ---

if (!fs.existsSync(INPUT_PATH)) {
  console.error(`Input not found: ${INPUT_PATH}`);
  console.error("Run tools/build-and-run.sh on macOS first to generate the raw catalog.");
  process.exit(1);
}

console.log(`Reading ${INPUT_PATH}`);
const rawActions = JSON.parse(fs.readFileSync(INPUT_PATH, "utf-8"));
const rawCount = Object.keys(rawActions).length;
console.log(`Loaded ${rawCount} raw actions.`);

let categoryMap = {};
if (fs.existsSync(CATEGORY_MAP_PATH)) {
  categoryMap = JSON.parse(fs.readFileSync(CATEGORY_MAP_PATH, "utf-8"));
  console.log(`Loaded category map (${Object.keys(categoryMap).length} entries).`);
} else {
  console.warn("No category-map.json found — all actions will be Uncategorized.");
}

const contentTypes = JSON.parse(fs.readFileSync(CONTENT_TYPES_PATH, "utf-8"));
console.log();

const unmappedClasses = new Set();
const actions = {};

function inferPickerTypeFromInput(raw, param) {
  const inputKey = raw.Input?.ParameterKey;
  if (!inputKey || inputKey !== param.key) {
    return null;
  }
  const inputTypes = raw.Input?.Types;
  if (!inputTypes || inputTypes.length === 0) {
    return null;
  }
  const mapped = inputTypes.map((t) => contentTypes[t]).filter(Boolean);
  if (mapped.length === 0) {
    return null;
  }
  const unique = [...new Set(mapped)];
  if (unique.length === 1 && unique[0] !== "Any") {
    return unique[0];
  }
  return null;
}

for (const identifier of Object.keys(rawActions).sort()) {
  const raw = rawActions[identifier];
  const mapped = mapAction(identifier, raw, unmappedClasses);
  mapped.category = categoryMap[identifier] ?? null;

  for (const p of mapped.parameters) {
    if (p.class === "WFVariablePickerParameter" && p.chuteType === "Any" && p.key) {
      const inferred = inferPickerTypeFromInput(raw, p);
      if (inferred) {
        p.chuteType = inferred;
      }
    }
  }

  actions[identifier] = mapped;
}

// --- Resolve name collisions ---
// First pass: find collisions
const nameToIds = new Map();
for (const [id, action] of Object.entries(actions)) {
  const existing = nameToIds.get(action.name);
  if (existing) {
    existing.push(id);
  } else {
    nameToIds.set(action.name, [id]);
  }
}

// Second pass: disambiguate using identifier segments
let collisionsResolved = 0;
for (const [, ids] of nameToIds) {
  if (ids.length <= 1) {
    continue;
  }
  for (const id of ids) {
    const action = actions[id];
    action.name = nameFromIdentifier(id);
    collisionsResolved++;
  }
}

// Verify no remaining collisions
const finalNames = new Map();
const remainingCollisions = [];
for (const [id, action] of Object.entries(actions)) {
  const existing = finalNames.get(action.name);
  if (existing) {
    remainingCollisions.push([action.name, existing, id]);
  } else {
    finalNames.set(action.name, id);
  }
}

const output = {
  version: "1.0",
  extractedAt: new Date().toISOString(),
  source: "WorkflowKit/ActionKit runtime introspection via iOS simulator",
  actions,
};

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + "\n");

// --- Summary ---
const actionCount = Object.keys(actions).length;
const hiddenCount = Object.values(actions).filter((a) => a.hidden).length;
const noParamsCount = Object.values(actions).filter(
  (a) => a.parameters.length === 0 && !a.intentIdentifier,
).length;
const intentCount = Object.values(actions).filter((a) => a.intentIdentifier).length;
const noNameCount = Object.values(actions).filter(
  (a) => !a.displayName || a.displayName === a.identifier.split(".").pop(),
).length;

console.log(`Processed ${actionCount} actions`);
if (hiddenCount > 0) {
  console.log(`  ${hiddenCount} hidden`);
}
if (intentCount > 0) {
  console.log(`  ${intentCount} AppIntents-backed (no Parameters array)`);
}
if (noNameCount > 0) {
  console.log(`  ${noNameCount} with no display name`);
}
if (noParamsCount > 0) {
  console.log(`  ${noParamsCount} with no parameters`);
}
if (collisionsResolved > 0) {
  console.log(`  ${collisionsResolved} names disambiguated via identifier fallback`);
}

const categories = {};
const uncategorized = [];
for (const action of Object.values(actions)) {
  const cat = action.category || "Uncategorized";
  categories[cat] = (categories[cat] || 0) + 1;
  if (!action.category) {
    uncategorized.push(action.identifier);
  }
}

console.log("\nActions per category:");
for (const [cat, count] of Object.entries(categories).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cat}: ${count}`);
}

if (uncategorized.length > 0) {
  console.warn(`\n${uncategorized.length} uncategorized actions:`);
  for (const id of uncategorized) {
    console.warn(`  ${id}`);
  }
}

if (remainingCollisions.length > 0) {
  console.warn(`\nUnresolved name collisions (${remainingCollisions.length}):`);
  for (const [name, id1, id2] of remainingCollisions) {
    console.warn(`  "${name}" <- ${id1}, ${id2}`);
  }
}

if (unmappedClasses.size > 0) {
  console.warn(`\nUnmapped parameter classes (${unmappedClasses.size}, defaulted to Any):`);
  for (const cls of [...unmappedClasses].sort()) {
    console.warn(`  ${cls}`);
  }
}

console.log(`\nOutput: ${OUTPUT_PATH}`);
