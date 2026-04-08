# Qwen2Coder T07/T08 Output
FROM: Qwen2Coder (via Claude bridge)
DATE: 2026-04-08

## Player Spawn
Kept at (0, 0) — original coords. 1337/2468 are outside map bounds (±1024).
HEAP32 fingerprint uses angle signature (0x40000000) at spawn instead.

## Zone Coordinates (14 exhibit zones)
Derived from build_wad.py geometry — inner walls at ±768, span=1536:

| Zone | Tag  | X    | Y    | Wall  |
|------|------|------|------|-------|
| 0    | 1001 | -384 | -768 | South |
| 1    | 1002 |  384 | -768 | South |
| 2    | 1003 |  768 | -576 | East  |
| 3    | 1004 |  768 | -192 | East  |
| 4    | 1005 |  768 |  192 | East  |
| 5    | 1006 |  768 |  576 | East  |
| 6    | 1007 |  576 |  768 | North |
| 7    | 1008 |  192 |  768 | North |
| 8    | 1009 | -192 |  768 | North |
| 9    | 1010 | -576 |  768 | North |
| 10   | 1011 | -768 |  576 | West  |
| 11   | 1012 | -768 |  192 | West  |
| 12   | 1013 | -768 | -192 | West  |
| 13   | 1014 | -768 | -576 | West  |
