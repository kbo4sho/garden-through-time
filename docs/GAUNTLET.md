# Gauntlet brief

## Goal

Create a cinematic, botanically credible 3D composition of three compatible flowering shrubs. A homeowner must be able to scrub to any day of a representative year and see species-specific changes in foliage, bloom, fruit, fall color, leaf drop, and dormant structure.

Within two minutes, the user should understand how the plants layer together, when each contributes seasonal interest, where the composition becomes weak, and whether the plants suit their growing conditions.

## Reference bar

- [Garden Sketchbook](https://www.gardensketchbook.com/) establishes the closest browser-based, true-to-scale seasonal garden baseline. This project must exceed it in continuous seasonal storytelling and visual finish.
- [Twinmotion foliage materials](https://dev.epicgames.com/documentation/twinmotion/foliage-materials?lang=en-US) establishes the visual comparison for vegetation materials, depth, translucency, and lifecycle behavior.
- [RhinoLands seasonal displays](https://rhinolands.com/support/tip/assign-the-seasonal-display-to-plant-species/) establishes the precedent for species-specific seasonal states rather than one global seasonal effect.
- [Lands Design plant database](https://help.landsdesign.com/tools/plant-database/) establishes a useful plant-data precedent for morphology, climate, flowering, fruiting, and mature size.

These are comparison bars, not prescribed technologies.

## Inspectable bar

### P0 — First-frame impact

At 1440×900, the untouched first frame reads as an intentionally designed living landscape. The garden dominates the viewport before the user interacts.

**Probe:** Capture the first five seconds with no interaction.

**Loses when:** catalog cards, controls, empty space, or loading treatment dominate; the experience resembles conventional landscape software rather than a living garden.

### P0 — Plant realism

January, May, August, and October withstand full-scene and close-up inspection for botanical silhouette, material variation, foliage translucency, grounding, lighting, shadows, and depth.

**Probe:** Compare dated captures against real photographs of the selected cultivars and the Twinmotion reference dimensions.

**Loses when:** foliage looks plastic, cloned, billboard-like, or generic; plants float; geometry repetition is obvious; or species become visually indistinguishable.

### P0 — Seasonal truth

Every visible state can be traced to authoritative regional horticultural evidence. Species change independently and seasonal uncertainty is communicated honestly.

**Probe:** Inspect twelve monthly captures and the source-to-state manifest for each species.

**Loses when:** plants change in lockstep, flowers appear outside a credible window, winter is only a color tint, or weather-sensitive dates are presented as certainty.

### P0 — Time interaction

The experience supports continuous January 1–December 31 movement by pointer, touch, and keyboard. The current date remains visible and plant transitions feel continuous.

**Probe:** Scrub the full year slowly and in one ten-second sweep on every supported input method.

**Loses when:** four seasonal assets are disguised as a slider, state swaps are abrupt, input is missed, or the relationship between date and plant state is unclear.

### P0 — Composition understanding

At least four of five unbriefed target users can identify the plants, describe their sequence of seasonal interest, and name one strong or weak period within two minutes.

**Probe:** Run the same short comprehension task with five target participants and retain raw notes.

**Loses when:** participants admire the image but cannot explain why the plants belong together or what happens outside the displayed date.

### P0 — Data and filters

Every plant exposes sourced bloom range, foliage behavior, mature size, light, moisture, and climate compatibility. Filters only produce horticulturally compatible substitutions.

**Probe:** Trace rendered states and every substitution result back to source records and compatibility rules.

**Loses when:** output is horticulturally fictional, recommendations are unexplained, or filters permit incompatible combinations.

### P0 — Runtime quality

On a modern laptop over a simulated 10 Mbps connection, a meaningful scene appears within three seconds. Scrubbing maintains at least 45 fps on desktop and 30 fps on a supported tablet.

**Probe:** Record cold-load timing, frame pacing during a full-year scrub, memory behavior, and asset loading on the target devices.

**Loses when:** there is a long blank load, slider-driven stutter, visible asset popping, excessive memory growth, or frozen controls.

### P1 — Responsive and accessible fallback

Keyboard operation, reduced motion, readable contrast, visible plant identity, and a meaningful non-WebGL fallback work. Desktop and tablet receive the complete experience; phone users receive a useful simplified view.

**Probe:** Navigate without a pointer, enable reduced motion, disable WebGL, inspect contrast, and test at representative desktop, tablet, and phone sizes.

**Loses when:** essential information exists only in motion or color, the timeline is inaccessible, plant identity disappears, or an unsupported device receives a blank canvas.

## Stop policy

The loop stops when the integrated artifact wins every P0 requirement, the human stops it, further improvement becomes immaterial, or a confirmed cost or risk boundary is reached. Completing a fixed number of rounds is never evidence that the bar was met.

## Independent critic contract

The builder never grades itself. Each judging round uses a fresh critic context that receives only this brief, relevant constraints, the actual running artifact, and raw evidence. Withhold builder reasoning, history, summaries, and self-assessment.

The critic returns:

```text
VERDICT: WIN | LOSE | UNJUDGEABLE
EVIDENCE: Direct observations, captures, interactions, sources, and measurements
LARGEST GAP: One specific meaningful gap, required on LOSE
FIXED WHEN: An observable check proving that gap is closed
```

On `LOSE`, return only the largest gap to the builder and use another fresh critic after repair. On `UNJUDGEABLE`, repair the evidence or inspection path before changing the product.

