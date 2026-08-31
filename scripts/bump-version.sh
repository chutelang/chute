#!/usr/bin/env bash
set -euo pipefail

release_type="${1:?Usage: bump-version.sh <patch|minor|major>}"

npm version "$release_type" --no-git-tag-version > /dev/null

version=$(node -p "require('./package.json').version")

for pkg in packages/*/package.json docs/package.json; do
  tmp=$(mktemp)
  jq --arg v "$version" '.version = $v' "$pkg" > "$tmp"
  mv "$tmp" "$pkg"
done

pnpm install --lockfile-only > /dev/null

echo "$version"
