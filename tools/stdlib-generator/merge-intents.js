#!/usr/bin/env node
//
// Join Actions.intentdefinition metadata onto the extracted action registry.
//
// The ActionKit-provided actions are AppIntents/SiriKit-backed: their definition
// carries IntentIdentifier + ParameterOverrides instead of a Parameters array,
// and often no Name at all. The display name, description and typed parameter
// list for those live in ActionKit's Actions.intentdefinition (25 intents).
//
// Join key: INIntentClassPrefix + INIntentName + "Intent" matches the last
// dot-component of IntentIdentifier.
//
// Usage: node merge-intents.js <actions_sim.json> <intents.json> <out.json>

import * as fs from "node:fs";

const [actionsPath, intentsPath, outPath] = process.argv.slice(2);
if (!actionsPath || !intentsPath || !outPath) {
  console.error("usage: node merge-intents.js <actions.json> <intents.json> <out.json>");
  process.exit(2);
}

const actions = JSON.parse(fs.readFileSync(actionsPath, "utf-8"));
const idef = JSON.parse(fs.readFileSync(intentsPath, "utf-8"));

const byClass = new Map();
for (const intent of idef.INIntents) {
  const cls = (intent.INIntentClassPrefix || "") + intent.INIntentName + "Intent";
  byClass.set(cls, intent);
}

let joined = 0;
let filled = 0;

for (const action of Object.values(actions)) {
  const iid = action.IntentIdentifier;
  if (!iid) continue;

  const className = iid.split(".").pop();
  const intent = byClass.get(className);
  if (!intent) continue;

  joined++;

  action._intentTitle = intent.INIntentTitle ?? null;
  action._intentDescription = intent.INIntentDescription ?? null;
  action._intentParameters = (intent.INIntentParameters || []).map((p) => ({
    name: p.INIntentParameterName ?? null,
    displayName: p.INIntentParameterDisplayName ?? null,
    type: p.INIntentParameterType ?? null,
    enumType: p.INIntentParameterEnumType ?? null,
    default: p.INIntentParameterDefaultValue ?? null,
  }));

  if (!action.Name) {
    action.Name = intent.INIntentTitle ?? null;
    filled++;
  }

  if (!action.Description && intent.INIntentDescription) {
    action.Description = { DescriptionSummary: intent.INIntentDescription };
  }
}

fs.writeFileSync(outPath, JSON.stringify(actions, null, 2) + "\n");
console.log(`joined=${joined} names_filled=${filled} total=${Object.keys(actions).length} -> ${outPath}`);
