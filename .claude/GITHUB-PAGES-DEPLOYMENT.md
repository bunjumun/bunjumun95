# GITHUB PAGES DEPLOYMENT GUIDE
**For:** BUNJUMUN-DOOM project
**Status:** Ready to execute once binaries are in place

---

## Prerequisites Checklist

Before deployment, verify:
- [ ] doom/doom.js (~300 KB) — valid Emscripten code
- [ ] doom/doom.wasm (~1.2 MB) — valid PrBoom binary
- [ ] doom/doom1.wad (4.2 MB) — unmodified shareware IWAD
- [ ] doom/gallery.wad — custom WAD with 14 exhibit slots
- [ ] js/doom-*.js files committed
- [ ] index.html updated (DOOM-only)
- [ ] js/main.js rewritten (DOOM-only bootstrap)
- [ ] Local test passes (http://localhost:8000)

---

## Step 1: Verify Repository Settings

```bash
cd /Users/bunj/claude/portfolio\ maze
git remote -v
# Should show: origin → https://github.com/bunjumun/bunjumun95.git
```

If not set:
```bash
git remote set-url origin https://github.com/bunjumun/bunjumun95.git
```

---

## Step 2: Create .github/workflows/ for Pages (Optional)

Github Pages auto-detects static files. But for CI/CD deployment:

```bash
mkdir -p .github/workflows
```

Create `.github/workflows/deploy-pages.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

**Note:** For static site, this is optional. GitHub Pages serves from `/` by default.

---

## Step 3: Commit All Changes

```bash
cd /Users/bunj/claude/portfolio\ maze

# Stage all new/modified files
git add \
  .claude/PLAN-DOOM-ONLY.md \
  .claude/GEMINI-DOOM-BUILD.md \
  .claude/ZENCODER-DOOM-LEVEL.md \
  js/doom-engine.js \
  js/doom-bridge.js \
  js/gallery-wad.js \
  js/explosion.js \
  js/main.js \
  index.html \
  doom/gallery.wad \
  .gitignore

# Status check
git status

# Commit
git commit -m "feat: implement DOOM-only mode with PrBoom gallery shooter

- Remove Three.js maze engine (preserved on bunjumaze repo)
- Implement PrBoom WebAssembly engine with exhibit-trigger bridge
- Add particle explosion effect (40 fire + 15 smoke particles)
- Create custom gallery.wad level (square donut, 14 exhibit slots)
- Wire linedef type 24 shoot-triggers to portal opening
- Preserve gallery.json and admin console functionality
- Update DOOM HUD with Win95 styling and exhibit counter"
```

---

## Step 4: Push to GitHub

```bash
git push -u origin main
```

Check push succeeded:
```bash
git log --oneline -5
# Should show your commit at top
```

---

## Step 5: Enable GitHub Pages

### Via GitHub Web UI:

1. Go to: https://github.com/bunjumun/bunjumun95
2. Click **Settings** → **Pages**
3. Under "Source":
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**
5. Wait 1-2 minutes for build to complete
6. Site URL: https://bunjumun.github.io/bunjumun95

### Verify Deployment:

```bash
# Check that GitHub Actions ran
curl -I https://bunjumun.github.io/bunjumun95/
# Should return 200 OK

# Check specific file
curl -I https://bunjumun.github.io/bunjumun95/index.html
# Should return 200 OK
```

---

## Step 6: Post-Deployment Verification

Open https://bunjumun.github.io/bunjumun95 in browser:

**Checklist:**
- [ ] Page loads (no 404s)
- [ ] Loading bar appears
- [ ] DOOM HUD visible
- [ ] Canvas renders (black screen is OK during init)
- [ ] No console errors (F12 → Console)
- [ ] Check Network tab:
  - [ ] index.html (200 OK)
  - [ ] doom.js (200 OK, ~300 KB)
  - [ ] doom.wasm (200 OK, ~1.2 MB)
  - [ ] doom1.wad (200 OK, 4.2 MB)
  - [ ] gallery.wad (200 OK, custom size)
- [ ] DevTools console: `Module._get_exhibit_tag` is callable
- [ ] Try shooting a painting
- [ ] Verify `exhibit:shot` event fires (console log)
- [ ] Explosion animation plays
- [ ] Exhibit portal opens

---

## Step 7: Troubleshooting Common Issues

### Issue: 404 on doom.wasm
**Cause:** GitHub Pages not serving .wasm MIME type correctly

**Fix:** Add `.htaccess` or use GitHub's built-in headers:
```bash
# No action needed — GitHub Pages handles .wasm MIME type automatically
```

### Issue: CORS error on doom.wasm
**Cause:** Same-origin requirements

**Solution:** Already self-hosted on GitHub Pages (same origin), should work.

If persists:
```bash
# Check that doom.wasm is being fetched correctly
# In DevTools: Network → doom.wasm → Response should show binary data
```

### Issue: Canvas blank, no errors
**Cause:** DOOM engine loading slowly

**Check:**
- Wait 5+ seconds (Emscripten initialization can be slow)
- Compare payload sizes (doom.wasm ~1.2 MB)
- Check bandwidth (large file over slow connection)

---

## Step 8: Add Maze as Exhibit (Future)

Once https://bunjumun.github.io/bunjumaze is live:

1. Go to Admin Console (⚙ button)
2. Add new exhibit with:
   - **Type:** Link
   - **Title:** "MAZE-95 Gallery"
   - **URL:** https://bunjumun.github.io/bunjumaze
3. Save to gallery.json
4. In DOOM, shoot the new painting
5. Portal opens → Link to maze mode

---

## Success Criteria

DOOM-only mode is **live when:**
- ✅ https://bunjumun.github.io/bunjumun95 loads
- ✅ DOOM canvas renders
- ✅ Shooting paintings triggers exhibits
- ✅ Explosion effect plays smoothly
- ✅ Exhibit portal opens correctly
- ✅ Admin console works (add/edit exhibits)
- ✅ No console errors or 404s

---

## Rollback Plan (if needed)

If deployment has critical issues:

```bash
git revert HEAD
git push origin main
# GitHub Pages will redeploy previous commit
```

Or restore from `maze-mode` branch:
```bash
git show maze-mode:index.html > index.html
git add index.html
git commit -m "revert to maze mode"
git push origin main
```

---

## Timeline

**Execution order:**
1. ⏳ Wait for valid doom/ binaries from Gemini
2. ✅ Local test (http://localhost:8000)
3. ✅ Commit (git commit + git push)
4. ✅ Enable GitHub Pages (settings)
5. ✅ Verify live deployment
6. ✅ Test game loop (shoot, explode, portal)
7. ✅ Add maze as exhibit link

**Estimated:** 30 min setup + 5 min verification = 35 min after binaries arrive

---

**Ready to execute. Waiting for valid doom/ files from Gemini.**
