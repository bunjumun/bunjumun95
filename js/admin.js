// ── AdminConsole ──────────────────────────────────────────────────────────────
// Win95-style admin panel living in a top-level Shadow DOM.
// Key A toggles visibility (only when no exhibit is open).
// Provides: password gate, exhibit list, 4-method exhibit builder.
// ─────────────────────────────────────────────────────────────────────────────

class AdminConsole {
  constructor(hostEl, engine, portal) {
    this.host   = hostEl;
    this.engine = engine;
    this.portal = portal;
    this.shadow = hostEl.attachShadow({ mode: 'open' });

    this.isOpen    = false;
    this.unlocked  = false;
    this.gallery   = null;   // cached gallery from GitHub
    this.gallerySha = null;

    this._build();
  }

  // ── Shadow DOM ───────────────────────────────────────────────────────────────

  _build() {
    this.shadow.innerHTML = `
      <style>
        :host { display: none; }

        * { box-sizing: border-box; }

        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9500;
          font-family: 'Courier New', Courier, monospace;
          font-size: 11px;
        }

        .win95 {
          background: #C0C0C0;
          border: 2px solid;
          border-color: #FFF #808080 #808080 #FFF;
          box-shadow: 3px 3px 0 #000;
          width: min(94vw, 680px);
          max-height: 90vh;
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
          flex-shrink: 0;
          user-select: none;
          letter-spacing: 1px;
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
          line-height: 15px;
        }
        .close-btn:active { border-color: #808080 #FFF #FFF #808080; }

        .body {
          flex: 1;
          overflow-y: auto;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* ── Panels ── */
        .panel {
          border: 2px groove #808080;
          padding: 6px 8px;
        }
        .panel-title {
          font-weight: bold;
          font-size: 10px;
          letter-spacing: 1px;
          margin-bottom: 6px;
          color: #000080;
        }

        /* ── Form Controls ── */
        label { display: block; margin-bottom: 2px; font-size: 10px; }
        input[type=text], input[type=password], textarea, select {
          width: 100%;
          background: #FFF;
          border: 2px inset #808080;
          font-family: inherit;
          font-size: 11px;
          padding: 2px 4px;
          outline: none;
          color: #000;
        }
        textarea { resize: vertical; min-height: 80px; }

        .btn {
          background: #C0C0C0;
          border: 2px solid;
          border-color: #FFF #808080 #808080 #FFF;
          font-family: inherit;
          font-size: 11px;
          padding: 3px 10px;
          cursor: pointer;
          color: #000;
        }
        .btn:active { border-color: #808080 #FFF #FFF #808080; }
        .btn.primary { background: #000080; color: #FFF; border-color: #5555AA #00004A #00004A #5555AA; }
        .btn.danger  { color: #800000; }

        /* ── Status indicator ── */
        .status-dot {
          display: inline-block;
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #808080;
          margin-right: 4px;
        }
        .status-dot.green  { background: #00C000; }
        .status-dot.red    { background: #C00000; }

        /* ── Exhibit list ── */
        .exhibit-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 3px 4px;
          border-bottom: 1px solid #AAAAAA;
          gap: 6px;
        }
        .exhibit-row:last-child { border-bottom: none; }
        .exhibit-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        /* ── Ingestion tabs ── */
        .tab-bar {
          display: flex;
          gap: 2px;
          margin-bottom: 6px;
        }
        .tab {
          background: #AAAAAA;
          border: 1px solid #808080;
          padding: 2px 8px;
          cursor: pointer;
          font-family: inherit;
          font-size: 10px;
          font-weight: bold;
        }
        .tab.active {
          background: #C0C0C0;
          border-bottom: 1px solid #C0C0C0;
        }

        .tab-panel { display: none; }
        .tab-panel.active { display: block; }

        /* ── Thumbnail preview ── */
        #thumb-preview {
          width: 100%;
          max-height: 120px;
          object-fit: contain;
          border: 2px inset #808080;
          background: #000;
          display: none;
          margin-top: 4px;
        }

        /* ── Log area ── */
        #log {
          background: #000;
          color: #00FF00;
          font-size: 10px;
          padding: 4px;
          height: 60px;
          overflow-y: auto;
          border: 2px inset #808080;
          font-family: 'Courier New', Courier, monospace;
        }

        .row { display: flex; gap: 6px; align-items: flex-end; }
        .row > * { flex: 1; }
        .row > .btn { flex: 0 0 auto; }
      </style>

      <div class="overlay">
        <div class="win95">
          <div class="titlebar">
            <span>⚙ ADMIN CONSOLE — BUNJUMUN-MAZE-95</span>
            <button class="close-btn" id="close-btn">✕</button>
          </div>
          <div class="body">

            <!-- ── Auth ── -->
            <div class="panel" id="auth-panel">
              <div class="panel-title">SECURITY PROTOCOL — PASSWORD GATE</div>
              <div id="auth-status">
                <span class="status-dot" id="dot"></span>
                <span id="auth-label">LOCKED</span>
              </div>
              <div id="auth-form" style="margin-top:6px; display:flex; flex-direction:column; gap:4px;">
                <label>System Password
                  <input type="password" id="pw-input" placeholder="Enter password…" autocomplete="off">
                </label>
                <div id="token-row" style="display:none">
                  <label>GitHub PAT (first time only)
                    <input type="password" id="pat-input" placeholder="ghp_…" autocomplete="off">
                  </label>
                </div>
                <div style="display:flex; gap:6px; margin-top:4px;">
                  <button class="btn primary" id="unlock-btn">UNLOCK</button>
                  <button class="btn" id="setup-btn">SETUP NEW TOKEN</button>
                  <button class="btn danger" id="clear-btn">CLEAR TOKEN</button>
                </div>
              </div>
            </div>

            <!-- ── Exhibit List ── -->
            <div class="panel" id="list-panel">
              <div class="panel-title">CURRENT EXHIBITS <span id="exhibit-count">(0)</span></div>
              <div id="exhibit-list"><em style="color:#888;font-size:10px">— unlock to load exhibits —</em></div>
              <div style="margin-top:4px; display:flex; gap:6px;">
                <button class="btn" id="refresh-btn" disabled>↺ REFRESH</button>
              </div>
            </div>

            <!-- ── New Exhibit ── -->
            <div class="panel" id="add-panel">
              <div class="panel-title">NEW EXHIBIT</div>
              <div style="display:flex; flex-direction:column; gap:6px;">
                <label>Title
                  <input type="text" id="ex-title" placeholder="Project title…">
                </label>
                <label>Description (optional)
                  <input type="text" id="ex-desc" placeholder="Short description…">
                </label>

                <!-- Ingestion type tabs -->
                <div>
                  <div class="panel-title" style="margin-bottom:4px;">CONTENT TYPE</div>
                  <div class="tab-bar">
                    <button class="tab active" data-tab="html">RAW HTML</button>
                    <button class="tab" data-tab="file">HTML FILE</button>
                    <button class="tab" data-tab="widget">WIDGET</button>
                    <button class="tab" data-tab="link">EXT. LINK</button>
                  </div>

                  <div class="tab-panel active" id="tab-html">
                    <label>Paste HTML
                      <textarea id="html-content" placeholder="<h1>My Project</h1>…"></textarea>
                    </label>
                  </div>
                  <div class="tab-panel" id="tab-file">
                    <label>Upload .html file
                      <input type="file" id="file-input" accept=".html,.htm" style="margin-top:4px;">
                    </label>
                    <textarea id="file-content" placeholder="File content will appear here…" readonly style="margin-top:4px;"></textarea>
                  </div>
                  <div class="tab-panel" id="tab-widget">
                    <label>Paste iframe snippet (YouTube, Codepen, etc.)
                      <textarea id="widget-content" placeholder='&lt;iframe src="https://…"&gt;&lt;/iframe&gt;'></textarea>
                    </label>
                  </div>
                  <div class="tab-panel" id="tab-link">
                    <label>External URL
                      <input type="text" id="link-url" placeholder="https://…">
                    </label>
                  </div>
                </div>

                <!-- Thumbnail -->
                <div>
                  <div class="panel-title">THUMBNAIL (capped 800px → Base64)</div>
                  <div class="row">
                    <input type="file" id="thumb-input" accept="image/*">
                    <button class="btn" id="thumb-clear-btn">CLEAR</button>
                  </div>
                  <img id="thumb-preview" alt="thumbnail preview">
                </div>

                <button class="btn primary" id="save-btn" disabled>💾 SAVE TO GITHUB</button>
              </div>
            </div>

            <!-- ── Log ── -->
            <div class="panel">
              <div class="panel-title">SYSTEM LOG</div>
              <div id="log"></div>
            </div>

          </div><!-- .body -->
        </div><!-- .win95 -->
      </div><!-- .overlay -->
    `;

    this._bindEvents();
  }

  // ── Events ───────────────────────────────────────────────────────────────────

  _bindEvents() {
    const $ = (id) => this.shadow.getElementById(id);

    $('close-btn').addEventListener('click', () => this.close());

    // ── Auth ──
    $('unlock-btn').addEventListener('click', () => this._unlock());
    $('setup-btn').addEventListener('click',  () => this._showTokenRow());
    $('clear-btn').addEventListener('click',  () => {
      GitHubAPI.clearToken();
      GitHubAPI.clearSession();
      this.unlocked = false;
      this._setLocked();
      this._log('Token cleared.');
    });

    $('pw-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this._unlock();
    });

    // ── Refresh ──
    $('refresh-btn').addEventListener('click', () => this._loadGallery());

    // ── Tabs ──
    this.shadow.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.shadow.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        this.shadow.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        $(`tab-${tab.dataset.tab}`).classList.add('active');
        this._activeTab = tab.dataset.tab;
      });
    });
    this._activeTab = 'html';

    // ── File upload ──
    $('file-input').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const text = await file.text();
      $('file-content').value = text;
    });

    // ── Thumbnail ──
    $('thumb-input').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      this._log('Resizing thumbnail…');
      const { dataUrl } = await GitHubAPI.resizeThumbnail(file);
      this._thumbDataUrl = dataUrl;
      const preview = $('thumb-preview');
      preview.src           = dataUrl;
      preview.style.display = 'block';
      this._log('Thumbnail ready (≤800px).');
    });

    $('thumb-clear-btn').addEventListener('click', () => {
      this._thumbDataUrl          = null;
      $('thumb-input').value      = '';
      $('thumb-preview').src      = '';
      $('thumb-preview').style.display = 'none';
    });

    // ── Save ──
    $('save-btn').addEventListener('click', () => this._saveExhibit());

    this._thumbDataUrl = null;
  }

  // ── Auth ─────────────────────────────────────────────────────────────────────

  _showTokenRow() {
    this.shadow.getElementById('token-row').style.display = 'block';
    this._log('Enter password + PAT to register a new token.');
  }

  async _unlock() {
    const pw  = this.shadow.getElementById('pw-input').value;
    const pat = this.shadow.getElementById('pat-input').value;

    if (!pw) { this._log('ERROR: password required.'); return; }

    // If PAT field is filled, store a new token
    if (pat) {
      GitHubAPI.storeToken(pat, pw);
      this._log('Token stored (encrypted).');
      this.shadow.getElementById('pat-input').value  = '';
      this.shadow.getElementById('token-row').style.display = 'none';
    }

    // Retrieve & test
    const token = GitHubAPI.retrieveToken(pw);
    if (!token) {
      this._log('ERROR: no stored token. Use SETUP NEW TOKEN first.');
      return;
    }

    GitHubAPI.setSessionToken(token);

    // Test connection
    try {
      this._log('Testing GitHub connection…');
      await GitHubAPI.getGallery();
      this.unlocked = true;
      this._setUnlocked();
      this._log('✓ Connected to bunjumun/bunjumun95');
      this._loadGallery();
    } catch (err) {
      GitHubAPI.clearSession();
      this._log(`ERROR: ${err.message}`);
    }
  }

  _setUnlocked() {
    const dot   = this.shadow.getElementById('dot');
    const label = this.shadow.getElementById('auth-label');
    dot.className   = 'status-dot green';
    label.textContent = 'UNLOCKED';
    this.shadow.getElementById('save-btn').disabled    = false;
    this.shadow.getElementById('refresh-btn').disabled = false;
  }

  _setLocked() {
    const dot   = this.shadow.getElementById('dot');
    const label = this.shadow.getElementById('auth-label');
    dot.className     = 'status-dot red';
    label.textContent = 'LOCKED';
    this.shadow.getElementById('save-btn').disabled    = true;
    this.shadow.getElementById('refresh-btn').disabled = true;
    this.shadow.getElementById('exhibit-list').innerHTML =
      '<em style="color:#888;font-size:10px">— unlock to load exhibits —</em>';
  }

  // ── Gallery ──────────────────────────────────────────────────────────────────

  async _loadGallery() {
    this._log('Fetching gallery.json…');
    try {
      const { gallery, sha } = await GitHubAPI.getGallery();
      this.gallery    = gallery;
      this.gallerySha = sha;
      this._renderList();
      this._log(`✓ Loaded ${gallery.exhibits.length} exhibit(s).`);
    } catch (err) {
      this._log(`ERROR loading gallery: ${err.message}`);
    }
  }

  _renderList() {
    const list  = this.shadow.getElementById('exhibit-list');
    const count = this.shadow.getElementById('exhibit-count');
    const exs   = this.gallery?.exhibits || [];
    count.textContent = `(${exs.length})`;

    if (exs.length === 0) {
      list.innerHTML = '<em style="color:#888;font-size:10px">No exhibits yet.</em>';
      return;
    }

    list.innerHTML = exs.map((ex, i) => `
      <div class="exhibit-row">
        <span class="exhibit-name">📄 ${ex.title || '(untitled)'}</span>
        <span style="color:#444;font-size:10px">${ex.type}</span>
        <button class="btn danger" data-idx="${i}" style="font-size:10px;padding:1px 6px">DEL</button>
      </div>
    `).join('');

    list.querySelectorAll('.btn.danger').forEach(btn => {
      btn.addEventListener('click', () => this._deleteExhibit(parseInt(btn.dataset.idx)));
    });
  }

  async _deleteExhibit(idx) {
    if (!this.gallery) return;
    const name = this.gallery.exhibits[idx]?.title || idx;
    this.gallery.exhibits.splice(idx, 1);
    this._log(`Deleting exhibit "${name}"…`);
    await this._pushGallery();
  }

  // ── Save Exhibit ─────────────────────────────────────────────────────────────

  async _saveExhibit() {
    const $ = (id) => this.shadow.getElementById(id);
    const title = $('ex-title').value.trim();
    if (!title) { this._log('ERROR: title is required.'); return; }

    // Determine content based on active tab
    let type, content;
    switch (this._activeTab) {
      case 'html':
        type    = 'html';
        content = $('html-content').value;
        break;
      case 'file':
        type    = 'html';
        content = $('file-content').value;
        break;
      case 'widget':
        type    = 'widget';
        content = $('widget-content').value;
        break;
      case 'link':
        type    = 'link';
        content = $('link-url').value.trim();
        break;
      default:
        this._log('ERROR: select a content type tab.');
        return;
    }

    if (!content) { this._log('ERROR: content is required.'); return; }

    const exhibit = {
      id:          `exhibit-${Date.now()}`,
      title,
      description: $('ex-desc').value.trim() || undefined,
      type,
      content,
      thumbnail:   this._thumbDataUrl || null,
    };

    // Ensure gallery is loaded
    if (!this.gallery) {
      this._log('Fetching gallery before save…');
      await this._loadGallery();
    }

    this.gallery.exhibits.push(exhibit);
    this._log(`Saving "${title}"…`);
    await this._pushGallery();

    // Reset form
    $('ex-title').value      = '';
    $('ex-desc').value       = '';
    $('html-content').value  = '';
    $('file-content').value  = '';
    $('widget-content').value = '';
    $('link-url').value      = '';
    $('thumb-input').value   = '';
    $('thumb-preview').style.display = 'none';
    this._thumbDataUrl = null;
  }

  async _pushGallery() {
    try {
      const result        = await GitHubAPI.updateGallery(this.gallery, this.gallerySha);
      this.gallerySha     = result.content.sha;
      this._renderList();
      this._log('✓ gallery.json updated on GitHub.');
    } catch (err) {
      // Roll back optimistic push
      this._log(`ERROR pushing gallery: ${err.message}`);
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  _log(msg) {
    const log = this.shadow.getElementById('log');
    const line = document.createElement('div');
    line.textContent = `> ${msg}`;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  }

  // ── Open / Close ─────────────────────────────────────────────────────────────

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.host.style.display = 'block';
    this.engine.pause();
    document.exitPointerLock();
  }

  close() {
    this.isOpen = false;
    this.host.style.display = 'none';
    this.engine.resume();
    setTimeout(() => {
      document.getElementById('maze-canvas')?.requestPointerLock();
    }, 100);
  }
}
