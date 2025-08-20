# Cursor (Linux)

`settings.json` and `keybindings.json` files are symlinked to the matching files in VS Code dotfiles. They are compatible.

## Extensions

I did not symlink the `extensions.json` file to VS Code `extensions.json`.
Although Cursor is compatible with almost all VS Code extensions, there are a few notable exceptions.

- Cursor needs `anysphere.remote-wsl` and friends instead of `ms-vscode-remote.remote-wsl`. This is for Cursor-specific features.
- `github.copilot` and `github.copilot-chat` extensions are not compatible with Cursor.
