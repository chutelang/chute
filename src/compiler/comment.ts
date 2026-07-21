import type { Span } from "./token.ts";

export interface SourceComment {
  text: string;
  span: Span;
  isBlock: boolean;
}

export function extractComments(source: string): SourceComment[] {
  const comments: SourceComment[] = [];
  let pos = 0;

  while (pos < source.length) {
    const ch = source.charAt(pos);

    if (ch === '"') {
      pos = skipString(source, pos);
      continue;
    }

    if (
      ch === "#" &&
      pos + 1 < source.length &&
      (source.charAt(pos + 1) === '"' || source.charAt(pos + 1) === "#")
    ) {
      pos = skipRawString(source, pos);
      continue;
    }

    if (ch === "/" && pos + 1 < source.length) {
      const next = source.charAt(pos + 1);

      if (next === "/") {
        const start = pos;
        pos += 2;
        while (pos < source.length && source.charAt(pos) !== "\n") {
          pos++;
        }
        comments.push({
          text: source.slice(start + 2, pos),
          span: { start, end: pos },
          isBlock: false,
        });
        continue;
      }

      if (next === "*") {
        const start = pos;
        pos += 2;
        while (pos + 1 < source.length) {
          if (source.charAt(pos) === "*" && source.charAt(pos + 1) === "/") {
            pos += 2;
            break;
          }
          pos++;
        }
        comments.push({
          text: source.slice(start + 2, pos - 2),
          span: { start, end: pos },
          isBlock: true,
        });
        continue;
      }
    }

    pos++;
  }

  return comments;
}

function skipString(source: string, pos: number): number {
  pos++;
  while (pos < source.length) {
    const ch = source.charAt(pos);
    if (ch === "\\") {
      pos += 2;
      continue;
    }
    if (ch === '"') {
      return pos + 1;
    }
    if (ch === "$" && pos + 1 < source.length && source.charAt(pos + 1) === "{") {
      pos += 2;
      let depth = 1;
      while (pos < source.length && depth > 0) {
        const c = source.charAt(pos);
        if (c === "{") depth++;
        else if (c === "}") {
          depth--;
          if (depth === 0) {
            pos++;
            return skipString(source, pos - 1);
          }
        } else if (c === '"') {
          pos = skipString(source, pos);
          continue;
        }
        pos++;
      }
      return pos;
    }
    pos++;
  }
  return pos;
}

function skipRawString(source: string, pos: number): number {
  let hashes = 0;
  while (pos < source.length && source.charAt(pos) === "#") {
    hashes++;
    pos++;
  }
  if (pos >= source.length || source.charAt(pos) !== '"') {
    return pos;
  }
  pos++;

  while (pos < source.length) {
    if (source.charAt(pos) === '"') {
      let matched = 1;
      while (
        matched <= hashes &&
        pos + matched < source.length &&
        source.charAt(pos + matched) === "#"
      ) {
        matched++;
      }
      if (matched === hashes + 1) {
        return pos + matched;
      }
    }
    pos++;
  }
  return pos;
}
