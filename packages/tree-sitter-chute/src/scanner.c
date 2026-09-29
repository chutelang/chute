#include "tree_sitter/parser.h"
#include "tree_sitter/array.h"

#include <stdbool.h>
#include <string.h>

enum TokenType {
  STRING_START,
  STRING_CONTENT,
  STRING_END,
  BLOCK_COMMENT,
  RAW_STRING,
  DOC_COMMENT,
};

// The stack contains one unused byte for each open string. The grammar parses
// interpolation braces, while this stack records whether a string is open.
// Tree-sitter can share lexer states, so `valid_symbols` alone isn't enough.
//
// A failed scan restores the last serialized state. Mutate the stack only on
// branches that return `true`.
typedef struct {
  Array(uint8_t) open_strings;
} Scanner;

void *tree_sitter_chute_external_scanner_create(void) {
  Scanner *scanner = ts_malloc(sizeof(Scanner));
  array_init(&scanner->open_strings);
  return scanner;
}

void tree_sitter_chute_external_scanner_destroy(void *payload) {
  Scanner *scanner = (Scanner *)payload;
  array_delete(&scanner->open_strings);
  ts_free(scanner);
}

unsigned tree_sitter_chute_external_scanner_serialize(void *payload, char *buffer) {
  Scanner *scanner = (Scanner *)payload;
  unsigned size = scanner->open_strings.size;
  if (size > TREE_SITTER_SERIALIZATION_BUFFER_SIZE) {
    size = TREE_SITTER_SERIALIZATION_BUFFER_SIZE;
  }
  if (size > 0) {
    memcpy(buffer, scanner->open_strings.contents, size);
  }
  return size;
}

void tree_sitter_chute_external_scanner_deserialize(
  void *payload,
  const char *buffer,
  unsigned length
) {
  Scanner *scanner = (Scanner *)payload;
  array_clear(&scanner->open_strings);
  if (length > 0) {
    array_grow_by(&scanner->open_strings, length);
    memcpy(scanner->open_strings.contents, buffer, length);
  }
}

static inline void advance(TSLexer *lexer) {
  lexer->advance(lexer, false);
}

// Scans content through the next unescaped quote, interpolation, or EOF.
// Returns `false` at an interpolation so the grammar can parse it. Escapes are
// consumed as two bytes because the scanner only needs to find token boundaries.
static bool scan_string_content(Scanner *scanner, TSLexer *lexer) {
  bool has_content = false;

  for (;;) {
    if (lexer->eof(lexer)) {
      if (has_content) {
        lexer->mark_end(lexer);
        lexer->result_symbol = STRING_CONTENT;
        return true;
      }
      return false;
    }

    if (lexer->lookahead == '"') {
      if (has_content) {
        lexer->mark_end(lexer);
        lexer->result_symbol = STRING_CONTENT;
        return true;
      }
      advance(lexer);
      lexer->mark_end(lexer);
      lexer->result_symbol = STRING_END;
      array_pop(&scanner->open_strings);
      return true;
    }

    if (lexer->lookahead == '$') {
      // Preserve `$` for the grammar if it begins an interpolation.
      lexer->mark_end(lexer);
      advance(lexer);
      if (lexer->lookahead == '{') {
        if (has_content) {
          lexer->result_symbol = STRING_CONTENT;
          return true;
        }
        return false;
      }
      has_content = true;
      continue;
    }

    if (lexer->lookahead == '\\') {
      advance(lexer);
      if (!lexer->eof(lexer)) {
        advance(lexer);
      }
      has_content = true;
      continue;
    }

    advance(lexer);
    has_content = true;
  }
}

// Emits `string_start` and records the open string.
static bool scan_string_start(Scanner *scanner, TSLexer *lexer) {
  array_push(&scanner->open_strings, (uint8_t)0);
  advance(lexer);
  lexer->mark_end(lexer);
  lexer->result_symbol = STRING_START;
  return true;
}

// Emits the raw string and its delimiters as one token. The opening and closing
// delimiters must use the same number of hashes.
static bool scan_raw_string(TSLexer *lexer) {
  unsigned hashes = 0;
  while (lexer->lookahead == '#') {
    advance(lexer);
    hashes++;
  }
  if (lexer->lookahead != '"') {
    return false;
  }
  advance(lexer);

  for (;;) {
    if (lexer->eof(lexer)) {
      return false;
    }

    if (lexer->lookahead == '"') {
      advance(lexer);
      unsigned matched = 0;
      while (matched < hashes && lexer->lookahead == '#') {
        advance(lexer);
        matched++;
      }
      if (matched == hashes) {
        lexer->mark_end(lexer);
        lexer->result_symbol = RAW_STRING;
        return true;
      }
      continue;
    }

    advance(lexer);
  }
}

// Scans nested block comments and documentation comments. `/**/` is an empty
// block comment because it has no documentation content.
static bool scan_comment(TSLexer *lexer) {
  advance(lexer); // Consume `/`.
  if (lexer->lookahead != '*') {
    return false;
  }
  advance(lexer); // Consume `*` and open the first nesting level.

  bool maybe_doc = lexer->lookahead == '*';
  if (maybe_doc) {
    advance(lexer); // Consume the second `*`.
    if (lexer->lookahead == '/') {
      // `/**/` has no documentation content, so emit a block comment.
      advance(lexer);
      lexer->mark_end(lexer);
      lexer->result_symbol = BLOCK_COMMENT;
      return true;
    }
  }

  unsigned depth = 1;
  while (depth > 0) {
    if (lexer->eof(lexer)) {
      return false;
    }

    if (lexer->lookahead == '*') {
      advance(lexer);
      if (lexer->lookahead == '/') {
        advance(lexer);
        depth--;
      }
      continue;
    }

    if (lexer->lookahead == '/') {
      advance(lexer);
      if (lexer->lookahead == '*') {
        advance(lexer);
        depth++;
      }
      continue;
    }

    advance(lexer);
  }

  lexer->mark_end(lexer);
  lexer->result_symbol = maybe_doc ? DOC_COMMENT : BLOCK_COMMENT;
  return true;
}

bool tree_sitter_chute_external_scanner_scan(
  void *payload,
  TSLexer *lexer,
  const bool *valid_symbols
) {
  Scanner *scanner = (Scanner *)payload;

  // Accept string symbols only when the stack confirms that a string is open.
  bool in_string =
    scanner->open_strings.size > 0 &&
    (valid_symbols[STRING_CONTENT] || valid_symbols[STRING_END]);

  if (!in_string) {
    // Skip whitespace here so this scanner can reach a string or comment in
    // the same lexer state.
    while (!lexer->eof(lexer) &&
           (lexer->lookahead == ' ' || lexer->lookahead == '\t' ||
            lexer->lookahead == '\n' || lexer->lookahead == '\r')) {
      lexer->advance(lexer, true);
    }
  }

  if (in_string) {
    return scan_string_content(scanner, lexer);
  }

  if (lexer->lookahead == '/' && (valid_symbols[BLOCK_COMMENT] || valid_symbols[DOC_COMMENT])) {
    return scan_comment(lexer);
  }

  if (lexer->lookahead == '#' && valid_symbols[RAW_STRING]) {
    return scan_raw_string(lexer);
  }

  if (lexer->lookahead == '"' && valid_symbols[STRING_START]) {
    return scan_string_start(scanner, lexer);
  }

  return false;
}
