local M = {}

function M.check()
  vim.health.start('chute')

  local cmd = vim.g.chute_cmd or 'chute'
  if vim.fn.executable(cmd) == 1 then
    vim.health.ok(cmd .. ' found')
  else
    vim.health.error(cmd .. ' not found', {
      'Install the Chute CLI: npm install -g @chutelang/cli',
      'Or set vim.g.chute_cmd to the path of the chute binary',
    })
  end

  local parser_ok = pcall(vim.treesitter.language.inspect, 'chute')
  if parser_ok then
    vim.health.ok('tree-sitter parser installed')
  else
    vim.health.warn('tree-sitter parser not installed', {
      'Install nvim-treesitter and run :TSInstall chute',
    })
  end
end

return M
