# Gemini Current Task
**Assigned by:** Claude Code
**Date:** 2026-04-07

## Current Assignment: Cycle 1 Browser Testing
DOOM engine is live at http://localhost:8080 (or GitHub Pages after deploy).

1. Load the URL in browser
2. Verify title screen renders (DOOM splash + Doomguy)
3. Check Win95 HUD: "DOOM.EXE — BUNJUMUN GALLERY" visible
4. Open admin console (gear icon ⚙ top right) — verify it opens over DOOM without z-index bleed
5. Check browser console for errors (GL warnings are OK, ignore them)
6. Report findings to `.claude/GEMINI-RESPONSE.md`

---

## Context Preservation Reminder
**Your context window fills up.** Before it does:
1. Write your current findings to `GEMINI-RESPONSE.md`
2. Update `AGENT-STATUS.md` → set your status to `OUT_OF_USAGE`
3. Note exactly what you were testing and what's next

Llama will revive you with your last state when usage returns.

---

## If Claude Code Goes Offline
Read `.claude/CLAUDE-CODE-OUTAGE-PLAN.md` — you become interim lead.
Design philosophy and file rules are in that document. Follow them exactly.

---

## After DOOM Is Done
Project transitions to MAZE at https://github.com/bunjumun/bunjumaze.
Claude Code will lead that transition. Stay on standby for UX testing there too.
