// ── main.js ───────────────────────────────────────────────────────────────────
// Bootstrap: generate maze → build scene → place frames → wire controls/UI.
// ─────────────────────────────────────────────────────────────────────────────

(async function BUNJUMUN_MAZE_95() {

  // ── Progress helper ─────────────────────────────────────────────────────────
  const bar = document.getElementById('loading-bar');
  function progress(pct) { if (bar) bar.style.width = pct + '%'; }

  // ── 1. Generate maze ────────────────────────────────────────────────────────
  progress(10);
  const ROOMS = 13;   // 13×13 rooms → 27×27 grid
  const { grid, width: GW, height: GH } = MazeGen.generate(ROOMS, ROOMS);

  // ── 2. Initialise Three.js engine ───────────────────────────────────────────
  progress(25);
  const canvas = document.getElementById('maze-canvas');
  const engine = new MazeEngine(canvas);
  engine.init(grid, GW, GH);

  // ── 3. Run Curator Algorithm ─────────────────────────────────────────────────
  progress(40);
  const curator = new CuratorAlgorithm(grid, engine.CELL_SIZE);
  const slots   = curator.scan();

  // ── 4. Load gallery.json ────────────────────────────────────────────────────
  progress(55);
  let gallery = { version: '1.0', title: 'BUNJUMUN-MAZE-95', exhibits: [] };
  try {
    const res = await fetch('./gallery.json');
    if (res.ok) gallery = await res.json();
  } catch (_) { /* offline / first run */ }

  // ── 5. Place frames ─────────────────────────────────────────────────────────
  progress(70);
  engine.placeFrames(slots, gallery.exhibits);

  // ── 6. Controls ─────────────────────────────────────────────────────────────
  progress(80);
  const controls = new FirstPersonControls(engine.camera, canvas);

  // ── 7. Exhibit portal & Admin console ───────────────────────────────────────
  progress(88);
  const portal = new ExhibitPortal(document.getElementById('exhibit-host'), engine);
  const admin  = new AdminConsole(document.getElementById('admin-host'), engine, portal);

  // ── 8. HUD / interaction wiring ─────────────────────────────────────────────
  progress(94);
  const interactHint = document.getElementById('interact-hint');

  document.addEventListener('keydown', (e) => {
    // E — open nearest exhibit
    if (e.code === 'KeyE' && engine.nearbyExhibit && !portal.isOpen && !admin.isOpen) {
      portal.open(engine.nearbyExhibit);
    }
    // A — toggle admin console
    if (e.code === 'KeyA' && !portal.isOpen) {
      admin.toggle();
    }
    // Tab — toggle minimap
    if (e.code === 'Tab') {
      e.preventDefault();
      engine.toggleMinimap();
    }
    // Escape — close admin if open
    if (e.code === 'Escape' && admin.isOpen) {
      admin.close();
    }
  });

  // ── 9. Per-frame update hook ─────────────────────────────────────────────────
  engine.onUpdate = () => {
    controls.update(grid, engine.CELL_SIZE);
    engine.nearbyExhibit = engine.checkNearbyExhibit();
    if (interactHint) interactHint.hidden = !engine.nearbyExhibit;
  };

  // ── 10. Pointer-lock overlay ─────────────────────────────────────────────────
  const lockOverlay = document.getElementById('lock-overlay');

  document.addEventListener('pointerlockchange', () => {
    const locked = !!document.pointerLockElement;
    if (lockOverlay) lockOverlay.classList.toggle('hidden', locked);
  });

  // Click-to-lock on overlay
  lockOverlay?.addEventListener('click', () => {
    canvas.requestPointerLock();
  });

  // ── 11. Start render loop ────────────────────────────────────────────────────
  progress(100);
  engine.start();

  // Hide loading screen
  const loading = document.getElementById('loading');
  if (loading) {
    loading.style.transition = 'opacity 0.4s';
    loading.style.opacity    = '0';
    setTimeout(() => { loading.style.display = 'none'; }, 420);
  }

  console.log(
    `%cBUNJUMUN-MAZE-95 loaded.\n` +
    `Maze: ${ROOMS}×${ROOMS} rooms | ${GW}×${GH} grid\n` +
    `Frame slots: ${slots.length} | Exhibits loaded: ${gallery.exhibits.length}`,
    'color: #00FF00; font-family: monospace;'
  );

})();
