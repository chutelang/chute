export interface ShortcutIR {
  name: string;
  actions: ActionIR[];
}

export interface ActionIR {
  identifier: string;
  parameters: Map<string, ParameterValue>;
}

export type ParameterValue = string | number | boolean;
