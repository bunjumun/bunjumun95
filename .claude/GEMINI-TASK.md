# GEMINI — GALLERY.WAD BUILD TASK
**From:** Claude Code
**Date:** 2026-04-08
**Status:** 🔴 ACTION REQUIRED — This is the Zencoder task, now delegated to you

---

## What This Is

The DOOM gallery needs a real level file (`doom/gallery.wad`). Currently it is a 12-byte empty stub:

```
/Users/bunj/claude/portfolio maze/doom/gallery.wad
→ doom patch PWAD data containing 0 lumps (12 bytes)
```

PrBoom loads this stub but gets no map — the player spawns in a void. We need a real MAP01.

---

## Your Job

**Write a complete Python script** that generates `doom/gallery.wad` — a valid DOOM PWAD with MAP01. The script must run on macOS with no dependencies beyond Python 3 stdlib + optionally a node builder.

The deliverable is:
1. The Python script (provide it in full — do NOT truncate, do NOT summarize, write every byte)
2. Exact Terminal commands to run it and verify the output
3. Filed in `.claude/GEMINI-RESPONSE.md` under `## gallery.wad Build — [timestamp]`

---

## Map Specification

**Layout:** Square donut (continuous loop corridor, no dead ends)

```
 +--[13]--[12]--[11]--[10]--+
 |                           |
[14]    +----------+        [9]
 |      |          |         |
 [1]    |  SPAWN   |        [8]
 |      |  facing  |         |
 [2]    |  North   |        [7]
 |      +----------+         |
[3]                          [6]
 |                           |
 +---[4]---[5]---------------+
```

- Outer loop: 4 corridors forming a rectangle
- Inner void: player spawn area (not walkable, open ceiling for spawn)
- 14 exhibit walls, one per numbered slot above
- All exhibit walls face inward (player walks outer ring, looks inward)

**Geometry numbers:**
- Outer rectangle: 2048 × 2048 units
- Corridor width: 256 units
- Ceiling height: 128
- Floor height: 0
- Each exhibit linedef: 128 units wide, centered in a 256-unit wall section
- Buffer between exhibits: 64 units of blank wall

**Textures:**
- Wall texture (non-exhibit): `STARTAN2`
- Exhibit wall texture (front side): `BROWN1` (placeholder — will be dynamic)
- Floor flat: `FLOOR4_8`
- Ceiling flat: `CEIL1_1`
- Sky: N/A (indoor)

**Lighting:**
- Main corridor sector: light level 144
- Player spawn sector: light level 112

**Things:**
- Thing type 1 (Player 1 Start): center of spawn area, angle 90 (facing North)
- Thing type 2001 (Shotgun): placed in corridor at exhibit [1] location
- Thing type 3004 (Former Human): optional guard in corridor

---

## Linedef Exhibit Triggers

Each of the 14 exhibit walls must be a linedef with:
- **Special type:** 24 (G1 Door Open Stay — triggered by gunshot)
- **Tag:** 1001 through 1014 (exhibit [1] = tag 1001, exhibit [14] = tag 1014)
- **Flags:** Impassable (0x0001) + Two-sided (0x0004) = 0x0005
- **Front sidedef:** faces the player (corridor side), texture `BROWN1`
- **Back sidedef:** faces the void (inner wall side), texture `BROWN1`

Non-exhibit walls:
- Special type: 0
- Tag: 0
- Flags: Impassable (0x0001)
- Sidedef: `STARTAN2` texture

**Exit linedef:**
- Special type: 11 (S1 Exit Level)
- Tag: 0
- Place it on one of the corridor walls near exhibit [14]

---

## WAD Binary Format (implement exactly)

### Header (12 bytes)
```
Bytes 0–3:  "PWAD" (ASCII)
Bytes 4–7:  num_lumps (int32 LE)
Bytes 8–11: dir_offset (int32 LE) — offset to directory
```

### Lump Directory Entry (16 bytes each)
```
Bytes 0–3:  lump_offset (int32 LE)
Bytes 4–7:  lump_size (int32 LE)
Bytes 8–15: lump_name (8 bytes, null-padded ASCII)
```

### Required Lumps in MAP01 (in this order)

| Lump | Content |
|------|---------|
| MAP01 | 0-byte marker |
| THINGS | Array of 10-byte THING structs |
| LINEDEFS | Array of 14-byte LINEDEF structs |
| SIDEDEFS | Array of 30-byte SIDEDEF structs |
| VERTEXES | Array of 4-byte VERTEX structs |
| SEGS | Can be empty (PrBoom rebuilds) |
| SSECTORS | Can be empty |
| NODES | Can be empty |
| SECTORS | Array of 26-byte SECTOR structs |
| REJECT | Can be empty (or zeroed out) |
| BLOCKMAP | Can be empty (PrBoom rebuilds) |

### THING struct (10 bytes)
```
x       int16 LE
y       int16 LE
angle   int16 LE  (degrees: 0=East, 90=North, 180=West, 270=South)
type    int16 LE
flags   int16 LE  (0x0007 = all skill levels)
```

### LINEDEF struct (14 bytes)
```
v1      int16 LE  (start vertex index)
v2      int16 LE  (end vertex index)
flags   int16 LE
special int16 LE
tag     int16 LE
sidenum[0] int16 LE  (front sidedef index, -1 if none)
sidenum[1] int16 LE  (back sidedef index, -1 if one-sided)
```

### SIDEDEF struct (30 bytes)
```
textureoffset  int16 LE  (0)
rowoffset      int16 LE  (0)
toptexture     char[8]   (null-padded, "-" for none)
bottomtexture  char[8]   (null-padded, "-" for none)
midtexture     char[8]   (null-padded, wall texture name)
sector         int16 LE  (sector index this sidedef faces)
```

### VERTEX struct (4 bytes)
```
x  int16 LE
y  int16 LE
```

### SECTOR struct (26 bytes)
```
floorheight    int16 LE
ceilingheight  int16 LE
floorpic       char[8]   (flat name, null-padded)
ceilingpic     char[8]   (flat name, null-padded)
lightlevel     int16 LE
special        int16 LE  (0 = normal)
tag            int16 LE  (0 = no tag)
```

---

## Node Builder Requirement

PrBoom **requires** NODES/SEGS/SSECTORS to render. You have two options:

**Option A (preferred):** Use `zdbsp` to build nodes after generating the WAD.
```bash
# Install via Homebrew
brew install zdbsp 2>/dev/null || echo "try manual install"

# Or download pre-built binary
curl -L https://zdoom.org/files/utils/zdbsp/zdbsp-1.19.tar.gz -o /tmp/zdbsp.tar.gz

# Run node builder
zdbsp -o doom/gallery.wad doom/gallery_raw.wad
```

**Option B:** Embed a minimal pre-built NODES/SEGS/SSECTORS block for our specific geometry (if you know the exact BSP for a rectangle, provide it as hardcoded bytes).

**Option C:** Use the `omgifol` Python library which can build nodes:
```bash
pip3 install omgifol
```
Then use `omg.WAD` + `omg.NodeBuilder` to assemble the final WAD.

---

## Verification Command (run after building)

```bash
file doom/gallery.wad
# Expected: doom patch PWAD data containing 11 lumps

python3 -c "
import struct
with open('doom/gallery.wad','rb') as f:
    sig = f.read(4)
    nlumps, dofs = struct.unpack('<II', f.read(8))
    print(f'Sig: {sig} | Lumps: {nlumps} | Dir offset: {dofs}')
    f.seek(dofs)
    for i in range(nlumps):
        ofs, sz = struct.unpack('<II', f.read(8))
        name = f.read(8).rstrip(b'\\x00').decode()
        print(f'  {name}: {sz} bytes at {ofs}')
"
```

Expected output:
```
Sig: b'PWAD' | Lumps: 11 | Dir offset: [N]
  MAP01: 0 bytes at 12
  THINGS: [N] bytes ...
  LINEDEFS: [N] bytes ...
  SIDEDEFS: [N] bytes ...
  VERTEXES: [N] bytes ...
  SEGS: [N] bytes ...
  SSECTORS: [N] bytes ...
  NODES: [N] bytes ...
  SECTORS: [N] bytes ...
  REJECT: [N] bytes ...
  BLOCKMAP: [N] bytes ...
```

---

## File Destination

Save the final WAD to:
```
/Users/bunj/claude/portfolio maze/doom/gallery.wad
```

**Do not create any other files.** Do not modify any JS files. Only deliver `doom/gallery.wad`.

---

## Report Format — Write to `.claude/GEMINI-RESPONSE.md`

Add at the TOP:

```markdown
## gallery.wad Build — [timestamp]

### Python Script Used
[paste the complete script — no truncation]

### Terminal Commands Run
[exact commands in order]

### Verification Output
[paste actual output of the verify command]

### Lump Inventory
[list of lumps and their sizes]

### VERDICT: [VALID / FAILED / PARTIAL]
```

---

## What Claude Code Will Do After You Deliver

1. Run your verification command
2. Check the WAD is >1KB (not a stub)
3. `git add doom/gallery.wad && git commit && git push`
4. Test in-browser via Playwright — walk the corridor, shoot an exhibit wall, verify portal fires
5. Screenshot and report back

**If your WAD doesn't load in PrBoom, Claude Code will debug and feed the error back to you for a patch.**
