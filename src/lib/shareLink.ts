export const DEFAULT_SHARE_DAY = 172;
export const YEAR_DAY_MIN = 1;
export const YEAR_DAY_MAX = 365;
export const YEAR_RANGE_MIDPOINT = Math.round((YEAR_DAY_MIN + YEAR_DAY_MAX) / 2);
export const MAX_FROM_NAME_LENGTH = 80;
export const CLUSTER_SIZES = [3, 5, 7] as const;

export type ShareTemplate = {
  id: string;
  planting: readonly string[];
};

export type ShareCatalog = {
  templates: readonly ShareTemplate[];
  plantIds: ReadonlySet<string>;
  defaultTemplateId: string;
};

export type ShareSnapshot = {
  day: number;
  templateId: string;
  planting: string[];
  from: string;
  selectedPlantId: string;
  customized: boolean;
};

export type ShareSerializeExtras = {
  style?: string | null;
  plant?: string | null;
};

const isClusterSize = (length: number): length is (typeof CLUSTER_SIZES)[number] =>
  CLUSTER_SIZES.some((size) => size === length);

export const sanitizeFromName = (value: string) =>
  value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_FROM_NAME_LENGTH);

export const clampDayOfYear = (value: number) =>
  Math.min(YEAR_DAY_MAX, Math.max(YEAR_DAY_MIN, Math.round(value)));

// Native range inputs on some phone browsers fire a layout `input` at the
// track midpoint (day 183 / 2 July) before anyone touches the slider. A
// designer-pitched January bed must not accept that as a recipient scrub.
export const shouldCommitTimelineDay = (
  currentDay: number,
  nextDay: number,
  userAdjusting: boolean,
) => {
  if (!Number.isFinite(nextDay)) return false;
  const next = clampDayOfYear(nextDay);
  if (userAdjusting) return true;
  if (next === currentDay) return false;
  if (next === YEAR_RANGE_MIDPOINT && currentDay !== YEAR_RANGE_MIDPOINT) {
    return false;
  }
  return Math.abs(next - currentDay) <= 1;
};

export const plantingMatchesTemplate = (
  planting: readonly string[],
  templatePlanting: readonly string[],
) =>
  planting.length === templatePlanting.length &&
  planting.every((plantId, index) => plantId === templatePlanting[index]);

const paramsFromSearch = (search: string | URLSearchParams) => {
  if (typeof search === "string") {
    return new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  }
  return new URLSearchParams(search);
};

const templateById = (catalog: ShareCatalog, id: string | null) =>
  catalog.templates.find((template) => template.id === id);

const fallbackTemplate = (catalog: ShareCatalog, size?: number): ShareTemplate => {
  const bySize = size
    ? catalog.templates.find((template) => template.planting.length === size)
    : undefined;
  return (
    bySize ??
    templateById(catalog, catalog.defaultTemplateId) ??
    catalog.templates[0]
  );
};

export const parseShareSearch = (
  search: string | URLSearchParams,
  catalog: ShareCatalog,
): ShareSnapshot => {
  const params = paramsFromSearch(search);
  const requestedTemplate = templateById(catalog, params.get("template"));
  let template = requestedTemplate ?? fallbackTemplate(catalog);

  const requestedDay = params.get("day")?.trim() ? Number(params.get("day")) : Number.NaN;
  const day = Number.isFinite(requestedDay)
    ? clampDayOfYear(requestedDay)
    : DEFAULT_SHARE_DAY;

  const requestedPlants = (params.get("plants") ?? "")
    .split(",")
    .map((plantId) => plantId.trim())
    .filter((plantId) => catalog.plantIds.has(plantId));

  let planting = [...template.planting];
  if (isClusterSize(requestedPlants.length)) {
    planting = requestedPlants;
    if (template.planting.length !== planting.length) {
      template =
        requestedTemplate?.planting.length === planting.length
          ? requestedTemplate
          : fallbackTemplate(catalog, planting.length);
    }
  }

  const customized = !plantingMatchesTemplate(planting, template.planting);
  const requestedPlant = params.get("plant");
  const selectedPlantId =
    requestedPlant && planting.includes(requestedPlant)
      ? requestedPlant
      : planting[1] ?? planting[0];

  return {
    day,
    templateId: template.id,
    planting,
    from: sanitizeFromName(params.get("from") ?? ""),
    selectedPlantId,
    customized,
  };
};

export const serializeShareSearch = (
  snapshot: Pick<ShareSnapshot, "day" | "templateId" | "planting" | "from"> & {
    templatePlanting?: readonly string[];
    customized?: boolean;
  },
  extras: ShareSerializeExtras = {},
) => {
  const params = new URLSearchParams();
  if (extras.style === "editorial") params.set("style", "editorial");
  params.set("day", String(clampDayOfYear(snapshot.day)));
  params.set("template", snapshot.templateId);

  const customized =
    snapshot.customized ??
    (snapshot.templatePlanting
      ? !plantingMatchesTemplate(snapshot.planting, snapshot.templatePlanting)
      : snapshot.planting.length > 0);

  if (customized && snapshot.planting.length) {
    params.set("plants", snapshot.planting.join(","));
  }

  const from = sanitizeFromName(snapshot.from);
  if (from) params.set("from", from);

  if (extras.plant && snapshot.planting.includes(extras.plant)) {
    params.set("plant", extras.plant);
  }

  return params;
};

export const composeShareHref = (
  location: Pick<Location, "origin" | "pathname" | "hash">,
  search: URLSearchParams | string,
) => {
  const query = typeof search === "string" ? search : search.toString();
  return `${location.origin}${location.pathname}${query ? `?${query}` : ""}${location.hash}`;
};
