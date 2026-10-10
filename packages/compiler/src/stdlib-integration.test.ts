import { describe, expect, it } from "vitest";
import { compile } from "./pipeline.ts";

function actions(plist: string): string[] {
  return [
    ...plist.matchAll(/<key>WFWorkflowActionIdentifier<\/key>\s*<string>(.*?)<\/string>/g),
  ].map((m) => m[1] ?? "");
}

function paramValue(plist: string, actionId: string, key: string): string | undefined {
  const actionPattern = new RegExp(
    `<key>WFWorkflowActionIdentifier</key>\\s*<string>${actionId.replace(/\./g, "\\.")}</string>[\\s\\S]*?<key>WFWorkflowActionParameters</key>\\s*<dict>([\\s\\S]*?)</dict>`,
    "g",
  );
  for (const match of plist.matchAll(actionPattern)) {
    const params = match[1] ?? "";
    const keyPattern = new RegExp(
      `<key>${key}</key>\\s*<(string|integer|real|true|false)(?:\\s*/)?>([^<]*)<`,
    );
    const valueMatch = params.match(keyPattern);
    if (valueMatch) {
      const tag = valueMatch[1];
      if (tag === "true") {
        return "true";
      }
      if (tag === "false") {
        return "false";
      }
      return valueMatch[2];
    }
  }
  return undefined;
}

describe("stdlib integration", () => {
  describe("Notification module", () => {
    it("should compile showAlert with message as first positional arg", () => {
      const plist = compile(`import Notification;
shortcut { name: "T" }
Notification.showAlert("Something happened");`).main;
      expect(paramValue(plist, "is.workflow.actions.alert", "WFAlertActionMessage")).toBe(
        "Something happened",
      );
    });

    it("should compile showAlert with message and title positionally", () => {
      const plist = compile(`import Notification;
shortcut { name: "T" }
Notification.showAlert("Body text", "Title text");`).main;
      expect(paramValue(plist, "is.workflow.actions.alert", "WFAlertActionMessage")).toBe(
        "Body text",
      );
      expect(paramValue(plist, "is.workflow.actions.alert", "WFAlertActionTitle")).toBe(
        "Title text",
      );
    });

    it("should compile showNotification with body as first positional arg", () => {
      const plist = compile(`import Notification;
shortcut { name: "T" }
Notification.showNotification("Done!");`).main;
      expect(
        paramValue(plist, "is.workflow.actions.notification", "WFNotificationActionBody"),
      ).toBe("Done!");
    });

    it("should compile showResult", () => {
      const plist = compile(`import Notification;
shortcut { name: "T" }
Notification.showResult("Result text");`).main;
      expect(actions(plist)).toContain("is.workflow.actions.showresult");
    });
  });

  describe("Scripting module", () => {
    it("should compile wait with seconds", () => {
      const plist = compile(`import Scripting;
shortcut { name: "T" }
Scripting.wait(30);`).main;
      expect(paramValue(plist, "is.workflow.actions.delay", "WFDelayTime")).toBe("30");
    });

    it("should compile askForInput with prompt", () => {
      const plist = compile(`import Scripting;
shortcut { name: "T" }
const name = Scripting.askForInput("What is your name?");`).main;
      expect(actions(plist)).toContain("is.workflow.actions.ask");
    });

    it("should compile chooseFromList with list input", () => {
      const plist = compile(`import Scripting;
shortcut { name: "T" }
const items = ["a", "b", "c"];
const picked = Scripting.chooseFromList(items);`).main;
      expect(actions(plist)).toContain("is.workflow.actions.choosefromlist");
    });

    it("should compile dictionary literal", () => {
      const plist = compile(`import Scripting;
shortcut { name: "T" }
const d = Scripting.dictionary({"key": "value"});`).main;
      expect(actions(plist)).toContain("is.workflow.actions.dictionary");
    });

    it("should compile base64Encode", () => {
      const plist = compile(`import Scripting;
shortcut { name: "T" }
const encoded = Scripting.base64Encode("hello");`).main;
      expect(actions(plist)).toContain("is.workflow.actions.base64encode");
    });

    it("should compile generateHash with file input", () => {
      const plist = compile(`import Scripting;
import Documents;
shortcut { name: "T" }
const f = Documents.selectFile();
const hash = Scripting.generateHash(f);`).main;
      expect(actions(plist)).toContain("is.workflow.actions.hash");
    });

    it("should compile count", () => {
      const plist = compile(`import Scripting;
shortcut { name: "T" }
const items = ["a", "b"];
const n = Scripting.count(items);`).main;
      expect(actions(plist)).toContain("is.workflow.actions.count");
    });

    it("should compile getItemFromList", () => {
      const plist = compile(`import Scripting;
shortcut { name: "T" }
const items = ["a", "b", "c"];
const first = Scripting.getItemFromList(items);`).main;
      expect(actions(plist)).toContain("is.workflow.actions.getitemfromlist");
    });
  });

  describe("Text module", () => {
    it("should compile replaceText with positional args", () => {
      const plist = compile(`import Text;
shortcut { name: "T" }
const result = Text.replaceText("foo bar foo", "foo", "baz");`).main;
      expect(actions(plist)).toContain("is.workflow.actions.text.replace");
      expect(paramValue(plist, "is.workflow.actions.text.replace", "WFReplaceTextFind")).toBe(
        "foo",
      );
      expect(paramValue(plist, "is.workflow.actions.text.replace", "WFReplaceTextReplace")).toBe(
        "baz",
      );
    });

    it("should compile trimWhitespace", () => {
      const plist = compile(`import Text;
shortcut { name: "T" }
const trimmed = Text.trimWhitespace("  hello  ");`).main;
      expect(actions(plist)).toContain("is.workflow.actions.text.trimwhitespace");
    });

    it("should compile detectLanguage", () => {
      const plist = compile(`import Text;
shortcut { name: "T" }
const lang = Text.detectLanguage("Bonjour");`).main;
      expect(actions(plist)).toContain("is.workflow.actions.detectlanguage");
    });
  });

  describe("Web module", () => {
    it("should compile getContentsOfUrl", () => {
      const plist = compile(`import Web;
shortcut { name: "T" }
const data = Web.getContentsOfUrl("https://api.example.com");`).main;
      expect(actions(plist)).toContain("is.workflow.actions.downloadurl");
      expect(paramValue(plist, "is.workflow.actions.downloadurl", "WFURL")).toBe(
        "https://api.example.com",
      );
    });

    it("should compile openUrls", () => {
      const plist = compile(`import Web;
shortcut { name: "T" }
Web.openUrls("https://example.com");`).main;
      expect(actions(plist)).toContain("is.workflow.actions.openurl");
    });

    it("should compile searchWeb", () => {
      const plist = compile(`import Web;
shortcut { name: "T" }
Web.searchWeb("chute lang");`).main;
      expect(actions(plist)).toContain("is.workflow.actions.searchweb");
    });

    it("should compile url literal", () => {
      const plist = compile(`import Web;
shortcut { name: "T" }
const link = Web.url("https://example.com");`).main;
      expect(actions(plist)).toContain("is.workflow.actions.url");
    });
  });

  describe("Device module", () => {
    it("should compile getClipboard and copyToClipboard round-trip", () => {
      const plist = compile(`import Device;
shortcut { name: "T" }
const clip = Device.getClipboard();
Device.copyToClipboard(clip);`).main;
      const ids = actions(plist);
      expect(ids).toContain("is.workflow.actions.getclipboard");
      expect(ids).toContain("is.workflow.actions.setclipboard");
    });

    it("should compile getBatteryStatus", () => {
      const plist = compile(`import Device;
shortcut { name: "T" }
const level = Device.getBatteryStatus();`).main;
      expect(actions(plist)).toContain("is.workflow.actions.getbatterylevel");
    });

    it("should compile vibrateDevice", () => {
      const plist = compile(`import Device;
shortcut { name: "T" }
Device.vibrateDevice();`).main;
      expect(actions(plist)).toContain("is.workflow.actions.vibrate");
    });

    it("should compile lockScreen", () => {
      const plist = compile(`import Device;
shortcut { name: "T" }
Device.lockScreen();`).main;
      expect(actions(plist)).toContain("is.workflow.actions.lockscreen");
    });

    it("should compile getDeviceDetails", () => {
      const plist = compile(`import Device;
shortcut { name: "T" }
const name = Device.getDeviceDetails();`).main;
      expect(actions(plist)).toContain("is.workflow.actions.getdevicedetails");
    });
  });

  describe("Calendar module", () => {
    it("should compile newEvent with title", () => {
      const plist = compile(`import Calendar;
shortcut { name: "T" }
Calendar.newEvent("Meeting");`).main;
      expect(actions(plist)).toContain("is.workflow.actions.addnewevent");
      expect(paramValue(plist, "is.workflow.actions.addnewevent", "WFCalendarItemTitle")).toBe(
        "Meeting",
      );
    });

    it("should compile newReminder", () => {
      const plist = compile(`import Calendar;
shortcut { name: "T" }
Calendar.newReminder("Buy milk");`).main;
      expect(actions(plist)).toContain("is.workflow.actions.addnewreminder");
    });

    it("should compile getUpcomingEvents", () => {
      const plist = compile(`import Calendar;
shortcut { name: "T" }
const events = Calendar.getUpcomingEvents();`).main;
      expect(actions(plist)).toContain("is.workflow.actions.getupcomingevents");
    });
  });

  describe("Maps module", () => {
    it("should compile getCurrentLocation", () => {
      const plist = compile(`import Maps;
shortcut { name: "T" }
const loc = Maps.getCurrentLocation();`).main;
      expect(actions(plist)).toContain("is.workflow.actions.getcurrentlocation");
    });

    it("should compile getCurrentWeather", () => {
      const plist = compile(`import Maps;
shortcut { name: "T" }
const weather = Maps.getCurrentWeather();`).main;
      expect(actions(plist)).toContain("is.workflow.actions.weather.currentconditions");
    });
  });

  describe("Math module", () => {
    it("should compile randomNumber with min and max", () => {
      const plist = compile(`import Math;
shortcut { name: "T" }
const n = Math.randomNumber(1, 100);`).main;
      expect(actions(plist)).toContain("is.workflow.actions.number.random");
      expect(paramValue(plist, "is.workflow.actions.number.random", "WFRandomNumberMinimum")).toBe(
        "1",
      );
      expect(paramValue(plist, "is.workflow.actions.number.random", "WFRandomNumberMaximum")).toBe(
        "100",
      );
    });

    it("should compile calculateExpression", () => {
      const plist = compile(`import Math;
shortcut { name: "T" }
const result = Math.calculateExpression("2 + 2");`).main;
      expect(actions(plist)).toContain("is.workflow.actions.calculateexpression");
    });

    it("should compile number literal", () => {
      const plist = compile(`import Math;
shortcut { name: "T" }
const n = Math.number(42);`).main;
      expect(actions(plist)).toContain("is.workflow.actions.number");
    });
  });

  describe("Documents module", () => {
    it("should compile selectFile and compressPdf", () => {
      const plist = compile(`import Documents;
shortcut { name: "T" }
const compressed = Documents.compressPdf(Documents.selectFile());`).main;
      expect(actions(plist)).toContain("is.workflow.actions.compresspdf");
    });

    it("should compile makeArchive", () => {
      const plist = compile(`import Documents;
shortcut { name: "T" }
const f = Documents.selectFile();
const archive = Documents.makeArchive(f);`).main;
      expect(actions(plist)).toContain("is.workflow.actions.makezip");
    });

    it("should compile makePdf", () => {
      const plist = compile(`import Documents;
shortcut { name: "T" }
const f = Documents.selectFile();
const pdf = Documents.makePdf(f);`).main;
      expect(actions(plist)).toContain("is.workflow.actions.makepdf");
    });
  });

  describe("Media module", () => {
    it("should compile takePhoto", () => {
      const plist = compile(`import Media;
shortcut { name: "T" }
const photo = Media.takePhoto();`).main;
      expect(actions(plist)).toContain("is.workflow.actions.takephoto");
    });

    it("should compile resizeImage with image as first arg", () => {
      const plist = compile(`import Media;
shortcut { name: "T" }
const photo = Media.takePhoto();
const resized = Media.resizeImage(photo);`).main;
      expect(actions(plist)).toContain("is.workflow.actions.image.resize");
    });

    it("should compile saveToPhotos", () => {
      const plist = compile(`import Media;
shortcut { name: "T" }
const photo = Media.takePhoto();
Media.saveToPhotos(photo);`).main;
      expect(actions(plist)).toContain("is.workflow.actions.savetocameraroll");
    });

    it("should compile getLatestPhotos", () => {
      const plist = compile(`import Media;
shortcut { name: "T" }
const photos = Media.getLatestPhotos(5);`).main;
      expect(actions(plist)).toContain("is.workflow.actions.getlastphoto");
    });
  });

  describe("Settings module", () => {
    it("should compile setVolume with enum and number", () => {
      const plist = compile(`import Settings;
shortcut { name: "T" }
Settings.setVolume(.media, 0.5);`).main;
      expect(actions(plist)).toContain("is.workflow.actions.setvolume");
    });

    it("should compile setBrightness", () => {
      const plist = compile(`import Settings;
shortcut { name: "T" }
Settings.setBrightness(0.8);`).main;
      expect(actions(plist)).toContain("is.workflow.actions.setbrightness");
    });

    it("should compile setWiFi toggle", () => {
      const plist = compile(`import Settings;
shortcut { name: "T" }
Settings.setWiFi(.turnOff, false);`).main;
      expect(actions(plist)).toContain("is.workflow.actions.wifi.set");
    });
  });

  describe("Sharing module", () => {
    it("should compile sendMessage with positional args", () => {
      const plist = compile(`import Sharing;
shortcut { name: "T" }
Sharing.sendMessage("Hello");`).main;
      expect(actions(plist)).toContain("is.workflow.actions.sendmessage");
      expect(plist).not.toContain("IntentAppDefinition");
      expect(plist).not.toContain("BundleIdentifier");
    });

    it("should compile sendEmail", () => {
      const plist = compile(`import Sharing;
shortcut { name: "T" }
Sharing.sendEmail("Check this out");`).main;
      expect(actions(plist)).toContain("is.workflow.actions.sendemail");
    });
  });

  describe("Shortcuts module", () => {
    it("should compile runShortcut with input", () => {
      const plist = compile(`import Shortcuts;
shortcut { name: "T" }
const result = Shortcuts.runShortcut("data");`).main;
      expect(actions(plist)).toContain("is.workflow.actions.runworkflow");
    });
  });

  describe("menu statement with stdlib actions", () => {
    it("should emit WFMenuItems as an array of strings", () => {
      const plist = compile(`import Notification;
shortcut { name: "T" }
menu "Pick one" {
  case "Alpha" {
    Notification.showAlert("Picked A");
  }
  case "Beta" {
    Notification.showAlert("Picked B");
  }
  case "Gamma" {
    Notification.showAlert("Picked C");
  }
}`).main;
      expect(plist).toContain("<array>");
      expect(plist).toContain("<string>Alpha</string>");
      expect(plist).toContain("<string>Beta</string>");
      expect(plist).toContain("<string>Gamma</string>");
      expect(plist).not.toMatch(/<key>WFMenuItems<\/key>\s*<string>/);
    });

    it("should emit each case body after its menu item header", () => {
      const plist = compile(`import Scripting;
import Notification;
shortcut { name: "T" }
menu "Choose" {
  case "Wait" {
    Scripting.wait(5);
  }
  case "Alert" {
    Notification.showAlert("Hi");
  }
}`).main;
      const ids = actions(plist);
      const menuStart = ids.indexOf("is.workflow.actions.choosefrommenu");
      expect(menuStart).toBeGreaterThanOrEqual(0);
      const waitIdx = ids.indexOf("is.workflow.actions.delay");
      const alertIdx = ids.indexOf("is.workflow.actions.alert");
      expect(waitIdx).toBeLessThan(alertIdx);
    });
  });

  describe("pipelines with stdlib actions", () => {
    it("should pipe clipboard through trimWhitespace", () => {
      const plist = compile(`import Device;
import Text;
import Notification;
shortcut { name: "T" }
const result = Device.getClipboard() |> Text.trimWhitespace;
Notification.showAlert(result);`).main;
      const ids = actions(plist);
      const clipIdx = ids.indexOf("is.workflow.actions.getclipboard");
      const trimIdx = ids.indexOf("is.workflow.actions.text.trimwhitespace");
      expect(clipIdx).toBeLessThan(trimIdx);
    });
  });

  describe("explicit WFInput on conditional actions", () => {
    it("should set WFInput on conditional action", () => {
      const plist = compile(`import Notification;
shortcut { name: "T" }
const x = 10;
if (x > 5) { Notification.showAlert("big"); }
`).main;
      const condIdx = plist.indexOf("is.workflow.actions.conditional");
      const condBlock = plist.slice(condIdx, condIdx + 500);
      expect(condBlock).toContain("WFInput");
    });
  });

  describe("hidden params should not appear in output", () => {
    it("should not emit IntentAppDefinition for sendMessage", () => {
      const plist = compile(`import Sharing;
shortcut { name: "T" }
Sharing.sendMessage("test");`).main;
      expect(plist).not.toContain("IntentAppDefinition");
      expect(plist).not.toContain("BundleIdentifier");
    });

    it("should not emit ShowWhenRun for newEvent", () => {
      const plist = compile(`import Calendar;
shortcut { name: "T" }
Calendar.newEvent("Test");`).main;
      expect(plist).not.toContain("ShowWhenRun");
    });
  });

  describe("boolean dictionary values", () => {
    it("should serialize true in a dictionary with WFNumberSubstitutableState", () => {
      const plist = compile(`shortcut { name: "T" }
const d = {"enabled": true};`).main;
      expect(plist).toContain("WFNumberSubstitutableState");
      expect(plist).toContain("<true/>");
    });

    it("should serialize false in a dictionary with WFNumberSubstitutableState", () => {
      const plist = compile(`shortcut { name: "T" }
const d = {"enabled": false};`).main;
      expect(plist).toContain("WFNumberSubstitutableState");
      expect(plist).toContain("<false/>");
    });

    it("should serialize boolean in a list with WFNumberSubstitutableState", () => {
      const plist = compile(`shortcut { name: "T" }
const items = [true, false];`).main;
      expect(plist).toContain("WFNumberSubstitutableState");
    });
  });
});
