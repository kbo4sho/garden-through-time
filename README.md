# Garden Through Time

Garden Through Time is an exploration of a more truthful way to plan a garden: see a planting composition as a living system across an entire year, not as a collection of plants photographed at peak bloom.

The core experience opens directly on a cinematic 3D composition of three compatible flowering shrubs. A continuous date control lets someone scrub from January 1 through December 31 and watch each plant change independently—buds, foliage, flowers, fruit, fall color, leaf drop, and dormant structure.

## Product promise

Within two minutes, a homeowner should understand:

- how the plants layer together in height, form, color, and texture;
- when each plant contributes seasonal interest;
- where the composition becomes visually quiet or weak;
- whether the plants fit the site's light, moisture, and climate conditions.

The composition is the product. The catalog, filters, and plant details support it without taking over the experience.

## Initial frame

- Region: Upper Midwest / Chicago-area conditions.
- Seasonal model: representative-year ranges, not live weather prediction.
- Scope: one exceptional hero composition and a small set of compatible substitutions.
- Devices: cinematic desktop experience, complete tablet support, and a meaningful simplified phone fallback.

## Current status

An interactive proof is now implemented in React and WebGL. It includes:

- a continuous, keyboard-accessible January 1–December 31 timeline;
- independent foliage, flower, fruit, fall-color, and dormant states for three shrubs;
- orbit and zoom controls around a layered 3D planting composition;
- sourced bloom, foliage, size, light, moisture, and hardiness details;
- a functional native-species filter with an explained, compatible substitution;
- an explicit representative-year conditions model;
- desktop, tablet, and simplified phone layouts.

The implementation has reached the Gauntlet's external-validation boundary. The independent critic found the available visual, interaction, data, filter, and runtime evidence inspectable, then returned `UNJUDGEABLE` because the remaining composition-understanding P0 requires a five-person unbriefed homeowner study. It is an experience proof, not a planting prescription or live-weather forecast.

## Run locally

```sh
npm install
npm run dev
```

Create a production build with `npm run build`.

## Project documents

- [`docs/PRODUCT_BRIEF.md`](docs/PRODUCT_BRIEF.md) — experience, audience, data principles, and scope.
- [`docs/GAUNTLET.md`](docs/GAUNTLET.md) — inspectable quality bar and independent critic contract.
- [`docs/EVIDENCE.md`](docs/EVIDENCE.md) — repeatable visual, interaction, and runtime checks.
- [`AGENTS.md`](AGENTS.md) — durable guidance for Codex and other contributors.
- [`src/data/plants.ts`](src/data/plants.ts) — sourced plant records and representative seasonal windows.

## Reference bar

- [Garden Sketchbook](https://www.gardensketchbook.com/) — closest browser-based seasonal garden-planning baseline.
- [Twinmotion foliage materials](https://dev.epicgames.com/documentation/twinmotion/foliage-materials?lang=en-US) — rendering reference for vegetation depth, translucency, and lifecycle behavior.
- [RhinoLands seasonal plant displays](https://rhinolands.com/support/tip/assign-the-seasonal-display-to-plant-species/) — species-specific seasonal representation precedent.
- [Lands Design plant database](https://help.landsdesign.com/tools/plant-database/) — plant morphology, climate, flowering, and mature-size data precedent.
