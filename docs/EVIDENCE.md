# Prototype evidence

This record captures repeatable checks for the current interactive proof. It does not replace target-user comprehension testing or a production horticultural review.

## Planting recommendation templates

- Nine stable recommendation records provide exactly three options for each
  authored three-, five-, and seven-plant layout. The automated inventory probe
  verifies unique IDs, matching planting lengths, existing plant references,
  four nonempty seasonal carriers, one future preview recommendation per size,
  and the protected default.
- Every plant and recommendation carries a `preview` or `full-library` access
  tier. Preview recommendations depend only on preview plants. The current proof
  sets full-library access explicitly and contains no authentication, payment,
  or nonfunctional purchase action.
- Browser interaction evidence applies a complete recommendation, replaces only
  position 02, observes the explicit `Customized from` state, and restores the
  original ordered planting. Changing cluster size applies that size's preview
  recommendation and exposes exactly three matching template cards.
- Keyboard activation of `Summer to Structure` updates the selected state and
  seven-plant composition. Native button semantics expose the active template,
  cluster size, positions, seasonal rationale, and restore availability without
  relying on color alone.
- Thirty-six 1440 × 900 captures cover January 15, May 10, August 13, and
  October 18 for all nine recommendations. Every capture retains the garden
  portrait, left three-quarter, right three-quarter, planting detail, plant
  identity rail, and year control. The raw captures and nine four-season contact
  sheets are retained under the ignored `output/playwright/` evidence folder.
- Editor captures at 1024 × 768 and 390 × 844 keep all three recommendations
  readable and selectable; the panel scrolls into the unchanged position-level
  editor on the phone fallback.
- `npm run audit:templates`, `npm run check`, and `npm run build` pass. The
  browser console contains the development-only React tools notice and no
  errors or warnings from the application.

The confirmed feature bar is recorded in
[`docs/TEMPLATE_GAUNTLET.md`](TEMPLATE_GAUNTLET.md). A fresh critic must issue
the feature verdict; these observations are raw inspection evidence, not a
builder verdict. The fresh critic returned **WIN** after independently applying
all nine recommendations, checking their ordered plantings, exercising
customize/restore and keyboard timeline behavior, inspecting every supplied
seasonal capture, and tracing the content/access boundary.

## Ambient life and soft ground contact

- Two instanced birds and three instanced butterflies sit on the primary
  photographic or glTF portrait only. Secondary contact-sheet canvases and
  editorial paper views stay still. Shared geometries and `MeshBasicMaterial`s;
  no extra textures, lights, or shadows.
- Motion is demand-frame: `frameloop="demand"` is unchanged. A 90ms ticker
  invalidates the primary canvas while the tab is visible and reduced motion is
  off. Play still drives frames from the 42ms day tick. Butterflies fade out
  outside the warm months; birds stay quieter in winter.
- Plant–ground contact: authored layout Y lifts are flattened, photographic
  billboards sit slightly lower, glTF trunks sink 4.5cm, and each plant shares
  one broader grounding shadow, a tighter soil-line disk, and a short vertical
  skirt that hides the billboard foot. The photo foot feather is a longer,
  nonlinear fade with a slight soil darken — not a hard cut.

## Runtime

- Production build: `npm run build`
- Simulated connection: 10 Mbps download, 40 ms latency, cache disabled
- First contentful paint: 460 ms
- All 13 scene textures ready: 1,699 ms
- Navigation-to-texture wall time: 1,825 ms
- Two-second scripted January 1–December 31 scrub: 60.2 fps
- Browser console: zero errors and zero warnings

## Interaction and responsive checks

- Pointer, keyboard, and touch-oriented range input reach every day from January 1 through December 31.
- The date, seasonal narrative, plant phases, and scene update together.
- Plant selection exposes identity, bloom range, foliage behavior, mature size, light, moisture, hardiness, and an Extension source.
- Photographic and glTF living-bed canvases accept a damped pointer/touch peek of at most ±13° yaw and ±7° pitch. Release springs back to the authored frame. A tap still selects a plant; a drag of 7px or more does not. Editorial ortho views stay fixed. Chromium at 1440×900 and 390×844 confirmed the peek, spring-back, one-canvas phone share, and Play still advancing the year.
- Conditions disclose the representative-year assumption and the composition's Chicago / Zone 6a fit.
- The Native species filter replaces Mount Airy fothergilla with dwarf fothergilla throughout the scene, plant rail, and detail card. It explains the retained design role and compatibility, updates scale and identity, exposes all six source fields, and toggles back without stale state.
- Desktop and 390×844 phone captures retain the scene, plant identity, and year control.
- A pasted living-bed URL must unfurl from the GitHub Pages origin. `og:image` /
  `twitter:image` point at `https://kbo4sho.github.io/garden-through-time/og.jpg`
  (1200×630, well under 1MB). Crawlers do not run the SPA; `chatgpt.site` is not
  in the unfurl path.
- Phone first-paint keeps the parked day. Native range controls that fire a layout
  `input` at day 183 (2 July) are ignored unless the recipient is actually
  scrubbing. A January pitch must not open as summer. Chromium at 390×844 did
  not reproduce the live July first-paint; the attached iOS-style capture remains
  the observation, and the midpoint guard is the shipped defense.
- Phone recipient first-paint is a simplified seasonal view: one garden portrait
  owns the 390×844 viewport. On a `from=` share link, the garden is the first
  paint, Play and the year scrubber are the unmistakable interaction (date and
  season live in that dock), and designer tools stay behind a single overflow
  control. Editorial headline and plant-details chrome recede. Plant names stay
  in a quiet two-by-two grid; tapping a plant still opens its record. Hit
  targets remain at least 44px. The desktop four-up contact sheet is unchanged.
  While WebGL loads, the portrait keeps a warm “Loading the year” overlay
  until two complete garden frames have drawn — not a black canvas, empty
  gray panels, or the “3D view unavailable” fallback. The plant record wraps
  on a 390px sheet with no horizontal scroll, and Plant details keeps a 44px
  row above the year dock. Month labels are spans, not empty buttons; all
  twelve are visible.

## Thirteen-plant library expansion

- Ten additional common shrubs are available alongside the protected starter
  composition, for thirteen total source-backed choices.
- Every added plant has its own winter, leaf-out, bloom, summer, and fall alpha
  billboard: 50 finished 600 × 600 WebP assets in
  [`public/textures/generated`](../public/textures/generated) plus the retained
  source sheets and prompt manifest in
  [`docs/asset-sources/plant-library`](asset-sources/plant-library).
- An automated asset probe found all 50 expected files, all at 600 × 600 with an
  alpha channel. No seasonal state is reused across species.
- The composition editor groups choices into Spring bloom, Summer bloom,
  Foliage & fruit, and Winter structure. Visual choice cards show habit, role,
  and mature height; moisture, drainage, and pollination caveats remain visible.
- Representative integration checks covered Annabelle hydrangea in summer,
  Regent serviceberry in spring, and Red Sprite winterberry in January. The
  winterberry pollinator requirement is visible at selection time.
- Three-, five-, and seven-plant layouts render without clipping. The seven-plant
  rail summarizes repeated species while preserving identity and phase.
- Playwright captures at 1440 × 900, 1024 × 768, and 390 × 844 retain all four
  views at once. The editor remains usable on tablet and phone, and the browser
  console reports zero errors and zero warnings.
- `npm run check` and `npm run build` pass. Vite reports only its advisory large
  chunk warning for the existing Three.js bundle.

The confirmed scope and inspectable bar are recorded in
[`docs/PLANT_LIBRARY_GAUNTLET.md`](PLANT_LIBRARY_GAUNTLET.md).
The exact source-to-state boundary and every encoded event range are recorded in
[`docs/SEASONAL_EVIDENCE.md`](SEASONAL_EVIDENCE.md); the running plant detail
view derives the same trace directly from the renderer profile and labels all
exact Chicago day bounds as low-confidence visual interpolation.

Cross-year carryover is also profile data rather than an implicit art-state
exception. `winterDisplay` supplies the shared windows, label, provenance, and
confidence used by the billboard crossfade, phase label, and evidence trace.
Fruit onset—and an early fruit end where applicable—also drives the photographic
state transition. January checks now show Red Sprite’s “Winter
berries” and Little Lime’s aged heads inside an explicit cross-year trace rather
than outside their summer bloom or fruit windows.

### Plant-library critic trail

1. The first fresh pass lost because exact Chicago day windows were not
   source-auditable or labeled as interpolation.
2. The second pass confirmed the new manifest and UI disclosure, then lost
   because January carryover states were still outside that model.
3. The third pass confirmed cross-year fields, then caught December winterberry
   phase precedence and fruit timing disconnected from the photographic path.
4. The final fresh pass returned **WIN** after probing every month anchor and
   every event boundary ±1 day for all ten additions. The scene, rail/detail
   phase, and disclosed trace agreed; all other P0s remained intact.

## Seasonal checkpoints

- January: dormant fothergilla and hydrangea structure; hydrangea retains aged heads; dogwood red stems lead.
- May: fothergilla blooms while hydrangea and dogwood remain in leaf-out foliage states.
- June: fothergilla has moved to foliage; hydrangea and dogwood bloom states take over.
- August: hydrangea panicles age pink and dogwood fruit appears against full foliage.
- October: gold and amber fothergilla, green-to-dark-mahogany hydrangea, and a thinning russet-purple dogwood remain visually distinct.

The seasonal windows and plant facts are maintained in [`src/data/plants.ts`](../src/data/plants.ts). The rendered keyframes interpolate continuously inside those sourced windows and remain explicitly representative rather than predictive.

### Fall-color correction

The first fall art pass pushed all three plants into saturated red states at the same time. The corrected pass deliberately separates both palette and timing:

- Mount Airy fothergilla is predominantly gold and yellow with amber, orange, and limited scarlet variation, following [NC State Extension's yellow-orange-red description](https://plants.ces.ncsu.edu/plants/fothergilla-mount-airy/common-name/mt-airy-fothergilla/).
- Ruby Slippers oakleaf hydrangea transitions from lingering dark green into restrained mahogany, following the [U.S. National Arboretum cultivar release](https://www.usna.usda.gov/assets/images/as_standard_image/Hydrangea_quercifolia_Ruby_Slippers.pdf).
- Arctic Fire redtwig dogwood uses muted russet-purple foliage, loses visual leaf mass earlier, and exposes its red stems, following [NC State Extension's red-orange-to-purple description](https://plants.ces.ncsu.edu/plants/cornus-sericea/common-name/redtwig-dogwood/).

October 1, October 18, and November 11 production captures verify that these states hand off independently rather than reaching one synchronized peak-red frame.

## Gauntlet trail

1. Round 1 lost on generic low-poly plant realism.
2. Round 2 lost on repeated flat foliage, uniform stems, and polygonal grounding.
3. Round 3 lost on stacked seasonal planes and smeared contact shadows during close orbit.
4. Round 4 lost when the October shader path dropped the complete fall scene.
5. Round 5 retained the fall scene after cold load and slow and rapid scrubs, then lost on keyboard range operation.
6. Round 6 passed Arrow, Home, and End control, then lost because filters and complete visible source records were not functional.
7. Round 7 added a live native-species filter and an explained, source-backed substitution whose record includes bloom, foliage, size, light, moisture, and climate compatibility. The independent critic observed the production artifact and returned `UNJUDGEABLE` solely because no raw notes exist for the mandatory five-person, unbriefed homeowner comprehension study.

## External validation boundary

The next Gauntlet action is not another implementation round. Five unbriefed target users must receive the same two-minute task, with raw notes retained. The composition-understanding P0 wins when at least four can identify the plants, describe their seasonal-interest sequence, and name one strong or weak period. No proxy or builder self-assessment can satisfy that criterion.
