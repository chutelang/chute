import type { ChuteType } from "./checker.ts";

interface CoercionTarget {
  actionIdentifier: string;
  validSourceKinds: ReadonlySet<string>;
}

// The `validSourceKinds` entries are placeholder pairs. They will be refined
// with empirical testing on macOS (Task 8). The structure allows easy updates.
const COERCION_TARGETS: ReadonlyMap<string, CoercionTarget> = new Map([
  [
    "Text",
    {
      actionIdentifier: "is.workflow.actions.detect.text",
      validSourceKinds: new Set(["number", "boolean", "dictionary", "opaque"]),
    },
  ],
  [
    "Number",
    {
      actionIdentifier: "is.workflow.actions.detect.number",
      validSourceKinds: new Set(["text"]),
    },
  ],
  [
    "Dictionary",
    {
      actionIdentifier: "is.workflow.actions.detect.dictionary",
      validSourceKinds: new Set(["text"]),
    },
  ],
  [
    "Date",
    {
      actionIdentifier: "is.workflow.actions.detect.date",
      validSourceKinds: new Set(["text", "number"]),
    },
  ],
  [
    "URL",
    {
      actionIdentifier: "is.workflow.actions.detect.link",
      validSourceKinds: new Set(["text"]),
    },
  ],
  [
    "Image",
    {
      actionIdentifier: "is.workflow.actions.detect.images",
      validSourceKinds: new Set(["text", "opaque"]),
    },
  ],
  [
    "Email",
    {
      actionIdentifier: "is.workflow.actions.detect.emailaddress",
      validSourceKinds: new Set(["text", "opaque"]),
    },
  ],
  [
    "Phone",
    {
      actionIdentifier: "is.workflow.actions.detect.phonenumber",
      validSourceKinds: new Set(["text", "opaque"]),
    },
  ],
  [
    "Contact",
    {
      actionIdentifier: "is.workflow.actions.detect.contacts",
      validSourceKinds: new Set(["text", "opaque"]),
    },
  ],
  [
    "Location",
    {
      actionIdentifier: "is.workflow.actions.detect.address",
      validSourceKinds: new Set(["text", "opaque"]),
    },
  ],
]);

export function getCoercionAction(targetName: string): string | undefined {
  return COERCION_TARGETS.get(targetName)?.actionIdentifier;
}

export function canCoerce(source: ChuteType, targetName: string): boolean {
  if (source.kind === "any") {
    return true;
  }

  const target = COERCION_TARGETS.get(targetName);
  if (!target) {
    return false;
  }

  const sourceKind = source.kind === "optional" ? source.inner.kind : source.kind;
  return target.validSourceKinds.has(sourceKind);
}

export function getValidTargets(source: ChuteType): string[] {
  if (source.kind === "any") {
    return [...COERCION_TARGETS.keys()];
  }

  const sourceKind = source.kind === "optional" ? source.inner.kind : source.kind;
  const targets: string[] = [];
  for (const [name, target] of COERCION_TARGETS) {
    if (target.validSourceKinds.has(sourceKind)) {
      targets.push(name);
    }
  }
  return targets;
}
