# Chute

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

A strongly typed programming language that compiles to [Siri Shortcuts](https://support.apple.com/guide/shortcuts/intro-to-shortcuts-apdf22b0444c/ios).

Chute lets you write shortcuts as code with variables, functions, control flow, and a type system instead of dragging blocks in the Shortcuts app.

## Install

```sh
npm install -g @chutelang/cli
```

## Features

- Static types catch errors at compile time, not at runtime in the Shortcuts app
- `const`, `let`, `if`/`else`, `for`, `repeat`, `menu`, functions, and the `|>` pipeline operator
- Every built-in Shortcuts action available as a typed function call
- `chute fmt` formats your code
- Language server with autocomplete, hover info, go-to-definition, and diagnostics

## Read the documentation

[The Chute documentation](https://chutelang.dev) includes the getting started guide, language reference, and examples.

## License

[Apache 2.0](LICENSE)
