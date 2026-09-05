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

`npm run models:generate` regenerates the GLBs and `public/models/manifest.json` deterministically. Geometry is authored offline with Three.js and compressed with `EXT_meshopt_compression`; drei supplies the decoder locally in the optional model chunk. No Draco CDN or runtime model-generation service is involved. The generation dependencies are development-only.

Each GLB contains merged `branches`, `leaves`, `blooms`, and (dogwood only) `fruit` meshes. `_ANCHOR` is the organ's attachment point and `_PHASE` is its stable emergence/abscission order. Positions and anchors remain in the same coordinate system during compression. Vertex shaders grow or contract organs around their anchors. No branch topology or geometry is rebuilt on a day tick; no large translucent seasonal meshes are sorted over one another.

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
- `npm run check` retains the upstream share/mobile regression checks.
- `npm run check:models` checks every day, independent phenology, continuity, 3/5/7 share round trips, compressed GLB decoding and attributes, and download/geometry budgets.
- Model download budget: 5 MB total for the four unique assets. Decoded attribute budget: 24 MB, shared across repeats within one renderer. First encounters with previously hidden seasonal layers may upload their buffers once; subsequent cycles must not allocate more GPU buffers/textures.

Browser evidence and device limitations are recorded in the PR. Desktop browser emulation does not establish that physical iPhone Safari meets the same performance bar.
