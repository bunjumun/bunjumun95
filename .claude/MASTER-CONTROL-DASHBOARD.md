# BUNJUMUN-DOOM: Master Control & Testing Dashboard
**Status:** All agents active, comprehensive testing protocol ready

---

## Active Agents & Their Roles

| Agent | ID | Task | Status | Expected Output |
|-------|-----|------|--------|-----------------|
| **Gemini** | a68ac36b41ebe45cb | Hunt valid binary assets | 🟢 Running | doom.js, doom.wasm, doom1.wad, gallery.wad in `doom/` |
| **Llama Test Suite** | a11a8e654075551c2 | Build automated test harness | 🟢 Running | `test-doom.sh` with full coverage |
| **Llama Watchdog** | ad5c37aaa0105e87b | Monitor & wake Claude on usage restore | 🟢 Active | Handoff notes if Claude hits limit |
| **Claude Code (You)** | — | Lead testing & deployment | ✅ Ready | Execute test cycles, deploy to live |

---

## Testing Phases (In Order)

### ✅ Phase 0: Preparation (COMPLETE)
- [x] DOOM-only JS scaffold (doom-engine.js, doom-bridge.js, explosion.js, gallery-wad.js)
- [x] Bootstrap rewritten (main.js, index.html)
- [x] Comprehensive test spec (COMPREHENSIVE-TEST-SPEC.md)
- [x] Deployment pipeline (deploy-doom.sh)
- [x] Testing protocol (TESTING-PROTOCOL.md)
- [x] Agent protocols (MEMORY.md, watchdog duty)

### 🟡 Phase 1: Binary Acquisition (IN PROGRESS - GEMINI)
**When complete:**
1. All 4 files in `/Users/bunj/claude/portfolio maze/doom/`
2. Gemini reports: "Assets ready for testing"
3. **TRIGGER:** Claude Code runs Phase 2

**Expected:** 2–4 hours (depending on binary hunting difficulty)

### 🔄 Phase 2: Local Testing (CLAUDE CODE)
```bash
bash /Users/bunj/claude/portfolio\ maze/test-doom.sh
```

**Tests:**
- File validation (sizes, types, integrity)
- HTML/CSS/JS loading (no 404s)
- DOOM engine initialization
- WASM module exports
- Game loop functionality
- exhibit:shot event firing
- Explosion animation
- Portal opening/closing
- Score tracking

**Output:** `test-results.txt` with ✅ or ❌

**Decision Gate:**
- ✅ PASS → Proceed to Phase 3
- ❌ FAIL → Debug, fix, re-test (Cycle 1 refinement)

### 🔄 Phase 3: Deployment (CLAUDE CODE)
```bash
bash /Users/bunj/claude/portfolio\ maze/deploy-doom.sh
```

**Actions:**
1. Commit all changes to main
2. Push to GitHub
3. Enable GitHub Pages (if not already)
4. Wait 30–60s for deployment

**Output:** GitHub Actions log + Live site link

### 🔄 Phase 4: Live Site Testing (CLAUDE CODE + GEMINI)
**Claude Code (Automated):**
```bash
# Headless browser testing
# - Load https://bunjumun.github.io/bunjumun95
# - Verify WASM loads
# - Check performance
# - Test game loop
```

**Gemini (User Experience):**
- Open live link in browser
- Test full gameplay
- Check performance (FPS, responsiveness)
- Try edge cases (rapid fire, admin open, etc.)
- Document in TESTING-CYCLE-2.md

**Comparison:**
- Both report findings
- Identify any live-only issues
- Log in master TESTING-NOTES.md

### 🔄 Phase 5: Refinement Cycles (UP TO 3 ITERATIONS)
**If issues found:**
1. **Identify:** What's broken?
2. **Root cause:** Why?
3. **Fix locally:** Same test-doom.sh validation
4. **Re-deploy:** New commit pushed
5. **Re-test:** Full cycle again

**Stop when:**
- ✅ No new issues in 2 consecutive cycles
- ✅ Both Claude & Gemini sign off
- ✅ Performance acceptable (60 FPS, <2s load)

---

## Key Files for Testing

### Test Execution
- `test-doom.sh` — Automated validation (file checks, basic game loop)
- `test-results.txt` — Output from test-doom.sh

### Test Documentation
- `TESTING-NOTES.md` — Live log across all cycles
- `TESTING-CYCLE-1.md` — Local findings (Gemini user test)
- `TESTING-CYCLE-2.md` — Live site findings (both agents)
- `TESTING-CYCLE-3.md` — Edge cases & refinement
- `COMPREHENSIVE-TEST-SPEC.md` — Full test checklist

### Deployment
- `deploy-doom.sh` — Automated commit & GitHub Pages deploy

### Coordination
- `MEMORY.md` — Agent continuity protocol
- `INTEGRATION-PIPELINE-GUIDE.md` — Master workflow

---

## Critical Test Checkpoints

**At each phase, verify:**

| Checkpoint | Claude Test | Gemini Test | Both Pass? |
|------------|-------------|------------|-----------|
| Files valid | Sizes, format, integrity | File loads in browser | ✅ |
| HTML loads | No 404s, CSS/JS load | Page renders | ✅ |
| DOOM initializes | Module loads, canvas created | Canvas visible, responsive | ✅ |
| WASM bridge works | get_exhibit_tag() callable | Can read WASM data | ✅ |
| Game loop | exhibit:shot event fires | Shooting detects hit | ✅ |
| Explosion | Particle math correct | Animation smooth, visible | ✅ |
| Portal | Event wiring works | Portal UI appears/closes | ✅ |
| Admin | Settings button works | Can add exhibit | ✅ |
| Performance | Frame rate logged | Feels smooth (60 FPS) | ✅ |
| Live site | HTTPS loads, no assets 404 | Links work, playable | ✅ |

---

## Decision Tree for Refinement

```
Test Results → Cycle Outcome
├─ All Pass → Ready for Next Phase
├─ Minor Issues (UX/Polish) → Document, Continue (not blocking)
└─ Blockers (Crash/Fail) → Fix → Re-test Cycle
    ├─ Issue Fixed → Move Forward
    └─ Issue Persists → Debug, Log, Ask for Help
```

---

## Communication Checkpoints

**Gemini will report:**
1. "Assets ready in doom/" → Claude runs Phase 2
2. "Local tests pass" → Claude deploys (Phase 3)
3. "Live site feels good, found X issues" → Compare, log refinement

**Claude Code will report:**
1. "test-doom.sh completed: [# passed] / [# total]"
2. "Deployed to https://bunjumun.github.io/bunjumun95"
3. "Cycle 2 findings: [list]"

**Llama will report (if Claude times out):**
- "Claude out of usage. Gemini found: [list]"
- "Ready to resume Phase X when Claude returns"

---

## Success Criteria (Final Sign-Off)

**"Debugged and ready for production"** means:

✅ **Phase 1–4 Complete:** Testing complete across local + live
✅ **All Critical Tests Pass:** No blockers, no crashes
✅ **Minor Issues Fixed:** If any refinement cycles needed
✅ **Performance Acceptable:** 60 FPS, <2s load time
✅ **UX Smooth:** Controls responsive, animations play well
✅ **Both Agents Agree:** Claude & Gemini both say "Ship it"
✅ **Documentation Complete:** Test results logged, findings saved
✅ **Commit Message Clear:** Why DOOM mode, what it does

---

## Timeline

| Phase | Lead | Time | Trigger |
|-------|------|------|---------|
| 1 | Gemini | 2–4h | Now (assets hunt) |
| 2 | Claude | 30m | Gemini: "Files ready" |
| 3 | Claude | 15m + 60s wait | test-doom.sh ✅ PASS |
| 4 | Both | 2–3h | Pages deployed |
| 5 (if needed) | Both | 2–3h per cycle | Issues found |

**Expected total:** 5–12 hours for "fully debugged" status

---

## Contingencies

| Blocker | Solution |
|---------|----------|
| Gemini can't find binaries | Claude Code provides alternative sources |
| Tests fail critically | Debug together, fix code, re-test |
| GitHub Pages takes >2 min | Check Actions tab, may need manual trigger |
| Live test shows issue Gemini didn't find | Reproduce locally, fix, re-deploy |
| Usage runs out mid-phase | Llama bridges context, resume when ready |

---

**All systems go. Comprehensive testing ahead. No shortcuts.**
