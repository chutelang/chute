# Get started

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

- `chute.json`: project configuration (name, source directory, output directory)
- `src/main.chute`: your shortcut's source code
- `.gitignore`: ignores the `build/` directory

Open `src/main.chute` and you'll see the starter template:

```chute
shortcut {
  name: "Hello World",
  description: "A shortcut created with Chute",
}

import Scripting;

Scripting.showAlert("Hello from Chute!");
```

Every Chute file starts with an optional `shortcut` metadata block that sets the shortcut's name and description. After that comes the body. The body is a sequence of statements that become the shortcut's actions.

`Scripting.showAlert` is a built-in action from the [standard library](/reference/stdlib/scripting). In the Shortcuts app, this is the "Show Alert" action. You import a stdlib module and call its actions like functions.

## Build and run

Compile your shortcut:

```sh
chute build
```

This produces a signed `.shortcut` file in the `build/` directory. To compile and immediately open it in the Shortcuts app:

```sh
chute run src/main.chute
```

The Shortcuts app prompts you to add the shortcut. Select **Add Shortcut**, then run it. The shortcut displays the "Hello from Chute!" alert.

## Add some logic

Let's make the shortcut more interesting. Replace the contents of `src/main.chute` with:

```chute
shortcut {
  name: "Greeter",
  description: "Asks for your name and greets you",
}

import Scripting;

const name = Scripting.askForInput("What's your name?");
Scripting.showAlert("Hello, ${name}!");
```

The example uses two language features:

- `const name = ...` binds the result of `Scripting.askForInput()` to a variable. This corresponds to setting a variable from the output of the "Ask for Input" action in Shortcuts.
- `"Hello, ${name}!"` inserts the value of `name` into the string. This corresponds to placing a magic variable in a text field in Shortcuts.

Build and run it again:

```sh
chute run src/main.chute
```

The shortcut will ask for your name, then show an alert greeting you.

## Use control flow

Chute supports `if`/`else`, `for` loops, `repeat`, and `menu`, all of which compile to their Shortcuts equivalents. Here's a shortcut that presents a menu based on what's in your clipboard:

```chute
shortcut {
  name: "Clipboard Actions",
  description: "Do something with your clipboard",
}

import Device;
import Sharing;
import Text;
import Scripting;

const text = Device.getClipboard();

menu "What do you want to do?" {
  case "Share" {
    Sharing.share(text);
  }
  case "Make Uppercase" {
    const upper = Text.changeCase(text, "UPPERCASE");
    Device.copyToClipboard(upper);
    Scripting.showAlert("Copied uppercase text!");
  }
}
```

The compiler converts `menu` to a "Choose from Menu" action.

## What's next

Now that you've built and run your first shortcuts, explore the rest of the documentation:

- [Core concepts](/guide/core-concepts) explains how Chute maps to Shortcuts.
- [Variables and bindings](/reference/variables) covers `const`, `let`, destructuring, and type annotations.
- [Functions](/reference/functions) explains typed parameters and return values.
- [Standard library](/reference/stdlib/scripting) lists the built-in actions available in Chute.
