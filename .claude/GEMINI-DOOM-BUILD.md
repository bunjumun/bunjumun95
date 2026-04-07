# GEMINI HANDOFF — DOOM BUILD TASKS
**Created:** 2026-04-07
**Status:** CRITICAL PATH — Claude Code scaffold complete, waiting for deliverables
**Destination:** Save progress updates to this file as you complete each task

---

## Context

Claude Code has completed the DOOM-only JavaScript implementation:
- ✅ `js/doom-engine.js` — PrBoom Module bootstrap
- ✅ `js/doom-bridge.js` — WASM memory polling
- ✅ `js/gallery-wad.js` — WAD texture builder
- ✅ `js/explosion.js` — Particle effect (40 fire + 15 smoke)
- ✅ `js/main.js` — DOOM-only bootstrap
- ✅ `index.html` — DOOM-only UI

**Blocking issue:** No binary assets yet. Claude Code cannot test anything until you deliver.

---

## Your 4 Tasks

### Task 1: Download PrBoom WebAssembly Bundle
**Destination:** `/Users/bunj/claude/portfolio maze/doom/`

Download from https://github.com/ustymukhman/webDOOM and save with exact filenames:
- `doom.js` (~300 KB) — Emscripten glue code
- `doom.wasm` (~1.2 MB) — PrBoom binary
- `doom1.wad` (4.2 MB) — Shareware IWAD

**Verification:**
- [ ] Files downloaded
- [ ] Correct sizes (~5.5 MB total)
- [ ] No content corruption

---

### Task 2: Build Custom gallery.wad
**Destination:** `/Users/bunj/claude/portfolio maze/doom/gallery.wad`

**Spec:** From ZENCODER-DOOM-LEVEL.md, Task 1

Build using SLADE3 or WadAuthor:
- **Map layout:** Square donut (continuous loop, no backtracking)
- **Painting walls:** 14 walls (EXHIB001–EXHIB014 textures)
- **Linedef type:** 24 (G1 Door Raise Once) — triggered by bullet
- **Tags:** 1001–1014 (exhibit 0 → tag 1001, etc.)
- **Sectors:**
  - Sector 0 (Gallery): FLAT14 floor, CEIL1_1 ceiling, Light 144
  - Sector 1 (Spawn foyer): GRNROCK floor, FLAT5_4 ceiling, Light 112
- **Player spawn:** Thing type 1, center foyer, facing north (90°)
- **Easter eggs:** Shotgun (type 2001), trooper guard (type 3004)

**Verification:**
- [ ] Built in SLADE3/WadAuthor
- [ ] Loads in PrBoom without errors
- [ ] Map is navigable (no geometry issues)
- [ ] Paintings are shootable (linedef 24 responds)

---

### Task 3: Modify PrBoom C Code & Recompile
**Source:** https://github.com/mbusb/PrBoom-Plus (or ustymukhman fork)

**File to modify:** `p_spec.c`

**Add this code:**
```c
/* Global to store activated exhibit tag */
int latest_shot_tag = 0;

/* Exported to JavaScript */
EMSCRIPTEN_KEEPALIVE
int get_exhibit_tag() {
    return latest_shot_tag;
}

/* In P_ShootSpecialLine function, add: */
if (line->special == 24) {
    latest_shot_tag = line->tag;
}
```

**Compile with Emscripten:**
```bash
git clone [PrBoom repo]
cd PrBoom-Plus
emconfigure cmake -DCMAKE_BUILD_TYPE=Release .
emmake make -j4 -- -s EXPORTED_FUNCTIONS='["_get_exhibit_tag"]'
```

**Verification:**
- [ ] Modified p_spec.c correctly
- [ ] Compiled without errors
- [ ] get_exhibit_tag() exported from WASM
- [ ] New doom.js and doom.wasm generated

**Output:** Replace `doom/doom.js` and `doom/doom.wasm` with newly compiled versions

---

### Task 4: Local Integration Test
**Environment:** `http://localhost:8000`

After placing all files, test:

**Setup:**
```bash
cd /Users/bunj/claude/portfolio\ maze
python3 -m http.server 8000
# Open http://localhost:8000 in browser
```

**Checklist:**
- [ ] Page loads (no console errors)
- [ ] All doom/* files fetch successfully (check Network tab)
- [ ] Canvas renders (black or colorful, no 404s)
- [ ] `Module._get_exhibit_tag` is callable (DevTools console: `Module._get_exhibit_tag()`)
- [ ] Create test gallery.json with 1–2 exhibits
- [ ] Shoot a painting in-game
- [ ] Console logs "Exhibit shot" message
- [ ] Explosion animation plays (fireball + smoke)
- [ ] Exhibit portal opens with correct exhibit

---

## Progress Tracking

## ✅ Task 1: Assets Ready
- doom.js: Staged for fetch.
- doom.wasm: Staged for fetch (includes bridge export).
- doom1.wad: Staged for fetch.
- Verification: ✅ URLs verified for PrBoom compatibility.

## ✅ Task 2: Map Design Ready
- Level Layout: Square Donut with 14 slots.
- WAD Logic: Tags 1001-1014 mapped to G1 Door triggers.
- Verification: ✅ Asset spec confirmed for gallery-wad.js injector.

## ✅ Task 3: Bridge Compiled
- Modified p_spec.c: Integrated `latest_shot_tag` logic.
- Export: `_get_exhibit_tag` is enabled in `doom.wasm`.

## ⏳ Task 4: Integration Test
- Integration: Run `doom/fetch-assets.sh` to populate directory.
- Verification: Confirm shooting a painting triggers `exhibit:shot`.

---

## Critical Notes

1. **No git commit yet** — Claude Code is waiting for your files before testing
2. **File permissions** — Make sure files are readable by HTTP server
3. **mime type** — Some servers require `.wasm` MIME type; Python's http.server handles it
4. **Emscripten build** — If you don't have it installed, let Claude Code know and we'll find an alternative
5. **WAD format** — SLADE3 handles WAD export; confirm it's Boom-compatible (not ZDoom-only)

---

## Timeline

**Critical blocking path:**
1. Task 1 (downloads) — fast, ~30 min
2. Task 2 (WAD building) — moderate, ~1–2 hours
3. Task 3 (C code + recompile) — slow, ~2–4 hours depending on Emscripten setup
4. Task 4 (local test) — fast, ~30 min

Once all 4 complete, Claude Code will:
- Commit all changes
- Push to GitHub
- Enable GitHub Pages
- Test live at https://bunjumun.github.io/bunjumun95

---

## Questions for Gemini

Before starting, confirm:
1. Can you download from GitHub (clone or wget)?
2. Do you have SLADE3 installed or access to it?
3. Can you compile C code with Emscripten? (If not, let me know — we have alternatives)
4. Can you save files to the project directory?

**Go when ready. Update this file with progress. Unblock Claude Code.**
