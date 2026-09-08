# Delivered-leaf light response

This development-only probe isolates a connected organ from the actual hydrangea
GLB and uses the production seasonal material. Geometry, pigment, camera and
light positions are identical between captures. The baseline material is from
`da59d3c`; the current material uses each light’s shadow-attenuated incident color
for an approximate thin-tissue response. It uses opaque geometry, with no alpha
sorting or refraction pass. These controlled captures diagnose shader behavior;
they do not establish botanical fidelity.

| Condition | Before | Current |
| --- | --- | --- |
| All lights off | [Dark](baseline/dark.png) | [Dark](current/dark.png) |
| Half rim intensity | [Half](baseline/back-half.png) | [Half](current/back-half.png) |
| Full rim intensity | [Full](baseline/back.png) | [Full](current/back.png) |
| Rim blocked by opaque plane | [Blocked](baseline/back-blocked.png) | [Blocked](current/back-blocked.png) |
| Key + fill + rim | [Studio](baseline/studio.png) | [Studio](current/studio.png) |

The old shader emits visible color with every light off (maximum output channel
56/255) and retains that glow behind an opaque blocker. The current shader is
black in both cases. Doubling incident backlight increases the image mean from
0.218 to 0.686 on this view. Values are display-encoded, tone-mapped screenshot
channels, not radiometric linear measurements. See the raw
[baseline](baseline/results.json) and [current](current/results.json) results.

Run Vite, then open `/authoring/leaf-lighting.html` or run
`node scripts/check-leaf-lighting.mjs`. Set `DEV_URL`, `PLAYWRIGHT_MODULE`,
`SHARP_MODULE` and `EVIDENCE_DIR` as needed. The browser test checks darkness,
intensity response, shadow occlusion, visible lit tissue and console errors.
The study is an authoring page served by Vite; application production builds
do not include it. The fixed studio rig and all delivery GLBs are unchanged.
