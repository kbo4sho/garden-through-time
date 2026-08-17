# Hand-drawn page integration Gauntlet

Builder progress artifact. This document does not contain a verdict.

## Goal

Make the garden read as one hand-drawn botanical illustration sitting on the
page, in the character of the supplied ink-and-wash example, while a homeowner
still scrubs a representative Chicago / Zone 6a year and compares 3-, 5-, and
7-plant compositions. Plants must look drawn onto the same paper as the
interface, not photographed or pasted as isolated sprites. Each currently
choosable species must change independently through winter structure, leaf-out,
bloom, summer mass, and fall.

The photographic default at `/` is unchanged. The reversible candidate is
`/?style=editorial`.

## Canonical style reference

`docs/asset-sources/hand-drawn-page-integration/style-reference.png`

Copied for evidence at
`output/playwright/hand-drawn-page/style-reference.png`.

Compare on: fine ink/pencil contour, translucent watercolor wash, paper grain,
stippled/washed grounding into the page, species-specific leaf drawing, and
plants integrated into the paper rather than cut out. Do not require the
example’s exact pose, crop, or lineup.

The previous mixed-media experiment in
`docs/EDITORIAL_MIXED_MEDIA_GAUNTLET.md` and
`public/textures/editorial-mixed-media/` is the look to beat, not copy.
Those 15 assets remain in place and are not used by the current editorial
switch.

## Coverage checklist (13 × 5)

Runtime directory: `public/textures/hand-drawn-page/`.
Raw generated plates: `docs/asset-sources/hand-drawn-page-integration/raw/`.
Inventory: `output/playwright/hand-drawn-page/asset-inventory.json` and
`output/playwright/hand-drawn-page/isolated-assets-inventory.png`.

Audit: `npm run audit:hand-drawn-page` (65 unique 600×600 alpha PNGs).

| Plant | winter | leafout | bloom | summer | fall |
| --- | --- | --- | --- | --- | --- |
| fothergilla | [x] | [x] | [x] | [x] | [x] |
| hydrangea | [x] | [x] | [x] | [x] | [x] |
| dogwood | [x] | [x] | [x] | [x] | [x] |
| smooth-hydrangea | [x] | [x] | [x] | [x] | [x] |
| panicle-hydrangea | [x] | [x] | [x] | [x] | [x] |
| sweetspire | [x] | [x] | [x] | [x] | [x] |
| summersweet | [x] | [x] | [x] | [x] | [x] |
| viburnum | [x] | [x] | [x] | [x] | [x] |
| serviceberry | [x] | [x] | [x] | [x] | [x] |
| ninebark | [x] | [x] | [x] | [x] | [x] |
| boxwood | [x] | [x] | [x] | [x] | [x] |
| buttonbush | [x] | [x] | [x] | [x] | [x] |
| winterberry | [x] | [x] | [x] | [x] | [x] |

States share one illustration system (ink contour, translucent wash, cream
paper, stippled base) but are independently authored files. No image is reused
across species or stages.

## What changed

### Assets

- Regenerated all 65 plates from the style reference alone (no photographic
  plant images as generation references), as species-specific ink/pencil
  contour plus translucent wash on cream paper.
- Paper-keyed them to alpha with a per-image corner sample and plant-core keep
  mask (`scripts/process-hand-drawn-page-assets.py`). Digital vertical
  dissolve and extra stipple overlay were removed so drawn feet are not
  replaced by dithered columns.
- Wired `?style=editorial` to
  `/textures/hand-drawn-page/${id}-${stage}.png` for every current `PlantId`.
- Left `public/textures/*.webp`, `public/textures/generated/`, and
  `public/textures/editorial-mixed-media/` intact.

### Garden field (editorial only)

- Transparent WebGL canvas over the same CSS paper/grain as the frames. No
  opaque 3D ground, fog, stage lights, or oval grounding shadows.
- Premultiplied blending, no tonemapping, no sRGB decode on the plates, no
  canvas MSAA.
- Shader discards leftover paper-colored fill. Heavy digital base-stipple and
  plan-mode radial blob clips were removed so leaf contours survive at
  portrait and detail scale. Planting-plan drawings still lie on the paper.
- `experience-shell.is-editorial` paper frame treatment; chrome/typography were
  not the optimization target.

### Hand-drawn character repair (prior slice)

Critic gap: at garden-portrait and seasonal-detail scale, leafy summer plants
still read as photographed (or photo-filtered) sprites, especially Green Velvet
boxwood; digital vertical stipple at the feet; planting-plan as color blobs.

Changes aimed at that gap only:

- Redrew every species × stage from the style reference with explicit leaf and
  bloom-organ contours. Boxwood is a globe of individually outlined oval
  leaves, not a glossy photographic mass.
- Stopped feeding sourced photos into generation (that path produced
  watercolor-on-photo plates).
- Stopped post-process dithered feet and shader stipple/radial clips that
  turned drawings back into digital blobs.

### Planting-plan page integration repair (prior slice)

Critic gap: planting-plan, especially 5- and 7-plant summer, still read as
hovering photographic/3D cutouts with drop-shadow contact on the grid, while
portrait could already read as ink-and-wash. Plan vs portrait looked like two
media.

The painted stipple oval at the foot of each plate is the portrait’s drawn
grounding. Under the photographic plan camera (high, looking down), that oval
sits on the CSS grid as a contact shadow, and the small secondary canvas
(~418×180) plus lower DPR killed ink contour so the plates read as sprites.

Changes aimed at that gap only (editorial planting-plan; photographic `/`
unchanged):

- Keep the same standing Y-locked billboards as portrait. Do not lay plates
  flat as floor decals.
- Editorial plan camera is lower and more face-on than the photographic plan
  camera, so the drawings are seen as plates on the page rather than card-tops
  from the air.
- Plan-only shader skips the bottom band of each plate (the painted ground
  oval), then ragged-fades the remaining feet into the paper so grid shows
  through. Portrait still samples the full plate, including drawn stipple.
- Editorial canvases render at device pixel ratio 2 so leaf contour survives
  the 418×180 plan frame.

### Page field repair (prior slice)

Critic gap: every editorial portrait and elevation still sat each plant on its
own baked oval foot, mapped as a vertical billboard on a 3D stage (separate
lighting, hard rear horizon). Front-elevation showed the 2D plane cutting a
ground. Planting-plan at day 225 was a high-angle 3D view of standing sprites.
Seasonal-detail still showed the oval foot on a 3D bed. Isolated plates
themselves included those oval patches.

Changes aimed at that gap only (editorial; photographic `/` unchanged):

- Editorial views use an orthographic camera looking at the page plane: no
  perspective trapezoid, no Billboard, no 3D ground mesh, no stage lights, no
  bottom atmosphere horizon.
- Planting-plan places the same plates as 2D stamps at garden (x, z) on the
  sheet.
- Seasonal-detail shows only the selected plant.

### Stem–ground join repair (prior slice)

Critic gap: plants still read as separate alpha cutouts. Isolated plates have
ink, wash, and stippled feet that match the style reference; those feet did
not survive in-scene. A rectangular CSS stipple band sat unattached below the
stems. No shared washed ground.

Changes aimed at that gap only:

- Stopped stripping plate feet in `process-hand-drawn-page-assets.py` and
  stopped the editorial shader from discarding stipple at the join (only a
  light ragged nibble so the mesh rectangle does not show).
- Removed the unattached CSS stipple band.
- Added one shared pale green-gray wash behind all stems, with a broken
  organic edge, overlapping the plate stipple so the three plants sit in one
  field of ink on the same paper as the UI.

### Winter stem character repair (this slice)

Critic gap: winter redtwig dogwood (and ninebark) still read as saturated
photographic/digital cutouts at seasonal-detail scale, so January is not the
same ink-and-wash drawing as the leafy months. Isolated
`dogwood-winter.png` / `ninebark-winter.png` showed aliased, uniformly filled
stems without contour or wash, while fothergilla and hydrangea winter on the
same page already had ink + wash.

Changes aimed at that gap only:

- Redrew `raw-dogwood-winter.png` and `raw-ninebark-winter.png` as ink/pencil
  contour plus pale wash on cream paper, matching the fothergilla/hydrangea
  winter plates rather than a photo cutout.
- In `process-hand-drawn-page-assets.py`, winter dogwood and ninebark get a
  targeted pass: thick stems keep a light interior wash; thin twigs and
  existing dark marks become reddish-brown or brown pencil so they still
  read after the ~180px seasonal-detail downscale. Stippled feet are left
  alone.
- Photographic `/` and the other 63 editorial plates are unchanged.

### Unchanged product behavior

- Timeline, four decision views, sourced Chicago / Zone 6a windows, filters,
  authored positions, and photographic default URL.

## Capture paths

Directory: `output/playwright/hand-drawn-page/`

| File | What it shows |
| --- | --- |
| `winterfx-dogwood-day15.png` / `-portrait` / `-detail` | Balanced Year, day 15, Redtwig dogwood selected, 1440×900 |
| `winterfx-ninebark-day15.png` / `-detail` | Seasonal Tapestry (7), day 15, Lemon Candy ninebark selected |
| `winterfx-dogwood-winter-plate.png` / `-plate-center` | Isolated dogwood winter plate on cream, plus center crop |
| `winterfx-ninebark-winter-plate.png` / `-plate-center` | Isolated ninebark winter plate on cream, plus center crop |
| `joinfx-3-day130.png` / `-portrait` / `-elevation` / `-plan` / `*-join` | Balanced Year, day 130 (10 May), 1440×900 plus stem–ground crops |
| `joinfx-3-day172.png` / `-portrait` / `-elevation` / `-plan` / `*-join` | Balanced Year, day 172 (21 June), plus stem–ground crops |
| `joinfx-3-day225.png` / `-portrait` / `-elevation` / `-plan` / `*-join` | Balanced Year, day 225 (13 Aug), plus stem–ground crops |
| `planfix-5-day225.png` / `-portrait` / `-plan` | Layered Seasons (5), day 225; critic’s clearest 5-plant miss |
| `planfix-7-day225.png` / `-portrait` / `-plan` | Full Seasonal Tapestry (7), day 225; critic’s clearest 7-plant miss |
| `zoom-3-day225-plan-bases.png` | 3-plant plan foot contact (grid through stipple) |
| `zoom-5-day225-plan-bases.png` | 5-plant plan foot contact |
| `zoom-7-day225-plan-bases.png` | 7-plant plan foot contact |
| `style-reference.png` | Canonical ink-and-wash character target |
| `character-3-day130.png` / `-portrait` / `-detail` | Balanced Year, day 130, 1440×900 |
| `character-3-day172.png` / `-portrait` / `-detail` | Balanced Year, day 172 (21 June) |
| `character-3-day225.png` / `-portrait` / `-detail` | Balanced Year, day 225 (13 Aug) |
| `character-3-day291.png` / `-portrait` / `-detail` | Balanced Year, day 291 |
| `character-5-day225.png` / `-portrait` / `-detail` | Layered Seasons (5), day 225, includes boxwood |
| `character-sub-day225.png` / `-portrait` / `-detail` | Light + Structure (3), day 225, boxwood + Little Lime |
| `repair-3-day172.png` | Earlier page-integration full page |
| `repair-3-portrait.png` / `repair-3-elevation.png` / `repair-3-plan.png` / `repair-3-detail.png` | Earlier page-integration crops |
| `repair-7-summer.png` / `repair-7-plan.png` | Earlier 7-plant captures |
| `candidate-3-jan15.png` | Default 3-plant, 15 January |
| `candidate-3-may10.png` | Default 3-plant, 10 May |
| `candidate-3-jun21.png` / `candidate-3-day172.png` | Earlier 3-plant, 21 June |
| `candidate-3-aug13.png` | Default 3-plant, 13 August |
| `candidate-3-oct18.png` | Default 3-plant, 18 October |
| `candidate-5-winter.png` / `candidate-5-summer.png` | Earlier 5-plant captures |
| `candidate-7-winter.png` / `candidate-7-summer.png` | Earlier 7-plant captures |
| `candidate-substitution-winter.png` / `candidate-substitution-summer.png` | Earlier substitution captures |
| `control-3-jun21.png` | Photographic control, same 3-plant / 21 June |
| `overlay-control-candidate-3-jun21.png` | 50% overlay of control vs candidate at 21 June |
| `candidate-3-jun21-tablet.png` | 1024×768 |
| `candidate-3-jun21-phone.png` | 390×844 |
| `isolated-assets-inventory.png` | Earlier 13×5 isolated states |
| `asset-inventory.json` | Per-file hashes and byte sizes |
| `matte-test/` | Magenta composites used while tuning alpha |

Live URLs (dev server at `http://127.0.0.1:5173/`):

- Winter dogwood detail: `/?style=editorial&template=balanced-year-3&day=15` (select Redtwig dogwood)
- Winter ninebark detail: `/?style=editorial&template=seasonal-tapestry-7&day=15` (select Lemon Candy ninebark)
- Candidate: `/?style=editorial&template=balanced-year-3&day=172`
- May 10: `/?style=editorial&template=balanced-year-3&day=130`
- 13 Aug: `/?style=editorial&template=balanced-year-3&day=225`
- Fall: `/?style=editorial&template=balanced-year-3&day=291`
- Control: `/?template=balanced-year-3&day=172`
- 5-plant: `/?style=editorial&template=layered-seasons-5&day=225`
- 7-plant: `/?style=editorial&template=seasonal-tapestry-7&day=225`
- Substitution planting: `/?style=editorial&template=light-structure-3&day=225`

## Remaining risks

- Dense boxwood and fothergilla can still read as a mass at small portrait
  scale even when isolated plates show per-leaf contours; inspect seasonal
  detail and isolated `public/textures/hand-drawn-page/boxwood-summer.png`.
- The portrait atmosphere wash still fades the nearest plant so story copy
  stays readable; that is chrome-adjacent.
- 65 PNG states are heavier than the prior mixed-media set. Cold load and GPU
  memory on a 7-plant planting should be rechecked.
- Isolated files and in-app pixels can disagree; inspect the running
  portrait and seasonal-detail views, not only the files.
- Phone/tablet captures exist for one date only.
- No five-person composition-understanding study was run.
- This slice is a repair of winter dogwood/ninebark stem character. A fresh
  critic still needs to inspect live 1440×900 seasonal-detail for Redtwig
  dogwood on balanced-year-3 day=15 and Lemon Candy ninebark on
  seasonal-tapestry-7 day=15: ink/pencil contours and translucent wash on
  the same paper grain as neighboring winter drawings, not aliased
  photographic silhouettes.
