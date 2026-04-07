// ── DoomLoader ────────────────────────────────────────────────────────────────
// Lazy-loads the jsZDoom WASM engine after the maze is running.
// Uses the hosted WebDOOM at azazeln28.neocities.org as the DOOM source.
// Architecture: zencoder docs/doom-integration/03-performance-ux.md §1
// ─────────────────────────────────────────────────────────────────────────────

class DoomLoader {
  constructor(doomCanvas, audioManager) {
    this.canvas       = doomCanvas;
    this.audioManager = audioManager;

    this.loaded  = false;
    this.paused  = false;
    this._promise = null;

    // jsZDoom postMessage interface (iframe strategy)
    this._iframe = null;
  }

  // ── Load ─────────────────────────────────────────────────────────────────────

  load() {
    if (this._promise) return this._promise;

    this._promise = new Promise((resolve, reject) => {
      // Strategy: load WebDOOM in an iframe (avoids WASM hosting requirements)
      const iframe = document.createElement('iframe');
      iframe.id     = 'doom-iframe';
      iframe.src    = 'https://azazeln28.neocities.org/games/doom';
      iframe.allow  = 'autoplay; pointer-lock; fullscreen';
      iframe.style.cssText = `
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        border: none;
        background: black;
        z-index: 20;
      `;

      // Listen for iframe load completion
      iframe.onload = () => {
        this.loaded  = true;
        this._iframe = iframe;

        // Wire audio context to iframe (best-effort; cross-origin may block)
        try {
          this.audioManager.resumeContext();
        } catch (_) {}

        resolve();
      };

      iframe.onerror = () => reject(new Error('Failed to load DOOM iframe'));

      // Insert into doom-container
      const container = document.getElementById('doom-container');
      if (!container) return reject(new Error('doom-container not found in DOM'));
      container.appendChild(iframe);
    });

    return this._promise;
  }

  // ── Pause / Resume ───────────────────────────────────────────────────────────

  pause() {
    if (!this._iframe) return;
    this.paused = true;
    // Best-effort postMessage to DOOM iframe
    try {
      this._iframe.contentWindow?.postMessage({ type: 'DOOM_PAUSE' }, '*');
    } catch (_) {}
  }

  resume() {
    if (!this._iframe) return;
    this.paused = false;
    try {
      this._iframe.contentWindow?.postMessage({ type: 'DOOM_RESUME' }, '*');
    } catch (_) {}
  }

  // ── Progress ─────────────────────────────────────────────────────────────────

  updateProgress(pct) {
    const bar = document.getElementById('doom-progress');
    if (bar) bar.value = pct;
  }
}
