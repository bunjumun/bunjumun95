# DOOM Patch / Texture Spec

## Picture / Patch Lump (`patch_t`)

**Endian:** little-endian

```text
patch_t
0x00  int16  width
0x02  int16  height
0x04  int16  leftoffset
0x06  int16  topoffset
0x08  uint32 columnofs[width]   ; offsets from start of this lump
...   column data
```

```text
column
repeat posts until 0xFF terminator

post
+0x00  uint8   topdelta
+0x01  uint8   length
+0x02  uint8   pad1          ; unused
+0x03  uint8   pixels[length] ; palette indices 0..255
+...   uint8   pad2          ; unused

column terminator
+0x00  uint8   0xFF
```

**Notes**
- Transparent space = absence of posts in that column range.
- `columnofs[x]` points to the first byte of that column’s first post or `0xFF` if null column.
- `pixels[]` are palette indices, **not RGB**.

## PLAYPAL

```text
single palette
768 bytes total
256 RGB triplets

byte 0   = color 0 red
byte 1   = color 0 green
byte 2   = color 0 blue
...
byte 765 = color 255 red
byte 766 = color 255 green
byte 767 = color 255 blue
```

```text
DOOM PLAYPAL lump
14 palettes * 768 bytes = 10752 bytes total
```

## PNAMES

```text
0x00  int32  num_patches
0x04  char   name[8] * num_patches
```

**Name entry**
- 8 bytes exactly
- ASCII
- zero-padded if shorter than 8
- lookup is case-insensitive in Doom

## TEXTURE1 / TEXTURE2

```text
0x00  int32  num_textures
0x04  int32  offsets[num_textures]   ; offsets from start of TEXTURE1/TEXTURE2 lump
...   texture entries
```

### Texture Entry (`maptexture_t`)

```text
0x00  char   name[8]
0x08  int32  masked
0x0C  int16  width
0x0E  int16  height
0x10  int32  columndirectory   ; obsolete, set 0
0x14  int16  patchcount
0x16  mappatch_t patches[patchcount]
```

### Patch Ref (`mappatch_t`)

```text
0x00  int16  originx
0x02  int16  originy
0x04  int16  patch          ; index into PNAMES
0x06  int16  stepdir        ; set 1
0x08  int16  colormap       ; set 0
```

## Minimum Single-Custom-Texture Setup

### PNAMES

```text
num_patches = 1
patch[0]    = "PATCHA\0\0"
```

### TEXTURE1

```text
num_textures = 1
offsets[0]   = 0x00000008
```

```text
texture entry @ 0x08
name            = "TEXA\0\0\0\0"
masked          = 0
width           = <texture width>
height          = <texture height>
columndirectory = 0
patchcount      = 1

patch[0]
originx         = 0
originy         = 0
patch           = 0   ; first PNAMES entry
stepdir         = 1
colormap        = 0
```

**Sizes**
- `TEXTURE1` header for 1 texture: `4 + 4 = 8` bytes
- one texture entry with one patch: `22 + 10 = 32` bytes
- total `TEXTURE1` size for one 1-patch texture: **40 bytes**

## Safe Texture / Patch Name Rules

```text
safe rule:
- 1..8 chars
- ASCII uppercase
- use [A-Z0-9_]
- no spaces
- zero-pad remaining bytes
```

```text
engine/storage rule:
- stored as 8-byte name fields
- case-insensitive lookup
- shorter names are null-padded
```

## Sources

- https://www.gamers.org/dhs/helpdocs/dmsp1666.html
- https://www.gamers.org/docs/FAQ/DOOM.FAQ.Specs.Chapters.8.html
