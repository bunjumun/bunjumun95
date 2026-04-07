// ── FirstPersonControls ───────────────────────────────────────────────────────
// Free-mouse FPS look — NO pointer lock required.
// Mouse moving over the canvas rotates the camera.
// UI elements (settings btn, menus) remain fully clickable at all times.
// WASD/Arrow keys move the player with AABB wall-sliding collision.
// ─────────────────────────────────────────────────────────────────────────────

class FirstPersonControls {
  constructor(camera, domElement) {
    this.camera     = camera;
    this.domElement = domElement;

    this.euler       = new THREE.Euler(0, 0, 0, 'YXZ');
    this.sensitivity = 0.0022;
    this.speed       = 0.07;
    this.RADIUS      = 0.35;

    this.keys    = {};
    this.active  = false;   // true while mouse is over canvas
    this._lastX  = null;
    this._lastY  = null;

    this._onKeyDown   = this._onKeyDown.bind(this);
    this._onKeyUp     = this._onKeyUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onEnter     = this._onEnter.bind(this);
    this._onLeave     = this._onLeave.bind(this);

    this._attachListeners();
  }

  // ── Listeners ───────────────────────────────────────────────────────────────

  _attachListeners() {
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup',   this._onKeyUp);

    // Look only while mouse is over the canvas
    this.domElement.addEventListener('mousemove',  this._onMouseMove);
    this.domElement.addEventListener('mouseenter', this._onEnter);
    this.domElement.addEventListener('mouseleave', this._onLeave);
  }

  _onKeyDown(e) { this.keys[e.code] = true; }
  _onKeyUp(e)   { this.keys[e.code] = false; }

  _onEnter() {
    this.active = true;
    this._lastX = null;
    this._lastY = null;
  }

  _onLeave() {
    this.active = false;
    this._lastX = null;
    this._lastY = null;
  }

  _onMouseMove(e) {
    if (!this.active) return;

    // First move after entering — no delta yet
    if (this._lastX === null) {
      this._lastX = e.clientX;
      this._lastY = e.clientY;
      return;
    }

    const dx = e.clientX - this._lastX;
    const dy = e.clientY - this._lastY;
    this._lastX = e.clientX;
    this._lastY = e.clientY;

    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y -= dx * this.sensitivity;
    this.euler.x -= dy * this.sensitivity;
    this.euler.x  = Math.max(-Math.PI * 0.48, Math.min(Math.PI * 0.48, this.euler.x));
    this.camera.quaternion.setFromEuler(this.euler);
  }

  // ── Per-frame Update ─────────────────────────────────────────────────────────

  update(grid, cs) {
    const fwd   = new THREE.Vector3();
    const right = new THREE.Vector3();
    this.camera.getWorldDirection(fwd);
    fwd.y = 0;
    fwd.normalize();
    right.crossVectors(fwd, new THREE.Vector3(0, 1, 0));

    let dx = 0, dz = 0;

    if (this.keys['KeyW']     || this.keys['ArrowUp'])    { dx += fwd.x;   dz += fwd.z; }
    if (this.keys['KeyS']     || this.keys['ArrowDown'])  { dx -= fwd.x;   dz -= fwd.z; }
    if (this.keys['KeyA']     || this.keys['ArrowLeft'])  { dx -= right.x; dz -= right.z; }
    if (this.keys['KeyD']     || this.keys['ArrowRight']) { dx += right.x; dz += right.z; }

    const len = Math.sqrt(dx * dx + dz * dz);
    if (len < 0.001) return;
    dx = (dx / len) * this.speed;
    dz = (dz / len) * this.speed;

    const pos = this.camera.position;
    if (!this._wallCheck(grid, cs, pos.x + dx, pos.z)) pos.x += dx;
    if (!this._wallCheck(grid, cs, pos.x,       pos.z + dz)) pos.z += dz;
  }

  _wallCheck(grid, cs, x, z) {
    const r = this.RADIUS;
    const corners = [
      [x - r, z - r], [x + r, z - r],
      [x - r, z + r], [x + r, z + r],
    ];
    for (const [cx, cz] of corners) {
      const col = Math.floor(cx / cs);
      const row = Math.floor(cz / cs);
      if (row < 0 || col < 0 || row >= grid.length || col >= grid[0].length) return true;
      if (grid[row][col] === 1) return true;
    }
    return false;
  }
}
