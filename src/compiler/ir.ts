export interface ShortcutIR {
  name: string;
  actions: ActionIR[];
}

export interface ActionIR {
  identifier: string;
  uuid: string;
  parameters: Map<string, ParameterValue>;
  groupingIdentifier?: string | undefined;
}

export type ParameterValue = string | number | boolean | VariableRef | InterpolatedText;

export interface VariableRef {
  kind: "VariableRef";
  name: string;
}

export interface InterpolatedText {
  kind: "InterpolatedText";
  parts: InterpolatedTextPart[];
}

export type InterpolatedTextPart =
  | { kind: "text"; value: string }
  | { kind: "variable"; name: string };
