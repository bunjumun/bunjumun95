# Gemini Current Task — CYCLE 1 FULL TEST
**Assigned by:** Claude Code
**Date:** 2026-04-07
**Priority:** HIGH — User sleeping, keep project moving

## Your Assignment: Full Feature Test (All Features)

Test BOTH URLs and report everything:
- Local: http://localhost:8080
- Live: https://bunjumun.github.io/bunjumun95 (deploying now — check every 30s)

---

## Full Feature Checklist

### Engine
- [ ] DOOM title screen renders (Doomguy + DOOM logo)
- [ ] Win95 HUD visible: "DOOM.EXE — BUNJUMUN GALLERY"
- [ ] Exhibits counter shows (e.g. "0 / 1")
- [ ] Status shows "Ready"
- [ ] DOOM responds to keyboard input (arrows/WASD move, spacebar fires)
- [ ] FPS stable (should feel smooth, not choppy)

### Exhibit Trigger System
- [ ] Shoot a wall → explosion particle effect fires (orange flash, fire, smoke)
- [ ] Explosion completes in ~400ms (not hanging)
- [ ] Exhibit portal opens after explosion (Win95 window chrome)
- [ ] Portal closes cleanly (X button or Escape)
- [ ] DOOM engine pauses while portal open
- [ ] DOOM engine resumes after portal close

### Admin Console
- [ ] Gear icon (⚙) visible top-right
- [ ] Click gear → admin panel opens OVER the game (no z-index bleed)
- [ ] Admin panel has Win95 styling
- [ ] "New Exhibit" form visible
- [ ] Password prompt appears for GitHub token
- [ ] Admin closes cleanly

### Gallery Loading
- [ ] gallery.json loads on startup
- [ ] Exhibits count reflects gallery.json contents

### Aesthetics
- [ ] Win95 teal (#008080) background on HUD
- [ ] Monospace font in HUD and admin
- [ ] No visual glitches on canvas
- [ ] No UI elements bleeding into DOOM canvas

---

## Report Format
Write ALL findings to `.claude/GEMINI-RESPONSE.md` using this format:

```
## Cycle 1 Results — [timestamp]

### ✅ Passing
- [feature]: [notes]

### ❌ Failing
- [feature]: [error or visual description]

### ⚠️ Warnings
- [feature]: [non-blocking issue]

### Console Errors
[paste any non-GL errors here]

### Recommended Fixes
[list what Claude Code should fix]
```

---

## Context Budget Reminder
When your context is ~75% full:
1. Save findings to GEMINI-RESPONSE.md immediately
2. Update AGENT-STATUS.md: status = OUT_OF_USAGE (if out) or STANDBY (if done)
3. Llama will revive you if needed

## If Claude Code Is Offline
You are interim lead. See `.claude/CLAUDE-CODE-OUTAGE-PLAN.md`.
Do NOT change architecture. Document bugs, don't fix them (unless trivial CSS).
