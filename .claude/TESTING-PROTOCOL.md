# BUNJUMUN-DOOM: Multi-Cycle Testing & Refinement Protocol
**Goal:** Achieve production-grade quality through 2–3 validation cycles

---

## Testing Cycle Workflow

### Cycle 1: Binary Asset Validation + Local Test
**Trigger:** When Gemini reports files ready in doom/ directory

#### Phase 1a: Claude Code (Automated)
```bash
bash /Users/bunj/claude/portfolio\ maze/test-doom.sh
# Produces: test-results.txt with file validation + basic game loop
```

#### Phase 1b: Gemini (Live Site Review)
```bash
# After files staged:
1. Load http://localhost:8000 in browser
2. Check console for errors/warnings
3. Test canvas rendering
4. Test WASM module loads
5. Try shooting a painting
6. Test admin console
7. Document findings in TESTING-CYCLE-1.md
```

#### Phase 1c: Compare & Log
- Claude Code reads Gemini's findings
- Log discrepancies in `.claude/TESTING-NOTES.md`
- Decide: PASS (move to deployment) or FAIL (debug together)

---

### Cycle 2: GitHub Pages Live Testing
**Trigger:** After `deploy-doom.sh` pushes to main and Pages deploys

#### Phase 2a: Claude Code (Automated Smoke Test)
```bash
# Test live site via curl/headless browser
1. Verify HTTPS loads
2. Check no 404s
3. Verify WASM fetches correctly
4. Ping game loop endpoints
# Produces: live-test-results.txt
```

#### Phase 2b: Gemini (User Experience Test)
```
Open https://bunjumun.github.io/bunjumun95 in real browser:
1. **Performance:** FPS stable? Canvas smooth?
2. **Rendering:** Colors correct? Text readable?
3. **Controls:** Mouse look responsive? Clicks register?
4. **Shooting:** Paint a picture, shoot it
   - Explosion plays fully?
   - Exhibit portal appears?
   - Portal closes cleanly?
5. **Admin:** Click ⚙, add test exhibit
   - Gallery updates?
   - New exhibit shootable?
6. **Edge cases:**
   - Network latency (throttle to 4G in DevTools)
   - Different screen sizes
   - Multiple rapid shots
7. Log ALL findings in TESTING-CYCLE-2.md
```

#### Phase 2c: Gemini & Claude Code Comparison
- Gemini shares: "What broke? What felt wrong?"
- Claude Code analyzes: performance logs, error patterns
- Create `.claude/CYCLE-2-FINDINGS.md` with:
  - ✅ What works well
  - ⚠️ Minor issues (polish)
  - ❌ Blockers (fix before 2.0)

---

### Cycle 3: Refinement & Edge Case Testing
**Trigger:** After Cycle 2 findings documented

#### Phase 3a: Claude Code (Debug & Fix)
Based on Cycle 2 findings:
- Fix any console errors
- Optimize performance if needed
- Patch WASM bridge issues
- Re-test locally with test-doom.sh

#### Phase 3b: Gemini (Stress Test)
```
Hard mode gameplay test:
1. Add 5+ exhibits to gallery.json
2. Shoot all paintings in rapid succession
3. Open/close admin multiple times
4. Try edge cases:
   - Very long exhibit titles
   - Large image thumbnails
   - Special characters in names
5. Mobile responsiveness check
6. Share findings in TESTING-CYCLE-3.md
```

#### Phase 3c: Final Sign-Off
- Both agree: "This is debugged and ready for public use"
- Document in `.claude/FINAL-TESTING-REPORT.md`
- Tag commit as v1.0-doom release

---

## Test Coordination Files

### During Each Cycle, Claude Code Creates:

**`.claude/TESTING-NOTES.md`** (Live log)
```markdown
# Testing Notes — Multi-Cycle Refinement

## Cycle 1: Local Binary Validation
**Status:** 🟢 IN PROGRESS

### Automated Tests (Claude)
- [ ] File size validation
- [ ] WASM module loads
- [ ] Game loop runs
- [ ] exhibit:shot event fires
- [ ] Explosion animation plays
- [ ] Portal opens

### User Experience (Gemini)
- [ ] Canvas renders without lag
- [ ] Admin console accessible
- [ ] Shooting feels responsive
- [ ] No console errors

### Discrepancies Found
[Gemini and Claude compare findings here]

---

## Cycle 2: Live Site (GitHub Pages)
[To be filled after deploy]

---

## Cycle 3: Refinement & Polish
[To be filled after fixes]
```

---

## Communication Protocol

### When Gemini Finds Issues
Gemini creates update to **TESTING-NOTES.md**:
```
### [Cycle N] Issues Found by Gemini
- **Bug:** [Description]
  - Expected: [behavior]
  - Actual: [behavior]
  - Severity: Critical / High / Medium / Low
  - Reproducible: [how to trigger]

- **Performance:** [metric]
  - FPS: X (target: 60+)
  - Load time: X ms
  - Memory: X MB
```

### When Claude Code Finds Issues
Claude Code adds to **TESTING-NOTES.md**:
```
### [Cycle N] Issues Found by Claude Code
- **Error:** [console error message]
  - File: [js/doom-engine.js:42]
  - Fix strategy: [what we'll change]
  - Status: [FIXED / IN PROGRESS / BLOCKED]
```

### Handoff Between Cycles
1. Gemini finishes testing → updates TESTING-NOTES.md
2. Claude Code reads findings → fixes issues locally
3. Test again locally until PASS
4. Deploy → Gemini tests live
5. Compare findings → cycle repeats

---

## Success Criteria for "Debugged"

All 3 cycles complete with:

### Technical (Claude Code)
- ✅ No console errors
- ✅ Frame rate stable (60 FPS)
- ✅ Memory stable (no leaks)
- ✅ WASM polling works reliably
- ✅ All event handlers fire correctly

### User Experience (Gemini)
- ✅ Smooth canvas rendering
- ✅ Responsive controls
- ✅ Explosion animation plays correctly
- ✅ Portal opens/closes cleanly
- ✅ Admin console functional
- ✅ Works on multiple browsers/device sizes

### Edge Cases (Both)
- ✅ Handles 20+ exhibits
- ✅ Rapid shooting doesn't break
- ✅ Admin updates reflected immediately
- ✅ Network latency doesn't cause crashes
- ✅ Long exhibit names/descriptions work

---

## Escalation Path

### If Blocker Found
1. **Gemini:** Report with exact reproduction steps
2. **Claude Code:** Reproduce locally, identify root cause
3. **Debug Together:** Share logs, console output, version info
4. **Fix:** Deploy to local test, verify
5. **Gemini Validates:** Test live again
6. **Continue:** Move to next cycle

### If Disagreement on Severity
- Gemini: "That's a major bug, blocks UX"
- Claude Code: "That's a minor edge case, low priority"
- **Decision:** You decide which takes priority
- **Proceed:** Or escalate to next testing phase

---

## Timeline Expectation

- **Cycle 1 (Local):** 1–2 hours (fast feedback loop)
- **Cycle 2 (Live Pages):** 2–3 hours (includes deploy wait)
- **Cycle 3 (Refinement):** 2–3 hours (fixes + validation)

**Total:** 5–8 hours for "fully debugged" status

---

## Files Generated by Testing

```
.claude/
├── TESTING-NOTES.md          ← Live log across all cycles
├── TESTING-CYCLE-1.md        ← Local validation findings
├── TESTING-CYCLE-2.md        ← Live site findings
├── TESTING-CYCLE-3.md        ← Edge case findings
├── FINAL-TESTING-REPORT.md   ← Sign-off document
└── test-results.txt          ← Automated test output

.github/
└── PRODUCTION-READY.md       ← Public-facing status
```

---

## When to Call It "Done"

**NOT just:** "Tests pass, deploy to GitHub Pages"

**INSTEAD:**
1. ✅ All 3 cycles complete
2. ✅ All critical bugs fixed
3. ✅ Both Claude & Gemini sign off
4. ✅ Performance acceptable (60 FPS, <2s load)
5. ✅ UX feels polished (smooth, responsive, no jank)
6. ✅ Ready for user testing / public launch

---

**This is the protocol. Each cycle can surface new issues. Don't rush. Refine until we're both confident.**
