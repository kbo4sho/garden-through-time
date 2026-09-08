# Hydrangea leaf form probe

The current delivery organ has 217 vertices: 31 rows on lobe outline control
points and midpoints, with seven vertices across each row. The blade carries
a soft central trough and raised lobe shoulders. Branch assembly retains that
cross-section while bending the midrib, adding cupping/twist and mild outline
asymmetry. The continuous vein relief is rebaked from the original Blender
high source. Lighting and runtime materials are unchanged in this pass.

[Studio close-up](studio.png), [backlighting](back.png), [half backlight](back-half.png),
[lights off](dark.png), [occluded backlight](back-blocked.png),
and [raw response checks](results.json) use one connected blade/petiole organ
from the actual delivery GLB. They pass the existing light-response test.
The probe camera normalizes the organ's bounds, so it is not a pixel-aligned
comparison against the earlier blade. This is a diagnostic, not a visual verdict.

Reproduce with `scripts/check-leaf-lighting.mjs` against Vite. The earlier
[lighting probe](../leaf-lighting/README.md) is retained as a historical shader
comparison with the prior organ. Final visual judgment uses the normal bed
portrait, selected detail, limited peek and the seasonal phone matrix.

The final normal map is baked between hidden flat source/target proxies, so it
carries vein and irregular fine-tissue relief instead of broad surface/facet
compensation. The repeating sinusoidal source ripple has been removed. The
editable full-curvature source and delivery mesh are retained alongside the
proxies in Blender; only the delivery model is served to the product.
