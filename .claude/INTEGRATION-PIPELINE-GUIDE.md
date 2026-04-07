# BUNJUMUN-DOOM: Final Integration & Deployment Pipeline
**Status:** All systems ready, awaiting binary assets from Gemini

---

## What's Running in Parallel Right Now

### 🟢 Agent 1: Gemini (Obtaining Binaries)
**Agent ID:** a68ac36b41ebe45cb
**Task:** Hunt for valid doom.js, doom.wasm, doom1.wad, gallery.wad
**Status:** In progress
**Expected output:** Files in `/Users/bunj/claude/portfolio maze/doom/`

### 🟢 Agent 2: Llama (Building Test Suite)
**Agent ID:** a11a8e654075551c2
**Task:** Create automated test harness and validation script
**Status:** In progress
**Expected output:** `/Users/bunj/claude/portfolio maze/test-doom.sh`

### ✅ Claude Code (Pipeline Ready)
**Status:** All JS code written, deployment scripts prepared
**Waiting for:** Gemini to deliver binaries

---

## Deployment Sequence (When Binaries Arrive)

### Phase 1: Validation (Automated)
```bash
bash /Users/bunj/claude/portfolio\ maze/test-doom.sh
# Produces: test-results.txt with ✅ ALL TESTS PASSED
```

**Checks:**
- File existence & sizes
- WASM format validation
- HTML/CSS/JS loading
- Module exports callable
- Game loop functional

### Phase 2: Commit & Push
```bash
bash /Users/bunj/claude/portfolio\ maze/deploy-doom.sh
# Creates commit, pushes to origin/main
```

**Commit includes:**
- All DOOM-only JS systems
- Updated index.html
- deployment scripts
- binary assets (doom/)

### Phase 3: Live Deployment
1. GitHub Pages auto-enables (if already configured)
2. Or manual: Settings → Pages → main branch
3. Wait 30–60 seconds for build
4. Test live at https://bunjumun.github.io/bunjumun95

---

## What Happens If Tests Fail

**If test-doom.sh produces ❌ FAILURES:**

1. Read `test-results.txt` for error details
2. Check which phase failed:
   - **File validation:** Files corrupted, need re-download
   - **Server test:** HTML/CSS/JS issues, check paths
   - **WASM test:** Module load failed, check doom.js syntax
   - **Game loop:** Event wiring issue, check console logs

3. Claude Code will **debug and fix**, then re-run tests

---

## File Structure After Deployment

```
bunjumun95/
├── .github/workflows/     (auto-created by Pages)
├── doom/
│   ├── doom.js            ✅ From Gemini
│   ├── doom.wasm          ✅ From Gemini
│   ├── doom1.wad          ✅ From Gemini
│   └── gallery.wad        ✅ From Gemini
├── js/
│   ├── doom-engine.js     ✅ Claude Code
│   ├── doom-bridge.js     ✅ Claude Code
│   ├── explosion.js       ✅ Claude Code
│   ├── gallery-wad.js     ✅ Claude Code
│   ├── exhibit.js         ✅ Preserved
│   ├── admin.js           ✅ Preserved
│   └── github-api.js      ✅ Preserved
├── css/
│   └── style.css          ✅ Preserved (Win95)
├── index.html             ✅ DOOM-only
├── main.js                ✅ DOOM-only bootstrap
├── gallery.json           ✅ User exhibits
├── test-doom.sh           ✅ Test harness
├── deploy-doom.sh         ✅ Deployment
└── .gitignore             (binary assets ignored)
```

---

## Morning Deliverable Checklist

When you wake up:

- [ ] **Gemini report:** Files obtained, locations confirmed
- [ ] **Test results:** test-dome.sh ✅ ALL PASSED
- [ ] **Live site:** https://bunjumun.github.io/bunjumun95 loads
- [ ] **Game test:** Canvas renders, DOOM engine runs
- [ ] **Shooting test:** Painting shot → exhibit:shot event → explosion → portal opens
- [ ] **Admin test:** ⚙ settings button opens admin console
- [ ] **Commit log:** git log shows DOOM-only implementation commit

---

## Contingency Plans

### If Gemini Can't Find doom1.wad
- Use shareware DOOM data from doomworld.com
- Or create minimal stub for testing (12-byte PWAD)

### If gallery.wad Not Built Yet
- Use minimal PWAD stub for initial testing
- Build proper WAD later with SLADE3

### If WASM Module Load Fails
- Check doom.js syntax (should contain "Emscripten")
- Verify doom.wasm is valid ELF binary
- Check browser console for CORS/MIME type errors

### If GitHub Pages Takes >2 Minutes
- Pages sometimes queue deployments
- Check https://github.com/bunjumun/bunjumun95/actions
- May need to manually trigger Pages rebuild

---

## Success Criteria

**"Debugged result in the morning" means:**

✅ **Code quality:**
- All DOOM systems integrated
- No console errors
- Proper Win95 aesthetic maintained
- Gallery management functional

✅ **Functionality:**
- DOOM engine loads and renders
- Painting walls shootable (linedef type 24 responds)
- Exhibit portal opens on successful shot
- Explosion animation plays
- Admin console accessible
- Settings work

✅ **Deployment:**
- Live on GitHub Pages
- No 404s on assets
- WASM loads and executes
- Mobile-compatible (or noted as desktop-only)

✅ **Documentation:**
- Commit message clear
- Test results saved
- Handoff instructions for maze link-exhibit (future)

---

## Timeline

| Time | Task | Agent | Status |
|------|------|-------|--------|
| Now | Hunt binaries | Gemini | 🟢 Active |
| Now | Build test suite | Llama | 🟢 Active |
| When ready | Run tests | Claude | ⏳ Pending |
| When PASS | Commit & deploy | Claude | ⏳ Pending |
| 30s after push | Pages live | GitHub | ⏳ Pending |

**Expected completion:** 2–4 hours (depending on Gemini's binary hunt)

---

## Contact Points

- **Gemini stuck?** Report which path failed, Claude will suggest alternative
- **Tests failing?** Debug output in test-results.txt
- **deployment blocked?** Pages settings or git push issue — fixable in 5 min

**All systems are designed to be autonomous. Minimal manual intervention needed.**
