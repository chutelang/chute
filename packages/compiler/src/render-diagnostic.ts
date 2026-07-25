import type { Diagnostic } from "./diagnostic.ts";

export interface RenderOptions {
  color?: boolean;
  filePath?: string;
}

interface SourceLocation {
  line: number;
  column: number;
  lineText: string;
}

function locate(source: string, offset: number): SourceLocation {
  let line = 1;
  let lineStart = 0;

  for (let i = 0; i < offset; i++) {
    if (source.charAt(i) === "\n") {
      line++;
      lineStart = i + 1;
    }
  }

  const lineEnd = source.indexOf("\n", lineStart);
  const lineText = source.slice(lineStart, lineEnd === -1 ? source.length : lineEnd);
  const column = offset - lineStart + 1;

  return { line, column, lineText };
}

const BOLD = "\x1b[1m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";

function colorize(text: string, codes: string, color: boolean): string {
  if (!color) return text;
  return `${codes}${text}${RESET}`;
}

function severityColor(severity: string): string {
  return severity === "error" ? `${BOLD}${RED}` : `${BOLD}${YELLOW}`;
}

export function renderDiagnostic(
  source: string,
  diagnostic: Diagnostic,
  options?: RenderOptions,
): string {
  const color = options?.color ?? false;
  const filePath = options?.filePath ?? "<source>";
  const loc = locate(source, diagnostic.span.start);
  const underlineLen = Math.max(1, diagnostic.span.end - diagnostic.span.start);
  const gutter = String(loc.line).length;
  const pad = " ".repeat(gutter);

  const sevColor = severityColor(diagnostic.severity);
  const header =
    colorize(`${diagnostic.severity}[${diagnostic.code}]`, sevColor, color) +
    colorize(`: ${diagnostic.message}`, BOLD, color);

  const location = `${pad}${colorize("-->", BLUE, color)} ${filePath}:${loc.line}:${loc.column}`;
  const blankGutter = ` ${pad}${colorize("|", BLUE, color)}`;
  const sourceLine = ` ${colorize(`${loc.line}`, BLUE, color)} ${colorize("|", BLUE, color)} ${loc.lineText}`;
  const underline = `${blankGutter} ${" ".repeat(loc.column - 1)}${colorize("^".repeat(underlineLen), sevColor, color)}`;

  const lines = [header, location, blankGutter, sourceLine, underline];

  if (diagnostic.suggestion) {
    lines.push(
      `${blankGutter} ${" ".repeat(loc.column - 1)}${colorize(`= help: ${diagnostic.suggestion}`, CYAN, color)}`,
    );
  }

  lines.push(blankGutter);

  return lines.join("\n");
}

export function renderDiagnostics(
  source: string,
  diagnostics: Diagnostic[],
  options?: RenderOptions,
): string {
  if (diagnostics.length === 0) return "";

  const color = options?.color ?? false;

  const rendered = diagnostics.map((d) => renderDiagnostic(source, d, options));

  const errors = diagnostics.filter((d) => d.severity === "error").length;
  const warnings = diagnostics.filter((d) => d.severity === "warning").length;

  const parts: string[] = [];
  if (errors > 0) {
    const label = errors === 1 ? "1 error" : `${errors} errors`;
    parts.push(colorize(label, `${BOLD}${RED}`, color));
  }
  if (warnings > 0) {
    const label = warnings === 1 ? "1 warning" : `${warnings} warnings`;
    parts.push(colorize(label, `${BOLD}${YELLOW}`, color));
  }

  const summary = parts.join(", ") + " emitted";
  return rendered.join("\n") + "\n" + summary + "\n";
}
