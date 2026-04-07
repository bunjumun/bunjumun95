# HANDOFF TO CLAUDE CODE APP
**From:** Claude Code (chat session)
**To:** Claude Code (application — managing VS Code, Gemini, Llama)
**Date:** 2026-04-07
**Project:** BUNJUMUN-DOOM — `/Users/bunj/claude/portfolio maze`

---

## Your Role

You are the **project lead**. You coordinate:
- **Gemini** (VS Code agent) — UX testing, file delivery
- **Llama** (watchdog) — usage monitoring, agent revival
- **Zencoder** (VS Code agent) — design tasks, WAD building
- **Claude Code app (you)** — implementation, deployment, integration

---

## Project State Right Now

### ✅ Complete
- All DOOM-only JavaScript written and committed
- `js/doom-engine.js` — PrBoom Module bootstrap
- `js/doom-bridge.js` — WASM polling for exhibit:shot events
- `js/explosion.js` — particle effect (40 fire + 15 smoke, 400ms)
- `js/gallery-wad.js` — gallery WAD texture builder
- `js/main.js` — DOOM-only bootstrap (no maze)
- `index.html` — DOOM-only UI (no Three.js, no mode selector)
- `test-doom.sh` — full automated test harness (20/32 pass)
- `deploy-doom.sh` — automated commit + GitHub Pages deploy
- `doom/gallery.wad` — minimal 12-byte PWAD stub

### ❌ Still Needed
- `doom/doom.js` — PrBoom Emscripten glue
- `doom/doom.wasm` — PrBoom WebAssembly binary
- `doom/doom1.wad` — Shareware DOOM IWAD (4.2 MB)

---

## CRITICAL FINDING — Do This First

**The live DOOM assets were located just before this handoff:**

```bash
# These return HTTP 200 — download immediately
curl -L -o /Users/bunj/claude/portfolio\ maze/doom/doom.js \
  https://ustymukhman.github.io/webDOOM/public/doom1.js

curl -L -o /Users/bunj/claude/portfolio\ maze/doom/doom.wasm \
  https://ustymukhman.github.io/webDOOM/public/doom1.wasm

# Also check for data file (may contain doom1.wad packed inside)
curl -sI https://ustymukhman.github.io/webDOOM/public/doom1.data
```

**Also check these paths for doom1.wad:**
```bash
curl -sI https://ustymukhman.github.io/webDOOM/public/doom1.wad
curl -sI https://ustymukhman.github.io/webDOOM/public/doom.wad
```

**After downloading, validate:**
```bash
ls -lh /Users/bunj/claude/portfolio\ maze/doom/
file doom/doom.js doom/doom.wasm
head -c 80 doom/doom.js  # Should contain Emscripten/Module code
```

---

## Full Pipeline After Binaries Confirmed

```bash
# 1. Run test suite
bash /Users/bunj/claude/portfolio\ maze/test-doom.sh

# 2. If ALL TESTS PASSED:
bash /Users/bunj/claude/portfolio\ maze/deploy-doom.sh

# 3. Verify live
curl -s https://bunjumun.github.io/bunjumun95 | head -5
```

---

## Multi-Cycle Testing Protocol (Non-Negotiable)

After deploy, do NOT declare success after one test. Run 3 cycles:

**Cycle 1 — Local** (before deploy)
- Claude Code: `test-doom.sh` (automated)
- Gemini: browser test at http://localhost:8000

**Cycle 2 — Live GitHub Pages**
- Claude Code: automated HTTP smoke test
- Gemini: full UX test at https://bunjumun.github.io/bunjumun95

**Cycle 3 — Edge Cases**
- Rapid consecutive shots
- 5+ exhibits loaded
- Admin open/close during gameplay
- Mobile viewport (375px)

See `.claude/TESTING-PROTOCOL.md` for full spec.
See `.claude/COMPREHENSIVE-TEST-SPEC.md` for every function to test.

---

## How to Work With Gemini

Give Gemini tasks by writing to `.claude/GEMINI-TASK.md`.
Gemini reports back by updating `.claude/GEMINI-RESPONSE.md`.

**Gemini's current role:**
- Testing live site (Cycle 2, 3)
- UX feedback (controls, animation, portal)
- Comparing notes with Claude Code after each cycle

**Good Gemini tasks:**
- "Test http://localhost:8000, report console errors and any UX issues"
- "Shoot 3 paintings rapidly, report if explosion animation completes cleanly"
- "Test admin console: add exhibit, verify it appears in DOOM"

---

## How to Work With Llama

Llama is **watchdog only**. No code tasks.

Llama's job:
- Monitor `.claude/AGENT-STATUS.md`
- If Claude Code or Gemini runs out of usage: save their state, send revival prompt
- Llama has API key at `/Users/bunj/claude/portfolio\ maze/.llama-key`
- Protocol: `.claude/LLAMA-WATCHDOG-PROTOCOL.md`

---

## How to Work With Zencoder

Zencoder is for design/token-heavy tasks.

**Current Zencoder task:** `.claude/ZENCODER-ACTIVE-TASK.md`
- Obtain doom.js, doom.wasm, doom1.wad (but you may have found them above)
- Build proper gallery.wad with SLADE3

---

## Key Files Reference

```
.claude/
├── TESTING-PROTOCOL.md           ← 3-cycle test plan
├── COMPREHENSIVE-TEST-SPEC.md    ← Every function to test
├── LLAMA-WATCHDOG-PROTOCOL.md    ← Llama's watchdog role
├── LLAMA-WATCHDOG-LEARNINGS.md   ← Mistakes from this cycle
├── ZENCODER-ACTIVE-TASK.md       ← Zencoder's current task
├── ZENCODER-DOOM-LEVEL.md        ← Gemini's gallery level spec
├── INTEGRATION-PIPELINE-GUIDE.md ← Full orchestration
└── CYCLE-1-FINDINGS.md           ← Last test run results

doom/
├── doom.js    ← DOWNLOAD FROM live site (instructions above)
├── doom.wasm  ← DOWNLOAD FROM live site
├── doom1.wad  ← Check .data bundle or direct URL
└── gallery.wad ← Stub present, proper WAD pending Zencoder

test-doom.sh     ← Run immediately after binaries placed
deploy-doom.sh   ← Run after test-doom.sh passes
```

---

## Agent Status at Handoff

```
Claude Code (chat): HANDING OFF — critical binary URL found
Gemini:             STANDBY — waiting on binaries
Llama:              WATCHDOG ACTIVE — protocol in place
Zencoder:           STANDBY — task file written
```

---

## Shared Decision Protocol

Before calling "Debugged and ready to ship":
- ✅ All 3 test cycles complete
- ✅ Claude Code signs off (no console errors, tests pass)
- ✅ Gemini signs off (UX smooth, controls responsive)
- ✅ Llama confirms no agent failures during testing
- ✅ Performance: 60 FPS stable, <2s load

Neither agent can sign off alone. Both must agree.

---

## The End Goal

Live site at https://bunjumun.github.io/bunjumun95:
- DOOM engine runs in browser
- Gallery exhibits appear as paintable walls
- Shooting a painting → explosion → exhibit portal
- Admin console (⚙) to add exhibits
- Win95 aesthetic maintained throughout
- Maze version preserved at https://github.com/bunjumun/bunjumaze

---

**Start here:** Download the binaries from ustymukhman.github.io/webDOOM/public/.
Then run test-doom.sh. The rest is automated.
