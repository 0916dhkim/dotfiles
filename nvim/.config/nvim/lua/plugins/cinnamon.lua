return {
  "declancm/cinnamon.nvim",
  config = function()
    require("cinnamon").setup({
      options = {
        max_delta = {
          time = 80,
        },
      },
    })
  end,
}
