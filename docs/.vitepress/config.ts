import { defineConfig } from "vitepress";
import { chuteMarkdownPlugin } from "./chute-plugin";
import chuteGrammar from "../../packages/vscode-chute/syntaxes/chute.tmLanguage.json";

const chuteLanguage = {
  ...chuteGrammar,
  aliases: ["chute"],
};

export default defineConfig({
  title: "Chute",
  description: "Siri Shortcuts as Code",

  markdown: {
    languages: [chuteLanguage as never],
    config(md) {
      md.use(chuteMarkdownPlugin);
    },
  },

  vite: {
    server: {
      allowedHosts: true,
    },
  },

  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Reference", link: "/reference/variables" },
      { text: "Examples", link: "/examples/share-clipboard" },
    ],

    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "Core Concepts", link: "/guide/core-concepts" },
        ],
      },
      {
        text: "Language Reference",
        items: [
          { text: "Variables & Bindings", link: "/reference/variables" },
          { text: "Types", link: "/reference/types" },
          { text: "Functions", link: "/reference/functions" },
          { text: "Control Flow", link: "/reference/control-flow" },
          { text: "Enums & Records", link: "/reference/enums-records" },
          { text: "Pipelines", link: "/reference/pipelines" },
          { text: "Actions", link: "/reference/actions" },
          { text: "Imports & Modules", link: "/reference/imports" },
          { text: "Expressions", link: "/reference/expressions" },
        ],
      },
      {
        text: "Standard Library",
        collapsed: true,
        items: [
          { text: "Overview", link: "/reference/stdlib/index" },
          { text: "Apps", link: "/reference/stdlib/apps" },
          { text: "Calendar", link: "/reference/stdlib/calendar" },
          { text: "Contacts", link: "/reference/stdlib/contacts" },
          { text: "Device", link: "/reference/stdlib/device" },
          { text: "Documents", link: "/reference/stdlib/documents" },
          { text: "Health", link: "/reference/stdlib/health" },
          { text: "HomeKit", link: "/reference/stdlib/homekit" },
          { text: "Maps", link: "/reference/stdlib/maps" },
          { text: "Math", link: "/reference/stdlib/math" },
          { text: "Media", link: "/reference/stdlib/media" },
          { text: "Notification", link: "/reference/stdlib/notification" },
          { text: "Scripting", link: "/reference/stdlib/scripting" },
          { text: "Settings", link: "/reference/stdlib/settings" },
          { text: "Sharing", link: "/reference/stdlib/sharing" },
          { text: "Shortcuts", link: "/reference/stdlib/shortcuts" },
          { text: "Text", link: "/reference/stdlib/text" },
          { text: "Web", link: "/reference/stdlib/web" },
        ],
      },
      {
        text: "Examples",
        items: [
          { text: "Share Clipboard", link: "/examples/share-clipboard" },
          { text: "Quick Timer", link: "/examples/quick-timer" },
          { text: "Link Cleaner", link: "/examples/link-cleaner" },
        ],
      },
      {
        text: "CLI Reference",
        items: [{ text: "Commands", link: "/reference/cli" }],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/chutelang/chute" }],
  },
});
