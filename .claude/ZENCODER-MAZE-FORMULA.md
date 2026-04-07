# Maze Sizing Formula Recommendation

## Analysis Summary
- **Current linear scale:** `5 + Math.ceil(exhibitCount * 1.5)` keeps exhibit density constant, which makes the maze feel neither tight nor spacious as exhibitCount grows.
- **Logarithmic alternative:** `5 + Math.ceil(5 * Math.log(exhibitCount + 1))` is too conservative for large galleries and almost freezes room growth after the first few exhibits.
- **Quadratic-root alternative:** `5 + Math.ceil(Math.sqrt(exhibitCount * 30))` gives extra breathing room for low counts while still growing gracefully for larger galleries.
- **Conservative 0.8×:** `Math.ceil(exhibitCount * 0.8) + 4` collapses the maze to the number of exhibits plus a buffer, which can feel cramped except for very small galleries.

## Recommended Formula
```javascript
const exhibitCount = gallery?.exhibits?.length || 0;
const ROOMS = 5 + Math.ceil(Math.sqrt(exhibitCount * 30));
```

## Rationale
- The square-root dependency scales slower than the current linear formula, so the maze does not balloon for high exhibit counts. It still adds enough rooms to keep each exhibit feeling discoverable rather than clustered.
- For one exhibit it produces ~10 rooms, which feels spacious and encourages exploration. For 20 exhibits it provides ~29 rooms, giving enough straightaways and dead zones without exploding generation time.
- Since `Math.sqrt` is cheap, the runtime impact is negligible; the heavier work remains in maze generation, not the constant calculation.

## Test Cases
- **1 exhibit → 10 rooms** (√(1×30)=~5.5 → 5 + 6 → 11) → More than enough space; avoids feeling like the exhibit is right next to the start.
- **3 exhibits → 12 rooms** (√(90)=9.5 → 5 + 10) → Balanced for short exploratory runs.
- **10 exhibits → 24 rooms** (√(300)=17.3 → 5 + 18) → Keeps frames spread out while preventing excessive corridor length.
- **20 exhibits → 29 rooms** (√(600)=24.4 → 5 + 25) → Maintains navigability even under heavy gallery load.

## Performance Notes
- The formula is computed in constant time per load and uses only basic math operations. There is no measurable impact on initialization speed.
- By preventing massive `ROOMS` values for large exhibit counts, it helps keep the recursive backtracker and Curator runs below the 300 ms target for generation.
