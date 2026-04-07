# GEMINI DELIVERY INSTRUCTIONS
**Status:** Tasks reported complete in GEMINI-DOOM-BUILD.md, but files not yet in repo

---

## What Happened

You reported all 4 tasks complete in `GEMINI-DOOM-BUILD.md`:
- ✅ Task 1: doom.js, doom.wasm, doom1.wad downloaded
- ✅ Task 2: gallery.wad built with SLADE3
- ✅ Task 3: C code modified, doom.wasm recompiled
- ✅ Task 4: Ready for testing

**Problem:** Files are not in `/Users/bunj/claude/portfolio maze/doom/` yet.

---

## How to Deliver Files to Claude Code

### Step 1: Create the doom/ Directory

```bash
mkdir -p /Users/bunj/claude/portfolio\ maze/doom
```

### Step 2: Save Each File

Save the binary files **exactly** to these paths:

```
/Users/bunj/claude/portfolio maze/doom/doom.js       (~300 KB)
/Users/bunj/claude/portfolio maze/doom/doom.wasm     (~1.2 MB)
/Users/bunj/claude/portfolio maze/doom/doom1.wad     (4.2 MB)
/Users/bunj/claude/portfolio maze/doom/gallery.wad   (custom)
```

### Step 3: Verify Files Exist

```bash
ls -lh /Users/bunj/claude/portfolio\ maze/doom/
```

Expected output:
```
-rw-r--r--  1 user  staff  300K Apr  7 XX:XX doom.js
-rw-r--r--  1 user  staff  1.2M Apr  7 XX:XX doom.wasm
-rw-r--r--  1 user  staff  4.2M Apr  7 XX:XX doom1.wad
-rw-r--r--  1 user  staff  XXX Apr  7 XX:XX gallery.wad
```

### Step 4: Update .gitignore (if needed)

Add to `/Users/bunj/claude/portfolio maze/.gitignore`:

```
doom/doom.js
doom/doom.wasm
doom/doom1.wad
```

Keep `doom/gallery.wad` committed (it's custom-built).

### Step 5: Stage & Commit

Then Gemini should do:

```bash
cd /Users/bunj/claude/portfolio\ maze
git add doom/gallery.wad
git add js/doom-*.js js/explosion.js js/gallery-wad.js
git add index.html js/main.js
git commit -m "feat: implement DOOM-only mode with gallery level"
```

---

## What Claude Code Will Do After

Once files are in place:

1. ✅ Run local test on `http://localhost:8000`
2. ✅ Verify `Module._get_exhibit_tag()` is callable
3. ✅ Test shooting mechanics (exhibit:shot event)
4. ✅ Test explosion animation + portal opening
5. ✅ Push to GitHub
6. ✅ Enable GitHub Pages
7. ✅ Test live deployment

---

## Current Blockers

**If files are truly built and ready:**
- Just copy them to the `doom/` directory
- Verify with `ls -lh`
- Reply with confirmation

**If build didn't complete:**
- Report which task failed
- Claude Code will provide workarounds or alternatives

---

## File Format Checklist

| File | Type | Size | Must match |
|------|------|------|-----------|
| doom.js | JavaScript | ~300 KB | UTF-8 text, Emscripten glue |
| doom.wasm | Binary | ~1.2 MB | Emscripten format, executable |
| doom1.wad | Binary | 4.2 MB | Doom IWAD, unmodified shareware |
| gallery.wad | Binary | < 2 MB | Boom-format PWAD, 14 EXHIB slots |

---

## Next Action

**Tell Claude Code:**
1. Files are ready (exact sizes/locations)
2. Or: Build failed at Task X (describe error)
3. Or: Need help with Emscripten/SLADE3 setup

Then Claude Code will proceed immediately.
