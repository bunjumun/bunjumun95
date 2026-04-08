import struct
import os

def build_wad():
    wad_path = 'doom/gallery.wad'
    os.makedirs('doom', exist_ok=True)

    # --- Geometry Constants ---
    # Outer rect: -1024 to 1024
    # Inner rect: -768 to 768
    # Corridor width: 256

    vertices = []
    def add_v(x, y):
        vertices.append((int(x), int(y)))
        return len(vertices) - 1

    # Sector 0: Inner Void (Spawn)
    # Sector 1: Outer Corridor
    sectors = [
        (0, 128, b'FLOOR4_8', b'CEIL1_1', 112, 0, 0), # Sector 0
        (0, 128, b'FLOOR4_8', b'CEIL1_1', 144, 0, 0), # Sector 1
    ]

    linedefs = []
    sidedefs = []

    def add_side(sector, mid="-", top="-", bot="-"):
        sidedefs.append((0, 0, top.encode().ljust(8, b'\0'), bot.encode().ljust(8, b'\0'), mid.encode().ljust(8, b'\0'), sector))
        return len(sidedefs) - 1

    def add_line(v1, v2, special=0, tag=0, flags=1, s1=-1, s2=-1):
        linedefs.append((v1, v2, flags, special, tag, s1, s2))
        return len(linedefs) - 1

    # 1. Outer Walls (Sector 1)
    v_out = [add_v(-1024, -1024), add_v(1024, -1024), add_v(1024, 1024), add_v(-1024, 1024)]
    for i in range(4):
        # Exit on West wall (x=-1024)
        special = 11 if i == 3 else 0
        s = add_side(1, mid="STARTAN2")
        add_line(v_out[i], v_out[(i+1)%4], special=special, s1=s)

    # 2. Inner Walls & Exhibits
    # Exhibits 1001-1014
    exhibit_count = 0

    def build_inner_side(v_start, v_end, num_exhibits, horizontal=True):
        nonlocal exhibit_count
        span = 1536
        step = span / num_exhibits

        curr_v = v_start
        for i in range(num_exhibits):
            exhibit_count += 1
            tag = 1000 + exhibit_count

            frac = (i + 0.5) / num_exhibits
            if horizontal:
                cx = vertices[v_start][0] + (vertices[v_end][0] - vertices[v_start][0]) * frac
                cy = vertices[v_start][1]
                v_ex1 = add_v(cx - 64, cy)
                v_ex2 = add_v(cx + 64, cy)
            else:
                cx = vertices[v_start][0]
                cy = vertices[v_start][1] + (vertices[v_end][1] - vertices[v_start][1]) * frac
                v_ex1 = add_v(cx, cy - 64)
                v_ex2 = add_v(cx, cy + 64)

            # Buffer line
            s1 = add_side(1, mid="STARTAN2")
            s2 = add_side(0, mid="STARTAN2")
            add_line(curr_v, v_ex1, flags=5, s1=s1, s2=s2)

            # Exhibit trigger line
            s1 = add_side(1, mid="BROWN1")
            s2 = add_side(0, mid="BROWN1")
            add_line(v_ex1, v_ex2, special=24, tag=tag, flags=5, s1=s1, s2=s2)

            curr_v = v_ex2

        # Last buffer to corner
        s1 = add_side(1, mid="STARTAN2")
        s2 = add_side(0, mid="STARTAN2")
        add_line(curr_v, v_end, flags=5, s1=s1, s2=s2)

    v_in_corners = [add_v(-768, -768), add_v(768, -768), add_v(768, 768), add_v(-768, 768)]
    build_inner_side(v_in_corners[0], v_in_corners[1], 2, True)   # South: 2 exhibits
    build_inner_side(v_in_corners[1], v_in_corners[2], 4, False)  # East:  4 exhibits
    build_inner_side(v_in_corners[2], v_in_corners[3], 4, True)   # North: 4 exhibits
    build_inner_side(v_in_corners[3], v_in_corners[0], 4, False)  # West:  4 exhibits

    # 3. Things
    things = [
        (0, 0, 90, 1, 7),        # Player Start
        (-896, 512, 0, 2001, 7), # Shotgun near start
    ]

    # --- BSP Generation ---
    # Create segs from linedefs (simple mapping)
    segs_data = b''
    for i, ld in enumerate(linedefs):
        v1, v2, flags, special, tag, s1, s2 = ld
        # angle is binary angle. 0=east, 0x4000=north, 0x8000=west, 0xc000=south.
        # For simplicity, we use 0.
        segs_data += struct.pack('<hhhhhh', v1, v2, 0, i, 0, 0)

    # One subsector containing all segs
    ssectors_data = struct.pack('<hh', len(linedefs), 0)

    # Trivial node split at Y=0
    nodes_data = struct.pack('<hhhh hhhh hhhh HH',
        -1024, 0, 2048, 0,          # partition line
        1024, -1024, -1024, 1024,   # right bbox
        1024, -1024, -1024, 1024,   # left bbox
        0x8000, 0x8000              # both children -> subsector 0
    )

    # --- BLOCKMAP Generation ---
    block_size = 128
    origin_x = -1024
    origin_y = -1024
    cols = (1024 - origin_x) // block_size
    rows = (1024 - origin_y) // block_size
    
    block_lists = []
    for r in range(rows):
        for c in range(cols):
            bx1, by1 = origin_x + c * block_size, origin_y + r * block_size
            bx2, by2 = bx1 + block_size, by1 + block_size
            
            linds = []
            for i, ld in enumerate(linedefs):
                v1_idx, v2_idx = ld[0], ld[1]
                x1, y1 = vertices[v1_idx]
                x2, y2 = vertices[v2_idx]
                lx1, lx2 = min(x1, x2), max(x1, x2)
                ly1, ly2 = min(y1, y2), max(y1, y2)
                # Check if linedef bounding box intersects the block bounding box
                if not (lx2 < bx1 or lx1 > bx2 or ly2 < by1 or ly1 > by2):
                    linds.append(i)
            block_lists.append(linds)

    blockmap_header = struct.pack('<hhhh', origin_x, origin_y, cols, rows)
    offsets = []
    block_data = b''
    current_offset = 4 + cols * rows
    for linds in block_lists:
        offsets.append(current_offset)
        # List starts with 0 padding, ends with 0xFFFF
        block_data += struct.pack('<H', 0) + b''.join(struct.pack('<H', i) for i in linds) + struct.pack('<H', 0xFFFF)
        current_offset += 1 + len(linds) + 1
    blockmap_lump = blockmap_header + struct.pack(f'<{len(offsets)}H', *offsets) + block_data

    # --- Binary Assembly ---
    def pack_lump(name, data):
        return name.encode().ljust(8, b'\0'), data

    lumps = [
        pack_lump('MAP01',    b''),
        pack_lump('THINGS',   b''.join(struct.pack('<hhHHH', *t) for t in things)),
        pack_lump('LINEDEFS', b''.join(struct.pack('<hhhhhhh', *l) for l in linedefs)),
        pack_lump('SIDEDEFS', b''.join(struct.pack('<hh8s8s8sh', *s) for s in sidedefs)),
        pack_lump('VERTEXES', b''.join(struct.pack('<hh', *v) for v in vertices)),
        pack_lump('SEGS',     segs_data),
        pack_lump('SSECTORS', ssectors_data),
        pack_lump('NODES',    nodes_data),
        pack_lump('SECTORS',  b''.join(struct.pack('<hh8s8shhh', s[0], s[1], s[2].ljust(8, b'\0'), s[3].ljust(8, b'\0'), s[4], s[5], s[6]) for s in sectors)),
        pack_lump('REJECT',   b'\0' * ((len(sectors)**2 + 7) // 8)),
        pack_lump('BLOCKMAP', blockmap_lump),
    ]

    header_size = 12
    current_offset = header_size
    lump_data = b''
    directory = b''

    for name, data in lumps:
        size = len(data)
        directory += struct.pack('<II8s', current_offset, size, name)
        lump_data += data
        current_offset += size

    header = struct.pack('<4sII', b'PWAD', len(lumps), current_offset)

    with open(wad_path, 'wb') as f:
        f.write(header)
        f.write(lump_data)
        f.write(directory)

    print(f"Built {wad_path} ({os.path.getsize(wad_path)} bytes)")
    print(f"  Vertices: {len(vertices)}, Linedefs: {len(linedefs)}, Sidedefs: {len(sidedefs)}, Sectors: {len(sectors)}, Things: {len(things)}")

if __name__ == '__main__':
    build_wad()
