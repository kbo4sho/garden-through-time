# Product brief

## The problem

Most garden-planning products show plants as static objects or at their most marketable moment. Real gardens are compositions in time: one shrub flowers while another is leafing out, a summer mass becomes fall structure, and winter exposes form that peak-bloom photography hides.

This is the **peak-season snapshot problem**: homeowners must make a year-round planting decision from isolated photographs of plants at their best moment.

## Product promise

**Year-Round Interest** makes one living composition visible across an entire year before it is planted.

Canonical tagline: **See the whole year before you plant.**

The sellable artifact is a **shareable living-bed link**: a small authored cluster (3, 5, or 7 plants) that a landscape designer or specialty nursery can scrub through a year, swap within the authored palette, name, park on a date, and send. The recipient opens the parked composition and can move through the year. They do not have to operate the editor.

## Primary audience

The first customer is a landscape designer closing a residential client. They set a 3/5/7 plant cluster, swap a couple of species, scrub to a weak month such as January so the client sees winter structure, then send a link. One person can say yes; the client does not have to operate the tool.

The same product also serves a specialty nursery merchandising a year-round border. The shopper scrubs, leaves with a plant list in a later slice, and buys in the yard. Do not expand this brief into homeowner SaaS, a yard editor, or a catalog.

Design-conscious homeowners remain the people who live with the bed. They are recipients of a sent composition, not the operator the product is built around.

## Desired outcome

A designer or nursery parks the bed on a date, puts a name on it, and sends a URL that recreates the cluster, template, any in-slot swaps, parked day, and byline. Opening that URL should read as a sent composition: the garden is visible, the name is on it, the date is parked. The recipient can scrub the year and understand winter structure without opening the composition editor.

## Core experience

1. Open directly on a composed grouping of compatible shrubs — from a share link, on the parked date, with the sender's name visible.
2. Keep the garden visually dominant and make the date control immediately available.
3. Allow continuous movement from January 1 through December 31.
4. Update each plant according to its own regional phenology: buds, leaf emergence, bloom progression, fruit, fall color, leaf drop, and dormant form.
5. Let the recipient identify plants without permanently covering the composition.
6. Keep substitution and slot editing inside the authored positions, for the designer or nursery who is preparing the link.

## Initial data model

Each plant record should be able to express:

- botanical and common name;
- regional or hardiness applicability;
- mature height, width, habit, and growth behavior;
- light, soil, moisture, and resilience requirements;
- date ranges and confidence for leaf emergence, bloom phases, fruit, fall color, and dormancy;
- seasonal visual-state references and source provenance;
- compatibility signals used by substitution filters.

Seasonal events are ranges, not universal dates. A representative-year visualization must say which region it represents and distinguish sourced facts from visual interpolation.

## Visual direction

Calm, cinematic, tactile, and observant. Natural light, believable atmosphere, grounded plants, varied material response, and enough stillness to study the composition. Avoid generic dashboard styling, game-like reward language, glossy plastic foliage, or ornamental controls that compete with the garden.

Present the composition as an editorial contact sheet rather than a freely orbiting
3D scene. Keep four purposeful views visible together: a garden portrait for the
whole composition, a front elevation for height and overlap, a high-oblique
planting plan for spacing and repetition, and a seasonal detail for the selected
plant. Use one continuous warm-neutral ground and backdrop so the environment
supports comparison without implying a fully modeled yard. Each view must add a
different planting judgment; extra angles that only repeat the hero image do not
earn space.

## Naming and message

- User-facing name: **Year-Round Interest**.
- Tagline: **See the whole year before you plant.**
- Internal project and repository name may remain `garden-through-time`.
- Prefer the language of composition, seasonal contribution, strong periods,
  weak periods, and winter structure over generic time-travel language.
- “Garden Through Time” is historical/internal language, not the primary
  customer-facing promise.

## Working defaults

- Geography: Upper Midwest / Chicago-area conditions.
- Experience model: representative year rather than live forecasting.
- Initial content: one deeply authored composition plus a small substitution set.
- Primary surface: desktop browser, followed by tablet.
- Phone: a useful simplified seasonal view; full 3D parity is not required initially.

## Composition editing proof

The first editable-composition slice stays deliberately bounded to the deeply
modeled, source-backed plant set. A designer or nursery can:

- compare focused, layered, and full cluster sizes of three, five, or seven plants;
- choose the species at each authored planting position, including repeated plants
  that read as a mass;
- keep the seasonal timeline, plant identities, and site compatibility visible as
  the composition changes;
- put a name on the bed, park a date, and copy a URL that recreates the
  composition for a client or shopper.

The recipient of that link should not have to open the composition editor or
operate a 3D viewport to understand the bed. Swapping stays inside the authored
positions already in the proof.

The positions are authored layouts, not a general-purpose bed editor. Editing the
cluster does not imply exact purchasing quantities or spacing guidance; mature
spacing still needs to be checked against the real planting bed. New plant choices
should only be added when their scale, seasonal states, regional evidence, and
compatibility are modeled to the same depth as the starter composition.

### Deliberate plant-library expansion

The August 2026 proof deliberately expands the compatible substitution set from
the three protected starter plants to thirteen source-backed shrub choices. It
does not expand the product into a general catalog: the original composition
remains the default, every added choice has five independent seasonal billboard
states and an explicit design role, and the role-based chooser keeps selection
in service of the authored composition. This is the current evidence threshold
for any later library addition.

### Planting recommendations and product packaging

The next composition slice adds three curated recommendations for each authored
cluster size: three, five, and seven plants. Recommendations are the primary
decision-support product; the plant library supports them rather than becoming
the product by itself. A designer or nursery can apply a recommendation and then
replace individual positions without losing the rest of the composition.

Templates and plants carry a stable access tier separate from future account or
payment technology. The proposed product preview includes one complete template
at every cluster size plus a useful substitution set. A future full-library
entitlement can expose every recommendation and compatible substitution. The
current proof remains fully unlocked until authentication and checkout are
deliberately added; it must not contain dead purchase controls or hide sources,
caveats, or seasonal uncertainty behind access.

## Out of scope for the first proof

- accounts, saved gardens, and login (a magic/share URL is the auth);
- purchasing, checkout, or nursery inventory;
- printable plant lists (a later nursery slice);
- augmented-reality placement;
- drawing or importing a full yard;
- long-term plant growth by age;
- live weather or phenology forecasting;
- a comprehensive plant catalog;
- sun and shadow simulation;
- making the homeowner the person who has to operate the 3D/editor.

## Open product decisions

- Exact starter composition and horticultural reviewers.
- Rendering and seasonal-transition strategy.
- Whether substitutions happen in-scene or in a separate comparison mode.
- The evidence threshold for expanding beyond the initial region.

Do not treat a five-person unbriefed homeowner study as the next required build.
The current sellable slice is the designer-pitch shareable living-bed link.
