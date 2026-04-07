# ZENCODER HANDOFF BRIEF v2
## BUNJUMUN-MAZE-95 — Advanced Optimization & UX Refinementtimelock: 2026-04-06

**Project Phase:** Exhibits added, core fixes deployed, optimization phase begins
**Status:** Live on GitHub Pages; functional but ready for polish

---

## What Changed (Claude Code Completed)

1. ✅ **Admin Access:** Changed from A key → ⚙ settings icon (top-right corner)
2. ✅ **Frame Placement:** Now 1 frame per exhibit (not 1 frame per slot)
3. ✅ **Dynamic Maze Sizing:** `ROOMS = 5 + ceil(exhibitCount * 1.5)`
   - 1 exhibit → 7 rooms
   - 3 exhibits → 10 rooms
   - 10 exhibits → 20 rooms

**Why this matters:**
- Smaller maze = easier to navigate with fewer exhibits
- Curator still generates slots, but only frames exist where exhibits are
- Performance scales with exhibit count (not fixed large maze)

---

## Zencoder Tasks (High Priority)

### 1. Maze Sizing Algorithm Validation & Refinement
**File:** `js/main.js` line 20
**Current Formula:** `ROOMS = Math.max(5, 5 + Math.ceil(exhibitCount * 1.5))`

**Needed:**
- Is 1.5x the right scaling factor? Test with edge cases:
  - 1 exhibit (7 rooms) — is it too cramped? Too easy to find?
  - 3 exhibits (10 rooms) — feels like a reasonable maze?
  - 20 exhibits (35 rooms) — maze becomes unwieldy?
- Alternative formulas to consider:
  - Logarithmic: `5 + Math.ceil(5 * Math.log(exhibitCount + 1))`
  - Quadratic: `5 + Math.ceil(Math.sqrt(exhibitCount * 30))`
  - Conservative: `ceil(exhibitCount * 0.8) + 4` (more slots per exhibit)
- Recommend: optimal scaling factor based on "navigability score"

**Deliverable:**
- Analysis document: 2-3 alternative formulas with pros/cons
- Recommendation: which formula feels right? Why?
- Optional: JavaScript code for the winning formula

---

### 2. User Feedback & UX Iteration
**Current State:**
- User added exhibits but doesn't immediately see them in the maze
- User had questions: "Where would I find it?" → needs better guidance

**Needed:**
- Exhibit **discovery mechanism**: how do users know where to find stuff?
  - Option A: Show exhibit count + frame count on load screen
  - Option B: Highlight nearest exhibit path (visual breadcrumb)
  - Option C: Visitor log / firstseen tracker (shows new exhibits)
  - Option D: Mini-guide overlay (first visit): "3 exhibits hidden — explore!"
- Mobile-friendly? (currently desktop-only)
- Accessibility audit: keyboard nav, screen readers, colorblind mode?

**Deliverable:**
- Design concept (1-2 mockups): how would a first-time user know where exhibits are?
- Feasibility assessment: which option is easiest to implement?
- Optional: CSS + HTML snippet for winning UX concept

---

### 3. Settings Menu Refinement
**Current:** Simple icon click opens admin console
**Needs:**
- Full **Settings / Options Menu** with:
  - Difficulty levels (easy = smaller maze, hard = larger)
  - Visual tweaks (brightness, texture quality)
  - Exhibit collection tracker ("Found 2/3 exhibits")
  - About / Credits page
  - Reset gallery (clear exhibits)
  - Performance tuning (fog distance, texture resolution)
- Win95 **menu design** — split into File / View / Help submenus?

**Deliverable:**
- Settings menu mockup (Win95-style window)
- List of all options + descriptions
- Optional: HTML/CSS template for menu structure

---

### 4. Performance Profiling & Recommendations
**Current Concerns:**
- O(N²) dead zone check in curator (typically <100 slots, so OK)
- Canvas textures regenerated on init (could be cached)
- Admin console Shadow DOM overhead
- Possible memory leak: Frame objects stored indefinitely

**Needed:**
- Profile `main.js` load sequence
- Identify bottlenecks:
  - Maze generation time (should be <200ms)?
  - Texture generation (Canvas creation overhead)?
  - Initial frame placement (iterate through 50+ slots)?
- Recommend optimizations:
  - Memoize textures? Cache between maze regens?
  - Web Workers for curator algorithm?
  - LOD (level of detail) for far frames?
- Provide performance budget targets (60 FPS on mid-range hardware)

**Deliverable:**
- Performance audit: "Top 3 bottlenecks and fixes"
- Chrome DevTools profiling tips (for user)
- Optional: Code snippets for caching / optimization

---

### 5. Advanced Features Brainstorm
**Out of scope for phase 1, but explore:**
- **Multiplayer maze** — can 2 players explore together?
- **3D minimap** — rotate/tilt overhead view?
- **Exhibit analytics** — which exhibits are most visited?
- **Procedural art frames** — each frame has unique border style based on exhibit type?
- **Easter eggs** — secret maze sections, hidden exhibits?
- **Speedrun mode** — "find all exhibits in 60 seconds" challenge?

**Deliverable:**
- Brainstorm doc: 3-5 polished ideas
- Feasibility matrix (easy / medium / hard)
- Which would users want?

---

## Integration Point

Claude Code will:
1. Evaluate zencoder's formula recommendation → update `main.js` line 20
2. Implement winning UX concept (if low-friction)
3. Integrate settings menu structure into `admin.js`
4. Apply performance optimizations from audit
5. Test & validate before next push

---

## Success Criteria

- [ ] Formula feels right: 1-20 exhibits navigable without frustration
- [ ] First-time users understand how to find exhibits
- [ ] Settings menu is intuitive (Win95-style obvious)
- [ ] Maze generates in <300ms on typical hardware
- [ ] No console errors on load/init
- [ ] Gallery updates don't break frame placement

---

## Constraints & Notes

- **Browser:** Modern desktop (Chrome, Firefox, Safari)
- **No backend:** Everything client-side or GitHub API only
- **Aesthetic:** Windows 95 screensaver (eerie, spacious)
- **Performance:** 60 FPS target; no lag when exploring
- **Scaling:** Should handle 1–50+ exhibits gracefully

**User context:**
- They care about exhibit visibility & navigability
- UX clarity is high priority (where do exhibits appear?)
- Settings icon works well; A key was confusing
- Dynamic scaling solves the "too big a maze for 1 exhibit" problem

---

**Hand back to:** Claude Code for evaluation & implementation
**Sync point:** After zencoder delivery
