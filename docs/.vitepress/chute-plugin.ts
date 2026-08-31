import type MarkdownIt from "markdown-it";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function chuteMarkdownPlugin(md: MarkdownIt): void {
  const defaultFence = md.renderer.rules.fence;

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    if (!token) {
      return "";
    }

    const info = token.info.trim();
    if (info !== "chute") {
      if (defaultFence) {
        return defaultFence(tokens, idx, options, env, self);
      }
      return "";
    }

    const source = token.content.trimEnd();
    return `<ChuteCode source="${escapeHtml(source)}" />`;
  };
}
