import type { ChuteType } from "./checker.ts";

export type InputSlot = "picker" | "field";

interface CoercionTarget {
  actionIdentifier: string;
  inputSlot: InputSlot;
  validSourceKinds: ReadonlySet<string>;
  validOpaqueSources: ReadonlySet<string>;
}

// Untested opaque types pass through canCoerce rather than being rejected.
const TESTED_OPAQUE_SOURCES: ReadonlySet<string> = new Set([
  "Date",
  "URL",
  "Image",
  "Email",
  "Phone",
  "Contact",
  "Location",
]);

// Measured on macOS 26.6.2. See tools/coercion-tester for methodology.
// A pair is valid only when detect.* returns the target type, not a Boolean.
const COERCION_TARGETS: ReadonlyMap<string, CoercionTarget> = new Map([
  [
    "Text",
    {
      actionIdentifier: "is.workflow.actions.detect.text",
      inputSlot: "picker",
      validSourceKinds: new Set(["text", "number", "boolean", "dictionary"]),
      validOpaqueSources: new Set([
        "Date",
        "URL",
        "Image",
        "Email",
        "Phone",
        "Contact",
        "Location",
      ]),
    },
  ],
  [
    "Number",
    {
      actionIdentifier: "is.workflow.actions.detect.number",
      inputSlot: "field",
      // Date yields epoch seconds. Other opaque types return a Boolean, not a Number.
      validSourceKinds: new Set(["text", "number"]),
      validOpaqueSources: new Set(["Date"]),
    },
  ],
  [
    "Dictionary",
    {
      actionIdentifier: "is.workflow.actions.detect.dictionary",
      inputSlot: "picker",
      // Image/Contact/Location yield metadata dictionaries.
      validSourceKinds: new Set(["text", "dictionary"]),
      validOpaqueSources: new Set(["Image", "Contact", "Location"]),
    },
  ],
  [
    "Date",
    {
      actionIdentifier: "is.workflow.actions.detect.date",
      inputSlot: "picker",
      // Numbers don't parse as dates at any magnitude.
      validSourceKinds: new Set(["text"]),
      validOpaqueSources: new Set(["Date"]),
    },
  ],
  [
    "URL",
    {
      actionIdentifier: "is.workflow.actions.detect.link",
      inputSlot: "field",
      // Email/Phone produce mailto:/tel: links. Location produces a Maps link.
      validSourceKinds: new Set(["text"]),
      validOpaqueSources: new Set(["URL", "Email", "Phone", "Contact", "Location"]),
    },
  ],
  [
    "Image",
    {
      actionIdentifier: "is.workflow.actions.detect.images",
      inputSlot: "picker",
      // Almost everything renders to an image. URL is the exception.
      validSourceKinds: new Set(["text", "number", "boolean", "dictionary"]),
      validOpaqueSources: new Set(["Date", "Image", "Email", "Phone", "Contact", "Location"]),
    },
  ],
  [
    "Email",
    {
      actionIdentifier: "is.workflow.actions.detect.emailaddress",
      inputSlot: "field",
      validSourceKinds: new Set(["text"]),
      validOpaqueSources: new Set(["Email", "Contact"]),
    },
  ],
  [
    "Phone",
    {
      actionIdentifier: "is.workflow.actions.detect.phonenumber",
      inputSlot: "field",
      validSourceKinds: new Set(["text"]),
      validOpaqueSources: new Set(["Phone", "Contact"]),
    },
  ],
  [
    "Contact",
    {
      actionIdentifier: "is.workflow.actions.detect.contacts",
      inputSlot: "picker",
      // Nothing coerces to Contact. Not a permissions issue.
      validSourceKinds: new Set(),
      validOpaqueSources: new Set(["Contact"]),
    },
  ],
  [
    "Location",
    {
      actionIdentifier: "is.workflow.actions.detect.address",
      inputSlot: "picker",
      validSourceKinds: new Set(["text"]),
      validOpaqueSources: new Set(["Contact", "Location"]),
    },
  ],
]);

export function getCoercionAction(targetName: string): string | undefined {
  return COERCION_TARGETS.get(targetName)?.actionIdentifier;
}

export function getCoercionInputSlot(targetName: string): InputSlot | undefined {
  return COERCION_TARGETS.get(targetName)?.inputSlot;
}

function acceptsSource(target: CoercionTarget, source: ChuteType): boolean {
  if (source.kind === "opaque") {
    if (!TESTED_OPAQUE_SOURCES.has(source.name)) {
      return true;
    }
    return target.validOpaqueSources.has(source.name);
  }
  return target.validSourceKinds.has(source.kind);
}

export function canCoerce(source: ChuteType, targetName: string): boolean {
  if (source.kind === "any") {
    return true;
  }

  const target = COERCION_TARGETS.get(targetName);
  if (!target) {
    return false;
  }

  const inner = source.kind === "optional" ? source.inner : source;
  if (inner.kind === "any") {
    return true;
  }

  return acceptsSource(target, inner);
}

export function getValidTargets(source: ChuteType): string[] {
  if (source.kind === "any") {
    return [...COERCION_TARGETS.keys()];
  }

  const inner = source.kind === "optional" ? source.inner : source;
  if (inner.kind === "any") {
    return [...COERCION_TARGETS.keys()];
  }

  const targets: string[] = [];
  for (const [name, target] of COERCION_TARGETS) {
    if (acceptsSource(target, inner)) {
      targets.push(name);
    }
  }
  return targets;
}
