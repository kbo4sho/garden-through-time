# Independent editorial glTF review

Review date: September 7, 2026. Fresh critic context. Current production artifact: `http://127.0.0.1:4178/?renderer=gltf&template=layered-seasons-5&day=200&from=Kevin`.

**VERDICT: LOSE**

The composition and seasonal interface are inspectable and useful, but the visible foliage still reads as an assembled computer model at ordinary desktop size. It does not meet the specified Lumion fine-detail nature / Twinmotion-Quixel / SpeedTree botanical-fidelity bar. This is a visible plant-realism failure, not a failure of asset ownership, renderer isolation, or the evidence path.

## Scores

Scale: 1 = fails substantially, 3 = credible partial result, 5 = meets the stated bar convincingly.

| Criterion | Score | Direct basis |
| --- | --- | --- |
| Common lighting and material coherence | 3/5 | Ground and shadows connect the four species to one neutral studio scene. Leaf surfaces remain broad, smooth color patches, with conspicuous dark faces and light/dark discontinuities on hydrangea and dogwood. Surface differences between living foliage, stems and weathered heads do not carry the fine-detail reference quality. |
| Botanical seasons | 3/5 | Winter exposes persistent branching, May favors fothergilla flowers, July adds hydrangea bloom, and October differentiates orange fothergilla, red dogwood and evergreen boxwood. Species are distinguishable. Leaf and stem construction is visibly formulaic; hydrangea's late-season mahogany promise is weak in the October image. The four-date evidence does not establish all twelve months or every regional transition. |
| Beauty and composition coherence | 2/5 | The typography and calm palette provide a consistent presentation, and the ground is soft. The hero remains visibly synthetic: large hydrangea blades form flattened overlapping shelves; dogwood exposes regularly arranged red sticks with repeated leaf fans. In seven-plant views, repeated specimens make the assembly pattern more conspicuous. |
| Phone and desktop 3/5/7 seasonal selling | 3/5 | All 24 requested frames are legible; phone has a useful single portrait, visible sender, date, labels and Play. Winter-vs-summer roles are understandable. Desktop exposes the realism defects; phone scale compresses but does not repair them. Tablet has substantial empty portrait area above the bed, weakening the garden's dominance. |
| Safeguards and budget evidence | 4/5 | Four original GLBs total 4,907,196 bytes. Raw requests show the requested models and no photo loads in pure-model beds. Browser evidence covers unchanged photo-default pixels, phone Play, keyboard, peek return, context restoration and winterberry fallback. Real-device and throttled-network performance remain unproven by CSS viewport emulation. |

## EVIDENCE

### Inspection scope and independence

Read the supplied Gauntlet, product brief and fidelity-reference documents as the governing brief. Did not open the prior independent report, evidence README, git history, or builder notes. Inspected every current `desktop-{3,5,7}-{15,135,200,290}.png`, every corresponding `phone-*` capture, and `tablet-5-135.png` in this directory. Read `captures.json` and `browser-checks.json` as raw evidence, and read asset provenance and measured file sizes. The captures were not edited.

Also opened the current running production artifact independently through headless Chrome with Playwright. Waited for `.is-primary.is-ready` before judging. Observed the integrated desktop bed and selected each of fothergilla, dogwood and boxwood to inspect their actual seasonal-detail panel while the full bed remained present. Hydrangea was the initially selected detail. Temporary inspection screenshots were written outside the evidence directory under `/tmp/garden-critic-*.png` and `/tmp/garden-fresh-critic-desktop.png`.

### Normal-size plants and common scene

- `desktop-3-135.png` and `desktop-3-200.png` expose the oakleaf hydrangea most clearly. Its silhouette is recognizably lobed, but the broad front blades read as smooth, angular, overlapping plates. The top and right leaves reveal unusually dark, abrupt faces. The seasonal-detail panel repeats this appearance; the issue is visible without magnification.
- `desktop-5-200.png` places the four species under compatible overall illumination, with coherent ground contact and soft cast shadows. This is successful scene integration. It does not make the organ surfaces tactile or natural enough: hydrangea remains a coarse central stack, while dogwood's leaf fans and long clean red basal rods emphasize procedural assembly.
- `desktop-7-135.png`, `desktop-7-200.png` and `desktop-7-290.png` make repeated dogwood architecture and repeated rounded boxwood masses easy to spot. Repetition is legitimate compositionally, but the specimens lack enough visible organic irregularity to avoid a cloned-model reading.
- `desktop-3-15.png` and `desktop-5-15.png` communicate real leaf loss and differentiate red dogwood structure from brown hydrangea/fothergilla. The basal stems nevertheless look like unusually straight, smooth rods, especially in the foreground dogwood. The winter rendering helps a planting decision but is not a fine-detail nature rendering.
- The fresh live detail views distinguish the finer fothergilla leaves, dogwood's upright habit and small-leaved rounded boxwood. Boxwood has better visual density at normal size; its detail still reads as many repeated blades distributed over a rounded shell.
- The shared warm ground is continuous and soft. No obvious photographic base wedges or floating photographic slabs occur in the pure-model matrix. Decorative birds and butterflies are visible; their flat symbolic treatment remains conspicuous against the intended realistic scene, but this is not the largest gap.

### Seasons and decision support

The four dates establish genuine changes in structure and independent contributions. May's fothergilla is sparse and flowering while hydrangea is leafy; summer fills out the fothergilla and adds hydrangea panicles; October separates the species by color; January retains boxwood while exposing deciduous structure and aged heads. These are useful design judgments.

The normal July panicles are recognizable but visually airy and fragmented; their fine texture does not compensate for the broad simplified foliage beneath. October's hydrangea reads mostly green/olive and brown even while its description promises dark mahogany-red fall color. That is a visual communication weakness at the inspected date, not proof of an incorrect calendar window.

The live plant-details panel identified Ruby Slippers oakleaf hydrangea, mature size, light, moisture, USDA range and bloom/retention range. It explicitly labeled representative timing with low date confidence and stated that exact bounds are visual interpolation for Chicago/Zone 6a, rather than observed local phenology or a forecast. This is appropriate uncertainty communication.

Botanical reference check: [NC State Extension's oakleaf hydrangea record](https://plants.ces.ncsu.edu/plants/hydrangea-quercifolia/) describes large oak-shaped leaves, pyramidal white flower clusters aging pink and brown, and textured/exfoliating mature stems. Those distinctive organs are present in outline, but the artifact does not yet convey their surface character convincingly. [NC State's dogwood record](https://plants.ces.ncsu.edu/plants/cornus-sericea/) is the relevant species reference. The user's required lighting/material dimensions remain those in [Twinmotion's foliage documentation](https://dev.epicgames.com/documentation/en-us/twinmotion/foliage-materials); this is a visual judgment, not a demand to use that engine.

### Responsive behavior and live checks

- All twelve 390px phone captures show a single visible bed with sender, plant labels, readable date, seasonal sentence and Play. No squeezed four-up layout occurs.
- Three-plant frames provide the clearest individual plant comparison. Five-plant frames add the evergreen foreground role. Seven-plant frames preserve the repeated layout but reduce individual-organ readability and expose cloned habits.
- `tablet-5-135.png` preserves all four purposeful views, readable controls and unobstructed captions. Its main bed occupies a comparatively small band amid large empty space; it is less visually dominant than the desktop bed.
- Fresh desktop keyboard interaction advanced the slider from day 200 to 201.
- Fresh phone Play on the seven-plant link advanced the rendered parked day from 15 to 62 after approximately two seconds; pausing committed day 63. One canvas was present. The range input value is not the correct live-play measurement; the timeline's `data-parked-day` is.
- Fresh live production loading and plant-details interaction produced no page errors during the inspected session.

### Safeguards, provenance and measured limits

Actual GLB sizes match the manifest: fothergilla 869,704 bytes; hydrangea 2,118,004; dogwood 1,038,440; boxwood 881,048. Total: **4,907,196 bytes (4.91 MB decimal)**. The manifest separates branches, leaves and blooms, plus dogwood fruit. `public/models/LICENSE.md` records original project geometry and original baked hydrangea maps, with no downloaded third-party assets. This supports the original-asset boundary; this review is not an external legal audit.

`captures.json` records three model requests for the three-plant bed, four for five/seven, no photographic requests for pure-model layouts, and no recorded errors. Desktop/tablet use four canvases; phone uses one.

`browser-checks.json` records zero changed image channels for photo-default phone frames at days 15 and 200 against the baseline; Play advancing from 15 to 121 without history writes; zero repeat-cycle buffer uploads; successful keyboard input; peek changing the view and returning to exact rest; context loss/restore; five winterberry texture requests in the mixed renderer case; and caption clearance across the recorded widths/dates. It records no errors.

The phone-emulation render intervals are approximately 33.3 ms median and 50.3 ms at p95. They are useful local evidence, but neither those values nor capture elapsed times prove performance on a physical tablet or the three-second meaningful-scene requirement over 10 Mbps. All twelve monthly states, all input methods, full non-WebGL startup behavior and exhaustive compatibility filters were not independently audited here. These limits do not prevent a visual LOSE because the primary defect is directly inspectable.

## LARGEST GAP

At normal desktop bed and seasonal-detail size, the leaf-bearing canopy still looks assembled from repeated smooth plates and leaf fans, especially the central oakleaf hydrangea and right-hand dogwood. Broad flattened blades, abrupt dark faces and regular repeated arrangements overwhelm the subtle surface detail and keep the living bed below the required botanical/PBR fidelity bar.

## FIXED WHEN

A fresh critic can inspect the unchanged 1440×900 three-, five- and seven-plant compositions at days 135, 200 and 290, plus each species' actual seasonal-detail panel, and see supple irregular leaves with readable species-specific margins and surface character, plausible backface light response, and connected organically varied canopy depth without conspicuous plate stacks, dark polygon faces or repeated leaf-fan shelves. Recheck January structure and the full 390px seasonal matrix while retaining the shared studio light, approximately 5 MB four-asset total and existing safeguards. Smaller framing, extra blur, or a successful isolated leaf close-up do not close the gap.
