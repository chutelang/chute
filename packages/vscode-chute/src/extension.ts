import type { ExtensionContext } from "vscode";
import * as vscode from "vscode";
import { LanguageClient, TransportKind } from "vscode-languageclient/node";
import * as cp from "node:child_process";
import { findServerPath } from "./find-server-path.ts";

let client: LanguageClient | undefined;
const SUPPRESS_KEY = "chute.suppressMissingServerWarning";

export function activate(context: ExtensionContext): void {
  const config = vscode.workspace.getConfiguration("chute");
  if (!config.get<boolean>("lsp.enabled", true)) {
    return;
  }

  const serverPath = findServerPath({
    configuredPath: config.get<string>("lsp.serverPath", ""),
    isExecutable: (path) => {
      try {
        cp.execFileSync(path, ["--version"], { stdio: "ignore" });
        return true;
      } catch {
        return false;
      }
    },
  });

  if (!serverPath) {
    if (!context.globalState.get<boolean>(SUPPRESS_KEY)) {
      vscode.window
        .showWarningMessage(
          "Could not find the chute binary. Install it for diagnostics, completions, and go-to-definition.",
          "Install instructions",
          "Don't show again",
        )
        .then((choice) => {
          if (choice === "Install instructions") {
            vscode.env.openExternal(vscode.Uri.parse("https://chutelang.dev"));
          } else if (choice === "Don't show again") {
            context.globalState.update(SUPPRESS_KEY, true);
          }
        });
    }
    return;
  }

  const serverOptions = {
    command: serverPath,
    args: ["lsp"],
    transport: TransportKind.stdio,
  };

  client = new LanguageClient("chute", "Chute Language Server", serverOptions, {
    documentSelector: [
      {
        scheme: "file",
        language: "chute",
      },
    ],
  });

  client.start();
  context.subscriptions.push({
    dispose: () => {
      client?.stop();
    },
  });
}

export function deactivate(): void {
  client?.stop();
}
