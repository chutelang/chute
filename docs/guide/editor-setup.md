# Editor setup

Chute provides extensions for VS Code and Neovim. Both extensions add syntax highlighting and connect to the Chute language server for diagnostics, completions, hover information, and definition lookup.

## VS Code

### Install the extension

Install **Chute** from the VS Code Marketplace. To install a local `.vsix` file, run:

```sh
code --install-extension chute-x.x.x.vsix
```

The extension starts when you open a `.chute` file. If the `chute` CLI isn't on your `PATH`, the extension displays installation instructions.

### Features

- Syntax highlighting covers keywords, interpolated strings, types, declarations, and comments.
- Diagnostics display type errors and warnings in the editor.
- Completions include standard library actions after a module name and `.`, plus dot-name enum cases.
- Hover information shows action and function signatures with descriptions.
- Definition lookup opens function, action, and variable declarations.

### Settings

| Setting | Default | Description |
| --- | --- | --- |
| `chute.lsp.enabled` | `true` | Enables or disables the language server. |
| `chute.lsp.serverPath` | `""` | Sets the path to the `chute` binary. An empty value uses `chute` from your `PATH`. |
| `chute.trace.server` | `off` | Sets the LSP trace level to `off`, `messages`, or `verbose`. |

## Neovim

Install Neovim 0.10 or later and [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter) before installing the Chute extension.

### Install the extension

#### lazy.nvim

```lua
{
  "chutelang/chute",
  init = function(plugin)
    vim.opt.rtp:append(plugin.dir .. "/packages/chute.nvim")
  end,
}
```

#### vim-plug

```vim
Plug 'chutelang/chute', { 'rtp': 'packages/chute.nvim' }
```

After you install the plugin, run `:TSInstall chute` to install the Tree-sitter parser.

### Features

- Tree-sitter highlights keywords, types, declarations, interpolated strings, enum cases, and special variables such as `#index`.
- The Chute language server provides diagnostics, completions, hover information, and definition lookup when you open a `.chute` file.
- The plugin configures code folding and indentation.
- Text objects select syntax units such as a function body.
- Filetype detection configures two-space indentation and `//` comments for `.chute` files.

### Configuration

Set `vim.g.chute_cmd` to a custom path if `chute` isn't on your PATH:

```lua
vim.g.chute_cmd = "/usr/local/bin/chute"
```

### Health check

Run `:checkhealth chute` to check the `chute` binary and Tree-sitter parser.
