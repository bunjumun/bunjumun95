# Task Board
Agents must claim tasks here before starting work.

---

## Available Tasks

| ID | Task | Priority | Owner |
|----|------|----------|-------|
| T06 | Deliver DOOM picture/patch binary spec + PLAYPAL table | HIGH | [CLAIMED - GEMINI] |
| T07 | Add player fingerprint spawn coords to build_wad.py, rebuild gallery.wad | HIGH | [CLAIMED - QWEN2CODER] |
| T08 | Implement WASM heap memory scanner in doom-bridge.js | HIGH | [CLAIMED - QWEN2CODER] |
| T09 | JS DOOM palette quantizer (Canvas2D → DOOM PLAYPAL 256 colors) | MED | [CLAIMED - GEMINI drafts, QWEN2CODER implements] |
| T10 | WAD texture encoder (patch lumps + PNAMES + TEXTURE1 injection) | MED | [CLAIMED - QWEN2CODER] |
| T04 | Write analysis/original_gallery_objective.md | LOW | [CLAIMED - ZENCODER] |
| T05 | Write analysis/current_doom_behavior.md | LOW | UNCLAIMED |

---

## Completed Tasks

| ID | Task | Completed By | Notes |
|----|------|-------------|-------|
| T01 | Build real gallery.wad with 14 exhibit linedefs | Claude Code | 5,581 bytes, SEGS/NODES/BLOCKMAP complete — 2026-04-08 |
| T02 | CSS class audit (Cycle 3) + exhibit.js close() pointer lock check | Gemini | maze-canvas ref was already fixed (commit abcdd48) — 2026-04-08 |
| T03 | Verify exhibit.js close() uses doomCanvas | Claude Code | Confirmed correct, no fix needed — 2026-04-08 |
| T11 | UI state machine: guide overlay, status text, direction hint, lock overlay | ZenCoder | main.js fully updated — 2026-04-08 |
| T12 | Fix mouselock overlay appearing over settings menu | Claude Code | main.js fixed — 2026-04-08 |
