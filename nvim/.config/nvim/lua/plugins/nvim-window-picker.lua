return {
  "s1n7ax/nvim-window-picker",
  event = "VeryLazy",
  config = function()
    require("window-picker").setup({
      hint = "floating-big-letter",
    })
  end,
}
