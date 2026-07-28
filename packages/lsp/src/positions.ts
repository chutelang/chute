import type { Position } from "vscode-languageserver";

export interface LineMap {
  offsets: number[];
}

export function buildLineMap(text: string): LineMap {
  const offsets = [0];
  for (let i = 0; i < text.length; i++) {
    if (text.charAt(i) === "\n") {
      offsets.push(i + 1);
    }
  }
  return { offsets };
}

export function offsetToPosition(lineMap: LineMap, offset: number): Position {
  let low = 0;
  let high = lineMap.offsets.length - 1;
  while (low < high) {
    const mid = (low + high + 1) >>> 1;
    if ((lineMap.offsets[mid] ?? 0) <= offset) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }
  return {
    line: low,
    character: offset - (lineMap.offsets[low] ?? 0),
  };
}

export function positionToOffset(lineMap: LineMap, position: Position): number {
  const lineStart = lineMap.offsets[position.line] ?? 0;
  return lineStart + position.character;
}
