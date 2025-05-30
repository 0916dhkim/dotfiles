-- Options are automatically loaded before lazy.nvim startup
-- Default options that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/options.lua
-- Add any additional options here
vim.g.root_spec = { ".git", "cwd" }
local opt = vim.opt
opt.relativenumber = false

vim.g.lazyvim_eslint_auto_format = true
