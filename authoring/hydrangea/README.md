# Original oakleaf hydrangea organ

`hydrangea-leaf.blend` is the editable source: one low-resolution delivery organ,
one hidden detailed baking source, original procedural tissue, and packed maps.
The detailed source is for offline baking only. The browser receives the leaf
assembled into `public/models/hydrangea.glb`, alongside seasonal branch and
flower geometry.

Rebuild from the repository root with Blender 5.2 LTS:

```sh
blender --background --factory-startup --python scripts/author-hydrangea-blender.py
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

The prototype GLB preserves authoring coordinates and glTF UV orientation. The
plant generator reads that GLB, varies each leaf's width and bend, and recomputes
normals before placing opposite leaves on the persistent seasonal scaffold.
The checked-in maps are embedded in the final plant GLB. Blender is needed only
when changing the authored organ; normal application builds use the committed
plant assets.

These are original project assets, with no downloaded models, photographs or
third-party surface maps. [Provenance and rights](../../public/models/LICENSE.md)
and [authoring metadata](provenance.json) apply. Botanical geometry is an
interpretation of oakleaf hydrangea, not a scan or cultivar certification.
