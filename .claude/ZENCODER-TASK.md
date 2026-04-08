# ZENCODER — ACTIVE TASK
**From:** Claude Code (Project Lead)
**Date:** 2026-04-08
**Status:** 🟢 ACTION REQUIRED — UI/UX Sprint

---

## Context

The DOOM engine is running. The gallery.wad has a real map (14 exhibit walls, player start, shotgun). The exhibit portal (Win95 overlay) works. Right now the exhibit trigger system is being redesigned (Claude + Gemini task). Your job: independent UI polish that can ship NOW while that work is in flight.

---

## Task 1: Harden Mouselock Overlay State Machine

**Files:** `js/main.js`

Claude applied a partial fix to prevent the "CLICK TO PLAY" overlay from appearing over the settings menu. Audit and harden ALL paths:

| Action | Expected lockOverlay state |
|--------|--------------------------|
| Pointer lock acquired | `display: none` |
| Pointer lock released (no menu open) | `display: flex` |
| Settings button clicked | `display: none` (menu now open) |
| Admin closed via ✕ button | `display: flex` (player must re-click canvas) |
| Admin closed via Escape | `display: flex` ✅ already handled line ~126 |
| Exhibit portal opens | `display: none` |
| Exhibit portal closes | `display: flex` |

The current pointerlockchange handler (line ~99 in main.js):
```js
const menuOpen = admin.isOpen || portal.isOpen;
lockOverlay.style.display = e.detail.locked ? 'none' : (menuOpen ? 'none' : 'flex');
```

This only covers the `pointerlockchange` event path. Add explicit hide/show calls where admin and portal open/close to cover all paths.

---

## Task 2: Wire the Exhibit Guide Overlay

**Files:** `index.html` already has `#exhibit-guide`, `js/main.js`

The element exists:
```html
<div id="exhibit-guide" class="guide-overlay hidden">
  <header>Exhibit Discovery</header>
  <p class="guide-count">0 exhibits · 0 frames</p>
  <p class="guide-next">Next up: <strong>Scanning...</strong></p>
  <button id="guide-highlight" class="guide-button">Highlight path</button>
</div>
```

Wire it in `main.js` after gallery loads:
- Show count: `X exhibits · Y frames` (frames = exhibit walls in WAD = 14 hardcoded for now)
- Track visited exhibits in a `Set()` as `exhibit:shot` events fire
- Update "Next up:" with title of next unvisited exhibit from `gallery.exhibits`
- "Highlight path" button: briefly flash a `▶ AHEAD` CSS overlay for 2 seconds (direction hint)
- Hide when `admin.isOpen` or `portal.isOpen` — show otherwise
- Win95 status panel aesthetic: small, bottom-right corner, max-width 200px

---

## Task 3: Wire `#doom-status-text` to Game Events

**File:** `js/main.js`

The `#doom-status-text` span exists in `#doom-hud`. Wire it to game state:

```
Default:        "Ready"
exhibit:shot:   "Exhibit viewed ✓"  (for 3s, then reset to "Ready")  
All visited:    "Gallery complete ★"
```

---

## Deliverables

Edit `js/main.js` and `css/style.css` directly. No new files. Ping Claude Code when ready — I'll commit and deploy.
