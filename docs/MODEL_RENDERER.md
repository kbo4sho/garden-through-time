# Optional seasonal glTF renderer

Use `?renderer=gltf` (or `?style=model3d`). Photographic and editorial URLs keep their existing behavior. The renderer is carried into parked and copied share URLs; Play retains PR #5's no-history-writes behavior.

## Review links

Run `npm ci`, `npm run build`, then `npm run preview -- --port 4176`.

- Three: `http://localhost:4176/?renderer=gltf&template=balanced-year-3&day=15&from=Kevin`
- Five: `http://localhost:4176/?renderer=gltf&template=layered-seasons-5&day=15&from=Kevin`
- Seven: `http://localhost:4176/?renderer=gltf&template=living-framework-7&day=15&from=Kevin`

Living Framework is offered only in model mode. Selecting seven plants in this mode uses it; existing photographic template IDs and their species are unchanged. The original layouts, editing, plant records, source windows, and share customization still apply. Other templates can mix models and photographic billboards. Unsupported species, including winterberry, stay photographic. A failed GLB load falls back for that species without taking down the timeline.

## Asset and lifecycle contract

Four original, procedurally authored binary glTF assets: fothergilla, Ruby Slippers oakleaf hydrangea, Arctic Fire redtwig dogwood, and Green Velvet boxwood. These are interpretive botanical models, not scanned specimens. No seasonal plant images or splats are used for these four in model mode. No third-party mesh or texture content is included.

`npm run models:generate` regenerates the GLBs and `public/models/manifest.json` from the checked-in organ source and seeded assembly. Hydrangea's organ is authored in Blender; the other organs and plant scaffolds are authored offline with Three.js. `EXT_meshopt_compression` reduces delivery size; drei supplies the decoder locally in the optional model chunk. No Draco CDN or runtime model-generation service is involved. The generation dependencies are development-only.

To rebuild the hydrangea organ and its maps, run Blender 5.2 LTS with
`--background --factory-startup --python scripts/author-hydrangea-blender.py`,
then run `scripts/author-hydrangea-branches.py` the same way, followed by
`npm run models:generate`. `authoring/hydrangea/` retains both packed `.blend`
sources, prototype GLBs, maps and provenance. A detailed 33,153-vertex source bakes onto an
185-vertex delivery leaf. Embedded maps are 512² tangent normals, 256² neutral
albedo and 128² roughness. They contain original tissue and vein detail, with no
baked lighting. These source files are development artifacts; only the four
assembled GLBs are served to the browser. The geometry and maps are shared by
all hydrangea instances within each renderer.

The hydrangea scaffold comes from three explicitly authored branch forms, placed
at uneven junctions on seven curved woody stems. Inward-growing shoots connect
the exterior sprays into the canopy. Blade and petiole meshes share a parent
attachment and growth phase; the generator preserves their world transforms and
smooth source normals when merging the delivery layers. Terminal nodes identify
where the existing seasonal flower geometry attaches. The full model is still
one persistent shrub across the year, with no runtime topology rebuilding.

Each GLB contains merged `branches`, `leaves`, `blooms`, and (dogwood only) `fruit` meshes. `_ANCHOR` is the organ's attachment point and `_PHASE` is its stable emergence/abscission order. Positions and anchors use the same signed 16-bit grid (1/1024 model unit). A shared glTF node scale decodes both; visible and depth materials preserve that transform, including the world-scale term in dried-floret normals. Vertex shaders grow or contract organs around their anchors. No branch topology or geometry is rebuilt on a day tick; no large translucent seasonal meshes are sorted over one another.

The GLTF cache owns geometry; repeats and views share it. Each mounted instance owns and disposes its seasonal materials. Repeats rotate the same scaffold using the stable planting-position ID. Scene framing uses the full-year bounds, so leaf drop does not move the camera. Authored positions and profile scales remain in force; the native fothergilla option rescales the same model.

## Source-to-state manifest

Exact days remain the existing Chicago representative-year interpolation, not a forecast. Source records and uncertainty remain available in the plant details.

| Plant | Source-backed traits represented | Model behavior |
| --- | --- | --- |
| Fothergilla | [NC State Extension](https://plants.ces.ncsu.edu/plants/fothergilla-mount-airy/): white bottlebrush flowers, deciduous foliage, colorful fall display | Rounded toothed leaves emerge independently from spring filaments; individual leaves turn and drop; the brown framework remains. |
| Oakleaf hydrangea | [NC State Extension](https://plants.ces.ncsu.edu/plants/hydrangea-quercifolia/): oak-shaped foliage, pyramidal white flower clusters aging pink then brown, multi-stemmed habit | Lobed leaves; cream panicles age rose and then tan. The same heads remain after summer and through winter, weathering away by the existing early-year persistence boundary. |
| Redtwig dogwood | [NC State Extension](https://plants.ces.ncsu.edu/plants/cornus-sericea/common-name/redtwig-dogwood/): red stems, flat white flower clusters, white fruit, deciduous foliage | Fine upright branching, paired leaf placement, small corymbs and pale berries. Fruit disappears by the existing autumn window; bare red stems remain in winter. |
| Boxwood | [Morton Arboretum](https://mortonarb.org/plant-and-protect/trees-and-plants/boxwood-hybrids/): small evergreen foliage and rounded form | Persistent small leaves, inconspicuous spring flowers, restrained winter bronzing that crosses New Year continuously and recedes in spring. |

`modelSeason` consumes `plantState` and profile windows. Two explicit visual interpolations supplement them: hydrangea heads bridge late summer to the winter persistence window rather than disappear and respawn; evergreen bronzing bridges New Year and fades before spring bloom. Neither changes photographic behavior or plant records.

## Safeguards and checks

- Phone mounts one Canvas, including narrow/unknown viewport detection from PR #5.
- Demand rendering, capped DPR, default power preference, no CSS canvas filter.
- No history writes during Play; paused writes are debounced and quota failures remain caught.
- The existing context-lost fallback and context-restored invalidation remain mounted outside asset Suspense.
- Photographic and glTF living-bed views share a limited perspective peek (±13° yaw, ±7° pitch) that springs back to the authored framing. Editorial ortho cameras stay fixed. Plant tap-to-select ignores a real drag.
- `npm run check` retains the upstream share/mobile regression checks.
- `npm run check:models` checks every day, independent phenology, continuity, 3/5/7 share round trips, compressed GLB decoding and attributes, and download/geometry budgets.
- Model download budget: 5 MB total for the four unique assets. Decoded attribute budget: 24 MB, shared across repeats within one renderer. First encounters with previously hidden seasonal layers may upload their buffers once; subsequent cycles must not allocate more GPU buffers/textures.

Browser evidence and device limitations are recorded in the PR. Desktop browser emulation does not establish that physical iPhone Safari meets the same performance bar.

## Editorial studio pass — September 2026

The four model assets now use a fixed warm key, cool fill and soft rim, with a
neutral continuous ground. Lighting and ground pigment are constant across the
year, so the changed color and density come from the plants. The photographic
CSS wash is disabled only for `model3d`; photo and paper views retain their
existing treatment. This deliberately follows the new shared-studio brief in
preference to the product brief's earlier natural-atmosphere wording.

Geometry is original project work; see [asset provenance and rights](../public/models/LICENSE.md).
Fothergilla has a spreading, ramified scaffold; hydrangea has curved lobed blades
and irregular papery florets; dogwood has independently rooted red canes;
boxwood uses a separate rounded evergreen crown. Broad leaves have curved
cross-sections, restrained midrib pigmentation and varied inclinations.
Inflorescences vary in size and tilt. All four use the same opaque PBR material
family, with organ-specific roughness and a restrained leaf-back transmission
term responding to the common key. There are no photograph-derived color or
lighting targets. Hydrangea uses its original Blender surface maps; the other
species retain the shared material family's procedural surface variation.

The key casts a bounded shadow map (1024 in the portrait, 512 in supporting
views). Model mode uses PCF filtering so the key's three-texel penumbra actually
applies, with restrained shadow intensity across the whole bed. Photo mode keeps
its existing shadow configuration. The depth material uses the same seasonal organ deformation and uniforms
as its visible material; dropping foliage does not leave a full-leaf shadow.
Owned depth and visible materials are both disposed on unmount. Existing soft
contact textures, ambient life and the limited peek stay mounted. Studio fog
blends the distant ground into the backdrop, outside the composition.

See [review evidence](evidence/editorial-gltf/README.md) for captures, measured
asset sizes, browser checks, and independent visual-review results. This is an
opt-in evaluation branch; passing the automated checks is not a visual verdict.
