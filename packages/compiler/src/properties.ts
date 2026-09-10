import type { ChuteType } from "./checker.ts";

export interface PropertyDefinition {
  chuteName: string;
  shortcutsName: string;
  userInfo: number;
  returnType: ChuteType;
}

// Values are placeholders pending empirical testing on-device.
// The structure is stable; the userInfo numbers may need correction.
const PROPERTY_REGISTRY: ReadonlyMap<string, readonly PropertyDefinition[]> = new Map([
  [
    "Date",
    [
      {
        chuteName: "year",
        shortcutsName: "Year",
        userInfo: 4,
        returnType: { kind: "number" },
      },
      {
        chuteName: "month",
        shortcutsName: "Month",
        userInfo: 5,
        returnType: { kind: "number" },
      },
      {
        chuteName: "day",
        shortcutsName: "Day of Month",
        userInfo: 6,
        returnType: { kind: "number" },
      },
      {
        chuteName: "hour",
        shortcutsName: "Hour",
        userInfo: 7,
        returnType: { kind: "number" },
      },
      {
        chuteName: "minute",
        shortcutsName: "Minute",
        userInfo: 8,
        returnType: { kind: "number" },
      },
      {
        chuteName: "second",
        shortcutsName: "Second",
        userInfo: 9,
        returnType: { kind: "number" },
      },
      {
        chuteName: "weekday",
        shortcutsName: "Day of Week",
        userInfo: 10,
        returnType: { kind: "number" },
      },
    ],
  ],
  [
    "URL",
    [
      {
        chuteName: "scheme",
        shortcutsName: "Scheme",
        userInfo: 4,
        returnType: { kind: "text" },
      },
      {
        chuteName: "host",
        shortcutsName: "Host",
        userInfo: 5,
        returnType: { kind: "text" },
      },
      {
        chuteName: "path",
        shortcutsName: "Path",
        userInfo: 6,
        returnType: { kind: "text" },
      },
      {
        chuteName: "query",
        shortcutsName: "Query",
        userInfo: 7,
        returnType: { kind: "text" },
      },
      {
        chuteName: "fragment",
        shortcutsName: "Fragment",
        userInfo: 8,
        returnType: { kind: "text" },
      },
    ],
  ],
]);

export function getProperty(typeName: string, chuteName: string): PropertyDefinition | undefined {
  const props = PROPERTY_REGISTRY.get(typeName);
  if (!props) {
    return undefined;
  }
  return props.find((p) => p.chuteName === chuteName);
}

export function getProperties(typeName: string): readonly PropertyDefinition[] {
  return PROPERTY_REGISTRY.get(typeName) ?? [];
}

export function getPropertyNames(typeName: string): string[] {
  const props = PROPERTY_REGISTRY.get(typeName);
  if (!props) {
    return [];
  }
  return props.map((p) => p.chuteName);
}
