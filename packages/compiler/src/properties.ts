import type { ChuteType } from "./checker.ts";

export type LoweringStrategy =
  | { kind: "property"; userInfo?: number | string }
  | { kind: "dateFormat"; format: string }
  | { kind: "urlComponent"; component: string };

export interface PropertyDefinition {
  chuteName: string;
  shortcutsName: string;
  lowering: LoweringStrategy;
  returnType: ChuteType;
}

const PROPERTY_REGISTRY: ReadonlyMap<string, readonly PropertyDefinition[]> = new Map([
  [
    "Date",
    [
      {
        chuteName: "year",
        shortcutsName: "Year",
        lowering: { kind: "dateFormat", format: "yyyy" },
        returnType: { kind: "text" },
      },
      {
        chuteName: "month",
        shortcutsName: "Month",
        lowering: { kind: "dateFormat", format: "MM" },
        returnType: { kind: "text" },
      },
      {
        chuteName: "day",
        shortcutsName: "Day of Month",
        lowering: { kind: "dateFormat", format: "dd" },
        returnType: { kind: "text" },
      },
      {
        chuteName: "hour",
        shortcutsName: "Hour",
        lowering: { kind: "dateFormat", format: "HH" },
        returnType: { kind: "text" },
      },
      {
        chuteName: "minute",
        shortcutsName: "Minute",
        lowering: { kind: "dateFormat", format: "mm" },
        returnType: { kind: "text" },
      },
      {
        chuteName: "second",
        shortcutsName: "Second",
        lowering: { kind: "dateFormat", format: "ss" },
        returnType: { kind: "text" },
      },
      {
        chuteName: "weekday",
        shortcutsName: "Day of Week",
        lowering: { kind: "dateFormat", format: "EEEE" },
        returnType: { kind: "text" },
      },
    ],
  ],
  [
    "URL",
    [
      {
        chuteName: "scheme",
        shortcutsName: "Scheme",
        lowering: { kind: "urlComponent", component: "Scheme" },
        returnType: { kind: "text" },
      },
      {
        chuteName: "host",
        shortcutsName: "Host",
        lowering: { kind: "urlComponent", component: "Host" },
        returnType: { kind: "text" },
      },
      {
        chuteName: "path",
        shortcutsName: "Path",
        lowering: { kind: "urlComponent", component: "Path" },
        returnType: { kind: "text" },
      },
      {
        chuteName: "query",
        shortcutsName: "Query",
        lowering: { kind: "urlComponent", component: "Query" },
        returnType: { kind: "text" },
      },
      {
        chuteName: "fragment",
        shortcutsName: "Fragment",
        lowering: { kind: "urlComponent", component: "Fragment" },
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
