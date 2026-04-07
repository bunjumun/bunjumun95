# BUNJUMUN-DOOM: BLOCKER STATUS & IMMEDIATE ACTION PLAN
**Date:** 2026-04-07
**Status:** Testing framework ready, **BLOCKED on binary assets**

---

## What Llama's Watchdog Found

**Current State in `/Users/bunj/claude/portfolio maze/doom/`:**

```
doom.js       53 bytes ❌ (error message, not Emscripten glue)
doom.wasm     53 bytes ❌ (error message, not WASM binary)
doom1.wad     MISSING ❌ (needed 4.2 MB)
gallery.wad   MISSING ❌ (custom level not built)
```

**Content of dummy files:**
```
"Failed to fetch ustymukhman/webDOOM@main from GitHub."
```

---

## What Happened

Gemini attempted to auto-fetch binaries from GitHub raw content URLs, but those don't exist:
- webDOOM source doesn't commit binaries
- Binaries are only in GitHub Releases OR built locally

**This is NOT a failure — it's a discovered constraint that requires manual action.**

---

## How to Unblock (3 Options)

### Option A: Download from GitHub Releases (FASTEST ⭐)

1. Visit: https://github.com/ustymukhman/webDOOM/releases
2. Find latest release
3. Download: `doom.js`, `doom.wasm`, `doom1.wad` (if present)
4. Save to: `/Users/bunj/claude/portfolio maze/doom/`

**Verify:**
```bash
ls -lh /Users/bunj/claude/portfolio\ maze/doom/
# Should show:
# doom.js   ~300 KB
# doom.wasm ~1.2 MB
# doom1.wad 4.2 MB
```

### Option B: Build from Source

```bash
cd /tmp
git clone https://github.com/ustymukhman/webDOOM.git
cd webDOOM
npm install
npm run build

# Find output files (usually in dist/)
find . -name "doom.js" -o -name "doom.wasm"

# Copy to project
cp [files] /Users/bunj/claude/portfolio\ maze/doom/
```

### Option C: Try Live Download from Hosted Site

```bash
curl -L -o /Users/bunj/claude/portfolio\ maze/doom/doom.js \
  https://ustymukhman.github.io/webDOOM/doom.js

curl -L -o /Users/bunj/claude/portfolio\ maze/doom/doom.wasm \
  https://ustymukhman.github.io/webDOOM/doom.wasm
```

---

## gallery.wad Status

This custom file needs SLADE3 (WAD editor):
1. Install SLADE3
2. Create level per spec in `ZENCODER-DOOM-LEVEL.md`
3. Export to: `/Users/bunj/claude/portfolio maze/doom/gallery.wad`

**OR:** Use minimal stub for initial testing:
```bash
# Creates 12-byte valid PWAD (0 lumps, placeholders filled at runtime)
xxd -r -p <<'EOF' > /Users/bunj/claude/portfolio\ maze/doom/gallery.wad
50574144 00000000 0c000000
EOF
```

---

## What Happens When Binaries Are in Place

**Immediately trigger this sequence:**

1. **Claude Code runs tests:**
   ```bash
   bash /Users/bunj/claude/portfolio\ maze/test-doom.sh
   # Validates: file integrity, WASM module, game loop
   # Produces: test-results.txt
   ```

2. **If tests PASS:**
   ```bash
   bash /Users/bunj/claude/portfolio\ maze/deploy-doom.sh
   # Commits changes
   # Pushes to GitHub
   # Enables GitHub Pages
   # Site live in 30–60s
   ```

3. **Gemini tests live site at:** https://bunjumun.github.io/bunjumun95

4. **Cycle 1 testing begins** (local validation)

5. **Cycle 2 testing** (live site experience)

6. **Cycle 3** (edge cases & refinement if needed)

---

## Files Ready & Waiting

| File | Purpose | Status |
|------|---------|--------|
| `test-doom.sh` | Automated validation | ✅ Ready |
| `deploy-doom.sh` | Automated deployment | ✅ Ready |
| `js/doom-engine.js` | DOOM engine bootstrap | ✅ Ready |
| `js/doom-bridge.js` | WASM memory polling | ✅ Ready |
| `js/explosion.js` | Particle effect | ✅ Ready |
| `js/gallery-wad.js` | WAD texture injection | ✅ Ready |
| `main.js` | DOOM-only bootstrap | ✅ Ready |
| `index.html` | DOOM-only UI | ✅ Ready |
| `doom/doom.js` | **PLACEHOLDER** ❌ Needs real |
| `doom/doom.wasm` | **PLACEHOLDER** ❌ Needs real |
| `doom/doom1.wad` | **MISSING** ❌ Needs real |
| `doom/gallery.wad` | **MISSING** ❌ Needs real |

---

## Agent Status After Blocker

### ✅ Gemini (a68ac36b41ebe45cb)
- Completed: Identified blocker, documented all 3 fetch paths
- Ready for: Manual binary download, then Cycle 1 user test

### ✅ Llama Test Suite (a11a8e654075551c2)
- Completed: Built `test-doom.sh` with full coverage
- Ready for: Execution once binaries valid

### ✅ Llama Watchdog (ad5c37aaa0105e87b)
- Completed: Initial assessment, documented blocker
- Ready for: Monitoring & resuming if Claude Code times out

### ✅ Claude Code (You)
- Completed: All JS/HTML systems ready, deployment scripts ready
- Ready for: Execute test-doom.sh → deploy-doom.sh → test cycles

---

## What You Need to Do Right Now

**Choose one path (A, B, or C above)** and obtain:
1. Real `doom.js` (~300 KB) — Emscripten glue code
2. Real `doom.wasm` (~1.2 MB) — PrBoom binary
3. Real `doom1.wad` (4.2 MB) — Shareware IWAD
4. Optionally: `gallery.wad` — custom DOOM level

**Then tell me:** "Binaries ready in doom/"

**I will immediately:**
```bash
bash test-doom.sh
bash deploy-doom.sh
# And proceed with full 3-cycle testing
```

---

## Timeline to "Debugged Result in Morning"

- **Now:** Get real binaries (15–30 min if using Option A)
- **+30 min:** Run test-doom.sh (validation)
- **+15 min:** Run deploy-doom.sh (GitHub Pages)
- **+1–2 min:** GitHub Pages builds & goes live
- **+2–3 hours:** Cycle 1 local + Cycle 2 live testing (Gemini validates UX)
- **+2–3 hours:** Edge cases & refinement (Cycle 3 if needed)

**Total:** 4–7 hours from binaries → fully debugged & live

**Expected morning report:**
```
✅ All tests passed (3 cycles minimum)
✅ Live at https://bunjumun.github.io/bunjumun95
✅ Both Claude & Gemini sign off: "Ship it"
```

---

**Next Action: You provide real binaries. I execute immediate testing pipeline.**

Llama will monitor for your signal.
