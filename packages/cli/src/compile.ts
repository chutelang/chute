import { compile, CompileError, type CompileResult, renderDiagnostics } from "@chutelang/compiler";
import type { IO } from "./io.ts";

export function compileSource(source: string, filePath: string, io: IO): CompileResult | undefined {
  try {
    return compile(source);
  } catch (error) {
    if (!(error instanceof CompileError)) {
      throw error;
    }

    io.stderr(
      renderDiagnostics(source, error.diagnostics, {
        color: io.stderrSupportsColor,
        filePath,
      }),
    );
    io.setExitCode(1);
    return undefined;
  }
}
