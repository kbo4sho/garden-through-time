# Garden Through Time

Garden Through Time is an exploration of a more truthful way to plan a garden: see a planting composition as a living system across an entire year, not as a collection of plants photographed at peak bloom.

The core experience opens directly on a cinematic 3D composition of three compatible flowering shrubs. A continuous date control lets someone scrub from January 1 through December 31 and watch each plant change independently—buds, foliage, flowers, fruit, fall color, leaf drop, and dormant structure.

## Product promise

See the whole year before you plant. The sellable artifact is a **shareable living-bed link**: a small authored cluster a landscape designer (first) or specialty nursery (second) can scrub through a year, swap within a tight palette, name, park on a date, and send. The client or shopper receives that named composition; they do not have to operate the editor.

Within two minutes, a recipient of the sent bed should understand:

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
- independent foliage, flower, fruit, fall-color, and dormant states for the sourced shrub palette;
- four synchronized views of one living bed;
- sourced bloom, foliage, size, light, moisture, and hardiness details;
- an editable three-, five-, or seven-plant cluster with species choices at each
  authored position, plus nine named templates;
- a shareable composition URL that recreates cluster size, template, in-slot
  swaps, parked day, and designer or nursery name — no accounts;
- desktop, tablet, and simplified phone layouts. A client opening a parked share
  URL on a phone sees one garden and an unmistakable Play / year scrub; they can
  tap a plant for its record. Designer tools stay tucked. Photographic and glTF
  living-bed views allow a few degrees of drag-to-peek and spring back to the
  authored frame; editorial paper views stay fixed.

The current sellable slice is the designer-pitch living-bed link. Do not treat a
five-person unbriefed homeowner study as the next required build. It is an
experience proof, not a planting prescription or live-weather forecast.

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
