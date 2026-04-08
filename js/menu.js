// ── menu.js ───────────────────────────────────────────────────────────────────
// Win95-style game menu for BUNJUMUN-MAZE-95.
// Shows at page load. Fires document event 'menu:start' when player clicks START.
// Reopens on 'menu:open' event (e.g. from ESC key in maze).
// ChatGPT review applied: bevels, arrow-key nav, bubbles+composed event, clock.
// ─────────────────────────────────────────────────────────────────────────────

class GameMenu {
  constructor() {
    this.hostEl = document.createElement('div');
    this.hostEl.id = 'menu-host';
    document.body.appendChild(this.hostEl);
    this.shadow = this.hostEl.attachShadow({ mode: 'open' });
    this._visible = false;
    this._build();
    this._wire();
    document.addEventListener('menu:open', () => this.show());
  }

  _build() {
    this.shadow.innerHTML = `
      <style>
        :host { display: block; }

        .overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: #008080;
          display: flex; align-items: center; justify-content: center;
          z-index: 9999;
          font-family: 'MS Sans Serif', 'Arial', sans-serif;
          font-size: 12px;
        }

        .window {
          background: #C0C0C0;
          border-top: 2px solid #FFFFFF;
          border-left: 2px solid #FFFFFF;
          border-right: 2px solid #404040;
          border-bottom: 2px solid #404040;
          min-width: 320px;
          box-shadow: 2px 2px 0 #000;
        }

        .titlebar {
          background: #000080; color: #FFFFFF;
          padding: 4px 6px;
          font-weight: bold; font-size: 11px;
          display: flex; justify-content: space-between; align-items: center;
          cursor: default; user-select: none;
        }

        .titlebar-btns { display: flex; gap: 2px; }
        .titlebar-btn {
          width: 16px; height: 14px;
          background: #C0C0C0;
          border-top: 1px solid #FFF; border-left: 1px solid #FFF;
          border-right: 1px solid #404040; border-bottom: 1px solid #404040;
          font-size: 9px; font-weight: bold;
          display: flex; align-items: center; justify-content: center;
          cursor: default;
        }

        .body { padding: 20px 24px 16px; }

        .logo {
          background: #000080; color: #FFFFFF;
          padding: 10px 20px; font-size: 15px; font-weight: bold;
          letter-spacing: 2px; text-align: center; margin-bottom: 16px;
          border-top: 2px solid #404040; border-left: 2px solid #404040;
          border-right: 2px solid #FFFFFF; border-bottom: 2px solid #FFFFFF;
          line-height: 1.4;
        }

        /* Win95 beveled button — ChatGPT improvement */
        .btn {
          display: block; width: 100%; margin: 3px 0; padding: 5px 12px;
          background: #C0C0C0;
          border-top: 2px solid #FFFFFF; border-left: 2px solid #FFFFFF;
          border-right: 2px solid #404040; border-bottom: 2px solid #404040;
          font-family: inherit; font-size: 12px;
          cursor: default; text-align: left; outline: none;
        }
        .btn:active {
          border-top: 2px solid #404040; border-left: 2px solid #404040;
          border-right: 2px solid #FFFFFF; border-bottom: 2px solid #FFFFFF;
          padding: 6px 11px 4px 13px;
        }
        .btn:focus {
          outline: 1px dotted #000;
          outline-offset: -4px;
        }

        .footer {
          font-size: 10px; color: #808080;
          margin-top: 10px; text-align: center; min-height: 14px;
        }

        /* Win95 taskbar */
        .taskbar {
          position: fixed; bottom: 0; left: 0; right: 0; height: 28px;
          background: #C0C0C0; border-top: 2px solid #FFFFFF;
          display: flex; align-items: center; padding: 0 4px; gap: 4px;
          font-size: 11px; z-index: 10000;
          font-family: 'MS Sans Serif', 'Arial', sans-serif;
        }
        .start-btn {
          background: #C0C0C0;
          border-top: 2px solid #FFFFFF; border-left: 2px solid #FFFFFF;
          border-right: 2px solid #404040; border-bottom: 2px solid #404040;
          padding: 2px 10px; font-weight: bold; font-size: 11px;
          font-family: inherit; cursor: default;
        }
        .start-btn:active {
          border-top: 2px solid #404040; border-left: 2px solid #404040;
          border-right: 2px solid #FFFFFF; border-bottom: 2px solid #FFFFFF;
        }
        .clock {
          margin-left: auto;
          border-top: 1px solid #808080; border-left: 1px solid #808080;
          border-right: 1px solid #FFFFFF; border-bottom: 1px solid #FFFFFF;
          padding: 2px 8px; font-size: 10px;
        }
      </style>

      <div class="overlay" id="overlay">
        <div class="window">
          <div class="titlebar">
            <span>BUNJUMUN GALLERY 95</span>
            <div class="titlebar-btns">
              <div class="titlebar-btn">_</div>
              <div class="titlebar-btn">&#9633;</div>
              <div class="titlebar-btn">&#x2715;</div>
            </div>
          </div>
          <div class="body">
            <div class="logo">BUNJUMUN<br>GALLERY 95</div>
            <button class="btn" id="btn-start">&#9654; START EXPLORATION</button>
            <button class="btn" id="btn-settings">&#9881; SETTINGS</button>
            <button class="btn" id="btn-admin">&#128273; ADMIN CONSOLE</button>
            <button class="btn" id="btn-fps">&#9670; FPS MODE  [F key in-maze]</button>
            <button class="btn" id="btn-credits">&#9432; CREDITS</button>
            <div class="footer" id="footer-msg">v1.0 &middot; Use &#8593;&#8595; arrows + ENTER</div>
          </div>
        </div>
      </div>

      <div class="taskbar">
        <button class="start-btn" id="taskbar-start">&#10063; Start</button>
        <div class="clock" id="clock"></div>
      </div>`;

    this._startClock();
  }

  _startClock() {
    const update = () => {
      const el = this.shadow.getElementById('clock');
      if (el) el.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    update();
    this._clockInterval = setInterval(update, 10000);
  }

  _wire() {
    const s = this.shadow;

    s.getElementById('btn-start').onclick     = () => this._start();
    s.getElementById('taskbar-start').onclick = () => this._start();
    s.getElementById('btn-settings').onclick  = () => this._msg('Settings \u2014 coming soon.');
    s.getElementById('btn-admin').onclick     = () => {
      this._start();
      setTimeout(() => document.dispatchEvent(new CustomEvent('admin:open')), 300);
    };
    s.getElementById('btn-fps').onclick       = () => this._msg('FPS MODE: Press F while exploring to toggle pointer-lock shooting.');
    s.getElementById('btn-credits').onclick   = () => this._msg('BUNJUMUN GALLERY 95 v1.0 \u2014 bunjumun.com \u2014 Built with Three.js r128');

    // Arrow key navigation between buttons (ChatGPT suggestion)
    s.addEventListener('keydown', (e) => {
      const buttons = [...s.querySelectorAll('.btn')];
      const idx = buttons.indexOf(s.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); buttons[(idx + 1) % buttons.length].focus(); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); buttons[(idx - 1 + buttons.length) % buttons.length].focus(); }
      if (e.key === 'Enter' && idx >= 0) { s.activeElement.click(); }
    });

    // Global Enter = START if menu open and no button focused
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && this._visible && !s.activeElement?.classList.contains('btn')) {
        this._start();
      }
    });
  }

  _msg(text) {
    const el = this.shadow.getElementById('footer-msg');
    if (el) el.textContent = text;
  }

  _start() {
    this.hide();
    // bubbles+composed: crosses Shadow DOM boundaries (ChatGPT fix)
    document.dispatchEvent(new CustomEvent('menu:start', { bubbles: true, composed: true }));
  }

  show() {
    this._visible = true;
    this.hostEl.style.display = 'block';
    setTimeout(() => this.shadow.getElementById('btn-start')?.focus(), 50);
  }

  hide() {
    this._visible = false;
    this.hostEl.style.display = 'none';
  }
}

window.GameMenu = GameMenu;
