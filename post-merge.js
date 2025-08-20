#!/usr/bin/env node
// @ts-check

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

function main() {
  console.log(
    "🔄 VSCode/Cursor Extension Sync - Auto-detecting sync direction...",
  );

  sync_editor("code", "linux-vscode/.vscode/extensions/list.txt");
  sync_editor("cursor", "linux-cursor/.cursor/extensions/list.txt");

  console.log("✅ Extension sync complete!");
}

/**
 * @param {string} command - Editor command ("code" or "cursor")
 * @param {string} list_file - Relative path to extension list file
 */
function sync_editor(command, list_file) {
  console.log(`📋 ${command.toUpperCase()}:`);
  const list_file_path = path.join(__dirname, list_file);
  const command_path = get_command_path(command);

  if (!fs.existsSync(list_file_path)) {
    console.log(`   ⚠️  Extensions list not found. Skipping extensions sync.`);
    return;
  }

  if (command_path == null) {
    console.log(`   ⚠️  Missing ${command} CLI. Skipping extension sync.`);
    return;
  }

  const sync_direction = determine_sync_direction(command, list_file_path);

  switch (sync_direction) {
    case "push-to-list":
      console.log(`   → Extensions are newer, pushing to list file...`);
      push_to_extensions_list(command_path, list_file_path);
      break;
    case "pull-from-list":
      console.log(`   → List file is newer, pulling from list...`);
      pull_from_extensions_list(command_path, list_file_path);
      break;
  }
}

/**
 * Determine whether to pull from list or push to list based on timestamps
 * @param {string} editor - "code" or "cursor"
 * @param {string} list_file_path - Path to the list.txt file
 * @returns {"pull-from-list" | "push-to-list"} - Action to take
 */
function determine_sync_direction(editor, list_file_path) {
  const extension_timestamp = get_extension_timestamp(editor);
  const list_timestamp = get_list_file_timestamp(list_file_path);

  console.log(
    `   Extension timestamp: ${
      extension_timestamp
        ? new Date(extension_timestamp).toLocaleString()
        : "N/A"
    }`,
  );
  console.log(
    `   List file timestamp: ${
      list_timestamp ? new Date(list_timestamp).toLocaleString() : "N/A"
    }`,
  );

  return extension_timestamp > list_timestamp
    ? "push-to-list"
    : "pull-from-list";
}

/**
 * Update the extension list file with currently installed extensions
 * @param {string} command_path - Full path to editor CLI command
 * @param {string} list_file_path - Full path to the list.txt file
 */
function push_to_extensions_list(command_path, list_file_path) {
  const installed_extensions = get_installed_extensions(command_path);
  write_list(list_file_path, installed_extensions);
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
    (ext) => !installed_extensions.has(ext),
  );
  const to_uninstall = [...installed_extensions].filter(
    (ext) => !desired_extensions.has(ext),
  );

  install_extensions(command_path, to_install);
  uninstall_extensions(command_path, to_uninstall);

  if (to_install.length > 0 || to_uninstall.length > 0) {
    console.log(
      `   ✅ Sync complete: ${to_install.length} installed, ${to_uninstall.length} uninstalled`,
    );
  } else {
    console.log(
      `   ✅ Already in sync: ${installed_extensions.size} extensions`,
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
    `${command_path} ${extensions.map((ext) => `--install-extension ${ext}`).join(" ")}`,
    {
      stdio: "inherit",
    },
  );
}

/**
 * @param {string} command_path - Full path to editor CLI command
 * @param {string[]} extensions
 */
function uninstall_extensions(command_path, extensions) {
  if (extensions.length === 0) {
    return;
  }
  execSync(
    `${command_path} ${extensions.map((ext) => `--uninstall_extension ${ext}`).join(" ")}`,
    {
      stdio: "inherit",
    },
  );
}

/**
 * Update the extension list file with currently installed extensions
 * @param {string} list_file_path - Full path to the list.txt file
 */
function read_list(list_file_path) {
  return fs
    .readFileSync(list_file_path, "utf-8")
    .trim()
    .split("\n")
    .filter(Boolean);
}

/**
 * Update the extension list file with currently installed extensions
 * @param {string} list_file_path - Full path to the list.txt file
 * @param {string[]} extensions
 */
function write_list(list_file_path, extensions) {
  fs.writeFileSync(list_file_path, extensions.join("\n") + "\n");
  console.log(
    `   ✅ List updated: ${
      extensions.length
    } extensions written to ${path.relative(__dirname, list_file_path)}`,
  );
}

/**
 * Get the modification timestamp of the extensions.json file
 * @param {string} editor - "code" or "cursor"
 * @returns {number} - Timestamp in milliseconds, 0 if file doesn't exist
 */
function get_extension_timestamp(editor) {
  const extensions_json_path =
    editor === "code"
      ? path.join(os.homedir(), ".vscode/extensions/extensions.json")
      : path.join(os.homedir(), ".cursor/extensions/extensions.json");

  if (!fs.existsSync(extensions_json_path)) return 0;
  return fs.statSync(extensions_json_path).mtime.getTime();
}

/**
 * Get the modification timestamp of the extension list file
 * @param {string} list_file_path - Path to the list.txt file
 * @returns {number} - Timestamp in milliseconds, 0 if file doesn't exist
 */
function get_list_file_timestamp(list_file_path) {
  if (!fs.existsSync(list_file_path)) return 0;
  return fs.statSync(list_file_path).mtime.getTime();
}

main();
