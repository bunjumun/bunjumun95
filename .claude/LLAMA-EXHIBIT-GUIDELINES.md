# LLAMA GUIDELINES: Exhibit Module Deployment
**Objective:** Create self-contained, high-performance exhibit pages compatible with the BUNJUMUN-DOOM/Maze dual-engine architecture.

---

## 1. Visual Identity (Win95 Aesthetic)
All exhibits must adhere to the Windows 95 design language.

### Color Palette
- **Primary Brand:** `#000080` (Navy Titlebar)
- **Window Background:** `#C0C0C0` (Silver/Grey)
- **Titlebar Text:** `#FFFFFF`
- **Body Text:** `#000000`

### Border Bevels (CSS Variables)
Use these standard bevel styles for that 3D look:
- **Outset (Buttons/Windows):** `inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px #808080, inset 2px 2px #dfdfdf`
- **Inset (Input fields/Status bars):** `inset -1px -1px #fff, inset 1px 1px #0a0a0a, inset -2px -2px #dfdfdf, inset 2px 2px #808080`

---

## 2. Technical Blueprint: Shadow DOM Isolation
Exhibits must be injected into `document.getElementById('exhibit-host')` using **Shadow DOM** to prevent CSS leakage from the main game or into other components.

### Class-Based Structure
Each exhibit module should be implemented as a JS class:
```javascript
class ExhibitPortal {
  constructor(host, engine) {
    this.host = host; // #exhibit-host
    this.engine = engine; // Reference to DoomEngine or MazeEngine
    this.isOpen = false;
  }
}
```

---

## 3. HTML Formatting Requirements
The inner HTML of your `_build()` method must follow this exact hierarchy:

```html
<div class="exhibit-portal">
  <div class="win95-window">
    <div class="win95-titlebar">
      <span class="title">Exhibit: [Project Name]</span>
      <button class="close-btn" aria-label="Close">×</button>
    </div>
    <div class="win95-body">
      <!-- Main Content Area -->
      <div class="content-frame">
         <!-- Iframe or static content goes here -->
      </div>
      <!-- Status Bar -->
      <div class="status-bar">
        <div class="status-field">1 object(s) selected</div>
      </div>
    </div>
  </div>
</div>
```

---

## 4. Compatibility & Lifecycle
The exhibit is responsible for managing the game state when it opens and closes.

### Opening (`open(data)`)
1. **Pause the Engine:** Call `this.engine.pause()`.
2. **Release Mouse:** If in DOOM mode, ensure `document.exitPointerLock()` is called.
3. **Render:** Inject the Win95 template into the Shadow Root.

### Closing (`close()`)
1. **Cleanup:** Clear `this.host.innerHTML = ''`.
2. **Resume Engine:** Call `this.engine.resume()`.
3. **Re-acquire Pointer Lock:**
   - **DOOM Build:** Call `this.engine.requestPointerLock()` which targets `doomCanvas`.
   - **Maze Build:** Target `maze-canvas`.
   - *Note: Always use `this.engine.getCanvas()` to be engine-agnostic.*

---

## 5. Optimization Checklist

### Memory Management
- **Iframe Destructuring:** If using iframes to show external projects, ensure the iframe is removed from the DOM on `close()`. Do not simply hide it with CSS.
- **Event Listeners:** Attach listeners within the `open` method and ensure they are garbage collected when the host is cleared.

### Performance
- **CSS Containment:** Apply `contain: content;` to the `.exhibit-portal` wrapper.
- **Lazy Loading:** For external assets inside the exhibit, use `<img loading="lazy">` or `<iframe loading="lazy">`.
- **Asset Stripping:** Ensure thumbnails used in the DOOM-WAD bridge are stripped of unnecessary metadata to keep the `gallery.wad` small.

---

## 6. CSS Reference (Shadow DOM Scope)
```css
.win95-window {
  background: #C0C0C0;
  box-shadow: inset -1px -1px #0a0a0a, inset 1px 1px #dfdfdf, inset -2px -2px #808080, inset 2px 2px #fff;
  padding: 2px;
}
.win95-titlebar {
  background: #000080;
  color: white;
  font-weight: bold;
  padding: 2px 4px;
}
.close-btn {
  padding: 0 4px;
  height: 14px;
  /* Standard Win95 outset button */
}
```