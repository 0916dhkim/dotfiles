#!/usr/bin/env node
// @ts-check

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function main() {
  sync_extensions("code", "linux-vscode/.vscode/extensions/list.txt");
  sync_extensions("cursor", "linux-cursor/.cursor/extensions/list.txt");
}

/**
 * @param {string} command
 * @param {string} list_file
 * @returns
 */
function sync_extensions(command, list_file) {
  const command_path = get_command_path(command);
  if (command_path == null) {
    console.log(`Missing ${command} CLI. Skipping extensions sync.`);
    return;
  }

  const list_file_path = path.join(__dirname, list_file);
  if (!fs.existsSync(list_file_path)) {
    console.log(
      `${command} extensions list not found. Skipping extensions sync.`
    );
    return;
  }

  // Read desired extensions from file
  const desired_extensions = new Set(
    fs.readFileSync(list_file_path, "utf-8").trim().split("\n").filter(Boolean)
  );
  const installed_extensions = new Set(
    execSync(`${command_path} --list-extensions`, { encoding: "utf-8" })
      .trim()
      .split("\n")
      .filter(Boolean)
  );

  const to_install = [...desired_extensions].filter(
    (ext) => !installed_extensions.has(ext)
  );
  const to_uninstall = [...installed_extensions].filter(
    (ext) => !desired_extensions.has(ext)
  );

  for (const extension of to_install) {
    execSync(`${command_path} --install-extension ${extension}`, {
      stdio: "inherit",
    });
  }

  for (const extension of to_uninstall) {
    execSync(`${command_path} --uninstall-extension ${extension}`, {
      stdio: "inherit",
    });
  }

  console.log(
    `${command} extensions sync complete. ${to_install.length} installed ${to_uninstall.length} uninstalled.`
  );
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

main();
