# BUNJUMUN-DOOM: Gemini Collaboration Question
**From:** Claude Code (Project Lead / Executor)  
**To:** Gemini (Architecture Lead)  
**CC:** ZenCoder (UI/Frontend)  
**Date:** 2026-04-08  
**Priority:** HIGH — blocking exhibit-in-game delivery

---

## Agent Roles

| Agent | Role | Strengths |
|-------|------|-----------|
| **Claude Code** | Project Lead + Executor | Filesystem, git, WASM calls, JS implementation, API wiring |
| **Gemini** | Architecture Lead | Deep research, algorithm design, format specs, token-heavy analysis |
| **ZenCoder** | UI/Frontend | CSS, Shadow DOM, Win95 chrome, UX polish, exhibit guide |

**Preferred handoff format:** Drop task files in `.claude/` as `GEMINI-TASK.md`, `ZENCODER-TASK.md`. Claude implements whatever you spec out.

---

## Project Overview

**BUNJUMUN-DOOM** — portfolio site where player walks a DOOM map and shoots walls to open portfolio exhibits (Win95-style overlay windows).

**Stack:** PrBoom WASM (Emscripten), vanilla JS, Shadow DOM, GitHub Pages  
**Engine:** `doom/doom.js` (328KB glue), `doom/doom.wasm` (1MB), `doom/web/doom1.data` (4.26MB audio-stripped)  
**Data:** `gallery.json` = single source of truth for exhibit content (HTML, iframes, images, links)

---

## Confirmed Current State (Claude-verified 2026-04-08)

### What's Working
- ✅ DOOM engine boots (PrBoom via Emscripten)
- ✅ `gallery.wad` = 5,581 bytes, valid PWAD with 14 exhibit trigger walls (linedef special 24, tags 1001-1014)
- ✅ gallery.wad has: THINGS (player start + shotgun), LINEDEFS, SIDEDEFS, VERTEXES, SEGS, SSECTORS, NODES, SECTORS, BLOCKMAP
- ✅ Exhibit portal (Win95 overlay) works when triggered manually
- ✅ Admin console works (password gate, 4 exhibit types)
- ✅ gallery.json loads (1 exhibit: Midwest Psych Fest)

### Critical Blockers (Confirmed)

**BLOCKER 1: `_get_exhibit_tag` does NOT exist in doom.wasm**  
Confirmed via binary string scan. The entire doom-bridge.js polling loop is dead code.  
The WASM only exports: `_fflush`, `_atexit`, `_exit`, `_getenv`, `_signal`, `_free`, `_main`, `_malloc`, `_memalign`, `_memcpy`, `_memset`  
→ We cannot detect when player shoots an exhibit wall without custom WASM or an alternative strategy.

**BLOCKER 2: No gallery images on DOOM walls**  
Exhibit walls use stock DOOM texture `BROWN1`. Gallery images from `gallery.json` are not injected as DOOM textures.  
→ Player sees plain brown walls, not portfolio images.

### What IS Available in doom.js
- `Module.HEAPU32` / `Module.HEAP32` — direct WASM linear memory access ✅
- `Module.dynCall` — can call WASM function pointers if we find their addresses ✅
- `Module.FS` — Emscripten virtual filesystem (we already use this for WAD injection) ✅

---

## The Questions

### Q1: Exhibit Triggering — Best Alternative to `_get_exhibit_tag`

Since we can't use WASM exports, we need a new trigger mechanism. Here are candidates:

**A) WASM Heap Memory Scan**  
`Module.HEAPU32` lets us read all WASM memory. PrBoom stores player position in fixed-point (x,y in `players[0].mo->x/y`). If we can locate these memory addresses, we can poll player position every tick and trigger exhibits based on proximity to known exhibit coordinates (we have all the geometry from build_wad.py).  
- **Question:** Is there a reliable way to find the player struct offset in a compiled PrBoom WASM without debug symbols? Can we use pattern matching (player starts at map coord 0,0 = `0x00000000` in fixed-point)?  
- What's the fixed-point format PrBoom uses (16.16? 32-bit int where 1 unit = 1 map unit)?

**B) Canvas Pixel-Based Detection**  
Each frame, read the center of the DOOM canvas. When the center pixel matches the color signature of a BROWN1 wall (exhibit texture), the player is looking at an exhibit. Combine with proximity logic for a complete trigger.  
- **Question:** Is this approach reliable enough or too noisy? What color does BROWN1 render to in PrBoom's palette?

**C) Exhibit Walls as Sectors with Floor Trigger**  
Redesign gallery.wad: instead of linedef special 24 (which requires WASM-side processing), use a raised floor sector (sector tag) that the player physically cannot enter. They walk up to the exhibit wall (a 64-unit-wide segment) and JS detects they're stuck against a wall via velocity = 0 while keys are pressed. This is pure JS observable via timing.  
- **Question:** Is this too hacky for a real product? Would it work given DOOM's collision model?

**D) Fake Keyboard Hack: Inject 'E' Interact Key**  
Add an 'E' key binding to the exhibit system. When player presses 'E', JS finds the nearest exhibit from a static JS-side map of exhibit positions (derived from build_wad.py coordinates). No WASM polling needed. Player "aims and presses E" instead of shooting.  
- **Question:** Can we add an 'E' key handler in JS that fires `exhibit:shot` based on player proximity? This requires knowing player position from WASM memory (back to option A) or making proximity detection pure-JS based on time.

**Your call:** Which approach (or combination) gives us a working trigger in the least implementation time?

---

### Q2: Gallery Images on DOOM Walls (WAD Texture Injection)

We need gallery thumbnail images to appear ON the DOOM walls as the player walks the corridor. The current WAD uses `BROWN1` (stock texture). We want custom textures derived from `gallery.json` images.

**WAD Texture Format (for your research):**
DOOM requires these lumps for custom textures:
- `PNAMES` — list of patch names
- `TEXTURE1` — texture definitions (name + patches composited)
- Patch lumps (raw picture data in DOOM column format: palette-indexed, run-length encoded columns)

**The pipeline we need to build (in JS, before engine boot):**
1. For each exhibit: read `thumbnail` (base64 PNG/JPG) from `gallery.json`
2. Convert image → DOOM picture format (64×128 or 128×128, 8-bit indexed, DOOM palette)
3. Generate PNAMES + TEXTURE1 lumps
4. Append all this to `gallery.wad` before engine boots
5. Update SIDEDEFS to use the new texture names (instead of `BROWN1`)

**Questions for Gemini:**
- Is it feasible to do DOOM palette quantization (256 colors, specific PLAYPAL) entirely in JS Canvas2D? What's the performance cost for 14 images?
- What's the exact byte format of a DOOM picture/patch lump? (Specifically: column pointers, post headers, pixel data)
- Should we keep the `build_wad.py` Python script for base geometry + add a JS layer for textures, or merge everything into JS?
- What texture dimensions are safe for exhibit walls (128-unit wide segments)?

---

### Q3: Architecture Decision — Rewrite or Hack?

The user has authorized discussing a complete DOOM renderer rewrite IF needed. Before we go there:

**Rewrite Option:**
- Replace PrBoom WASM with a pure-JS DOOM raycaster (like the famous Lode's raycasting tutorial extended to full DOOM format)
- Full JS access to: player position, sector tags, texture data
- Render gallery images as actual textured walls
- Pros: Total control. Cons: Months of work. Not real DOOM.

**Hack Option:**
- Keep PrBoom. Use WASM heap scanning for player position. Build JS-side texture injection pipeline for the WAD.
- Pros: Keeps authentic DOOM engine. Cons: Fragile heap offset hunting.

**Your recommendation:** Given our 3-agent team and GitHub Pages constraint, which is more achievable in 1-2 weeks? What's the minimum viable path to "images visible in DOOM + exhibits trigger when player approaches"?

---

### Q4: Collaboration Structure

Given the above analysis, how should we split the work?

Please provide a task table like:
| Task | Owner | Depends On | Est. Complexity |
|------|-------|-----------|----------------|
| Find player position in WASM heap | Claude | - | ? |
| WAD texture format spec | Gemini | - | Low |
| JS DOOM picture format encoder | Gemini drafts, Claude implements | texture spec | Med |
| gallery.wad texture injection | Claude | encoder | Med |
| Exhibit trigger via proximity | Claude | player position | Med |
| Exhibit guide UI | ZenCoder | - | Low |

---

## Constraints (Non-Negotiable)

- GitHub Pages only (no server-side code)
- No Emscripten recompile (no toolchain)
- Chrome target (pointer lock, WASM, Shadow DOM)
- gallery.json is single source of truth
- Keep PrBoom WASM as-is unless rewrite is truly the better path

---

## Your Output

Drop response as `.claude/GEMINI-COLLAB-RESPONSE.md` with:
1. **Trigger mechanism recommendation** (Q1 answer with reasoning)
2. **Texture injection spec** (Q2 — exact DOOM picture format, byte-by-byte)
3. **Rewrite vs hack verdict** (Q3)
4. **Task split table** (Q4)

This becomes the implementation blueprint. I execute, you architect.
