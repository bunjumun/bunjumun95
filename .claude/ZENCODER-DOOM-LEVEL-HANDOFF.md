# ZENCODER HANDOFF — DOOM-ONLY GALLERY LEVEL
## Design Research for BUNJUMUN-DOOM

**Date:** 2026-04-07
**Priority:** CRITICAL — Claude Code cannot proceed without this
**Save deliverables to:** `/Users/bunj/claude/portfolio maze/.claude/ZENCODER-DOOM-LEVEL.md`

---

## Context

We are going DOOM-only. The Three.js maze is being removed entirely. The new site is:

- **DOOM engine** (PrBoom/WebAssembly, self-hosted shareware) fills the full browser window
- **Custom gallery level** (a .wad file we build) replaces E1M1
- Picture frames hang on walls as DOOM textures
- **Shooting a frame** → wall explodes → Win95 exhibit portal launches
- Gallery management (gallery.json, Admin Console) is unchanged

The webDOOM source is: `https://github.com/ustymukhman/webDOOM`
It uses PrBoom compiled to WebAssembly via Emscripten.

---

## What Claude Code Will Build (Context for Your Design)

Claude Code will implement:
- `js/doom-engine.js` — bootstraps PrBoom Module, exposes `pause()`/`resume()`/`writeTexture()`
- `js/doom-bridge.js` — polls WASM memory each frame for shoot-trigger activations
- `js/gallery-wad.js` — reads `gallery.json`, converts thumbnails to PNG binaries, writes to Emscripten VFS to replace placeholder wall textures at runtime
- `js/explosion.js` — Canvas overlay particle effect (fireball burst + smoke)
- `doom/gallery.wad` — **YOU design this** (see Task 1)

---

## Your 5 Tasks

---

### Task 1: Gallery Level Layout

**Deliverable:** Describe the DOOM map architecture for `doom/gallery.wad`.

We need a custom PWAD that replaces E1M1 with a gallery corridor/room layout.

**Constraints:**
- Must work with PrBoom (Boom-compatible, not ZDoom/GZDoom)
- Max 64 exhibit painting walls (we plan ≤32 in practice)
- Each painting wall = one DOOM wall segment with a **unique placeholder texture name** (e.g., `EXHIB001`, `EXHIB002`, ...) — these get replaced at runtime by gallery thumbnails
- Each painting wall must have a **linedef shoot-trigger** that fires when shot (Task 2)
- Atmosphere: industrial/gallery vibe — concrete walls, dim lighting, matches Win95 dark aesthetic
- Optional Easter eggs: skeleton guards, shotgun ammo pickups

**Specify:**
```
1. Overall map layout (corridors? single room? L-shape? T-junction?)
2. Recommended wall count for 8–16 exhibits (the typical gallery size)
3. Sector/room structure (one big room vs multiple connected rooms)
4. Lighting values for each sector (DOOM uses 0–255)
5. Floor/ceiling texture names to use (from DOOM1 shareware palette)
6. How painting walls are positioned (one per wall segment, gap between them)
7. Player spawn position (thing type 1) relative to the paintings
8. Any decorative things (type IDs from DOOM1 shareware)
```

**Format:**
```markdown
## Gallery Level Layout

### Map Overview
[ASCII diagram of the level from above]

### Sector Definitions
- Sector 0: [floor tex] / [ceil tex] / light [value] / [purpose]
- Sector 1: ...

### Painting Wall Positions
- Wall 1: [which sector, which side, facing direction]
- Wall 2: ...

### Lighting Atmosphere
[Describe the lighting values and why]

### Player Spawn
[Thing type 1 position and angle]

### Easter Egg Things
[Optional decorative/enemy things with type IDs]
```

---

### Task 2: Linedef Shoot-Trigger Specification

**Deliverable:** Exact DOOM/Boom linedef special for "shoot to activate once".

We need to know:
1. Which **linedef special type number** to use for "activated by bullet impact, fires once" in Boom/PrBoom format
2. Whether this is a standard DOOM special or Boom extension
3. The exact **tag number strategy**: we use tags 1001–1064 (one per exhibit index)
4. The **trigger side** — does the linedef fire from the front side, back side, or either?
5. Any required **sector tag** pairing with the linedef tag
6. Confirmation: does PrBoom support this special type from the shareware IWAD?

**Format:**
```markdown
## Linedef Shoot-Trigger Spec

### Special Type
- Type number: [e.g., 46]
- Name: [e.g., "GR Open Door Stay" — but we want shoot]
- Trigger: [bullet / use / walk / any]
- Repeat: [once / repeatable]
- Boom extension: [yes/no]

### Tag Assignment Strategy
- Tags 1001–1064 map to exhibit indices 0–63
- Linedef tag = 1000 + exhibitIndex + 1
- Sector tag = same number (required by this special: yes/no)

### Front/Back Side Rule
[Which side of the linedef must face the player for it to trigger]

### PrBoom Compatibility
[Confirmed works with PrBoom + shareware IWAD: yes/no/caveat]

### Example Linedef Definition (Doom format)
\`\`\`
// Linedef for exhibit 0 (tag 1001)
linedef {
  v1 = [vertex]; v2 = [vertex];
  special = [number];
  tag = 1001;
  sidefront = [sidedef index];
  blocking = true;
  twosided = false;
}
\`\`\`
```

---

### Task 3: WASM Memory Bridge Specification

**Deliverable:** How to communicate a shoot-trigger activation from DOOM C code to JavaScript.

The bridge works like this:
1. Player shoots a painting wall → DOOM linedef special fires
2. We need to communicate **which tag fired** (1001–1064) to JavaScript
3. JavaScript polls every frame and reads the activated tag

**Two approaches to evaluate:**

**Option A — Global C variable at known address:**
- Add a global `int g_exhibit_tag = 0;` to PrBoom C source
- When linedef special fires, set `g_exhibit_tag = tag;`
- JS uses `Module.getValue(addr, 'i32')` to read it
- JS resets it to 0 after reading

**Option B — Emscripten exported C function:**
- Add `int get_exhibit_tag()` and `void clear_exhibit_tag()` to C
- JS calls `Module._get_exhibit_tag()` and `Module._clear_exhibit_tag()`
- No memory address needed — cleaner ABI

**Specify:**
1. Which option you recommend and why
2. Exactly **which C source file** in PrBoom to modify (likely `p_spec.c` for linedef specials)
3. **Which function** handles linedef shoot triggers in PrBoom — exact function name
4. The exact C code to add (small snippet)
5. How to get the memory address (Option A) or export the function (Option B) via Emscripten
6. The JavaScript polling code that reads the value

**Format:**
```markdown
## WASM Memory Bridge Spec

### Recommended Approach
[Option A or B, with rationale]

### PrBoom Source File to Modify
- File: `[path/to/file.c]`
- Function: `[function name that handles linedef shoot special]`

### C Code Addition
\`\`\`c
// Add to [file.c]:
[exact C code]
\`\`\`

### Emscripten Export
\`\`\`makefile
# Add to Emscripten compile flags:
-s EXPORTED_FUNCTIONS="[...]"
# Or: for Option A, find address with:
Module._get_g_exhibit_tag_addr = ...
\`\`\`

### JavaScript Polling Code
\`\`\`javascript
// In doom-bridge.js, called every rAF:
function pollExhibitTag() {
  const tag = [how to read];
  if (tag >= 1001 && tag <= 1064) {
    [reset to 0];
    const idx = tag - 1001;
    emit('exhibit:shot', idx);
  }
}
\`\`\`
```

---

### Task 4: Explosion Particle System

**Deliverable:** Physics values and timing for the fireball particle effect in `js/explosion.js`.

When a painting is shot, a Canvas 2D overlay plays a particle burst before the exhibit portal opens.

**Timing sequence (Claude Code's design):**
- **0–80ms:** Screen flash (orange → transparent)
- **0–300ms:** Fire particles (burst outward and upward)
- **200–400ms:** Smoke particles (drift upward slowly)
- **400ms:** `onComplete()` fires → `ExhibitPortal.open()`

**Specify the physics values:**
1. Fire particle count (how many?)
2. Initial velocity range (min/max pixels per frame)
3. Spread angle (radial burst vs cone upward?)
4. Gravity (pixels per frame²)
5. Drag/friction (velocity multiplier per frame, e.g., 0.95)
6. Particle size (start radius, end radius)
7. Particle lifetime (frames at 60fps)
8. Color progression for fire (e.g., white → yellow → orange → red → transparent)
9. Smoke particle count and physics (slower, larger, gray)
10. Screen flash color and opacity curve

**Format:**
```markdown
## Explosion Particle System

### Screen Flash
- Color: [hex]
- Peak opacity: [0–1]
- Duration: [ms]
- Easing: [linear / ease-out]

### Fire Particles
- Count: [number]
- Initial speed: [min]–[max] px/frame
- Angle spread: [degrees] around [direction]
- Gravity: [px/frame²] (negative = up)
- Drag: [multiplier per frame]
- Start radius: [px]
- End radius: [px]
- Lifetime: [frames]
- Colors: [progression array]

### Smoke Particles
- Count: [number]
- Initial speed: [min]–[max] px/frame upward
- Gravity: [value] (slight upward pull)
- Drag: [multiplier]
- Start radius: [px]
- End radius: [px]
- Lifetime: [frames]
- Colors: [gray shades, opacity curve]

### Canvas Setup
- Overlay z-index: [value]
- Blend mode: [screen / source-over / lighter]
- Origin point: [center of screen / crosshair position]
```

---

### Task 5: Shareware Data Bundle Confirmation

**Deliverable:** Exact file list needed from `ustymukhman/webDOOM` to run PrBoom on GitHub Pages with shareware data only.

The goal: self-host DOOM on GitHub Pages with zero proprietary assets, minimal file size.

**Research the ustymukhman/webDOOM repo and confirm:**

1. What are the exact files required to run the engine? (doom1.js, doom1.wasm, doom1.data — or different names?)
2. Does the `.data` bundle include the shareware IWAD (`doom1.wad`)? Is this legally distributable?
3. What is the **actual file size** of each required file?
4. Is there a smaller/minimal build that excludes music/sounds but keeps gameplay? (For faster GitHub Pages load)
5. Are there any CORS or same-origin requirements for loading `.wasm` files from GitHub Pages?
6. What `Module` config is required to bootstrap PrBoom (the `var Module = { ... }` block)?
7. Does PrBoom accept PWADs via the Emscripten virtual filesystem? (`FS.writeFile('/doom/gallery.wad', ...)`)
8. Which Emscripten FS call is needed before `Module.run()` to inject our custom WAD?

**Format:**
```markdown
## Shareware Bundle Confirmation

### Required Files
| File | Size | Purpose |
|------|------|---------|
| doom1.js | [KB] | Emscripten JS glue |
| doom1.wasm | [KB] | PrBoom WebAssembly |
| doom1.data | [MB] | Packed shareware assets |

### Legal Status
[Confirm shareware doom1.wad is freely distributable]

### Module Bootstrap Config
\`\`\`javascript
var Module = {
  canvas: document.getElementById('canvas'),
  // [all required fields]
};
\`\`\`

### PWAD Injection
\`\`\`javascript
// Call this BEFORE Module.run():
FS.mkdir('/doom');
FS.writeFile('/doom/gallery.wad', uint8ArrayOfOurWad);
// Then launch with:
Module.arguments = ['-iwad', 'doom1.wad', '-file', '/doom/gallery.wad'];
\`\`\`

### GitHub Pages Compatibility
[Any .htaccess or headers needed for .wasm MIME type?]

### CORS Notes
[Any cross-origin restrictions for self-hosting on github.io?]
```

---

## Delivery

**Save all 5 task responses to a single file:**

```
/Users/bunj/claude/portfolio maze/.claude/ZENCODER-DOOM-LEVEL.md
```

Structure it with one `##` heading per task. Claude Code will parse and implement immediately upon delivery.

**This is blocking all DOOM implementation work. High priority.**
