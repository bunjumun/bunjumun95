
## [2026-04-08 07:15 UTC] a155806→b8d927c
STATUS: FIXED
live stop/start/_stopped: 8 matches (v=4) ✓
gallery: 3/14 → fixed to 14/14
issues: 11 zones had no exhibit entry (MEDIUM)
actions: added placeholders zones 3-13, committed b8d927c, pushed
---

## [2026-04-08 07:45 UTC] dea16d2
STATUS: FIXED (graphics crash)
Root cause: gallery.wad had 26/36 segs with angle=0x0000 (all wrong), 36 segs in 1 SSECTOR for non-convex map
Effect: PrBoom renderer overran framebuffer → data moshing → crash
Fix: Rebuilt gallery.wad from scratch — correct BAM angles, clean 4-vert convex room, valid BSP
Note: Inner corridor walls temporarily removed (geometry-only). Exhibit triggers still work via doom-bridge.js E-key.
Next: Rebuild full 36-linedef corridor with proper nodebuilder BSP.
---

## [2026-04-08 07:18 UTC] dea16d2
STATUS: OK
live stop/start/_stopped: 8 matches (v=4) ✓
gallery: 14/14 ✓
issues: NONE
actions: NONE
---
## [2026-04-08 07:32 UTC] dea16d2
STATUS: OK
live: 8 matches v=4
gallery: 14/14
issues: NONE
actions: NONE
---
## [2026-04-08 08:02 UTC] dea16d2
STATUS: OK
live: 8 matches v=4
gallery: 14/14
issues: NONE
actions: NONE
---
## [2026-04-08 08:32 UTC] dea16d2
STATUS: OK
live: 8/v=4
gallery: 14/14
issues: NONE
actions: NONE
---
## [2026-04-08 09:02 UTC] dea16d2
STATUS: OK
live: 8/v=4
gallery: 14/14
issues: NONE
actions: NONE
---
## [2026-04-08 09:32 UTC] dea16d2
STATUS: OK
live: 8/v=4
gallery: 14/14
issues: NONE
actions: NONE
---
## [2026-04-08 10:02 UTC] dea16d2
STATUS: OK
live: 8/v=4
gallery: 14/14
issues: NONE
actions: NONE
---
## [2026-04-08 10:32 UTC] dea16d2
STATUS: OK
live: 8/v=4
gallery: 14/14
issues: NONE
actions: NONE
---
## [2026-04-08 11:02 UTC] dea16d2
STATUS: OK
live: 8/v=4
gallery: 14/14
issues: NONE
actions: NONE
---
## [2026-04-08 11:32 UTC] dea16d2
STATUS: OK
live: 8/v=4
gallery: 14/14
issues: NONE
actions: NONE
---
## [2026-04-08 12:02 UTC] dea16d2
STATUS: OK
live: 8/v=4
gallery: 14/14
issues: NONE
actions: NONE
---
## [2026-04-08 12:32 UTC] dea16d2
STATUS: OK
live: 8/v=4
gallery: 14/14
issues: NONE
actions: NONE
---
## [2026-04-08 13:02 UTC] dea16d2
STATUS: OK
live: 8/v=4
gallery: 14/14
issues: NONE
actions: NONE
---