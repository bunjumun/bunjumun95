# ZENCODER HANDOFF — DOOM MODE INTEGRATION
## BUNJUMUN-MAZE-95: Dual Engine Mode

**Date:** 2026-04-07
**Priority:** HIGH

---

## Overview

We are adding a **DOOM Mode** alongside the existing **Maze Mode**. Both modes share the same `gallery.json` exhibits. The mode is selected from the home screen or settings menu.

**Maze Mode (existing):** Win95 3D corridor maze. Walk up to a frame and press E.
**DOOM Mode (new):** WebDOOM engine runs in-browser. Shoot a picture frame to open the exhibit portal.

---

## How the Provided DOOM HTML Works

The sample HTML uses **Emscripten-compiled WebDOOM** loaded via `index.js`. Key facts:
- Renders to a `<canvas id="canvas">` element
- Exposes a `Module` global with `_UpdateJoystick()`, `_SendPause()` methods
- Loads from an external `index.js` Emscripten bundle
- Audio via `Module.SDL2.audioContext`
- Gamepad support built in

We **do not modify the DOOM engine itself**. We wrap it and intercept the "shoot" event to trigger our exhibit portal.

---

## Architecture Decision

```
index.html
  ├── Mode Selector Screen (new)
  │     ├── [MAZE MODE] button → loads existing Three.js maze
  │     └── [DOOM MODE] button → loads WebDOOM wrapper
  │
  ├── Maze Engine (existing js/engine.js)
  └── DOOM Wrapper (new js/doom-mode.js)
        ├── Loads WebDOOM iframe OR inline canvas
        ├── Injects gallery exhibits as "paintings" on walls
        ├── Intercepts shoot/use events → opens ExhibitPortal
        └── Shares ExhibitPortal (js/exhibit.js) — unchanged
```

---

## Zencoder Task 1: Mode Selector Screen

**File to create:** `.claude/ZENCODER-MODE-SELECTOR.md`

Design a Win95-themed **mode selector screen** that appears before the maze loads.

### Requirements:
- Appears BEFORE maze generation (fullscreen overlay, z-index 9999)
- Two large buttons: **[MAZE MODE]** and **[DOOM MODE]**
- Win95 aesthetic — window chrome, beveled buttons, system font
- Stores selection in `localStorage('bunjumun_mode')`
- Skip selector on return visits (use stored preference)
- Small "change mode" link in settings menu to reset

### Deliverable format:
```markdown
## HTML
\`\`\`html
[Full HTML for mode selector overlay]
\`\`\`

## CSS
\`\`\`css
[Styling — Win95 window, large mode buttons, logo]
\`\`\`

## JavaScript
\`\`\`javascript
// Returns promise resolving to 'maze' or 'doom'
function selectMode() { ... }
\`\`\`
```

---

## Zencoder Task 2: DOOM Wrapper Architecture

**File to create:** `.claude/ZENCODER-DOOM-WRAPPER.md`

Design `js/doom-mode.js` — the wrapper that runs WebDOOM and bridges to our exhibit system.

### The DOOM Integration Strategy

WebDOOM is loaded from an existing hosted source. We embed it in an **iframe** (sandboxed) rather than hosting the Emscripten bundle ourselves. This avoids binary asset hosting.

**Recommended iframe source:**
```
https://azazeln28.neocities.org/games/doom
```
(The exact source from the provided HTML sample)

### Shoot-to-Open Mechanic

DOOM doesn't expose a "shoot" callback natively. We detect it by:

**Option A — Keyboard intercept:**
- Listen for spacebar / ctrl (fire keys in DOOM)
- Check if player crosshair is aimed at a "painting sector"
- Since we can't read DOOM's internal state from outside the iframe, use Option B

**Option B — Overlay Raycaster (Recommended):**
- Render an invisible HTML overlay on top of the DOOM canvas
- Track mouse position continuously
- When left-click fires AND mouse is within a defined "painting hotspot" region, open the exhibit
- Hotspots are pre-calculated based on known DOOM map layout

**Option C — Custom DOOM WAD (Advanced, Future):**
- Build a custom WAD file with exhibit paintings as wall textures
- Use DOOM's built-in line trigger system
- Requires WAD editor tooling — defer to Phase 2

**Recommend Option B for Phase 1.**

### Requirements for doom-mode.js:

```javascript
class DoomMode {
  constructor(containerEl, gallery, portal) { }
  
  start() {
    // Load iframe
    // Set up overlay
    // Calculate hotspots from gallery
  }
  
  _buildHotspots(exhibits) {
    // Map exhibits to screen regions
    // Returns array of { x, y, w, h, exhibit }
  }
  
  _onCanvasClick(e) {
    // Check if click hits a hotspot
    // If yes: portal.open(exhibit)
  }
  
  pause() { /* postMessage to iframe */ }
  resume() { /* postMessage to iframe */ }
}
```

### Deliverable format:
```markdown
## Architecture Diagram
[ASCII diagram showing iframe + overlay + portal relationship]

## doom-mode.js skeleton
\`\`\`javascript
[Full class skeleton with method stubs and comments]
\`\`\`

## Hotspot Calculation
\`\`\`javascript
[Algorithm for mapping exhibit index to screen region]
\`\`\`

## Shoot Detection
\`\`\`javascript
[Click/key handler that checks hotspots]
\`\`\`

## iframe Communication
\`\`\`javascript
[How to pause/resume DOOM via postMessage or overlay]
\`\`\`
```

---

## What Claude Code Will Implement (After Zencoder)

1. **Mode selector** — drop HTML/CSS/JS into `index.html` and `css/style.css`
2. **doom-mode.js** — implement the class skeleton zencoder designs
3. **main.js update** — branch on mode selection: maze path vs. doom path
4. **index.html update** — add DOOM iframe container
5. **ExhibitPortal** — verify it works when triggered from doom-mode.js (should be unchanged)
6. **Commit + push** → live on GitHub Pages

---

## Constraints

- **No binary hosting** — don't commit `.wad` files or Emscripten bundles to repo
- **No DOOM engine modification** — treat it as a black box
- **Shared portal** — `js/exhibit.js` ExhibitPortal is reused as-is
- **Shared gallery** — same `gallery.json` drives both modes
- **GitHub Pages compatible** — static files only, no server

---

## Save Deliverables Here

```
/Users/bunj/claude/portfolio maze/.claude/ZENCODER-MODE-SELECTOR.md
/Users/bunj/claude/portfolio maze/.claude/ZENCODER-DOOM-WRAPPER.md
```

Claude Code will auto-detect and integrate when files appear.
