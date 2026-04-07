# BUNJUMUN-MAZE-95

A dynamic spatial CMS wrapped in a Windows 95-themed 3D maze engine. Navigate procedurally generated corridors to discover interactive project exhibits mounted on `gallery.json`-driven picture frames.

## Features

- **3D Maze Generation** — Recursive backtracker algorithm (13×13 rooms default)
- **Smart Frame Placement** — Curator Algorithm scans for wall "straightaways" (≥3 units), respects 5-unit dead zones
- **Dynamic Gallery** — Exhibits defined in `gallery.json`, updated via authenticated GitHub API
- **4-Method Exhibit Ingestion** — Raw HTML paste, `.html` file upload, iframe widgets, external links
- **Win95 Aesthetic** — Procedural brick/concrete/metal textures, authentic UI chrome in Shadow DOM
- **Pointer-Lock FPS** — WASD + mouse look with AABB collision; Tab for minimap
- **Password-Gated Admin** — XOR-ciphered localStorage token + session-only decryption

## Quick Start

### Local Development

1. **Clone this repo**
   ```bash
   git clone https://github.com/bunjumun/bunjumun95.git
   cd bunjumun95
   ```

2. **Start a local web server**
   ```bash
   # macOS / Linux
   python3 -m http.server 3000

   # Then open http://localhost:3000 in your browser
   ```

3. **First visit — test offline**
   - Click to acquire pointer lock
   - Use **WASD** / **Arrow Keys** to move
   - **Mouse** to look around
   - **Tab** for minimap
   - **A** key opens Admin Console (password gate appears)
   - **E** near a frame to view an exhibit

### Admin Console Setup

The Admin Console is password-protected. On first use:

1. Press **A** to open the console
2. Enter a **System Password** (any string; used to unlock stored GitHub PAT)
3. Click **SETUP NEW TOKEN**
4. Paste your **GitHub Personal Access Token** (create one at [github.com/settings/tokens](https://github.com/settings/tokens))
   - Required scopes: `repo` (full control of private repositories)
5. Click **UNLOCK**
6. Console connects to `bunjumun/bunjumun95` and loads `gallery.json`

**Token Security:**
- PAT is encrypted via XOR + base64 and stored in `localStorage`
- **Never hardcoded or committed** to the repository
- Only unlocked in-memory during admin session
- Cleared on logout or page refresh

### Adding Exhibits

1. Open Admin Console (**A** key)
2. Fill in exhibit **Title** (required) and optional **Description**
3. Choose a **Content Type**:
   - **RAW HTML** — paste HTML directly
   - **HTML FILE** — upload a `.html` file
   - **WIDGET** — paste an `<iframe>` snippet (YouTube, Codepen, etc.)
   - **EXT. LINK** — external URL (opens in new tab)
4. *(Optional)* Upload a **Thumbnail** image
   - Auto-resized to ≤800px width
   - Encoded to Base64 and embedded in `gallery.json`
5. Click **💾 SAVE TO GITHUB**
   - Updates `gallery.json` via authenticated GitHub API PUT
   - Changes live on every pull/refresh

## Architecture

### File Structure

```
bunjumun95/
├── index.html              # Entry point; loads Three.js r128 + modules
├── gallery.json            # Single Source of Truth (exhibits array)
├── css/
│   └── style.css           # Win95 HUD, loading screen, basic layout
├── js/
│   ├── main.js             # Bootstrap: maze gen → scene → frame placement
│   ├── maze-gen.js         # MazeGen: Recursive backtracker
│   ├── curator.js          # CuratorAlgorithm: straightaway scanner + spacing
│   ├── engine.js           # MazeEngine: Three.js scene, textures, rendering
│   ├── controls.js         # FirstPersonControls: FPS + collision
│   ├── exhibit.js          # ExhibitPortal: Shadow DOM viewer
│   ├── github-api.js       # GitHubAPI: Auth + PUT requests
│   └── admin.js            # AdminConsole: Shadow DOM management UI
└── CLAUDE.md               # Project manifest & system architecture
```

### Key Algorithms

#### MazeGen (Recursive Backtracker)
- Generates a **perfect maze** (one solution path)
- Grid: `(2 * rooms + 1) × (2 * rooms + 1)` cells
- Room cells at odd indices; walls/passages at even indices
- **Default:** 13 rooms → 27×27 grid

#### CuratorAlgorithm
1. **Scanner** — traverses each grid row & column for wall runs ≥3 units
2. **Anchor** — places frame slot at `index + 1` of valid run
3. **Buffer** — enforces 5-unit 3D dead zone between slots
4. **Validation** — only counts runs with adjacent open corridor cells

#### MazeEngine (Three.js)
- **Scene:** floor + ceiling (full grid) + individual wall cubes
- **Textures:** procedurally generated (Canvas-based) to avoid asset bloat
- **Lighting:** flat ambient (0.55) + warm point light following camera
- **Frames:** positioned & rotated per slot descriptor (pz/nz/px/nx facing)
- **Render Loop:** paused on exhibit/admin open; resumed on close
- **Minimap:** real-time 2D overhead view (Canvas)

#### FirstPersonControls
- **Input:** WASD / Arrows (movement) + mouse (pitch/yaw)
- **Pointer Lock:** click to acquire; ESC/dialog close to release
- **Collision:** AABB (circle radius 0.35 units) against grid wall cells
- **Wall Sliding:** X and Z axes resolved independently

### Data Flow

```
gallery.json
    ↓
main.js (loads via fetch)
    ↓
engine.placeFrames(slots, exhibits)
    ↓
ThreeJS Scene (renders frames + maze)
    ↓
Player navigates → checkNearbyExhibit()
    ↓
(E key) → ExhibitPortal.open(exhibit)
    ↓
Shadow DOM viewer + paused engine
    ↓
(ESC / close btn) → ExhibitPortal.close()
    ↓
Engine resumes, pointer lock re-acquired
```

## Deployment

### GitHub Pages

1. **Enable Pages** in your GitHub repo settings
   - **Source:** `main` branch, root folder
   - (or create a `gh-pages` branch if preferred)
2. **Push your changes**
   ```bash
   git push origin main
   ```
3. **Wait 1–2 minutes** for GitHub to build
4. Your site is live at `https://bunjumun.github.io/bunjumun95`

### Environment

- **No build step required** — vanilla JS + Three.js CDN
- **No Node.js / npm** — static files only
- **CORS:** GitHub API requests require authenticated token (`Authorization: token ...`)
- **CSP:** Shadow DOM components bypass certain restrictions

## Development Notes

### Adding New Exhibits Programmatically

You can manually edit `gallery.json`:

```json
{
  "version": "1.0",
  "title": "BUNJUMUN-MAZE-95",
  "exhibits": [
    {
      "id": "exhibit-001",
      "title": "My Project",
      "description": "Optional subtitle",
      "type": "html",
      "content": "<h1>Hello</h1><p>This is my project.</p>",
      "thumbnail": "data:image/png;base64,iVBOR..."
    }
  ]
}
```

**Types:**
- `html` — rendered as innerHTML (no scripts)
- `widget` — iframe snippet or src URL
- `link` — external URL (opens in new tab with modal frame)

### Customizing the Maze

Edit `main.js`, change `ROOMS`:

```javascript
const ROOMS = 13;  // change to 9, 15, 20, etc.
```

Larger mazes = more CPU, more frame slots, longer gen time.

### Performance Tuning

- **Texture resolution** — adjust `S = 256` in `engine.js` `_makeBrickTexture()`, etc.
- **Fog distance** — `engine.js` line ~80: `fog: new THREE.Fog(...)`
- **Light intensity** — `engine.js` line ~160: adjust ambient/point light values
- **Collision radius** — `controls.js` line ~23: `RADIUS = 0.35`

## License & Credits

- **Source Reference:** [x86matthew/Playable3DMaze](https://github.com/x86matthew/Playable3DMaze) — Windows 3D Maze screensaver revival
- **Engine:** Three.js r128 (MIT)
- **Architecture & Implementation:** BUNJUMUN-MAZE-95 (Built with Claude Code)

---

**BUNJUMUN-MAZE-95** — *A spatial portfolio wrapped in 90s nostalgia.*
