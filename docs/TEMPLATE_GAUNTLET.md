# Planting template Gauntlet

## Confirmed goal

Add nine source-backed planting recommendations: three each for the authored
three-, five-, and seven-plant compositions. A homeowner can apply a complete
recommendation, understand how it carries the garden through the year, and then
replace any individual plant without disturbing the other positions.

Templates are modeled as product inventory with stable IDs and a `preview` or
`full-library` access tier. The current proof exposes every template while its
value is being validated; it does not add accounts, checkout, or nonfunctional
purchase controls.

## Confirmed recommendations

| Size | Template | Ordered planting |
| --- | --- | --- |
| 3 | Balanced Year | Fothergilla; oakleaf hydrangea; redtwig dogwood |
| 3 | Light + Structure | Serviceberry; Little Lime hydrangea; Green Velvet boxwood |
| 3 | Moisture Garden | Virginia sweetspire; Sugar Shack buttonbush; redtwig dogwood |
| 5 | Layered Seasons | Fothergilla; oakleaf hydrangea; redtwig dogwood; fothergilla; Green Velvet boxwood |
| 5 | Woodland Framework | Serviceberry; Annabelle hydrangea; redtwig dogwood; Virginia sweetspire; Green Velvet boxwood |
| 5 | Long Summer | Fothergilla; Little Lime hydrangea; Ruby Spice summersweet; Lemon Candy ninebark; redtwig dogwood |
| 7 | Full Seasonal Tapestry | Fothergilla; oakleaf hydrangea; redtwig dogwood; serviceberry; Green Velvet boxwood; Virginia sweetspire; Lemon Candy ninebark |
| 7 | Summer to Structure | Fothergilla; Annabelle hydrangea; redtwig dogwood; Little Lime hydrangea; Green Velvet boxwood; Ruby Spice summersweet; Lemon Candy ninebark |
| 7 | Moist Garden Drift | Virginia sweetspire; Sugar Shack buttonbush; redtwig dogwood; fothergilla; Ruby Spice summersweet; Virginia sweetspire; redtwig dogwood |

The first template at each size is the proposed future free preview. The other
two are marked for the full library. Access policy remains separate from template
content so a future entitlement system can change availability without changing
the compositions.

## Reference locations

- The current private site is the interaction and editorial visual baseline.
- [`PRODUCT_BRIEF.md`](PRODUCT_BRIEF.md) defines the year-round-interest decision,
  authored-layout boundary, and product-packaging direction.
- [`PLANT_LIBRARY_GAUNTLET.md`](PLANT_LIBRARY_GAUNTLET.md) and
  [`SEASONAL_EVIDENCE.md`](SEASONAL_EVIDENCE.md) bind every recommended plant to
  the existing compatibility, scale, seasonal-state, and evidence threshold.

## Inspectable bar

### P0 — Nine complete recommendations

Exactly three recommendations are available for every supported cluster size.
Every record has a stable ID, ordered planting, seasonal rationale, and access
tier, and only references the thirteen modeled plants.

**Probe:** Audit the template records by size, length, ID, and referenced plant.

**Loses when:** a size has fewer or more than three templates, a planting length
does not match its size, or content is hard-coded into the interface.

### P0 — Year-round contribution

Every recommendation has a visible carrier in winter, spring, summer, and fall.

**Probe:** Inspect January, May, August, and October for every recommendation and
trace its stated cadence to the selected plant profiles.

**Loses when:** a composition becomes visually empty, seasonally redundant, or
depends on a global color treatment rather than its selected plants.

### P0 — Composition quality

Real scale, spatial layering, and plant identity survive in all four synchronized
views.

**Probe:** Inspect the thirty-six template/season combinations for clipping,
overcrowding, floating plants, hidden layers, and impossible proportions.

**Loses when:** a recommendation works only from one angle or at one seasonal
checkpoint.

### P0 — Select, then customize

Applying a recommendation replaces the complete composition immediately. A
single-position replacement preserves every other position, marks the result as
customized from its recommendation, and offers a one-action restore.

**Probe:** Apply each recommendation, replace one position, compare the remaining
ordered IDs, restore, and change cluster size.

**Loses when:** editing a slot resets unrelated plants, the recommendation state
becomes ambiguous, or restore returns to an unrelated composition.

### P0 — Honest recommendations

Recommendations remain inside the displayed Chicago / Zone 6a, part-shade scope.
Moisture, drainage, pollination, and timing caveats remain visible and are not
overridden by recommendation language.

**Probe:** Trace every selected profile to its existing conditions, caveat, and
seasonal evidence.

**Loses when:** a template implies universal suitability, guaranteed bloom or
fruit, or hides a material caveat.

### P0 — Monetization-ready content boundary

Template content and access policy are separate. The future preview/full-library
split can change without rewriting the editor, while the present proof remains
fully usable and exposes no dead purchase action.

**Probe:** Inspect the template type, access policy, and current-access setting.

**Loses when:** access is inferred from display names, payment logic is embedded
in the template picker, or validation requires unfinished commerce.

### P1 — Editorial, accessible presentation

Recommendations appear before slot-level editing with a restrained name, seasonal
rationale, plant summary, keyboard focus, touch target, and active/custom state
that does not rely on color alone.

**Probe:** Navigate the editor by pointer, keyboard, and touch-sized viewport on
desktop, tablet, and phone.

**Loses when:** the picker reads as ecommerce bundles, obscures the garden, or
cannot be understood or operated without a pointer.

### P0 — Do not regress

Preserve the protected starter composition, all four simultaneous views,
continuous timeline, plant details, native filter, source disclosure, existing
plant replacement, and meaningful responsive fallback.

**Probe:** Re-run the existing build, timeline, filter, replacement, and
responsive checks after the integrated change.

**Loses when:** any protected behavior or the editorial first frame degrades.

## Out of scope

- Accounts, authentication, billing, checkout, and saved entitlements.
- New plants or generated plant assets.
- Freeform bed drawing, purchasing quantities, or exact spacing plans.
- Hiding sources, horticultural caveats, or regional uncertainty behind access.

## Stop and critic contract

The loop stops when a fresh critic returns `WIN` on every P0, the human stops it,
or further improvement becomes immaterial. The broader five-person comprehension
study remains a separate external validation boundary.

Each judging round receives this brief, the actual artifact, and raw evidence,
without builder reasoning, and returns only:

```text
VERDICT: WIN | LOSE | UNJUDGEABLE
EVIDENCE: direct observations, artifacts, interactions, and measurements
LARGEST GAP: required on LOSE
FIXED WHEN: an observable check proving that gap is closed
```

## Progress

- [x] Goal, recommendations, packaging boundary, and bar confirmed by the user.
- [x] Template records and product-access boundary implemented.
- [x] Select, customize, and restore interaction implemented.
- [x] Integrated evidence captured.
- [x] Fresh critic verdict recorded: **WIN**.
- [ ] Winning result published.

## Final critic verdict

`VERDICT: WIN`

The fresh critic inspected the nine template records, all thirty-six seasonal
captures, the nine four-season contact sheets, tablet and phone editor captures,
and the live selection flow. It independently applied every recommendation,
verified exact ordered plantings, changed size, customized position 02, restored
the original order, operated the timeline by keyboard, and traced the content and
access policy boundary. Every P0 passed with no remaining feature gap.
