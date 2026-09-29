if vim.b.did_ftplugin then
  return
end
vim.b.did_ftplugin = true

vim.bo.commentstring = '// %s'
vim.bo.shiftwidth = 2
vim.bo.expandtab = true
vim.bo.tabstop = 2
vim.bo.softtabstop = 2

vim.b.undo_ftplugin = 'setlocal commentstring< shiftwidth< expandtab< tabstop< softtabstop<'

local cmd = vim.g.chute_cmd or 'chute'

if vim.fn.executable(cmd) == 1 then
  vim.lsp.start({
    name = 'chute',
    cmd = { cmd, 'lsp' },
    root_dir = vim.fs.root(0, 'chute.json') or vim.fn.expand('%:p:h'),
  })
end
