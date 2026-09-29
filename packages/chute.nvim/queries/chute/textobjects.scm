(function_declaration) @function.outer
(function_declaration
  body: (block) @function.inner)

(action_declaration) @function.outer

(for_statement
  body: (block) @loop.inner) @loop.outer
(repeat_statement
  body: (block) @loop.inner) @loop.outer

(function_parameter) @parameter.inner
(action_parameter) @parameter.inner
(argument) @parameter.inner

(if_statement
  condition: (_) @conditional.inner) @conditional.outer

(assignment
  left: (_) @assignment.lhs
  right: (_) @assignment.rhs) @assignment.outer

(line_comment) @comment.outer
(block_comment) @comment.outer
(doc_comment) @comment.outer
