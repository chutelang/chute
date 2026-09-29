# chute.nvim

Neovim support for the [Chute](https://github.com/chutelang/chute) language.

## Features

- Filetype detection for `.chute` files
- Syntax highlighting, indentation, folds, and textobjects via tree-sitter
- LSP integration via `chute lsp`
- Health check via `:checkhealth chute`

## Requirements

- Neovim 0.10+
- [Chute CLI](https://github.com/chutelang/chute) on your `$PATH` (for LSP)
- [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter) (optional, for syntax highlighting)

## Installation

The plugin lives inside the Chute monorepo. Point your plugin manager at
the repo and configure the runtime path to the `packages/chute.nvim`
subdirectory.

### lazy.nvim

```lua
{
  'chutelang/chute',
  init = function(plugin)
    vim.opt.rtp:append(plugin.dir .. '/packages/chute.nvim')
  end,
}
```

### vim-plug

```vim
Plug 'chutelang/chute', { 'rtp': 'packages/chute.nvim' }
```

### vim.pack (Neovim 0.11+)

Add to your `init.lua` after vim.pack setup:

```lua
gh 'chutelang/chute'
```

Then add the subdirectory to your runtime path:

```lua
vim.opt.rtp:append(
  vim.fn.stdpath('data')
    .. '/site/pack/github/start/chute/packages/chute.nvim'
)
```

### Tree-sitter parser

After installing the plugin, install the Chute tree-sitter parser:

```vim
:TSInstall chute
```

## Configuration

| Variable | Default | Description |
|---|---|---|
| `vim.g.chute_cmd` | `"chute"` | Path to the `chute` binary |

## License

Apache-2.0
