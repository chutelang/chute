import { execFile } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { promisify } from "node:util";
import {
  commandFailureMessage,
  makeShortcutName,
  mapConcurrently,
  parseShortcutManifest,
  retryShortcutSigning,
  testNameMatchesPattern,
  testNamePatternFromArgs,
  withWorkflowNameAndOutput,
} from "./macos-helpers.ts";
import type { ShortcutArtifact, ShortcutManifest } from "./macos-helpers.ts";

const execFileAsync = promisify(execFile);
const directory = import.meta.dirname;
const repositoryRoot = path.join(directory, "..", "..");
const cliPath = path.join(repositoryRoot, "packages/cli/dist/cli.js");
const artifactPreparationConcurrency = 4;

interface TestCase {
  name: string;
  source: string;
  expected: string;
  menuChoice?: string;
}

function parseTestCases(value: unknown): TestCase[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("Test cases must be a nonempty array");
  }
  return value.map((testCase, index) => {
    if (
      typeof testCase !== "object" ||
      testCase === null ||
      typeof testCase.name !== "string" ||
      typeof testCase.source !== "string" ||
      typeof testCase.expected !== "string"
    ) {
      throw new Error(`Invalid test case at index ${index}`);
    }
    return {
      name: testCase.name,
      source: testCase.source,
      expected: testCase.expected,
      menuChoice: testCase.menuChoice,
    };
  });
}

async function run(command: string, args: string[], timeout: number): Promise<void> {
  await execFileAsync(command, args, {
    cwd: repositoryRoot,
    timeout,
    maxBuffer: 8 * 1024 * 1024,
  });
}

async function prepareArtifact(
  testCase: TestCase,
  index: number,
  runId: string,
  workDirectory: string,
  outputDirectory: string,
): Promise<ShortcutArtifact> {
  const shortcutName = makeShortcutName(testCase.name, `${runId}${index}`);
  const sourcePath = path.join(workDirectory, `${shortcutName}.chute`);
  const plistPath = path.join(workDirectory, `${shortcutName}.plist`);
  const stagedPath = path.join(workDirectory, `${shortcutName}.unsigned.shortcut`);
  const fileName = `${shortcutName}.shortcut`;
  const shortcutPath = path.join(outputDirectory, fileName);

  fs.writeFileSync(sourcePath, withWorkflowNameAndOutput(testCase.source, shortcutName));
  await run("node", [cliPath, "build", "--no-sign", sourcePath], 60_000);
  fs.copyFileSync(plistPath, stagedPath);
  try {
    await retryShortcutSigning(
      () => {
        fs.rmSync(shortcutPath, { force: true });
        return run(
          "shortcuts",
          ["sign", "--mode", "anyone", "--input", stagedPath, "--output", shortcutPath],
          60_000,
        );
      },
      {
        onRetry: (error, nextAttempt, delayMs) => {
          process.stderr.write(
            `Transient Shortcuts signing failure: ${commandFailureMessage(error)}\nRetrying attempt ${nextAttempt}/3 in ${delayMs}ms...\n`,
          );
        },
      },
    );
  } finally {
    fs.rmSync(stagedPath, { force: true });
  }
  return {
    testName: testCase.name,
    shortcutName,
    fileName,
    expected: testCase.expected,
    menuChoice: testCase.menuChoice,
  };
}

async function main(): Promise<void> {
  const [outputDirectory, runId, ...vitestArgs] = process.argv.slice(2);
  if (!outputDirectory || !runId || !/^[A-Za-z0-9_-]+$/.test(runId)) {
    throw new Error("Usage: prepare-artifacts.ts OUTPUT_DIRECTORY RUN_ID [VITEST_ARGUMENTS...]");
  }
  if (
    !path.basename(outputDirectory).startsWith("chute-shortcuts-artifacts.") ||
    !fs.existsSync(outputDirectory) ||
    !fs.statSync(outputDirectory).isDirectory() ||
    fs.readdirSync(outputDirectory).length !== 0
  ) {
    throw new Error("Output must be an empty chute-shortcuts-artifacts.* directory");
  }
  if (!fs.existsSync(cliPath)) {
    throw new Error("Chute CLI is not built. Run pnpm install and pnpm build first.");
  }

  const workDirectory = path.join(outputDirectory, ".work");
  fs.mkdirSync(workDirectory);
  try {
    let testCases = parseTestCases(
      JSON.parse(fs.readFileSync(path.join(directory, "test-cases.json"), "utf8")),
    );
    const testNamePattern = testNamePatternFromArgs(vitestArgs);
    if (testNamePattern !== undefined) {
      testCases = testCases.filter((testCase) =>
        testNameMatchesPattern(testCase.name, testNamePattern),
      );
      if (testCases.length === 0) {
        throw new Error(`No shortcut tests match pattern: ${testNamePattern}`);
      }
    }
    const artifacts = await mapConcurrently(
      testCases,
      artifactPreparationConcurrency,
      async (testCase, index) => {
        process.stdout.write(`Preparing ${testCase.name} (${index + 1}/${testCases.length})...\n`);
        return prepareArtifact(testCase, index, runId, workDirectory, outputDirectory);
      },
    );
    const manifest: ShortcutManifest = parseShortcutManifest({
      version: 1,
      artifacts,
      vitestArgs,
    });
    const manifestPath = path.join(outputDirectory, "manifest.json");
    const pendingManifestPath = path.join(outputDirectory, "manifest.pending.json");
    fs.writeFileSync(pendingManifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    fs.renameSync(pendingManifestPath, manifestPath);
  } catch (error: unknown) {
    fs.rmSync(outputDirectory, { recursive: true, force: true });
    throw error;
  } finally {
    fs.rmSync(workDirectory, { recursive: true, force: true });
  }
}

await main();
