export interface ShortcutIR {
  name: string;
  actions: ActionIR[];
}

export interface CompilationResult {
  main: ShortcutIR;
  subShortcuts: ShortcutIR[];
}

export interface ActionIR {
  identifier: string;
  uuid: string;
  parameters: Map<string, ParameterValue>;
  groupingIdentifier?: string | undefined;
}

export type ParameterValue = string | number | boolean | VariableRef | InterpolatedText;

export type Aggrandizement =
  | { kind: "coercion"; itemClass: string }
  | { kind: "property"; name: string; userInfo: number };

export interface VariableRef {
  kind: "VariableRef";
  name: string;
  aggrandizements?: Aggrandizement[];
}

export interface InterpolatedText {
  kind: "InterpolatedText";
  parts: InterpolatedTextPart[];
}

export type InterpolatedTextPart =
  | { kind: "text"; value: string }
  | { kind: "variable"; name: string; aggrandizements?: Aggrandizement[] };
