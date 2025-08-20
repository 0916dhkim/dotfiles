#!/usr/bin/env node
// @ts-check

const { execSync } = require("child_process");
const os = require("os");
const fs = require("fs");

function main() {
  const directories = getAllDirectories();

  for (const dir of directories) {
    installIfMatchingOS(dir);
  }

  console.log("All dotfiles installed successfully!");
}

/** @type {Partial<Record<NodeJS.Platform, string>>} */
const OS_PREFIX = {
  linux: "linux-",
  darwin: "mac-",
};

function getAllDirectories() {
  const entries = fs.readdirSync(__dirname, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .filter((entry) => !entry.name.startsWith(".")); // Exclude hidden directories
}

/**
 * @param {string} name
 */
function shouldInstall(name) {
  const device_os = os.platform();
  for (const [os, prefix] of Object.entries(OS_PREFIX)) {
    if (name.startsWith(prefix)) {
      if (os === device_os) {
        return true;
      } else {
        return false;
      }
    }
  }
  return true;
}

/**
 * @param {fs.Dirent} dir
 */
function installIfMatchingOS(dir) {
  if (!shouldInstall(dir.name)) {
    console.log(`Skipping ${dir.name}`);
    return;
  }
  console.log(`Stowing ${dir.name} ...`);
  execSync(`stow -t ~ "${dir.name}"`, { stdio: "inherit", cwd: __dirname });
}

main();
