# Chute for Visual Studio Code

Syntax highlighting, diagnostics, completions, hover info, and go-to-definition for the [Chute](https://chutelang.dev) programming language.

## Features

- TextMate syntax highlighting for `.chute` files
- Language server integration via the `chute` CLI
- Comment toggling, bracket matching, auto-indentation

## Requirements

Install the `chute` CLI for language server features (diagnostics, completions, hover, go-to-definition). Syntax highlighting works without it.

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `chute.lsp.enabled` | `true` | Enable the language server |
| `chute.lsp.serverPath` | `""` | Path to the `chute` binary (uses PATH if empty) |
| `chute.trace.server` | `"off"` | Trace LSP communication (`off`, `messages`, `verbose`) |
