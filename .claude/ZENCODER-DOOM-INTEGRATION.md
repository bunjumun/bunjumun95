# ZENCODER HANDOFF: DOOM Mode Integration
## Phase 1–3 Planning & Architecture

**Date:** 2026-04-07
**Project:** BUNJUMUN-MAZE-95 + DOOM Hybrid Gallery
**Status:** Research complete; ready for architecture & design planning

---

## Executive Summary

**Objective:** Add optional **DOOM-style shooter mode** as alternative to maze navigation. Interactivity: **shoot paintings to trigger exhibits**. Gallery functionality unchanged. Full seamless mode-switching.

**Why DOOM?** Retro aesthetic aligns with Win95 theme. Adds gameplay/engagement layer beyond passive maze walking.

**Technical Approach:** Canvas swapping + adapter layer (don't fork DOOM itself). Use **jsZDoom** (most documented Emscripten DOOM port).

**Timeline:** 2–4 weeks solo Claude Code dev, with zencoder handling architecture + design decisions.

---

## What Claude Code Has Already Confirmed

✅ **Feasibility: 8/10** — Very doable with mode-switching pattern
✅ **Research complete** — jsZDoom identified as best source port
✅ **Architecture selected** — Canvas swapping recommended over alternatives
✅ **Key challenges identified** — canvas/input hijacking, audio context, WASM loading

**Critical finding:** Your Three.js architecture with `pause()`/`resume()` + Shadow DOM isolation is **perfectly suited** for mode switching. No major rewrites needed.

---

## Zencoder's Responsibilities (Design & Strategy)

### 1. Canvas Swapping Architecture & API Design
**Scope:** Define the `GameModeManager` class contract

**Needed:**
- **Public API design:**
  ```javascript
  class GameModeManager {
    constructor(mazeEngine, doomEngine) { ... }
    switchToMaze() { ... }
    switchToDoom(startPosition) { ... }
    getCurrentMode() { return 'maze' | 'doom' }
    onModeChange(callback) { ... }  // event listener
    dispose() { ... }  // cleanup
  }
  ```
- **State management:** how to preserve/restore player position when switching modes?
- **Canvas coordination:** DOM structure + Z-index layering (both canvases coexist)
- **Resource lifecycle:** When to load/unload DOOM WASM?

**Deliverable:**
- Detailed `GameModeManager` API spec (TypeScript interface)
- State machine diagram (maze ↔ doom ↔ loading ↔ error)
- Canvas layering strategy (HTML mockup / ASCII diagram)
- Comments explaining each API method's lifecycle

---

### 2. Input Routing Layer Design
**Scope:** Keyboard, mouse, gamepad delegation to active engine

**Needed:**
- **Input event flow diagram:**
  ```
  DOM keydown → GameModeManager → active engine
                    ↓
  (ignore if DOOM disabled, route to maze if enabled, etc.)
  ```
- **Detach/reattach strategy:**
  - How to cleanly remove DOOM listeners without breaking maze controls?
  - Should input routing use a **single global listener** or separate per-engine?
  - Handle pointer-lock conflicts (both engines may request lock)

- **Special keys:**
  - ESC: exit DOOM? Or handled by DOOM natively?
  - TAB: still open minimap in maze? Disabled in DOOM?
  - Settings icon (⚙): always accessible, pauses active engine?

**Deliverable:**
- Input flow diagram (visual or ASCII)
- Code skeleton for `InputRouter` class (method signatures only)
- Keyboard event mapping table (key → engine → action)
- Pointer-lock conflict resolution strategy

---

### 3. Audio Context Management Strategy
**Scope:** Web Audio API coordination between two 3D engines

**Needed:**
- **Shared audio context vs separate?**
  - Option A: Both engines share single `AudioContext`
  - Option B: DOOM gets its own context; maze uses separate
  - Pros/cons for each approach

- **Volume/mixing strategy:**
  - When in maze: mute DOOM audio output
  - When in DOOM: fade out maze ambience?
  - Or mix both (weird but possible)?

- **Audio context suspension/resume:**
  - Browser pauses context if window loses focus
  - How to handle pause/resume events in mode manager?

- **Latency mitigation:**
  - DOOM audio might lag on first play; preload silence?

**Deliverable:**
- Audio architecture diagram (contexts, mixers, gain nodes)
- Code template: `AudioManager` class with init/pause/resume/setVolume
- Decision matrix: shared vs separate + rationale
- Browser compatibility notes (Chrome, Firefox, Safari Web Audio differences)

---

### 4. Painting Interactivity Strategy
**Scope:** How to detect when player shoots a painting → trigger exhibit

**Two Approaches to Compare:**

#### Option A: Raycast Painting Detection (External to DOOM)
```javascript
// After DOOM fires, also raycast against paintings stored in maze
// Doesn't require modifying DOOM internals
// Simpler but requires painting position cache
```

**Pros:**
- No DOOM code changes
- Can dynamically update paintings from `gallery.json`
- Easy to test in isolation

**Cons:**
- Two raycasts per shot (DOOM + maze)
- Slight desync if DOOM and maze cameras diverge
- Painting hitboxes must be manually defined

**Deliverable:**
- Raycast algorithm (pseudo-code)
- Painting hitbox definition format
- Sync strategy: how to keep DOOM camera ≈ maze camera?

#### Option B: Custom DOOM Actor / WAD Integration
```javascript
// Generate custom DOOM WAD with paintings as shootable actors
// More integrated but complex
```

**Pros:**
- Native DOOM collision (feels right)
- Paintings spawn like regular DOOM sprites
- Can use DOOM's animation system

**Cons:**
- Requires WAD editing / DOOM modding knowledge
- WASM boundary crossing complexity
- Must regenerate WAD on gallery updates

**Deliverable:**
- DOOM modding research: how to create custom actors
- WAD structure design for dynamic paintings
- WASM callback chain: DOOM actor hit → browser exhibit trigger
- Fallback if WAD proves too complex

---

### 5. WASM Loading & Performance Strategy
**Scope:** Optimize js ZDoom (~5 MB gzipped) loading and initialization

**Needed:**
- **Lazy-load approach:**
  - Load DOOM only when user clicks "Play DOOM Mode"?
  - Or preload in background while maze is playing?
  - ServiceWorker caching for repeat visits?

- **Startup sequence:**
  ```
  User clicks "DOOM MODE"
    ↓
  Show loading spinner
    ↓
  Fetch doom.js + doom.wasm (if not cached)
    ↓
  Initialize DoomModule.onRuntimeInitialized
    ↓
  Fade to DOOM view
  ```

- **Memory profile:**
  - Keep both maze + DOOM in memory? (adds ~20 MB)
  - Or destroy maze engine, reload on return? (slower switching)

- **Performance targets:**
  - Initial page load: <300ms (maze only)
  - DOOM lazy-load: <2s (with spinner)
  - Mode switch: <500ms (fade + transition)

**Deliverable:**
- Loading timeline diagram
- Recommended lazy-load vs preload decision + rationale
- Code template: `DoomLoader` async class
- Performance budget breakdown (target milliseconds)
- ServiceWorker caching strategy (if applicable)

---

### 6. Mode Transition UX & Animations
**Scope:** Visual/audio effects when switching between maze ↔ DOOM

**Needed:**
- **Fade strategy:**
  - Black fade? Maze → dissolve → DOOM?
  - Duration: 300ms? 500ms? 1s?
  - Audio crossfade same time?

- **Starting position:**
  - Teleport player to DOOM level near paintings?
  - Use maze player position to seed DOOM spawn?
  - Simple: always start at DOOM level center?

- **Return to maze:**
  - Shoot exit portal? Press ESC? Auto-return after exhibit trigger?
  - Remember maze camera position or reset?

- **Progress tracking:**
  - Show "Shot X paintings" counter in DOOM?
  - Highlight unseen paintings on map?
  - Completion percent: 2/3 paintings hit?

**Deliverable:**
- Transition flow diagrams (with timing)
- UI mockup: DOOM mode overlay elements (HUD, crosshair, ammo count)
- CSS for fade animations
- Decision tree: "What happens when player shoots a painting?"

---

### 7. Custom GAM Map Generation from gallery.json
**Scope:** Auto-generate DOOM level with paintings at exhibit positions

**Challenge:** DOOM uses its own coordinate system; translations needed:

**Needed:**
- **Coordinate system mapper:**
  - Maze: `[wx, wz]` in world space (1 cell = 4 units)
  - DOOM: `[x, y]` in mapper units (1 unit ≈ 512 DOOM units)
  - How to translate exhibit positions?

- **Level-of-detail strategy:**
  - 1 exhibit → 1 tiny room?
  - 10 exhibits → multi-room level?
  - Or always same empty arena + paintings floating?

- **Map format options:**
  - Option A: Generate WAD file server-side (requires DOOM build tools)
  - Option B: Use jsZDoom's level data format (JSON or binary)
  - Option C: Hack WASM memory to inject level at runtime

- **Dynamic updates:**
  - When user adds new exhibit in admin, regenerate level?
  - Push to DOOM without restart?

**Deliverable:**
- Coordinate system translation formula
- Level generation algorithm (pseudo-code)
- Decision: which WAD format to use
- Integration point: when/how to call level generator

---

### 8. Win95 Aesthetic in DOOM Mode
**Scope:** Keep DOOM visually consistent with maze's 90s vibe

**Needed:**
- **HUD design:** Win95-styled status bar? Or vanilla DOOM?
- **Palette & textures:** Use maze's brick/concrete textures in DOOM WAD?
- **Crosshair style:** Default red cross, or custom Windows 95 icon?
- **Fonts:** MS Sans Serif or Courier (maze standard)?
- **Color scheme:** Match primary brand color (#000080)?

**Deliverable:**
- Visual mockup: DOOM HUD in Win95 style
- Texture/palette mapping: maze colors → DOOM palette
- Asset specs: crosshair, ammo/health icons (sprite dimensions)
- CSS for overlay elements

---

## Integration Point: Claude Code's Next Steps

Once zencoder delivers the above:

1. **Evaluate & approve** architecture decisions
2. **Implement `GameModeManager`** based on API spec
3. **Create `InputRouter`** per input flow diagram
4. **Setup `AudioManager`** per audio strategy
5. **Build painting intersection** (raycast or WAD integration)
6. **Integrate jsZDoom** WASM loading per performance strategy
7. **Code mode transitions** per UX timing spec
8. **Test locally** with DOOM shooter gameplay
9. **Optimize & polish** (performance, audio, visuals)
10. **Deploy to GitHub Pages** → test live

---

## Success Criteria

- [ ] Canvas swapping works seamlessly (no flicker, no input lag)
- [ ] Can toggle between maze ↔ DOOM without reloading page
- [ ] Shooting 3–5 paintings in DOOM opens their exhibits (Win95 viewer)
- [ ] Audio transitions smoothly (no feedback loop, no dropouts)
- [ ] DOOM loads in <2s (lazy-load with spinner)
- [ ] Settings icon accessible from both modes (pause → admin)
- [ ] Gallery updates sync to DOOM level without reload
- [ ] 60 FPS on typical hardware (mid-range laptop)
- [ ] No console errors, clean memory on mode switch

---

## Constraints & Context

- **Browser Target:** Modern desktop (Chrome, Firefox, Safari)
- **Aesthetic:** Windows 95 screensaver retro (maintain throughout DOOM mode)
- **Gallery:** All 4 ingestion types (HTML paste, file, widgets, links) must work in DOOM
- **Performance:** ~20 MB RAM overhead (both engines in memory)
- **Security:** No code execution in DOOM mode (paintings are static imagery)
- **Mobile:** Out of scope for now (DOOM heavy; controls challenging on touch)

---

## Questions for Zencoder

Before starting, confirm:

1. **Canvas architecture:** Separate hidden canvas for DOOM, or WebGL texture sharing?
2. **WASM size concern:** Acceptable to load 5 MB on demand? Or preload priority?
3. **Audio preference:** Shared context (simpler) or separate (more control)?
4. **Painting interactivity:** Raycast hack (simpler) or custom DOOM actors (more integrated)?
5. **Map dynamism:** Regenerate WAD per gallery update, or static level?
6. **Mode exit:** Auto-return to maze after exhibit, or manual ESC?

---

## Deliverables Checklist

Zencoder will provide:

- [ ] `GameModeManager` API design (TypeScript interface)
- [ ] State machine diagram (visual or ASCII)
- [ ] Canvas layering HTML/CSS mockup
- [ ] Input routing flow diagram
- [ ] `InputRouter` class skeleton
- [ ] Keyboard event mapping table
- [ ] Audio architecture diagram
- [ ] `AudioManager` code template
- [ ] Painting interactivity decision + algorithm
- [ ] Raycast / WAD approach comparison
- [ ] WASM loading timeline diagram
- [ ] Performance budget breakdown
- [ ] Mode transition mockup (with timings)
- [ ] UI HUD design (DOOM + Win95 hybrid)
- [ ] Level generation algorithm (pseudo-code)
- [ ] Coordinate system translation formula
- [ ] Integration points & handoff steps for Claude Code

**Format:** Markdown files (1–2 per topic) with code templates, pseudo-code, ASCII diagrams, and clear decision rationale.

---

## Timeline

- **Zencoder Research/Design:** 3–5 days
- **Claude Code Implementation:** 2–3 weeks
- **Testing & Polish:** 1 week
- **Live Deployment:** End of Phase 1

---

## Phase Success Threshold

DOOM mode is "MVP ready" when:
- Users can toggle maze ↔ DOOM seamlessly
- Shooting paintings opens exhibits
- No crashes, memory leaks, or 10+ FPS drops
- Feels like natural extension of maze aesthetic (not jarring)

---

**Ready for zencoder to design & plan!**

Hand back when architecture specs are complete.
