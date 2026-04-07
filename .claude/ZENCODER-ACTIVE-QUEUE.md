# ZENCODER ACTIVE WORK QUEUE (UPDATED)
**Status:** Maze formula ✅ + UX Discovery ✅ — Settings Menu & Performance Audit pending

## Completed ✅
1. **ZENCODER-MAZE-FORMULA.md** → Integrated to main.js
   - Commit: `e6c22ec` — Square-root scaling formula applied
   - Formula: `ROOMS = 5 + Math.ceil(Math.sqrt(exhibitCount * 30))`

2. **ZENCODER-UX-DISCOVERY.md** → Integrated to main.js, index.html, css/style.css
   - Commit: `7e03202` — Exhibit discovery guide overlay + highlight button
   - Features implemented:
     - Guide overlay (top-right, Win95 styled)
     - Exhibit count + nearest exhibit display
     - "Highlight path" button (logged, awaits breadcrumb animation)
     - localStorage tracking for first-time users (10-second auto-hide)

## Next Priority (In Order)

### 1. ZENCODER-SETTINGS-MENU.md 🎯 (HIGH PRIORITY)
**File location:** `/Users/bunj/claude/portfolio maze/.claude/ZENCODER-SETTINGS-MENU.md`

**Expected content:**
- Win95-style settings menu mockup
- Options: difficulty, graphics quality, exhibit tracker, reset gallery, about
- HTML/CSS template for menu structure
- JavaScript integration hooks for admin.js

**Integration points:**
- Enhance admin.js with settings panel
- Difficulty selector → dynamically scale maze via formula
- Add menu to existing admin console (settingsBtn click)

**Timeline:** Expected next

---

### 2. ZENCODER-PERFORMANCE-AUDIT.md (MEDIUM PRIORITY)
**File location:** `/Users/bunj/claude/portfolio maze/.claude/ZENCODER-PERFORMANCE-AUDIT.md`

**Expected content:**
- Top 3 bottlenecks: maze gen, texture creation, frame placement
- Optimization recommendations with code snippets
- Performance budget: <300ms maze gen, <200ms textures, <100ms frame placement
- Chrome DevTools profiling tips

**Integration points:**
- Apply optimizations to engine.js, curator.js, main.js
- Cache textures and curator results
- Add performance tracking to loading screen

---

### 3. ZENCODER-DOOM-INTEGRATION.md (DESIGN PHASE)
**File location:** `/Users/bunj/claude/portfolio maze/.claude/ZENCODER-DOOM-INTEGRATION.md`

**Expected deliverables:**
- GameModeManager API design (TypeScript interface)
- Canvas layering HTML mockup
- Input routing flow diagram
- Audio context strategy
- Painting interactivity (raycast vs WAD)
- WASM loading timeline
- Mode transition UX mockup

---

## Claude Code Status
- ✅ Maze formula implemented & deployed
- ✅ UX Discovery guide integrated & deployed
- ⏳ Waiting for Settings Menu deliverable
- ⏳ Then Performance Audit
- ⏳ Then DOOM integration specs

**Test locally:** `python3 -m http.server 3000` → http://localhost:3000
**Live site:** https://github.com/bunjumun/bunjumun95 (latest commit: 7e03202)

---

**Keep the momentum! 🚀**
