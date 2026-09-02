import * as fs from "node:fs";
import { Lexer } from "./lexer.ts";
import { Parser } from "./parser.ts";
import { checkActionDeclaration, Scope } from "./checker.ts";
import type { CheckContext, ChuteType } from "./checker.ts";
import type { ActionDeclaration } from "./ast.ts";

const SCRIPTING_SOURCE = `
action showAlert(text WFAlertActionTitle: Text) = "is.workflow.actions.alert";
action showResult(text Text: Text) = "is.workflow.actions.showresult";
action notification(body WFNotificationActionBody: Text, title WFNotificationActionTitle: Text = "Notification") = "is.workflow.actions.notification";
action nothing() = "is.workflow.actions.nothing";
action comment(text WFCommentActionText: Text) = "is.workflow.actions.comment";
action ask(prompt WFAskActionPrompt: Text, defaultAnswer WFAskActionDefaultAnswer: Text = "") -> Text = "is.workflow.actions.ask";
action chooseFromList(list WFInput: List<Text>, prompt WFChooseFromListActionPrompt: Text = "Choose") -> Text = "is.workflow.actions.choosefromlist";
action wait(seconds WFDelayTime: Number = 1) = "is.workflow.actions.delay";
action exitShortcut() = "is.workflow.actions.exit";
action getClipboard() -> Text = "is.workflow.actions.getclipboard";
action setClipboard(value WFInput: Text) = "is.workflow.actions.setclipboard";
action getBatteryLevel() -> Number = "is.workflow.actions.getbatterylevel";
action getCurrentDate() -> Text = "is.workflow.actions.date";
action getDeviceDetails() -> Text = "is.workflow.actions.getdevicedetails";
action count(input WFInput: List<Text>) -> Number = "is.workflow.actions.count";
action base64Encode(input WFInput: Text, mode WFEncodeMode: Text = "Encode") -> Text = "is.workflow.actions.base64encode";
action hash(input WFInput: Text, type WFHashType: Text = "MD5") -> Text = "is.workflow.actions.hash";
action generateUUID() -> Text = "is.workflow.actions.uuid";
action urlEncode(input WFInput: Text, mode WFEncodeMode: Text = "Encode") -> Text = "is.workflow.actions.urlencode";
action runShortcut(name WFWorkflowName: Text) = "is.workflow.actions.runworkflow";
action openApp(app WFAppIdentifier: Text) = "is.workflow.actions.openapp";
`;

const TEXT_SOURCE = `
action getText(text WFTextActionText: Text) -> Text = "is.workflow.actions.gettext";
action changeCase(text WFInput: Text, case WFCaseType: Text = "UPPERCASE") -> Text = "is.workflow.actions.text.changecase";
action replaceText(text WFInput: Text, find WFReplaceTextFind: Text, replace WFReplaceTextReplace: Text) -> Text = "is.workflow.actions.text.replace";
action splitText(text WFInput: Text, separator WFTextSeparator: Text = " ") -> List<Text> = "is.workflow.actions.text.split";
action combineText(list WFInput: List<Text>, separator WFTextSeparator: Text = " ") = "is.workflow.actions.text.combine";
action matchText(text WFInput: Text, pattern WFMatchTextPattern: Text) -> List<Text> = "is.workflow.actions.text.match";
action speak(text WFText: Text, rate WFSpeakTextRate: Number = 0) = "is.workflow.actions.speaktext";
action dictateText() -> Text = "is.workflow.actions.dictatetext";
`;

const WEB_SOURCE = `
action openURL(url WFURL: Text) = "is.workflow.actions.openurl";
action getContentsOfURL(url WFURL: Text, method WFHTTPMethod: Text = "GET") -> Text = "is.workflow.actions.downloadurl";
action searchWeb(query WFSearchQuery: Text) = "is.workflow.actions.searchweb";
action showWebPage(url WFURL: Text) = "is.workflow.actions.showwebpage";
action expandURL(url WFURL: Text) -> Text = "is.workflow.actions.url.expand";
action getURLsFromInput(input WFInput: Text) -> List<Text> = "is.workflow.actions.detect.link";
`;

const SHARING_SOURCE = `
action share(input WFInput: Text) = "is.workflow.actions.share";
`;

const DOCUMENTS_SOURCE = `
action getFile(path WFGetFilePath: Text, service WFFileStorageService: Text = "iCloud Drive") = "is.workflow.actions.documentpicker.open";
action saveFile(input WFInput: Text, path WFFileDestinationPath: Text) = "is.workflow.actions.documentpicker.save";
action deleteFiles(input WFInput: Text) = "is.workflow.actions.file.delete";
action createFolder(path WFFolderPath: Text, service WFFileStorageService: Text = "iCloud Drive") = "is.workflow.actions.file.createfolder";
action renameFile(input WFInput: Text, name WFNewFilename: Text) = "is.workflow.actions.file.rename";
action richTextFromMarkdown(input WFInput: Text) = "is.workflow.actions.getrichtextfrommarkdown";
action markdownFromRichText(input WFInput: Text) = "is.workflow.actions.getmarkdownfromrichtext";
`;

const CALENDAR_SOURCE = `
action addNewEvent(title WFCalendarEventTitle: Text, start WFCalendarEventStartDate: Text, end WFCalendarEventEndDate: Text) = "is.workflow.actions.addnewcalendar";
action getUpcomingEvents(count WFGetUpcomingItemCount: Number = 1) -> List<Text> = "is.workflow.actions.getupcomingevents";
action addNewReminder(title WFReminderTitle: Text, list WFReminderList: Text = "Reminders") = "is.workflow.actions.addnewreminder";
action getUpcomingReminders(count WFGetUpcomingItemCount: Number = 1) -> List<Text> = "is.workflow.actions.getupcomingreminders";
`;

const CONTACTS_SOURCE = `
action selectContact() -> Text = "is.workflow.actions.selectcontact";
action addNewContact(firstName WFContactFirstName: Text, lastName WFContactLastName: Text) = "is.workflow.actions.addnewcontact";
action phone(number WFPhoneNumber: Text) = "is.workflow.actions.phonecall";
`;

const MAPS_SOURCE = `
action getCurrentLocation() -> Text = "is.workflow.actions.getcurrentlocation";
action getDirections(address WFDestination: Text, mode WFGetDirectionsActionMode: Text = "Driving") = "is.workflow.actions.getdirections";
action searchLocalBusiness(query WFSearchQuery: Text) = "is.workflow.actions.searchlocalbusinesses";
`;

const MEDIA_SOURCE = `
action takePicture() = "is.workflow.actions.takephoto";
action selectPhotos(count WFSelectMultiplePhotosCount: Number = 1) -> List<Text> = "is.workflow.actions.selectphoto";
action getLatestPhotos(count WFGetLatestPhotoCount: Number = 1) -> List<Text> = "is.workflow.actions.getlatestphotos";
action saveToPhotoAlbum(input WFInput: Text, album WFPhotoAlbum: Text = "Recents") = "is.workflow.actions.savetocameraroll";
action encodeMedia(input WFInput: Text, format WFMediaFormat: Text = "M4A") = "is.workflow.actions.encodemedia";
action trimMedia(input WFInput: Text) = "is.workflow.actions.trimmedia";
`;

const SETTINGS_SOURCE = `
action setVolume(level WFVolume: Number) = "is.workflow.actions.setvolume";
action setBrightness(level WFBrightness: Number) = "is.workflow.actions.setbrightness";
action setAirplaneMode(enabled WFOnValue: Boolean) = "is.workflow.actions.airplanemode.set";
action setWiFi(enabled WFOnValue: Boolean) = "is.workflow.actions.wifi.set";
action setBluetooth(enabled WFOnValue: Boolean) = "is.workflow.actions.bluetooth.set";
action setDoNotDisturb(enabled WFOnValue: Boolean) = "is.workflow.actions.dnd.set";
action setCellularData(enabled WFOnValue: Boolean) = "is.workflow.actions.cellulardata.set";
action setLowPowerMode(enabled WFOnValue: Boolean) = "is.workflow.actions.lowpowermode.set";
action setAppearance(style WFAppearance: Text) = "is.workflow.actions.appearance";
action setFlashlight(enabled WFOnValue: Boolean) = "is.workflow.actions.flashlight";
`;

const HEALTH_SOURCE = `
action logHealthSample(type WFQuantityType: Text, value WFQuantityValue: Number) = "is.workflow.actions.health.logworkout";
action findHealthSamples(type WFQuantityType: Text, count WFNumberOfSamples: Number = 7) = "is.workflow.actions.health.quantity.get";
`;

const STDLIB_SOURCES: ReadonlyArray<string> = [
  SCRIPTING_SOURCE,
  TEXT_SOURCE,
  WEB_SOURCE,
  SHARING_SOURCE,
  DOCUMENTS_SOURCE,
  CALENDAR_SOURCE,
  CONTACTS_SOURCE,
  MAPS_SOURCE,
  MEDIA_SOURCE,
  SETTINGS_SOURCE,
  HEALTH_SOURCE,
];

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

let cachedScope: Scope | undefined;
let cachedActions: Map<string, ActionDeclaration> | undefined;

function parseStdlib(): ActionDeclaration[] {
  const decls: ActionDeclaration[] = [];

  for (const source of STDLIB_SOURCES) {
    const tokens = new Lexer(source).tokenize();
    const program = new Parser(tokens).parse();

    for (const stmt of program.body) {
      if (stmt.kind === "ActionDeclaration") {
        decls.push(stmt);
      }
    }
  }

  return decls;
}

function createEmptyContext(): CheckContext {
  return {
    expectedReturnType: undefined,
    currentFunction: undefined,
    warnings: [],
    callEdges: [],
  };
}

function buildStdlib(): {
  scope: Scope;
  actions: Map<string, ActionDeclaration>;
} {
  const scope = new Scope(undefined);
  const context = createEmptyContext();
  const actions = new Map<string, ActionDeclaration>();

  for (const decl of parseStdlib()) {
    checkActionDeclaration(decl, scope, context);
    actions.set(decl.name, decl);
  }

  return {
    scope,
    actions,
  };
}

function ensureStdlib(): {
  scope: Scope;
  actions: Map<string, ActionDeclaration>;
} {
  if (!cachedScope || !cachedActions) {
    const built = buildStdlib();
    cachedScope = built.scope;
    cachedActions = built.actions;
  }

  return {
    scope: cachedScope,
    actions: cachedActions,
  };
}

export function getStdlibScope(): Scope {
  return ensureStdlib().scope;
}

export function getStdlibActions(): Map<string, ActionDeclaration> {
  return ensureStdlib().actions;
}

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

function actionTypeFromJson(action: StdlibJsonAction): ChuteType {
  const params: Array<{ label: string; type: ChuteType; hasDefault: boolean }> = [];

  if (action.parameters.length > 0) {
    for (const p of action.parameters) {
      if (!p.key) continue;
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
      if (!key) continue;
      params.push({
        label: key,
        type: INTENT_TYPE_MAP[p.type ?? ""] ?? { kind: "any" },
        hasDefault: true,
      });
    }
  }

  const hasOutput = action.output?.Types && action.output.Types.length > 0;

  return {
    kind: "action",
    name: action.name,
    runtimeIdentifier: action.identifier,
    params,
    returnType: hasOutput ? { kind: "any" } : undefined,
  };
}

let cachedModules: Map<string, Scope> | undefined;

function ensureModules(): Map<string, Scope> {
  if (cachedModules) return cachedModules;

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
