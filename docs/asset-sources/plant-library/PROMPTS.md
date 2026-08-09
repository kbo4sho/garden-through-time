# Seasonal plant asset prompt manifest

These assets were generated with the built-in image-generation workflow. Each
request produced one 1536 × 1024, 3-by-2 source sheet. The first five cells were
cropped in this order: winter, leaf-out, bloom, summer, fall. The sixth cell was
intentionally blank.

## Shared production prompt

```text
Use case: photorealistic-natural
Asset type: production seasonal billboard sprite sheet for a browser garden composition
Primary request: Create one 3-by-2 contact sheet showing the exact same mature [PLANT] shrub in five seasonal states.
Scene/backdrop: Every cell uses a perfectly flat solid #ff00ff chroma-key background. No shadows, gradients, texture, floor plane, horizon, reflections, or lighting variation.
Subject: [HABIT]. Top row left-to-right: WINTER, [WINTER]; LEAF-OUT, [LEAF-OUT]; PEAK BLOOM, [BLOOM]. Bottom row left-to-right: SUMMER AFTER BLOOM, [SUMMER]; FALL, [FALL]; final cell entirely blank solid #ff00ff.
Style/medium: realistic botanical nursery photography cutout, believable leaf and branch texture, natural color, not glossy or plastic.
Composition/framing: exact 3 columns by 2 rows filling a 3:2 landscape canvas; each plant centered and ground-aligned in its square cell, same camera, same scale, generous padding, full silhouette visible.
Lighting/mood: soft overcast daylight applied only to the plant.
Constraints: no text, no labels, no grid lines, no gutters, no borders, no pots, no mulch, no ground, no cast shadow, no watermark. Do not use #ff00ff inside the plant. Keep species identity, base location, mature habit, branch structure, camera, and scale consistent across all five states.
```

## Plant-specific direction

| Plant | Habit and identifying seasonal direction |
| --- | --- |
| ‘Annabelle’ smooth hydrangea | Rounded 4-foot multi-stem shrub; fine tan winter stems and old heads; fresh broad leaves; large spherical creamy-white mopheads; pale-green aging heads; yellow-green fall foliage and papery tan heads. |
| ‘Little Lime’ panicle hydrangea | Compact rounded-upright woody scaffold; persistent dry cones; fresh serrated leaves; lime-to-white conical panicles; blush-pink aging panicles; yellow-bronze foliage and rose-to-tan heads. |
| ‘Henry’s Garnet’ sweetspire | Broad arching, lightly suckering form; reddish-brown stems and narrow seed racemes; narrow serrated leaves; drooping white bottlebrush racemes; brown summer seed racemes; garnet, burgundy, orange, and copper fall foliage. |
| ‘Ruby Spice’ summersweet | Dense upright-rounded habit; gray-brown stems with narrow seed spikes; glossy serrated leaves; upright deep rosy-pink bottlebrush spikes; fading pink and brown seed spikes; golden-yellow fall foliage. |
| All That Glitters arrowwood viburnum | Dense rounded-upright form; gray-brown winter scaffold; glossy oval leaves; flat-topped creamy-white flower clusters; blue-black drupes; burgundy-red, wine-purple, and orange fall foliage. |
| ‘Regent’ serviceberry | Compact upright thicket-forming shrub, not a tall tree; silver-gray winter branching; soft green leaves; airy five-petaled white flowers; blue-purple berries; yellow, orange, and red fall foliage. |
| Lemon Candy ninebark | Compact rounded-upright habit; reddish peeling bark; lemon-yellow three-lobed leaves; pink buds and white-pink flower clusters; red seed capsules; yellow-bronze and orange fall foliage. |
| ‘Green Velvet’ boxwood | Informal rounded 3-foot evergreen globe; dense small opposite leaves; restrained winter bronzing; bright new tips; tiny pale cream-green flowers; deep velvety summer and fall foliage. |
| Sugar Shack buttonbush | Compact rounded-upright arching form; persistent spherical seed heads; glossy leaves; white spherical pincushion flowers; red-burgundy fruiting heads; golden fall foliage and brown-red seed heads. |
| ‘Red Sprite’ winterberry | Compact broad rounded deciduous shrub; fine gray-brown twigging densely studded with red winter berries; understated spring flowers; developing summer fruit; yellow fall leaves revealing mature red berries. |

## Local processing

Each cell was cropped to 512 × 512, processed with the installed soft-matte
chroma-key helper using border auto-key sampling and despill, resized to
600 × 600, then encoded as alpha WebP. Source sheets are retained beside this
manifest; the fifty runtime assets live under `public/textures/generated/`.
