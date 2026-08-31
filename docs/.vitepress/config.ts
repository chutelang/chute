import { defineConfig } from "vitepress";
import { chuteMarkdownPlugin } from "./chute-plugin";

export default defineConfig({
  title: "Chute",
  description: "Siri Shortcuts as Code",

  markdown: {
    config(md) {
      md.use(chuteMarkdownPlugin);
    },
  },

  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Reference", link: "/reference/variables" },
      { text: "Examples", link: "/examples/share-clipboard" },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Introduction",
          items: [
            { text: "Getting Started", link: "/guide/getting-started" },
            { text: "Core Concepts", link: "/guide/core-concepts" },
          ],
        },
      ],
      "/reference/": [
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
          items: [
            { text: "Scripting", link: "/reference/stdlib/scripting" },
            { text: "Text", link: "/reference/stdlib/text" },
            { text: "Web", link: "/reference/stdlib/web" },
            { text: "Sharing", link: "/reference/stdlib/sharing" },
            { text: "Documents", link: "/reference/stdlib/documents" },
            { text: "Calendar", link: "/reference/stdlib/calendar" },
            { text: "Contacts", link: "/reference/stdlib/contacts" },
            { text: "Maps", link: "/reference/stdlib/maps" },
            { text: "Media", link: "/reference/stdlib/media" },
            { text: "Settings", link: "/reference/stdlib/settings" },
            { text: "Health", link: "/reference/stdlib/health" },
          ],
        },
        {
          text: "CLI Reference",
          items: [{ text: "Commands", link: "/reference/cli" }],
        },
      ],
      "/examples/": [
        {
          text: "Examples",
          items: [
            { text: "Share Clipboard", link: "/examples/share-clipboard" },
            { text: "Quick Timer", link: "/examples/quick-timer" },
            { text: "Link Cleaner", link: "/examples/link-cleaner" },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/user/chute" },
    ],
  },
});
