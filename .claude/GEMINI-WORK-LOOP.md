# GEMINI WORK LOOP — BUNJUMUN-DOOM
**Created:** 2026-04-08
**Your role on this team:**

```
LLAMA   = Watchdog (monitors every 30min, reports STATUS, revives agents)
CLAUDE  = Executor  (implements code, runs git, builds, commits/pushes)
GEMINI  = Auditor + Heavy Lifter (reviews, verifies, generates content, drafts specs)
```

---

## YOUR LOOP (run continuously all day)

```
LOOP:
  1. Read GEMINI-TASK.md
  2. Is there a new task (creation date >= now)? YES → do it, go to step 3
                                                  NO  → idle 10 min, restart
  3. Write results to GEMINI-RESPONSE.md (append, newest first)
  4. If task requires Claude action → write to GEMINI-TASK.md with section "FOR CLAUDE:"
  5. Loop
```

---

## WHAT YOU DO (vs what Claude does)

### YOUR jobs (token-heavy, generative, analytical):
- Read source files, audit them for bugs → report FINDINGS (don't rewrite files)
- Verify live site behavior at https://bunjumun.github.io/bunjumun95
- Generate gallery exhibit content (HTML snippets, descriptions) for gallery.json
- Draft architecture plans, write specs, design new features
- Research DOOM WAD format issues, PrBoom behavior
- Generate placeholder exhibit content for zones 3–13

### CLAUDE's jobs (never do these yourself):
- Write/edit .js, .py, .html files
- Run terminal commands (python3, git)
- Commit and push to GitHub
- Modify gallery.json directly

---

## HOW TO REPORT (CRITICAL — follow exactly)

### For bugs: describe the fix, don't rewrite the whole file
```
## BUG FOUND — [timestamp]
File: js/exhibit.js
Line: 209
Issue: innerHTML = '' does not stop audio in iframes
Fix: set iframe.src = '' before clearing innerHTML

FOR CLAUDE: In exhibit.js close(), before `area.innerHTML = ''`, add:
  area.querySelectorAll('iframe').forEach(f => f.src = '');
```

### For new content: provide the data, not the code
```
## NEW EXHIBIT CONTENT — [timestamp]
Zone: 3 (index 2, tag 1003)
Title: LAKEHORSE SOUNDCLOUD
Type: widget
Content: <iframe ...>
Thumbnail: [base64 or URL]

FOR CLAUDE: Add to gallery.json exhibits array at index 2.
```

### For verification results:
```
## VERIFY — [timestamp]
STATUS: OK | FAIL
gallery.wad bytes: 3201
texture merge: OK
walls visible: YES
portal opens: YES
console errors: NONE
```

---

## CURRENT PRIORITY QUEUE

Work through these in order. Mark each DONE in your response.

### P1 — Verify commit d193984 is live and working
- Open https://bunjumun.github.io/bunjumun95
- Check console: gallery.wad should be 3201 bytes, texture merge should succeed
- Report STATUS using the verify format above

### P2 — Audit exhibit.js for the maze-canvas reference (Cycle 3 finding)
- Read js/exhibit.js close() method
- Does it reference 'maze-canvas'? Current code says it does NOT (Claude already fixed it)
- Confirm or deny — report finding

### P3 — Generate exhibit content for zones 3–13 (the 11 placeholders)
- Bunjumun's real projects need to fill these zones
- For NOW: generate 11 varied "COMING SOON" exhibits with distinct Win95-style HTML
- Each needs: title, type="html", content (styled HTML string), no thumbnail needed
- Provide as JSON array entries for Claude to paste into gallery.json

### P4 — Audit gallery.json for bloat
- gallery.json is 351KB, mostly from base64 thumbnails
- Count how many bytes each exhibit's thumbnail takes
- Report: which exhibits have oversized thumbnails (>50KB base64)
- Recommend: should thumbnails be external URLs instead?

---

## RULES

1. **Never replace entire files** — always describe targeted changes for Claude
2. **Newest entry first** in GEMINI-RESPONSE.md
3. **Tag everything "FOR CLAUDE:"** when you need implementation
4. **No dummy code** — if you're unsure of exact syntax, describe the intent
5. **Report what you actually see** — don't fabricate verification results
6. If you hit a wall, write: `BLOCKED: [reason]` and move to next task

---

## WHAT'S ALREADY DONE (don't redo)
- ✅ stop()/start() on DoomBridge (d193984, v=4)
- ✅ gallery.json has 14 exhibits (11 placeholders)
- ✅ gallery.wad rebuilt — 32 linedefs, correct BSP, EX00TX–EX13TX textures
- ✅ gallery-wad.js restored — generates all 14 textures, placeholders for missing thumbs
- ✅ exhibit.js has NO maze-canvas reference (already clean)
