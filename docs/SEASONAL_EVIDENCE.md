# Seasonal evidence manifest

This manifest makes the ten-plant library expansion auditable against the exact
day-of-year windows consumed by the renderer. It distinguishes two different
kinds of evidence:

- **Sourced trait:** the linked primary plant record supports identity, habit,
  deciduous or evergreen behavior, broad bloom season, flower and fruit form,
  and foliage tendency.
- **Visual interpolation:** every exact Chicago / Zone 6a day boundary below is
  an editorial timing estimate used to stage a representative year. It is **low
  confidence**, is not an observed local phenology record, and is not a forecast.

The source sheets and their five finished winter, leaf-out, bloom, summer, and
fall billboards are interpretive illustrations of those sourced traits, not
specimen photography. Source sheets and prompts are retained in
[`docs/asset-sources/plant-library`](asset-sources/plant-library); runtime paths
follow `public/textures/generated/{plant-id}-{stage}.webp`.

## Exact renderer windows

All cells marked `VI-low` mean **visual interpolation · low date confidence**.
Dates are calendar labels for the encoded day-of-year values in a non-leap
representative year.

| Plant | Leaf emergence | Bloom | Fruit / seed display | Fall color | Leaf drop | Cross-year winter display | Trait evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Annabelle smooth hydrangea | 105–132 · Apr 15–May 12 · VI-low | 166–252 · Jun 15–Sep 9 · VI-low | — | 272–312 · Sep 29–Nov 8 · VI-low | 298–330 · Oct 25–Nov 26 · VI-low | Persistent heads · 1–93 and 312–365 · VI-low | [NC State Extension](https://plants.ces.ncsu.edu/plants/hydrangea-arborescens/common-name/smooth-hydrangea/) |
| Little Lime panicle hydrangea | 108–136 · Apr 18–May 16 · VI-low | 192–274 · Jul 11–Oct 1 · VI-low | — | 276–315 · Oct 3–Nov 11 · VI-low | 302–334 · Oct 29–Nov 30 · VI-low | Aged heads · 1–96 and 315–365 · VI-low | [NC State Extension](https://plants.ces.ncsu.edu/plants/hydrangea-paniculata/) |
| Henry’s Garnet sweetspire | 106–136 · Apr 16–May 16 · VI-low | 146–194 · May 26–Jul 13 · VI-low | 205–305 · Jul 24–Nov 1 · VI-low | 266–315 · Sep 23–Nov 11 · VI-low | 300–333 · Oct 27–Nov 29 · VI-low | Seed racemes · 1–94 and 315–365 · VI-low | [NC State Extension](https://plants.ces.ncsu.edu/plants/itea-virginica-henrys-garnet/common-name/sweetspire/) |
| Ruby Spice summersweet | 116–145 · Apr 26–May 25 · VI-low | 190–246 · Jul 9–Sep 3 · VI-low | 235–330 · Aug 23–Nov 26 · VI-low | 270–310 · Sep 27–Nov 6 · VI-low | 296–327 · Oct 23–Nov 23 · VI-low | Seed spikes · 1–104 and 310–365 · VI-low | [NC State Extension](https://plants.ces.ncsu.edu/plants/clethra-alnifolia/) |
| All That Glitters arrowwood viburnum | 102–132 · Apr 12–May 12 · VI-low | 135–169 · May 15–Jun 18 · VI-low | 200–285 · Jul 19–Oct 12 · VI-low | 252–298 · Sep 9–Oct 25 · VI-low | 286–319 · Oct 13–Nov 15 · VI-low | Dormant framework · 1–90 and 298–365 · VI-low | [NC State Extension](https://plants.ces.ncsu.edu/plants/viburnum-dentatum-var-deamii-all-that-glitters-smv/common-name/viburnum/) |
| Regent serviceberry | 96–121 · Apr 6–May 1 · VI-low | 101–132 · Apr 11–May 12 · VI-low | 160–207 · Jun 9–Jul 26 · VI-low | 244–286 · Sep 1–Oct 13 · VI-low | 276–306 · Oct 3–Nov 2 · VI-low | Fine dormant structure · 1–84 and 286–365 · VI-low | [The Morton Arboretum](https://mortonarb.org/plant-and-protect/trees-and-plants/saskatoon-serviceberry/) |
| Lemon Candy ninebark | 94–120 · Apr 4–Apr 30 · VI-low | 132–169 · May 12–Jun 18 · VI-low | 168–245 · Jun 17–Sep 2 · VI-low | 258–300 · Sep 15–Oct 27 · VI-low | 286–319 · Oct 13–Nov 15 · VI-low | Peeling stems · 1–82 and 300–365 · sourced trait, medium | [NC State Extension](https://plants.ces.ncsu.edu/plants/physocarpus-opulifolius-lemon-candy-podaras-3/common-name/lemon-candy/) |
| Green Velvet boxwood | Evergreen canopy 1–365 · sourced trait | 111–142 · Apr 21–May 22 · VI-low | — | Winter bronzing 302–340 · Oct 29–Dec 6 · VI-low | Evergreen · no leaf-drop window | Evergreen structure · 1–365 · sourced trait, high | [The Morton Arboretum](https://mortonarb.org/plant-and-protect/trees-and-plants/boxwood-hybrids/) |
| Sugar Shack buttonbush | 112–142 · Apr 22–May 22 · VI-low | 188–236 · Jul 7–Aug 24 · VI-low | 225–335 · Aug 13–Dec 1 · VI-low | 274–315 · Oct 1–Nov 11 · VI-low | 300–331 · Oct 27–Nov 27 · VI-low | Seed heads · 1–100 and 315–365 · VI-low | [The Morton Arboretum](https://mortonarb.org/plant-and-protect/trees-and-plants/buttonbush/) |
| Red Sprite winterberry | 105–135 · Apr 15–May 15 · VI-low | 134–166 · May 14–Jun 15 · VI-low | 205–365 · Jul 24–Dec 31 · VI-low | 258–300 · Sep 15–Oct 27 · VI-low | 285–316 · Oct 12–Nov 12 · VI-low | Winter berries · 1–93 and 300–365 · VI-low, pollinator required | [NC State Extension](https://plants.ces.ncsu.edu/plants/ilex-verticillata/common-name/common-winterberry/) |

## Source-to-state rule

For every profile, `seasonalEvidenceFor(profile)` in
[`src/data/plants.ts`](../src/data/plants.ts) derives the inspectable trace from
the same `leaf`, `bloom`, `fruit`, and `winterDisplay` windows that drive the
scene. Fruit onset drives the summer/fruit billboard transition; an early fruit
end drives the return to a foliage state before fall. Cross-year persistence is
a first-class profile field consumed by the billboard crossfade, phase label,
and trace.
This avoids a second timing table drifting away from the renderer. The plant detail UI exposes
that trace and labels its provenance and confidence. The primary link supports
the trait; it does not claim to support the exact encoded day bounds.

Fruit is conditional where the plant record says it is conditional. In
particular, All That Glitters arrowwood viburnum requires a compatible pollinator,
and Red Sprite winterberry requires an early-blooming male such as Jim Dandy.
