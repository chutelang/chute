# Enums & Records

Enums and records let you define your own types. Enums represent a fixed set of named values; records represent structured data with named fields.

## Enums

An enum declares a set of named cases:

```text
enum Direction { north, south, east, west }
```

### Backing values

Each case has a backing value — a string that's used at runtime. By default, the backing value is the case name:

```text
enum Direction { north, south, east, west }
// north → "north", south → "south", etc.
```

You can set explicit backing values:

```text
enum Color { red = "RED", blue = "BLUE" }
// red → "RED", blue → "BLUE"
```

Or set a default prefix that applies to all cases:

```text
enum Status = "status" { active, inactive }
// active → "status.active", inactive → "status.inactive"
```

### Accessing enum cases

Use the enum name and dot notation:

```text
let dir = Direction.north;
let c = Color.red;
```

### Dot-name shorthand

When the expected type is known (from a type annotation, function parameter, or assignment), you can use the shorthand `.caseName`:

```text
let c: Color = .red;            // instead of Color.red
paint(c: .blue);                // in a function argument

var dir: Direction = .north;
dir = .south;                   // in reassignment
```

Dot-name shorthand is a compile error if there's no contextual type to resolve against.

### Enums in string interpolation

You can interpolate an enum value into a string — it uses the backing value:

```text
enum Color { red = "RED", blue = "BLUE" }
let c = Color.red;
showAlert(text: "${c}"); // shows "RED"
```

## Records

A record declares a product type with named, typed fields:

```text
record Point { x: Number, y: Number }
```

### Construction

Construct a record by calling it like a function with labeled arguments:

```text
let p = Point(x: 10, y: 20);
```

All fields are required, all must be labeled, and types must match:

```text
Point(10, 20);          // error: arguments must be labeled
Point(x: 10);           // error: missing field 'y'
Point(x: 10, y: "20");  // error: type mismatch
```

### Field access

Access fields with dot notation:

```text
let sum = p.x + p.y;
```

### Destructuring

You can destructure a record into individual bindings:

```text
let { x, y } = p;
let sum = x + y;
```

The destructured names must match the record's field names.

### Records with enum fields

Records can use enum types for fields. Dot-name shorthand works in record construction:

```text
enum Color { red = "RED", blue = "BLUE" }
record Shirt { size: Text, color: Color }

let s = Shirt(size: "L", color: .red);
```

## Exporting

Both enums and records can be exported for use in other modules:

```text
export enum Color { red = "RED", blue = "BLUE" }
export record Point { x: Number, y: Number }
```

## How it maps to Shortcuts

Enums compile to their backing value strings at every use site. A `Color.red` with backing value `"RED"` becomes the text `"RED"` in the compiled shortcut.

Records compile to dictionaries. `Point(x: 10, y: 20)` becomes a dictionary with keys `"x"` and `"y"`. Field access (`p.x`) compiles to dictionary value retrieval.

## Related

- [Variables & Bindings](/reference/variables) — destructuring with `let { ... }`
- [Types](/reference/types) — using enums and records as type annotations
- [Functions](/reference/functions) — enums and records as parameter types
