#!/usr/bin/env node
// @ts-check

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function main() {
  console.log("💾 Saving VSCode/Cursor Extension Lists...");

  save_editor("code", "linux-vscode/.vscode/extensions/list.txt");
  save_editor("cursor", "linux-cursor/.cursor/extensions/list.txt");

  console.log("✅ Extension lists saved!");
}

/**
 * @param {string} command - Editor command ("code" or "cursor")
 * @param {string} list_file - Relative path to extension list file
 */
function save_editor(command, list_file) {
  console.log(`📋 ${command.toUpperCase()}:`);
  const list_file_path = path.join(__dirname, list_file);
  const command_path = get_command_path(command);

  if (command_path == null) {
    console.log(`   ⚠️  Missing ${command} CLI. Skipping extension save.`);
    return;
  }

  const installed_extensions = get_installed_extensions(command_path);
  write_list(list_file_path, installed_extensions);
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
 * Update the extension list file with currently installed extensions
 * @param {string} list_file_path - Full path to the list.txt file
 * @param {string[]} extensions
 */
function write_list(list_file_path, extensions) {
  // Ensure directory exists
  const dir = path.dirname(list_file_path);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(list_file_path, extensions.join("\n") + "\n");
  console.log(
    `   ✅ List updated: ${
      extensions.length
    } extensions written to ${path.relative(__dirname, list_file_path)}`
  );
}

main();
