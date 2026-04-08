# GEMINI TASK — Win95 Menu + FPS Mode + Patches
**Date:** 2026-04-08
**Repo:** https://github.com/bunjumun/bunjumun95 (branch: main)

## CRITICAL RULES
1. Read FULL file before editing. No partial reads.
2. Patch specific sections only — do NOT rewrite entire files
3. Bump `?v=N` in index.html for every changed JS file
4. Write summary to `.claude/GEMINI-RESPONSE.md` when done

---

## TASK 1: Replace `js/menu.js` with this complete file:

```javascript
// js/menu.js — Win95 Game Menu for BUNJUMUN-MAZE-95
class GameMenu {
  constructor() {
    this.hostEl = document.createElement('div');
    this.hostEl.id = 'menu-host';
    document.body.appendChild(this.hostEl);
    this.shadow = this.hostEl.attachShadow({ mode: 'open' });
    this._visible = true;
    this._build();
    this._wire();
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && this._visible) this._start();
    });
  }

  _build() {
    this.shadow.innerHTML = `
      <style>
        .overlay { position:fixed;top:0;left:0;width:100%;height:100%;background:#008080;display:flex;align-items:center;justify-content:center;z-index:9999;font-family:'MS Sans Serif',Arial,sans-serif; }
        .window { background:#C0C0C0;border:2px solid;border-color:#FFF #808080 #808080 #FFF;box-shadow:2px 2px 0 #000;min-width:300px; }
        .titlebar { background:#000080;color:#FFF;padding:3px 6px;font-size:11px;font-weight:bold;display:flex;justify-content:space-between; }
        .body { padding:20px 28px;text-align:center; }
        .logo { background:#000080;color:#FFF;padding:10px 20px;font-size:14px;font-weight:bold;letter-spacing:2px;margin-bottom:16px;border:2px inset #808080; }
        .btn { display:block;width:100%;margin:3px 0;padding:5px 10px;background:#C0C0C0;border:2px solid;border-color:#FFF #808080 #808080 #FFF;font-family:inherit;font-size:12px;cursor:pointer;text-align:left; }
        .btn:active { border-color:#808080 #FFF #FFF #808080; }
        .btn:hover { background:#D4D0C8; }
        .footer { font-size:10px;color:#808080;margin-top:10px; }
      </style>
      <div class="overlay">
        <div class="window">
          <div class="titlebar"><span>BUNJUMUN GALLERY 95</span><span>▣</span></div>
          <div class="body">
            <div class="logo">BUNJUMUN<br>GALLERY 95</div>
            <button class="btn" id="btn-start">&#9654; START EXPLORATION</button>
            <button class="btn" id="btn-settings">&#9881; SETTINGS</button>
            <button class="btn" id="btn-admin">&#128273; ADMIN CONSOLE</button>
            <button class="btn" id="btn-fps">&#9670; FPS MODE  [F key in-maze]</button>
            <button class="btn" id="btn-credits">&#9432; CREDITS</button>
            <div class="footer" id="footer-msg">v1.0 &middot; Press ENTER to start</div>
          </div>
        </div>
      </div>`;
  }

  _wire() {
    const s = this.shadow;
    s.getElementById('btn-start').onclick    = () => this._start();
    s.getElementById('btn-settings').onclick = () => this._msg('Settings coming soon.');
    s.getElementById('btn-admin').onclick    = () => { this._start(); document.dispatchEvent(new CustomEvent('admin:open')); };
    s.getElementById('btn-fps').onclick      = () => this._msg('FPS MODE: Press F while in maze to toggle pointer-lock shooting.');
    s.getElementById('btn-credits').onclick  = () => this._msg('BUNJUMUN GALLERY 95 v1.0 \u2014 bunjumun.com \u2014 Built with Three.js');
  }

  _msg(text) { this.shadow.getElementById('footer-msg').textContent = text; }

  _start() {
    this._visible = false;
    this.hostEl.style.display = 'none';
    document.dispatchEvent(new CustomEvent('menu:start'));
  }

  show() { this.hostEl.style.display = ''; this._visible = true; }
  hide() { this._start(); }
}

window.GameMenu = GameMenu;
```

---

## TASK 2: Patch `js/main.js`

Find and replace:
```js
const selectedMode = await showModeSelector();
```
With:
```js
const menu = new GameMenu();
await new Promise(resolve => document.addEventListener('menu:start', resolve, { once: true }));
```

Also add after admin console is created (find `new AdminConsole(`):
```js
document.addEventListener('admin:open', () => admin.open());
```

---

## TASK 3: Patch `js/exhibit.js` — ESC fix

Find the ESC keydown listener. Change to capture phase + stopPropagation:
```js
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && this.isOpen) {
    e.stopPropagation();
    this.close();
  }
}, true);
```
Also: remove any `requestPointerLock()` call inside `close()`.

---

## TASK 4: Patch `js/controls.js` — F key FPS toggle

Add to constructor after `_attachListeners()`:
```js
this._fpsMode = localStorage.getItem('fpsMode') === 'true';
document.addEventListener('pointerlockchange', () => {
  this._fpsMode = !!document.pointerLockElement;
  document.body.classList.toggle('fps-active', this._fpsMode);
});
```

Add method:
```js
setFpsMode(enabled) {
  this._fpsMode = enabled;
  localStorage.setItem('fpsMode', String(enabled));
  if (enabled) this.domElement.requestPointerLock();
  else document.exitPointerLock();
  document.body.classList.toggle('fps-active', enabled);
}
```

Inside `_onKeyDown`, add at the top:
```js
if (e.code === 'KeyF') { this.setFpsMode(!this._fpsMode); return; }
```

---

## TASK 5: Patch `index.html`

1. Add before `<script src="js/main.js">`:
   `<script src="js/menu.js?v=1"></script>`
2. Bump versions: `exhibit.js?v=2`, `controls.js?v=2`, `main.js?v=2`
3. Add to CSS: `body.fps-active #crosshair { color: red; opacity: 1; }`

---

## FPS DECISION: Option C (F key) — recommended by gemma3:4b analysis
Best balance of accessibility + simplicity for a portfolio site.
