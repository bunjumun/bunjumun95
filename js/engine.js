// ── MazeEngine ────────────────────────────────────────────────────────────────
// Three.js r128 scene: maze geometry, procedural Win95 textures,
// picture-frame placement, render loop with pause/resume, minimap.
// ─────────────────────────────────────────────────────────────────────────────

class MazeEngine {
  constructor(canvas) {
    this.canvas = canvas;

    // Grid set later via init()
    this.grid   = null;
    this.GRID_W = 0;
    this.GRID_H = 0;

    this.CELL_SIZE   = 4;
    this.WALL_HEIGHT = 3.6;
    this.EYE_HEIGHT  = 1.75;

    this.scene    = null;
    this.camera   = null;
    this.renderer = null;

    this.frameObjects  = [];   // { mesh, exhibit, wx, wz }
    this.nearbyExhibit = null;

    this.minimapCanvas = document.getElementById('minimap');
    this.minimapCtx    = this.minimapCanvas.getContext('2d');
    this.minimapOpen   = false;

    this.rafId  = null;
    this.paused = false;

    // Hook for per-frame logic (set by main.js)
    this.onUpdate = null;
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  init(grid, gridW, gridH) {
    this.grid   = grid;
    this.GRID_W = gridW;
    this.GRID_H = gridH;

    this._setupRenderer();
    this._setupScene();
    this._buildGeometry();
    this._setupLighting();
  }

  start() {
    this._animate();
  }

  pause() {
    this.paused = true;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  resume() {
    if (!this.paused) return;
    this.paused = false;
    this._animate();
  }

  // ── Setup ───────────────────────────────────────────────────────────────────

  _setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas:    this.canvas,
      antialias: false,         // pixelated retro feel
    });
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  _setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    this.scene.fog = new THREE.Fog(0x000000, 6, 38);

    this.camera = new THREE.PerspectiveCamera(
      72,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    // Start at first open cell (grid index 1,1)
    const cs = this.CELL_SIZE;
    this.camera.position.set(
      1 * cs + cs / 2,
      this.EYE_HEIGHT,
      1 * cs + cs / 2
    );

    this.scene.add(this.camera);
  }

  _buildGeometry() {
    const { grid, GRID_W, GRID_H, CELL_SIZE: cs, WALL_HEIGHT: wh, scene } = this;

    // ── Textures ────────────────────────────────────────────────────────────
    const wallTex  = this._makeBrickTexture();
    const floorTex = this._makeFloorTexture();
    const ceilTex  = this._makeCeilingTexture();

    // ── Materials ───────────────────────────────────────────────────────────
    const wallMat  = new THREE.MeshLambertMaterial({ map: wallTex });
    const floorMat = new THREE.MeshLambertMaterial({ map: floorTex });
    const ceilMat  = new THREE.MeshLambertMaterial({ map: ceilTex });

    // ── Floor ───────────────────────────────────────────────────────────────
    const floorGeo = new THREE.PlaneGeometry(GRID_W * cs, GRID_H * cs);
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(GRID_W * cs / 2, 0, GRID_H * cs / 2);
    scene.add(floorMesh);

    // ── Ceiling ─────────────────────────────────────────────────────────────
    const ceilGeo  = new THREE.PlaneGeometry(GRID_W * cs, GRID_H * cs);
    const ceilMesh = new THREE.Mesh(ceilGeo, ceilMat);
    ceilMesh.rotation.x = Math.PI / 2;
    ceilMesh.position.set(GRID_W * cs / 2, wh, GRID_H * cs / 2);
    scene.add(ceilMesh);

    // ── Walls (shared geometry, instanced per wall cell) ────────────────────
    const wallGeo = new THREE.BoxGeometry(cs, wh, cs);
    for (let row = 0; row < GRID_H; row++) {
      for (let col = 0; col < GRID_W; col++) {
        if (grid[row][col] === 1) {
          const m = new THREE.Mesh(wallGeo, wallMat);
          m.position.set(col * cs + cs / 2, wh / 2, row * cs + cs / 2);
          scene.add(m);
        }
      }
    }
  }

  _setupLighting() {
    // Flat ambient (Win95 screensaver had no real lighting)
    const ambient = new THREE.AmbientLight(0xFFFFFF, 0.55);
    this.scene.add(ambient);

    // Subtle warm point following the player
    const playerLight = new THREE.PointLight(0xFFEECC, 0.7, 18);
    this.camera.add(playerLight);
  }

  // ── Procedural Textures ──────────────────────────────────────────────────

  _makeBrickTexture() {
    const S = 256;
    const cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const ctx = cv.getContext('2d');

    const MORTAR_W = 4;
    const BRICK_H  = 22;
    const BRICK_W  = 52;

    // Mortar background with noise
    ctx.fillStyle = '#64534F';
    ctx.fillRect(0, 0, S, S);

    // Draw bricks with varied colors and basic 3D shadow/highlight
    for (let y = 0; y < S + BRICK_H; y += BRICK_H + MORTAR_W) {
      const rowIdx = Math.floor(y / (BRICK_H + MORTAR_W));
      const offset = (rowIdx % 2) * (BRICK_W / 2 + MORTAR_W / 2);
      
      for (let x = -BRICK_W; x < S + BRICK_W; x += BRICK_W + MORTAR_W) {
        // Randomize brick base color slightly
        const r = 160 + Math.random() * 40;
        const g = 90 + Math.random() * 30;
        const b = 70 + Math.random() * 20;
        
        const bx = x + offset + MORTAR_W / 2;
        const by = y + MORTAR_W / 2;
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(bx, by, BRICK_W, BRICK_H);
        
        // Highlights (top, left)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(bx, by, BRICK_W, 2);
        ctx.fillRect(bx, by, 2, BRICK_H);
        
        // Shadows (bottom, right)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(bx, by + BRICK_H - 2, BRICK_W, 2);
        ctx.fillRect(bx + BRICK_W - 2, by, 2, BRICK_H);
      }
    }

    // Heavy noise and grime overlay (Win95 style dithering/noise)
    const id = ctx.getImageData(0, 0, S, S);
    for (let i = 0; i < id.data.length; i += 4) {
      const x = (i / 4) % S;
      const y = Math.floor((i / 4) / S);
      
      // Basic noise
      let n = (Math.random() - 0.5) * 35;
      
      // Grime gradient (darker at bottom)
      const grime = (y / S) * 20;
      
      id.data[i]     = Math.min(255, Math.max(0, id.data[i]     + n - grime));
      id.data[i + 1] = Math.min(255, Math.max(0, id.data[i + 1] + n - grime));
      id.data[i + 2] = Math.min(255, Math.max(0, id.data[i + 2] + n - grime));
    }
    ctx.putImageData(id, 0, 0);

    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 0.9);
    // Performance: nearest filter gives it that crispy retro look
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
  }

  _makeFloorTexture() {
    const S = 256;
    const cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const ctx = cv.getContext('2d');

    // Base concrete color
    ctx.fillStyle = '#484A4D';
    ctx.fillRect(0, 0, S, S);
    
    // Add noise for concrete texture before drawing grid
    const id = ctx.getImageData(0, 0, S, S);
    for (let i = 0; i < id.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 15;
      id.data[i]     = Math.min(255, Math.max(0, id.data[i]     + n));
      id.data[i + 1] = Math.min(255, Math.max(0, id.data[i + 1] + n));
      id.data[i + 2] = Math.min(255, Math.max(0, id.data[i + 2] + n));
    }
    ctx.putImageData(id, 0, 0);

    // Draw grid lines with highlights for depth
    const tileSize = 64;
    for (let i = 0; i <= S; i += tileSize) {
      // Dark line
      ctx.fillStyle = '#2A2C2E';
      ctx.fillRect(i, 0, 2, S); // vertical
      ctx.fillRect(0, i, S, 2); // horizontal
      
      // Light highlight line
      ctx.fillStyle = '#5C5E61';
      ctx.fillRect(i + 2, 0, 1, S); // vertical highlight
      ctx.fillRect(0, i + 2, S, 1); // horizontal highlight
    }
    
    // Add some dirt patches
    for(let p = 0; p < 10; p++) {
      ctx.fillStyle = 'rgba(20, 20, 20, 0.1)';
      ctx.beginPath();
      ctx.arc(Math.random() * S, Math.random() * S, Math.random() * 30 + 10, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(this.GRID_W / 2, this.GRID_H / 2);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
  }

  _makeCeilingTexture() {
    const S = 128; // Increased resolution slightly for panel details
    const cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const ctx = cv.getContext('2d');
    
    // Metal base
    ctx.fillStyle = '#1A1C1A';
    ctx.fillRect(0, 0, S, S);
    
    // Panel grid
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, S - 4, S - 4);
    
    // Industrial grating lines
    ctx.strokeStyle = '#2A2D2A';
    ctx.lineWidth = 1;
    for(let i = 4; i < S; i += 8) {
        ctx.beginPath();
        ctx.moveTo(i, 2);
        ctx.lineTo(i, S - 2);
        ctx.stroke();
    }
    
    // Add heavy noise for industrial feel
    const id = ctx.getImageData(0, 0, S, S);
    for (let i = 0; i < id.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 10;
      id.data[i]     = Math.min(255, Math.max(0, id.data[i]     + n));
      id.data[i + 1] = Math.min(255, Math.max(0, id.data[i + 1] + n));
      id.data[i + 2] = Math.min(255, Math.max(0, id.data[i + 2] + n));
    }
    ctx.putImageData(id, 0, 0);

    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(this.GRID_W / 2, this.GRID_H / 2);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
  }

  // ── Frame Placement ──────────────────────────────────────────────────────

  /**
   * Place 3D picture frames for each slot that has a matching exhibit.
   * @param {object[]} slots   - CuratorAlgorithm output
   * @param {object[]} exhibits - gallery.json exhibits array
   */
  placeFrames(slots, exhibits) {
    const cs  = this.CELL_SIZE;
    const ey  = this.EYE_HEIGHT;

    // Offset frame slightly out from wall face so it protrudes
    const PROTRUDE = 0.06;

    // Frame border material (dark gold)
    const borderMat = new THREE.MeshLambertMaterial({ color: 0x5C4000 });
    // Default panel material (dark screen)
    const defaultPanelMat = new THREE.MeshLambertMaterial({ color: 0x111111 });

    slots.forEach((slot, idx) => {
      const exhibit = exhibits[idx] || null;

      // ── Frame geometry: thin box border + inner panel ──────────────────
      const fw = 1.8;   // frame width
      const fh = 1.4;   // frame height
      const bd = 0.07;  // border depth (protrusion)
      const bt = 0.09;  // border thickness

      // Group to hold all frame pieces
      const group = new THREE.Group();

      // Border pieces (4 bars)
      const hBar = new THREE.Mesh(new THREE.BoxGeometry(fw, bt, bd), borderMat);
      const hBar2 = hBar.clone();
      const vBar  = new THREE.Mesh(new THREE.BoxGeometry(bt, fh - bt * 2, bd), borderMat);
      const vBar2 = vBar.clone();

      hBar.position.y  =  fh / 2 - bt / 2;
      hBar2.position.y = -fh / 2 + bt / 2;
      vBar.position.x  = -fw / 2 + bt / 2;
      vBar2.position.x =  fw / 2 - bt / 2;

      group.add(hBar, hBar2, vBar, vBar2);

      // Inner panel
      const panelMat = exhibit && exhibit.thumbnail
        ? this._makeThumbMat(exhibit.thumbnail)
        : defaultPanelMat;

      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(fw - bt * 2, fh - bt * 2),
        panelMat
      );
      panel.position.z = bd / 2 + 0.01;
      group.add(panel);

      // ── Position & orientation based on facing ─────────────────────────
      const { wx, wz, facing } = slot;
      group.position.y = ey;

      switch (facing) {
        case 'pz':  // south face → player approaches from south, frame faces +Z
          group.position.x = wx;
          group.position.z = wz + PROTRUDE;
          group.rotation.y = 0;
          break;
        case 'nz':  // north face → frame faces -Z
          group.position.x = wx;
          group.position.z = wz - PROTRUDE;
          group.rotation.y = Math.PI;
          break;
        case 'px':  // east face → frame faces +X
          group.position.x = wx + PROTRUDE;
          group.position.z = wz;
          group.rotation.y = -Math.PI / 2;
          break;
        case 'nx':  // west face → frame faces -X
          group.position.x = wx - PROTRUDE;
          group.position.z = wz;
          group.rotation.y = Math.PI / 2;
          break;
      }

      this.scene.add(group);
      this.frameObjects.push({ group, exhibit, wx: group.position.x, wz: group.position.z });
    });
  }

  _makeThumbMat(dataUrl) {
    const img = new Image();
    const tex = new THREE.Texture(img);
    img.onload  = () => { tex.needsUpdate = true; };
    img.src     = dataUrl;
    return new THREE.MeshLambertMaterial({ map: tex });
  }

  // ── Proximity / Interaction ──────────────────────────────────────────────

  /**
   * Returns the nearest exhibit within interaction range, or null.
   * Called every frame by main.js.
   */
  checkNearbyExhibit() {
    const px = this.camera.position.x;
    const pz = this.camera.position.z;
    const RANGE = 4.5;

    let nearest = null;
    let nearestDist = Infinity;

    for (const fo of this.frameObjects) {
      if (!fo.exhibit) continue;
      const dx = fo.wx - px;
      const dz = fo.wz - pz;
      const d  = Math.sqrt(dx * dx + dz * dz);
      if (d < RANGE && d < nearestDist) {
        nearest     = fo.exhibit;
        nearestDist = d;
      }
    }
    return nearest;
  }

  // ── Minimap ──────────────────────────────────────────────────────────────

  toggleMinimap() {
    this.minimapOpen = !this.minimapOpen;
    this.minimapCanvas.style.display = this.minimapOpen ? 'block' : 'none';
    if (this.minimapOpen) this._drawMinimap();
  }

  _drawMinimap() {
    const { grid, GRID_W, GRID_H, minimapCtx: ctx, minimapCanvas: mc } = this;
    const CW = mc.width  / GRID_W;
    const CH = mc.height / GRID_H;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, mc.width, mc.height);

    for (let row = 0; row < GRID_H; row++) {
      for (let col = 0; col < GRID_W; col++) {
        ctx.fillStyle = grid[row][col] === 1 ? '#808080' : '#202020';
        ctx.fillRect(col * CW, row * CH, CW, CH);
      }
    }

    // Frame dots
    for (const fo of this.frameObjects) {
      const mx = (fo.wx / this.CELL_SIZE) * CW;
      const mz = (fo.wz / this.CELL_SIZE) * CH;
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(mx - 1, mz - 1, 3, 3);
    }

    // Player dot
    const pcol = this.camera.position.x / this.CELL_SIZE;
    const prow = this.camera.position.z / this.CELL_SIZE;
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(pcol * CW - 2, prow * CH - 2, 4, 4);
  }

  // ── Render Loop ──────────────────────────────────────────────────────────

  _animate() {
    if (this.paused) return;
    this.rafId = requestAnimationFrame(() => this._animate());

    if (typeof this.onUpdate === 'function') this.onUpdate();
    if (this.minimapOpen) this._drawMinimap();

    this.renderer.render(this.scene, this.camera);
  }
}
