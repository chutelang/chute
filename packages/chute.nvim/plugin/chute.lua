local ok, parsers = pcall(require, 'nvim-treesitter.parsers')
if not ok then
  return
end

parsers.get_parser_configs().chute = {
  install_info = {
    url = 'https://github.com/chutelang/chute',
    location = 'packages/tree-sitter-chute',
    files = { 'src/parser.c', 'src/scanner.c' },
    branch = 'master',
  },
  filetype = 'chute',
}
