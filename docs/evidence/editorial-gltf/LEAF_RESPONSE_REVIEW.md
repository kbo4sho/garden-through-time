# Independent foliage-material checkpoint

VERDICT: LOSE

Scope: bounded foliage-material checkpoint, not whole-product acceptance. Judged the live opt-in glTF artifact against the supplied Lumion/Twinmotion/SpeedTree visual requirements under its existing shared studio lighting. This review read only the three clean briefs, interacted with the running artifact, and captured its own evidence. No implementation, git history, previous reports, or builder rationale was consulted.

## EVIDENCE

Live URL: `http://127.0.0.1:4179/?renderer=gltf&template=balanced-year-3&day=200&from=Kevin`.

Chrome headless, desktop 1440 × 900 and phone 390 × 844, device scale factor 1. Each dated capture was allowed at least 3.5 seconds after navigation; the initial desktop capture waited six seconds. All evidence is in `leaf-response/`. The browser was closed at completion.

- **Desktop July 19, untouched portrait and selected hydrangea detail:** `desktop-3-d200.png`, `desktop-selected-hydrangea.png`. Oakleaf hydrangea is recognizable by its lobed foliage and tall conical heads. Stems connect the canopy into a real spatial plant; the three species have different silhouettes, and their grounding and shadow direction belong to the same scene. The foliage is generally matte, avoiding a wet plastic shine. However, the hydrangea's broad leaves in the lower/front canopy and through its center read as stiff, opaque lobed plates. Their faces have muted olive shading, but too little visible surface turning to suggest supple leaves; the angular perimeter is much more legible than curvature or venation. The same flat leaf-symbol appearance persists in the seasonal-detail panel. Dark-to-light differences often read as separate flat faces rather than smoothly changing material response across a curved organ. This remains apparent at ordinary desktop size, without enlarged crops.
- **Limited drag:** `desktop-peek-held.png`, `desktop-peek-returned.png`. A 125px right / 30px downward drag inside the portrait produced modest parallax and returned to the authored frame on release. Connected stems and overlap remain spatially coherent. This establishes genuine three-dimensional placement, but does not remove the plate-like leaf appearance: several broad hydrangea leaves turn into thin angular slivers, while the face-on leaves remain visually rigid.
- **Desktop May 15:** `desktop-3-d135.png`. With flowers absent from the hydrangea, its angular, comparatively flat lobed leaves are even easier to inspect. The foliage mass is botanically differentiated from Fothergilla and dogwood, but does not reach the supplied supple, fine-detail foliage bar.
- **Desktop October 17:** `desktop-3-d290.png`. Fothergilla orange, hydrangea olive/brown, and dogwood red produce independent species color. Color does not resolve the broad hydrangea leaf surfaces into convincing thin, curved organic material.
- **Desktop January 15:** `desktop-3-d15.png`. The persistent bare framework, aged hydrangea heads, and dogwood red stems are clear. This validates the visible dormant contrast for this checkpoint; it cannot prove the summer leaf material quality.

The entire required phone matrix was captured and inspected:

| Template | January 15 | May 15 | July 19 | October 17 |
|---|---|---|---|---|
| balanced-year-3 | `phone-3-d15.png` | `phone-3-d135.png` | `phone-3-d200.png` | `phone-3-d290.png` |
| layered-seasons-5 | `phone-5-d15.png` | `phone-5-d135.png` | `phone-5-d200.png` | `phone-5-d290.png` |
| living-framework-7 | `phone-7-d15.png` | `phone-7-d135.png` | `phone-7-d200.png` | `phone-7-d290.png` |

All twelve phone views rendered a composed bed with visible date, byline, identities, and a useful seasonal distinction. Evergreen boxwood in the five/seven layouts remains green while the deciduous frameworks become bare; summer and autumn are materially different at whole-bed scale. Small leaf size on the phone softens the rigid leaf impression. It does not supply missing evidence that the desktop foliage meets the material bar. No phone-specific blank or missing foliage was observed in this matrix. Phone usability, sourcing, performance, full-year continuity, and whole-product Gauntlet criteria were not graded by this checkpoint.

## LARGEST GAP

The oakleaf hydrangea's broad leaves still read as stiff, opaque lobed plates at normal desktop portrait and seasonal-detail size. Their silhouette is recognizable, but the leaf faces do not convey enough supple curvature and coherent thin-leaf light response to stop the canopy reading as an assembly of graphic shapes.

## FIXED WHEN

At 1440 × 900, revisit the untouched three-plant bed on days 135 and 200 with hydrangea selected, then hold the same limited drag. Its front/lower and middle-canopy leaves must visibly turn through soft, irregular curvature, with continuous shading and plausible lighter/backlit portions where orientation warrants, while shaded interiors retain depth. The ordinary portrait and existing seasonal-detail panel must both read as supple organic foliage rather than flat lobed plates or hard folded faces, without relying on phone reduction or a zoomed promotional crop. The required 390px 3/5/7 date matrix must retain the same coherent scene response.
