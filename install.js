#!/usr/bin/env node
// @ts-check

const { execSync } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

function main() {
  installGitHooksIfNotExist();

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

function installGitHooksIfNotExist() {
  // Create a symlink for post-merge in .git/hooks if it doesn't exist
  const postMergeLink = path.join(__dirname, ".git/hooks/post-merge");
  const postMergeTarget = path.join(__dirname, "post-merge.js");

  if (fs.existsSync(postMergeLink)) {
    return;
  }

  console.log("Installing git hooks...");
  fs.symlinkSync(postMergeTarget, postMergeLink);
  console.log("Installed git hooks.");
}

main();
