// ── CuratorAlgorithm ─────────────────────────────────────────────────────────
// The Rig:
//   Scanner  – traverses grid rows & columns for wall runs >= MIN_RUN cells.
//   Anchor   – places a frame slot at runStart + 1 of each valid segment.
//   Buffer   – enforces a 5-unit 3D Dead Zone between placed slots.
//
// A "valid" run must have at least one adjacent open corridor cell so the
// frame is visible to the player.
// ─────────────────────────────────────────────────────────────────────────────

class CuratorAlgorithm {
  constructor(grid, cellSize) {
    this.grid = grid;
    this.H    = grid.length;
    this.W    = grid[0].length;
    this.cellSize  = cellSize;
    this.MIN_RUN   = 3;
    this.DEAD_ZONE = 5;   // 3D units
  }

  // ── Public ─────────────────────────────────────────────────────────────────

  /** Returns array of frame slot descriptors sorted by 3D position. */
  scan() {
    const raw = [
      ...this._scanHorizontal(),
      ...this._scanVertical(),
    ];
    return this._applyDeadZone(raw);
  }

  // ── Private ────────────────────────────────────────────────────────────────

  /**
   * Scan each row for horizontal wall runs.
   * Yields slots where the frame faces north (+Z) or south (-Z) toward
   * whichever corridor side is open.
   */
  _scanHorizontal() {
    const slots = [];
    const { grid, H, W, MIN_RUN } = this;

    for (let row = 0; row < H; row++) {
      let runStart = -1;
      let runLen   = 0;
      let facing   = null;   // 'pz' (+Z, south) or 'nz' (-Z, north)

      for (let col = 0; col <= W; col++) {
        const isWall = col < W && grid[row][col] === 1;

        if (isWall) {
          // Determine which side has an open corridor
          const northOpen = row > 0     && grid[row - 1][col] === 0;
          const southOpen = row < H - 1 && grid[row + 1][col] === 0;

          if (northOpen || southOpen) {
            if (runStart === -1) {
              runStart = col;
              facing   = northOpen ? 'nz' : 'pz';
            }
            runLen++;
            continue;
          }
        }

        // End of run (or non-qualifying wall)
        if (runLen >= MIN_RUN) {
          const anchorCol = runStart + 1;
          // World position of slot centre
          const wx = anchorCol * this.cellSize + this.cellSize / 2;
          const wz = row      * this.cellSize + this.cellSize / 2;
          const wallFaceZ = facing === 'pz'
            ? (row + 1) * this.cellSize   // south face
            : row       * this.cellSize;  // north face

          slots.push({ wx, wz: wallFaceZ, facing, gridRow: row, gridCol: anchorCol });
        }

        runStart = -1;
        runLen   = 0;
        facing   = null;
      }
    }

    return slots;
  }

  /**
   * Scan each column for vertical wall runs.
   * Yields slots facing east (+X) or west (-X).
   */
  _scanVertical() {
    const slots = [];
    const { grid, H, W, MIN_RUN } = this;

    for (let col = 0; col < W; col++) {
      let runStart = -1;
      let runLen   = 0;
      let facing   = null;   // 'px' (+X, east) or 'nx' (-X, west)

      for (let row = 0; row <= H; row++) {
        const isWall = row < H && grid[row][col] === 1;

        if (isWall) {
          const westOpen = col > 0     && grid[row][col - 1] === 0;
          const eastOpen = col < W - 1 && grid[row][col + 1] === 0;

          if (westOpen || eastOpen) {
            if (runStart === -1) {
              runStart = row;
              facing   = westOpen ? 'nx' : 'px';
            }
            runLen++;
            continue;
          }
        }

        if (runLen >= MIN_RUN) {
          const anchorRow = runStart + 1;
          const wx = col      * this.cellSize + this.cellSize / 2;
          const wz = anchorRow * this.cellSize + this.cellSize / 2;
          const wallFaceX = facing === 'px'
            ? (col + 1) * this.cellSize
            : col       * this.cellSize;

          slots.push({ wx: wallFaceX, wz, facing, gridRow: anchorRow, gridCol: col });
        }

        runStart = -1;
        runLen   = 0;
        facing   = null;
      }
    }

    return slots;
  }

  /** 
   * Remove slots that fall within DEAD_ZONE units of an already-kept slot.
   * 
   * Math & Performance Rationale:
   * 1. DEAD_ZONE = 5: With a CELL_SIZE of 4 and frame width of 1.8, a 5-unit distance 
   *    guarantees frames are at least 1.25 cells apart. This leaves ~3.2 units between 
   *    frame centers (1.4 units of physical gap), preventing visual clutter and 
   *    overlapping interactable areas.
   * 2. Distance from frame center vs wall face: We use center-to-center distance since 
   *    frames protrude minimally (0.06 units).
   * 3. Performance: We use squared distance comparison (dx*dx + dz*dz < DEAD_ZONE^2) 
   *    to avoid the expensive Math.sqrt() operation in the inner loop. 
   *    While this is O(n^2), max slots N is small (typically < 100), making this O(N^2) 
   *    check negligible. A spatial hash/quadtree is unnecessary overhead for this scale.
   */
  _applyDeadZone(slots) {
    const kept = [];
    const deadZoneSq = this.DEAD_ZONE * this.DEAD_ZONE;
    for (const slot of slots) {
      const tooClose = kept.some(k => {
        const dx = slot.wx - k.wx;
        const dz = slot.wz - k.wz;
        return (dx * dx + dz * dz) < deadZoneSq;
      });
      if (!tooClose) kept.push(slot);
    }
    return kept;
  }
}
