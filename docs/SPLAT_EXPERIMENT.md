# Gaussian splat experiment

## Status

The first Gaussian-splat asset is an opt-in visual experiment, not a replacement
for the source-backed seasonal plant system. Open the experience with
`?splat=hydrangea` to enable it. Without that query parameter, the production
path and initial bundle remain unchanged.

## Source and generation

- Source image: `public/textures/hydrangea-summer.webp`
- Subject: Ruby Slippers oakleaf hydrangea summer/bloom state
- Generator: [LGM](https://github.com/3DTopia/LGM) through the project's public
  Hugging Face Space
- Generated: August 8, 2026
- Settings: 30 inference steps, elevation 0, seed 7
- Positive prompt: `single compact oakleaf hydrangea shrub, broad rounded
  natural habit, lobed oak-shaped leaves, upright conical cream-to-pink flower
  panicles, isolated botanical plant asset`
- Negative prompt: `pot, planter, vase, multiple separate shrubs, tree,
  topiary, clipped hedge, blurry, pixelated, unnatural colors, duplicate
  branches, floating foliage, distorted leaves`

The LGM PLY contained 48,777 Gaussians, no spherical-harmonic bands, and was
2,731,873 bytes. It was converted with PlayCanvas SplatTransform 3.2.0 to SPZ
version 3. The browser asset is 695,903 bytes.

## Runtime treatment

- Spark 2.1 is loaded in a separate lazy chunk only for the experiment URL.
- Loading is deferred until the browser is idle, leaving the photographic
  canopy in place as the meaningful first frame.
- The billboard remains visible until the splat is decoded, then crossfades
  according to the existing hydrangea bloom and summer keyframe weights.
- Fall, winter, and leaf-out continue to use the existing authored images.
- Repeated hydrangeas share one decoded splat source.

## Observations

The source-facing view and the first roughly 60 degrees of orbit remain coherent
enough for the current constrained camera. The inferred far side becomes more
generic, leaf scale increases, and LGM invents a dark base beneath the shrub.
Those areas were not present in the input evidence and must not be treated as a
botanically observed reconstruction.

This experiment demonstrates that a splat can add useful volume without losing
the current hero frame. It does not demonstrate that independently generated
seasonal splats will align or transition like one living plant. A production
asset should use a stable branch scaffold with separable leaf, bloom, and fruit
layers, or a true multi-view capture of the same specimen.

## Integrated check

The production build completed with the splat renderer isolated in its own lazy
chunk. The normal entry bundle remains approximately 336 KB gzip. Enabling the
experiment adds approximately 1.76 MB gzip of renderer code plus the 696 KB SPZ
asset, so this is still too expensive to make the default path without further
optimization. In a local 1440×900 production run, a playing year held 60.1 fps
for a two-second sample and produced no browser errors or warnings. The
photographic fall fallback remained intact after the summer splat faded out.
