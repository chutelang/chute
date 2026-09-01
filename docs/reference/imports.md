# Imports & Modules

Chute supports splitting your code across multiple files. Use `import` to bring in declarations from other files or packages, and `export` to make your own declarations available.

## Path imports

Import a file by its relative path and give it an alias:

```text
import "./helpers" as H;
```

Then access its exported declarations through the alias:

```text
const result = H.formatName(first: "Alice", last: "Smith");
```

The path is relative to the importing file. The `.chute` extension is inferred. You don't need to include it.

## Package imports

Import a package by name:

```text
import Toolbox;
```

The package name becomes the alias automatically. You can also give it a custom alias:

```text
import Toolbox as TB;
```

## Import placement

All imports must appear at the top of the file, before the `shortcut` metadata block and any statements:

```text
import "./helpers" as H;
import Utils;

shortcut {
  name: "My Shortcut",
}

const result = H.doSomething();
```

## Exporting declarations

Use the `export` keyword to make a declaration available to other files. You can export `const` and `let` bindings, `func`, `enum`, `record`, and `action` declarations:

```text
export const version = "1.0";
export func greet(name: Text) -> Text { return "Hello, ${name}"; }
export enum Color { red = "RED", blue = "BLUE" }
export record Point { x: Number, y: Number }
export action fetchData(url WFURL: Text) -> Text = "is.workflow.actions.downloadurl";
```

Declarations without `export` are private to the file.

## Namespaced access

Imported declarations are always accessed through their alias. There are no unqualified imports:

```text
import "./math" as math;

const result = math.add(a: 1, b: 2);     // function
const origin = math.Point(x: 0, y: 0);   // record
const c = math.Color.red;                 // enum member
```

## Related

- [Functions](/reference/functions): exporting and importing functions
- [Enums and records](/reference/enums-records): exporting and importing types
- [Actions](/reference/actions): exporting and importing custom actions
