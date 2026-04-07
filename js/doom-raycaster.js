// ── DoomRaycaster ─────────────────────────────────────────────────────────────
// Detects when the player "shoots" a painting in DOOM mode by raycasting
// against the existing Maze scene frame meshes from the DOOM camera position.
// Architecture: zencoder docs/doom-integration/02-interactivity-maps.md §1
// ─────────────────────────────────────────────────────────────────────────────

class DoomRaycaster {
  constructor(mazeEngine, portal, modeManager) {
    this.mazeEngine  = mazeEngine;
    this.portal      = portal;
    this.modeManager = modeManager;

    // Raycaster always fires from crosshair center
    this.raycaster = new THREE.Raycaster();
    this.center    = new THREE.Vector2(0, 0);

    // Hidden camera tracks DOOM player position
    this.doomCamera = new THREE.PerspectiveCamera(
      90,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
  }

  // ── Called on every click in DOOM mode ───────────────────────────────────────

  onShoot() {
    if (this.modeManager.getCurrentMode() !== 'doom') return;
    if (this.portal.isOpen) return;

    // Sync hidden camera to DOOM player transform
    this._syncCamera();

    // Raycast against all frame meshes
    const frames = this.mazeEngine.frameObjects;
    const meshes = frames.flatMap(fo => {
      // Collect all child meshes from each frame group
      const children = [];
      fo.group?.traverse(child => {
        if (child.isMesh) children.push(child);
      });
      return children;
    });

    this.raycaster.setFromCamera(this.center, this.doomCamera);
    const hits = this.raycaster.intersectObjects(meshes, false);

    if (hits.length > 0 && hits[0].distance < 50) {
      // Find which frame object was hit
      const hitMesh = hits[0].object;
      const frame   = frames.find(fo => {
        let found = false;
        fo.group?.traverse(c => { if (c === hitMesh) found = true; });
        return found;
      });

      if (frame?.exhibit) {
        this._openExhibit(frame.exhibit);
      }
    }
  }

  // ── Sync hidden camera to DOOM iframe's player position ──────────────────────
  // Since the DOOM iframe is cross-origin we can't read WASM memory directly.
  // We approximate by keeping the doomCamera at the maze's last known position.
  // When full jsZDoom integration is available, this is replaced with real sync.

  _syncCamera() {
    // Copy maze camera transform as best-effort proxy for DOOM player position
    this.doomCamera.position.copy(this.mazeEngine.camera.position);
    this.doomCamera.quaternion.copy(this.mazeEngine.camera.quaternion);
  }

  // ── Trigger exhibit portal ───────────────────────────────────────────────────

  _openExhibit(exhibit) {
    // Pause DOOM loader before opening portal
    // Portal close handler will resume it
    this.modeManager.doomLoader?.pause();
    this.portal.open(exhibit);

    // Override portal close to resume DOOM instead of maze
    const origClose = this.portal.close.bind(this.portal);
    this.portal.close = () => {
      origClose();
      this.portal.close = origClose;   // restore
      this.modeManager.doomLoader?.resume();
      setTimeout(() => {
        document.getElementById('doom-container')
          ?.querySelector('iframe, canvas')
          ?.requestPointerLock();
      }, 150);
    };
  }
}
