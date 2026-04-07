# Repository Guidelines

## Project Overview

**BUNJUMUN-MAZE-95** is a dynamic spatial CMS wrapped in a Windows 95-themed 3D maze engine. The project is a vanilla JavaScript application with no build step — it uses Three.js (via CDN) and localStorage for state management. The core innovation is the **Curator Algorithm**, which scans procedurally generated mazes for wall "straightaways" and mounts interactive picture frames from a `gallery.json` manifest.

## Project Structure & Architecture

The codebase follows a modular, class-based architecture with clear separation of concerns:

- **`main.js`** — Bootstrap entry point; coordinates maze generation, frame placement, and initialization
- **`maze-gen.js`** — Recursive backtracker algorithm for perfect maze generation (13×13 rooms default)
- **`curator.js`** — CuratorAlgorithm scans grid rows/columns for wall runs ≥3 units, anchors frames at valid segments, enforces 5-unit dead zones
- **`engine.js`** — Three.js scene management, procedural textures (brick/concrete/metal), lighting, frame rendering, collision layers
- **`controls.js`** — FirstPersonControls: WASD/Arrows for movement, mouse look with pointer lock, AABB collision detection, wall sliding
- **`exhibit.js`** — ExhibitPortal: Shadow DOM-based overlay viewer for interactive exhibits; pauses render loop when active
- **`github-api.js`** — Authenticated GitHub API client for reading/writing `gallery.json` via PUT requests
- **`admin.js`** — AdminConsole: Shadow DOM UI for 4-method exhibit ingestion (raw HTML, .html upload, iframe widgets, external links); handles token encryption/decryption
- **`gallery.json`** — Single Source of Truth; array of exhibit objects with type, content, thumbnail (Base64-encoded), and metadata
- **`css/style.css`** — Win95 HUD styling, loading screen, Shadow DOM component styles

**Key Pattern:** All interactive overlays (Admin Console, Exhibit Portals) reside in isolated Shadow DOM trees to bypass pointer-lock mouse constraints and prevent z-index conflicts with the 3D scene.

## Build, Test, and Development Commands

This is a **static site with no build step**. All development is vanilla JavaScript + Three.js CDN.

**Local development:**
```bash
python3 -m http.server 3000
```
Then open `http://localhost:3000` in a browser.

**No linting, no testing framework, no type checking** — conventions are enforced by code review and manual inspection.

## Development Workflow

### File Editing
- Edit `.js` files directly; changes auto-reload in browser (manual refresh required)
- Edit `style.css` for UI styling; Shadow DOM encapsulation means styles apply only to their component
- Edit `gallery.json` manually or via the Admin Console (authenticated GitHub PUT request)

### Adding Exhibits Programmatically
Manually edit `gallery.json`:
```json
{
  "version": "1.0",
  "exhibits": [
    {
      "id": "exhibit-001",
      "title": "My Project",
      "type": "html",
      "content": "<h1>Hello</h1>",
      "thumbnail": "data:image/png;base64,..."
    }
  ]
}
```

**Types:** `html` (innerHTML, no scripts), `widget` (iframe), `link` (external URL).

### Customizing the Maze
Edit `main.js`, change the `ROOMS` constant (default `13`):
```javascript
const ROOMS = 13;  // Try 9, 15, 20
```
Larger mazes = more CPU time, more frame slots, longer generation.

### Performance Tuning
- **Texture resolution** — `engine.js` line `_makeBrickTexture()`: adjust `S = 256`
- **Fog distance** — `engine.js` line ~80: modify `THREE.Fog` parameters
- **Light intensity** — `engine.js` line ~160: adjust ambient/point light values
- **Collision radius** — `controls.js` line ~23: `RADIUS = 0.35`

## Coding Style & Naming Conventions

No linter/formatter enforced. Follow these conventions:

- **Module Classes** — Capitalize class names: `MazeGen`, `CuratorAlgorithm`, `MazeEngine`, `FirstPersonControls`, `ExhibitPortal`, `AdminConsole`, `GitHubAPI`
- **Constants** — UPPERCASE: `ROOMS`, `SCALE`, `RADIUS`, `DEAD_ZONE`
- **Methods** — camelCase: `placeFrames()`, `checkNearbyExhibit()`, `openExhibit()`, `encryptToken()`
- **Descriptive names** — avoid abbreviations; prefer `exhibitPortal` over `ep`
- **Comments** — use sparingly; code should be self-documenting through clear naming and structure
- **Procedural textures** — Canvas-based (no external image assets) to avoid HTTP bloat

## Commit & Pull Request Guidelines

Based on recent git history, use prefixes:

- **`docs:`** — README, AGENTS.md, CLAUDE.md updates
- **`build:`** — Initial scaffold, major structural changes
- **`feat:`** — New features (exhibit types, curator improvements, UI enhancements)
- **`fix:`** — Bug fixes (collision, rendering, API errors)
- **`refactor:`** — Code reorganization without behavior changes
- **`perf:`** — Performance optimizations (texture caching, render loop tuning)

Example commits:
```
feat: add thumbnail resize and Base64 encoding for exhibit thumbnails
fix: correct collision detection on diagonal wall corners
docs: clarify GitHub PAT security protocol in README
```

## Security Considerations

- **GitHub PAT Storage** — Never hardcode tokens. Use localStorage with XOR + base64 encryption; only decrypt in-memory during admin session
- **Token Scope** — Minimum required: `repo` (full repository control) for updating `gallery.json`
- **XSS Protection** — Exhibit HTML content rendered as `innerHTML` without scripts; iframe-based widgets are isolated
- **CORS** — GitHub API requests require `Authorization: token ...` header; handled by `github-api.js`

## Deployment

Deploy to **GitHub Pages**:

1. Push `main` branch to GitHub
2. Enable Pages in repo settings (source: `main` branch, root folder)
3. Wait 1–2 minutes for GitHub to serve your site at `https://<username>.github.io/<repo>`

No build step required; all files are static.

## Key Technical Decisions

- **Vanilla JS + Three.js** — Minimal dependencies, direct control over rendering and input
- **Shadow DOM** — Isolates UI from 3D scene's pointer lock and CSS
- **localStorage** — Client-side state (encrypted PAT, user preferences)
- **Procedural textures** — Canvas-generated to avoid external asset files
- **Recursive Backtracker** — Ensures perfect maze (exactly one solution path)
- **AABB Collision** — Simple, performant collision against wall cells
- **GitHub API** — Live gallery updates without backend server

## Architecture Reference

See **CLAUDE.md** for the original system manifest (Hardware Chassis, Security Protocol, Rig & Spacing Algorithm, Admin Console, Execution Logic) and **README.md** for detailed feature descriptions and algorithm walkthroughs.
