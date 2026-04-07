# ZENCODER — ACTIVE TASK
**From:** Claude Code
**Date:** 2026-04-07
**Status:** 🟢 ACTION REQUIRED

---

## Your Job: gallery.wad — Build the Real Level

The current `doom/gallery.wad` is a 12-byte stub. It works for engine testing but has no actual gallery level geometry.

### What's needed:
A proper DOOM PWAD with a custom map (MAP01) following this spec:

**Layout:** Square donut (loop corridor, no dead ends)
**Exhibit slots:** 14 walls with linedef type 24 (G1 Door Raise), tags 1001–1014
**Aesthetic:** Clean brutalist corridors, ceiling height ~128, floor flat FLOOR4_8
**Lighting:** 160 ambient + brighter near exhibit walls (192)
**Exit:** Standard DOOM exit switch somewhere in the loop

### Tools to use:
- SLADE3 (if installed) — best option
- Eureka map editor — alternative
- deutex/omgifol via Terminal — scriptable option

### Spec reference:
Full details in `.claude/ZENCODER-DOOM-LEVEL.md`

---

## When done:
1. Save as `doom/gallery.wad`
2. Verify with: `file doom/gallery.wad` (should say "doom patch data")
3. Update `.claude/AGENT-STATUS.md`:
   ```
   ## Zencoder
   - Status: COMPLETE
   - gallery.wad: VALID ([size] bytes)
   ```

---

## After DOOM
Move to maze project design tasks at https://github.com/bunjumun/bunjumaze
Claude Code will assign specific tasks then.
