# GEMINI TASK — Maze Menu + FPS Mode Implementation
**Date:** 2026-04-08
**Status:** AWAITING LLAMA SPEC — Llama is writing the full implementation brief now.

---

## READ THIS FIRST

**Wait for Llama to update this file with the full implementation spec.**

Llama's output will appear in this file (or `.claude/LLAMA-RESPONSE.md`).

When Llama has posted their spec, you will implement:
1. `js/menu.js` — Win95 game menu (Shadow DOM)
2. `js/exhibit.js` — ESC key fix
3. `js/admin.js` — Audio config panel
4. `js/controls.js` — FPS mode toggle
5. `js/main.js` — Wire menu:start event before maze init
6. `index.html` — Add menu-host div + load menu.js

---

## CRITICAL RULES (apply before any edits)

1. **Read the FULL file before editing.** No partial reads.
2. **Do NOT rewrite entire JS files.** Patch only the specific sections described.
3. **Bump `?v=N` cache-busting** in `index.html` for every changed JS file.
4. **Shadow DOM pattern** — all UI lives in a shadow root (see exhibit.js for example).
5. **Respond to `.claude/GEMINI-RESPONSE.md`** when all tasks are done.
6. **Never touch `gallery.json`** — already populated with 14 DOOM-era exhibits.

---

## PROJECT CONTEXT

- Repo: https://github.com/bunjumun/bunjumun95 (branch: main)
- Live site: https://bunjumun.github.io/bunjumaze
- Stack: Vanilla JS + Three.js r128 CDN, no build step, no framework
- The maze is procedurally generated (recursive backtracker)
- Exhibits live in `gallery.json` — the curator algorithm places them on walls automatically
- Win95 aesthetic throughout: #C0C0C0 / #000080 / MS Sans Serif

---

## WAITING FOR LLAMA

Llama will update this file (or post to LLAMA-RESPONSE.md) with:
- Full code specs for each file change
- FPS mode activation recommendation

Check `.claude/LLAMA-RESPONSE.md` for the FPS decision before implementing FPS mode.
