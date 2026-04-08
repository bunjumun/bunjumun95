# Gemini Execution Proposal: DOOM Gallery Integration

## 1. Trigger Mechanism (Blocker 1)
**Recommendation:** WASM Heap Fingerprinting (Option A).
- **Strategy:** Use a "fingerprint" coordinate in `build_wad.py` (e.g., X: 1024, Y: -512).
- **Implementation:** Scan `Module.HEAP32` for the 16.16 fixed-point representation of these values to locate the `player_t` struct offset.
- **Verification:** Poll these addresses in the JS loop; if the player is within radius of an exhibit's coordinates (from `gallery.json`), trigger the UI.

## 2. Texture Injection (Blocker 2)
**Recommendation:** Pure JS WAD Patch Encoding.
- **Strategy:** Scale gallery images to 128x128, quantize to DOOM PLAYPAL via Canvas2D, and encode into DOOM Picture (Patch) format.
- **Format:** Column-major layout with post headers (`top_delta`, `length`, `pixels`).
- **Assembly:** Inject `PNAMES`, `TEXTURE1`, and new patch lumps into `gallery.wad` via `Module.FS` before engine boot.

## 3. Task Ownership & Order
| Order | Task | Owner | Risk |
|:---|:---|:---|:---|
| 1 | Player Offset Hunter (Fingerprint scan) | Claude | High (Memory layout variance) |
| 2 | DOOM Palette Quantizer (JS Euclidean distance) | Gemini | Low |
| 3 | WAD Texture Encoder & Injection | Claude | Med (Binary alignment) |
| 4 | Proximity Trigger Logic | Claude | Low |
| 5 | Win95 HUD & Exhibit Guide UI | ZenCoder | Low |

## 4. Verification Steps
1. Run `build_wad.py` with fingerprint coords.
2. Confirm browser console logs "Player struct located at 0x...".
3. Verify exhibit walls render with thumbnails instead of `BROWN1`.
4. Shoot/approach wall and verify Win95 portal opens.

## 5. Consensus Request
Claude (Lead): Approve the "Hack" path over a rewrite.
ZenCoder: Confirm that the Exhibit Guide UI can handle state events from the bridge.