// ── GitHubAPI ─────────────────────────────────────────────────────────────────
// Reads and writes gallery.json via the GitHub Contents API (authenticated PUT).
// Security: PAT is stored in localStorage as XOR-ciphered + base64 string.
// No token is ever committed to the repository.
// ─────────────────────────────────────────────────────────────────────────────

const GitHubAPI = (() => {
  const REPO_OWNER   = 'bunjumun';
  const REPO_NAME    = 'bunjumun95';
  const GALLERY_PATH = 'gallery.json';
  const TOKEN_KEY    = 'bmaze_token';

  // ── Cipher (XOR + base64 — keeps token off plain localStorage) ─────────────

  function _xorCipher(str, key) {
    let out = '';
    for (let i = 0; i < str.length; i++) {
      out += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return out;
  }

  function storeToken(token, password) {
    const encrypted = btoa(_xorCipher(token, password));
    localStorage.setItem(TOKEN_KEY, encrypted);
  }

  function retrieveToken(password) {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) return null;
    try {
      return _xorCipher(atob(stored), password);
    } catch {
      return null;
    }
  }

  function hasStoredToken() {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  // Active (unlocked) session token — held in memory only, never re-persisted
  let _sessionToken = null;

  function setSessionToken(token) { _sessionToken = token; }
  function getSessionToken()      { return _sessionToken; }
  function clearSession()         { _sessionToken = null; }

  // ── GitHub Contents API ──────────────────────────────────────────────────────

  function _headers() {
    if (!_sessionToken) throw new Error('Not authenticated. Unlock Admin Console first.');
    return {
      'Authorization': `token ${_sessionToken}`,
      'Content-Type':  'application/json',
      'Accept':        'application/vnd.github.v3+json',
    };
  }

  function _apiUrl(path) {
    return `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
  }

  /**
   * Fetch gallery.json from GitHub.
   * @returns {{ gallery: object, sha: string }}
   */
  async function getGallery() {
    const res  = await fetch(_apiUrl(GALLERY_PATH), { headers: _headers() });
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
    const data    = await res.json();
    const content = JSON.parse(atob(data.content.replace(/\n/g, '')));
    return { gallery: content, sha: data.sha };
  }

  /**
   * Overwrite gallery.json on GitHub.
   * @param {object} gallery - full gallery object
   * @param {string} sha     - current file SHA (required by GitHub API)
   */
  async function updateGallery(gallery, sha) {
    const body = {
      message: 'chore: update gallery via Admin Console',
      content: btoa(unescape(encodeURIComponent(JSON.stringify(gallery, null, 2)))),
      sha,
    };
    const res = await fetch(_apiUrl(GALLERY_PATH), {
      method:  'PUT',
      headers: _headers(),
      body:    JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
    return res.json();
  }

  /**
   * Upload a binary file (e.g. thumbnail image) to the repo.
   * @param {string} repoPath  - path inside repo, e.g. 'assets/thumb-001.png'
   * @param {string} b64Data   - raw base64 (no data URL prefix)
   * @param {string|null} sha  - existing file SHA if updating
   */
  async function uploadFile(repoPath, b64Data, sha = null) {
    const body = {
      message: `chore: upload asset ${repoPath}`,
      content: b64Data,
    };
    if (sha) body.sha = sha;
    const res = await fetch(_apiUrl(repoPath), {
      method:  'PUT',
      headers: _headers(),
      body:    JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
    return res.json();
  }

  // ── Thumbnail Helper ─────────────────────────────────────────────────────────

  /**
   * Resize an image File/Blob to max 800px wide using Canvas, then return
   * a data URL and a raw base64 string.
   * @param {File|Blob} file
   * @returns {Promise<{ dataUrl: string, base64: string, mimeType: string }>}
   */
  function resizeThumbnail(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload  = (e) => {
        const img = new Image();
        img.onerror = reject;
        img.onload  = () => {
          const MAX_W = 800;
          let w = img.width;
          let h = img.height;
          if (w > MAX_W) {
            h = Math.round((h * MAX_W) / w);
            w = MAX_W;
          }
          const cv  = document.createElement('canvas');
          cv.width  = w;
          cv.height = h;
          cv.getContext('2d').drawImage(img, 0, 0, w, h);

          const mimeType = file.type || 'image/jpeg';
          const dataUrl  = cv.toDataURL(mimeType, 0.88);
          const base64   = dataUrl.split(',')[1];
          resolve({ dataUrl, base64, mimeType });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  return {
    storeToken, retrieveToken, hasStoredToken, clearToken,
    setSessionToken, getSessionToken, clearSession,
    getGallery, updateGallery, uploadFile,
    resizeThumbnail,
    REPO_OWNER, REPO_NAME,
  };
})();
