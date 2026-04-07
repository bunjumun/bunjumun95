// ── MazeGen ──────────────────────────────────────────────────────────────────
// Recursive Backtracker maze generator.
//
// Grid encoding:
//   1 = solid wall
//   0 = open passage
//
// Grid dimensions: (2 * rooms + 1) × (2 * rooms + 1)
// Room cells sit at odd indices; wall/passage cells sit at even indices.
// ─────────────────────────────────────────────────────────────────────────────

const MazeGen = (() => {

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Generate a perfect maze.
   * @param {number} roomsWide  - Number of rooms across (columns).
   * @param {number} roomsHigh  - Number of rooms down (rows).
   * @returns {{ grid: number[][], width: number, height: number }}
   */
  function generate(roomsWide, roomsHigh) {
    const W = roomsWide * 2 + 1;
    const H = roomsHigh * 2 + 1;

    // Start fully walled
    const grid = Array.from({ length: H }, () => new Array(W).fill(1));

    const visited = Array.from({ length: roomsHigh }, () =>
      new Array(roomsWide).fill(false)
    );

    // Carve starting from room (0, 0)
    carve(0, 0, grid, visited, roomsWide, roomsHigh);

    // Guarantee entrance / exit openings in outer border
    grid[1][0] = 0;                     // west entrance
    grid[H - 2][W - 1] = 0;            // east exit

    return { grid, width: W, height: H };
  }

  function carve(rx, ry, grid, visited, roomsWide, roomsHigh) {
    visited[ry][rx] = true;

    // Room cell in grid coords
    const gx = rx * 2 + 1;
    const gy = ry * 2 + 1;
    grid[gy][gx] = 0;

    const DIRS = shuffle([
      [ 0, -1],   // north
      [ 0,  1],   // south
      [-1,  0],   // west
      [ 1,  0],   // east
    ]);

    for (const [dx, dy] of DIRS) {
      const nx = rx + dx;
      const ny = ry + dy;
      if (nx >= 0 && nx < roomsWide && ny >= 0 && ny < roomsHigh && !visited[ny][nx]) {
        // Knock out the wall between current room and neighbour
        grid[gy + dy][gx + dx] = 0;
        carve(nx, ny, grid, visited, roomsWide, roomsHigh);
      }
    }
  }

  return { generate };
})();
