# CLI reference

The `chute` command-line tool compiles, formats, and runs Chute projects.

## Commands

### `chute init`

Create a new Chute project in the specified directory.

```sh
chute init [directory]
```

If you omit `directory`, the command scaffolds in the current directory. The command creates the following files:

- `chute.json` — project configuration.
- `src/main.chute` — a starter shortcut with a "Hello World" alert.
- `.gitignore` — ignores the `build/` directory.

If a `chute.json` file already exists in the target directory, the command exits with an error.

### `chute build`

Compile `.chute` files to signed `.shortcut` files.

```sh
chute build [files...]
```

Each input file produces a `.shortcut` file (or `.plist` if unsigned) in the same directory as the source file. If a shortcut contains functions, Chute compiles each function to a separate sub-shortcut file alongside the main output.

| Flag | Description |
| --- | --- |
| `--no-sign` | Skip signing. Produces `.plist` files instead of `.shortcut` files. |

Signing requires macOS with the Shortcuts CLI installed. If signing isn't available, the command falls back to unsigned `.plist` output and prints a warning.

The `sign` field in `chute.json` also controls this behavior. The `--no-sign` flag overrides the config file.

### `chute fmt`

Format `.chute` source files.

```sh
chute fmt [files...]
```

If you omit `files`, the command discovers and formats all `.chute` files in the project's `sourceDir` (from `chute.json`, defaulting to `./src`).

| Flag | Description |
| --- | --- |
| `--check` | Don't write changes. Instead, print the paths of files that would change and exit with a nonzero status code. Useful in CI. |

### `chute run`

Compile a `.chute` file, sign it, and open it in the Shortcuts app.

```sh
chute run <file>
```

This command requires macOS with the Shortcuts CLI installed. It compiles the file, signs the output, and opens the resulting `.shortcut` file. The Shortcuts app prompts you to add the shortcut.

### `chute lsp`

Start the Chute language server.

```sh
chute lsp
```

The language server communicates over stdin/stdout using the Language Server Protocol. It provides diagnostics, go-to-definition, hover information, and autocomplete. Configure your editor to run `chute lsp` as the language server command for `.chute` files.

### `chute check`

Type-check and lint `.chute` files. This command isn't implemented yet.

```sh
chute check [files...]
```

## Project configuration

Every Chute project has a `chute.json` file at its root. The only required field is `name`.

```json
{
  "$schema": "https://chutelang.dev/schema/chute.schema.json",
  "name": "my-shortcut",
  "version": "1.0.0",
  "sourceDir": "./src",
  "outDir": "./build",
  "sign": true,
  "check": {
    "actionCountWarningThreshold": 200
  },
  "format": {
    "maxLineWidth": 120
  }
}
```

The following table describes each field:

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | — | The project name. Required. |
| `version` | `string` | — | The project version, in `MAJOR.MINOR.PATCH` format. |
| `sourceDir` | `string` | `"./src"` | Directory containing `.chute` source files. |
| `outDir` | `string` | `"./build"` | Directory for compiled output files. |
| `sign` | `boolean` | `true` | Whether to sign output files with the macOS Shortcuts CLI. |
| `check.actionCountWarningThreshold` | `integer` | — | Warn when a shortcut exceeds this number of compiled actions. |
| `format.maxLineWidth` | `integer` | `120` | Soft maximum line width for the formatter. Minimum value is 40. |
