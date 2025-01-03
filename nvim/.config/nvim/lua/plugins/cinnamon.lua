return {
  "declancm/cinnamon.nvim",
  config = function()
    require("cinnamon").setup({
      -- Enable all provided keymaps
      keymaps = {
        basic = true,
        extra = true,
      },
      options = {
        max_delta = {
          time = 80,
        },
      },
    })
  end,
}
