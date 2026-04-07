# 03 Performance, UX, and Aesthetics

## 1. WASM Loading & Performance Strategy

### Decision: Lazy Load with Background Cache
**Rationale:** jsZDoom and its assets (WAD/PK3) are roughly 5-10MB total. We cannot force users to wait for this on initial page load (which must remain <300ms for the Maze experience). 
Instead, we will fetch DOOM in the background via ServiceWorker *after* the Maze has loaded, or lazy-load it with a loading spinner when the user explicitly clicks the "Play DOOM Mode" button.

### Loading Timeline Diagram
```
[User Action] Click "Play DOOM Mode"
       │
       ▼
[UI Layer] Show Win95 Hourglass Spinner / "Loading DOOM.EXE..."
       │
       ▼
[Network/SW] Fetch jsZDoom WASM & Base WAD (if not cached)
       │ (1000 - 3000ms)
       ▼
[Emscripten] Initialize Runtime (`Module.onRuntimeInitialized`)
       │ (300ms)
       ▼
[UI Layer] Fade out Maze Canvas, Fade in DOOM Canvas (500ms crossfade)
       │
       ▼
[Audio] Unmute DOOM Mixer, Play "Weapon Pickup" sound
       │
       ▼
[InputRouter] Request Pointer Lock on DOOM Canvas
```

### DoomLoader Async Template
```javascript
class DoomLoader {
  constructor() {
    this.loaded = false;
    this.promise = null;
  }
  
  load() {
    if (this.promise) return this.promise;
    
    this.promise = new Promise((resolve, reject) => {
      // 1. Show Spinner
      UI.showLoading('Loading DOOM.EXE...');
      
      // 2. Inject Emscripten Script Tag
      const script = document.createElement('script');
      script.src = 'doom/jsZDoom.js';
      script.onload = () => {
        // 3. Wait for Runtime
        window.Module = {
          onRuntimeInitialized: () => {
            this.loaded = true;
            UI.hideLoading();
            resolve();
          },
          // Map Virtual Filesystem
          preRun: [() => {
            FS.createPreloadedFile('/', 'doom1.wad', 'doom/doom1.wad', true, false);
          }]
        };
      };
      document.body.appendChild(script);
    });
    
    return this.promise;
  }
}
```

### Performance Budgets
| Operation | Target Duration | Constraint |
|-----------|-----------------|------------|
| Initial Maze Load | < 300ms | Absolute priority |
| DOOM Lazy Load | < 2.5s | Show hourglass cursor |
| Mode Transition (Memory) | < 50ms | No stutter |
| Mode Transition (Visual) | 500ms | Smooth crossfade |
| RAM Overhead | ~20-30MB | Acceptable for modern browsers |

---

## 2. Mode Transition UX & Animations

### Transition Flow Diagram
When a user shoots a painting in DOOM:
1. `DoomRaycaster` detects hit -> calls `GameModeManager.triggerExhibit(id)`.
2. DOOM simulation pauses instantly.
3. Pointer Lock exits automatically.
4. Win95 `ExhibitPortal` (Shadow DOM) slides in over the DOOM canvas.
5. User views the exhibit.
6. User clicks the "X" button (Close).
7. *Decision:* Return to DOOM. We do not auto-return to the Maze unless the user presses ESC to open the global menu and selects "Return to Maze".
8. DOOM simulation resumes, pointer lock is requested again.

### CSS Fade Animations
```css
/* mode-transition.css */
.canvas-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: opacity 0.5s ease-in-out;
}

.canvas-hidden {
  opacity: 0;
  pointer-events: none;
}

.canvas-active {
  opacity: 1;
  pointer-events: auto;
}
```

---

## 3. Win95 Aesthetic in DOOM Mode

To ensure the hybrid gallery feels cohesive, DOOM must not look like an entirely different game. We will wrap the DOOM canvas in Win95 aesthetic elements.

### HUD Design & Overlays
- **Status Bar:** We will replace the vanilla DOOM status bar (health, ammo, Doomguy face) with an HTML/CSS overlay styled like a Windows 95 taskbar or property window.
- **Crosshair:** Instead of DOOM's red cross, we use the Windows 95 default cursor (pointer or crosshair `+`).
- **Font:** The DOOM HUD text (e.g., "Picked up a medkit") will be styled using the `MS Sans Serif` standard CSS font used in the Maze.
- **Color Scheme:** Deep blue (`#000080`), gray (`#c0c0c0`), and sharp borders (`inset 2px 2px #fff, inset -2px -2px #000`).

### Asset & Palette Mapping
We will inject the Maze's procedural textures (concrete, brick) into the DOOM WAD via jsZDoom's VFS (as detailed in 02-interactivity-maps). This ensures the walls in DOOM match the walls in the Three.js maze exactly, just rendered through the software raycaster engine.

### UI Mockup (Win95 DOOM HUD)
```html
<div id="doom-hud" class="win95-window">
  <div class="title-bar">
    <span>DOOM.EXE</span>
    <button class="win-btn close-btn">X</button> <!-- Returns to Maze -->
  </div>
  
  <div class="status-panel">
    <div class="status-box">Paintings Viewed: <span id="doom-score">0 / 12</span></div>
    <div class="status-box">Status: <span id="doom-status">Ready</span></div>
  </div>
</div>
```

---

## 4. Integration Handoff Steps

1. **Review Architecture:** Claude Code verifies this documentation.
2. **Setup Boilerplate:** Create `GameModeManager.js`, `InputRouter.js`, and `AudioManager.js`.
3. **Integrate jsZDoom:** Add the WASM files to a `/doom/` directory and implement `DoomLoader`.
4. **Wire the Canvases:** Implement the CSS opacity fade logic and pointer lock handoff.
5. **Implement Raycast:** Setup the hidden Three.js camera to follow the jsZDoom camera coordinates.
6. **Hook UI:** Connect the Win95 `ExhibitPortal` to the DOOM raycast hits.
7. **Refine Map/Textures:** Load custom wall textures into jsZDoom's VFS.
