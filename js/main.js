// ── main.js ───────────────────────────────────────────────────────────────────
// DOOM-only bootstrap: load gallery → generate gallery WAD → init DOOM engine →
// wire portal/admin/bridge → start polling.
// ─────────────────────────────────────────────────────────────────────────────

(async function BUNJUMUN_DOOM() {

  // ── Progress helper ─────────────────────────────────────────────────────────
  const bar = document.getElementById('loading-bar');
  function progress(pct) { if (bar) bar.style.width = pct + '%'; }

  // ── 0. Load gallery from server ──────────────────────────────────────────────
  progress(10);
  let gallery = { version: '1.0', title: 'BUNJUMUN-DOOM', exhibits: [] };
  try {
    const res = await fetch('./gallery.json');
    if (res.ok) gallery = await res.json();
  } catch (_) { /* offline / first run */ }

  const exhibitCount = gallery.exhibits.length || 0;

  // ── 1. Generate gallery.wad from exhibits ────────────────────────────────────
  progress(25);
  const galWad = new GalleryWAD(gallery);
  await galWad.writeToFS();

  // ── 2. Initialize DOOM engine (PrBoom WebAssembly) ──────────────────────────
  progress(40);
  const doomContainer = document.getElementById('doom-container');
  const doomEngine = new DoomEngine(doomContainer);
  await doomEngine.init();

  // ── 3. Initialize explosion effect overlay ──────────────────────────────────
  progress(50);
  const explosion = new ExplosionEffect();
  await explosion.init();

  // ── 4. Initialize DOOM bridge (WASM memory polling) ────────────────────────
  progress(60);
  const doomBridge = new DoomBridge(doomEngine);
  doomBridge.start();

  // ── 5. Exhibit portal & Admin console ─────────────────────────────────────
  progress(70);
  const portal = new ExhibitPortal(document.getElementById('exhibit-host'), null);
  const admin  = new AdminConsole(document.getElementById('admin-host'), null, portal);

  // Override portal pause/resume to use DOOM engine
  const origPortalOpen = portal.open.bind(portal);
  const origPortalClose = portal.close.bind(portal);

  portal.open = (exhibit) => {
    doomEngine.pause();
    doomBridge.stop();
    origPortalOpen(exhibit);
  };

  portal.close = () => {
    origPortalClose();
    doomBridge.start();
    doomEngine.resume();
  };

  // ── 6. Wire exhibit:shot event → explosion + portal ───────────────────────
  progress(80);
  window.addEventListener('exhibit:shot', (e) => {
    const exhibitIndex = e.detail.exhibitIndex;
    const exhibit = gallery.exhibits[exhibitIndex];

    if (!exhibit) {
      console.warn('[Main] No exhibit at index', exhibitIndex);
      return;
    }

    console.log('[Main] Exhibit shot:', exhibit.title);

    // Play explosion effect, open portal when done
    explosion.play(() => {
      portal.open(exhibit);
    });

    // Update score
    const scoreEl = document.getElementById('doom-score');
    if (scoreEl) {
      const current = parseInt(scoreEl.textContent.split('/')[0].trim()) || 0;
      scoreEl.textContent = `${current + 1} / ${exhibitCount}`;
    }
  });

  // ── 7. HUD / interaction wiring ──────────────────────────────────────────────
  progress(90);
  const settingsBtn = document.getElementById('settings-btn');

  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      if (!portal.isOpen) {
        doomEngine.pause();
        admin.toggle();
      }
    });
  }

  // Escape key closes admin
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && admin.isOpen) {
      admin.close();
      doomEngine.resume();
    }
  });

  // ── 8. Hide loading UI ───────────────────────────────────────────────────────
  progress(100);

  const lockOverlay = document.getElementById('lock-overlay');
  if (lockOverlay) lockOverlay.style.display = 'none';

  const loading = document.getElementById('loading');
  if (loading) {
    loading.style.transition = 'opacity 0.4s';
    loading.style.opacity = '0';
    setTimeout(() => { loading.style.display = 'none'; }, 420);
  }

  // Hide controls hint (maze-specific)
  const controlsHint = document.getElementById('controls-hint');
  if (controlsHint) controlsHint.style.display = 'none';

  // Show DOOM HUD
  const doomHud = document.getElementById('doom-hud');
  if (doomHud) {
    doomHud.classList.remove('canvas-hidden');
    const scoreEl = document.getElementById('doom-score');
    if (scoreEl) scoreEl.textContent = `0 / ${exhibitCount}`;
  }

  console.log(
    `%cBUNJUMUN-DOOM loaded.\n` +
    `Gallery: ${exhibitCount} exhibits\n` +
    `DOOM engine: running`,
    'color: #00FF00; font-family: monospace;'
  );

})();
