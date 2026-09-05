# glTF style gauntlet — attempt 2

## Style intent

Same studio-botanical craft as attempt 1 (PR #12). This pass only addresses the one LOSE: **Fidelity @ 390px — soft mass** on the 5-plant phone strip.

Photographic frames remain a **level** reference for richness and canopy occupancy. They are not a lookalike target. A cold reader should still see folded 3D organs and a winter armature, not a photo clone, albedo bake, or denser cards toward the billboard frames.

- `plantState` / `modelSeason` remain the only calendar.
- Winterberry stays a photographic billboard.
- Shortlist only: fothergilla, oakleaf hydrangea, redtwig dogwood, boxwood.

## What changed for soft mass (without becoming a photo clone)

Attempt 1’s January plants read as inverted-V / thin-column armatures; July and October canopies left gaps at 390px.

- **Habit envelopes.** Primary stems and side twigs are clamped to a rounded mound (fothergilla / hydrangea), an upright oval (dogwood), or a sphere (boxwood). Reach grows earlier in the stem so mid-canopy fills instead of a late V.
- **Interior winter twigs.** Short fills stay inside the hull so the silhouette densifies without pulling the auto-fit camera back.
- **Thicker winter armature.** Spray / fill radii are large enough to occupy pixels at 390px. Hair-thin twigs were invisible at phone distance.
- **Larger overlapping folded leaves.** Cluster count went to 3 on deciduous plants; leaf meshes use fewer rows so more organs fit the download budget. Still folded 3D blades, not alpha cards.
- **Closer 390px framing.** Model-mode camera padding is 1.012 at ≤480px (desktop stays 1.06).
- **Studio wrap.** A little more interior lift on leaves so canopies read as volume. Branch wrap was kept low so winter stems stay structure, not glow.

## Color ease (plant-true note from attempt 1)

- Dogwood bark and winter-stem shader move from coral-pink toward Arctic Fire crimson (`#8f241c` / `vec3(0.4, 0.075, 0.068)`).
- Dogwood fall color in `modelSeason` eases slightly toward orange-red. Profile records are unchanged.
- Winterberry stays the billboard. In `renderer=gltf` only, a light hue ease pulls magenta toward species-true red. Photographic URLs are unchanged.

## Plant-true checks (days 15 / 135 / 200 / 290 at 390px)

| Day | Read |
| --- | --- |
| ~15 | Deciduous plants are denser branching frameworks, not brown mush. Dogwood stems go crimson-red. Boxwood stays an evergreen mound. Hydrangea keeps weathered heads. Winterberry remains a photo billboard. |
| ~135 | Fothergilla bottlebrushes. Dogwood pairing into late-spring corymbs. Hydrangea is foliage, not yet in panicle. Boxwood holds. |
| ~200 | Oakleaf hydrangea carries cream-to-rose panicles and lobed leaves. Fothergilla is a rounded green mass. Dogwood is upright foliage (fruit starting). |
| ~290 | Fothergilla gold/orange. Hydrangea mahogany with aged heads. Dogwood thinning onto red stems. Boxwood quiet bronze-green. |

## Asset byte delta

| Asset | Main (PR #7) | Attempt 1 (#12) | This PR | vs #12 |
| --- | ---: | ---: | ---: | ---: |
| fothergilla.glb | 1,298,716 | 1,515,920 | 1,516,720 | +800 |
| hydrangea.glb | 913,820 | 1,007,820 | 1,015,664 | +7,844 |
| dogwood.glb | 1,067,600 | 1,327,604 | 1,435,912 | +108,308 |
| boxwood.glb | 1,354,328 | 1,097,756 | 977,500 | −120,256 |
| **Total** | **4,634,464** | **4,949,100** | **4,945,796** | **−3,304** |

Under the 5 MB download check. Decoded attributes: 11,060,669 bytes (budget 24 MB).

## Evidence files

390px after frames (layered-seasons-5 share with winterberry in the hydrangea slot — the scored 5-plant strip):

- `after-d15-phone.png` / `after-d135-phone.png` / `after-d200-phone.png` / `after-d290-phone.png`
- `photo-level-d15-phone.png` … `photo-level-d290-phone.png` — photographic **level** reference, not a clone target
- `compare-d15-phone.png` … `compare-d290-phone.png` — labeled studio botanical | photo level

390px hydrangea shortlist (balanced-year-3): `after-3-d15-phone.png` / `after-3-d135-phone.png` / `after-3-d200-phone.png` / `after-3-d290-phone.png`

Desktop January: `after-gltf-balanced-year-3-jan-desktop.png`, `after-gltf-layered-seasons-5-jan-desktop.png`, `after-gltf-living-framework-7-jan-desktop.png`

## Safeguards held

- One phone canvas (narrow/unknown viewport still one portrait).
- No Play `history.replaceState` writes; paused writes stay debounced.
- No CSS filter on `.garden-canvas`.
- Context-lost fallback remains mounted outside asset Suspense.
- `plantState` remains the only calendar.
- `npm run check` green: share/mobile regressions + every-day model phenology, 3/5/7 shares, geometry budgets.
