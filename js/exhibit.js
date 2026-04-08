// ── ExhibitPortal ─────────────────────────────────────────────────────────────
// Win95-style exhibit viewer living in a top-level Shadow DOM.
// Opening pauses the maze engine; closing resumes it and re-acquires pointer lock.
// ─────────────────────────────────────────────────────────────────────────────

class ExhibitPortal {
  constructor(hostEl, engine) {
    this.host   = hostEl;
    this.engine = engine;
    this.shadow = hostEl.attachShadow({ mode: 'open' });
    this.isOpen = false;

    this._build();
  }

  // ── Build Shadow DOM ─────────────────────────────────────────────────────────

  _build() {
    this.shadow.innerHTML = `
      <style>
        :host { display: none; }

        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.82);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9000;
          font-family: 'Courier New', Courier, monospace;
        }

        .win95 {
          background: #C0C0C0;
          border: 2px solid;
          border-color: #FFFFFF #808080 #808080 #FFFFFF;
          box-shadow: 2px 2px 0 #000;
          width: min(92vw, 920px);
          max-height: 88vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .titlebar {
          background: #000080;
          color: #FFF;
          padding: 3px 6px;
          font-size: 11px;
          font-weight: bold;
          display: flex;
          justify-content: space-between;
          align-items: center;
          user-select: none;
          flex-shrink: 0;
        }

        .titlebar-title {
          letter-spacing: 1px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .close-btn {
          background: #C0C0C0;
          border: 1px solid;
          border-color: #FFF #808080 #808080 #FFF;
          color: #000;
          font-size: 10px;
          font-family: inherit;
          padding: 0 5px;
          cursor: pointer;
          line-height: 16px;
          flex-shrink: 0;
        }
        .close-btn:active {
          border-color: #808080 #FFF #FFF #808080;
        }

        .menubar {
          background: #C0C0C0;
          border-bottom: 1px solid #808080;
          padding: 2px 4px;
          font-size: 11px;
          display: flex;
          gap: 12px;
          flex-shrink: 0;
        }

        .content-area {
          flex: 1;
          overflow: auto;
          background: #FFF;
          border: 2px inset #808080;
          margin: 4px;
          position: relative;
          min-height: 300px;
        }

        .content-area iframe {
          width: 100%;
          height: 100%;
          min-height: 460px;
          border: none;
          display: block;
        }

        .content-area .html-wrap {
          padding: 16px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 12px;
        }

        .link-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px;
          gap: 16px;
        }

        .link-wrap .exhibit-title {
          font-size: 16px;
          font-weight: bold;
          letter-spacing: 2px;
        }

        .link-wrap a {
          background: #C0C0C0;
          border: 2px solid;
          border-color: #FFF #808080 #808080 #FFF;
          color: #000;
          text-decoration: none;
          padding: 6px 20px;
          font-family: inherit;
          font-size: 12px;
          cursor: pointer;
        }
        .link-wrap a:active {
          border-color: #808080 #FFF #FFF #808080;
        }

        .statusbar {
          background: #C0C0C0;
          border-top: 1px solid #808080;
          padding: 2px 6px;
          font-size: 10px;
          color: #444;
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        .statusbar span {
          border: 1px inset #808080;
          padding: 0 4px;
        }
      </style>

      <div class="overlay" id="overlay">
        <div class="win95" role="dialog" aria-modal="true">
          <div class="titlebar">
            <span class="titlebar-title" id="win-title">EXHIBIT VIEWER</span>
            <button class="close-btn" id="close-btn" title="Close">✕</button>
          </div>
          <div class="menubar">
            <span>File</span><span>View</span><span>Help</span>
          </div>
          <div class="content-area" id="content-area"></div>
          <div class="statusbar">
            <span id="status-type">—</span>
            <span>BUNJUMUN-MAZE-95</span>
          </div>
        </div>
      </div>
    `;

    this.shadow.getElementById('close-btn').addEventListener('click', () => this.close());

    // ESC to close — stop propagation so DOOM engine doesn't also receive the key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        e.stopPropagation();
        this.close();
      }
    }, true); // capture phase so we intercept before DOOM's listener
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  open(exhibit) {
    this.isOpen = true;
    this.host.style.display = 'block';
    this.engine.pause();

    const title = exhibit.title || 'EXHIBIT';
    this.shadow.getElementById('win-title').textContent =
      `EXHIBIT VIEWER — ${title.toUpperCase()}`;
    this.shadow.getElementById('status-type').textContent =
      (exhibit.type || 'html').toUpperCase();

    this._renderContent(exhibit);
  }

  close() {
    this.isOpen = false;
    this.host.style.display = 'none';

    // Clear iframe/content to stop any media
    this.shadow.getElementById('content-area').innerHTML = '';

    this.engine.resume();

    // DOOM re-acquires pointer lock on its own via canvas click — no action needed here.
  }

  // ── Content Rendering ────────────────────────────────────────────────────────

  _renderContent(exhibit) {
    const area = this.shadow.getElementById('content-area');
    area.innerHTML = '';

    switch (exhibit.type) {
      case 'html': {
        const wrap = document.createElement('div');
        wrap.className = 'html-wrap';
        wrap.innerHTML = exhibit.content || '<p>No content.</p>';
        area.appendChild(wrap);
        break;
      }
      case 'iframe':
      case 'widget': {
        // exhibit.content may be a URL string or an iframe snippet
        if (exhibit.content && exhibit.content.trim().startsWith('<')) {
          // Raw iframe snippet
          const wrap = document.createElement('div');
          wrap.innerHTML = exhibit.content;
          area.appendChild(wrap);
        } else {
          const frame = document.createElement('iframe');
          frame.src     = exhibit.content || '';
          frame.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups';
          frame.allow   = 'autoplay; fullscreen';
          area.appendChild(frame);
        }
        break;
      }
      case 'link': {
        const wrap = document.createElement('div');
        wrap.className = 'link-wrap';
        wrap.innerHTML = `
          <div class="exhibit-title">${exhibit.title || 'PROJECT'}</div>
          ${exhibit.description ? `<p style="font-size:11px;text-align:center;max-width:400px">${exhibit.description}</p>` : ''}
          <a href="${exhibit.content}" target="_blank" rel="noopener noreferrer">
            ▶ OPEN PROJECT
          </a>
        `;
        area.appendChild(wrap);
        break;
      }
      default: {
        area.innerHTML = '<div class="html-wrap"><p>Unknown exhibit type.</p></div>';
      }
    }
  }
}
