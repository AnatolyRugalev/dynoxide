# Dynoxide

A fast, lightweight DynamoDB emulator. Drop-in replacement for [dynalite](https://github.com/mhart/dynalite).

## Install

```sh
npm install --save-dev dynoxide
```

Or run directly:

```sh
npx dynoxide serve --port 8000
```

## Migrating from dynalite

Replace `dynalite` with `dynoxide` in your `package.json`:

```diff
 "devDependencies": {
-  "dynalite": "^3.0.0"
+  "dynoxide": "^0.9.5"
 }
```

Then point your DynamoDB client at the same local endpoint. Dynoxide speaks the same protocol.

## Usage

Start an HTTP server:

```sh
dynoxide serve --port 8000
```

With a persistent database:

```sh
dynoxide serve --port 8000 --db-path data.db
```

Import an existing DynamoDB JSON export:

```sh
dynoxide import --input data.json --db-path data.db
```

Start an MCP server for coding agents:

```sh
dynoxide mcp
```

## Supported Platforms

| Platform | Architecture |
|---|---|
| macOS | x64, arm64 (Apple Silicon) |
| Linux | x64 (glibc), x64 (musl/Alpine), arm64 |
| Windows | x64 |

## How It Works

This package installs a platform-specific prebuilt binary via npm's `optionalDependencies`. No compilation, no Docker, no JVM.

The binary is the same one available via [Homebrew](https://github.com/nubo-db/homebrew-tap), [GitHub Releases](https://github.com/nubo-db/dynoxide/releases), and [crates.io](https://crates.io/crates/dynoxide-rs).

## Links

- [Documentation and full README](https://github.com/nubo-db/dynoxide)
- [Changelog](https://github.com/nubo-db/dynoxide/blob/main/CHANGELOG.md)
- [DynamoDB conformance results](https://github.com/nubo-db/dynamodb-conformance#results)

## Licence

MIT or Apache-2.0, at your option.
