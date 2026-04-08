# LLAMA TASK — Maze Menu Spec + FPS Mode Analysis
**Date:** 2026-04-08
**Priority:** HIGH
**Your outputs feed directly into Gemini's implementation task.**

---

## CONTEXT: What Just Changed

The project has **pivoted back to the original Three.js Windows 95 maze** as the main site.
The DOOM engine is preserved on a `doom` branch for future use.

The maze is a procedurally-generated 3D first-person maze portfolio (Three.js r128).
It runs at: https://bunjumun.github.io/bunjumaze (GitHub Pages, vanilla JS, no build step)

Existing JS modules (all restored at `v1.0-maze`):
- `js/maze-gen.js` — Recursive backtracker maze generator
- `js/engine.js` — Three.js scene (brick/concrete textures, fog, lighting)
- `js/controls.js` — Free-mouse FPS movement (WASD + mouse delta, NO pointer lock)
- `js/curator.js` — Places picture frames on wall straightaways ≥3 units
- `js/exhibit.js` — Win95 Shadow DOM portal viewer (opens on exhibit approach)
- `js/admin.js` — Win95 admin console (Key A to open)
- `js/main.js` — Bootstrap (mode selector → maze init → frame placement → event wiring)
- `js/game-mode-manager.js` — State machine (maze|doom|transitioning)

---

## YOUR JOB 1: Write the Gemini implementation spec

**Output file: `.claude/GEMINI-TASK.md`** (overwrite existing)

Write a complete technical spec for Gemini to implement. It must cover:

### A. New `js/menu.js` — Win95 Game Menu

A Shadow DOM Win95 window shown at page load BEFORE the maze generates.
Closes when the player picks an option. Maze init only runs after "START EXPLORATION".

Menu items:
1. **START EXPLORATION** → fires `menu:start` event → main.js runs maze init
2. **SETTINGS** → opens existing settings panel (if any) or shows placeholder
3. **ADMIN CONSOLE** → calls `adminConsole.open()`
4. **FPS MODE** → toggles FPS mode (see Job 2 for activation method)
5. **CREDITS** → shows Win95 "About" dialog with Bunjumun name + version

Implementation notes for Gemini:
- Shadow DOM pattern: same as `exhibit.js` and `admin.js` — use `attachShadow({ mode: 'open' })`
- Win95 styling: #C0C0C0 background, #000080 titlebar, inset/outset borders, MS Sans Serif font
- Host element: `<div id="menu-host"></div>` added to `index.html`
- Load order in index.html: add `<script src="js/menu.js"></script>` BEFORE main.js
- `main.js` change: wrap maze init in `document.addEventListener('menu:start', () => { ... })`
- The menu should be dismissible with Enter key (triggers START EXPLORATION)
- Button hover state: Win95 inset border on hover

ASCII mockup for Gemini to reference:
```
┌─────────────────────────────────┐
│ ▓ BUNJUMUN GALLERY 95    _ □ ✕ │
├─────────────────────────────────┤
│                                 │
│   ██████████████████████████    │
│   █  BUNJUMUN GALLERY 95  █    │
│   ██████████████████████████    │
│                                 │
│   [ START EXPLORATION  ]        │
│   [ SETTINGS           ]        │
│   [ ADMIN CONSOLE      ]        │
│   [ ◈ FPS MODE         ]        │
│   [ CREDITS            ]        │
│                                 │
│   version 1.0 · bunjumun.com    │
└─────────────────────────────────┘
```

### B. `js/exhibit.js` — ESC key fix (from doom branch)

Tell Gemini to apply these two changes:
1. Change ESC keydown to capture phase: `document.addEventListener('keydown', fn, true)`
2. Add `e.stopPropagation()` before `this.close()`
3. Remove the `setTimeout(() => document.getElementById('maze-canvas')?.requestPointerLock(), 100)` call in `close()` — maze uses free-mouse, not pointer lock

### C. `js/admin.js` — Audio config panel (from doom branch)

Tell Gemini to add an AUDIO CONFIG panel inside the admin Shadow DOM:
- Background Music URL input (text field, accepts .mp3/.ogg/stream URL)
- Volume slider (0–100, default 60)
- Loop checkbox
- Three buttons: Test | Stop | Save Audio Config
- `Test` button: `new Audio(url).play()` with the volume set
- `Stop` button: pauses the test audio
- `Save` button: calls `this._saveAudio()` which persists to localStorage

### D. `js/controls.js` — FPS mode toggle

Tell Gemini to add a `setFpsMode(bool)` method to `FirstPersonControls`:
- When `true`: call `this.domElement.requestPointerLock()` — pointer lock activates
- When `false`: call `document.exitPointerLock()`
- Add `pointerlockchange` listener on `document` to sync the internal flag
- HUD: add/remove CSS class `fps-active` on `document.body` when mode changes
  (CSS rule: `body.fps-active #crosshair { display: block; color: red; }`)
- Persist to `localStorage.setItem('fpsMode', bool)`

---

## YOUR JOB 2: Analyze FPS activation methods + recommend one

**Output file: `.claude/LLAMA-RESPONSE.md`** (create/overwrite)

Research and analyze these 5 activation options for FPS mode in a portfolio maze site.
Write your analysis and a clear recommendation with reasoning.

### Option A — Menu button
"FPS MODE" in the main menu + HUD toggle button while in maze.
Pros: obvious, accessible, no discovery needed
Cons: feels like a settings option, less fun

### Option B — Weapon pickup in maze
A glowing "pistol" mesh placed in the spawn room. Walking over it activates FPS mode.
Pros: immersive, narrative, surprising
Cons: requires 3D object, players might not find it

### Option C — Keyboard shortcut (F key)
Press F while in maze to toggle FPS mode. HUD shows "FPS MODE ON/OFF" notification.
Pros: instant, simple to implement
Cons: not discoverable without docs

### Option D — Cheat code keyboard sequence
Type "FPS" or "IDDQD" anywhere in maze (no UI, just keypress sequence detection).
Pros: fun easter egg, Win95/DOOM reference
Cons: extremely hidden, could frustrate portfolio visitors

### Option E — Proximity unlock (weapon locker)
A "WEAPON LOCKER" terminal in a fixed maze room. Press E to activate FPS mode.
Pros: in-world narrative, discoverable
Cons: requires extra maze room + terminal mesh

### Your analysis should cover:
- Which option best fits a portfolio/gallery site (visitors are NOT gamers by default)
- Which option is most discoverable without documentation
- Which option preserves the "surprise and delight" of the Win95 aesthetic
- Implementation complexity (simple/medium/complex)
- Final recommendation with 1-2 sentence reasoning

---

## IMPORTANT RULES FOR GEMINI SPEC

When writing GEMINI-TASK.md:
1. Give Gemini the COMPLETE code for each change — not pseudocode
2. Tell Gemini: "Read the full file before editing ANY file"
3. Tell Gemini: "Do NOT rewrite full JS files — only patch the specific sections"
4. Tell Gemini: bump `?v=` cache-busting version in `index.html` for any changed JS file
5. Tell Gemini: respond to `.claude/GEMINI-RESPONSE.md` when done

---

## CODING STYLE RULES (pass to Gemini)
- Vanilla JS only — no frameworks, no build step
- Class-based modules (capitalize: `GameMenu`, `FirstPersonControls`)
- Shadow DOM for all UI overlays
- Win95 palette: `#C0C0C0` window bg, `#000080` titlebar, `#FFFFFF` titlebar text
- No pointer lock by default — FPS mode is OPT-IN only
- No hardcoded secrets

---

When done, write:
- `.claude/GEMINI-TASK.md` — full implementation spec for Gemini
- `.claude/LLAMA-RESPONSE.md` — FPS analysis + recommendation
