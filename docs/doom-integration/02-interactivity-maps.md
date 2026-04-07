# 02 Interactivity & Maps

## 1. Painting Interactivity Strategy

### Decision: Raycast Hack (External to DOOM)
**Rationale:** Generating custom DOOM WAD actors on the fly requires compiling WADs in the browser or via a backend, which breaks the static site constraint. Instead, we use a hybrid approach:
- Use a **Static DOOM WAD** ("Art Gallery Arena") containing blank, replaceable textures acting as painting frames.
- jsZDoom supports overriding WAD textures with external image files at load time.
- A concurrent Three.js raycast runs silently in the background (using DOOM's synced camera position) to detect which frame the player is aiming at when they click (shoot).

### Raycast Algorithm (Pseudo-code)
```javascript
class DoomRaycaster {
  constructor(mazeEngine, galleryData) {
    this.raycaster = new THREE.Raycaster();
    this.center = new THREE.Vector2(0, 0); // Crosshair center
    this.mazeEngine = mazeEngine;
    this.galleryData = galleryData;
  }
  
  // Called whenever user clicks/shoots in DOOM mode
  onDoomShoot(doomCameraPos, doomCameraRot) {
    // 1. Sync hidden Three.js camera to DOOM player's transform
    this.mazeEngine.camera.position.set(doomCameraPos.x, doomCameraPos.y, doomCameraPos.z);
    this.mazeEngine.camera.rotation.set(doomCameraRot.x, doomCameraRot.y, doomCameraRot.z);
    
    // 2. Perform Raycast against Maze's painting meshes
    this.raycaster.setFromCamera(this.center, this.mazeEngine.camera);
    const intersects = this.raycaster.intersectObjects(this.mazeEngine.paintingsGroup.children);
    
    // 3. Trigger exhibit if hit
    if (intersects.length > 0 && intersects[0].distance < 50) {
      const exhibitId = intersects[0].object.userData.exhibitId;
      this.triggerExhibit(exhibitId);
    }
  }
  
  triggerExhibit(exhibitId) {
    // Escalate to GameModeManager to pause DOOM and open ExhibitPortal
  }
}
```

### Hitbox Definition Format
Since the raycast runs against the existing Maze scene, the hitboxes are identical to the `THREE.Mesh` objects already placed by the `CuratorAlgorithm`. No duplicate hitbox definition is required.

### Sync Strategy
- jsZDoom exposes player X/Y/Z and Pitch/Yaw via its Emscripten C-API.
- Every `requestAnimationFrame`, read these values from WASM memory.
- Convert DOOM units back to Three.js world units and update the hidden Maze camera.
- **This ensures the raycaster is perfectly aligned with the DOOM crosshair.**

---

## 2. Custom Map Generation Strategy

### Decision: Static Level with Texture Replacement
**Rationale:** Building dynamic WADs is too complex for a vanilla JS app. Instead, we use a pre-built static level containing up to 64 "slots" for paintings (e.g., `WALL01` to `WALL64`).
- When switching to DOOM mode, we generate a simple ZScript or use jsZDoom's command-line arguments to replace `WALL01` with `exhibit-001.jpg`.
- If the gallery has only 10 exhibits, slots 11-64 remain blank or default wall textures.

### Coordinate System Mapper
To sync the DOOM camera to the Maze camera, we must translate the coordinate systems:

```javascript
// Translation Formula
// Maze: 1 unit = 1 meter
// DOOM: 1 unit ≈ 1.5 inches (64 units = ~8 feet)

const DOOM_SCALE_FACTOR = 64 / 2.5; // ~25.6 DOOM units per Three.js unit

function mazeToDoomCoordinates(mazeX, mazeZ) {
  return {
    x: mazeX * DOOM_SCALE_FACTOR,
    y: mazeZ * DOOM_SCALE_FACTOR
  };
}

function doomToMazeCoordinates(doomX, doomY) {
  return {
    x: doomX / DOOM_SCALE_FACTOR,
    z: doomY / DOOM_SCALE_FACTOR
  };
}
```

### Level Generation Algorithm (Fallback to Dynamic Text WAD)
If a static WAD feels too restrictive, the alternative is generating a **UDMF (Universal Doom Map Format)** file, which is pure text:

```javascript
function generateUDMF(exhibits, mazeLayout) {
  let udmf = 'namespace = "zdoom";\n';
  
  // 1. Generate empty rectangular arena based on maze size
  const arenaWidth = mazeLayout.width * DOOM_SCALE_FACTOR;
  const arenaHeight = mazeLayout.height * DOOM_SCALE_FACTOR;
  
  // ... append vertex, linedef, sidedef, and sector definitions for the arena
  
  // 2. Iterate through exhibits and place them along the walls
  exhibits.forEach((exhibit, index) => {
    // ... append linedef with exhibit texture
  });
  
  return udmf; // Pass this text file to jsZDoom's virtual filesystem
}
```
**Conclusion:** We will start with a **Static WAD** (Arena) and use jsZDoom VFS (Virtual File System) to inject gallery thumbnails as texture replacements. If time permits, we'll upgrade to dynamic UDMF generation to match the exact Maze layout.

### Dynamic Updates
Since gallery thumbnails are base64 strings in `gallery.json`:
1. Convert base64 to binary `Uint8Array`.
2. Write to jsZDoom's Emscripten FS (`FS.writeFile('/mats/exhibit1.png', data)`).
3. Issue a jsZDoom console command to refresh textures, avoiding a full engine restart.
