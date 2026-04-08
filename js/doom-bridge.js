/**
 * DOOM Bridge — Exhibit Zone Detector
 * Monitors player position via Module.HEAPU32 and fires exhibit:detected
 * when the player enters one of the 14 gallery zones.
 *
 * Approved approach: Option C (E-key + static coordinate map)
 * HEAP32 scanning used to get player position; E-key triggers nearest zone check.
 *
 * Zone coordinates derived from build_wad.py geometry:
 *   Inner walls at ±768, outer at ±1024, corridor span=1536
 */

(function () {
  // --- Exhibit zone centers derived from build_wad.py ---
  // South wall (y=-768): 2 exhibits
  // East  wall (x=+768): 4 exhibits
  // North wall (y=+768): 4 exhibits
  // West  wall (x=-768): 4 exhibits
  const EXHIBIT_ZONES = [
    { x: -384, y: -768 }, // Zone 0 → tag 1001 (South)
    {  x: 384, y: -768 }, // Zone 1 → tag 1002
    {  x: 768, y: -576 }, // Zone 2 → tag 1003 (East)
    {  x: 768, y: -192 }, // Zone 3 → tag 1004
    {  x: 768, y:  192 }, // Zone 4 → tag 1005
    {  x: 768, y:  576 }, // Zone 5 → tag 1006
    {  x: 576, y:  768 }, // Zone 6 → tag 1007 (North)
    {  x: 192, y:  768 }, // Zone 7 → tag 1008
    { x: -192, y:  768 }, // Zone 8 → tag 1009
    { x: -576, y:  768 }, // Zone 9 → tag 1010
    { x: -768, y:  576 }, // Zone 10 → tag 1011 (West)
    { x: -768, y:  192 }, // Zone 11 → tag 1012
    { x: -768, y: -192 }, // Zone 12 → tag 1013
    { x: -768, y: -576 }, // Zone 13 → tag 1014
  ];

  const TRIGGER_RADIUS = 160; // map units — generous for 256-unit corridor width
  const POLL_MS = 16;

  let playerXAddr = null;
  let currentZone = -1;

  // --- HEAP32 player position scanning ---
  // Player spawns at (0,0) facing 90°. In DOOM fixed-point (16.16):
  // angle 90° = 0x40000000. Scan for that signature near zeroed X/Y.
  function tryFindPlayerBase() {
    if (!window.Module || !Module.HEAPU32) return false;
    const heap = Module.HEAPU32;
    const ANGLE_90 = 0x40000000;
    for (let i = 2; i < heap.length - 2; i++) {
      if (heap[i] === ANGLE_90 && heap[i - 1] === 0 && heap[i - 2] === 0) {
        playerXAddr = (i - 2) * 4;
        return true;
      }
    }
    return false;
  }

  function getPlayerPos() {
    if (playerXAddr === null || !Module.HEAP32) return null;
    const idx = playerXAddr >> 2;
    return {
      x: Module.HEAP32[idx]     >> 16,
      y: Module.HEAP32[idx + 1] >> 16,
    };
  }

  function nearestZoneInRange(x, y) {
    let best = -1, bestDist = Infinity;
    for (let i = 0; i < EXHIBIT_ZONES.length; i++) {
      const dx = x - EXHIBIT_ZONES[i].x;
      const dy = y - EXHIBIT_ZONES[i].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return bestDist <= TRIGGER_RADIUS ? best : -1;
  }

  function emitExhibit(zoneIdx) {
    const tag = 1001 + zoneIdx;
    window.dispatchEvent(new CustomEvent('exhibit:detected', { detail: { tag } }));
    // Legacy compat: also fire exhibit:shot for any existing listeners
    window.dispatchEvent(new CustomEvent('exhibit:shot', { detail: { tag, exhibitIndex: zoneIdx } }));
    console.log('[doom-bridge] exhibit:detected tag=' + tag);
  }

  // --- Polling loop ---
  function poll() {
    if (playerXAddr === null) tryFindPlayerBase();
    const pos = getPlayerPos();
    if (pos) {
      const zone = nearestZoneInRange(pos.x, pos.y);
      if (zone !== currentZone) {
        currentZone = zone;
        if (zone >= 0) emitExhibit(zone);
      }
    }
    setTimeout(poll, POLL_MS);
  }

  // --- E-key fallback ---
  // If HEAP32 scan hasn't locked on yet, E fires nearest zone to last known/spawn pos
  document.addEventListener('keydown', function (e) {
    if (e.code !== 'KeyE') return;
    const pos = getPlayerPos() || { x: 0, y: 0 };
    const zone = nearestZoneInRange(pos.x, pos.y);
    if (zone >= 0) emitExhibit(zone);
  });

  // --- Boot ---
  function boot() {
    if (typeof Module === 'undefined' || !Module.HEAPU32) {
      setTimeout(boot, 200);
      return;
    }
    poll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
