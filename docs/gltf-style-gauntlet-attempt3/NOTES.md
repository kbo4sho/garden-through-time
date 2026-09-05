# glTF style gauntlet — attempt 3

## Style intent

Same studio-botanical craft as attempts 1–2 (PRs #12 / #13). This last pass closes the exact YRI gaps from the attempt-2 compares:

1. **Day ~15:** left was translucent/wispy through fothergilla & winterberry; right read nearly opaque soft winter structure.
2. **Day ~290:** left was jagged plane stacks / card edges on fothergilla & dogwood; right was soft canopy volume.

May was the closest month — do not regress it. Photographic frames remain a **level** reference, not a clone target.

- `plantState` / `modelSeason` remain the only calendar.
- Winterberry stays a photographic billboard.
- Shortlist only: fothergilla, oakleaf hydrangea, redtwig dogwood, boxwood.

## What closed the soft-mass gap (without becoming a photo clone)

Thicker twigs still read as lines at 390px. Larger folded leaves still read as cards. This pass changes **occupancy primitive**, not style:

- **Winter cores.** Overlapping rounded woody spheres sit inside the authored hull. At phone distance the core is nearly opaque soft structure. Outer twigs stay a readable armature, not brown mush and not a photo silhouette.
- **Soft canopy puffs.** Rounded leaf-colored spheres (not flattened discs, not folded-card stacks) carry the July/October outline. Folded oak / oval leaves stay as botanical detail, smaller so they do not sawtooth the habit.
- **Winterberry occupancy (gltf only).** A dark burgundy oval sits in the billboard volume and a fill-mass alpha lift keeps berry/stem pixels. Photographic URLs are unchanged. Not a second calendar and not a model of winterberry.

None of this bakes billboard albedo, adds image textures, or hill-climbs card density toward the photographic frames.

## Color ease (plant-true)

- Dogwood winter stems stay Arctic Fire crimson.
- Dogwood fall in `modelSeason` eases toward orange-red. Profile records unchanged.
- Winterberry hue ease `0.62` in `renderer=gltf` only.

## Plant-true checks (days 15 / 135 / 200 / 290 at 390px)

| Day | Read |
| --- | --- |
| ~15 | Deciduous cores are nearly opaque winter structure; edges still branch. Dogwood crimson. Boxwood evergreen mound. Hydrangea keeps weathered heads. Winterberry remains a photo billboard with occupancy fill. |
| ~135 | Fothergilla bottlebrushes still read. Dogwood pairing into late-spring corymbs. Hydrangea is foliage, not yet in panicle. Boxwood holds. **Do not regress this month.** |
| ~200 | Oakleaf hydrangea cream-to-rose panicles and lobed leaves. Fothergilla a rounded green mass. Dogwood upright foliage. Soft volume, not jagged cards. |
| ~290 | Fothergilla gold/orange. Hydrangea mahogany with aged heads. Dogwood thinning onto red stems. Soft canopy volume. |

## Asset byte delta

| Asset | Main (PR #7) | Attempt 2 (#13) | This PR | vs #13 |
| --- | ---: | ---: | ---: | ---: |
| fothergilla.glb | 1,298,716 | 1,516,720 | 1,282,868 | −233,852 |
| hydrangea.glb | 913,820 | 1,015,664 | 782,944 | −232,720 |
| dogwood.glb | 1,067,600 | 1,435,912 | 1,252,676 | −183,236 |
| boxwood.glb | 1,354,328 | 977,500 | 935,128 | −42,372 |
| **Total** | **4,634,464** | **4,945,796** | **4,253,616** | **−692,180** |

Under the 5 MB download check. Decoded attributes: 9,427,156 bytes (budget 24 MB).

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
- `npm run check` green.
