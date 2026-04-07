# BUNJUMUN-DOOM: Comprehensive Function Testing Protocol
**Created:** 2026-04-07
**Purpose:** Test every function, every method, every event handler

---

## Test Organization

### By Module

#### doom-engine.js
- [ ] `DoomEngine.constructor()` — initializes with correct properties
- [ ] `DoomEngine.init()` — creates canvas, loads doom.js, fires onRuntimeInitialized
- [ ] `DoomEngine.pause()` — calls Module._SendPause(1)
- [ ] `DoomEngine.resume()` — calls Module._SendPause(0)
- [ ] `DoomEngine.getCanvas()` — returns canvas element
- [ ] `DoomEngine.updateInput()` — calls Module._UpdateJoystick with correct params

#### doom-bridge.js
- [ ] `DoomBridge.constructor()` — initializes with engine reference
- [ ] `DoomBridge.start()` — begins polling interval (16ms)
- [ ] `DoomBridge.stop()` — clears polling interval
- [ ] `DoomBridge.poll()` — reads Module._get_exhibit_tag()
- [ ] `DoomBridge.poll()` — dispatches exhibit:shot event when tag changes
- [ ] `DoomBridge.poll()` — handles tag range (1001–1064) correctly
- [ ] `DoomBridge.poll()` — gracefully handles Module undefined

#### gallery-wad.js
- [ ] `GalleryWAD.constructor()` — stores gallery reference
- [ ] `GalleryWAD.generate()` — creates WAD builder
- [ ] `GalleryWAD.createMinimalWAD()` — produces 12-byte valid PWAD header
- [ ] `GalleryWAD.writeToFS()` — sets window.galleryWadData
- [ ] `WADBuilder.addGallerySpriteData()` — logs exhibit count
- [ ] `WADBuilder.build()` — produces valid PWAD binary

#### explosion.js
- [ ] `ExplosionEffect.constructor()` — initializes with null canvas
- [ ] `ExplosionEffect.init()` — creates canvas DOM element
- [ ] `ExplosionEffect.init()` — handles window resize
- [ ] `ExplosionEffect.play()` — plays 400ms animation
- [ ] `ExplosionEffect.play()` — calls onComplete callback
- [ ] `ExplosionEffect.createFireParticle()` — returns valid particle object
- [ ] `ExplosionEffect.createSmokeParticle()` — returns valid particle object
- [ ] `ExplosionEffect.updateParticle()` — applies physics (gravity, drag, radius)
- [ ] `ExplosionEffect.drawParticle()` — renders particle correctly

#### exhibit.js (Preserved, but test for DOOM context)
- [ ] `ExhibitPortal.open()` — opens portal with exhibit data
- [ ] `ExhibitPortal.close()` — closes portal cleanly
- [ ] `ExhibitPortal.isOpen` — tracks state correctly

#### admin.js (Preserved, but test for DOOM context)
- [ ] `AdminConsole.toggle()` — opens/closes settings
- [ ] `AdminConsole.addExhibit()` — adds exhibit to gallery
- [ ] `AdminConsole.close()` — hides admin UI

#### main.js (DOOM-only bootstrap)
- [ ] Load gallery.json successfully
- [ ] Initialize DoomEngine
- [ ] Initialize ExplosionEffect
- [ ] Initialize DoomBridge
- [ ] Initialize ExhibitPortal
- [ ] Initialize AdminConsole
- [ ] Wire exhibit:shot event listener
- [ ] Wire settings button
- [ ] Wire escape key handler
- [ ] Update score display

#### index.html (DOOM-only markup)
- [ ] All required divs present (doom-container, exhibit-host, admin-host, etc.)
- [ ] All script tags load in correct order
- [ ] No 404s on CSS/JS/assets

---

## Integration Tests

### Game Loop
1. **Startup**
   - [ ] Page loads
   - [ ] Loading bar animates
   - [ ] Gallery.json fetches
   - [ ] DOOM engine initializes
   - [ ] Canvas renders
   - [ ] "BUNJUMUN-DOOM loaded" logged

2. **Exhibit:shot Event**
   - [ ] User shoots painting
   - [ ] WASM returns tag (1001+)
   - [ ] DoomBridge detects tag
   - [ ] exhibit:shot event fires
   - [ ] Correct exhibit index extracted
   - [ ] Correct exhibit from gallery array

3. **Explosion Animation**
   - [ ] Canvas overlay created
   - [ ] Flash plays (0–80ms, orange)
   - [ ] Fire particles spawn (40 total)
   - [ ] Smoke particles spawn (15 total, delayed 100ms)
   - [ ] Particles update physics correctly
   - [ ] Animation completes at 400ms
   - [ ] onComplete callback fires

4. **Portal Opening**
   - [ ] After explosion completes
   - [ ] ExhibitPortal.open() called
   - [ ] DOOM engine paused
   - [ ] DoomBridge polling stopped
   - [ ] Portal UI appears with exhibit data
   - [ ] Score updated (0/n → 1/n)

5. **Portal Closing**
   - [ ] User clicks close button
   - [ ] ExhibitPortal.close() called
   - [ ] DoomBridge polling restarted
   - [ ] DOOM engine resumed
   - [ ] Portal UI hidden

6. **Admin Console**
   - [ ] Settings button (⚙) clickable
   - [ ] Opens admin overlay
   - [ ] Can add new exhibit
   - [ ] Gallery updates in real-time
   - [ ] New exhibit shootable
   - [ ] Escape key closes

### Edge Cases
- [ ] Rapid consecutive shots (5+ in 1 second)
- [ ] Shooting while admin open (should be blocked)
- [ ] Closing portal while explosion playing
- [ ] Adding exhibit while playing game
- [ ] Very long exhibit titles/descriptions
- [ ] Large image thumbnails
- [ ] Network latency (simulate 4G throttle in DevTools)
- [ ] Multiple browser tabs playing simultaneously
- [ ] Browser console with errors
- [ ] Mobile viewport (375x667)
- [ ] Tablet viewport (768x1024)
- [ ] Desktop viewport (1920x1080)

---

## Performance Tests

- [ ] **Frame rate:** 60 FPS stable (no drops below 50)
- [ ] **Memory:** Stable under 100 MB (no leaks over 5 min gameplay)
- [ ] **Load time:** <2s from page load to playable
- [ ] **Canvas render:** Smooth without jank
- [ ] **Event handling:** <100ms from click to exhibit:shot dispatch
- [ ] **Explosion animation:** Smooth particle motion
- [ ] **Portal open/close:** <100ms transition

---

## Browser Compatibility

- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari
- [ ] Chrome Mobile

---

## Test Tools

Each test function should use:

```javascript
// Unit test (function in isolation)
function test_DoomEngine_pause() {
  const mockModule = { _SendPause: jest.fn() };
  const engine = new DoomEngine(...);
  engine.Module = mockModule;
  engine.pause();
  expect(mockModule._SendPause).toHaveBeenCalledWith(1);
}

// Integration test (with real browser)
async function test_GameLoop_Complete() {
  const page = await browser.newPage();
  await page.goto('http://localhost:8000');
  await page.waitForFunction(() => window.doomEngine?.isReady);
  // [test logic]
  await expect.resolves(true);
}
```

---

## Test Execution Order

1. **Phase 1: Unit Tests (Fast)**
   - Test each function individually
   - Use mocks for external dependencies
   - Run in Node.js (no browser needed)

2. **Phase 2: Integration Tests (Medium)**
   - Test full game loop
   - Use headless browser (Playwright)
   - Run locally on http://localhost:8000

3. **Phase 3: Live Site Tests (Slow)**
   - Test on GitHub Pages live
   - Full user journey
   - Multiple browser types

---

## Test Report Format

```markdown
# Test Report — BUNJUMUN-DOOM

## Summary
- Total tests: XXX
- Passed: XXX ✅
- Failed: X ❌
- Warnings: X ⚠️

## By Module
### doom-engine.js
- ✅ constructor(): [description]
- ✅ init(): [description]
- ❌ pause(): [error description]
- ...

## Failed Tests
### test_DoomEngine_pause
- Error: Module._SendPause not called
- Expected: Called with (1)
- Actual: Not called
- Root cause: Module is undefined at test time
- Fix: Mock Module before calling pause()

## Performance
- Frame rate: 58 FPS (target: 60+) ⚠️
- Load time: 1.8s ✅
- Memory: 87 MB ✅

## Browser Compatibility
- Chrome: ✅
- Firefox: ✅
- Safari: ⚠️ (minor issue with audio)
- Mobile: ⚠️ (controls need adjustment)

## Recommendations
1. [Fix for warning/failure]
2. [Optimization opportunity]
3. [Polish item]
```

---

**Each test function documented. Each edge case covered. Every assertion logged.**
