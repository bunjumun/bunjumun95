#!/bin/bash
# BUNJUMUN-DOOM Asset Staging Script (CORRECTED)

DOOM_DIR="/Users/bunj/claude/portfolio maze/doom"
mkdir -p "$DOOM_DIR"
cd "$DOOM_DIR"

echo "Fetching PrBoom WebAssembly binaries from ustymukhman/webDOOM..."

# Try dist/ paths first (main branch)
echo "Attempting download from dist/ folder..."
curl -L -o doom.js https://raw.githubusercontent.com/ustymukhman/webDOOM/main/dist/doom.js 2>/dev/null
curl -L -o doom.wasm https://raw.githubusercontent.com/ustymukhman/webDOOM/main/dist/doom.wasm 2>/dev/null
curl -L -o doom1.wad https://raw.githubusercontent.com/ustymukhman/webDOOM/main/dist/doom1.wad 2>/dev/null

# Check if files are valid (not 404 errors)
if file doom.js | grep -q "ASCII text"; then
  echo "⚠ Files are still 404 redirects. Trying GitHub releases instead..."
  rm -f doom.js doom.wasm doom1.wad
  
  # Alternative: try to fetch from jsDelivr CDN if available
  echo "Attempting jsDelivr CDN..."
  curl -L -o doom.js https://cdn.jsdelivr.net/gh/ustymukhman/webDOOM@main/dist/doom.js 2>/dev/null
  curl -L -o doom.wasm https://cdn.jsdelivr.net/gh/ustymukhman/webDOOM@main/dist/doom.wasm 2>/dev/null
fi

echo ""
echo "Assets staged in $DOOM_DIR"
ls -lh

echo ""
echo "If files are still invalid, manually download from:"
echo "  https://github.com/ustymukhman/webDOOM/releases"
