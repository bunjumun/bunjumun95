// ── InputRouter ───────────────────────────────────────────────────────────────
// Centralizes all DOM input events and routes them to the active engine.
// Prevents double-firing between Three.js controls and DOOM's input handler.
// Architecture: zencoder docs/doom-integration/01-architecture-api.md §2
// ─────────────────────────────────────────────────────────────────────────────

class InputRouter {
  constructor(modeManager) {
    this.modeManager  = modeManager;
    this.mazeControls = null;   // FirstPersonControls — set via attach()
    this.doomRaycaster = null;  // DoomRaycaster — set via attach()

    this._bound = {
      keydown:   this._onKeyDown.bind(this),
      keyup:     this._onKeyUp.bind(this),
      mousemove: this._onMouseMove.bind(this),
      click:     this._onClick.bind(this),
    };
  }

  // ── Setup ────────────────────────────────────────────────────────────────────

  attach(mazeControls, doomRaycaster) {
    this.mazeControls  = mazeControls;
    this.doomRaycaster = doomRaycaster;

    document.addEventListener('keydown',   this._bound.keydown);
    document.addEventListener('keyup',     this._bound.keyup);
    document.addEventListener('mousemove', this._bound.mousemove);
    document.addEventListener('click',     this._bound.click);
  }

  detach() {
    document.removeEventListener('keydown',   this._bound.keydown);
    document.removeEventListener('keyup',     this._bound.keyup);
    document.removeEventListener('mousemove', this._bound.mousemove);
    document.removeEventListener('click',     this._bound.click);
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────

  _onKeyDown(e) {
    const mode = this.modeManager.getCurrentMode();
    if (mode === 'transitioning') return;

    // Global keys work in both modes
    if (e.code === 'Tab') {
      e.preventDefault();
      if (mode === 'maze') this.modeManager.mazeEngine?.toggleMinimap();
      return;
    }

    if (mode === 'maze' && this.mazeControls) {
      this.mazeControls._onKeyDown(e);
    }
    // DOOM keydown is handled natively by the DOOM canvas/iframe
  }

  _onKeyUp(e) {
    const mode = this.modeManager.getCurrentMode();
    if (mode === 'transitioning') return;

    if (mode === 'maze' && this.mazeControls) {
      this.mazeControls._onKeyUp(e);
    }
  }

  _onMouseMove(e) {
    const mode = this.modeManager.getCurrentMode();
    if (mode === 'transitioning') return;

    if (mode === 'maze' && this.mazeControls) {
      this.mazeControls._onMouseMove(e);
    }
    // DOOM mousemove handled by DOOM canvas pointer lock
  }

  _onClick(e) {
    const mode = this.modeManager.getCurrentMode();
    if (mode === 'transitioning') return;

    if (mode === 'maze') {
      // Re-acquire maze pointer lock on click if lost
      const maze = document.getElementById('maze-canvas');
      if (maze && document.pointerLockElement !== maze) {
        maze.requestPointerLock();
      }
    }

    if (mode === 'doom' && this.doomRaycaster) {
      // Shoot detection — check if crosshair hits a painting
      this.doomRaycaster.onShoot();
    }
  }
}
