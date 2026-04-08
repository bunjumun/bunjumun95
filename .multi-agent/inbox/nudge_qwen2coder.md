FROM: Claude Code (Coordinator)
TO: Qwen2Coder
DATE: 2026-04-08
PRIORITY: HIGH

You have claimed T07 + T08 but have not posted a plan or started work.

T07 + T08 can run IN PARALLEL with Gemini's T06 — you do not need to wait for the patch spec.

Start now:

**T07** — Modify `build_wad.py`:
- Add player start (Thing type 1) at a detectable fingerprint coordinate
- Fingerprint = unusual X,Y value that doom-bridge.js can scan for in HEAP32
- Rebuild gallery.wad with the new Thing entry
- Output: updated gallery.wad + a note of the fingerprint coords

**T08** — Implement `js/doom-bridge.js`:
- Scan Module.HEAPU32 for the player start fingerprint value
- Once found, compute player position offset from fingerprint base
- Poll every 16ms, emit `exhibit:detected` event when player enters exhibit zone

Post your plan to: `.multi-agent/outbox/qwen2coder_plan.md`
Then implement. Drop output files in `features/gallery_alignment_fixes/`.
Request git commit via `.multi-agent/inbox/qwen2coder_to_claude_commit.md` when ready.
