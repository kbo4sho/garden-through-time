# glTF style gauntlet — attempt 3

## Style intent

Same studio-botanical craft as attempts 1–2 (PRs #12 / #13). This last pass only addresses the remaining LOSE: **Fidelity @ 390px — soft mass** on the scored 5-plant phone strip.

Photographic frames remain a **level** reference for richness and canopy occupancy. They are not a lookalike target. A cold reader should still see folded 3D organs and a winter armature, not a photo clone, albedo bake, or denser cards toward the billboard frames.

- `plantState` / `modelSeason` remain the only calendar.
- Winterberry stays a photographic billboard.
- Shortlist only: fothergilla, oakleaf hydrangea, redtwig dogwood, boxwood.

## What closed the soft-mass gap (without becoming a photo clone)

Attempt 2 improved January vs #12 but still read translucent / wispy at 390px. July and October still showed jagged card edges.

This pass spends geometry on **volume that occupies pixels**, not on extra silhouette cards:

- **Thicker winter armature.** Primary stems, side twigs, and interior fills are thick enough to hold a 390px core. Hair-thin sprays were shortened and reduced so the edge is structure, not a wireframe haze.
- **Interior knobs.** Short fat junctions stay inside the authored hull. At phone distance they darken the core so the shrub reads as volume while the outline stays a branching framework — not brown mush.
- **Rounder, more cupped leaves.** Fothergilla teeth and high-frequency oak serration were the 390px sawtooth. Leaves are now oval / gently lobed and folded in 3D so the silhouette is overlapping organs, not pointed cards.
- **Less leaf-edge rim.** Attempt 2’s rim lift outlined every card. The studio wrap now darkens interiors (winter especially) and keeps rim low so canopies read as mass.
- **Closer 390px framing.** Model-mode camera padding is `0.994` at ≤480px (desktop stays `1.06`). Hulls were not expanded — expanding them would push the auto-fit camera back.

None of this bakes billboard albedo, adds image textures, or hill-climbs card density toward the photographic frames.

## Color ease (plant-true)

- Dogwood winter stems stay Arctic Fire crimson (`#8f241c` / `vec3(0.4, 0.075, 0.068)`).
- Dogwood fall in `modelSeason` eases further toward orange-red (`#a44632` at 0.42). Profile records are unchanged.
- Winterberry stays the billboard. In `renderer=gltf` only, hue ease is `0.62` with a stronger red/blue crush so berries read species-true red rather than hot magenta. Photographic URLs are unchanged.

## Plant-true checks (days 15 / 135 / 200 / 290 at 390px)

| Day | Read |
| --- | --- |
| ~15 | Deciduous plants are denser branching frameworks with an opaque-enough core to read as shrub volume. Dogwood stems go crimson-red. Boxwood stays an evergreen mound. Hydrangea keeps weathered heads. Winterberry remains a photo billboard (redder, not magenta). |
| ~135 | Fothergilla bottlebrushes. Dogwood pairing into late-spring corymbs. Hydrangea is foliage, not yet in panicle. Boxwood holds. |
| ~200 | Oakleaf hydrangea carries cream-to-rose panicles and lobed leaves. Fothergilla is a rounded green mass. Dogwood is upright foliage (fruit starting). Silhouettes are soft overlapping organs, not jagged cards. |
| ~290 | Fothergilla gold/orange. Hydrangea mahogany with aged heads. Dogwood thinning onto red stems. Boxwood quiet bronze-green. |

## Asset byte delta

| Asset | Main (PR #7) | Attempt 2 (#13) | This PR | vs #13 |
| --- | ---: | ---: | ---: | ---: |
| fothergilla.glb | 1,298,716 | 1,516,720 | 1,569,392 | +52,672 |
| hydrangea.glb | 913,820 | 1,015,664 | 977,140 | −38,524 |
| dogwood.glb | 1,067,600 | 1,435,912 | 1,490,316 | +54,404 |
| boxwood.glb | 1,354,328 | 977,500 | 881,120 | −96,380 |
| **Total** | **4,634,464** | **4,945,796** | **4,917,968** | **−27,828** |

Under the 5 MB download check. Decoded attributes: 10,739,065 bytes (budget 24 MB).

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
