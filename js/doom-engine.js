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
    this.isPointerLocked = false;
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
        TOTAL_MEMORY: 268435456, // 256 MB (WASM requires 4096 pages × 64KB)
        print: (text) => console.log('[PrBoom]', text),
        printErr: (text) => console.error('[PrBoom Error]', text),
        arguments: ['-iwad', 'doom1.wad', '-file', '/doom/gallery.wad', '-warp', '1', '1'],
        arguments: ['-iwad', 'doom1.wad', '-file', '/doom/gallery.wad', '-warp', '1', '1'],
        locateFile: (path) => {
          if (path === 'doom1.wasm') return 'doom/doom.wasm';
          if (path === 'doom1.data') return 'doom/web/doom1.data';
          return `doom/${path}`;
        },
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
          // Emscripten resets canvas styles after init — re-apply with delays
          this._fitCanvas();
          setTimeout(() => this._fitCanvas(), 100);
          setTimeout(() => this._fitCanvas(), 500);
          window.addEventListener('resize', () => this._fitCanvas());
          this._setupPointerLock();
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
   * Set up pointer lock on the DOOM canvas.
   * PrBoom's SDL2 Emscripten layer uses e.movementX/Y for mouse look,
   * which only works correctly when pointer lock is active.
   * Without pointer lock the mouse is bounded by the viewport edge —
   * the player cannot turn more than one screen-width before running out of space.
   */
  _setupPointerLock() {
    const canvas = this.canvas;

    // Click the canvas → acquire pointer lock (required for infinite mouse deltas)
    canvas.addEventListener('click', () => {
      if (document.pointerLockElement !== canvas) {
        canvas.requestPointerLock();
      }
    });

    // Track lock state so main.js can show/hide the "click to play" hint
    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === canvas;
      canvas.dispatchEvent(new CustomEvent('doom:pointerlockchange', {
        bubbles: true,
        detail: { locked: this.isPointerLocked }
      }));
    });

    // Some browsers emit pointerlockerror — log it so we can debug
    document.addEventListener('pointerlockerror', () => {
      console.warn('[DoomEngine] Pointer lock request denied by browser');
    });
  }

  /**
   * Release pointer lock (call before opening admin/menus).
   */
  exitPointerLock() {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  /**
   * Request pointer lock (call to re-enter game from admin).
   */
  requestPointerLock() {
    if (this.canvas && document.pointerLockElement !== this.canvas) {
      this.canvas.requestPointerLock();
    }
  }

  /**
   * Scale canvas to fill container, preserving 4:3 aspect ratio.
   */
  _fitCanvas() {
    if (!this.canvas || !this.containerEl) return;
    const cw = this.containerEl.clientWidth;
    const ch = this.containerEl.clientHeight;
    const aspect = 4 / 3;
    let w = cw, h = cw / aspect;
    if (h > ch) { h = ch; w = ch * aspect; }
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = ((cw - w) / 2) + 'px';
    this.canvas.style.top = ((ch - h) / 2) + 'px';
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
