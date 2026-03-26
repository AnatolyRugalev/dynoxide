"use strict";

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Derive platform lookup from the canonical platforms.json (single source of truth).
// Each entry becomes a key of "os-cpu" with the npm package name and binary name.
// Linux x64 has both glibc and musl entries, which both land under the same key.
const platformsData = require("../platforms.json");
const PLATFORMS = {};
for (const entry of platformsData) {
  const key = entry.os + "-" + entry.cpu;
  if (!PLATFORMS[key]) {
    PLATFORMS[key] = { packages: [], binary: entry.binary_name };
  }
  PLATFORMS[key].packages.push({
    name: entry.npm_package,
    libc: entry.libc,
  });
}

function isMusl() {
  if (process.platform !== "linux") return false;

  try {
    const output = execSync("ldd --version 2>&1", {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return output.toLowerCase().includes("musl");
  } catch (err) {
    // ldd --version exits non-zero on musl systems and prints to stderr
    const stderr = err.stderr ? err.stderr.toString() : "";
    const stdout = err.stdout ? err.stdout.toString() : "";
    if ((stderr + stdout).toLowerCase().includes("musl")) return true;

    // Fallback: if ldd is not installed at all (minimal Alpine), check for musl loader
    try {
      const files = fs.readdirSync("/lib");
      if (files.some((f) => f.startsWith("ld-musl-"))) return true;
    } catch {
      // /lib doesn't exist or isn't readable
    }
    return false;
  }
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

  // Order packages by libc preference: prefer the matching variant, fall back to the other
  let packages = entry.packages.map((p) => p.name);
  if (entry.packages.length > 1 && process.platform === "linux") {
    const musl = isMusl();
    const preferred = musl ? "musl" : "glibc";
    packages = entry.packages
      .slice()
      .sort((a, b) => {
        if (a.libc === preferred && b.libc !== preferred) return -1;
        if (b.libc === preferred && a.libc !== preferred) return 1;
        return 0;
      })
      .map((p) => p.name);
  }

  for (const pkg of packages) {
    const dir = resolvePackage(pkg);
    if (dir) {
      const binaryPath = path.join(dir, entry.binary);
      if (fs.existsSync(binaryPath)) return binaryPath;
      // Package installed but binary missing (corrupt install), try the next one
    }
  }

  // None of the platform packages are installed
  const pkgList = packages.join(" or ");
  console.error(
    `The platform package ${pkgList} is not installed.\n\n` +
      `This usually means npm was run with --no-optional or --ignore-optional.\n` +
      `Try reinstalling: npm install dynoxide\n\n` +
      `If the problem persists, install Dynoxide directly:\n` +
      `  brew install nubo-db/tap/dynoxide\n` +
      `  cargo install dynoxide-rs`
  );
  process.exit(1);
}

module.exports = { getBinaryPath };
