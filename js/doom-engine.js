/**
 * doom-engine.js
 * PrBoom WebAssembly engine bootstrap.
 * Downloads and initializes PrBoom Module, exposes pause/resume/getCanvas.
 */

class DoomEngine {
  constructor(containerEl) {
    this.containerEl = containerEl;
    this.Module = null;
    this.canvas = null;
    this.isReady = false;
    this.isPaused = false;
  }

  /**
   * Initialize PrBoom engine.
   * Downloads doom.js + doom.wasm + doom1.wad from self-hosted doom/ directory.
   */
  async init() {
    return new Promise((resolve, reject) => {
      // Create canvas for DOOM
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'doomCanvas';
      this.canvas.style.display = 'block';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.containerEl.appendChild(this.canvas);

      // PrBoom Module config
      window.Module = {
        canvas: this.canvas,
        TOTAL_MEMORY: 67108864, // 64 MB
        print: (text) => console.log('[PrBoom]', text),
        printErr: (text) => console.error('[PrBoom Error]', text),
        preRun: [
          () => {
            // Inject custom gallery.wad to Emscripten VFS
            // Called before runtime initialization
            if (window.galleryWadData) {
              try {
                FS.mkdir('/doom');
                FS.writeFile('/doom/gallery.wad', window.galleryWadData);
              } catch (e) {
                console.warn('Could not write gallery.wad to VFS:', e);
              }
            }
          }
        ],
        onRuntimeInitialized: () => {
          console.log('[DoomEngine] PrBoom runtime initialized');
          this.isReady = true;
          resolve(this);
        },
        quit: (exitCode) => {
          console.log(`[DoomEngine] PrBoom quit with code ${exitCode}`);
          this.isReady = false;
        }
      };

      // Load PrBoom glue code (doom.js)
      const script = document.createElement('script');
      script.src = 'doom/doom.js';
      script.onerror = () => reject(new Error('Failed to load doom.js'));
      document.body.appendChild(script);
    });
  }

  /**
   * Pause DOOM engine (used when exhibit portal opens).
   */
  pause() {
    if (this.isReady && this.Module && this.Module._SendPause) {
      this.Module._SendPause(1);
      this.isPaused = true;
    }
  }

  /**
   * Resume DOOM engine (used when exhibit portal closes).
   */
  resume() {
    if (this.isReady && this.Module && this.Module._SendPause) {
      this.Module._SendPause(0);
      this.isPaused = false;
    }
  }

  /**
   * Get DOOM canvas element.
   */
  getCanvas() {
    return this.canvas;
  }

  /**
   * Update joystick/input state (for gamepad support).
   * Values: x (-100 to 100), y (-100 to 100), buttons bitmask.
   */
  updateInput(x, y, buttons) {
    if (this.isReady && this.Module && this.Module._UpdateJoystick) {
      this.Module._UpdateJoystick(x, y, buttons);
    }
  }
}
