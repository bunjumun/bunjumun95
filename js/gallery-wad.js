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
    // This is a 32-byte PWAD header that PrBoom will accept but add no content
    const header = 'PWAD'; // 4 bytes: magic
    const numLumps = 0;     // 4 bytes: number of lumps
    const infoPtrOffset = 0; // 4 bytes: pointer to lump dir (unused for 0 lumps)

    const buffer = new ArrayBuffer(12);
    const view = new DataView(buffer);

    // Write header
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
 * A real implementation would use https://github.com/nsmoooose/doom-wad-js
 * or manually construct proper WAD lumps and directory.
 */
class WADBuilder {
  constructor() {
    this.lumps = [];
  }

  addGallerySpriteData(exhibits) {
    // Placeholder: for each exhibit, create a dummy texture lump
    // named EXHIB001, EXHIB002, etc.
    //
    // In practice, we'd:
    // 1. Convert exhibit.thumbnail (Base64) to PNG binary
    // 2. Shrink to 64x64 or 128x128 DOOM flat size
    // 3. Index to DOOM palette (256 colors)
    // 4. Add as PNAME + TEXTURE lump
    //
    // For MVP, we just log and continue
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
    view.setUint32(4, 0, true);      // numLumps = 0
    view.setUint32(8, 12, true);     // infoPtr (unused)

    return new Uint8Array(buffer);
  }
}
