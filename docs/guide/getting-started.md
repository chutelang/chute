# Getting Started

This guide walks you through installing Chute, creating your first project, and running a compiled shortcut on your Mac.

## Prerequisites

- [Node.js](https://nodejs.org/) version 22 or later
- macOS (required for compiling and running shortcuts)

## Install Chute

Install the CLI globally with npm:

```sh
npm i -g @chutelang/cli
```

Verify the installation:

```sh
chute --version
```

## Create a project

Use `chute init` to scaffold a new project:

```sh
chute init my-shortcut
cd my-shortcut
```

This creates three files:

- `chute.json` — project configuration (name, source directory, output directory)
- `src/main.chute` — your shortcut's source code
- `.gitignore` — ignores the `build/` directory

Open `src/main.chute` and you'll see the starter template:

```chute
shortcut {
  name: "Hello World",
  description: "A shortcut created with Chute",
}

showAlert(text: "Hello from Chute!");
```

Every Chute file starts with an optional `shortcut` metadata block that sets the shortcut's name and description. After that comes the body — a sequence of statements that become the shortcut's actions.

`showAlert` is a built-in action from the [standard library](/reference/stdlib/scripting). In the Shortcuts app, this is the "Show Alert" action. In Chute, you call it like a function.

## Build and run

Compile your shortcut:

```sh
chute build
```

This produces a signed `.shortcut` file in the `build/` directory. To compile and immediately open it in the Shortcuts app:

```sh
chute run src/main.chute
```

The Shortcuts app will prompt you to add the shortcut. Tap "Add Shortcut" and run it — you'll see the "Hello from Chute!" alert.

## Add some logic

Let's make the shortcut more interesting. Replace the contents of `src/main.chute` with:

```chute
shortcut {
  name: "Greeter",
  description: "Asks for your name and greets you",
}

let name = ask(prompt: "What's your name?");
showAlert(text: "Hello, ${name}!");
```

This introduces two concepts:

- **Variables** — `let name = ...` binds the result of `ask()` to a variable. In Shortcuts, this is equivalent to setting a variable from the output of the "Ask for Input" action.
- **String interpolation** — `"Hello, ${name}!"` embeds the value of `name` into the string. This compiles to the same thing as dragging a magic variable into a text field in Shortcuts.

Build and run it again:

```sh
chute run src/main.chute
```

The shortcut will ask for your name, then show an alert greeting you.

## Use control flow

Chute supports `if`/`else`, `for` loops, `repeat`, and `menu` — all of which compile to their Shortcuts equivalents. Here's a shortcut that presents a menu based on what's in your clipboard:

```chute
shortcut {
  name: "Clipboard Actions",
  description: "Do something with your clipboard",
}

let text = getClipboard();

menu "What do you want to do?" {
  case "Share" {
    share(input: text);
  }
  case "Make Uppercase" {
    let upper = changeCase(text: text, case: "UPPERCASE");
    setClipboard(value: upper);
    showAlert(text: "Copied uppercase text!");
  }
}
```

In the Shortcuts app, `menu` compiles to a "Choose from Menu" action — but you get to write it with real syntax instead of dragging blocks around.

## What's next

Now that you've built and run your first shortcuts, explore the rest of the documentation:

- [Core Concepts](/guide/core-concepts) — how Chute maps to Shortcuts under the hood
- [Variables & Bindings](/reference/variables) — `let`, `var`, destructuring, and type annotations
- [Functions](/reference/functions) — define reusable logic that compiles to sub-shortcuts
- [Standard Library](/reference/stdlib/scripting) — every built-in action available in Chute
