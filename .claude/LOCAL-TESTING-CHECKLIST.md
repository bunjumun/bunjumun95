# BUNJUMUN-MAZE-95 — Local Testing Checklist

**Server:** http://localhost:3000
**Status:** Ready for manual browser testing

---

## Pre-Test Notes

✅ **All modules loaded in correct dependency order**
✅ **Gallery.json exists and is valid**
✅ **All class/IIFE definitions present**
✅ **No obvious syntax errors detected**

---

## Manual Browser Tests

### 1. Page Load & Initial Render

- [ ] Page loads without console errors
- [ ] Loading bar appears and animates to 100%
- [ ] Canvas (maze) renders after ~2 seconds
- [ ] Console shows: `BUNJUMUN-MAZE-95 loaded...` message
- [ ] Console shows: Maze dimensions, frame slots, exhibits loaded

### 2. Pointer-Lock & Initial UI

- [ ] Click-to-start overlay visible
- [ ] Overlay shows correct hints (WASD, mouse, E, TAB, A)
- [ ] Clicking overlay requests pointer lock
- [ ] *(Browser may deny on localhost; that's OK)*

### 3. Navigation & Controls

- [ ] Can move forward/backward (WASD or arrow keys)
- [ ] Can rotate/look around (mouse movement)
- [ ] No camera clipping through walls
- [ ] Movement feels smooth (60 FPS target)
- [ ] Crosshair visible in center of screen

### 4. HUD & Feedback

- [ ] Crosshair appears at screen center
- [ ] Control hints appear at bottom ("WASD / ARROWS...")
- [ ] Interact hint appears only when near a frame (E key)
- [ ] Minimap toggles on Tab key (shows maze + player position)

### 5. Admin Console

- [ ] Press A key → Admin Console opens
- [ ] Console shows password gate (red lock indicator)
- [ ] Can type a password in the auth panel
- [ ] "SETUP NEW TOKEN" button is visible
- [ ] "LOCK" / "CLOSE" buttons work
- [ ] Console z-index is above maze (sits on top)
- [ ] Opening console pauses engine (no maze animation)
- [ ] Closing console resumes engine

### 6. Exhibit Frames

- [ ] Frames are visible mounted on walls
- [ ] Frames have gold borders (procedural textures visible)
- [ ] Frame thumbnails visible (dark placeholder initially)
- [ ] Approaching a frame shows interact hint (E)
- [ ] Pressing E near frame opens ExhibitPortal
- [ ] ExhibitPortal shows Win95 window chrome
- [ ] Portal can be closed (ESC or ✕ button)
- [ ] Closing portal resumes engine & re-locks pointer

### 7. Texture Quality

- [ ] Brick wall texture has visible pattern (not flat color)
- [ ] Floor tiles visible (grid lines)
- [ ] Ceiling appears lighter than walls
- [ ] Procedural grime/variation visible on bricks

### 8. Performance

- [ ] Frame rate stable at ~60 FPS (Chrome DevTools)
- [ ] No stuttering or lag during movement
- [ ] Admin console doesn't cause frame drops
- [ ] Minimap renders smoothly

### 9. Collision & Physics

- [ ] Can't walk through walls
- [ ] Can walk along walls (wall-sliding works)
- [ ] Can't fall off edges (no height issues)
- [ ] Maze navigable from entrance (grid 1,1) to opposite side

---

## Known Limitations (Expected)

- ⚠️ **Localhost:** Pointer lock may be blocked by browser (feature requires secure context in some browsers)
- ⚠️ **Admin Console offline:** GitHub API calls will fail (expected; requires valid PAT)
- ⚠️ **Mobile:** Not optimized for mobile (desktop-only for now)
- ⚠️ **Exhibits:** No exhibits loaded (gallery.json is empty initially)

---

## If Issues Occur

### Black canvas / no maze visible
1. Check Chrome DevTools Console for errors
2. Look for missing THREE.js library (CDN issue)
3. Verify maze-gen.js is exporting MazeGen correctly

### Controls not responding
1. Make sure pointer lock overlay has been clicked
2. Check that FirstPersonControls is instantiated
3. Verify keydown/keyup events in console

### Admin console won't open
1. Check that AdminConsole class initializes
2. Verify exhibit-host div exists in DOM
3. Check console for Shadow DOM errors

### Collision detecting incorrectly
1. Most likely: maze generation edge case
2. Try changing ROOMS value in main.js (test with smaller maze first)
3. Check FirstPersonControls._wallCheck() logic

---

## Next Steps After Testing

1. **Pass** ✅ → Proceed to GitHub repo creation
2. **Fail** ❌ → Check console errors + fix locally

**Critical blockers:**
- Canvas doesn't render (Three.js issue)
- Controls don't work (event handling issue)
- Admin console crashes (Shadow DOM issue)

**Minor issues:**
- Textures need refinement (pending zencoder)
- Frame placement tweaks (zencoder optimizing)
- CSS polish (zencoder enhancing)

---

**Testing Environment:**
- Browser: Chrome/Firefox/Safari (latest)
- System: macOS
- Server: Python 3.9 http.server
- Port: 3000
