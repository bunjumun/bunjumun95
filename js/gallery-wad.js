/**
 * gallery-wad.js
 * T09/T10 (Qwen2Coder) + integration (Claude Code)
 *
 * Fetches pre-built gallery.wad geometry, then appends dynamically generated
 * DOOM texture lumps (PNAMES, TEXTURE1, patch data) derived from gallery.json
 * exhibit thumbnails. The merged WAD is injected into PrBoom's Emscripten VFS
 * before engine boot, so exhibit walls render with actual gallery images.
 */

class GalleryWAD {
  constructor(gallery) {
    this.gallery = gallery;
    this.wadData = null;
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  async generate() {
    try {
      const res = await fetch('doom/gallery.wad');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = await res.arrayBuffer();
      this.wadData = new Uint8Array(buf);
      console.log('[GalleryWAD] Loaded gallery.wad:', this.wadData.byteLength, 'bytes');
    } catch (e) {
      console.warn('[GalleryWAD] gallery.wad unavailable, using stub:', e.message);
      this.wadData = this._minimalStub();
    }
    return this.wadData;
  }

  async writeToFS() {
    if (!this.wadData) await this.generate();

    const exhibits = (this.gallery && this.gallery.exhibits) || [];
    const withThumb = exhibits.filter(e => e.thumbnail && e.thumbnail.length > 0);

    if (withThumb.length > 0) {
      try {
        const merged = await this._appendTextureLumps(this.wadData, withThumb);
        window.galleryWadData = merged;
        console.log('[GalleryWAD] Merged WAD with textures staged:', merged.byteLength, 'bytes');
      } catch (err) {
        console.warn('[GalleryWAD] Texture injection failed, using geometry-only WAD:', err.message);
        window.galleryWadData = this.wadData;
      }
    } else {
      window.galleryWadData = this.wadData;
      console.log('[GalleryWAD] No thumbnails — geometry-only WAD staged:', this.wadData.byteLength, 'bytes');
    }
  }

  // ── Texture injection ────────────────────────────────────────────────────────

  /**
   * Generate PNAMES + TEXTURE1 + patch lumps from exhibits, then merge into
   * the base geometry WAD. Returns merged Uint8Array.
   */
  async _appendTextureLumps(baseWad, exhibits) {
    // Build one patch per exhibit, capped at 14 (matching WAD geometry)
    const capped = exhibits.slice(0, 14);

    // Quantize images in parallel
    const patches = await Promise.all(capped.map(async (ex, i) => {
      const name = `EX${String(i).padStart(2, '0')}PT`; // e.g. EX00PT … EX13PT (8 chars)
      const texName = `EX${String(i).padStart(2, '0')}TX`; // e.g. EX00TX (8 chars)
      const quantized = await this._quantizeImage(ex.thumbnail, 64, 128);
      const patchLump = this._encodePatch(quantized.pixels, quantized.w, quantized.h);
      return { patchName: name, texName, patchLump, w: quantized.w, h: quantized.h };
    }));

    const patchNames = patches.map(p => p.patchName);
    const pnamesLump  = this._buildPnames(patchNames);
    const texture1Lump = this._buildTexture1(patches);

    // Assemble extra lumps: P_START marker, patches, P_END marker, PNAMES, TEXTURE1
    const extraLumps = [
      { name: 'P_START', data: new Uint8Array(0) },
      ...patches.map(p => ({ name: p.patchName, data: p.patchLump })),
      { name: 'P_END',   data: new Uint8Array(0) },
      { name: 'PNAMES',  data: pnamesLump },
      { name: 'TEXTURE1',data: texture1Lump },
    ];

    return this._mergeWad(baseWad, extraLumps);
  }

  // ── WAD merge ────────────────────────────────────────────────────────────────

  /**
   * Append lumps to an existing PWAD without touching its existing entries.
   */
  _mergeWad(baseWad, extraLumps) {
    const dv = new DataView(baseWad.buffer, baseWad.byteOffset);
    const numBase  = dv.getUint32(4, true);
    const dirOfs   = dv.getUint32(8, true);

    // Existing lump data block (everything before the directory)
    const dataBlock = baseWad.slice(0, dirOfs);
    const dirBlock  = baseWad.slice(dirOfs, dirOfs + numBase * 16);

    // New lump data appended after existing data block
    const extraData  = extraLumps.map(l => l.data);
    const extraTotalBytes = extraData.reduce((s, d) => s + d.byteLength, 0);

    // New directory entries for extra lumps
    const newDirEntries = new Uint8Array(extraLumps.length * 16);
    const ndv = new DataView(newDirEntries.buffer);
    let curOfs = dirOfs; // extra lump data starts right where base dir was
    // But base dir is now pushed back — recalculate:
    // Layout: [base lump data][extra lump data][base dir][extra dir]
    const newDirOfs = dirOfs + extraTotalBytes;

    let extraPos = dirOfs; // offset of first extra lump in merged file
    for (let i = 0; i < extraLumps.length; i++) {
      const d = extraLumps[i].data;
      ndv.setUint32(i * 16,     extraPos,     true); // offset
      ndv.setUint32(i * 16 + 4, d.byteLength, true); // size
      const n = extraLumps[i].name.toUpperCase().slice(0, 8);
      for (let c = 0; c < 8; c++) {
        newDirEntries[i * 16 + 8 + c] = c < n.length ? n.charCodeAt(c) : 0;
      }
      extraPos += d.byteLength;
    }

    // New header
    const header = new Uint8Array(12);
    const hdv = new DataView(header.buffer);
    header[0]=80; header[1]=87; header[2]=65; header[3]=68; // PWAD
    hdv.setUint32(4, numBase + extraLumps.length, true);
    hdv.setUint32(8, newDirOfs, true);

    // Assemble: header + base lump data + extra lump data + base dir + extra dir
    const total = 12 + (dataBlock.byteLength - 12) + extraTotalBytes + dirBlock.byteLength + newDirEntries.byteLength;
    const out = new Uint8Array(total);
    let pos = 0;

    out.set(header, pos); pos += 12;
    out.set(dataBlock.slice(12), pos); pos += dataBlock.byteLength - 12; // base lump data (skip old header)
    for (const d of extraData) { out.set(d, pos); pos += d.byteLength; }
    out.set(dirBlock, pos); pos += dirBlock.byteLength;
    out.set(newDirEntries, pos);

    return out;
  }

  // ── Image quantization (T09) ─────────────────────────────────────────────────

  /**
   * Load base64 image, resize to (w × h), quantize to DOOM palette.
   * Returns { pixels: Uint8Array, w, h }.
   */
  _quantizeImage(base64, targetW, targetH) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width  = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, targetW, targetH);
        const rgba = ctx.getImageData(0, 0, targetW, targetH).data;

        const pal = GalleryWAD._DOOM_PALETTE;
        const indexed = new Uint8Array(targetW * targetH);
        for (let i = 0; i < indexed.length; i++) {
          indexed[i] = GalleryWAD._nearestPaletteColor(
            rgba[i * 4], rgba[i * 4 + 1], rgba[i * 4 + 2], pal
          );
        }
        resolve({ pixels: indexed, w: targetW, h: targetH });
      };
      img.onerror = () => reject(new Error('Image load failed'));
      // handle both data URLs and bare base64
      img.src = base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`;
    });
  }

  static _nearestPaletteColor(r, g, b, pal) {
    let best = 0, bestD = Infinity;
    for (let i = 0; i < 256; i++) {
      const dr = r - pal[i * 3];
      const dg = g - pal[i * 3 + 1];
      const db = b - pal[i * 3 + 2];
      // Perceptual weights (same as Llama's choice)
      const d = 0.3 * dr * dr + 0.59 * dg * dg + 0.11 * db * db;
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }

  // ── DOOM picture/patch encoder (T10) ─────────────────────────────────────────

  /**
   * Encode palette-indexed pixels to DOOM patch_t format.
   * patch_t header: int16 width, height, leftoffset, topoffset
   *                 uint32 columnofs[width]
   * Each column: sequence of posts terminated by 0xFF
   * Post: topdelta(1) + length(1) + pad(1) + pixels[length] + pad(1)
   */
  _encodePatch(pixels, w, h) {
    // Build each column's byte sequence first so we know offsets
    const cols = [];
    for (let x = 0; x < w; x++) {
      const col = [];
      // Single post spanning full height (h < 255 guaranteed by our 128px cap)
      col.push(0);   // topdelta
      col.push(h);   // length
      col.push(0);   // pad1
      for (let y = 0; y < h; y++) col.push(pixels[y * w + x]);
      col.push(0);   // pad2
      col.push(0xFF); // column terminator
      cols.push(new Uint8Array(col));
    }

    const headerBytes = 8 + w * 4; // patch_t header + columnofs array
    let totalBytes = headerBytes;
    for (const c of cols) totalBytes += c.byteLength;

    const out = new Uint8Array(totalBytes);
    const dv  = new DataView(out.buffer);

    // patch_t header
    dv.setInt16(0, w, true);
    dv.setInt16(2, h, true);
    dv.setInt16(4, 0, true); // leftoffset
    dv.setInt16(6, 0, true); // topoffset

    // columnofs + column data
    let colPos = headerBytes;
    for (let x = 0; x < w; x++) {
      dv.setUint32(8 + x * 4, colPos, true);
      out.set(cols[x], colPos);
      colPos += cols[x].byteLength;
    }

    return out;
  }

  // ── PNAMES lump ──────────────────────────────────────────────────────────────

  _buildPnames(names) {
    const buf = new Uint8Array(4 + names.length * 8);
    const dv  = new DataView(buf.buffer);
    dv.setUint32(0, names.length, true);
    for (let i = 0; i < names.length; i++) {
      const n = names[i].toUpperCase().slice(0, 8);
      for (let c = 0; c < 8; c++) buf[4 + i * 8 + c] = c < n.length ? n.charCodeAt(c) : 0;
    }
    return buf;
  }

  // ── TEXTURE1 lump ─────────────────────────────────────────────────────────────

  /**
   * patches: [{ patchName, texName, w, h }]
   * Each texture uses one patch (1:1 mapping).
   * maptexture_t: name(8) masked(4) width(2) height(2) coldir(4) patchcount(2) + patches
   * mappatch_t:   originx(2) originy(2) patch(2) stepdir(2) colormap(2) = 10 bytes
   */
  _buildTexture1(patches) {
    const n = patches.length;
    const ENTRY_SIZE = 22 + 10; // one patch ref per texture

    // Header: num_textures(4) + offsets[n](4 each)
    const headerBytes = 4 + n * 4;
    const totalBytes  = headerBytes + n * ENTRY_SIZE;
    const buf = new Uint8Array(totalBytes);
    const dv  = new DataView(buf.buffer);

    dv.setUint32(0, n, true);

    for (let i = 0; i < n; i++) {
      const entryOfs = headerBytes + i * ENTRY_SIZE;
      dv.setUint32(4 + i * 4, entryOfs, true); // offset from start of lump

      const p = patches[i];
      const tn = p.texName.toUpperCase().slice(0, 8);
      for (let c = 0; c < 8; c++) buf[entryOfs + c] = c < tn.length ? tn.charCodeAt(c) : 0;

      dv.setInt32 (entryOfs + 8,  0,    true); // masked
      dv.setInt16 (entryOfs + 12, p.w,  true); // width
      dv.setInt16 (entryOfs + 14, p.h,  true); // height
      dv.setInt32 (entryOfs + 16, 0,    true); // columndirectory (obsolete)
      dv.setInt16 (entryOfs + 20, 1,    true); // patchcount

      // mappatch_t
      const pp = entryOfs + 22;
      dv.setInt16(pp,     0,    true); // originx
      dv.setInt16(pp + 2, 0,    true); // originy
      dv.setInt16(pp + 4, i,    true); // patch index into PNAMES
      dv.setInt16(pp + 6, 1,    true); // stepdir
      dv.setInt16(pp + 8, 0,    true); // colormap  ← int16, NOT int32
    }

    return buf;
  }

  // ── Fallback stub ────────────────────────────────────────────────────────────

  _minimalStub() {
    const buf = new ArrayBuffer(12);
    const v = new DataView(buf);
    [80,87,65,68].forEach((b,i) => v.setUint8(i,b));
    v.setUint32(4, 0, true);
    v.setUint32(8, 12, true);
    return new Uint8Array(buf);
  }
}

// ── DOOM PLAYPAL palette (palette 0 of 14) ───────────────────────────────────
// Standard DOOM palette, 256 RGB triplets. Used for image quantization.
// Source: extracted from DOOM1.WAD PLAYPAL lump.
GalleryWAD._DOOM_PALETTE = new Uint8Array([
  0,0,0, 31,23,11, 23,15,7, 75,75,75, 255,255,255, 27,27,27, 19,19,19, 11,11,11,
  7,7,7, 47,55,31, 35,43,15, 23,31,7, 15,23,0, 79,59,43, 71,51,35, 63,43,27,
  255,183,183, 247,171,171, 243,163,163, 235,151,151, 231,143,143, 223,135,135, 215,127,127, 207,119,115,
  203,111,107, 195,103,99, 187,95,91, 179,87,83, 175,79,75, 167,71,67, 159,63,59, 151,55,51,
  147,47,43, 139,39,35, 131,31,27, 123,23,19, 119,15,11, 111,7,7, 103,0,0, 95,0,0,
  87,0,0, 79,0,0, 71,0,0, 63,0,0, 55,0,0, 47,0,0, 39,0,0, 31,0,0,
  255,203,103, 255,195,75, 255,187,51, 255,183,27, 255,175,0, 239,163,0, 227,155,0, 215,147,0,
  203,135,0, 191,127,0, 179,115,0, 167,107,0, 155,99,0, 143,87,0, 131,79,0, 119,71,0,
  107,63,0, 95,51,0, 83,43,0, 71,35,0, 63,27,0, 51,19,0, 43,15,0, 31,11,0,
  23,7,0, 15,3,0, 7,0,0, 0,0,0, 183,255,183, 167,247,167, 151,239,151, 135,231,135,
  119,219,119, 103,211,103, 87,199,87, 75,191,75, 63,183,63, 51,171,51, 39,163,39, 27,155,27,
  19,147,19, 11,135,11, 3,127,3, 0,119,0, 0,107,0, 0,95,0, 0,83,0, 0,71,0,
  0,59,0, 0,51,0, 0,39,0, 0,31,0, 0,19,0, 0,11,0, 0,7,0, 0,0,0,
  183,183,255, 167,167,247, 155,155,243, 139,139,235, 127,127,227, 115,115,219, 103,103,211, 91,91,203,
  79,79,195, 67,67,187, 55,55,179, 47,47,171, 35,35,163, 23,23,155, 15,15,147, 7,7,139,
  0,0,131, 0,0,119, 0,0,107, 0,0,95, 0,0,83, 0,0,71, 0,0,59, 0,0,51,
  255,255,255, 235,235,235, 215,215,215, 195,195,195, 175,175,175, 159,159,159, 139,139,139, 119,119,119,
  103,103,103, 83,83,83, 67,67,67, 51,51,51, 35,35,35, 23,23,23, 11,11,11, 0,0,0,
  255,207,159, 243,195,147, 231,183,135, 219,171,123, 207,159,111, 195,151,99, 183,139,87, 175,127,75,
  163,119,67, 151,107,55, 139,99,47, 127,87,39, 119,79,31, 107,71,23, 95,63,15, 87,55,7,
  75,47,0, 67,43,0, 55,35,0, 47,31,0, 35,23,0, 27,19,0, 19,11,0, 11,7,0,
  255,255,207, 255,255,159, 255,255,111, 255,255,63, 255,255,15, 255,255,0, 247,247,0, 239,235,0,
  231,227,0, 223,219,0, 215,211,0, 207,203,0, 199,195,0, 191,187,0, 183,179,0, 175,171,0,
  167,159,0, 159,151,0, 151,143,0, 143,135,0, 135,127,0, 127,119,0, 119,111,0, 111,103,0,
  103,95,0, 95,87,0, 87,79,0, 79,71,0, 71,63,0, 63,55,0, 55,47,0, 47,39,0,
  255,183,255, 247,171,247, 239,159,239, 231,147,231, 223,135,219, 215,123,211, 207,115,203, 199,103,195,
  191,95,183, 183,87,175, 175,79,167, 167,71,159, 159,63,151, 151,55,139, 143,47,131, 135,39,123,
  127,35,115, 119,27,107, 111,19,99, 103,15,91, 95,7,83, 87,3,75, 79,0,67, 71,0,59,
  63,0,51, 55,0,43, 47,0,35, 39,0,27, 31,0,19, 23,0,15, 15,0,7, 7,0,0,
  255,219,183, 251,211,175, 247,207,167, 243,199,159, 239,195,151, 235,187,143, 231,183,135, 227,175,127,
  223,171,119, 219,163,111, 211,155,103, 207,151,95, 203,143,87, 199,139,83, 191,131,75, 187,127,67,
  183,119,59, 179,115,55, 171,107,47, 167,103,43, 159,95,35, 155,91,31, 151,83,27, 143,79,19,
]);
