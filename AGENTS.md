# Project guidance

## North Star

Build a browser experience that helps a homeowner judge a planting composition across a full year. The user should feel that they are observing one living garden through time, not browsing a plant catalog or switching among four unrelated seasonal renders.

The composition is always the hero. Interface, filters, labels, and plant data must remain subordinate to it.

## Canonical context

Read these before material product or implementation work:

1. `docs/PRODUCT_BRIEF.md`
2. `docs/GAUNTLET.md`

If implementation choices conflict with those documents, preserve the product goal and surface the conflict explicitly.

## Product principles

- Favor a few deeply modeled, botanically recognizable plants over a large shallow catalog.
- Treat seasonal events as likely regional ranges. Never present weather-sensitive bloom dates as guaranteed precision.
- Each species must change independently through the year.
- Preserve real scale, layering, and the spatial relationship among plants.
- A beautiful scene that cannot support a planting decision is incomplete.
- A horticulturally accurate tool that feels like dated landscape software is also incomplete.
- Keep technology choices open until they can be evaluated against real pixels, behavior, and performance.

## Initial scope boundary

The first proof contains one hero composition and a small compatible substitution set. Do not add accounts, commerce, nursery inventory, AR, a general-purpose yard editor, live weather prediction, plant-age simulation, or a comprehensive plant database unless the product brief is deliberately expanded.

## Working expectations

- Keep work in independently judgeable slices.
- Use concrete, source-backed plant data.
- Record consequential product decisions in project documentation.
- Validate behavior on desktop and tablet and provide a meaningful phone fallback.
- After major implementation waves, inspect the integrated experience rather than grading isolated components.
- The material builder cannot issue the final Gauntlet verdict. Use a fresh critic context and the contract in `docs/GAUNTLET.md`.

