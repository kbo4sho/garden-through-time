# Editorial mixed-media foliage Gauntlet

## Confirmed direction

The selected visual direction is **03 — Editorial mixed media**: layered
translucent watercolor washes for plant masses, dry-brush edges, selective
colored-pencil contour, stippled leaf texture, and deeper pencil work in foliage
overlaps. The character is calm, tactile, observant, and sophisticated rather
than whimsical or children’s-book-like.

The user selected this direction after comparing three same-scene studies and
confirmed execution on August 10, 2026.

## Goal

Determine whether an editorial watercolor-and-colored-pencil botanical system
is preferable to the current photographic foliage while preserving the ability
to judge one planting composition across a representative Chicago-area year.

The proof is complete only when the protected default planting—Mount Airy
fothergilla, Ruby Slippers oakleaf hydrangea, and Arctic Fire redtwig dogwood—
has a coherent five-state asset system and the integrated experience survives
the existing composition, seasonal, interaction, responsive, and runtime bars.

## Bound artifact

- Workspace: `/Users/kevinbolander/Docs/Workspace/garden-through-time`
- Shaping revision: `1226a1212b53b9e355bbd385e5a8368203e913a3`
- Binding at shaping time: **verified**. The control screenshot was captured from
  the Vite process serving this workspace at
  `/?template=balanced-year-3&day=225&plant=hydrangea`.
- Photographic control: `docs/asset-sources/editorial-mixed-media/photoreal-control.png`
- Selected style reference: `docs/asset-sources/editorial-mixed-media/selected-style-reference.png`
- Botanical and seasonal source of truth: `src/data/plants.ts`,
  `docs/SEASONAL_EVIDENCE.md`, and the current default-plant images under
  `public/textures/`.

The selected screenshot is a style reference, not evidence that production
assets already exist. It re-rasterizes the surrounding interface and therefore
cannot be used as a production UI replacement.

## Required asset proof

Create five independent, non-photographic states for each protected plant:

| Plant | Required states |
| --- | --- |
| Mount Airy fothergilla | winter, leaf-out, bloom, summer, fall |
| Ruby Slippers oakleaf hydrangea | winter, leaf-out, bloom, summer, fall |
| Arctic Fire redtwig dogwood | winter, leaf-out, bloom, summer, fall |

The states may share a coherent illustration system but may not reuse one image
as a shortcut. Each state must preserve the species’ habit, scale, and defining
seasonal structures.

## Inspectable bar

### P0 — Composition fidelity

The illustrated path preserves the existing authored positions, mature-scale
relationships, silhouette hierarchy, overlap, grounding, and all four camera
views.

**Probe:** Capture the control and candidate at the same 1440 × 900 viewport for
January 15, May 10, August 13, and October 18. Overlay corresponding captures at
50% opacity and inspect every view.

**Loses when:** plant positions, relative scale, viewpoints, panel crops, or UI
hierarchy change; a plant floats; or illustration marks spill outside the garden
imagery.

### P0 — Complete state system

All fifteen requested assets exist, are independently authored, and can be
traced to one plant and one seasonal role.

**Probe:** Inventory the asset directory, inspect each file against its source
state, and render every state in isolation and in the composition.

**Loses when:** an asset is missing, duplicated across states, visually empty,
misidentified, or replaced by a global color/filter treatment.

### P0 — Botanical identity and species separation

Fothergilla remains a compact rounded mass with its characteristic bottlebrush
bloom; oakleaf hydrangea retains coarse lobed foliage, panicles, and persistent
heads; redtwig dogwood retains its finer upright habit, fruit, and red winter
stems.

**Probe:** Compare all fifteen candidate assets with the existing source images,
plant records, and scene/detail renders. Inspect both full-scene and close crops.

**Loses when:** the plants become generic shrub blobs, become visually
interchangeable, lose a defining organ or habit, or gain invented botanical
features.

### P0 — Seasonal truth and continuity

The new art follows the existing representative Chicago / Zone 6a ranges. Each
species changes independently and crossfades remain continuous throughout the
year.

**Probe:** Inspect January, May, August, and October; then scrub January 1 through
December 31 slowly and in one ten-second sweep.

**Loses when:** plants change in lockstep, a carrier appears outside its modeled
window, winter is only a tint, paper or matte backgrounds flash between states,
or transitions visibly pop.

### P0 — Composition understanding

The illustrated system preserves or improves the homeowner’s ability to
understand the planting rather than merely making it prettier.

**Probe:** Give five unbriefed design-conscious homeowners the same two-minute
task used by the main Gauntlet. At least four must distinguish the three plants,
describe their layering and seasonal sequence, and name one strong or weak
period.

**Loses when:** fewer than four participants complete the task or participants
admire the illustration but cannot make the planting judgment.

### P0 — Blind preference and trust

The illustrated candidate is preferred to the photographic control without a
decline in clarity or trust.

**Probe:** Randomize unlabeled control/candidate order for the same five
participants. Ask which they prefer overall, which communicates height and
overlap more clearly, and which they would trust for a year-round planting
decision.

**Loses when:** fewer than four prefer the illustrated candidate overall, or
more than one participant finds the photographic control clearer or more
trustworthy.

### P0 — Runtime, interaction, and responsive regression

The experimental style does not weaken the current production bar: meaningful
scene within three seconds, at least 45 fps during desktop scrubbing and 30 fps
on supported tablet, complete keyboard and touch timeline operation, and useful
phone fallback.

**Probe:** Repeat the existing build, asset-load, frame-pacing, keyboard,
tablet, phone, reduced-motion, and console checks for both control and
candidate.

**Loses when:** load or frame pacing misses the existing threshold, assets pop,
memory grows materially, controls regress, the console reports application
errors, or a supported layout loses meaningful content.

### P1 — Product character

The finished art feels calm, cinematic, tactile, and observant. Watercolor and
pencil texture add interpretation without making the experience childish,
decorative, flat, or catalog-like. The composition remains the hero.

**Probe:** A fresh visual critic inspects the four seasonal desktop captures,
tablet and phone captures, isolated assets, and the selected reference.

**Loses when:** treatment becomes whimsical, chalky, muddy, outlined like a
cartoon, visually noisy, or more prominent than the planting judgment.

## Do-not-regress requirements

- Preserve the protected default planting and all existing plant data.
- Preserve the four simultaneous decision-specific views and continuous timeline.
- Preserve sourced seasonal ranges, regional caveats, plant identity, and access
  to decision-supporting details.
- Preserve the photographic experience as a control until the illustrated path
  wins the complete Gauntlet.
- Do not overwrite existing photographic source assets during experimentation.

## Freedoms

The execution lead may choose the asset pipeline, alpha/matte strategy, image
format, texture resolution, loading strategy, and experiment-switch mechanism.
The bar judges rendered pixels, behavior, and evidence rather than a prescribed
technology.

## Out of scope

- Restyling the interface or typography.
- Adding plants, recommendations, layouts, accounts, commerce, or weather data.
- Changing seasonal event ranges or the composition’s authored positions.
- Expanding the illustrated asset system beyond the protected three plants
  before this proof wins.

## Independent critic contract

The builder never grades itself. Every judging round uses a fresh critic context
that receives only this brief, the actual artifact, the control/candidate
captures, source assets, and raw measurements.

```text
VERDICT: WIN | LOSE | UNJUDGEABLE
EVIDENCE: Direct observations, paths opened, commands run, and measurements taken
LARGEST GAP: Required on LOSE; one specific meaningful gap
FIXED WHEN: An observable check proving that gap is closed
```

On `LOSE`, return only the largest useful gap to the builder and use another
fresh critic after repair. On `UNJUDGEABLE`, repair the evidence path before
changing the artifact.

## Stop policy

Stop when every P0 wins, the user stops the loop, further improvement becomes
immaterial, or a confirmed cost or technical boundary is reached. If no
illustrated implementation can clear preference, trust, botanical identity, and
runtime together, retain the photographic control.

## Execution handoff

Build the confirmed Editorial Mixed Media foliage experiment against this bar.
Start with the protected three-plant, fifteen-state asset system. Preserve the
photographic control and expose the candidate through a reversible comparison
path. Validate isolated assets before integration, then inspect the integrated
year at the four seasonal checkpoints and through a continuous scrub. Keep
material builders separate from fresh critics, retain raw evidence, repair only
the largest judged gap each round, and stop only under the stated stop policy.

## Progress

- [x] Direction selected by the user.
- [x] Goal, references, comparison bar, constraints, and stop policy confirmed.
- [x] Fifteen seasonal assets generated and validated.
- [x] Reversible candidate path integrated.
- [x] Four-season and responsive evidence captured.
- [x] Fresh critic verdict recorded.
- [ ] Five-person blind preference and composition-understanding study completed.

## Critic trail

- **Round 1 — LOSE.** The first candidate relied on uniformly sharp,
  high-contrast contours and chromatic edge halos, so it read as noisy outlined
  cutouts rather than the selected watercolor-and-colored-pencil character.
- **Repair.** The fifteen states were regenerated or finish-corrected around a
  validated softer hydrangea anchor, with connected translucent passages,
  broken outer edges, selective interior pencil, and repaired alpha mattes.
- **Round 2 — artifact WIN.** A fresh critic inspected all fifteen isolated
  states, seasonal and responsive control/candidate captures, 50% overlays, and
  the live year. Composition geometry, species separation, seasonal continuity,
  responsive meaning, interaction, reduced motion, and runtime passed. The live
  probe loaded 15/15 assets, recorded 75.7 rAF/s during a ten-second desktop
  sweep, and found zero console errors or warnings.

This is not an overall Gauntlet win yet. The five-person composition-understanding
and blind preference/trust P0 remains unrun, so the photographic path stays the
default and the illustrated candidate remains available only through the
reversible experiment route.
