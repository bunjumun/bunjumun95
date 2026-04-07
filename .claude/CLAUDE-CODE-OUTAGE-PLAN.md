# CLAUDE CODE OUTAGE PLAN
**For:** All agents — Gemini, Llama, Zencoder
**Trigger:** Claude Code runs out of usage
**Purpose:** Keep the project moving. Preserve design philosophy and file integrity.

---

## Immediate Actions When Claude Code Goes Offline

### Llama (Watchdog) — Do This First
1. Update `AGENT-STATUS.md`:
   ```
   ## Claude Code
   - Status: OUT_OF_USAGE
   - Went offline: [timestamp]
   - Last task: [read from last known state]
   ```
2. Read Claude Code's last known state from `.claude/CLAUDE-CODE-APP-HANDOFF.md`
3. Create `.claude/CLAUDE-SESSION.md` capturing exactly where it stopped
4. Notify Gemini via `.claude/GEMINI-TASK.md`: "Claude Code is offline. You have interim lead."

### Gemini — Take Interim Lead
- Read `.claude/CLAUDE-CODE-APP-HANDOFF.md` for full project context
- Read `.claude/CLAUDE-SESSION.md` for last known state
- Continue the current phase (testing, deploy, or debugging)
- All decisions must stay within the design philosophy below
- Write findings to `.claude/GEMINI-RESPONSE.md` as normal
- Do NOT merge/push to main without Claude Code sign-off (unless deploy-doom.sh was already green)

### Zencoder — Hold Position
- Continue any assigned design task
- Do NOT make architectural changes
- If blocked, document in `.claude/ZENCODER-SESSION.md` and wait

---

## What Keeps Going (Gemini can do autonomously)

| Task | Allowed Without Claude Code? |
|------|------------------------------|
| Browser testing (local + live) | ✅ Yes |
| Documenting bugs in GEMINI-RESPONSE.md | ✅ Yes |
| Reading console errors, network logs | ✅ Yes |
| Running test-doom.sh | ✅ Yes |
| Reporting UX findings | ✅ Yes |
| Running deploy-doom.sh (if tests already PASSED) | ✅ Yes, once |
| Editing JS/CSS source files | ⚠️ Minor fixes only — see rules below |
| Changing architecture (engine, bridge, WAD loading) | ❌ Wait for Claude Code |
| Pushing non-deploy commits | ❌ Wait for Claude Code |
| Changing gallery.json structure | ❌ Wait for Claude Code |

---

## File Management Rules (Non-Negotiable)

### Files Gemini MAY touch
- `.claude/GEMINI-RESPONSE.md` — test results and findings
- `.claude/GEMINI-TASK.md` — task acknowledgement
- `.claude/AGENT-STATUS.md` — status updates only
- `.claude/CLAUDE-SESSION.md` — saving Claude Code's state

### Files Gemini MUST NOT touch
- `js/doom-engine.js` — engine bootstrap
- `js/doom-bridge.js` — WASM polling
- `js/doom-bridge.js` — WASM polling
- `js/explosion.js` — particle system
- `js/gallery-wad.js` — WAD builder
- `js/main.js` — bootstrap entry point
- `doom/doom.js` / `doom/doom.wasm` / `doom/web/doom1.data` — binary assets
- `deploy-doom.sh` / `test-doom.sh` — pipeline scripts
- `index.html` — structure locked

### Git Rules During Outage
- Only `deploy-doom.sh` is authorized to commit + push
- No manual `git add` / `git commit` / `git push`
- If deploy-doom.sh hasn't been run yet, don't run it without Claude Code unless test-doom.sh shows ALL TESTS PASSED

---

## Design Philosophy — Must Be Preserved

These rules govern every decision made while Claude Code is offline:

### 1. Windows 95 Aesthetic Is Sacred
- Teal `#008080` + grey `#c0c0c0` color palette only
- Win95 window chrome on all overlays and portals
- Monospace font stack: `Consolas, 'Courier New', monospace`
- No rounded corners, no gradients, no shadows on UI elements

### 2. Shadow DOM Isolation
- Admin console and exhibit portals live in top-level Shadow DOM
- No z-index bleeding into the DOOM canvas layer
- If you add any UI element, it goes in the Shadow DOM

### 3. Engine Pause Contract
- DOOM's `requestAnimationFrame` MUST be paused when any portal/overlay is active
- Resume immediately on portal close
- Never skip this — it affects performance and state integrity

### 4. gallery.json Is Single Source of Truth
- All exhibit data lives in `gallery.json`
- Updates go through `js/github-api.js` (PUT to GitHub API)
- Never write exhibit data directly into HTML or JS

### 5. No Bloat
- Canvas resize → 800px max before Base64
- gallery.json size check before any upload (warn at 5MB)
- No new npm dependencies without Claude Code approval

### 6. Maze Is Preserved Separately
- Main branch = DOOM only
- Maze version lives at `https://github.com/bunjumun/bunjumaze` (v1.0-maze tag)
- Do NOT merge or reference maze code into main

---

## When Claude Code Returns

Llama sends this revival prompt:

```
You are resuming BUNJUMUN-DOOM as project lead.
Read .claude/CLAUDE-SESSION.md for your last state.
Read .claude/AGENT-STATUS.md for what happened while you were offline.
Read .claude/GEMINI-RESPONSE.md for any findings from Gemini's interim work.

Key state at handoff:
- DOOM engine: RUNNING (verified locally, localhost:8080)
- Binary assets: doom.js (338KB), doom.wasm (1MB), doom/web/doom1.data (92MB)
- locateFile fix: APPLIED (doom-engine.js)
- Memory fix: APPLIED (256MB TOTAL_MEMORY)
- test-doom.sh: 29/29 PASSING
- deploy-doom.sh: READY (not yet run)

Resume from where you left off. Do not start over.
```

---

## After DOOM: Next Project

When DOOM is declared complete (all 3 cycles pass, Claude Code + Gemini both sign off):

**Switch to:** https://github.com/bunjumun/bunjumaze (maze project)

- Same agent team, same watchdog protocol
- Same design philosophy (Win95 aesthetic, Shadow DOM, gallery.json as truth)
- Claude Code leads the transition
- Llama carries over revival duties unchanged
- Gemini carries over UX testing duties unchanged

Do NOT switch until DOOM sign-off is complete. Both agents must agree.

---

## Current Project State (as of handoff)

- **Phase:** Post-local-verification, pre-deploy
- **Next action:** Run `deploy-doom.sh` → push to GitHub Pages
- **After deploy:** 3-cycle testing (see TESTING-PROTOCOL.md)
- **Sign-off required from both:** Claude Code + Gemini before declaring done
