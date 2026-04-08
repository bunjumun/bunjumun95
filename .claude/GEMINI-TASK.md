# GEMINI TASK — Gallery Display Verification
**Repo:** https://github.com/bunjumun/bunjumun95
**Live site:** https://bunjumun.github.io/bunjumun95
**Commit:** d193984
**Date:** 2026-04-08

---

## WHAT WAS JUST SHIPPED

Three things changed in commit d193984:

### 1. gallery-wad.js (v=3) — RESTORED + IMPROVED
Your previous edit had corrupted `writeToFS()` with code from `_mergeWad()`. Claude restored it.

New behavior:
- Generates textures for **all 14 zones** (not just exhibits with thumbnails)
- Exhibits without thumbnails get a solid-color **placeholder patch** (distinct color per zone)
- Zone index mapping is correct — EX00TX → exhibit 0, EX01TX → exhibit 1, etc.

### 2. build_wad.py — COMPLETE REWRITE
Old WAD: minimal 4-vertex room, no exhibit walls, BROWN1 textures.
New WAD: single-sector ±768 room with **32 linedefs**, **14 exhibit walls**.

- Exhibit walls use EX00TX – EX13TX (matches gallery-wad.js output)
- Correct BAM angles (signed int16: 0=east, 16384=north, -32768=west, -16384=south)
- Trivial 1-subsector BSP (valid for convex room)
- Room size ±768 matches doom-bridge.js EXHIBIT_ZONES exactly

### 3. gallery.wad — REBUILT (3201 bytes, commit d193984)

---

## YOUR JOB: Visual Verification

Open https://bunjumun.github.io/bunjumun95 (Cmd+Shift+R to force reload).

### Check 1 — Console (F12)
Expected:
  [GalleryWAD] Loaded gallery.wad: 3201 bytes
  [GalleryWAD] Merged WAD with textures staged: XXXX bytes
  [DoomEngine] PrBoom runtime initialized

FAIL if: "Texture injection failed" / WAD is 2375 bytes (old cache) / any TypeError

### Check 2 — Walls Visible
Walk in DOOM. All 4 walls should have textures:
- South: 2 exhibit frames
- East/North/West: 4 exhibit frames each
- Real thumbnails show gallery image; placeholders show solid color

FAIL if: walls black/missing / room is empty / DOOM crashes

### Check 3 — Portal Opens
Walk to any wall, press E. Explosion → Win95 window opens with content. No TypeError.

---

## REPORT FORMAT

Reply with:
  STATUS: OK | FAIL
  gallery.wad bytes: [number]
  texture merge: OK | FAIL
  walls visible: YES | NO
  portal opens: YES | NO
  console errors: [list or NONE]
  notes: [anything surprising]

If FAIL: paste exact console error + describe what you see.
