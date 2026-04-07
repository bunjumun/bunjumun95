// ── FirstPersonControls ───────────────────────────────────────────────────────
// Pointer-lock mouse look + WASD/Arrow key movement with AABB collision.
// X and Z axes are resolved independently to allow wall-sliding.
// ─────────────────────────────────────────────────────────────────────────────

class FirstPersonControls {
  constructor(camera, domElement) {
    this.camera     = camera;
    this.domElement = domElement;
    this.isLocked   = false;

    this.euler       = new THREE.Euler(0, 0, 0, 'YXZ');
    this.sensitivity = 0.0018;
    this.speed       = 0.07;
    this.RADIUS      = 0.35;   // player collision radius (world units)

    this.keys = {};

    this._onKeyDown   = this._onKeyDown.bind(this);
    this._onKeyUp     = this._onKeyUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onLockChange = this._onLockChange.bind(this);

    this._attachListeners();
  }

  // ── Listeners ───────────────────────────────────────────────────────────────

  _attachListeners() {
    document.addEventListener('keydown',          this._onKeyDown);
    document.addEventListener('keyup',            this._onKeyUp);
    document.addEventListener('mousemove',        this._onMouseMove);
    document.addEventListener('pointerlockchange', this._onLockChange);

    this.domElement.addEventListener('click', () => {
      if (!this.isLocked) this.domElement.requestPointerLock();
    });
  }

  _onKeyDown(e) { this.keys[e.code] = true; }
  _onKeyUp(e)   { this.keys[e.code] = false; }

  _onMouseMove(e) {
    if (!this.isLocked) return;
    this.euler.setFromQuaternion(this.camera.quaternion);
    this.euler.y -= e.movementX * this.sensitivity;
    this.euler.x -= e.movementY * this.sensitivity;
    this.euler.x  = Math.max(-Math.PI * 0.48, Math.min(Math.PI * 0.48, this.euler.x));
    this.camera.quaternion.setFromEuler(this.euler);
  }

  _onLockChange() {
    this.isLocked = document.pointerLockElement === this.domElement;
  }

  // ── Per-frame Update ─────────────────────────────────────────────────────────

  /**
   * @param {number[][]} grid    - maze grid (1=wall, 0=open)
   * @param {number}     cs      - CELL_SIZE
   */
  update(grid, cs) {
    if (!this.isLocked) return;

    // Build movement vector in camera-local XZ
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

    // Normalise diagonal movement
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len < 0.001) return;
    dx = (dx / len) * this.speed;
    dz = (dz / len) * this.speed;

    const pos = this.camera.position;

    // Resolve X and Z independently (wall-sliding)
    if (!this._wallCheck(grid, cs, pos.x + dx, pos.z)) pos.x += dx;
    if (!this._wallCheck(grid, cs, pos.x,       pos.z + dz)) pos.z += dz;
  }

  /**
   * Returns true if a circle of RADIUS at (x, z) overlaps any wall cell.
   */
  _wallCheck(grid, cs, x, z) {
    const r = this.RADIUS;
    const corners = [
      [x - r, z - r],
      [x + r, z - r],
      [x - r, z + r],
      [x + r, z + r],
    ];
    for (const [cx, cz] of corners) {
      const col = Math.floor(cx / cs);
      const row = Math.floor(cz / cs);
      if (row < 0 || col < 0 || row >= grid.length || col >= grid[0].length) return true;
      if (grid[row][col] === 1) return true;
    }
    return false;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  lock()   { this.domElement.requestPointerLock(); }
  unlock() { document.exitPointerLock(); }
}
