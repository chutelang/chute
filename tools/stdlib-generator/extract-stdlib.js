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

const INPUT_PATH =
  process.argv[2] ||
  path.join(TOOLS_DIR, "data", "chute_actions.json");

const OUTPUT_PATH = path.join(
  TOOLS_DIR,
  "..",
  "..",
  "packages",
  "compiler",
  "data",
  "stdlib.json",
);

const CATEGORY_MAP_PATH = path.join(TOOLS_DIR, "data", "category-map.json");

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
  WFFilePickerParameter: "Any",
  WFMediaRoutePickerParameter: "Text",
  WFDurationQuantityFieldParameter: "Number",
  WFColorPickerParameter: "Text",
  WFUnitQuantityFieldParameter: "Number",
  WFHealthQuantityFieldParameter: "Number",
  WFCurrencyQuantityFieldParameter: "Number",
  WFVariableFieldParameter: "Any",
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
  WFMediaPickerParameter: "Any",
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

function toCamelCase(name) {
  return name
    .split(/[\s\-_]+/)
    .filter((w) => w.length > 0)
    .map((word, i) => {
      if (i === 0) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join("");
}

function nameFromIdentifier(identifier) {
  const segments = identifier.replace(/^is\.workflow\.actions\./, "").split(".");
  if (segments.length <= 1) return toCamelCase(segments[0] || identifier);
  const reversed = [...segments].reverse();
  return reversed
    .map((seg, i) => {
      const words = seg.split(/[\-_]+/);
      if (i === 0) return words.map((w) => w.toLowerCase()).join("");
      return words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join("");
    })
    .join("");
}

function mapParameter(raw, unmappedClasses) {
  const cls = raw.Class ?? null;
  if (cls && !(cls in TYPE_MAP)) {
    unmappedClasses.add(cls);
  }

  const result = {
    key: raw.Key ?? null,
    label: raw.Label ?? null,
    class: cls,
    chuteType: TYPE_MAP[cls] ?? "Any",
    required: raw.Required === true,
    defaultValue: raw.DefaultValue ?? null,
  };

  if (raw.Items) result.items = raw.Items;
  if (raw.AllowedValueTypes) result.allowedValueTypes = raw.AllowedValueTypes;
  if (raw.DisallowedVariableTypes)
    result.disallowedVariableTypes = raw.DisallowedVariableTypes;
  if (raw.RequiredResources) result.requiredResources = raw.RequiredResources;
  if (raw.Description) result.description = raw.Description;
  if (raw.Placeholder) result.placeholder = raw.Placeholder;
  if (raw.Multiline != null) result.multiline = raw.Multiline;
  if (raw.KeyboardType) result.keyboardType = raw.KeyboardType;
  if (raw.TextContentType) result.textContentType = raw.TextContentType;
  if (raw.DisableAutocorrection) result.disableAutocorrection = true;

  return result;
}

function mapAction(identifier, raw, unmappedClasses) {
  const displayName =
    raw.Name ||
    raw._intentTitle ||
    identifier.split(".").pop() ||
    identifier;

  const keywords =
    typeof raw.ActionKeywords === "string"
      ? raw.ActionKeywords.split("|").filter((k) => k.length > 0)
      : raw.ActionKeywords || [];

  const result = {
    identifier,
    name: toCamelCase(displayName),
    displayName,
    actionClass: raw.ActionClass ?? null,
    description: null,
    keywords,
    parameters: (raw.Parameters || []).map((p) =>
      mapParameter(p, unmappedClasses),
    ),
    input: raw.Input ?? null,
    output: raw.Output ?? null,
    requiredResources: raw.RequiredResources || [],
  };

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

  if (raw.ParameterSummary) result.parameterSummary = raw.ParameterSummary;
  if (raw.IconColor) result.iconColor = raw.IconColor;
  if (raw.IconSymbol) result.iconSymbol = raw.IconSymbol;
  if (raw.Hidden) result.hidden = true;
  if (raw.Subcategory) result.subcategory = raw.Subcategory;
  if (raw.BlocksOutput) result.blocksOutput = true;
  if (raw.InputPassthrough) result.inputPassthrough = true;
  if (raw.ResidentCompatible) result.residentCompatible = true;

  if (raw.IntentIdentifier) result.intentIdentifier = raw.IntentIdentifier;
  if (raw.ParameterOverrides) result.parameterOverrides = raw.ParameterOverrides;
  if (raw._intentParameters) result.intentParameters = raw._intentParameters;

  return result;
}

// --- Main ---

if (!fs.existsSync(INPUT_PATH)) {
  console.error(`Input not found: ${INPUT_PATH}`);
  console.error(
    "Run tools/build-and-run.sh on macOS first to generate the raw catalog.",
  );
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
console.log();

const unmappedClasses = new Set();
const actions = {};

for (const identifier of Object.keys(rawActions).sort()) {
  const raw = rawActions[identifier];
  const mapped = mapAction(identifier, raw, unmappedClasses);
  mapped.category = categoryMap[identifier] ?? null;
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
  if (ids.length <= 1) continue;
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
const intentCount = Object.values(actions).filter(
  (a) => a.intentIdentifier,
).length;
const noNameCount = Object.values(actions).filter(
  (a) => !a.displayName || a.displayName === a.identifier.split(".").pop(),
).length;

console.log(`Processed ${actionCount} actions`);
if (hiddenCount > 0) console.log(`  ${hiddenCount} hidden`);
if (intentCount > 0)
  console.log(`  ${intentCount} AppIntents-backed (no Parameters array)`);
if (noNameCount > 0) console.log(`  ${noNameCount} with no display name`);
if (noParamsCount > 0)
  console.log(`  ${noParamsCount} with no parameters`);
if (collisionsResolved > 0)
  console.log(
    `  ${collisionsResolved} names disambiguated via identifier fallback`,
  );

const categories = {};
const uncategorized = [];
for (const action of Object.values(actions)) {
  const cat = action.category || "Uncategorized";
  categories[cat] = (categories[cat] || 0) + 1;
  if (!action.category) uncategorized.push(action.identifier);
}

console.log("\nActions per category:");
for (const [cat, count] of Object.entries(categories).sort(
  (a, b) => b[1] - a[1],
)) {
  console.log(`  ${cat}: ${count}`);
}

if (uncategorized.length > 0) {
  console.warn(`\n${uncategorized.length} uncategorized actions:`);
  for (const id of uncategorized) console.warn(`  ${id}`);
}

if (remainingCollisions.length > 0) {
  console.warn(`\nUnresolved name collisions (${remainingCollisions.length}):`);
  for (const [name, id1, id2] of remainingCollisions) {
    console.warn(`  "${name}" <- ${id1}, ${id2}`);
  }
}

if (unmappedClasses.size > 0) {
  console.warn(
    `\nUnmapped parameter classes (${unmappedClasses.size}, defaulted to Any):`,
  );
  for (const cls of [...unmappedClasses].sort()) {
    console.warn(`  ${cls}`);
  }
}

console.log(`\nOutput: ${OUTPUT_PATH}`);
