# GitHub Repository Setup for BUNJUMUN-MAZE-95

## Step 1: Create Repo on GitHub.com

1. Go to https://github.com/new
2. **Repository name:** `bunjumun95`
3. **Owner:** `bunjumun` (your GitHub account)
4. **Description:** "3D Win95 Maze + Dynamic Gallery CMS"
5. **Visibility:** Public (or Private if preferred)
6. **Do NOT initialize with README** (we already have one)
7. Click **Create repository**

---

## Step 2: Add Remote & Push (Run in Terminal)

```bash
cd "/Users/bunj/claude/portfolio maze"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/bunjumun/bunjumun95.git

# Verify remote is set
git remote -v

# Push main branch
git branch -M main
git push -u origin main
```

**Expected output:**
```
Enumerating objects: 17, done.
Counting objects: 100% (17/17), done.
Delta compression using up to 8 threads.
Compressing objects: 100%, done.
Writing objects: 100% (17/17), xxxxx bytes...
remote: To create a merge request for main, visit:
remote: https://github.com/bunjumun/bunjumun95/merge_requests/...
...
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## Step 3: Enable GitHub Pages

1. Go to **repo settings** → **Pages**
2. **Source:** `Deploy from a branch`
3. **Branch:** `main` / `root`
4. **Save**
5. GitHub will show: `Your site is published at https://bunjumun.github.io/bunjumun95`

---

## Step 4: Verify Deployment

Wait 1–2 minutes, then:

```bash
# Check if it deployed
curl -I https://bunjumun.github.io/bunjumun95/
```

Expected: `200 OK` (not 404)

Open in browser: https://bunjumun.github.io/bunjumun95

---

## Step 5: First-Time Admin Console Setup

Once live on GitHub Pages:

1. **Open the site:** https://bunjumun.github.io/bunjumun95
2. **Press A** to open Admin Console
3. **Enter a password** (any string; used to unlock stored token)
4. **Click SETUP NEW TOKEN**
5. **Get your GitHub PAT:**
   - Go to https://github.com/settings/tokens
   - Click **Generate new token** (classic)
   - **Scopes:** check `repo` (full control of private & public repositories)
   - **Expiration:** 30 days minimum
   - Copy the token (won't be shown again!)
6. **Paste PAT** into Admin Console
7. **Click UNLOCK**
   - Console connects to `bunjumun/bunjumun95`
   - Loads `gallery.json`
   - Shows authenticated status (green dot)

---

## Troubleshooting

### `fatal: remote origin already exists`
```bash
git remote remove origin
git remote add origin https://github.com/bunjumun/bunjumun95.git
```

### `permission denied`
Make sure you're using:
- SSH key (if set up): `git@github.com:bunjumun/bunjumun95.git`
- OR HTTPS with PAT: `https://<your-token>@github.com/bunjumun/bunjumun95.git`

### `404 Not Found` on GitHub Pages
- Wait 2–3 minutes for GitHub to finish deploying
- Check that `.nojekyll` exists in root
- Verify `index.html` is in root (not in a folder)
- Check repo settings → Pages → Source is set correctly

### Admin console says `ERROR: GitHub API 401`
- PAT is either:
  - Expired (check github.com/settings/tokens)
  - Wrong scope (needs `repo`)
  - Typed incorrectly (copy-paste again)
- Delete token in localStorage and try again:
  ```javascript
  localStorage.removeItem('bmaze_token');
  location.reload();
  ```

---

## Quick Verification Checklist

- [ ] Repo created on GitHub.com
- [ ] `git remote -v` shows origin URL
- [ ] `git push -u origin main` succeeds
- [ ] GitHub Pages enabled (Settings → Pages)
- [ ] Site accessible at `https://bunjumun.github.io/bunjumun95`
- [ ] Can open Admin Console (A key)
- [ ] PAT unlocks successfully (green dot)
- [ ] Can see `gallery.json` load in console

---

**Ready to add exhibits!** Once unlocked, you can:
- Paste raw HTML
- Upload `.html` files
- Add iframe widgets (YouTube, Codepen, etc.)
- Link to external projects
- Upload thumbnails (auto-resized to 800px)

Each exhibit is stored in `gallery.json` on GitHub and synced via authenticated API PUT requests.
