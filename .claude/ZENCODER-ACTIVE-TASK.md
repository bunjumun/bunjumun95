# ZENCODER ACTIVE TASK — DOOM BINARY ASSETS
**Date:** 2026-04-07
**Priority:** CRITICAL — Entire project blocked on this

---

## Context

BUNJUMUN-DOOM is complete code-wise. Claude Code wrote all JS systems.
Blocking issue: the PrBoom WebAssembly engine files are not downloadable
via automation (GitHub raw URLs return 404). Need a human or agent with
terminal + browser access to retrieve them.

---

## Your Job: Obtain the 3 Binary Files

Destination: `/Users/bunj/claude/portfolio maze/doom/`

### File 1: doom.js (~300 KB)
### File 2: doom.wasm (~1.2 MB)
### File 3: doom1.wad (4.2 MB — shareware DOOM IWAD)

---

## Try These Paths In Order

### Path A: GitHub Releases (BEST)
```bash
# Check what releases exist
curl -s https://api.github.com/repos/ustymukhman/webDOOM/releases \
  | grep -E '"tag_name"|"browser_download_url"'

# Download each asset from the release (use actual URLs from above)
cd /Users/bunj/claude/portfolio\ maze/doom
curl -L -o doom.js [RELEASE_ASSET_URL_FOR_doom.js]
curl -L -o doom.wasm [RELEASE_ASSET_URL_FOR_doom.wasm]
curl -L -o doom1.wad [RELEASE_ASSET_URL_FOR_doom1.wad]
```

### Path B: Clone + Find Prebuilt
```bash
cd /tmp
git clone https://github.com/ustymukhman/webDOOM.git
cd webDOOM

# Check for prebuilt assets anywhere in the tree
find . -name "*.wasm" -o -name "doom1.wad" 2>/dev/null
ls -lh dist/ public/ build/ out/ 2>/dev/null

# If found, copy to project
cp [found_paths] /Users/bunj/claude/portfolio\ maze/doom/
```

### Path C: Clone + Build from Source
```bash
cd /tmp/webDOOM
cat package.json | python3 -m json.tool | grep -A5 scripts

npm install
npm run build 2>&1 | tail -20

find . -name "doom.js" -o -name "doom.wasm" | head -5
```

### Path D: Hosted Live Site Assets
```bash
# ustymukhman hosts the live demo — try fetching assets from there
curl -L -o /Users/bunj/claude/portfolio\ maze/doom/doom.js \
     https://ustymukhman.github.io/webDOOM/doom.js

curl -L -o /Users/bunj/claude/portfolio\ maze/doom/doom.wasm \
     https://ustymukhman.github.io/webDOOM/doom.wasm

curl -L -o /Users/bunj/claude/portfolio\ maze/doom/doom1.wad \
     https://ustymukhman.github.io/webDOOM/doom1.wad
```

---

## Validation (Run After Every Download Attempt)

```bash
cd /Users/bunj/claude/portfolio\ maze/doom
ls -lh

# Check doom.js is real (must be >100 KB and contain Emscripten code)
echo "doom.js size: $(wc -c < doom.js) bytes"
head -c 80 doom.js

# Check doom.wasm is binary (not error text)
echo "doom.wasm size: $(wc -c < doom.wasm) bytes"
file doom.wasm

# Check doom1.wad is a WAD file
echo "doom1.wad size: $(wc -c < doom1.wad) bytes"
file doom1.wad
```

**Expected output:**
```
doom.js     ~300000 bytes  → starts with "var Module" or emscripten code
doom.wasm   ~1200000 bytes → "WebAssembly binary" or ELF format
doom1.wad   ~4200000 bytes → "doom patch" or "WAD data"
```

---

## gallery.wad (Secondary Task)

Once binaries are done, build the custom DOOM level.

**Option A: deutex CLI (no GUI needed)**
```bash
brew install deutex   # macOS
# or: apt-get install deutex

# Create simple gallery map
deutex -make gallery.wad [spec file]
```

**Option B: SLADE3 if installed**
- Open SLADE3
- New WAD → New Map
- Build per spec in `.claude/ZENCODER-DOOM-LEVEL.md`
- Export as `doom/gallery.wad`

**Option C: Minimal stub (already done)**
```bash
# 12-byte valid PWAD already exists at doom/gallery.wad
# This works for initial testing — proper level can come later
```

---

## Signal Completion

When valid files are in place, run:
```bash
bash /Users/bunj/claude/portfolio\ maze/test-doom.sh 2>&1 | tail -5
```

Then update `.claude/AGENT-STATUS.md`:
```markdown
### Zencoder
- Status: COMPLETE
- doom.js: VALID ([size] bytes, source: [path A/B/C/D])
- doom.wasm: VALID ([size] bytes)
- doom1.wad: VALID ([size] bytes)
- Ready for: Claude Code to run full test suite
```

Claude Code will auto-detect the update and proceed with:
1. Full test suite (test-doom.sh)
2. Commit + push (deploy-doom.sh)
3. GitHub Pages deployment
4. Multi-cycle live testing with Gemini
