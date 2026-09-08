# Independent full-product Gauntlet — pre-branch snapshot

Reviewed code/assets: `47a4191`. This is a historical full-product review.
The current main capture matrix may show a later branch checkpoint; the
[reviewed matrix](https://github.com/kbo4sho/garden-through-time/tree/47a4191/docs/evidence/editorial-gltf)
and retained `gauntlet-phone/` images identify this review’s artifact.

VERDICT: LOSE

EVIDENCE: Independent clean-context review of the running artifact at `http://127.0.0.1:4179/?renderer=gltf&day=200&template=layered-seasons-5&from=Kevin`, September 7, 2026. Read only the three supplied clean brief copies, the supplied raw captures and browser-checks.json; no implementation, prior reviews, history or builder rationale was inspected. Fresh Chrome headless inspection at 390×844 and 1440×900 reproduced the supplied scene. New evidence is restricted to `gauntlet-phone/`.

LARGEST GAP: The desktop foliage still reads as repeated, stiff polygon organs arranged along a procedural scaffold rather than supple botanical vegetation. Oakleaf hydrangea is the clearest example: broad leaves expose angular folds and similarly oriented, shelf-like groupings; the dogwood repeats flat paired leaf tiers along unusually straight rods. This is visible at ordinary full-bed size as well as seasonal-detail size in May, July and August. Species silhouettes are distinguishable, but the material/organ finish remains below the explicit Lumion fine-detail / Twinmotion+Quixel / SpeedTree bar. Phone reduction makes those defects smaller without closing them.

FIXED WHEN: A fresh critic can inspect the unzoomed 1440×900 garden portrait and seasonal detail at days 135, 200 and 227 and see irregularly curved, plausibly transmitted leaves, connected irregular twig growth and canopy depth without conspicuous repeated flat tiers or hard polygon folds; then confirm the same coherent plants in 390px 3/5/7 scenes at days 15, 135, 200 and 290. The four shortlisted species must remain actual 3D plants under the common studio light. Improvement confined to phone scale or a different camera does not close this gap.

## Five Year-Round Interest scores

Scores use 1 = fails the promise, 3 = useful proof with meaningful deficiencies, 5 = convincingly meets the reference bar. The supplied clean brief does not define a separate named five-score rubric; these five dimensions cover its core requirements. Scores are not a substitute for P0 gates.

| Dimension | Score | Basis |
| --- | --- | --- |
| Botanical visual credibility | 2/5 | Recognizable lobed hydrangea, fine dogwood, broad fothergilla and dense boxwood; however repeated stiff leaves, tiered organization, low material variation and rod-like exposed stems are conspicuous on desktop. |
| Seasonal continuity and interest | 4/5 | Same persistent bed and branching structure across the year; spring fothergilla bloom, summer hydrangea bloom, fall species differences and winter dogwood stems/boxwood are clearly distinct. Provenance is disclosed, but this review did not independently validate each biological bound. |
| Composition and planting judgment | 3/5 | Four purposeful desktop views show overlap, relative height, planting repetition and selected detail. Labels explain seasonal roles. No independently verified physical scale or complete substitution trace in this review. Tablet portrait leaves a large empty upper garden panel. |
| Timeline and functional responsiveness | 3/5 | Live phone Play advances the year; keyboard Home, End and ArrowLeft work; seasonal inputs update the complete bed and labels. Supplied raw checks support peek/reset and resource stability. New supplied throttled cold-load diagnostics miss the three-second target in all six cases; physical-device frame budgets were not independently measured. |
| Sent-link clarity and presentation | 3/5 | Kevin's byline, parked date, single phone garden and readable identities work. Phone has considerable blank upper space and a generic seasonal caption; the desktop offers more specific composition explanation. The garden is accessible as a recipient without opening the editor. |

## Direct observations

- The untouched live July frame opens with the bed, four species labels, Kevin's byline and July 19. No editor is necessary. Desktop uses a clear editorial frame, purposeful secondary views and subordinate controls. The plants share a warm ground and a common shadow direction; they do not obviously float.
- At 390×844, one complete garden portrait replaces the four-up layout. Play has a large visible target. Species labels remain readable at 3/5/7 counts in the supplied day-15, 135, 200 and 290 captures. A roughly 180px blank band remains below the phone header before the tallest plant; it reduces impact, although the scene is still useful and visible.
- Live phone Play moved day 200 to day 257 over approximately 2.4 seconds. Pause worked. Home set day 1, End set day 365 and ArrowLeft set day 364. Direct range movement to 15, 135 and 290 changed the scene and visible text. No page errors were emitted in this sequence.
- The phone More actions menu reveals Edit planting, Send bed and Conditions. Share availability is visible; this review did not copy or reopen a newly generated share URL.
- January reveals persistent twig networks, winter dogwood color, retained hydrangea heads and a green boxwood mass. May shows fothergilla flowers while hydrangea is green; July hydrangea carries white flowers. August changes those heads toward pink and reports dogwood fruit forming. November retains some dark hydrangea leaves after dogwood/fothergilla become bare. These are independent lifecycle differences rather than one common seasonal tint.
- The live desktop Plant details panel for Ruby Slippers exposes botanical name, mature dimensions, light, moisture, zone, bloom range, foliage behavior and an NC State source link. It explicitly says exact day bounds are Chicago visual interpolation, not observed local phenology or a forecast, with low date confidence. Conditions identifies Chicago Zone 6a, morning sun/afternoon shade and consistent well-drained moisture, and explains the dwarf-fothergilla substitution's role.
- The hydrangea's large leaf organs show repeated angular lobes and bent planar surfaces, especially in `desktop-3-200.png`, `desktop-5-135.png`, and the new `desktop-month-227.png`. Its fresh inflorescences read as thin scattered pale flecks more than substantial clustered flower heads. Dogwood's crown visibly repeats horizontal paired leaf arrangements over straight stems. The winter twig differentiation is helpful, but close branch structure remains noticeably procedural.
- Common light and soft ground give the bed coherence. They do not yet deliver the organ curvature, backface softness, canopy depth and material distinction called for in the supplied fidelity contract. Twinmotion's primary documentation specifically identifies backface treatment, transmitted light and canopy ambient occlusion as vegetation realism dimensions: [Foliage Materials](https://dev.epicgames.com/documentation/en-us/twinmotion/foliage-materials). This reference is a mechanism/quality comparator, not a demand to change engines.
- The supplied 834×1194 tablet capture keeps all four views and controls readable but reserves much of the portrait panel for empty neutral background, making the garden noticeably small for the available area.

## Evidence inventory

Independently generated:

- `gauntlet-phone/phone-live-{15,135,200,290}.png`: live phone garden and seasonal text.
- `gauntlet-phone/desktop-live-200.png`: live untouched desktop July scene.
- `gauntlet-phone/desktop-month-{15,46,74,105,135,166,200,227,258,290,319,349}.png`: monthly live range updates.
- `gauntlet-phone/desktop-details-wait.png`: source/provenance and conditions-accessible plant details.
- `gauntlet-phone/phone-menu.png`: recipient action menu.
- `gauntlet-phone/{inspect,detail,controls}.mjs`: independent browser procedures.

Supplied raw evidence inspected:

- All twelve phone 3/5/7 day-15/135/200/290 captures (day-135/290 five-plant states additionally inspected live).
- Desktop five-plant January/May/July/October; desktop three-plant July and seven-plant July/October.
- `tablet-5-135.png` and `browser-checks.json`.

The supplied checks report phone render intervals of p50 33.3ms / p95 50.3ms, Play advancement, zero history writes during Play, no repeat-cycle buffer uploads, keyboard success, peek changes followed by exact rest, context restoration, mixed winterberry textures, caption clearance and no errors. Those measurements are supplied evidence, not independent measurements from this critic.

## Limits and remaining ungraded gates

This is a visual/interaction rejection with sufficient direct evidence for LOSE, not a claim that every other P0 passes. No source code or source-to-state manifests were read. NC State data and every substitution were not independently traced. There was no five-person study, consistent with the current slice's explicit exemption. No physical tablet/phone, reduced-motion audit, disabled-WebGL path, pointer ten-second sweep, independent 10Mbps cold-load test, memory soak or independent asset-byte count was performed. Supplied 10Mbps diagnostics are evaluated below. Screenshot inspection cannot establish frame pacing. Play and keyboard behavior were tested in headless desktop Chrome at a mobile viewport, not mobile Safari. The optional SpeedTree documentation fetch returned 403; the provided fidelity contract and successfully fetched Twinmotion primary reference were available.

No implementation, committed evidence, PR, merge or deployment was changed.

## Additional supplied cold-load evidence

The raw `network/network-checks.json` was supplied after the initial visual inspection and incorporated before delivery. It records Chrome 151, 10Mbps download with 40ms latency, a fresh browser context per case, HTTP cache disabled and service workers blocked. Ready is defined as two geometry-drawing frames reported by the primary scene.

| Case | Ready | Three-second target |
| --- | --- | --- |
| Desktop 3 | 4.776s | Miss |
| Desktop 5 | 5.286s | Miss |
| Desktop 7 | 5.259s | Miss |
| Phone 3 | 4.218s | Miss |
| Phone 5 | 4.712s | Miss |
| Phone 7 | 4.722s | Miss |

This is additional evidence against P0 runtime quality. All six cases exceed the target, and the slowest is roughly 76% over it. The measurements are a single trial per case with no CPU throttle; phone refers to CSS/device emulation, not physical-device certification. The scene's internal ready definition is useful diagnostic evidence but does not independently establish the exact first moment a human sees a meaningful complete composition. The code that implements the timing probe was not inspected, preserving the clean-context boundary. This runtime gap lowers the interaction/runtime score to 3/5 but does not displace the more consequential fidelity gap selected above.
