# glTF style gauntlet — attempt 1

## Style intent

The optional `?renderer=gltf` shortlist should hit photographic **fidelity level** at phone distance: richness, soft mass, and seasonal readability. It should **not** look like the photographic billboards.

This pass is a **studio-botanical** render.

- Folded 3D leaves, bottlebrush / panicle / corymb organs, and a winter branching armature.
- Wrap lighting and a warm-key / cool-fill studio rig so canopies read as volume, not cardboard.
- Seasonal color still comes from `plantState` / `modelSeason` (the only calendar).
- Winterberry stays a photographic billboard.

It is a fail if a cold reader’s first read is “trying to look like the photo,” “can’t tell from the photo,” or if the frames were hill-climbed with photo albedo, baked billboard cards, or denser photo-lookalike cards.

PRs #7 / #8 / #9 are reference only. This branch does not revive their photo-parity or tuft-mask mimicry.

## What this is not

- Not a photo-clone or albedo bake from the seasonal billboard textures.
- Not hashed tuft-masks or UV cluster cards designed to match photo silhouettes.
- Not a second phenology calendar.
- Not a 13-species model library. Shortlist only: fothergilla, oakleaf hydrangea, redtwig dogwood, boxwood.

## Plant-true checks (days 15 / 135 / 200 / 290 at 390px)

| Day | Read |
| --- | --- |
| ~15 | Deciduous plants are branching frameworks, not brown mush. Dogwood stems go red. Boxwood stays an evergreen mound. Hydrangea keeps weathered heads. Winterberry remains a photo billboard. |
| ~135 | Fothergilla bottlebrushes. Dogwood pairing into late-spring corymbs. Hydrangea is foliage, not yet in panicle. Boxwood holds. |
| ~200 | Oakleaf hydrangea carries cream-to-rose panicles and lobed leaves. Fothergilla is a rounded green mass. Dogwood is upright foliage (fruit starting). |
| ~290 | Fothergilla gold/orange. Hydrangea mahogany with aged heads. Dogwood thinning onto red stems. Boxwood quiet bronze-green. |

## Fidelity level vs clone

Photographic frames in the compare strips are a **level** reference for richness and seasonal readability. They are not a lookalike target. The after frames should be obviously rendered.

## Asset byte delta vs PR #7 / main

| Asset | Main (PR #7) | This PR | Delta |
| --- | ---: | ---: | ---: |
| fothergilla.glb | 1,298,716 | 1,206,152 | −92,564 |
| hydrangea.glb | 913,820 | 1,005,036 | +91,216 |
| dogwood.glb | 1,067,600 | 1,323,892 | +256,292 |
| boxwood.glb | 1,354,328 | 1,097,756 | −256,572 |
| **Total** | **4,634,464** | **4,632,836** | **−1,628 (−0.04%)** |

Under the 5 MB download check. Decoded attributes: 10,852,914 bytes (budget 24 MB). Not a 2× jump from ~4.5 MB.

## Safeguards held

- One phone canvas (narrow/unknown viewport still one portrait).
- No Play `history.replaceState` writes; paused writes stay debounced.
- No CSS filter on `.garden-canvas`.
- Context-lost fallback remains mounted outside asset Suspense.
- `plantState` remains the only calendar.
