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
  const frameCount = 14;
  const visitedExhibits = new Set();
  let statusResetTimer = null;
  let directionHintTimer = null;
  let pointerLocked = false;

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
  const portal = new ExhibitPortal(document.getElementById('exhibit-host'), doomEngine);
  const admin  = new AdminConsole(document.getElementById('admin-host'), doomEngine, portal);

  // ── 5a. UI state helpers ────────────────────────────────────────────────────
  const lockOverlay = document.getElementById('lock-overlay');
  const guideOverlay = document.getElementById('exhibit-guide');
  const guideCountEl = guideOverlay?.querySelector('.guide-count');
  const guideNextEl = guideOverlay?.querySelector('.guide-next strong');
  const guideHighlightBtn = document.getElementById('guide-highlight');
  const doomStatusText = document.getElementById('doom-status-text');

  let directionHint = document.getElementById('guide-direction-hint');
  if (!directionHint) {
    directionHint = document.createElement('div');
    directionHint.id = 'guide-direction-hint';
    directionHint.className = 'guide-direction-hint hidden';
    directionHint.textContent = '▶ AHEAD';
    document.body.appendChild(directionHint);
  }

  const getNextExhibit = () => (
    gallery.exhibits.find((exhibit, index) => {
      const exhibitKey = exhibit.id || `exhibit-${index}`;
      return !visitedExhibits.has(exhibitKey);
    })
  );

  const updateLockOverlay = (forceDisplay = null) => {
    if (!lockOverlay) return;

    if (forceDisplay) {
      lockOverlay.style.display = forceDisplay;
      return;
    }

    const menuOpen = admin.isOpen || portal.isOpen;
    lockOverlay.style.display = pointerLocked || menuOpen ? 'none' : 'flex';
  };

  const updateGuide = () => {
    if (guideCountEl) {
      guideCountEl.textContent = `${exhibitCount} exhibits · ${frameCount} frames`;
    }

    if (guideNextEl) {
      const nextExhibit = getNextExhibit();
      guideNextEl.textContent = nextExhibit ? nextExhibit.title : 'All exhibits cleared';
    }
  };

  const updateGuideVisibility = () => {
    if (!guideOverlay) return;
    guideOverlay.classList.toggle('hidden', admin.isOpen || portal.isOpen);
  };

  const setStatusText = (text, durationMs = 0) => {
    if (!doomStatusText) return;

    if (statusResetTimer) {
      clearTimeout(statusResetTimer);
      statusResetTimer = null;
    }

    doomStatusText.textContent = text;

    if (!durationMs) return;

    statusResetTimer = setTimeout(() => {
      doomStatusText.textContent = visitedExhibits.size === exhibitCount && exhibitCount > 0
        ? 'Gallery complete ★'
        : 'Ready';
      statusResetTimer = null;
    }, durationMs);
  };

  const flashDirectionHint = () => {
    if (!directionHint) return;

    if (directionHintTimer) clearTimeout(directionHintTimer);

    directionHint.classList.remove('hidden');
    directionHint.classList.add('active');

    directionHintTimer = setTimeout(() => {
      directionHint.classList.remove('active');
      directionHint.classList.add('hidden');
      directionHintTimer = null;
    }, 2000);
  };

  updateGuide();
  updateGuideVisibility();
  setStatusText('Ready');

  if (guideHighlightBtn) {
    guideHighlightBtn.addEventListener('click', flashDirectionHint);
  }

  // Override portal pause/resume to use DOOM engine
  const origPortalOpen = portal.open.bind(portal);
  const origPortalClose = portal.close.bind(portal);

  portal.open = (exhibit) => {
    doomEngine.pause();
    doomBridge.stop();
    origPortalOpen(exhibit);
    updateLockOverlay('none');
    updateGuideVisibility();
  };

  portal.close = () => {
    origPortalClose();
    doomBridge.start();
    doomEngine.resume();
    updateLockOverlay('flex');
    updateGuideVisibility();
  };

  // Harden admin overlay state transitions without touching admin.js
  const origAdminOpen = admin.open.bind(admin);
  const origAdminClose = admin.close.bind(admin);

  admin.open = () => {
    origAdminOpen();
    updateLockOverlay('none');
    updateGuideVisibility();
  };

  admin.close = () => {
    origAdminClose();
    updateLockOverlay('flex');
    updateGuideVisibility();
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

    const exhibitKey = exhibit.id || `exhibit-${exhibitIndex}`;
    visitedExhibits.add(exhibitKey);
    updateGuide();

    if (visitedExhibits.size === exhibitCount && exhibitCount > 0) {
      setStatusText('Gallery complete ★');
    } else {
      setStatusText('Exhibit viewed ✓', 3000);
    }

    // Play explosion effect, open portal when done
    explosion.play(() => {
      portal.open(exhibit);
    });

    // Update score
    const scoreEl = document.getElementById('doom-score');
    if (scoreEl) {
      const current = parseInt(scoreEl.textContent.split('/')[0].trim(), 10) || 0;
      scoreEl.textContent = `${current + 1} / ${exhibitCount}`;
    }
  });

  // ── 7. HUD / interaction wiring ──────────────────────────────────────────────
  progress(90);
  const settingsBtn = document.getElementById('settings-btn');

  // Pointer lock state → show/hide "click to play" overlay
  const canvas = doomEngine.getCanvas();
  if (canvas) {
    canvas.addEventListener('doom:pointerlockchange', (e) => {
      pointerLocked = Boolean(e.detail.locked);
      updateLockOverlay();
    });
  }

  // Click lock overlay to acquire pointer lock
  if (lockOverlay) {
    lockOverlay.addEventListener('click', () => {
      doomEngine.requestPointerLock();
    });
  }

  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      if (!portal.isOpen) {
        doomEngine.exitPointerLock();
        pointerLocked = false;
        updateLockOverlay('none');

        if (admin.isOpen) {
          admin.close();
        } else {
          doomEngine.pause();
          admin.open();
        }
      }
    });
  }

  // Escape key closes admin, then show "click to re-enter" overlay
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && admin.isOpen) {
      admin.close();
    }
  });

  // ── 8. Hide loading UI ───────────────────────────────────────────────────────
  progress(100);
  updateLockOverlay();

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
