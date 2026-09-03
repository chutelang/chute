import * as fs from "node:fs";
import { Scope } from "./checker.ts";
import type { ChuteType } from "./checker.ts";

export const KNOWN_QUANTITY_UNITS: ReadonlySet<string> = new Set([
  "seconds",
  "minutes",
  "hours",
  "days",
  "weeks",
  "meters",
  "kilometers",
  "miles",
  "feet",
  "inches",
  "yards",
  "grams",
  "kilograms",
  "milligrams",
  "ounces",
  "pounds",
  "liters",
  "milliliters",
  "gallons",
  "cups",
  "pints",
  "quarts",
  "celsius",
  "fahrenheit",
  "kelvin",
  "degrees",
]);

// --- Generated stdlib modules (from stdlib.json) ---

interface StdlibJsonAction {
  identifier: string;
  name: string;
  category: string | null;
  parameters: Array<{
    key: string | null;
    chuteType: string;
    required: boolean;
    defaultValue: unknown;
  }>;
  intentIdentifier?: string;
  intentParameters?: Array<{
    name: string | null;
    type: string | null;
  }>;
  parameterOverrides?: Record<string, { Key?: string }>;
  output?: { Types?: string[] } | null;
}

const CHUTE_TYPE_MAP: Record<string, ChuteType> = {
  Text: { kind: "text" },
  Number: { kind: "number" },
  Boolean: { kind: "boolean" },
  Any: { kind: "any" },
  Dictionary: { kind: "dictionary" },
  "List<Any>": { kind: "list", element: { kind: "any" } },
  "List<Text>": { kind: "list", element: { kind: "text" } },
};

const INTENT_TYPE_MAP: Record<string, ChuteType> = {
  String: { kind: "text" },
  Boolean: { kind: "boolean" },
  Integer: { kind: "number" },
  Decimal: { kind: "number" },
  URL: { kind: "text" },
  DateComponents: { kind: "text" },
};

const CONTENT_TYPE_MAP: Record<string, ChuteType> = {
  NSString: { kind: "text" },
  WFStringContentItem: { kind: "text" },
  NSAttributedString: { kind: "text" },
  NSURL: { kind: "text" },
  WFURLContentItem: { kind: "text" },
  WFEmailAddress: { kind: "text" },
  WFEmailAddressContentItem: { kind: "text" },
  WFPhoneNumber: { kind: "text" },
  WFPhoneNumberContentItem: { kind: "text" },
  WFStreetAddress: { kind: "text" },
  NSDecimalNumber: { kind: "number" },
  NSNumber: { kind: "number" },
  WFNumberContentItem: { kind: "number" },
  NSMeasurement: { kind: "number" },
  WFBooleanContentItem: { kind: "boolean" },
  NSDictionary: { kind: "dictionary" },
  WFDictionaryContentItem: { kind: "dictionary" },
  NSDate: { kind: "text" },
  NSDateComponents: { kind: "text" },
  WFDateContentItem: { kind: "text" },
};

function inferReturnType(output: StdlibJsonAction["output"]): ChuteType | undefined {
  const types = output?.Types;
  if (!types || types.length === 0) {
    return undefined;
  }

  if (types.length === 1) {
    const ft = types[0];
    if (!ft) {
      return { kind: "any" };
    }
    return CONTENT_TYPE_MAP[ft] ?? { kind: "any" };
  }

  const mapped = types.map((t) => CONTENT_TYPE_MAP[t]).filter(Boolean);
  if (mapped.length === 0) {
    return { kind: "any" };
  }

  const first = mapped[0];
  if (!first) {
    return { kind: "any" };
  }
  if (mapped.every((t) => t?.kind === first.kind)) {
    return first;
  }

  return { kind: "any" };
}

function actionTypeFromJson(action: StdlibJsonAction): ChuteType {
  const params: Array<{ label: string; type: ChuteType; hasDefault: boolean }> = [];

  if (action.parameters.length > 0) {
    for (const p of action.parameters) {
      if (!p.key) {
        continue;
      }
      params.push({
        label: p.key,
        type: CHUTE_TYPE_MAP[p.chuteType] ?? { kind: "any" },
        hasDefault: p.defaultValue !== null || !p.required,
      });
    }
  } else {
    const overrides = action.parameterOverrides ?? {};
    for (const p of action.intentParameters ?? []) {
      const key = p.name ? overrides[p.name]?.Key : undefined;
      if (!key) {
        continue;
      }
      params.push({
        label: key,
        type: INTENT_TYPE_MAP[p.type ?? ""] ?? { kind: "any" },
        hasDefault: true,
      });
    }
  }

  const returnType = inferReturnType(action.output);

  return {
    kind: "action",
    name: action.name,
    runtimeIdentifier: action.identifier,
    params,
    returnType,
  };
}

let cachedModules: Map<string, Scope> | undefined;

function ensureModules(): Map<string, Scope> {
  if (cachedModules) {
    return cachedModules;
  }

  const url = new URL("../data/stdlib.json", import.meta.url);
  const raw = JSON.parse(fs.readFileSync(url, "utf-8")) as {
    actions: Record<string, StdlibJsonAction>;
  };

  const byCategory = new Map<string, StdlibJsonAction[]>();
  for (const action of Object.values(raw.actions)) {
    const category = action.category ?? "Uncategorized";
    let list = byCategory.get(category);
    if (!list) {
      list = [];
      byCategory.set(category, list);
    }
    list.push(action);
  }

  cachedModules = new Map();
  for (const [category, actions] of byCategory) {
    const scope = new Scope(undefined);
    for (const action of actions) {
      scope.define(action.name, actionTypeFromJson(action), false);
    }
    cachedModules.set(category, scope);
  }

  return cachedModules;
}

export function getStdlibModule(name: string): Scope | undefined {
  return ensureModules().get(name);
}

export function getStdlibModuleNames(): string[] {
  return [...ensureModules().keys()];
}
