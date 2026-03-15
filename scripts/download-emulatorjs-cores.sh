#!/bin/bash
set -e

BASE="https://cdn.emulatorjs.org/stable/data"
OUT="static/emulatorjs"

mkdir -p "$OUT/cores"

echo "Downloading loader.js and emulator.min.js..."
curl -L "$BASE/loader.js" -o "$OUT/loader.js"
curl -L "$BASE/emulator.min.js" -o "$OUT/emulator.min.js"

# Note: CDN only provides .data files for cores — WASM is bundled in emulator.min.js
echo "Downloading genesis_plus_gx core data files..."
for f in genesis_plus_gx-wasm genesis_plus_gx-thread-wasm; do
  echo "  $f.data"
  curl -L "$BASE/cores/$f.data" -o "$OUT/cores/$f.data"
done

echo "Done. Files written to $OUT/"
