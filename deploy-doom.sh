#!/bin/bash
# BUNJUMUN-DOOM: Automated Commit & Deploy Pipeline
# Run this after test-doom.sh passes

set -e

PROJECT_DIR="/Users/bunj/claude/portfolio maze"
cd "$PROJECT_DIR"

echo "═══════════════════════════════════════════════════════════════"
echo "BUNJUMUN-DOOM: Commit & GitHub Pages Deployment"
echo "═══════════════════════════════════════════════════════════════"

# ── Step 1: Verify test passed ───────────────────────────────────
echo ""
echo "Step 1: Checking test results..."
if [ ! -f "test-results.txt" ]; then
  echo "❌ ERROR: test-results.txt not found. Run test-doom.sh first."
  exit 1
fi

if ! grep -q "ALL TESTS PASSED" test-results.txt; then
  echo "❌ ERROR: Tests failed. Review test-results.txt:"
  cat test-results.txt
  exit 1
fi
echo "✅ All tests passed"

# ── Step 2: Stage all changes ────────────────────────────────────
echo ""
echo "Step 2: Staging changes..."
git add -A
git status

# ── Step 3: Create commit ────────────────────────────────────────
echo ""
echo "Step 3: Creating commit..."
git commit -m "$(cat <<'EOF'
feat: implement DOOM-only mode with self-hosted PrBoom engine

- Add DOOM-only bootstrap (main.js, index.html)
- Implement PrBoom WebAssembly integration (doom-engine.js)
- Add WASM memory bridge for exhibit triggers (doom-bridge.js)
- Implement particle effect system (explosion.js)
- Build gallery WAD with exhibit painting walls (gallery.wad)
- Add gallery texture management (gallery-wad.js)
- Preserve maze mode on bunjumaze repo (v1.0-maze tag)
- Maintain Win95 aesthetic and exhibit portal system
- Dynamic gallery sizing formula already integrated

Co-Authored-By: Claude Code
EOF
)"

echo "✅ Commit created"
git log --oneline -1

# ── Step 4: Push to GitHub ───────────────────────────────────────
echo ""
echo "Step 4: Pushing to GitHub..."
git push -u origin main
echo "✅ Pushed to origin/main"

# ── Step 5: Enable GitHub Pages ──────────────────────────────────
echo ""
echo "Step 5: GitHub Pages status..."
echo "⚠️  MANUAL STEP REQUIRED:"
echo "    1. Go to https://github.com/bunjumun/bunjumun95/settings/pages"
echo "    2. Set source to: main branch, / (root)"
echo "    3. Wait ~30 seconds for deployment"
echo "    4. Site will be live at: https://bunjumun.github.io/bunjumun95"

# ── Step 6: Wait and verify live ─────────────────────────────────
echo ""
echo "Step 6: Waiting for GitHub Pages to deploy..."
for i in {1..60}; do
  echo -n "."
  sleep 1
  if curl -s https://bunjumun.github.io/bunjumun95 | grep -q "BUNJUMUN-DOOM"; then
    echo ""
    echo "✅ Live at https://bunjumun.github.io/bunjumun95"
    break
  fi
done

# ── Step 7: Final verification ───────────────────────────────────
echo ""
echo "Step 7: Final verification..."
echo "✅ Verify live site:"
echo "   - Canvas loads"
echo "   - DOOM engine initializes"
echo "   - Clicking ⚙ opens admin"
echo "   - Shooting paintings triggers events"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ DEPLOYMENT COMPLETE"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Live site: https://bunjumun.github.io/bunjumun95"
echo ""
