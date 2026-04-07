// ── main.js ───────────────────────────────────────────────────────────────────
// Bootstrap: mode selector → load gallery → maze size → generate maze →
// build scene → place frames → wire controls/UI/DOOM systems.
// ─────────────────────────────────────────────────────────────────────────────

(async function BUNJUMUN_MAZE_95() {

  // ── Progress helper ─────────────────────────────────────────────────────────
  const bar = document.getElementById('loading-bar');
  function progress(pct) { if (bar) bar.style.width = pct + '%'; }

  // ── 0. Mode Selector ────────────────────────────────────────────────────────
  const selectedMode = await showModeSelector();

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

  // ── 7.5. DOOM systems (lazy — only wired, not loaded yet) ───────────────────
  const audioMgr   = new AudioManager();
  const modeMgr    = new GameModeManager(engine, audioMgr);
  const doomLoader = new DoomLoader(document.getElementById('doom-container'), audioMgr);
  const doomRay    = new DoomRaycaster(engine, portal, modeMgr);
  const inputRouter = new InputRouter(modeMgr);

  const mazeCanvas = document.getElementById('maze-canvas');
  const doomContainer = document.getElementById('doom-container');
  modeMgr.init(mazeCanvas, doomContainer, doomLoader);
  inputRouter.attach(controls, doomRay);

  // DOOM exit button → return to maze
  document.getElementById('doom-exit-btn')?.addEventListener('click', () => {
    modeMgr.switchToMaze();
    document.getElementById('doom-hud').classList.add('canvas-hidden');
  });

  // Update DOOM score counter when exhibits are opened
  const totalExhibits = gallery.exhibits.length;
  let viewedCount = 0;
  const origOpen = portal.open.bind(portal);
  portal.open = (exhibit) => {
    origOpen(exhibit);
    if (modeMgr.getCurrentMode() === 'doom') {
      viewedCount++;
      const scoreEl = document.getElementById('doom-score');
      if (scoreEl) scoreEl.textContent = `${viewedCount} / ${totalExhibits}`;
    }
  };

  // DOOM mode entry — triggered by mode selector or settings
  if (selectedMode === 'doom') {
    setTimeout(() => {
      modeMgr.switchToDoom();
      document.getElementById('doom-hud').classList.remove('canvas-hidden');
    }, 500);
  }

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
    `Frame slots available: ${slots.length} | Exhibits: ${exhibitCount}\n` +
    `Mode: ${selectedMode.toUpperCase()}`,
    'color: #00FF00; font-family: monospace;'
  );

})();

// ── Mode Selector ─────────────────────────────────────────────────────────────
// Returns promise resolving to 'maze' or 'doom'.
// Skips selector if localStorage preference is set.

function showModeSelector() {
  return new Promise(resolve => {
    const saved = localStorage.getItem('bunjumun_mode');
    if (saved === 'maze' || saved === 'doom') {
      resolve(saved);
      return;
    }

    // Build selector overlay
    const overlay = document.createElement('div');
    overlay.id = 'mode-selector';
    overlay.innerHTML = `
      <div class="mode-window">
        <div class="mode-titlebar">⚙ BUNJUMUN-MAZE-95 — SELECT MODE</div>
        <div class="mode-body">
          <div class="mode-title">BUNJUMUN-MAZE-95</div>
          <div class="mode-subtitle">Choose your experience. Gallery content is the same in both modes.</div>
          <div class="mode-buttons">
            <button class="mode-btn" id="btn-maze">
              <span class="mode-icon">🏛</span>
              MAZE MODE
              <span class="mode-label">Navigate Win95 corridors · E to interact</span>
            </button>
            <button class="mode-btn" id="btn-doom">
              <span class="mode-icon">💀</span>
              DOOM MODE
              <span class="mode-label">Shoot the paintings to open exhibits</span>
            </button>
          </div>
          <label class="mode-remember">
            <input type="checkbox" id="mode-remember"> Remember my choice
          </label>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    function pick(mode) {
      const remember = document.getElementById('mode-remember')?.checked;
      if (remember) localStorage.setItem('bunjumun_mode', mode);
      overlay.classList.add('hidden');
      resolve(mode);
    }

    document.getElementById('btn-maze').addEventListener('click', () => pick('maze'));
    document.getElementById('btn-doom').addEventListener('click', () => pick('doom'));
  });
}
