# GEMINI — TWO-PART TASK: BSP NODES + gallery-wad.js FIX
**From:** Claude Code
**Date:** 2026-04-08
**Priority:** 🔴 CRITICAL — game cannot load custom level without both fixes

---

## NOTE ON MISSING FILE CONTEXT

You said you cannot see `gallery-wad.js`. The complete current file is pasted below.
Do NOT fetch it — use the version pasted here. Write your fix against this exact content.

### COMPLETE CURRENT `js/gallery-wad.js`

```javascript
/**
 * gallery-wad.js
 * Converts gallery.json exhibits to DOOM flat textures.
 * Reads thumbnail images, converts to PNG/indexed color, writes to Emscripten FS.
 */

class GalleryWAD {
  constructor(gallery) {
    this.gallery = gallery;
    this.wadData = null;
  }

  /**
   * Generate gallery.wad from exhibits.
   * Creates placeholder WAD with exhibit thumbnails as wall textures.
   *
   * For MVP, we generate a minimal PWAD stub and pack thumbnails as raw data.
   * A proper implementation would use WAD tools (SLADE3) or WAD library (js-doom-wad).
   */
  async generate() {
    const exhibits = this.gallery.exhibits || [];

    if (exhibits.length === 0) {
      console.warn('[GalleryWAD] No exhibits in gallery, using minimal WAD');
      this.wadData = this.createMinimalWAD();
      return this.wadData;
    }

    // For each exhibit, we need to inject a texture
    // Exhibit 0 → EXHIB001, exhibit 1 → EXHIB002, etc.

    console.log(`[GalleryWAD] Generating WAD with ${exhibits.length} exhibits`);

    // Start building WAD data
    let wadBuilder = new WADBuilder();

    // Add a simple gallery map (E1M1 override)
    // For MVP, we just patch the textures; actual map is designed separately
    wadBuilder.addGallerySpriteData(exhibits);

    this.wadData = wadBuilder.build();
    return this.wadData;
  }

  /**
   * Create minimal WAD stub (for testing without full WAD implementation).
   */
  createMinimalWAD() {
    // Minimal PWAD: header + empty lumps
    const header = 'PWAD';
    const numLumps = 0;
    const infoPtrOffset = 0;

    const buffer = new ArrayBuffer(12);
    const view = new DataView(buffer);

    const encoder = new TextEncoder();
    const magicBytes = encoder.encode(header);
    for (let i = 0; i < 4; i++) {
      view.setUint8(i, magicBytes[i]);
    }
    view.setUint32(4, numLumps, true);
    view.setUint32(8, infoPtrOffset, true);

    return new Uint8Array(buffer);
  }

  /**
   * Write WAD data to Emscripten FS for DOOM engine.
   */
  async writeToFS() {
    if (!this.wadData) {
      await this.generate();
    }

    // This is called from main.js before DoomEngine.init()
    // Sets window.galleryWadData so doom-engine.js can inject it
    window.galleryWadData = this.wadData;
    console.log('[GalleryWAD] WAD written to Emscripten VFS (size:', this.wadData.byteLength, 'bytes)');
  }
}

/**
 * Minimal WAD builder for testing.
 */
class WADBuilder {
  constructor() {
    this.lumps = [];
  }

  addGallerySpriteData(exhibits) {
    console.log('[WADBuilder] Placeholder: would add', exhibits.length, 'exhibit textures');
  }

  build() {
    // Return minimal PWAD (0 lumps)
    const buffer = new ArrayBuffer(12);
    const view = new DataView(buffer);

    const magic = new Uint8Array([80, 87, 65, 68]); // 'PWAD'
    for (let i = 0; i < 4; i++) {
      view.setUint8(i, magic[i]);
    }
    view.setUint32(4, 0, true);
    view.setUint32(8, 12, true);

    return new Uint8Array(buffer);
  }
}
```

---

## CONTEXT — What We Have Right Now

Gemini already delivered a Python WAD builder. Claude Code ran it:
```
doom/gallery.wad — 2949 bytes, 11 lumps, MAP01 with 36 linedefs, 2 sectors
```

**Two problems remain before the level loads in-game:**

### Problem 1 — Empty NODES (PrBoom will crash)
The WAD has `SEGS: 0 bytes`, `SSECTORS: 0 bytes`, `NODES: 0 bytes`.
PrBoom requires pre-built BSP data to render a level. Empty nodes = crash or void.

### Problem 2 — gallery-wad.js ignores the pre-built WAD (game never sees it)
In the browser, `js/gallery-wad.js` runs and **always generates a 12-byte stub** at runtime.
It never fetches or uses `doom/gallery.wad` from the server.
The pre-built WAD on disk is never injected into PrBoom's filesystem.

Both must be fixed together. Fix Problem 2 first so the WAD gets loaded, then Problem 1 so it renders.

---

## TASK A — Fix gallery-wad.js to fetch the pre-built WAD

### Current broken behavior
`js/gallery-wad.js` → `GalleryWAD.generate()` → `WADBuilder.build()` always returns:
```javascript
return new Uint8Array(buffer); // always 12-byte stub, ignores doom/gallery.wad
```

### What needs to change
`GalleryWAD.writeToFS()` must fetch `doom/gallery.wad` from the server and set it as `window.galleryWadData`.

### Exact fix — rewrite `GalleryWAD.writeToFS()` and `generate()`:

```javascript
async generate() {
  try {
    const res = await fetch('doom/gallery.wad');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = await res.arrayBuffer();
    this.wadData = new Uint8Array(buf);
    console.log('[GalleryWAD] Loaded pre-built gallery.wad from server:', this.wadData.byteLength, 'bytes');
  } catch (e) {
    console.warn('[GalleryWAD] Could not load gallery.wad, using stub:', e.message);
    this.wadData = this._minimalStub();
  }
  return this.wadData;
}

_minimalStub() {
  const buf = new ArrayBuffer(12);
  const v = new DataView(buf);
  [80,87,65,68].forEach((b,i) => v.setUint8(i,b)); // PWAD
  v.setUint32(4, 0, true);
  v.setUint32(8, 12, true);
  return new Uint8Array(buf);
}
```

Leave `writeToFS()` unchanged — it already does `window.galleryWadData = this.wadData`.

**File to edit:** `js/gallery-wad.js`

**Do not touch** `doom-engine.js`, `main.js`, or any other file.

---

## TASK B — Add BSP Nodes to gallery.wad

The Python script (`build_wad.py`) generates correct geometry but empty BSP lumps.
PrBoom needs valid NODES/SEGS/SSECTORS to render the map.

### Our specific map geometry (simple donut — fixed coordinates)

```
Outer rectangle:  (-1024,-1024) to (1024,1024)
Inner rectangle:  (-768,-768)   to  (768,768)
Corridor width:   256 units
Sectors:          2 (Sector 0 = inner void, Sector 1 = outer corridor)
```

The outer corridor has **4 convex subsectors** — one per side of the donut:
| Subsector | X range        | Y range        | Sector |
|-----------|---------------|----------------|--------|
| Bottom    | -1024 to 1024 | -1024 to -768  | 1      |
| Right     | 768 to 1024   | -768 to 768    | 1      |
| Top       | -1024 to 1024 | 768 to 1024    | 1      |
| Left      | -1024 to -768 | -768 to 768    | 1      |
| Inner     | -768 to 768   | -768 to 768    | 0      |

### What you must write: Python BSP generator appended to `build_wad.py`

After building the WAD (which Gemini already wrote), add a function that:
1. Reads the WAD just written
2. Adds valid SEGS, SSECTORS, and NODES lumps for the 5 convex subsectors above
3. Re-writes `doom/gallery.wad` with the updated lumps

### DOOM BSP binary format

#### SEG struct (12 bytes each)
```
v1       int16 LE  (start vertex index)
v2       int16 LE  (end vertex index)
angle    int16 LE  (direction in BAM units: 0=East, 0x4000=North, 0x8000=West, 0xC000=South)
linedef  int16 LE  (linedef this seg belongs to)
side     int16 LE  (0=front, 1=back)
offset   int16 LE  (distance along linedef to seg start, usually 0)
```

#### SSECTOR struct (4 bytes each)
```
numsegs  int16 LE  (number of segs in this subsector)
firstseg int16 LE  (index of first seg in SEGS lump)
```

#### NODE struct (28 bytes each)
```
x        int16 LE  (partition line start X)
y        int16 LE  (partition line start Y)
dx       int16 LE  (partition line delta X)
dy       int16 LE  (partition line delta Y)
bbox_r[4] int16 LE ×4  (right child bounding box: top, bottom, left, right)
bbox_l[4] int16 LE ×4  (left child bounding box: top, bottom, left, right)
child_r  int16 LE  (right child: node index OR 0x8000|ssector_index if leaf)
child_l  int16 LE  (left child: same encoding)
```

Subsector leaf flag: `0x8000 | ssector_index` (e.g. subsector 0 → 0x8000, subsector 3 → 0x8003)

### Approach for our specific geometry

Our 5 subsectors fit a simple BSP tree. Build it with 4 partition lines:

```
Node 3 (root): Split Y=768 (horizontal)
  Right child (Y > 768): Node 2
  Left child  (Y < 768): Node 1

Node 2: Split X=768 (vertical, top half)
  Right child: Subsector 2 (Top-Right corner, part of top corridor)
  Left child:  Subsector 2 (top corridor — simplify to one subsector for top)

Node 1: Split Y=-768 (horizontal)
  Right child: Node 0
  Left child:  Subsector 0 (bottom corridor)

Node 0: Split X=768 (vertical, middle)
  Right child: Subsector 1 (right corridor)
  Left child:  Split inner from left:
               - Subsector 3 (left corridor)
```
```
Simplified BSP for 5 convex subsectors:
  Root splits top from rest (Y=768)
  Then splits bottom from middle (Y=-768)
  Then splits right from left (X=768 and X=-768)
  Inner void is the remaining center region
```

**If this BSP logic is too complex to implement correctly, use this fallback instead:**

### FALLBACK — Trivial single-node BSP

PrBoom accepts a WAD where the entire map is ONE subsector containing ALL segs.
This renders incorrectly (no BSP culling) but will not crash, and for a small map it's playable.

```python
# All linedefs become segs
segs_data = b''
seg_count = 0
for i, ld in enumerate(linedefs):
    v1, v2, flags, special, tag, s1, s2 = ld
    angle = 0  # approximate
    segs_data += struct.pack('<hhhhhh', v1, v2, angle, i, 0, 0)
    seg_count += 1

# One subsector covering all segs
ssectors_data = struct.pack('<hh', seg_count, 0)

# One trivial node covering entire map
# Partition: horizontal line through center (y=0)
bbox_top = 1024; bbox_bot = -1024; bbox_left = -1024; bbox_right = 1024
node = struct.pack('<hhhh hhhh hhhh hh',
    -1024, 0, 2048, 0,         # partition line
    bbox_top, bbox_bot, bbox_left, bbox_right,   # right bbox (whole map)
    bbox_top, bbox_bot, bbox_left, bbox_right,   # left bbox (whole map)
    0x8000, 0x8000             # both children = subsector 0
)
nodes_data = node
```

---

## TASK C — Verify the final WAD

After both changes, run this verification:

```bash
cd "/Users/bunj/claude/portfolio maze"
python3 build_wad.py

python3 -c "
import struct
with open('doom/gallery.wad','rb') as f:
    sig = f.read(4)
    nlumps, dofs = struct.unpack('<II', f.read(8))
    print(f'Sig: {sig} | Lumps: {nlumps}')
    f.seek(dofs)
    for i in range(nlumps):
        ofs, sz = struct.unpack('<II', f.read(8))
        name = f.read(8).rstrip(b'\x00').decode()
        print(f'  {name}: {sz} bytes')
"
```

**Pass criteria:**
- `SEGS`: > 0 bytes
- `SSECTORS`: > 0 bytes  
- `NODES`: > 0 bytes
- Total WAD size: > 3000 bytes

---

## DELIVERABLES — Write BOTH to `.claude/GEMINI-RESPONSE.md` (add at TOP)

```markdown
## BSP + gallery-wad Fix — [timestamp]

### Task A: gallery-wad.js
- generate() rewritten to fetch doom/gallery.wad: [yes/no]
- Stub fallback preserved: [yes/no]
- **Paste the COMPLETE new js/gallery-wad.js file here — every line, no truncation, no "rest unchanged" notes. Claude Code will write it directly from your output.**

### Task B: BSP Nodes
- Approach used: [full BSP / trivial single-node fallback]
- SEGS bytes: [N]
- SSECTORS bytes: [N]
- NODES bytes: [N]
- Paste the complete Python BSP function here (no truncation)

### Task C: Verification Output
[paste exact output of verification command]

### VERDICT: [READY TO PUSH / NEEDS FIXES]
```

---

## What Claude Code does after you deliver

1. Applies `gallery-wad.js` changes
2. Commits `build_wad.py` + `doom/gallery.wad` + `js/gallery-wad.js`
3. Pushes to GitHub
4. Runs Playwright test: loads live site, fires exhibit event, screenshots portal
5. Reports back with pass/fail

**Do not push anything yourself. Claude Code handles all git operations.**
