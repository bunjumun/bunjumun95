# GEMINI WORK LOOP — BUNJUMUN-DOOM
**Updated:** 2026-04-08 (post f1676ab)

```
LLAMA   = Watchdog  — monitors every 30min, reports STATUS, revives agents
CLAUDE  = Executor  — implements code, builds, commits, pushes
GEMINI  = Auditor + Content Generator — reviews, verifies, drafts content
```

---

## YOUR LOOP (run continuously)

```
1. Read GEMINI-TASK.md for new task (date >= now)
2. YES → work it → write results to GEMINI-RESPONSE.md (newest first)
   NO  → idle 10 min → repeat
3. If task needs Claude: write "FOR CLAUDE:" section clearly
4. Repeat
```

---

## DIVISION OF LABOR

### GEMINI does:
- Read source files, audit for bugs — report findings (don't rewrite files)
- Verify live site: https://bunjumun.github.io/bunjumun95
- Generate exhibit HTML content for gallery.json zones 3–13
- Draft architecture specs and feature plans
- Report STATUS in the format below

### CLAUDE does (never do these):
- Write/edit .js .py .html files
- Run terminal commands, git commits, pushes
- Modify gallery.json directly

---

## REPORT FORMAT (always use this)

### Verification report:
```
## VERIFY — [ISO timestamp]
STATUS: OK | FAIL
commit: [hash]
gallery.wad bytes: [n]
exhibits loaded: [n]/14
portal opens: YES | NO
ESC closes cleanly: YES | NO
console errors: [list or NONE]
notes: [anything surprising]
```

### Bug report:
```
## BUG — [timestamp]
File: [path]
Issue: [one line]
Fix: [describe the change]

FOR CLAUDE: [exact instruction, file + line]
```

### Content delivery:
```
## CONTENT — [timestamp]
Zone: [index] (tag [1001+index])
Title: [TITLE]
Type: html
Content: [full HTML string]

FOR CLAUDE: paste into gallery.json exhibits array at index [n]
```

---

## CURRENT STATUS (f1676ab — 2026-04-08)

### WORKING ✅
- DOOM loads, renders, player moves
- 3 real exhibits open correctly (MIDWEST PSYCH FEST, tree, LAKEHORSE)
- X button closes portal → DOOM resumes
- ESC closes portal → DOOM resumes (no menu leak — FIXED f1676ab)
- Encoding clean (FIXED f1676ab)
- 14 exhibit zones mapped, 14 frames registered
- WAD: 32 linedefs, EX00TX–EX13TX textures

### OPEN TASKS (priority order)

**P1 — Verify f1676ab is live**
Force-reload https://bunjumun.github.io/bunjumun95, confirm:
- exhibit.js?v=3 loads (check Network tab)
- ESC closes portal without opening DOOM Setup menu
- MAY 8–9 renders clean (no â€" chars)
Report using VERIFY format above.

**P2 — Generate exhibit content for zones 3–13**
Bunjumun needs 11 styled "COMING SOON" placeholder exhibits.
Each should be distinct Win95-style HTML. Requirements:
- Background: #111 or similar dark
- Font: Courier New, monospace
- Unique color accent per zone
- Text: zone number, "COMING SOON", and a fake project title
- No images (keep gallery.json small)
- Max ~500 chars of HTML per exhibit

Provide as JSON array items. Claude will paste them in.

**P3 — Audit gallery.json thumbnail sizes**
Check which exhibits have thumbnails > 50KB (base64).
Report: exhibit index, title, thumbnail byte count.
Recommend: should they be external URLs?

**P4 — Verify LAKEHORSE (widget) on live site**
The Bandcamp iframe won't load in local preview (CDN blocked).
On live site it should work. Check and report.

---

## CRITICAL RULES

1. **Never rewrite entire JS files** — describe targeted line-level changes
2. Your gallery-wad.js edits from earlier sessions are DISCARDED — Claude's v=3 is the correct version
3. DOOM assets (doom.js, doom.wasm, doom1.data) are already in /doom/ — DO NOT re-download
4. The site IS deployed and working — Gemini's "blocked" reports were stale
5. Newest entry first in GEMINI-RESPONSE.md
6. Tag all Claude work "FOR CLAUDE:"
