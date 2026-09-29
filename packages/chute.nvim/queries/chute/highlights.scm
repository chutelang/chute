; Keywords
["const" "let" "func" "return" "if" "else" "for" "in" "repeat"
 "enum" "record" "action" "import" "export" "menu" "case"
 "shortcut" "as" "is"] @keyword
["contains" "!contains" "hasPrefix" "hasSuffix"] @keyword.operator

; Operators
["+" "-" "*" "/" "%" "=" "==" "!=" "<" "<=" ">" ">="
 "??" "|>" "|>?" "&&" "||" "!" "..." "->" "?." "?"] @operator

; Punctuation
["(" ")" "{" "}" "[" "]"] @punctuation.bracket
[";" ":" "," "."] @punctuation.delimiter
"@" @punctuation.special

; Literals
(number_literal) @number
(boolean_literal) @boolean
(nil_literal) @constant.builtin

; Strings
(string_literal) @string
(string_content) @string
(raw_string) @string
(interpolation
  "${" @punctuation.special
  "}" @punctuation.special) @embedded

; Types
(named_type) @type
(list_type "List" @type.builtin)
(quantity_type "Quantity" @type.builtin)
(optional_type "?" @punctuation.special)

; Functions
(function_declaration
  name: (identifier) @function)
(action_declaration
  name: (identifier) @function)
(call_expression
  callee: (identifier) @function.call)
(call_expression
  callee: (member_expression
    property: (identifier) @function.method.call))
(pipeline_stage
  callee: (identifier) @function.call)
(pipeline_stage
  callee: (member_expression
    property: (identifier) @function.method.call))

; Parameters
(function_parameter
  name: (identifier) @variable.parameter)
(action_parameter
  label: (identifier) @variable.parameter)
(action_parameter
  name: (identifier) @variable.parameter)

; Call argument labels
(argument
  label: (identifier) @variable.parameter)

; Declarations
(const_declaration
  name: (identifier) @variable)
(let_declaration
  name: (identifier) @variable)
(enum_declaration
  name: (identifier) @type.definition)
(record_declaration
  name: (identifier) @type.definition)
(enum_case
  name: (identifier) @constant)
(record_field
  name: (identifier) @property)

; Imports
(import_declaration
  module: (identifier) @module)
(import_declaration
  alias: (identifier) @module)

; Menu binding
(menu_statement
  binding: (identifier) @variable)

; Metadata
(metadata_field
  name: (identifier) @property)

; Attributes
(attribute
  name: (identifier) @attribute)
(attribute_argument
  name: (identifier) @property)

; Comments
(line_comment) @comment
(block_comment) @comment
(doc_comment) @comment.documentation

; Loop variables
(for_statement
  variable: (identifier) @variable)

; Dot-name enum references, such as `.SomeCase`
(dot_name_expression
  name: (identifier) @constant)

; Special
(hash_index) @variable.builtin
(placeholder) @variable.builtin

; Fallback identifiers
(identifier) @variable
