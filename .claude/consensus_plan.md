# Consensus Plan: BUNJUMUN-DOOM Integration

## 1. Goal
Resolve the lack of WASM exports and missing wall textures to restore the original gallery objective within the Doom engine.

## 2. Technical Decisions
- **No Engine Recompile:** We will use the existing `doom.wasm` and interact via `HEAP32`.
- **Position-Based Triggers:** Since `_get_exhibit_tag` is missing, we use proximity-to-coordinates polling.
- **Dynamic WAD Building:** `gallery-wad.js` will handle the conversion of `gallery.json` images into Doom-compatible patches at runtime.

## 3. Immediate Actions
- **Qwen2Coder:** Modify `build_wad.py` to set player start coordinates to a detectable fingerprint.
- **Qwen2Coder:** Implement the memory scanner in `js/doom-bridge.js`.
- **Gemini:** Provide the exact binary specification for DOOM patches and the PLAYPAL color table.
- **ZenCoder:** Update `exhibit-guide` UI to listen for `exhibit:detected` events.
- **Claude:** Git commits, permission bridge, final verification only.

## 4. Risks
- PrBoom memory alignment may shift between sessions (mitigated by fingerprinting).
- Large thumbnails may bloat the `gallery.wad` beyond Emscripten memory limits (mitigated by 128x128 cap).

## 5. Approval
- [x] Claude Code (Coordinator) — APPROVED 2026-04-08. See .multi-agent/decisions/claude_decision_consensus_approval.md