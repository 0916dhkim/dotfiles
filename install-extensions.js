#!/usr/bin/env node
// @ts-check

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function main() {
  console.log("📥 Installing VSCode/Cursor Extensions from Lists...");

  install_editor("code", "linux-vscode/.vscode/extensions/list.txt");
  install_editor("cursor", "linux-cursor/.cursor/extensions/list.txt");

  console.log("✅ Extension installation complete!");
}

/**
 * @param {string} command - Editor command ("code" or "cursor")
 * @param {string} list_file - Relative path to extension list file
 */
function install_editor(command, list_file) {
  console.log(`📋 ${command.toUpperCase()}:`);
  const list_file_path = path.join(__dirname, list_file);
  const command_path = get_command_path(command);

  if (!fs.existsSync(list_file_path)) {
    console.log(
      `   ⚠️  Extensions list not found. Skipping extensions install.`
    );
    return;
  }

  if (command_path == null) {
    console.log(`   ⚠️  Missing ${command} CLI. Skipping extension install.`);
    return;
  }

  pull_from_extensions_list(command_path, list_file_path);
}

/**
 * Sync local extensions to match the extension list file
 * @param {string} command_path - Full path to editor CLI command
 * @param {string} list_file_path - Full path to the list.txt file
 */
function pull_from_extensions_list(command_path, list_file_path) {
  // Read desired extensions from file
  const desired_extensions = new Set(read_list(list_file_path));
  const installed_extensions = new Set(get_installed_extensions(command_path));

  const to_install = [...desired_extensions].filter(
    (ext) => !installed_extensions.has(ext)
  );
  const to_uninstall = [...installed_extensions].filter(
    (ext) => !desired_extensions.has(ext)
  );

  install_extensions(command_path, to_install);
  uninstall_extensions(command_path, to_uninstall);

  if (to_install.length > 0 || to_uninstall.length > 0) {
    console.log(
      `   ✅ Sync complete: ${to_install.length} installed, ${to_uninstall.length} uninstalled`
    );
  } else {
    console.log(
      `   ✅ Already in sync: ${installed_extensions.size} extensions`
    );
  }
}

/**
 * @param {string} command
 * @returns {string|null}
 */
function get_command_path(command) {
  try {
    const result = execSync(`command -v ${command}`, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return result || null;
  } catch {
    return null;
  }
}

/**
 * @param {string} command_path - Full path to editor CLI command
 */
function get_installed_extensions(command_path) {
  return execSync(`${command_path} --list-extensions`, {
    encoding: "utf-8",
  })
    .trim()
    .split("\n")
    .filter(Boolean)
    .sort();
}

/**
 * @param {string} command_path - Full path to editor CLI command
 * @param {string[]} extensions
 */
function install_extensions(command_path, extensions) {
  if (extensions.length === 0) {
    return;
  }
  execSync(
    `${command_path} ${extensions
      .map((ext) => `--install-extension ${ext}`)
      .join(" ")}`,
    {
      stdio: "inherit",
    }
  );
}

/**
 * @param {string} command_path - Full path to editor CLI command
 * @param {string[]} extensions
 */
function uninstall_extensions(command_path, extensions) {
  console.log(
    "Skipping uninstall because Cursor CLI does not support uninstalling multiple extensions."
  );
  for (const ext of extensions) {
    console.log(`Skipping ${ext}`);
  }
  return;
  // TODO: restore when the issue is resolved: https://forum.cursor.com/t/command-line-list-extensions/103565/13
  if (extensions.length === 0) {
    return;
  }
  execSync(
    `${command_path} ${extensions
      .map((ext) => `--uninstall_extension ${ext}`)
      .join(" ")}`,
    {
      stdio: "inherit",
    }
  );
}

/**
 * @param {string} list_file_path - Full path to the list.txt file
 */
function read_list(list_file_path) {
  return fs
    .readFileSync(list_file_path, "utf-8")
    .trim()
    .split("\n")
    .filter(Boolean);
}

main();
