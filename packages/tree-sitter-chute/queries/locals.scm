; Scopes
(function_declaration
  body: (block) @local.scope)
(for_statement
  body: (block) @local.scope)
(repeat_statement
  body: (block) @local.scope)
(if_statement
  body: (block) @local.scope)
(else_clause
  body: (block) @local.scope)
(menu_case
  body: (block) @local.scope)

; Definitions
(const_declaration
  name: (identifier) @local.definition)
(let_declaration
  name: (identifier) @local.definition)
(function_parameter
  name: (identifier) @local.definition)
(action_parameter
  name: (identifier) @local.definition)
(for_statement
  variable: (identifier) @local.definition)
(menu_statement
  binding: (identifier) @local.definition)
(const_destructure
  (identifier) @local.definition)
(let_destructure
  (identifier) @local.definition)

; References
(identifier) @local.reference
