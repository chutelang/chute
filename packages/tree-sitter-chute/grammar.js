/// <reference types="tree-sitter-cli/dsl" />

/**
 * A comma-separated list with at least one `rule`. This matches the compiler:
 * separators are required, and the final element can have a trailing comma.
 */
function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)), optional(","));
}

/** A comma-separated list containing zero or more instances of `rule`. */
function commaSep(rule) {
  return optional(commaSep1(rule));
}

module.exports = grammar({
  name: "chute",

  word: ($) => $.identifier,

  supertypes: ($) => [$._statement, $._expression, $._condition, $._type],

  extras: ($) => [/\s/, $.line_comment, $.block_comment, $.doc_comment],

  externals: ($) => [
    $._string_start,
    $.string_content,
    $._string_end,
    $.block_comment,
    $.raw_string,
    $.doc_comment,
  ],

  // A bare `_expression` can match `boolean_reference` and a more specific
  // `_condition` on the same input. GLR tries both parses. Dynamic precedence
  // selects the specific condition when both parses succeed.
  //
  // The second conflict permits qualified pipeline callees. After `|>`, an
  // identifier can finish the callee or start a member expression. GLR discards
  // the member parse unless a later `.property` completes it.
  conflicts: ($) => [
    [$.parenthesized_expression, $.boolean_reference],
    [$._comparable_expression, $.pipeline_stage],
  ],

  rules: {
    program: ($) => repeat(choice($.import_declaration, $.shortcut_metadata, $._statement)),

    _statement: ($) =>
      choice(
        $.expression_statement,
        $.const_declaration,
        $.const_destructure,
        $.let_declaration,
        $.let_destructure,
        $.enum_declaration,
        $.record_declaration,
        $.function_declaration,
        $.action_declaration,
        $.return_statement,
        $.assignment,
        $.if_statement,
        $.for_statement,
        $.repeat_statement,
        $.menu_statement,
      ),

    expression_statement: ($) => seq($._expression, ";"),

    assignment: ($) => seq(field("left", $._expression), "=", field("right", $._expression), ";"),

    // Delimited positions use `_expression` and accept every expression form.
    // Coalesce and pipeline operands use narrower rules. Without parentheses,
    // a ternary consumes its full alternate before `??` or `|>` can apply.
    // Thus, `cond > 3 ? a : b ?? c` parses as
    // `ternary(cond > 3, a, coalesce(b, c))`.
    _expression: ($) => choice($._pipeline_operand, $.ternary_expression),

    // Pipeline chains are left-associative. A bare ternary requires parentheses.
    _pipeline_operand: ($) => choice($._coalesce_operand, $.pipeline_expression),

    // Coalesce chains are left-associative.
    _coalesce_operand: ($) => choice($._comparable_expression, $.coalesce_expression),

    // Conditions use comparable operands. Allowing coalesce, ternary, or pipeline
    // expressions here would introduce left recursion that precedence can't
    // resolve. This matches the compiler's `parseAdditive()` operands.
    _comparable_expression: ($) =>
      choice(
        $.identifier,
        $.number_literal,
        $.string_literal,
        $.boolean_literal,
        $.nil_literal,
        $.raw_string,
        $.parenthesized_expression,
        $.dot_name_expression,
        $.binary_expression,
        $.unary_expression,
        $.call_expression,
        $.member_expression,
        $.optional_member_expression,
        $.subscript_expression,
        $.coercion_expression,
        $.list_literal,
        $.dictionary_literal,
        $.hash_index,
        $.placeholder,
      ),

    parenthesized_expression: ($) => seq("(", $._expression, ")"),

    dot_name_expression: ($) => seq(".", field("name", $.identifier)),

    // Arithmetic, unary, and coercion expressions

    binary_expression: ($) =>
      choice(
        prec.left(
          4,
          seq(
            field("left", $._comparable_expression),
            field("operator", choice("+", "-")),
            field("right", $._comparable_expression),
          ),
        ),
        prec.left(
          5,
          seq(
            field("left", $._comparable_expression),
            field("operator", choice("*", "/", "%")),
            field("right", $._comparable_expression),
          ),
        ),
      ),

    unary_expression: ($) => prec.right(6, seq("-", field("operand", $._comparable_expression))),

    coercion_expression: ($) =>
      prec.left(
        7,
        seq(field("expression", $._comparable_expression), "as", field("type", $._type)),
      ),

    // Calls, members, and subscripts
    //
    // Callee and object fields use `_comparable_expression` to avoid condition
    // recursion. Delimiters let arguments and indices use the full expression rule.

    call_expression: ($) =>
      prec.left(8, seq(field("callee", $._comparable_expression), "(", commaSep($.argument), ")")),

    argument: ($) =>
      seq(optional(seq(field("label", $.identifier), ":")), field("value", $._expression)),

    member_expression: ($) =>
      prec.left(
        8,
        seq(field("object", $._comparable_expression), ".", field("property", $.identifier)),
      ),

    optional_member_expression: ($) =>
      prec.left(
        8,
        seq(field("object", $._comparable_expression), "?.", field("property", $.identifier)),
      ),

    subscript_expression: ($) =>
      prec.left(
        8,
        seq(field("object", $._comparable_expression), "[", field("index", $._expression), "]"),
      ),

    // Coalesce, ternary, and pipeline expressions

    coalesce_expression: ($) =>
      prec.left(
        2,
        seq(field("left", $._coalesce_operand), "??", field("right", $._comparable_expression)),
      ),

    // Conditions appear in `if` statements and ternary tests. Most condition
    // rules use comparable operands to avoid expression recursion.
    //
    // `boolean_reference` provides a truthy check for any bare expression.
    // Some inputs also match a specific condition. The declared conflict enables
    // both parses, and dynamic precedence selects the specific condition.
    _condition: ($) =>
      choice(
        $.comparison,
        $.range_test,
        $.type_test,
        $.boolean_reference,
        $.boolean_literal_condition,
        $.not_condition,
        $.and_condition,
        $.or_condition,
        $.parenthesized_condition,
      ),

    comparison: ($) =>
      seq(
        field("left", $._comparable_expression),
        field(
          "operator",
          choice(
            "==",
            "!=",
            "<",
            "<=",
            ">",
            ">=",
            "contains",
            "!contains",
            "hasPrefix",
            "hasSuffix",
          ),
        ),
        field("right", $._comparable_expression),
      ),

    range_test: ($) =>
      seq(
        field("subject", $._comparable_expression),
        "in",
        field("low", $._comparable_expression),
        "...",
        field("high", $._comparable_expression),
      ),

    type_test: ($) => seq(field("subject", $._comparable_expression), "is", field("type", $._type)),

    boolean_reference: ($) => prec.dynamic(-1, field("expression", $._expression)),

    boolean_literal_condition: (_$) => prec(1, field("value", choice("true", "false"))),

    // Negation binds tighter than `&&` and `||`. Therefore, `!a && b` parses
    // as `and_condition(not_condition(a), b)`.
    not_condition: ($) => prec(4, seq("!", field("operand", $._condition))),

    and_condition: ($) =>
      prec.left(2, seq(field("left", $._condition), "&&", field("right", $._condition))),

    or_condition: ($) =>
      prec.left(1, seq(field("left", $._condition), "||", field("right", $._condition))),

    parenthesized_condition: ($) => seq("(", $._condition, ")"),

    ternary_expression: ($) =>
      prec.right(
        3,
        seq(
          field("condition", $._condition),
          "?",
          field("consequent", $._expression),
          ":",
          field("alternate", $._expression),
        ),
      ),

    pipeline_expression: ($) =>
      prec.left(
        1,
        seq(
          field("left", $._pipeline_operand),
          field("operator", choice("|>", "|>?")),
          field("right", $.pipeline_stage),
        ),
      ),

    // Restrict the callee so `(...)` always belongs to the pipeline stage.
    // Otherwise, a call expression could consume the same arguments. This matches
    // `parsePipelineStage`, which accepts identifiers, qualified names, coerced
    // placeholders, and placeholder members.
    pipeline_stage: ($) =>
      seq(
        field("callee", choice($.identifier, $.member_expression, $.coercion_expression)),
        optional(seq("(", commaSep($.argument), ")")),
      ),

    // Collection and special literals

    list_literal: ($) => seq("[", commaSep($._expression), "]"),

    dictionary_literal: ($) =>
      seq(
        "{",
        choice(
          seq(":", "}"), // Empty dictionary: `{:}`.
          seq(commaSep1($.dictionary_entry), "}"),
        ),
      ),

    dictionary_entry: ($) => seq(field("key", $._expression), ":", field("value", $._expression)),

    hash_index: (_$) => token(seq("#", "index")),

    placeholder: (_$) => "_",

    // Imports

    // Package imports can include an alias. Path imports require one.
    import_declaration: ($) =>
      seq(
        "import",
        choice(
          seq(field("module", $.identifier), optional(seq("as", field("alias", $.identifier)))),
          seq(field("path", $.string_literal), "as", field("alias", $.identifier)),
        ),
        ";",
      ),

    // Shortcut metadata

    shortcut_metadata: ($) => seq("shortcut", "{", commaSep($.metadata_field), "}"),

    metadata_field: ($) => seq(field("name", $.identifier), ":", field("value", $._metadata_value)),

    _metadata_value: ($) =>
      choice(
        $.string_literal,
        $.raw_string,
        $.number_literal,
        $.boolean_literal,
        $.nil_literal,
        $.dot_name_expression,
        $.metadata_list,
      ),

    metadata_list: ($) => seq("[", commaSep($._metadata_value), "]"),

    // Types

    _type: ($) => choice($.named_type, $.list_type, $.quantity_type, $.optional_type),

    // A type qualifier takes precedence over member access. Therefore,
    // `x as Foo.Bar` treats `Foo.Bar` as the type. Parenthesize the coercion
    // to access a member of its result.
    named_type: ($) => prec.right(9, seq($.identifier, optional(seq(".", $.identifier)))),

    list_type: ($) => seq("List", "<", $._type, ">"),

    quantity_type: ($) => seq("Quantity", "<", $.identifier, ">"),

    optional_type: ($) => prec(1, seq($._type, "?")),

    // Constant and variable declarations

    const_declaration: ($) =>
      seq(
        optional("export"),
        "const",
        field("name", $.identifier),
        optional(seq(":", field("type", $._type))),
        "=",
        field("value", $._expression),
        ";",
      ),

    const_destructure: ($) =>
      seq("const", "{", commaSep1($.identifier), "}", "=", field("value", $._expression), ";"),

    let_declaration: ($) =>
      seq(
        optional("export"),
        "let",
        field("name", $.identifier),
        optional(seq(":", field("type", $._type))),
        "=",
        field("value", $._expression),
        ";",
      ),

    let_destructure: ($) =>
      seq("let", "{", commaSep1($.identifier), "}", "=", field("value", $._expression), ";"),

    // Enumerations

    enum_declaration: ($) =>
      seq(
        optional("export"),
        "enum",
        field("name", $.identifier),
        optional(seq("=", field("default_value", $.string_literal))),
        "{",
        commaSep1($.enum_case),
        "}",
      ),

    enum_case: ($) =>
      seq(
        field("name", $.identifier),
        optional(seq("=", field("value", choice($.string_literal, $.number_literal)))),
      ),

    // Records

    record_declaration: ($) =>
      seq(
        optional("export"),
        "record",
        field("name", $.identifier),
        "{",
        commaSep1($.record_field),
        "}",
      ),

    record_field: ($) => seq(field("name", $.identifier), ":", field("type", $._type)),

    // Functions

    function_declaration: ($) =>
      seq(
        optional("export"),
        "func",
        field("name", $.identifier),
        "(",
        commaSep($.function_parameter),
        ")",
        optional(seq("->", field("return_type", $._type))),
        field("body", $.block),
      ),

    function_parameter: ($) =>
      seq(
        field("name", $.identifier),
        ":",
        field("type", $._type),
        optional(seq("=", field("default_value", $._expression))),
      ),

    return_statement: ($) => seq("return", optional(field("value", $._expression)), ";"),

    block: ($) => seq("{", repeat($._statement), "}"),

    // Control flow

    if_statement: ($) =>
      seq(
        "if",
        "(",
        field("condition", $._condition),
        ")",
        field("body", $.block),
        optional(field("else", $.else_clause)),
      ),

    // An `else` body is a block or another `if_statement`. The clause must
    // consume `else`; otherwise, adjacent `if` statements become ambiguous.
    else_clause: ($) => seq("else", field("body", choice($.block, $.if_statement))),

    for_statement: ($) =>
      seq(
        "for",
        field("variable", $.identifier),
        "in",
        field("iterable", $._expression),
        field("body", $.block),
      ),

    repeat_statement: ($) => seq("repeat", field("count", $._expression), field("body", $.block)),

    menu_statement: ($) =>
      seq(
        "menu",
        field("prompt", $._expression),
        optional(
          seq("->", field("binding", $.identifier), optional(seq(":", field("type", $._type)))),
        ),
        "{",
        repeat($.menu_case),
        "}",
      ),

    // `parseMenuCase` accepts a string or a dot-name enum reference.
    menu_case: ($) =>
      seq(
        "case",
        field("label", choice($.string_literal, $.raw_string, $.dot_name_expression)),
        field("body", $.block),
      ),

    // Actions

    action_declaration: ($) =>
      seq(
        optional("export"),
        "action",
        field("name", $.identifier),
        "(",
        commaSep($.action_parameter),
        ")",
        optional(seq("->", field("return_type", $._type))),
        "=",
        field("runtime_identifier", $.string_literal),
        repeat($.attribute),
        ";",
      ),

    action_parameter: ($) =>
      seq(
        field("label", $.identifier),
        optional(field("name", $.identifier)),
        ":",
        field("type", $._type),
        optional(seq("=", field("default_value", $._expression))),
      ),

    attribute: ($) =>
      seq(
        "@",
        field("name", $.identifier),
        optional(seq("(", commaSep($.attribute_argument), ")")),
      ),

    attribute_argument: ($) => seq(field("name", $.identifier), ":", field("value", $._expression)),

    identifier: (_$) => /[a-zA-Z_][a-zA-Z0-9_]*/,

    number_literal: (_$) => token(choice(/[0-9]+/, /[0-9]+\.[0-9]+/)),

    string_literal: ($) =>
      seq($._string_start, repeat(choice($.string_content, $.interpolation)), $._string_end),

    interpolation: ($) => seq("${", $._expression, "}"),

    boolean_literal: (_$) => choice("true", "false"),

    nil_literal: (_$) => "nil",

    line_comment: (_$) => token(seq("//", /.*/)),
  },
});
