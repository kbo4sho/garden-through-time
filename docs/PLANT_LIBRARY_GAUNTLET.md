# Plant library expansion Gauntlet

## Confirmed goal

Add ten botanically recognizable, source-backed shrub choices without turning
Year-Round Interest into a shallow catalog. Each choice must remain credible in
the existing four-view composition, through a representative Chicago-area year,
and in the authored three-, five-, and seven-plant layouts.

The original fothergilla, oakleaf hydrangea, and redtwig dogwood composition
remains the protected default.

## Selected plants

| ID | Display name | Design role | Primary evidence |
| --- | --- | --- | --- |
| `smooth-hydrangea` | ‘Annabelle’ smooth hydrangea | Summer anchor | [NC State Extension](https://plants.ces.ncsu.edu/plants/hydrangea-arborescens/common-name/smooth-hydrangea/) |
| `panicle-hydrangea` | ‘Little Lime’ panicle hydrangea | Late-summer anchor | [NC State Extension](https://plants.ces.ncsu.edu/plants/hydrangea-paniculata/) |
| `sweetspire` | ‘Henry’s Garnet’ Virginia sweetspire | Early-summer drift | [NC State Extension](https://plants.ces.ncsu.edu/plants/itea-virginica-henrys-garnet/common-name/sweetspire/) |
| `summersweet` | ‘Ruby Spice’ summersweet | Fragrant summer bloom | [NC State Extension](https://plants.ces.ncsu.edu/plants/clethra-alnifolia/) |
| `viburnum` | All That Glitters® arrowwood viburnum | Fruit and foliage layer | [NC State Extension](https://plants.ces.ncsu.edu/plants/viburnum-dentatum/) |
| `serviceberry` | ‘Regent’ Saskatoon serviceberry | Spring structure | [The Morton Arboretum](https://mortonarb.org/plant-and-protect/trees-and-plants/saskatoon-serviceberry/) |
| `ninebark` | Lemon Candy® ninebark | Gold foliage contrast | [NC State Extension](https://plants.ces.ncsu.edu/plants/physocarpus-opulifolius-lemon-candy-podaras-3/common-name/lemon-candy/) |
| `boxwood` | ‘Green Velvet’ boxwood | Evergreen framework | [The Morton Arboretum](https://mortonarb.org/plant-and-protect/trees-and-plants/boxwood-hybrids/) |
| `buttonbush` | Sugar Shack® buttonbush | Wet-site summer bloom | [The Morton Arboretum](https://mortonarb.org/plant-and-protect/trees-and-plants/buttonbush/) |
| `winterberry` | ‘Red Sprite’ winterberry | Winter fruit | [NC State Extension](https://plants.ces.ncsu.edu/plants/ilex-verticillata/common-name/common-winterberry/) |

## Inspectable bar

1. **P0 — Complete assets.** Each plant has winter, leaf-out, bloom, summer,
   and fall billboard states. No seasonal state is borrowed from another
   species. Probe the asset manifest and select each plant in the running site.
2. **P0 — Botanical recognizability.** Each plant remains distinguishable in
   all four fixed views and matches the overall habit, foliage, flower, fruit,
   and dormant silhouette shown by its primary evidence. Generic or cloned
   silhouettes lose.
3. **P0 — Seasonal truth.** Each profile has independent Chicago-area ranges
   for leaf emergence, bloom, fruit where relevant, fall color, and leaf drop.
   A twelve-month state trace must not show lockstep changes or guaranteed
   weather-sensitive dates. The exact source-versus-interpolation boundary is
   recorded in [`docs/SEASONAL_EVIDENCE.md`](SEASONAL_EVIDENCE.md) and disclosed
   in the per-plant detail UI.
4. **P0 — Real scale and role.** Mature size affects rendered scale and each
   plant is assigned an explicit design role. Probe three-, five-, and
   seven-plant layouts for clipping, impossible proportions, and lost layers.
5. **P0 — Honest compatibility.** Zone, light, moisture, and material caveats
   are visible. Plants needing a pollinating partner cannot imply fruit without
   that caveat.
6. **P0 — Understandable choice.** The editor groups the thirteen choices by
   role and seasonal contribution. A user can replace a planting position and
   understand the tradeoff without scanning an anonymous long dropdown.
7. **P0 — Do not regress.** Preserve the editorial four-view first frame,
   continuous timeline, keyboard input, plant identity, existing default
   composition, desktop/tablet behavior, and useful phone fallback.

## Asset production contract

Each generated source is a six-cell, 3:2 contact sheet on a flat magenta key:
winter, leaf-out, bloom, summer, fall, and one unused cell. The five finished
states are cropped, keyed to alpha, normalized to a 600 × 600 canvas, converted
to WebP, and retained alongside the source prompt manifest. Assets are judged
at the integrated scene scale, not only as isolated cutouts.

## Independent critic contract

The material builder does not issue the final verdict. A fresh critic receives
this brief, the actual running artifact, and raw inspection evidence, then
returns only:

```text
VERDICT: WIN | LOSE | UNJUDGEABLE
EVIDENCE: direct observations and inspected artifacts
LARGEST GAP: required on LOSE
FIXED WHEN: an observable check proving the gap is closed
```

The loop stops when every P0 wins, the human stops it, further improvement is
immaterial, or a confirmed cost or risk boundary is reached.

## Progress

- [x] Scope and plant set confirmed by the user.
- [x] Seasonal assets generated and processed.
- [x] Plant profiles and source manifest implemented.
- [x] Role-based chooser implemented.
- [x] Integrated build and responsive checks complete.
- [x] Fresh critic verdict recorded: **WIN** after the source-to-state and
  cross-year boundary audit.
- [ ] Verified result published.

## Final critic verdict

`VERDICT: WIN`

The fresh critic probed every month anchor and every encoded seasonal boundary
±1 day for all ten additions. Scene state, plant phase, and visible evidence
trace agreed, including Red Sprite winterberry and the persistent hydrangea
heads across December 31 / January 1. The critic also reverified 50 unique alpha
assets, role-based selection, caveats, scale, three/five/seven layouts, the
protected default, and the desktop/tablet/phone fallback.
