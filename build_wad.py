"""
build_wad.py — Gallery WAD generator for BUNJUMUN-DOOM
Generates a single-sector convex rectangular room with 14 exhibit walls.

Room dimensions: ±768 map units (matches EXHIBIT_ZONES in doom-bridge.js)
Exhibit walls:   64 units wide, centered on each zone coordinate
Textures:        EX00TX – EX13TX (injected at runtime by gallery-wad.js)
BSP:             Trivial single-subsector (valid for convex room)
Sector:          Floor 0, Ceiling 128 — matches 64×128 exhibit texture size

Zone layout (from doom-bridge.js):
  South wall (y=-768): zones 0,1  at x=-384, x=384
  East  wall (x=+768): zones 2–5 at y=-576,-192,192,576
  North wall (y=+768): zones 6–9  at x=576,192,-192,-576
  West  wall (x=-768): zones 10–13 at y=576,192,-192,-576
"""

import struct
import os

WALL = 768          # room half-extent (walls at ±768)
HALF_EXHIBIT = 32   # exhibit wall half-width (64 units total)

def build_wad():
    wad_path = 'doom/gallery.wad'
    os.makedirs('doom', exist_ok=True)

    # ── Geometry accumulators ─────────────────────────────────────────────────
    vertices_list = []
    vertices_map  = {}   # (x,y) → index
    linedefs      = []
    sidedefs      = []

    def add_v(x, y):
        key = (int(x), int(y))
        if key not in vertices_map:
            vertices_map[key] = len(vertices_list)
            vertices_list.append(key)
        return vertices_map[key]

    def add_side(mid='STARTAN2'):
        """1-sided sidedef for sector 0."""
        sidedefs.append((
            0, 0,                            # x/y offset
            b'-\x00\x00\x00\x00\x00\x00\x00',  # upper tex (none)
            b'-\x00\x00\x00\x00\x00\x00\x00',  # lower tex (none)
            mid.encode().ljust(8, b'\x00'),      # mid tex
            0                                    # sector 0
        ))
        return len(sidedefs) - 1

    def add_line(x1, y1, x2, y2, tex='STARTAN2'):
        """1-sided blocking linedef."""
        v1 = add_v(x1, y1)
        v2 = add_v(x2, y2)
        s  = add_side(tex)
        linedefs.append((v1, v2, 1, 0, 0, s, -1))   # flags=BLOCKING, no special/tag

    # ── Exhibit texture name helper ───────────────────────────────────────────
    def ex(i):
        return f'EX{str(i).zfill(2)}TX'

    # ── Build room clockwise (interior to the right) ──────────────────────────
    # Each wall broken into: [buffer] [exhibit] [buffer] ... [exhibit] [buffer]

    # SOUTH WALL  y=-768, going EAST  (zones 0,1 at x=-384, x=384)
    for x1, x2, tex in [
        (-WALL,           -384-HALF_EXHIBIT, 'STARTAN2'),
        (-384-HALF_EXHIBIT, -384+HALF_EXHIBIT, ex(0)),
        (-384+HALF_EXHIBIT,  384-HALF_EXHIBIT, 'STARTAN2'),
        ( 384-HALF_EXHIBIT,  384+HALF_EXHIBIT, ex(1)),
        ( 384+HALF_EXHIBIT,  WALL,             'STARTAN2'),
    ]:
        add_line(x1, -WALL, x2, -WALL, tex)

    # EAST WALL  x=+768, going NORTH  (zones 2–5 at y=-576,-192,192,576)
    for y1, y2, tex in [
        (-WALL,            -576-HALF_EXHIBIT, 'STARTAN2'),
        (-576-HALF_EXHIBIT, -576+HALF_EXHIBIT, ex(2)),
        (-576+HALF_EXHIBIT, -192-HALF_EXHIBIT, 'STARTAN2'),
        (-192-HALF_EXHIBIT, -192+HALF_EXHIBIT, ex(3)),
        (-192+HALF_EXHIBIT,  192-HALF_EXHIBIT, 'STARTAN2'),
        ( 192-HALF_EXHIBIT,  192+HALF_EXHIBIT, ex(4)),
        ( 192+HALF_EXHIBIT,  576-HALF_EXHIBIT, 'STARTAN2'),
        ( 576-HALF_EXHIBIT,  576+HALF_EXHIBIT, ex(5)),
        ( 576+HALF_EXHIBIT,  WALL,             'STARTAN2'),
    ]:
        add_line(WALL, y1, WALL, y2, tex)

    # NORTH WALL  y=+768, going WEST  (zones 6–9 at x=576,192,-192,-576)
    for x1, x2, tex in [
        ( WALL,             576+HALF_EXHIBIT, 'STARTAN2'),
        ( 576+HALF_EXHIBIT,  576-HALF_EXHIBIT, ex(6)),
        ( 576-HALF_EXHIBIT,  192+HALF_EXHIBIT, 'STARTAN2'),
        ( 192+HALF_EXHIBIT,  192-HALF_EXHIBIT, ex(7)),
        ( 192-HALF_EXHIBIT, -192+HALF_EXHIBIT, 'STARTAN2'),
        (-192+HALF_EXHIBIT, -192-HALF_EXHIBIT, ex(8)),
        (-192-HALF_EXHIBIT, -576+HALF_EXHIBIT, 'STARTAN2'),
        (-576+HALF_EXHIBIT, -576-HALF_EXHIBIT, ex(9)),
        (-576-HALF_EXHIBIT, -WALL,             'STARTAN2'),
    ]:
        add_line(x1, WALL, x2, WALL, tex)

    # WEST WALL  x=-768, going SOUTH  (zones 10–13 at y=576,192,-192,-576)
    for y1, y2, tex in [
        ( WALL,             576+HALF_EXHIBIT, 'STARTAN2'),
        ( 576+HALF_EXHIBIT,  576-HALF_EXHIBIT, ex(10)),
        ( 576-HALF_EXHIBIT,  192+HALF_EXHIBIT, 'STARTAN2'),
        ( 192+HALF_EXHIBIT,  192-HALF_EXHIBIT, ex(11)),
        ( 192-HALF_EXHIBIT, -192+HALF_EXHIBIT, 'STARTAN2'),
        (-192+HALF_EXHIBIT, -192-HALF_EXHIBIT, ex(12)),
        (-192-HALF_EXHIBIT, -576+HALF_EXHIBIT, 'STARTAN2'),
        (-576+HALF_EXHIBIT, -576-HALF_EXHIBIT, ex(13)),
        (-576-HALF_EXHIBIT, -WALL,             'STARTAN2'),
    ]:
        add_line(-WALL, y1, -WALL, y2, tex)

    # ── Sector ────────────────────────────────────────────────────────────────
    sectors = [
        (0, 128,                              # floor, ceiling
         b'FLOOR4_8\x00',                     # floor texture (9 bytes → truncate later)
         b'CEIL1_1\x00\x00',                  # ceil texture
         144, 0, 0),                          # light, special, tag
    ]

    # ── Things ────────────────────────────────────────────────────────────────
    things = [
        (0, 0, 90, 1, 7),   # Player 1 start at origin, facing north
    ]

    # ── SEGS: one per linedef, angle from direction ───────────────────────────
    def bam_angle(x1, y1, x2, y2):
        """Binary Angle Measurement for axis-aligned segments (signed int16)."""
        dx, dy = x2 - x1, y2 - y1
        if dx > 0 and dy == 0: return 0       # east  0x0000
        if dx == 0 and dy > 0: return 16384   # north 0x4000
        if dx < 0 and dy == 0: return -32768  # west  0x8000 as signed
        if dx == 0 and dy < 0: return -16384  # south 0xC000 as signed
        import math
        raw = int(math.atan2(dy, dx) / math.pi * 32768) & 0xFFFF
        return raw if raw < 0x8000 else raw - 0x10000

    segs = []
    for i, ld in enumerate(linedefs):
        v1i, v2i = ld[0], ld[1]
        x1, y1   = vertices_list[v1i]
        x2, y2   = vertices_list[v2i]
        angle    = bam_angle(x1, y1, x2, y2)
        segs.append((v1i, v2i, angle, i, 0, 0))   # v1,v2,angle,linedef,side=0,offset=0

    # ── SSECTORS: one subsector containing all segs ───────────────────────────
    ssectors = [(len(segs), 0)]   # count, first_seg_index

    # ── NODES: trivial single node, both children → subsector 0 ──────────────
    # Partition: horizontal line y=0, direction east (+X)
    # Right child = south half (y ≤ 0), Left child = north half (y ≥ 0)
    nodes = [(
        0, 0, 1, 0,                   # partition: (0,0), dir (1,0)
        0, -WALL, -WALL, WALL,        # right bbox: top=0, bot=-WALL, left=-WALL, right=WALL
        WALL, 0, -WALL, WALL,         # left  bbox: top=WALL, bot=0, left=-WALL, right=WALL
        0x8000, 0x8000                # both children → subsector 0
    )]

    # ── BLOCKMAP ──────────────────────────────────────────────────────────────
    block_size = 128
    ox, oy     = -WALL, -WALL
    cols       = (2 * WALL) // block_size
    rows       = (2 * WALL) // block_size

    block_lists = []
    for r in range(rows):
        for c in range(cols):
            bx1 = ox + c * block_size
            by1 = oy + r * block_size
            bx2 = bx1 + block_size
            by2 = by1 + block_size
            linds = []
            for i, ld in enumerate(linedefs):
                x1, y1 = vertices_list[ld[0]]
                x2, y2 = vertices_list[ld[1]]
                lx1, lx2 = min(x1, x2), max(x1, x2)
                ly1, ly2 = min(y1, y2), max(y1, y2)
                if not (lx2 < bx1 or lx1 > bx2 or ly2 < by1 or ly1 > by2):
                    linds.append(i)
            block_lists.append(linds)

    bm_header  = struct.pack('<hhhh', ox, oy, cols, rows)
    bm_offsets = []
    bm_data    = b''
    cur_ofs    = 4 + cols * rows
    for linds in block_lists:
        bm_offsets.append(cur_ofs)
        bm_data += (struct.pack('<H', 0)
                    + b''.join(struct.pack('<H', i) for i in linds)
                    + struct.pack('<H', 0xFFFF))
        cur_ofs += 1 + len(linds) + 1
    blockmap_lump = bm_header + struct.pack(f'<{len(bm_offsets)}H', *bm_offsets) + bm_data

    # ── Pack lumps ────────────────────────────────────────────────────────────

    def pack_things():
        return b''.join(struct.pack('<hhHHH', *t) for t in things)

    def pack_linedefs():
        out = b''
        for v1, v2, flags, special, tag, s1, s2 in linedefs:
            out += struct.pack('<hhhhhhh', v1, v2, flags, special, tag, s1, s2)
        return out

    def pack_sidedefs():
        out = b''
        for xoff, yoff, top, bot, mid, sec in sidedefs:
            # Ensure 8-byte texture fields
            out += struct.pack('<hh', xoff, yoff)
            out += top[:8].ljust(8, b'\x00')
            out += bot[:8].ljust(8, b'\x00')
            out += mid[:8].ljust(8, b'\x00')
            out += struct.pack('<h', sec)
        return out

    def pack_vertices():
        return b''.join(struct.pack('<hh', x, y) for x, y in vertices_list)

    def pack_segs():
        return b''.join(struct.pack('<hhhhhh', *s) for s in segs)

    def pack_ssectors():
        return b''.join(struct.pack('<hh', cnt, first) for cnt, first in ssectors)

    def pack_nodes():
        out = b''
        for n in nodes:
            out += struct.pack('<hhhh hhhh hhhh HH', *n)
        return out

    def pack_sectors():
        out = b''
        for floor_h, ceil_h, floor_t, ceil_t, light, special, tag in sectors:
            out += struct.pack('<hh', floor_h, ceil_h)
            out += floor_t[:8].ljust(8, b'\x00')
            out += ceil_t[:8].ljust(8, b'\x00')
            out += struct.pack('<hhh', light, special, tag)
        return out

    lump_data_list = [
        (b'MAP01   ', b''),
        (b'THINGS  ', pack_things()),
        (b'LINEDEFS', pack_linedefs()),
        (b'SIDEDEFS', pack_sidedefs()),
        (b'VERTEXES', pack_vertices()),
        (b'SEGS    ', pack_segs()),
        (b'SSECTORS', pack_ssectors()),
        (b'NODES   ', pack_nodes()),
        (b'SECTORS ', pack_sectors()),
        (b'REJECT  ', b'\x00'),          # 1×1 sector matrix = 1 byte
        (b'BLOCKMAP', blockmap_lump),
    ]

    # ── Assemble WAD ──────────────────────────────────────────────────────────
    cur_ofs   = 12   # after header
    lump_data = b''
    directory = b''

    for name, data in lump_data_list:
        directory += struct.pack('<II', cur_ofs, len(data)) + name[:8].ljust(8, b'\x00')
        lump_data += data
        cur_ofs   += len(data)

    header = struct.pack('<4sII', b'PWAD', len(lump_data_list), cur_ofs)

    with open(wad_path, 'wb') as f:
        f.write(header + lump_data + directory)

    size = os.path.getsize(wad_path)
    print(f'Built {wad_path} ({size} bytes)')
    print(f'  Vertices: {len(vertices_list)}, Linedefs: {len(linedefs)}, '
          f'Sidedefs: {len(sidedefs)}, Segs: {len(segs)}, Sectors: {len(sectors)}')

if __name__ == '__main__':
    build_wad()
