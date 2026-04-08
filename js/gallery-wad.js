/**
 * gallery-wad.js
 * Fetches the pre-built gallery.wad from the server and injects it into
 * PrBoom's Emscripten VFS before engine init.
 */

class GalleryWAD {
  constructor(gallery) {
    this.gallery = gallery;
    this.wadData = null;
  }

  /**
   * Fetch the pre-built gallery.wad from the server.
   * Falls back to a minimal stub if the fetch fails.
   */
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

  /**
   * Write WAD data to Emscripten VFS.
   * Sets window.galleryWadData so doom-engine.js preRun can inject it.
   */
  async writeToFS() {
    if (!this.wadData) {
      await this.generate();
    }
    window.galleryWadData = this.wadData;
    console.log('[GalleryWAD] WAD staged for VFS injection (size:', this.wadData.byteLength, 'bytes)');
  }
}
