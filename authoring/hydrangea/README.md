# Original oakleaf hydrangea organs and branches

`hydrangea-branches.blend` contains three branch studies (upright, arching and
forked) and the assembled shrub. Explicit control points, leaf poses and branch
junctions define the forms. Seven persistent woody stems carry 32 branch forms,
including inward-growing shoots, 562 connected blades and 15 flower attachments.
The separate branch study sits beside the plant in the editable source and is
excluded from the delivery GLB.

`hydrangea-leaf.blend` contains the delivery organ, a hidden detailed source,
hidden flat bake proxies, original procedural tissue and packed maps. The browser
receives the assembled `public/models/hydrangea.glb`; authoring sources are not
part of the product download.

The 217-vertex delivery blade uses 31 rows on outline control points and their
midpoints, with seven vertices across each row. Its central trough and lobe
shoulders remain in the geometry when branch assembly bends the midrib. Cupping,
twist and mild asymmetric width variation change the individual blade poses.
Each blade connects to the wood through a curved petiole.

Flat copies of the 33,153-vertex detailed source and delivery organ isolate
vascular and fine irregular tissue detail for baking. Large-scale curvature
comes from actual geometry; the tangent normal map does not carry broad facet
compensation that could become invalid after posing. Primary/secondary vein
segments form continuous ridges, without stacked relief at their joints. There
is no periodic sinusoidal corrugation in the source relief.

Normal, neutral albedo and roughness maps use 512, 256 and 128 pixels per side.
Albedo contains pigment variation; the runtime supplies representative-year
colors. Illumination is not baked. All organs respond to the shared studio rig.

Rebuild from the repository root with Blender 5.2 LTS:

```sh
blender --background --factory-startup --python scripts/author-hydrangea-blender.py
blender --background --factory-startup --python scripts/author-hydrangea-branches.py
npm run models:generate
npm run check
```

On macOS, the executable may be
`/Applications/Blender.app/Contents/MacOS/Blender`.

The branch source uses Blender Z-up and exports standard glTF Y-up. Node
transforms carry the stems, blades and petioles into the assembled plant. Each
petiole/blade pair shares an attachment node and seasonal phase, so it grows and
drops as one connected organ. The generator preserves world transforms and
smooth source normals when merging layers. Application builds consume the
committed assets; Blender is required only when changing the source.

These are original project assets with no downloaded models, photographs or
third-party surface maps. [Provenance and rights](../../public/models/LICENSE.md),
[leaf metadata](provenance.json) and [branch metadata](branch-provenance.json)
apply. The geometry interprets oakleaf hydrangea; it is not a scan or cultivar
certification.
