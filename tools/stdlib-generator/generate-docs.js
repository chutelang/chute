#!/usr/bin/env node
//
// Generates stdlib reference docs from packages/compiler/data/stdlib.json.
//
// Usage: node tools/stdlib-generator/generate-docs.js

import * as fs from "node:fs";
import * as path from "node:path";

const TOOLS_DIR = import.meta.dirname;
const STDLIB_PATH = path.join(TOOLS_DIR, "..", "..", "packages", "compiler", "data", "stdlib.json");
const DOCS_DIR = path.join(TOOLS_DIR, "..", "..", "docs", "reference", "stdlib");

const CATEGORY_DESCRIPTIONS = {
  Scripting: "Control flow, variables, logic, prompts, and general shortcut utilities.",
  Text: "Text manipulation, formatting, regex, and speech.",
  Web: "URLs, HTTP requests, web pages, and RSS.",
  Sharing: "Sharing content and social media.",
  Documents: "Files, folders, archives, PDF, and rich text.",
  Calendar: "Events and reminders.",
  Contacts: "Contacts, phone calls, and FaceTime.",
  Maps: "Location, directions, and weather.",
  Media: "Photos, video, audio, camera, and image processing.",
  Settings: "System toggles and device settings.",
  Health: "Health data and workouts.",
  Notification: "Alerts, notifications, and banners.",
  Device: "Device details, clipboard, appearance, and focus modes.",
  HomeKit: "Home automation.",
  Apps: "App-specific integrations.",
  Math: "Calculations, measurements, and unit conversion.",
  Shortcuts: "Running and managing other shortcuts.",
};

const data = JSON.parse(fs.readFileSync(STDLIB_PATH, "utf-8"));

const byCategory = new Map();
for (const action of Object.values(data.actions)) {
  const category = action.category || "Uncategorized";
  let list = byCategory.get(category);
  if (!list) {
    list = [];
    byCategory.set(category, list);
  }
  list.push(action);
}

for (const [, actions] of byCategory) {
  actions.sort((a, b) => a.name.localeCompare(b.name));
}

const INTENT_ENUM_VALUES = {
  BooleanSettingOperation: ["Turn On", "Turn Off", "Toggle"],
  DeviceAppearanceType: ["Light", "Dark"],
  AskForInputType: ["Text", "Number", "URL", "Date", "Time", "Date and Time"],
  ChangeCaseType: ["UPPERCASE", "lowercase", "Capitalize Every Word", "Capitalize with Title Case", "Capitalize with sentence case", "aLtErNaTiNg CaSe"],
  CombineTextSeparator: ["New Lines", "Spaces", "Every Character", "Custom"],
  SplitTextSeparator: ["New Lines", "Spaces", "Every Character", "Custom"],
  MatchTextGetGroupType: ["Group At Index", "All Groups"],
};

function formatType(param) {
  if (param.chuteType === "Enum" && param.items) {
    return param.items.join(" | ");
  }
  if (param.enumType && INTENT_ENUM_VALUES[param.enumType]) {
    return INTENT_ENUM_VALUES[param.enumType].join(" | ");
  }
  return param.chuteType || "Any";
}

function formatTypeSimple(chuteType) {
  return chuteType || "Any";
}

const CONTENT_TYPE_MAP = {
  NSString: "Text",
  WFStringContentItem: "Text",
  NSAttributedString: "Text",
  "public.plain-text": "Text",
  NSURL: "URL",
  WFURLContentItem: "URL",
  WFEmailAddress: "Email",
  WFEmailAddressContentItem: "Email",
  WFPhoneNumber: "Phone",
  WFPhoneNumberContentItem: "Phone",
  WFStreetAddress: "Location",
  CLLocation: "Location",
  WFLocationContentItem: "Location",
  MKMapItem: "Location",
  NSDecimalNumber: "Number",
  NSNumber: "Number",
  WFNumberContentItem: "Number",
  NSMeasurement: "Number",
  WFBooleanContentItem: "Boolean",
  NSDictionary: "Dictionary",
  WFDictionaryContentItem: "Dictionary",
  NSDate: "Date",
  NSDateComponents: "Date",
  WFDateContentItem: "Date",
  WFImage: "Image",
  PHAsset: "Image",
  WFImageContentItem: "Image",
  WFPhotoMediaContentItem: "Image",
  "public.image": "Image",
  WFContact: "Contact",
  WFContactContentItem: "Contact",
  WFArticle: "Article",
  WFArticleContentItem: "Article",
};

function inferReturnType(output) {
  const types = output?.Types;
  if (!types || types.length === 0) return null;
  if (types.length === 1) return CONTENT_TYPE_MAP[types[0]] ?? "Any";
  const mapped = types.map((t) => CONTENT_TYPE_MAP[t]).filter(Boolean);
  if (mapped.length === 0) return "Any";
  if (new Set(mapped).size === 1) return mapped[0];
  return "Any";
}

function formatDefault(value) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return `\`"${value}"\``;
  return String(value);
}

function generateActionDoc(action) {
  const lines = [];

  lines.push(`## \`${action.name}\``);
  lines.push("");

  if (action.description?.summary) {
    lines.push(action.description.summary);
    lines.push("");
  }

  let params = action.parameters.filter((p) => p.key);
  if (params.length === 0 && action.intentParameters) {
    const overrides = action.parameterOverrides ?? {};
    params = action.intentParameters
      .filter((p) => p.name)
      .map((p) => ({
        key: overrides[p.name]?.Key ?? p.name,
        chuteType: p.enumType ?? (p.type === "Boolean" ? "Boolean" : p.type === "Integer" ? "Number" : "Any"),
        enumType: p.enumType ?? undefined,
        required: false,
        defaultValue: null,
      }));
  }
  const returnType = inferReturnType(action.output);
  const returnSuffix = returnType ? ` -> ${returnType}` : "";
  const signature = params.length > 0
    ? `${action.name}(${params.map((p) => formatTypeSimple(p.chuteType)).join(", ")})${returnSuffix}`
    : `${action.name}()${returnSuffix}`;

  lines.push("```chute");
  lines.push(signature);
  lines.push("```");
  lines.push("");

  if (params.length > 0) {
    lines.push("| Parameter | Type | Default |");
    lines.push("| --- | --- | --- |");
    for (const p of params) {
      lines.push(
        `| \`${p.key}\` | ${formatType(p)} | ${formatDefault(p.defaultValue)} |`,
      );
    }
    lines.push("");
  }

  if (action.description?.note) {
    lines.push(`> ${action.description.note}`);
    lines.push("");
  }

  lines.push(`Shortcuts action: \`${action.identifier}\``);
  lines.push("");

  return lines.join("\n");
}

function generateModuleDoc(category, actions) {
  const lines = [];
  const description = CATEGORY_DESCRIPTIONS[category] || "";

  lines.push(`# ${category}`);
  lines.push("");
  if (description) {
    lines.push(description);
    lines.push("");
  }
  lines.push("```chute");
  lines.push(`import ${category};`);
  lines.push("```");
  lines.push("");

  for (const action of actions) {
    lines.push(generateActionDoc(action));
  }

  return lines.join("\n");
}

fs.mkdirSync(DOCS_DIR, { recursive: true });

const existingFiles = fs.readdirSync(DOCS_DIR).filter((f) => f.endsWith(".md"));
for (const file of existingFiles) {
  fs.unlinkSync(path.join(DOCS_DIR, file));
}

const index = [];
for (const [category, actions] of [...byCategory.entries()].sort((a, b) =>
  a[0].localeCompare(b[0]),
)) {
  const filename = `${category.toLowerCase()}.md`;
  const content = generateModuleDoc(category, actions);
  fs.writeFileSync(path.join(DOCS_DIR, filename), content);
  index.push({ category, filename, count: actions.length });
}

const indexLines = [
  "# Standard Library",
  "",
  "Chute's standard library provides access to Siri Shortcuts actions organized into modules.",
  "",
  "```chute",
  "import Scripting;",
  "import Notification;",
  "",
  'Scripting.askForInput("What is your name?");',
  'Notification.showAlert("Hello!");',
  "```",
  "",
  "## Modules",
  "",
  "| Module | Actions | Description |",
  "| --- | --- | --- |",
];

for (const { category, filename, count } of index) {
  const desc = CATEGORY_DESCRIPTIONS[category] || "";
  indexLines.push(`| [${category}](${filename}) | ${count} | ${desc} |`);
}

indexLines.push("");

fs.writeFileSync(path.join(DOCS_DIR, "index.md"), indexLines.join("\n"));

console.log(`Generated ${index.length} module docs + index in ${DOCS_DIR}`);
for (const { category, count } of index) {
  console.log(`  ${category}: ${count} actions`);
}
