# Model provenance and rights

The four `.glb` files are original geometry authored for
`kbo4sho/garden-through-time`. `scripts/generate-plant-models.mjs` assembles
the plants, including a Blender-authored oakleaf hydrangea organ. They are
interpretive botanical models, not scans or reconstructions of photographs.
There are no downloaded meshes, photograph-derived maps, image-derived
lighting, or third-party asset-service outputs.

The hydrangea's original tangent normal, neutral albedo and roughness maps are
baked in Cycles from a detailed original leaf surface. The albedo carries tissue
and vein variation; the existing seasonal material supplies chlorophyll and fall
color. Direct and indirect illumination are excluded from the color bake, so
all four species respond to the same runtime studio lighting. The other three
assets retain geometric organs and procedural runtime vein pigmentation.
See `authoring/hydrangea/provenance.json`, the packed `.blend` source, and
`scripts/author-hydrangea-blender.py` for the authoring record.

The assets belong to this project. This note does not grant a separate
redistribution license or dedicate the assets to the public domain; permission
for use outside the project rests with the repository owner.

The offline generator uses Blender and Cycles, plus Three.js, glTF Transform,
and meshoptimizer (MIT licensed JavaScript tooling). Tool licenses remain with
their respective packages; no bundled example assets are used.
The botanical references below inform morphology and seasonal behavior; no
photographs or text from those sites are embedded in the assets.

| Asset | Botanical evidence |
| --- | --- |
| `fothergilla.glb` | [NC State Extension, Mount Airy](https://plants.ces.ncsu.edu/plants/fothergilla-mount-airy/): rounded multi-stem habit, alternate toothed foliage, spring white stamens, mixed autumn colors. |
| `hydrangea.glb` | [NC State Extension, oakleaf hydrangea](https://plants.ces.ncsu.edu/plants/hydrangea-quercifolia/): lobed opposite leaves, pyramidal clusters, flowers aging pink and dry tan. The project's Ruby Slippers profile supplies the cultivar and regional windows. |
| `dogwood.glb` | [NC State Extension, redtwig dogwood](https://plants.ces.ncsu.edu/plants/cornus-sericea/): opposite foliage, flat white flower clusters, pale fruit, exposed red winter stems. The existing Arctic Fire profile supplies scale and regional windows. |
| `boxwood.glb` | [Morton Arboretum, boxwood hybrids](https://mortonarb.org/plant-and-protect/trees-and-plants/boxwood-hybrids/): small evergreen leaves, rounded Green Velvet habit, inconspicuous flowers, possible winter bronzing. |

References checked September 7, 2026. Plant profiles remain the authority for
Chicago-area representative-year windows. Exact geometry, specimen fullness,
flower retention, leaf order, pigment variation, and studio reflectance are
visual interpretations, not claims about a specific living specimen.
