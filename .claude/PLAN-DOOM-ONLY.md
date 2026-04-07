# BUNJUMUN-DOOM — Architecture Plan
## DOOM-Only Gallery CMS

**Date:** 2026-04-07
**Maze preserved:** branch `maze-mode` | tag `v1.0-maze` | repo `github.com/bunjumun/bunjumaze`

---

## Vision

DOOM is the sole game engine. Player navigates a custom gallery level.
Picture frames hang on walls. Shooting a frame triggers:

1. **Wall explodes** — fireball particle burst + screen flash
2. **ExhibitPortal launches** — configured exhibit opens (Win95 Shadow DOM)
3. DOOM pauses while exhibit is active
4. Player closes → DOOM resumes

Gallery management unchanged: `gallery.json`, Admin Console, 4-method ingestion.

---

## What Gets Removed

| File | Reason |
|------|--------|
| `js/engine.js` | Three.js maze renderer — gone |
| `js/maze-gen.js` | Maze generation — gone |
| `js/curator.js` | Frame placement algorithm — gone |
| `js/controls.js` | Three.js FPS controls — gone |
| `js/game-mode-manager.js` | Dual-engine state machine — gone |
| `js/input-router.js` | Dual-engine input router — gone |
| `js/audio-manager.js` | Dual-engine audio — gone |
| `js/doom-loader.js` | Iframe loader — replaced |
| `js/doom-raycaster.js` | Overlay raycaster — replaced |

## What Gets Kept

| File | Role |
|------|------|
| `gallery.json` | Single source of truth — unchanged |
| `js/admin.js` | Admin console (Shadow DOM) — unchanged |
| `js/exhibit.js` | Exhibit portal (Shadow DOM) — unchanged |
| `js/github-api.js` | GitHub API + PAT auth — unchanged |
| `css/style.css` | Win95 chrome — trimmed |

## What Gets Added

| File | Role |
|------|------|
| `doom/doom1.js` | PrBoom Emscripten JS wrapper |
| `doom/doom1.wasm` | PrBoom WebAssembly binary |
| `doom/doom1.data` | Shareware game data bundle (~4 MB) |
| `doom/gallery.wad` | Custom gallery level (PWAD) — zencoder |
| `js/doom-engine.js` | Engine bootstrap + Module config |
| `js/doom-bridge.js` | DOOM ↔ JS event bridge |
| `js/gallery-wad.js` | Runtime WAD texture injector |
| `js/explosion.js` | Fireball particle effect (Canvas overlay) |
| `js/main.js` | Rewritten — DOOM-only bootstrap |

---

## Core Systems

### 1. doom-engine.js
Bootstraps PrBoom with gallery.wad preloaded via Emscripten VFS.
Exposes `pause()` / `resume()` / `writeTexture()`.

### 2. gallery-wad.js
At load time: reads `gallery.json`, converts thumbnails (Base64 → PNG binary),
writes to Emscripten VFS as `EXHIB001.png`…`EXHIBnnn.png`.
These replace placeholder textures in `gallery.wad`.

### 3. doom-bridge.js
Polls WASM memory each frame for activated exhibit sector tags (1001–1064).
When tag fires: emits `exhibit:shot` event with exhibit index. Resets tag.

### 4. explosion.js
Canvas overlay on top of DOOM canvas. On trigger:
- **0–80ms:** Screen flash (orange → transparent)
- **0–300ms:** Fire particles (red/orange/yellow, burst outward + up)
- **200–400ms:** Smoke particles (gray, drift upward)
- **400ms:** `onComplete()` → `ExhibitPortal.open(exhibit)`

### 5. gallery.wad (zencoder)
Custom PWAD replacing E1M1 with a gallery corridor/room.
- Wall segments with placeholder textures `EXHIB001`…`EXHIBnnn`
- Each exhibit wall has a linedef shoot-trigger special (tag 1001+index)
- Industrial/gallery atmosphere matching Win95 aesthetic
- Optional: skeleton guards as Easter eggs

---

## Trigger Flow

```
Player shoots painting wall
        │
        ▼
DOOM linedef special fires → writes tag (1001+idx) to WASM addr
        │
        ▼
doom-bridge.poll() reads tag on next JS frame
        │
        ▼
emit 'exhibit:shot' → DoomEngine.pause()
        │
        ▼
ExplosionEffect.trigger(screenX, screenY, () => {
  ExhibitPortal.open(gallery.exhibits[idx])
})
        │
        ▼
User reads exhibit (Win95 window overlay)
        │
        ▼
User clicks X → ExhibitPortal.close() → DoomEngine.resume()
```

---

## File Size Budget

| File | Size | GitHub Limit |
|------|------|-------------|
| `doom/doom1.js` | ~346 KB | ✅ |
| `doom/doom1.wasm` | ~1 MB | ✅ |
| `doom/doom1.data` | ~4 MB (shareware) | ✅ |
| `doom/gallery.wad` | < 50 KB | ✅ |
| All JS/CSS/HTML | < 200 KB | ✅ |
| **Total** | **~5.5 MB** | **✅ No LFS needed** |

---

## Maze as an Exhibit (Future)

Maze is live at `https://bunjumun.github.io/bunjumaze` (enable Pages on that repo).

To link it as a DOOM painting:
1. Admin Console → Add Exhibit
2. Type: `link`, URL: `https://bunjumun.github.io/bunjumaze`
3. Title: "ENTER THE MAZE"
4. Upload any thumbnail
5. It appears as a painting in the DOOM gallery
6. Shooting it → portal opens with the maze in an iframe

---

## Work Split

### Zencoder (before Claude Code can proceed)

**Deliver to:** `.claude/ZENCODER-DOOM-LEVEL.md`

1. **Gallery level layout** — DOOM map design (corridors, wall counts, sector layout)
2. **Linedef shoot-trigger spec** — Which linedef special type works for "shoot to activate"; exact UDMF/Doom format definition
3. **WASM memory bridge spec** — C-side: how to write the activated tag to a known memory address so JS can poll it; exact struct and address strategy
4. **Explosion particle system** — Physics values (velocity, gravity, friction, decay), color palette, timing curve
5. **Shareware data bundle** — Confirm smallest viable webDOOM build using only shareware WAD; exact files needed from ustymukhman/webDOOM

### Claude Code (after zencoder delivers)

1. Strip maze files from main
2. Commit webDOOM engine files to `doom/`
3. Implement `doom-engine.js`
4. Implement `doom-bridge.js`
5. Implement `gallery-wad.js`
6. Implement `explosion.js`
7. Rewrite `main.js` (DOOM-only)
8. Commit + push → live on GitHub Pages
9. Enable GitHub Pages on `bunjumaze` repo (remind user)

---

## Implementation Order

1. ✅ Maze preserved (`maze-mode` branch + `v1.0-maze` tag)
2. ✅ Maze pushed to `github.com/bunjumun/bunjumaze`
3. 🔲 Zencoder delivers `ZENCODER-DOOM-LEVEL.md`
4. 🔲 Claude strips maze from main
5. 🔲 Claude commits webDOOM engine + implements bridge systems
6. 🔲 Claude rewrites main.js
7. 🔲 Test locally → push → GitHub Pages live
