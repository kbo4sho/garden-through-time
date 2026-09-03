import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const compile = async (relativePath) => {
  const sourceUrl = new URL(relativePath, import.meta.url);
  const source = await readFile(sourceUrl, "utf8");
  return ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: sourceUrl.pathname,
  }).outputText;
};

const plantsSource = await compile("../src/data/plants.ts");
const shareSource = await compile("../src/lib/shareLink.ts");
const toDataUrl = (code) =>
  `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;

const { compositionTemplates, defaultTemplateId, plants } = await import(
  toDataUrl(plantsSource)
);
const {
  DEFAULT_SHARE_DAY,
  YEAR_RANGE_MIDPOINT,
  parseShareSearch,
  serializeShareSearch,
  SHARE_HISTORY_SYNC_MS,
  shouldCommitTimelineDay,
  shouldWriteShareHistory,
} = await import(toDataUrl(shareSource));

const viewportSource = await compile("../src/lib/viewport.ts");
const { readPhoneLayout, viewsForViewport } = await import(toDataUrl(viewportSource));

const catalog = {
  templates: compositionTemplates,
  plantIds: new Set(plants.map((plant) => plant.id)),
  defaultTemplateId,
};

const errors = [];
const assert = (condition, message) => {
  if (!condition) errors.push(message);
};

const equal = (actual, expected, label) => {
  const actualValue = JSON.stringify(actual);
  const expectedValue = JSON.stringify(expected);
  if (actualValue !== expectedValue) {
    errors.push(`${label}: expected ${expectedValue}, got ${actualValue}`);
  }
};

const previewLink = parseShareSearch(
  "?day=225&template=balanced-year-3",
  catalog,
);
equal(previewLink.day, 225, "Existing preview day");
equal(previewLink.templateId, "balanced-year-3", "Existing preview template");
equal(
  previewLink.planting,
  ["fothergilla", "hydrangea", "dogwood"],
  "Existing preview planting",
);
assert(!previewLink.customized, "Existing preview links are not customized");
assert(!previewLink.from, "Existing preview links have no byline");
equal(
  serializeShareSearch({
    day: previewLink.day,
    templateId: previewLink.templateId,
    planting: previewLink.planting,
    from: previewLink.from,
    templatePlanting: ["fothergilla", "hydrangea", "dogwood"],
  }).toString(),
  "day=225&template=balanced-year-3",
  "Existing preview serialize",
);

const editorialPreview = serializeShareSearch(
  {
    day: 15,
    templateId: "balanced-year-3",
    planting: ["fothergilla", "hydrangea", "dogwood"],
    from: "",
    templatePlanting: ["fothergilla", "hydrangea", "dogwood"],
  },
  { style: "editorial", plant: "hydrangea" },
);
equal(
  editorialPreview.get("style"),
  "editorial",
  "Editorial style is preserved",
);
equal(editorialPreview.get("plant"), "hydrangea", "Evidence plant is preserved");
equal(editorialPreview.get("day"), "15", "Editorial preview day");
assert(!editorialPreview.has("plants"), "Uncustomized editorial links omit plants");

const januaryCustom = {
  day: 15,
  templateId: "layered-seasons-5",
  planting: ["fothergilla", "winterberry", "dogwood", "fothergilla", "boxwood"],
  from: "Maya Chen Landscape",
};
const januarySearch = serializeShareSearch({
  ...januaryCustom,
  templatePlanting: ["fothergilla", "hydrangea", "dogwood", "fothergilla", "boxwood"],
});
assert(januarySearch.get("day") === "15", "January parked day is in the URL");
assert(januarySearch.get("template") === "layered-seasons-5", "Template is in the URL");
assert(
  januarySearch.get("plants") ===
    "fothergilla,winterberry,dogwood,fothergilla,boxwood",
  "In-slot swaps are in the URL",
);
assert(januarySearch.get("from") === "Maya Chen Landscape", "Name is in the URL");
assert(!januarySearch.has("style"), "Share links do not invent a visual style");

const roundTrip = parseShareSearch(`?${januarySearch.toString()}`, catalog);
equal(roundTrip.day, 15, "January round-trip day");
equal(roundTrip.templateId, "layered-seasons-5", "January round-trip template");
equal(roundTrip.planting, januaryCustom.planting, "January round-trip slots");
equal(roundTrip.from, "Maya Chen Landscape", "January round-trip name");
assert(roundTrip.customized, "January round-trip stays customized");
equal(roundTrip.selectedPlantId, "winterberry", "Custom slot remains selectable");

const defaultLoad = parseShareSearch("", catalog);
equal(defaultLoad.day, DEFAULT_SHARE_DAY, "Default day stays midsummer");
equal(defaultLoad.templateId, defaultTemplateId, "Default template is protected");
assert(!defaultLoad.customized, "Default composition is not customized");

const designerPitch = parseShareSearch(
  "?day=15&template=layered-seasons-5&plants=fothergilla,smooth-hydrangea,dogwood,fothergilla,boxwood&from=Test Landscape Studio",
  catalog,
);
equal(designerPitch.day, 15, "Designer January pitch parks day 15");
equal(designerPitch.templateId, "layered-seasons-5", "Designer January pitch keeps the five-plant template");
equal(
  designerPitch.planting,
  ["fothergilla", "smooth-hydrangea", "dogwood", "fothergilla", "boxwood"],
  "Designer January pitch keeps in-slot swaps",
);
equal(designerPitch.from, "Test Landscape Studio", "Designer January pitch keeps the byline");
assert(designerPitch.customized, "Annabelle-for-oakleaf swap stays customized");

equal(YEAR_RANGE_MIDPOINT, 183, "Native range midpoint is 2 July");
assert(
  !shouldCommitTimelineDay(15, YEAR_RANGE_MIDPOINT, false),
  "Layout midpoint from January is not a recipient scrub",
);
assert(
  shouldCommitTimelineDay(15, YEAR_RANGE_MIDPOINT, true),
  "A real pointer scrub may pass through July",
);
assert(shouldCommitTimelineDay(15, 16, false), "Keyboard still steps one day");
assert(
  shouldCommitTimelineDay(15, 20, false),
  "A short unsolicited step is still a legal scrub",
);

assert(
  shouldWriteShareHistory(true) === false,
  "Playback must not write history on every day tick",
);
assert(
  shouldWriteShareHistory(false) === true,
  "Pause and scrub still park the date in the URL",
);
assert(
  SHARE_HISTORY_SYNC_MS >= 310,
  "Share URL sync stays slower than Safari's History API floor",
);
const playTicksInThirtySeconds = Math.floor(30_000 / 42);
assert(
  playTicksInThirtySeconds > 100,
  "Unthrottled play would exceed Safari's 100 replaceState calls per 30s",
);

const fourViews = ["portrait", "front-elevation", "planting-plan", "seasonal-detail"];
equal(viewsForViewport(fourViews, true), ["portrait"], "Phone Play mounts one garden view");
equal(viewsForViewport(fourViews, false), fourViews, "Desktop keeps the four-view sheet");
assert(
  readPhoneLayout(undefined, 390) === true,
  "Unknown media at 390px must not mount four canvases",
);
assert(
  readPhoneLayout(false, 390) === true,
  "A late matchMedia miss at 390px still stays on one canvas",
);
assert(
  readPhoneLayout(false, 1440) === false,
  "Desktop width still gets the four-view sheet",
);

const pagesOrigin = "https://kbo4sho.github.io/garden-through-time/";
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
assert(!html.includes("chatgpt.site"), "Unfurl tags stay off chatgpt.site");
assert(html.includes("<noscript>"), "Crawlers get a noscript living-bed fallback");

const metaContent = (key) => {
  const tag = html.match(
    new RegExp(`<meta\\s[^>]*(?:property|name)="${key}"[^>]*>`, "si"),
  );
  return tag?.[0].match(/content="([^"]+)"/)?.[1] ?? null;
};

equal(metaContent("og:url"), pagesOrigin, "og:url is the Pages origin");
equal(
  metaContent("og:image"),
  `${pagesOrigin}og.jpg`,
  "og:image is a Pages JPEG",
);
equal(
  metaContent("twitter:image"),
  `${pagesOrigin}og.jpg`,
  "twitter:image matches og:image",
);
equal(metaContent("twitter:card"), "summary_large_image", "twitter:card is a large image");

const ogImage = metaContent("og:image");
assert(ogImage?.startsWith(pagesOrigin), "OG image is on the Pages origin");
const ogFileName = ogImage.slice(pagesOrigin.length);
const ogPath = fileURLToPath(new URL(`../public/${ogFileName}`, import.meta.url));
const ogStat = await stat(ogPath);
assert(ogStat.size > 10_000, "OG image is a real card, not an empty file");
assert(ogStat.size < 1_000_000, "OG image stays under 1MB for iMessage and Slack");

const invalidPlants = parseShareSearch(
  "?template=balanced-year-3&plants=not-a-plant,also-fake",
  catalog,
);
equal(
  invalidPlants.planting,
  ["fothergilla", "hydrangea", "dogwood"],
  "Unknown plants fall back to the template",
);

const sanitized = parseShareSearch(
  "?from=%0AGreenleaf%20Nursery%2C%20Inc.%20%20%20",
  catalog,
);
equal(sanitized.from, "Greenleaf Nursery, Inc.", "From names are sanitized");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    "Share link check passed: January pitches round-trip, phone midpoint jumps are ignored, playback does not write history on every tick, phone Play mounts one canvas, and unfurl tags point at a Pages OG card.",
  );
}
