// ── main.js ───────────────────────────────────────────────────────────────────
// Bootstrap: load gallery → calculate maze size → generate maze → build scene
// → place frames (1 per exhibit) → wire controls/UI.
// ─────────────────────────────────────────────────────────────────────────────

(async function BUNJUMUN_MAZE_95() {

  // ── Progress helper ─────────────────────────────────────────────────────────
  const bar = document.getElementById('loading-bar');
  function progress(pct) { if (bar) bar.style.width = pct + '%'; }

  // ── 1. Load gallery & calculate dynamic maze size ──────────────────────────
  progress(10);
  let gallery = { version: '1.0', title: 'BUNJUMUN-MAZE-95', exhibits: [] };
  try {
    const res = await fetch('./gallery.json');
    if (res.ok) gallery = await res.json();
  } catch (_) { /* offline / first run */ }

  // Dynamic maze sizing: scale based on exhibit count (square-root formula)
  // Formula: ROOMS = 5 + Math.ceil(Math.sqrt(exhibitCount * 30))
  // Rationale: Slower growth than linear preserves spaciousness for large galleries
  // Examples: 1 exhibit → ~10 rooms, 3 exhibits → ~12 rooms, 10 exhibits → ~24 rooms, 20 exhibits → ~29 rooms
  const exhibitCount = gallery.exhibits.length || 0;
  const ROOMS = Math.max(5, 5 + Math.ceil(Math.sqrt(exhibitCount * 30)));

  // ── 2. Generate maze ────────────────────────────────────────────────────────
  progress(25);
  const { grid, width: GW, height: GH } = MazeGen.generate(ROOMS, ROOMS);

  // ── 3. Initialise Three.js engine ───────────────────────────────────────────
  progress(40);
  const canvas = document.getElementById('maze-canvas');
  const engine = new MazeEngine(canvas);
  engine.init(grid, GW, GH);

  // ── 4. Run Curator Algorithm ─────────────────────────────────────────────────
  progress(55);
  const curator = new CuratorAlgorithm(grid, engine.CELL_SIZE);
  const slots   = curator.scan();

  // ── 5. Place frames (ONE per exhibit) ────────────────────────────────────────
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
  const settingsBtn  = document.getElementById('settings-btn');

  // Settings icon click → open admin
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      if (!portal.isOpen) admin.toggle();
    });
  }

  document.addEventListener('keydown', (e) => {
    // E — open nearest exhibit
    if (e.code === 'KeyE' && engine.nearbyExhibit && !portal.isOpen && !admin.isOpen) {
      portal.open(engine.nearbyExhibit);
    }
    // Escape — close admin if open
    if (e.code === 'Escape' && admin.isOpen) {
      admin.close();
    }
    // Tab — toggle minimap
    if (e.code === 'Tab') {
      e.preventDefault();
      engine.toggleMinimap();
    }
  });

  // ── 9. Per-frame update hook ─────────────────────────────────────────────────
  engine.onUpdate = () => {
    controls.update(grid, engine.CELL_SIZE);
    engine.nearbyExhibit = engine.checkNearbyExhibit();
    if (interactHint) interactHint.hidden = !engine.nearbyExhibit;
  };

  // ── 9.5. Exhibit Discovery Guide ──────────────────────────────────────────────
  const guideOverlay = document.getElementById('exhibit-guide');
  const highlightBtn = document.getElementById('guide-highlight');
  const guideNextTitle = document.getElementById('guide-next-title');
  let guideVisited = localStorage.getItem('bunjumun_guide_seen');

  function showGuideOverlay() {
    if (!guideOverlay || guideVisited) return;
    guideOverlay.querySelector('.guide-count').textContent = `${exhibitCount} exhibits · ${exhibitCount} frames`;
    if (engine.nearbyExhibit) {
      guideNextTitle.textContent = engine.nearbyExhibit.title || 'Unknown Exhibit';
    }
    guideOverlay.classList.remove('hidden');
    localStorage.setItem('bunjumun_guide_seen', 'true');
    guideVisited = true;
    setTimeout(() => guideOverlay.classList.add('hidden'), 10000);
  }

  highlightBtn?.addEventListener('click', () => {
    guideOverlay?.classList.add('hidden');
    console.log('Highlight path clicked for nearest exhibit');
  });

  // Show guide on first load
  setTimeout(showGuideOverlay, 2000);

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
    `Frame slots available: ${slots.length} | Exhibits: ${exhibitCount}`,
    'color: #00FF00; font-family: monospace;'
  );

})();
