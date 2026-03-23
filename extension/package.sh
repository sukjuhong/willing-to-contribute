#!/bin/bash
# Chrome Extension packaging script
# Creates a zip file ready for Chrome Web Store upload

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANIFEST="$SCRIPT_DIR/manifest.json"

if [ ! -f "$MANIFEST" ]; then
  echo "Error: manifest.json not found at $MANIFEST" >&2
  exit 1
fi

VERSION=$(grep '"version"' "$MANIFEST" | sed 's/.*"version": *"\([^"]*\)".*/\1/')

if [ -z "$VERSION" ]; then
  echo "Error: Could not read version from manifest.json" >&2
  exit 1
fi

DIST_DIR="$SCRIPT_DIR/dist"
OUTPUT_FILE="$DIST_DIR/willing-to-contribute-extension-v${VERSION}.zip"

mkdir -p "$DIST_DIR"

# Remove any existing zip for this version
if [ -f "$OUTPUT_FILE" ]; then
  rm "$OUTPUT_FILE"
fi

cd "$SCRIPT_DIR"

zip -r "$OUTPUT_FILE" . \
  --exclude "*.DS_Store" \
  --exclude "*/.DS_Store" \
  --exclude ".omc/*" \
  --exclude ".omc" \
  --exclude "node_modules/*" \
  --exclude "node_modules" \
  --exclude "dist/*" \
  --exclude "dist" \
  --exclude ".git/*" \
  --exclude ".git" \
  --exclude "*.sh" \
  --exclude "STORE_LISTING.md" \
  --exclude "*.map" \
  --exclude ".env*"

SIZE=$(du -sh "$OUTPUT_FILE" | cut -f1)
echo "Packaged: $OUTPUT_FILE ($SIZE)"
