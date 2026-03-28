"use strict";

const fs = require("fs");
const path = require("path");

// Derive platform lookup from the canonical platforms.json (single source of truth).
// Each entry becomes a key of "os-cpu" with the npm package name and binary name.
const platformsData = require("../platforms.json");
const PLATFORMS = {};
for (const entry of platformsData) {
  const key = entry.os + "-" + entry.cpu;
  PLATFORMS[key] = { package: entry.npm_package, binary: entry.binary_name };
}

function resolvePackage(packageName) {
  try {
    const packageDir = path.dirname(
      require.resolve(packageName + "/package.json")
    );
    return packageDir;
  } catch {
    return null;
  }
}

function getBinaryPath() {
  const key = process.platform + "-" + process.arch;
  const entry = PLATFORMS[key];

  if (!entry) {
    const supported = Object.keys(PLATFORMS).join(", ");
    console.error(
      `Dynoxide does not have a prebuilt binary for ${process.platform}-${process.arch}.\n` +
        `Supported platforms: ${supported}\n\n` +
        `You can install Dynoxide from source with: cargo install dynoxide-rs`
    );
    process.exit(1);
  }

  const dir = resolvePackage(entry.package);
  if (dir) {
    const binaryPath = path.join(dir, entry.binary);
    if (fs.existsSync(binaryPath)) return binaryPath;
  }

  console.error(
    `The platform package ${entry.package} is not installed.\n\n` +
      `This usually means npm was run with --no-optional or --ignore-optional.\n` +
      `Try reinstalling: npm install dynoxide\n\n` +
      `If the problem persists, install Dynoxide directly:\n` +
      `  brew install nubo-db/tap/dynoxide\n` +
      `  cargo install dynoxide-rs`
  );
  process.exit(1);
}

module.exports = { getBinaryPath };
