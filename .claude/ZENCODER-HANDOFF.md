# ZENCODER HANDOFF BRIEF
## BUNJUMUN-MAZE-95 — Generative Architecture & Optimization

**Date:** 2026-04-06
**Project:** BUNJUMUN-MAZE-95 (3D Win95 Maze + Gallery CMS)
**Status:** Core scaffold complete; ready for refinement

---

## Current State

**Completed by Claude Code:**
- ✅ All 8 core JS modules (maze-gen, curator, engine, controls, exhibit, github-api, admin)
- ✅ CSS foundation (Win95 HUD, loading, basic chrome)
- ✅ HTML entry point + Three.js r128 scaffold
- ✅ README + GitHub Pages config
- ✅ Initial git commits (scaffold + docs)

**Ready to hand off:** Token-heavy generative work

---

## Zencoder Tasks (High Value, Design-Heavy)

### 1. Procedural Texture Enhancement
**Location:** `js/engine.js` lines 95–165
**Current:** Basic textures (brick walls, concrete floor, metal ceiling)
**Needed:**
- More sophisticated Win95 aesthetic (grime, wear, color variation)
- Performance-optimized Canvas rendering (no bloat)
- Consider: tileable patterns, lighting-aware detail
- Generate improved Canvas-based texture factory functions
- Keep performance in mind: textures applied to 27×27 grid + caching

**Deliverables:**
- Improved `_makeBrickTexture()` function
- Enhanced `_makeFloorTexture()` function
- Optional: `_makeWallPanelTexture()` for frame borders
- Comments explaining any performance trade-offs

---

### 2. Spacing Algorithm Optimization & Math
**Location:** `js/curator.js` lines 60–109
**Current:** Simple 5-unit Euclidean distance dead-zone check (sequential)
**Needed:**
- Analyze: Is 5 units the right dead-zone size? (perceptual feel vs. maze capacity)
- Optimize: Could we use spatial partitioning (quadtree/grid) instead of O(n²) comparison?
- Consider: Does "distance from wall face" matter more than "distance from frame center"?
- Explore: Alternative anchor strategies (e.g., offset from run start vs. center)
- Generate: Performance analysis + recommendations

**Deliverables:**
- Mathematical justification for current parameters (or revised values)
- Optional: Pseudocode for spatial partitioning if optimization is needed
- Comments in code explaining the spacing rationale

---

### 3. CSS Master Templates & Responsive Design
**Location:** `css/style.css` (entire file; currently 120 lines)
**Current:** Minimal — basic HUD, loading screen, Win95 chrome fragments
**Needed:**
- Complete Win95 window system (scrollbars, buttons, form controls)
- Mobile responsive? Or intentionally desktop-only?
- Dark mode variant (optional CSS custom properties)
- Accessibility: keyboard navigation hints, focus states
- Polish: scrollbar styling, inset/outset borders, authentic bevels
- Generate: comprehensive CSS template with variables for extensibility

**Deliverables:**
- Enhanced `css/style.css` with:
  - Complete Win95 form control styles (input, textarea, select, checkbox, radio)
  - Button states (normal, active, disabled, hover)
  - Optional scrollbar customization
  - CSS custom properties for colors, spacing, fonts
  - Comments linking to design references

---

### 4. Game Mechanics Brainstorm & Conceptualization
**Current:** Straight navigation + exhibit viewing (no gameplay)
**Explore:**
- Easter eggs? (hidden rooms, secret shortcuts)
- Optional: collectibles, power-ups, time challenges?
- Ambient sound suggestions (8-bit Windows 95 nostalgia)?
- Narrative flow: is this purely a portfolio, or could there be a "quest"?
- Social sharing: how to link directly to specific exhibits?
- Accessibility: colorblind mode? High-contrast HUD?

**Deliverables:**
- Design doc (1–2 pages) with:
  - 2–3 polished game mechanic ideas
  - Feasibility assessment (implementation complexity)
  - Examples from 90s screensaver culture
  - Recommendations for phase 1 vs. future work

---

### 5. Performance Optimization Strategy
**Focus:** Identify bottlenecks, provide profiling roadmap
**Analysis:**
- Three.js scene: 27×27 wall boxes (~729 meshes). Should we instance or batch?
- Canvas textures: regenerated per engine init. Cache them?
- Curator algorithm: O(n²) dead-zone check on frame placement — is this bottleneck-worthy?
- Mobile: renderer pixel ratio, fog distance, draw calls
- Admin console: Shadow DOM isolation impact on main thread?

**Deliverables:**
- Performance audit doc with:
  - Estimated frame budget (60 FPS target)
  - Top 3 likely bottlenecks + proposed fixes
  - Profiling checklist (Chrome DevTools tips)
  - Optional: code snippets for measurements (performance.now(), etc.)

---

## What Claude Code Is Handling (Implementation)

- ✅ Local dev server setup & testing
- ✅ GitHub repo creation + authentication
- ✅ Runtime debugging (Three.js, collision, etc.)
- ✅ Admin console UX refinement (if needed)
- ✅ First-time GitHub Pages deployment
- ✅ Integration testing (all modules talk to each other)

---

## Integration Point

Once zencoder delivers optimized textures/CSS/design docs:

1. **Textures:** Claude Code drops improved functions into `engine.js` and tests rendering
2. **CSS:** Claude Code verifies no regressions in HUD, admin console, exhibit viewer
3. **Design docs:** Claude Code evaluates feasibility; decides which features to prioritize
4. **Performance strategy:** Claude Code runs profiling & implements top recommendations

---

## Notes for Zencoder

- **Three.js version:** r128 (loaded from CDN)
- **Browser target:** Modern desktop (Chrome, Firefox, Safari)
- **Aesthetic:** Windows 95 screensaver (eerie, spacious, low-poly)
- **Constraints:** No external assets; all procedural or embedded Base64
- **Performance:** 60 FPS on mid-range hardware; minimal CPU when idle

---

**Next sync:** Once zencoder delivers, Claude Code will integrate, test, and push to GitHub.
