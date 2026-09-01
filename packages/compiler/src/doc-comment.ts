import type { Span } from "./token.ts";

export interface DocCommentTag {
  kind: "param" | "example" | "unknown";
  tagName: string;
  span: Span;
  name: string | undefined;
  nameSpan: Span | undefined;
  body: string;
}

export interface DocComment {
  span: Span;
  description: string;
  tags: DocCommentTag[];
}

export function parseDocComment(raw: string, span: Span): DocComment {
  const contentStart = span.start + 3; // offset past "/**"
  const lines = stripLeadingStars(raw);
  const description: string[] = [];
  const tags: DocCommentTag[] = [];
  let currentTag: PendingTag | undefined;

  for (const line of lines) {
    const trimmed = line.text.trim();

    const tagMatch = /^@(\w+)(.*)$/.exec(trimmed);

    if (tagMatch) {
      if (currentTag) {
        tags.push(finalizeTag(currentTag, line.offset));
      }

      const tagName = tagMatch.at(1) ?? "";
      const rest = (tagMatch.at(2) ?? "").trim();
      const tagStartOffset = contentStart + line.offset + line.text.indexOf("@");

      if (tagName === "param") {
        const paramMatch = /^(\w+)\s*(.*)$/.exec(rest);
        const paramName = paramMatch?.at(1);
        const paramDesc = (paramMatch?.at(2) ?? "").trim();
        const nameStartInLine = paramName
          ? line.text.indexOf(paramName, line.text.indexOf("@"))
          : -1;
        currentTag = {
          kind: "param",
          tagName,
          name: paramName,
          nameSpan:
            paramName && nameStartInLine >= 0
              ? {
                  start: contentStart + line.offset + nameStartInLine,
                  end: contentStart + line.offset + nameStartInLine + paramName.length,
                }
              : undefined,
          bodyLines: paramDesc.length > 0 ? [paramDesc] : [],
          startOffset: tagStartOffset,
        };
      } else if (tagName === "example") {
        currentTag = {
          kind: "example",
          tagName,
          name: undefined,
          nameSpan: undefined,
          bodyLines: rest.length > 0 ? [rest] : [],
          startOffset: tagStartOffset,
        };
      } else {
        currentTag = {
          kind: "unknown",
          tagName,
          name: undefined,
          nameSpan: undefined,
          bodyLines: rest.length > 0 ? [rest] : [],
          startOffset: tagStartOffset,
        };
      }
    } else if (currentTag) {
      if (trimmed.length > 0) {
        currentTag.bodyLines.push(trimmed);
      } else if (currentTag.bodyLines.length > 0) {
        currentTag.bodyLines.push("");
      }
    } else {
      if (trimmed.length > 0 || description.length > 0) {
        description.push(trimmed);
      }
    }
  }

  if (currentTag) {
    tags.push(finalizeTag(currentTag, raw.length));
  }

  const descText = description.join("\n").trim();

  return {
    span,
    description: descText,
    tags,
  };
}

interface PendingTag {
  kind: "param" | "example" | "unknown";
  tagName: string;
  name: string | undefined;
  nameSpan: Span | undefined;
  bodyLines: string[];
  startOffset: number;
}

function finalizeTag(pending: PendingTag, endOffset: number): DocCommentTag {
  while (pending.bodyLines.length > 0 && pending.bodyLines.at(-1) === "") {
    pending.bodyLines.pop();
  }

  return {
    kind: pending.kind,
    tagName: pending.tagName,
    span: {
      start: pending.startOffset,
      end: pending.startOffset + (endOffset - pending.startOffset),
    },
    name: pending.name,
    nameSpan: pending.nameSpan,
    body: pending.bodyLines.join("\n"),
  };
}

interface StrippedLine {
  text: string;
  offset: number;
}

function stripLeadingStars(raw: string): StrippedLine[] {
  const lines = raw.split("\n");
  const result: StrippedLine[] = [];
  let offset = 0;

  for (const line of lines) {
    const stripped = line.replace(/^\s*\*? ?/, "");
    result.push({
      text: stripped,
      offset,
    });
    offset += line.length + 1;
  }

  return result;
}
