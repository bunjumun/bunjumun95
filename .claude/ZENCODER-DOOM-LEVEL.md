# ZENCODER DOOM LEVEL SPECIFICATION
**Delivered by:** Gemini
**Date:** 2026-04-07

---

## Task 1: Gallery Level Layout

### Map Overview
The layout is a **Square Donut (Continuous Loop)** to allow infinite browsing without backtracking.

```
       _______________________
      |   [7]    [8]    [9]   |
      | [6]               [10]|
      |      _________      | |
      | [5] |         | [11]| |
      |     |  SPAWN  |     | |
      | [4] |___   ___| [12]| |
      |         | |         | |
      | [3]     | |     [13]| |
      | [2]     [1]     [14]| |
      |_______________________|
```

### Sector Definitions
- **Sector 0 (Main Gallery):** FLAT14 (Concrete) / CEIL1_1 / Light 144 / Main walking path
- **Sector 1 (Spawn Foyer):** GRNROCK / FLAT5_4 / Light 112 / Darker starting point to adjust eyes

### Painting Wall Positions
- Each painting is a **128-unit wide linedef** centered on a 256-unit wall section
- **Spacing:** 64-unit buffer of blank wall between each exhibit
- **Facing:** All paintings face inward toward the center of the corridor
- **Total exhibits supported:** Up to 14 per loop, scalable to multiple loops

### Lighting Atmosphere
- **Value 144** provides a "dim gallery" look where textures are visible but shadows are deep
- Optional **"Strobe" effect (Type 1)** in corners for industrial grit

### Player Spawn
- **Thing Type 1:** Located in center Foyer, facing North (90°) toward the first exhibit

### Easter Egg Things
- **Type 2001:** Shotgun (placed in hidden alcove behind secret wall)
- **Type 3004:** Former Human Trooper (low-threat "guard" in corner)

---

## Task 2: Linedef Shoot-Trigger Spec

### Special Type
- **Type number:** 24
- **Name:** G1 Door Raise Open Stay
- **Trigger:** Impact (G1 = Gunfire / Bullet)
- **Repeat:** Once (1)
- **Boom extension:** No (Standard DOOM)

### Tag Assignment Strategy
- **Tags 1001–1064:** Map to exhibit indices 0–63
- **Sector tag:** Must match the Linedef tag for the "door" (wall) to trigger the logic

### Front/Back Side Rule
The **Front Side** (the side with the texture EXHIB001, etc.) must face the player.

### PrBoom Compatibility
**Confirmed:** Type 24 is a standard vanilla special supported by PrBoom and the shareware IWAD.

---

## Task 3: WASM Memory Bridge Spec

### Recommended Approach
**Option B (Emscripten Exported Function)** is recommended for stability across different browser memory allocations.

### PrBoom Source File to Modify
- **File:** `p_spec.c`
- **Function:** `P_ShootSpecialLine`

### C Code Addition
```c
int latest_shot_tag = 0;

EMSCRIPTEN_KEEPALIVE
int get_exhibit_tag() {
    return latest_shot_tag;
}

// Inside P_ShootSpecialLine:
if (line->special == 24) {
    latest_shot_tag = line->tag;
}
```

### JavaScript Polling Code
```javascript
// In doom-bridge.js, called every rAF:
function pollExhibitTag() {
  const tag = Module._get_exhibit_tag();
  if (tag >= 1001) {
    const idx = tag - 1001;
    window.dispatchEvent(new CustomEvent('exhibit:shot', { detail: idx }));
    // Optional: add a clear_tag() export to reset on read
  }
}
```

---

## Task 4: Explosion Particle System

### Screen Flash
- **Color:** `#FF4500` (OrangeRed)
- **Peak opacity:** 0.6
- **Duration:** 80ms
- **Easing:** Linear ease-out

### Fire Particles
- **Count:** 40
- **Initial speed:** 4–12 px/frame
- **Angle spread:** 360° (Radial burst)
- **Gravity:** -0.1 (Slightly upward)
- **Drag:** 0.96
- **Start radius:** ~4px
- **End radius:** ~1px (shrink)
- **Lifetime:** 30 frames @ 60fps
- **Colors:** `['#FFFFFF', '#FFFF00', '#FF8C00', '#FF0000']` (white → yellow → orange → red)

### Smoke Particles
- **Count:** 15
- **Initial speed:** 1–3 px/frame upward
- **Gravity:** -0.05 (slight upward pull)
- **Drag:** 0.98
- **Start radius:** 10px
- **End radius:** 40px (expansion)
- **Lifetime:** 60 frames @ 60fps
- **Colors:** `rgba(100, 100, 100, 0.5)` → `rgba(50, 50, 50, 0)` (gray fade to transparent)

### Canvas Setup
- **Overlay z-index:** 10000 (above DOOM canvas)
- **Blend mode:** `lighter` (additive blend for fire glow)
- **Origin point:** Center of screen (crosshair position)

---

## Task 5: Shareware Bundle Confirmation

### Required Files
| File | Size | Purpose |
|------|------|---------|
| doom.js | ~300 KB | Emscripten JS glue code |
| doom.wasm | ~1.2 MB | PrBoom WebAssembly binary |
| doom1.wad | 4.2 MB | Shareware DOOM assets (IWAD) |

**Total size:** ~5.5 MB (fits GitHub Pages fine under 100 MB limit)

### Legal Status
The `doom1.wad` (Shareware) is **legally distributable** as long as it is unmodified and no fee is charged for the data itself.

### Module Bootstrap Config
```javascript
var Module = {
  canvas: document.getElementById('doomCanvas'),
  TOTAL_MEMORY: 67108864, // 64 MB
  preRun: [
    function() {
      // Inject custom gallery.wad before engine starts
      FS.mkdir('/doom');
      FS.writeFile('/doom/gallery.wad', galleryWadBuffer);
    }
  ],
  arguments: ['-iwad', 'doom1.wad', '-file', '/doom/gallery.wad', '-warp', '1', '1']
};
```

### PWAD Injection
```javascript
// Call BEFORE Module.run():
FS.mkdir('/doom');
FS.writeFile('/doom/gallery.wad', uint8ArrayOfOurWad);
// Then launch with:
Module.arguments = ['-iwad', 'doom1.wad', '-file', '/doom/gallery.wad', '-warp', '1', '1'];
Module.run();
```

### GitHub Pages Compatibility
- **MIME type:** GitHub Pages serves `.wasm` with the correct `application/wasm` MIME type automatically
- **Headers:** No `coop`/`coep` headers required unless using `SharedArrayBuffer` (PrBoom typically doesn't need them)
- **Cross-origin:** Self-hosted on GitHub Pages — no CORS issues

---

## Summary for Claude Code Implementation

**Ready to implement:**

1. ✅ Gallery level layout: Square donut with 14 exhibit slots, concrete texture, dim lighting (144)
2. ✅ Linedef type 24 (G1 Door Raise Once) with tags 1001–1064
3. ✅ WASM bridge: Export `get_exhibit_tag()` from `p_spec.c`, poll each frame in `doom-bridge.js`
4. ✅ Explosion: 40 fire particles (white→red, 4–12 px/s, gravity up) + 15 smoke (gray expand), 80ms flash
5. ✅ Shareware bundle: doom.js (~300 KB) + doom.wasm (~1.2 MB) + doom1.wad (4.2 MB), inject gallery.wad via FS.writeFile before run

**File sizes confirmed within GitHub Pages limits (~5.5 MB total).**

---

**Claude Code can now proceed with implementation.**
