# Fidelity and presentation references

User direction, September 7, 2026. This is the reference hierarchy for the
editorial glTF work on `codex/editorial-gltf-plants` / PR #15.

## Fidelity: how the plants should look

**Lumion fine-detail nature, Twinmotion + Quixel Megascans, and SpeedTree seasonal
assets** establish the plant-quality bar. Use **shared studio lighting and PBR
coherence** across the bed. Existing photographic billboards and PNGs are not
appearance, pigment, or lighting targets.

Translate the references into these observable requirements:

- Supple, irregular leaf curvature and species-specific margins and venation;
  no conspicuous hard folds or near-black polygon faces at ordinary detail size.
- Depth from connected stems, overlapping organs, and varied orientation. The
  canopy must not reveal a repeated arrangement of cards or horizontal shelves.
- Leaf backs respond plausibly to transmitted light. Interior occlusion and
  external highlights remain coherent under the same key, fill, and rim.
- Bark, leaves, fresh flowers and weathered heads have different surface response
  within one material system. Detailed surface maps can support actual geometry;
  they must not replace the shortlist plants with photographic cutouts.
- Seasonal color, emergence, flowering, retention and abscission belong to each
  species and its sourced windows. Preserve a persistent branching framework.
- Judge full-bed and seasonal-detail views together at 1440 × 900, then verify
  the 390px 3/5/7 bed at days 15, 135, 200 and 290. A close-up win alone does not
  establish a coherent bed, and phone reduction cannot hide desktop defects.

Twinmotion's official foliage documentation identifies backface treatment,
translucency, canopy occlusion and independent lifecycle controls as relevant
vegetation-material mechanisms. These are useful implementation dimensions,
not a requirement to use its engine. [Twinmotion foliage materials](https://dev.epicgames.com/documentation/en-us/twinmotion/foliage-materials).

SpeedTree's material-set documentation describes season-dependent material
weights; use the reference for biological variation rather than one global tint.
[SpeedTree material sets](https://docs9.speedtree.com/modeler/doku.php?id=toolmaterial_sets).

Lumion's nature library is a visual-quality reference. Its published fine-detail
nature materials and close-up framing establish the intended inspection scale;
no embedded Lumion assets have been acquired or extracted.
[Lumion 2026 release notes](https://support.lumion.com/knowledge-base/api/v2/help-center/en-us/articles/lumion-2026.0-release-notes).

## Product: what the experience should sell

**VizTerra / Structure Studios** establishes the designer-pitch and outdoor-living
presentation reference. Earlier VizTerra marketing/UI stills are product
references, not a reason to add a yard editor. The deliverable stays a named,
parked, shareable living bed that helps a designer win a client decision.
[Structure Studios](https://www.structurestudios.com/).

**Enscape** establishes lighting/material coherence: objects must belong to the
same lit scene. Its guidance connects material roughness, light distribution,
color temperature and bounced light with believable rendering.
[Enscape lighting guidance](https://blog.chaos.com/lighting-basics-for-3d-rendering-in-enscape).

## Exclusions and retained boundaries

Avoid iScape-style AR toys, photo-cutout plant apps, and the visible appearance of
game foliage cards. The four shortlisted species must remain true 3D plants.
Winterberry remains the explicit billboard exception. Do not expand into AR,
a yard editor, accounts, a printable list, or disconnected seasonal paintings.

Keep photo-default URLs unchanged, `renderer=gltf` opt-in, phone Play and sharing,
limited peek, ambient life, soft ground, 3/5/7 templates, and approximately 5 MB
for the four shortlisted assets. PR only; no merge or deployment.

## Asset-source reconnaissance — not approved purchases

Product fidelity references do not confer permission to export their libraries.
Before a third-party asset is integrated, establish rights for modification,
commercial browser delivery, and the repository/distribution method actually
used by this project. Separate inspection of topology, seasonal organ separation,
texture channels, cultivar fidelity and the optimized download is also required.
No candidate below has been purchased, downloaded, integrated or cleared for use.

| Published candidate | Verified information | Outstanding suitability work |
| --- | --- | --- |
| [CGAxis oakleaf hydrangea](https://sketchfab.com/3d-models/oakleaf-hydrangea-abbc0ee7afe24651b37b55db82e5e50f) | The creator's listing identifies oakleaf hydrangea and reports about 1.8 million triangles. | Inspect leaf/flower topology, Ruby Slippers habit, seasonal separation, PBR channels and reduction quality. This is not a drop-in phone asset. Confirm the license covering the actual download and browser/repository distribution. |
| [Maxtree Fothergilla gardenii](https://maxtree.org/products/v146_fothergilla_gardenii_01/) | Six variants are listed at roughly 102,000–221,000 polygons, with FBX and other authoring formats. This is F. gardenii, not a verified Mount Airy cultivar asset. | Botanical/cultivar correction, bloom and winter scaffold inspection, material conversion and size reduction are unproven. The linked license restricts passing assets on; ordinary purchase is not established clearance for public GLB/source distribution. |

Maxtree's linked agreement allows project use while restricting transfer and
passing on its product. Treat browser-delivered and publicly committed derivatives
as unresolved until that use is expressly covered.
[Maxtree agreement linked by the product](https://s3.us-west-1.wasabisys.com/maxtreeweb/MT_PM/MT_PM_PDF/MT_License_Agreement_V1.pdf).

Likewise, Fab's license summary distinguishes incorporated project distribution
from standalone asset redistribution. A “royalty-free” label alone does not settle
this project's asset-hosting and source-repository requirements.
[Fab license summary and agreement](https://www.fab.com/eula?lang=en).

Asset listings are reconnaissance, not evidence of visual acceptance or distribution
rights. The implemented shortlist remains original project geometry and materials.
Its current acceptance status is recorded in the [independent review](evidence/editorial-gltf/INDEPENDENT_REVIEW.md).

## Implemented studio treatment

The glTF route uses curved leaf surfaces, rounded oakleaf lobes, blade-local vein
pigmentation and shared directional thin-organ light response. Hydrangea florets
are modeled individually at a smaller scale; retained heads curl, shrink at each
floret and become rougher as they dry through the existing sourced seasonal
windows. Per-organ growth and drying also affect cast shadows. The four meshes
share one studio rig; these changes do not retarget the photographic renderer.

Desktop and tablet glTF portraits reserve a separate caption band above the
canvas so animated life and plants cannot cross the seasonal story. Phone share
links retain the existing one-canvas recipient layout and Play controls.
