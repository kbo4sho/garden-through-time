# Original oakleaf hydrangea organs and branches

`hydrangea-branches.blend` contains three branch studies (upright, arching and
forked) and the assembled shrub. Explicit control points, leaf poses and branch
junctions define the forms. The shrub has seven persistent woody stems and 32
placed branch forms, including smaller inward-growing shoots. Its 562 blades
bend along independently curved midribs, with varied cross-blade cupping and
twist. They connect to the stems through curved petioles; 15 terminal attachments carry the
runtime's seasonal panicles. The separate study sits beside the plant in the
editable source and is excluded from the delivery GLB.

`hydrangea-leaf.blend` is the editable source: one low-resolution delivery organ,
one hidden detailed baking source, original procedural tissue, and packed maps.
The detailed source is for offline baking only. The browser receives the leaf
assembled into `public/models/hydrangea.glb`, alongside seasonal branch and
flower geometry.

Rebuild from the repository root with Blender 5.2 LTS:

```sh
blender --background --factory-startup --python scripts/author-hydrangea-blender.py
blender --background --factory-startup --python scripts/author-hydrangea-branches.py
npm run models:generate
npm run check
```

On macOS, the executable may be
`/Applications/Blender.app/Contents/MacOS/Blender`.

The original outline, curved surface and raised venation bake onto an 185-vertex
leaf. Normal, neutral albedo and roughness maps use 512, 256 and 128 pixels per
side respectively. Albedo contains pigment variation rather than a final summer
green; the runtime applies the representative-year colors. Illumination is not
baked. All organs therefore respond to the bed's shared studio light.

The branch source uses Blender's Z-up coordinates and exports a standard Y-up
GLB. Node transforms carry every stem, blade and petiole into the assembled
plant. Each petiole/blade pair shares an explicit attachment node and seasonal
phase, so it grows and drops as one connected organ. The plant generator reads
these transforms and preserves Blender's smooth normals. The checked-in maps
are embedded in the final plant GLB. Blender is needed only when changing the
authored organ or branches; application builds use the committed plant assets.

These are original project assets, with no downloaded models, photographs or
third-party surface maps. [Provenance and rights](../../public/models/LICENSE.md)
and [leaf](provenance.json) / [branch](branch-provenance.json) authoring metadata
apply. Botanical geometry is an
interpretation of oakleaf hydrangea, not a scan or cultivar certification.
