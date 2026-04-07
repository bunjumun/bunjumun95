// ── GameModeManager ───────────────────────────────────────────────────────────
// State machine managing transitions between Maze (Three.js) and DOOM modes.
// Architecture: zencoder docs/doom-integration/01-architecture-api.md §1
//
// States: 'maze' | 'doom' | 'transitioning'
// ─────────────────────────────────────────────────────────────────────────────

class GameModeManager {
  constructor(mazeEngine, audioManager) {
    this.mazeEngine   = mazeEngine;
    this.audioManager = audioManager;
    this.doomLoader   = null;   // set after construction

    this.currentMode  = 'maze';
    this._listeners   = [];

    // Canvas references (set in init)
    this.mazeCanvas   = null;
    this.doomCanvas   = null;
  }

  init(mazeCanvas, doomCanvas, doomLoader) {
    this.mazeCanvas = mazeCanvas;
    this.doomCanvas = doomCanvas;
    this.doomLoader = doomLoader;

    // Start with maze active
    this._setCanvasMode('maze');
  }

  getCurrentMode() { return this.currentMode; }

  onModeChange(cb) { this._listeners.push(cb); }

  _emit(mode) {
    this._listeners.forEach(cb => cb(mode));
  }

  // ── Maze → DOOM ─────────────────────────────────────────────────────────────

  async switchToDoom() {
    if (this.currentMode !== 'maze') return;
    this.currentMode = 'transitioning';
    this._emit('transitioning');

    // Save maze player position
    this._savedMazePos = this.mazeEngine.camera.position.clone();

    // Pause maze
    this.mazeEngine.pause();
    document.exitPointerLock();

    // Show DOOM loading UI
    this._showDoomLoading(true);

    try {
      await this.doomLoader.load();
    } catch (err) {
      console.error('DOOM load failed, falling back to maze:', err);
      this._showDoomLoading(false);
      await this.switchToMaze();
      return;
    }

    this._showDoomLoading(false);

    // Crossfade audio
    this.audioManager.crossfade('maze', 'doom', 0.5);

    // Crossfade canvases
    await this._fadeCanvas('doom', 500);

    this.currentMode = 'doom';
    this._emit('doom');

    // Request pointer lock on DOOM canvas after user gesture
    setTimeout(() => this.doomCanvas?.requestPointerLock(), 150);
  }

  // ── DOOM → Maze ─────────────────────────────────────────────────────────────

  async switchToMaze() {
    if (this.currentMode === 'maze') return;
    this.currentMode = 'transitioning';
    this._emit('transitioning');

    document.exitPointerLock();

    // Pause DOOM
    this.doomLoader?.pause();

    // Crossfade audio
    this.audioManager.crossfade('doom', 'maze', 0.5);

    // Crossfade canvases
    await this._fadeCanvas('maze', 500);

    // Resume maze & restore position
    if (this._savedMazePos) {
      this.mazeEngine.camera.position.copy(this._savedMazePos);
    }
    this.mazeEngine.resume();

    this.currentMode = 'maze';
    this._emit('maze');
  }

  // ── Canvas Helpers ───────────────────────────────────────────────────────────

  _setCanvasMode(mode) {
    if (!this.mazeCanvas || !this.doomCanvas) return;

    if (mode === 'maze') {
      this.mazeCanvas.classList.add('canvas-active');
      this.mazeCanvas.classList.remove('canvas-hidden');
      this.doomCanvas.classList.add('canvas-hidden');
      this.doomCanvas.classList.remove('canvas-active');
    } else {
      this.doomCanvas.classList.add('canvas-active');
      this.doomCanvas.classList.remove('canvas-hidden');
      this.mazeCanvas.classList.add('canvas-hidden');
      this.mazeCanvas.classList.remove('canvas-active');
    }
  }

  _fadeCanvas(toMode, durationMs) {
    return new Promise(resolve => {
      this._setCanvasMode(toMode);
      setTimeout(resolve, durationMs);
    });
  }

  // ── Loading UI ───────────────────────────────────────────────────────────────

  _showDoomLoading(show) {
    let el = document.getElementById('doom-loading');
    if (!el) {
      el = document.createElement('div');
      el.id = 'doom-loading';
      el.innerHTML = `
        <div class="doom-load-inner">
          <div class="doom-spinner"></div>
          <div class="doom-load-text">LOADING DOOM.EXE...</div>
          <progress id="doom-progress" value="0" max="100"></progress>
        </div>
      `;
      document.body.appendChild(el);
    }
    el.style.display = show ? 'flex' : 'none';
  }

  dispose() {
    this._listeners = [];
  }
}
