export type PlantId =
  | "fothergilla"
  | "hydrangea"
  | "dogwood"
  | "smooth-hydrangea"
  | "panicle-hydrangea"
  | "sweetspire"
  | "summersweet"
  | "viburnum"
  | "serviceberry"
  | "ninebark"
  | "boxwood"
  | "buttonbush"
  | "winterberry";

export type PlantGroup = "spring" | "summer" | "foliage" | "winter";
export type ClusterSize = 3 | 5 | 7;
export type PhotoStage = "winter" | "leafout" | "bloom" | "summer" | "fall";
export type TimingConfidence = "high" | "medium" | "low";
export type LibraryAccess = "preview" | "full-library";

export type CompositionTemplate = {
  id: string;
  name: string;
  size: ClusterSize;
  summary: string;
  seasonalCarry: {
    winter: string;
    spring: string;
    summer: string;
    fall: string;
  };
  planting: PlantId[];
  accessTier: LibraryAccess;
};

export const plantGroups: { id: PlantGroup; label: string }[] = [
  { id: "spring", label: "Spring bloom" },
  { id: "summer", label: "Summer bloom" },
  { id: "foliage", label: "Foliage & fruit" },
  { id: "winter", label: "Winter structure" },
];

export type PlantInstance = {
  instanceId: string;
  profile: PlantProfile;
  position: [number, number, number];
  scale: number;
};

export type PlantProfile = {
  id: PlantId;
  accessTier: LibraryAccess;
  commonName: string;
  botanicalName: string;
  cultivar: string;
  shortName: string;
  role: string;
  group: PlantGroup;
  matureSize: string;
  light: string;
  moisture: string;
  zones: string;
  bloomRange: string;
  foliageBehavior: string;
  sourceUrl: string;
  sourceLabel: string;
  caveat?: string;
  accent: string;
  position: [number, number, number];
  scale: number;
  photoHeight: number;
  habit: "mound" | "broad" | "upright";
  branchColor: string;
  evergreen?: boolean;
  winterDisplay: {
    label: string;
    kind: "structure" | "persistent-bloom" | "persistent-fruit" | "persistent-seed" | "evergreen";
    windows: [number, number][];
    confidence: TimingConfidence;
    provenance: "sourced-trait" | "visual-interpolation";
    basis: string;
  };
  assets: Record<PhotoStage, string>;
  seasonalNotes: {
    winter: string;
    spring: string;
    summer: string;
    fall: string;
  };
  leaf: {
    emerge: [number, number];
    drop: [number, number];
    summer: string;
    fall: string;
    fallWindow: [number, number];
    size: number;
    count: number;
  };
  bloom: {
    window: [number, number];
    color: string;
    fadedColor: string;
    count: number;
    form: "brush" | "panicle" | "corymb";
  };
  fruit?: {
    window: [number, number];
    color: string;
    count: number;
  };
};

export type SeasonalEvidenceEvent = {
  event: string;
  windows: [number, number][];
  confidence: TimingConfidence;
  provenance: "sourced-trait" | "visual-interpolation";
  basis: string;
};

/**
 * Auditable view of the exact windows consumed by the renderer.
 *
 * The linked primary plant record supports the trait and broad seasonal order.
 * Except for the evergreen canopy, exact day-of-year bounds are explicitly
 * editorial interpolation for the representative Chicago / Zone 6a year—not
 * observed local phenology or a forecast.
 */
export const seasonalEvidenceFor = (profile: PlantProfile): SeasonalEvidenceEvent[] => {
  const events: SeasonalEvidenceEvent[] = profile.evergreen
    ? [
        {
          event: "Evergreen canopy",
          windows: [[1, 365]],
          confidence: "high",
          provenance: "sourced-trait",
          basis: `${profile.sourceLabel} supports evergreen foliage; the renderer therefore retains the canopy year-round.`,
        },
      ]
    : [
        {
          event: "Leaf emergence",
          windows: [profile.leaf.emerge],
          confidence: "low",
          provenance: "visual-interpolation",
          basis: `${profile.sourceLabel} supports deciduous habit; the exact Chicago day bounds are an editorial visual estimate.`,
        },
      ];

  events.push({
    event: "Bloom",
    windows: [profile.bloom.window],
    confidence: "low",
    provenance: "visual-interpolation",
    basis: `${profile.sourceLabel} supports the broad bloom season, color, and form; the exact Chicago day bounds are an editorial visual estimate.`,
  });

  if (profile.fruit) {
    events.push({
      event: "Fruit / seed display",
      windows: [profile.fruit.window],
      confidence: "low",
      provenance: "visual-interpolation",
      basis: `${profile.sourceLabel} supports the fruit or seed trait; the exact onset and persistence are editorial visual estimates.${profile.caveat ? ` ${profile.caveat}` : ""}`,
    });
  }

  events.push({
    event: profile.evergreen ? "Winter bronzing" : "Fall color",
    windows: [profile.leaf.fallWindow],
    confidence: "low",
    provenance: "visual-interpolation",
    basis: `${profile.sourceLabel} supports the foliage tendency; the exact Chicago day bounds are an editorial visual estimate.`,
  });

  if (!profile.evergreen) {
    events.push({
      event: "Leaf drop",
      windows: [profile.leaf.drop],
      confidence: "low",
      provenance: "visual-interpolation",
      basis: `${profile.sourceLabel} supports deciduous habit; the exact Chicago day bounds are an editorial visual estimate.`,
    });
  }

  if (profile.winterDisplay.kind !== "evergreen") {
    events.push({
      event: profile.winterDisplay.label,
      windows: profile.winterDisplay.windows,
      confidence: profile.winterDisplay.confidence,
      provenance: profile.winterDisplay.provenance,
      basis: profile.winterDisplay.basis,
    });
  }

  return events;
};

const generatedAssets = (id: PlantId): Record<PhotoStage, string> => ({
  winter: `/textures/generated/${id}-winter.webp`,
  leafout: `/textures/generated/${id}-leafout.webp`,
  bloom: `/textures/generated/${id}-bloom.webp`,
  summer: `/textures/generated/${id}-summer.webp`,
  fall: `/textures/generated/${id}-fall.webp`,
});

export const plants: PlantProfile[] = [
  {
    id: "fothergilla",
    accessTier: "preview",
    commonName: "Mount Airy fothergilla",
    botanicalName: "Fothergilla × intermedia",
    cultivar: "‘Mount Airy’",
    shortName: "Fothergilla",
    role: "Spring spark",
    group: "spring",
    matureSize: "4–5 ft H × 4–5 ft W",
    light: "Sun / part shade",
    moisture: "Moist, well-drained",
    zones: "USDA 5–8",
    bloomRange: "April–May · representative range",
    foliageBehavior: "Blue-green summer foliage; orange, red, and gold in fall; deciduous",
    sourceUrl:
      "https://plants.ces.ncsu.edu/plants/fothergilla-mount-airy/common-name/mt-airy-fothergilla/",
    sourceLabel: "NC State Extension",
    accent: "#e9d9a7",
    position: [-1.88, 0, 0.5],
    scale: 0.9,
    photoHeight: 2.55,
    habit: "mound",
    branchColor: "#5c4030",
    winterDisplay: {
      label: "Dormant branching framework",
      kind: "structure",
      windows: [[1, 114], [310, 365]],
      confidence: "low",
      provenance: "visual-interpolation",
      basis: "NC State Extension supports the deciduous branching habit; exact crossfade boundaries are representative visual estimates.",
    },
    assets: {
      winter: "/textures/fothergilla-winter.webp",
      leafout: "/textures/fothergilla-summer.webp",
      bloom: "/textures/fothergilla-spring.webp",
      summer: "/textures/fothergilla-summer.webp",
      fall: "/textures/fothergilla-fall-v2.webp",
    },
    seasonalNotes: {
      winter: "Fothergilla recedes to a compact branching framework.",
      spring: "Fothergilla flowers before its canopy fills in.",
      summer: "Fothergilla settles into a rounded blue-green mass.",
      fall: "Fothergilla turns gold, orange, and red.",
    },
    leaf: {
      emerge: [126, 151],
      drop: [292, 323],
      summer: "#4d6f3e",
      fall: "#d85b28",
      fallWindow: [270, 310],
      size: 0.17,
      count: 310,
    },
    bloom: {
      window: [111, 145],
      color: "#fff9df",
      fadedColor: "#d7cfb2",
      count: 165,
      form: "brush",
    },
  },
  {
    id: "hydrangea",
    accessTier: "preview",
    commonName: "Ruby Slippers oakleaf hydrangea",
    botanicalName: "Hydrangea quercifolia",
    cultivar: "‘Ruby Slippers’",
    shortName: "Oakleaf hydrangea",
    role: "Summer anchor",
    group: "summer",
    matureSize: "3–4 ft H × 4–5 ft W",
    light: "Morning sun / part shade",
    moisture: "Even, well-drained",
    zones: "USDA 5–9",
    bloomRange: "June–August · heads persist into winter",
    foliageBehavior: "Oak-shaped green leaves; dark mahogany-red fall color; deciduous",
    sourceUrl:
      "https://plants.ces.ncsu.edu/plants/hydrangea-quercifolia/",
    sourceLabel: "NC State Extension",
    accent: "#d9a6a5",
    position: [0.1, 0.03, 0.22],
    scale: 1.08,
    photoHeight: 2.72,
    habit: "broad",
    branchColor: "#6d4d39",
    winterDisplay: {
      label: "Aged flower heads",
      kind: "persistent-bloom",
      windows: [[1, 92], [315, 365]],
      confidence: "low",
      provenance: "visual-interpolation",
      basis: "NC State Extension supports persistent flower heads; exact cross-year display and crossfade boundaries are representative visual estimates.",
    },
    assets: {
      winter: "/textures/hydrangea-winter.webp",
      leafout: "/textures/hydrangea-spring.webp",
      bloom: "/textures/hydrangea-summer.webp",
      summer: "/textures/hydrangea-summer.webp",
      fall: "/textures/hydrangea-fall-v2.webp",
    },
    seasonalNotes: {
      winter: "Persistent oakleaf hydrangea heads catch the low light.",
      spring: "Oakleaf hydrangea builds a broad green foundation.",
      summer: "Oakleaf hydrangea brings the main summer bloom.",
      fall: "Oakleaf hydrangea deepens toward mahogany.",
    },
    leaf: {
      emerge: [104, 137],
      drop: [300, 332],
      summer: "#426442",
      fall: "#853f3b",
      fallWindow: [270, 315],
      size: 0.25,
      count: 350,
    },
    bloom: {
      window: [158, 242],
      color: "#f5efe2",
      fadedColor: "#b97874",
      count: 170,
      form: "panicle",
    },
  },
  {
    id: "dogwood",
    accessTier: "preview",
    commonName: "Arctic Fire redtwig dogwood",
    botanicalName: "Cornus sericea",
    cultivar: "Arctic Fire® ‘Farrow’",
    shortName: "Redtwig dogwood",
    role: "Winter structure",
    group: "winter",
    matureSize: "3–5 ft H × 5–8 ft W",
    light: "Sun / part shade",
    moisture: "Average to wet",
    zones: "USDA 3–7",
    bloomRange: "May–June · representative range",
    foliageBehavior: "Green summer foliage; orange-red to muted purple in fall; leafless red winter stems",
    sourceUrl:
      "https://plants.ces.ncsu.edu/plants/cornus-sericea/common-name/redtwig-dogwood/",
    sourceLabel: "NC State Extension",
    accent: "#bd493e",
    position: [1.72, 0, -0.62],
    scale: 0.92,
    photoHeight: 3.05,
    habit: "upright",
    branchColor: "#a63831",
    winterDisplay: {
      label: "Red winter stems",
      kind: "structure",
      windows: [[1, 86], [292, 365]],
      confidence: "medium",
      provenance: "sourced-trait",
      basis: "NC State Extension supports conspicuous red winter stems; the exact crossfade boundaries remain representative visual estimates.",
    },
    assets: {
      winter: "/textures/dogwood-winter.webp",
      leafout: "/textures/dogwood-leafout.webp",
      bloom: "/textures/dogwood-spring.webp",
      summer: "/textures/dogwood-summer.webp",
      fall: "/textures/dogwood-late-fall.webp",
    },
    seasonalNotes: {
      winter: "Red dogwood stems carry the composition through winter.",
      spring: "Dogwood leafs out behind its small late-spring flowers.",
      summer: "Dogwood adds an upright, finer-leaved layer.",
      fall: "Dogwood thins early to reveal the red stems beneath.",
    },
    leaf: {
      emerge: [98, 132],
      drop: [282, 316],
      summer: "#456b43",
      fall: "#873d4d",
      fallWindow: [252, 292],
      size: 0.16,
      count: 330,
    },
    bloom: {
      window: [136, 170],
      color: "#eee8d0",
      fadedColor: "#cfc8ae",
      count: 92,
      form: "corymb",
    },
    fruit: {
      window: [205, 270],
      color: "#d8ddd1",
      count: 66,
    },
  },
  {
    id: "smooth-hydrangea",
    accessTier: "full-library",
    commonName: "‘Annabelle’ smooth hydrangea",
    botanicalName: "Hydrangea arborescens",
    cultivar: "‘Annabelle’",
    shortName: "Annabelle hydrangea",
    role: "Cloudlike summer anchor",
    group: "summer",
    matureSize: "3–5 ft H × 4–6 ft W",
    light: "Morning sun / part shade",
    moisture: "Moist, well-drained",
    zones: "USDA 3–9",
    bloomRange: "June–September · representative range",
    foliageBehavior: "Broad green leaves; modest yellow fall color; deciduous",
    sourceUrl:
      "https://plants.ces.ncsu.edu/plants/hydrangea-arborescens/common-name/smooth-hydrangea/",
    sourceLabel: "NC State Extension",
    accent: "#f1ead7",
    position: [0, 0, 0],
    scale: 1.02,
    photoHeight: 2.72,
    habit: "broad",
    branchColor: "#6f533d",
    winterDisplay: {
      label: "Persistent flower heads",
      kind: "persistent-bloom",
      windows: [[1, 93], [312, 365]],
      confidence: "low",
      provenance: "visual-interpolation",
      basis: "NC State Extension supports persistent dry heads; exact cross-year display and crossfade boundaries are representative visual estimates.",
    },
    assets: generatedAssets("smooth-hydrangea"),
    seasonalNotes: {
      winter: "Annabelle leaves a fine twiggy mound with papery old heads.",
      spring: "Annabelle opens into a fresh, broad-leaved green mass.",
      summer: "Large white mopheads make Annabelle the brightest summer volume.",
      fall: "Annabelle fades through pale green, yellow, and parchment.",
    },
    leaf: {
      emerge: [105, 132],
      drop: [298, 330],
      summer: "#3f6840",
      fall: "#b89a47",
      fallWindow: [272, 312],
      size: 0.21,
      count: 340,
    },
    bloom: {
      window: [166, 252],
      color: "#f6f2e5",
      fadedColor: "#a8b47c",
      count: 150,
      form: "corymb",
    },
  },
  {
    id: "panicle-hydrangea",
    accessTier: "full-library",
    commonName: "‘Little Lime’ panicle hydrangea",
    botanicalName: "Hydrangea paniculata",
    cultivar: "‘Jane’ Little Lime®",
    shortName: "Little Lime hydrangea",
    role: "Late-summer anchor",
    group: "summer",
    matureSize: "3–5 ft H × 3–5 ft W",
    light: "Sun / part shade",
    moisture: "Moist, well-drained",
    zones: "USDA 3–8",
    bloomRange: "July–September · heads age pink",
    foliageBehavior: "Green oval leaves; yellow fall color; deciduous",
    sourceUrl: "https://plants.ces.ncsu.edu/plants/hydrangea-paniculata/",
    sourceLabel: "NC State Extension",
    accent: "#dfe4b8",
    position: [0, 0, 0],
    scale: 1.02,
    photoHeight: 2.8,
    habit: "upright",
    branchColor: "#674b38",
    winterDisplay: {
      label: "Aged flower heads",
      kind: "persistent-bloom",
      windows: [[1, 96], [315, 365]],
      confidence: "low",
      provenance: "visual-interpolation",
      basis: "NC State Extension supports persistent panicles; exact cross-year display and crossfade boundaries are representative visual estimates.",
    },
    assets: generatedAssets("panicle-hydrangea"),
    seasonalNotes: {
      winter: "Little Lime keeps dry conical heads above a fine woody frame.",
      spring: "Little Lime rebuilds an upright green canopy.",
      summer: "Lime-white panicles carry the composition into late summer.",
      fall: "The panicles blush pink as the foliage turns yellow-bronze.",
    },
    leaf: {
      emerge: [108, 136],
      drop: [302, 334],
      summer: "#416b40",
      fall: "#b19045",
      fallWindow: [276, 315],
      size: 0.17,
      count: 330,
    },
    bloom: {
      window: [192, 274],
      color: "#edf0c9",
      fadedColor: "#c1817f",
      count: 155,
      form: "panicle",
    },
  },
  {
    id: "sweetspire",
    accessTier: "preview",
    commonName: "‘Henry’s Garnet’ Virginia sweetspire",
    botanicalName: "Itea virginica",
    cultivar: "‘Henry’s Garnet’",
    shortName: "Virginia sweetspire",
    role: "Early-summer drift",
    group: "foliage",
    matureSize: "3–5 ft H × 4–6 ft W",
    light: "Sun / part shade",
    moisture: "Moist to occasionally wet",
    zones: "USDA 5–9",
    bloomRange: "May–June · representative range",
    foliageBehavior: "Green summer foliage; long-lasting garnet, orange, and copper fall color",
    sourceUrl:
      "https://plants.ces.ncsu.edu/plants/itea-virginica-henrys-garnet/common-name/sweetspire/",
    sourceLabel: "NC State Extension",
    caveat: "Can spread by root suckers; allow room for an informal drift.",
    accent: "#bd534f",
    position: [0, 0, 0],
    scale: 0.94,
    photoHeight: 2.65,
    habit: "broad",
    branchColor: "#704334",
    winterDisplay: {
      label: "Persistent seed racemes",
      kind: "persistent-seed",
      windows: [[1, 94], [315, 365]],
      confidence: "low",
      provenance: "visual-interpolation",
      basis: "NC State Extension supports dry fruiting racemes; exact cross-year display and crossfade boundaries are representative visual estimates.",
    },
    assets: generatedAssets("sweetspire"),
    seasonalNotes: {
      winter: "Sweetspire holds a low arching scaffold and narrow seed racemes.",
      spring: "Fresh leaves gather along the arching stems.",
      summer: "Drooping white racemes make a soft early-summer drift.",
      fall: "Sweetspire becomes a long-lasting garnet and copper mass.",
    },
    leaf: {
      emerge: [106, 136],
      drop: [300, 333],
      summer: "#3f6a43",
      fall: "#8f2f37",
      fallWindow: [266, 315],
      size: 0.15,
      count: 360,
    },
    bloom: {
      window: [146, 194],
      color: "#f4f0dd",
      fadedColor: "#b7a78a",
      count: 140,
      form: "brush",
    },
    fruit: {
      window: [205, 305],
      color: "#76523e",
      count: 45,
    },
  },
  {
    id: "summersweet",
    accessTier: "full-library",
    commonName: "‘Ruby Spice’ summersweet",
    botanicalName: "Clethra alnifolia",
    cultivar: "‘Ruby Spice’",
    shortName: "Ruby Spice summersweet",
    role: "Fragrant summer bloom",
    group: "summer",
    matureSize: "4–6 ft H × 3–5 ft W",
    light: "Sun / part shade",
    moisture: "Moist to wet",
    zones: "USDA 3–9",
    bloomRange: "July–August · fragrant pink spikes",
    foliageBehavior: "Glossy green foliage; golden-yellow fall color; deciduous",
    sourceUrl: "https://plants.ces.ncsu.edu/plants/clethra-alnifolia/",
    sourceLabel: "NC State Extension",
    caveat: "Flowers best with steady moisture; avoid a dry root zone.",
    accent: "#cb7294",
    position: [0, 0, 0],
    scale: 0.94,
    photoHeight: 2.85,
    habit: "upright",
    branchColor: "#6a4838",
    winterDisplay: {
      label: "Persistent seed spikes",
      kind: "persistent-seed",
      windows: [[1, 104], [310, 365]],
      confidence: "low",
      provenance: "visual-interpolation",
      basis: "NC State Extension supports persistent seed capsules; exact cross-year display and crossfade boundaries are representative visual estimates.",
    },
    assets: generatedAssets("summersweet"),
    seasonalNotes: {
      winter: "Summersweet leaves upright stems and dark seed spikes.",
      spring: "Glossy leaves return later than the early-spring shrubs.",
      summer: "Deep pink bottlebrush spikes carry fragrance through midsummer.",
      fall: "Summersweet closes the season in clear golden yellow.",
    },
    leaf: {
      emerge: [116, 145],
      drop: [296, 327],
      summer: "#35643c",
      fall: "#d1a326",
      fallWindow: [270, 310],
      size: 0.15,
      count: 350,
    },
    bloom: {
      window: [190, 246],
      color: "#d57d9e",
      fadedColor: "#9b735f",
      count: 150,
      form: "brush",
    },
    fruit: {
      window: [235, 330],
      color: "#604536",
      count: 45,
    },
  },
  {
    id: "viburnum",
    accessTier: "full-library",
    commonName: "All That Glitters arrowwood viburnum",
    botanicalName: "Viburnum dentatum var. deamii",
    cultivar: "All That Glitters® ‘SMVDBL’",
    shortName: "Arrowwood viburnum",
    role: "Fruit and foliage layer",
    group: "foliage",
    matureSize: "4–6 ft H × 4–6 ft W",
    light: "Sun / part shade",
    moisture: "Moist, well-drained",
    zones: "USDA 4–8",
    bloomRange: "May–June · blue fruit follows with a pollinator",
    foliageBehavior: "Glossy green leaves; burgundy-red fall color; deciduous",
    sourceUrl:
      "https://plants.ces.ncsu.edu/plants/viburnum-dentatum-var-deamii-all-that-glitters-smv/common-name/viburnum/",
    sourceLabel: "NC State Extension",
    caveat: "Blue fruit requires a compatible arrowwood viburnum pollinator such as All That Glows®.",
    accent: "#51637e",
    position: [0, 0, 0],
    scale: 0.98,
    photoHeight: 2.9,
    habit: "upright",
    branchColor: "#625044",
    winterDisplay: {
      label: "Dormant upright framework",
      kind: "structure",
      windows: [[1, 90], [298, 365]],
      confidence: "low",
      provenance: "visual-interpolation",
      basis: "NC State Extension supports the deciduous upright habit; exact crossfade boundaries are representative visual estimates.",
    },
    assets: generatedAssets("viburnum"),
    seasonalNotes: {
      winter: "Arrowwood reveals a strong upright gray-brown framework.",
      spring: "Flat white flower clusters sit above glossy new foliage.",
      summer: "With a pollinator nearby, blue-black fruit follows the bloom.",
      fall: "Glossy leaves deepen into burgundy, wine, and red.",
    },
    leaf: {
      emerge: [102, 132],
      drop: [286, 319],
      summer: "#315f3d",
      fall: "#843747",
      fallWindow: [252, 298],
      size: 0.16,
      count: 360,
    },
    bloom: {
      window: [135, 169],
      color: "#f1ecdc",
      fadedColor: "#beb8a4",
      count: 105,
      form: "corymb",
    },
    fruit: {
      window: [200, 285],
      color: "#263e68",
      count: 95,
    },
  },
  {
    id: "serviceberry",
    accessTier: "preview",
    commonName: "‘Regent’ Saskatoon serviceberry",
    botanicalName: "Amelanchier alnifolia",
    cultivar: "‘Regent’",
    shortName: "Regent serviceberry",
    role: "Spring structure",
    group: "spring",
    matureSize: "4–6 ft H × 4–6 ft W",
    light: "Sun / part shade",
    moisture: "Average, well-drained",
    zones: "USDA 2–7",
    bloomRange: "April–May · fruit ripens in early summer",
    foliageBehavior: "Green summer leaves; yellow to red fall color; deciduous",
    sourceUrl:
      "https://mortonarb.org/plant-and-protect/trees-and-plants/saskatoon-serviceberry/",
    sourceLabel: "The Morton Arboretum",
    caveat: "Prefers drainage and should not sit in the wettest part of the border.",
    accent: "#a8b8cf",
    position: [0, 0, 0],
    scale: 0.98,
    photoHeight: 3.05,
    habit: "upright",
    branchColor: "#74716c",
    winterDisplay: {
      label: "Dormant fine-branched structure",
      kind: "structure",
      windows: [[1, 84], [286, 365]],
      confidence: "low",
      provenance: "visual-interpolation",
      basis: "The Morton Arboretum supports the deciduous multi-stemmed habit; exact crossfade boundaries are representative visual estimates.",
    },
    assets: generatedAssets("serviceberry"),
    seasonalNotes: {
      winter: "Serviceberry keeps a fine silver-gray upright silhouette.",
      spring: "White flowers arrive on the open branch framework before full leaf-out.",
      summer: "Blue-purple edible fruit punctuates the airy green canopy.",
      fall: "Serviceberry turns luminous yellow, orange, and red.",
    },
    leaf: {
      emerge: [96, 121],
      drop: [276, 306],
      summer: "#4f6f43",
      fall: "#d36b2d",
      fallWindow: [244, 286],
      size: 0.14,
      count: 300,
    },
    bloom: {
      window: [101, 132],
      color: "#faf7e9",
      fadedColor: "#c8c0aa",
      count: 92,
      form: "corymb",
    },
    fruit: {
      window: [160, 207],
      color: "#394774",
      count: 76,
    },
  },
  {
    id: "ninebark",
    accessTier: "preview",
    commonName: "Lemon Candy ninebark",
    botanicalName: "Physocarpus opulifolius",
    cultivar: "Lemon Candy® ‘Podaras 3’",
    shortName: "Lemon Candy ninebark",
    role: "Gold foliage contrast",
    group: "foliage",
    matureSize: "3–4 ft H × 3–4 ft W",
    light: "Sun / part shade",
    moisture: "Average, well-drained",
    zones: "USDA 3–7",
    bloomRange: "May–June · red seed capsules follow",
    foliageBehavior: "Lemon-yellow to chartreuse lobed foliage; deciduous; peeling bark",
    sourceUrl:
      "https://plants.ces.ncsu.edu/plants/physocarpus-opulifolius-lemon-candy-podaras-3/common-name/lemon-candy/",
    sourceLabel: "NC State Extension",
    accent: "#c8d94b",
    position: [0, 0, 0],
    scale: 0.82,
    photoHeight: 2.48,
    habit: "mound",
    branchColor: "#713f34",
    winterDisplay: {
      label: "Peeling winter stems",
      kind: "structure",
      windows: [[1, 82], [300, 365]],
      confidence: "medium",
      provenance: "sourced-trait",
      basis: "NC State Extension supports exfoliating bark and deciduous habit; exact crossfade boundaries remain representative visual estimates.",
    },
    assets: generatedAssets("ninebark"),
    seasonalNotes: {
      winter: "Peeling reddish stems give ninebark a dry graphic structure.",
      spring: "Lemon-yellow leaves arrive before rounded pink-white flower clusters.",
      summer: "Gold-green foliage and red seed capsules keep a bright foreground note.",
      fall: "The yellow canopy warms toward bronze and orange.",
    },
    leaf: {
      emerge: [94, 120],
      drop: [286, 319],
      summer: "#b8cb42",
      fall: "#d67c2f",
      fallWindow: [258, 300],
      size: 0.16,
      count: 330,
    },
    bloom: {
      window: [132, 169],
      color: "#f3dfdb",
      fadedColor: "#c89d94",
      count: 110,
      form: "corymb",
    },
    fruit: {
      window: [168, 245],
      color: "#a54a43",
      count: 70,
    },
  },
  {
    id: "boxwood",
    accessTier: "preview",
    commonName: "‘Green Velvet’ boxwood",
    botanicalName: "Buxus",
    cultivar: "‘Green Velvet’",
    shortName: "Green Velvet boxwood",
    role: "Evergreen framework",
    group: "winter",
    matureSize: "2–3 ft H × 2–3 ft W",
    light: "Morning sun / part shade",
    moisture: "Even, well-drained",
    zones: "USDA 5–8",
    bloomRange: "April–May · flowers are inconspicuous",
    foliageBehavior: "Small deep-green evergreen leaves; may bronze lightly in winter",
    sourceUrl:
      "https://mortonarb.org/plant-and-protect/trees-and-plants/boxwood-hybrids/",
    sourceLabel: "The Morton Arboretum",
    caveat: "Avoid saturated soil and exposed winter wind; monitor locally for boxwood blight.",
    accent: "#6f875a",
    position: [0, 0, 0],
    scale: 0.72,
    photoHeight: 2.32,
    habit: "mound",
    branchColor: "#5c4937",
    evergreen: true,
    winterDisplay: {
      label: "Evergreen structure",
      kind: "evergreen",
      windows: [[1, 365]],
      confidence: "high",
      provenance: "sourced-trait",
      basis: "The Morton Arboretum supports the year-round evergreen canopy.",
    },
    assets: generatedAssets("boxwood"),
    seasonalNotes: {
      winter: "Boxwood keeps a quiet deep-green framework through winter.",
      spring: "Bright new tips soften the evergreen globe.",
      summer: "Dense small leaves provide a calm, clipped-looking mass.",
      fall: "Boxwood remains green while deciduous neighbors change around it.",
    },
    leaf: {
      emerge: [1, 1],
      drop: [366, 367],
      summer: "#294d32",
      fall: "#53633d",
      fallWindow: [302, 340],
      size: 0.11,
      count: 390,
    },
    bloom: {
      window: [111, 142],
      color: "#d9d4a7",
      fadedColor: "#a6a277",
      count: 55,
      form: "corymb",
    },
  },
  {
    id: "buttonbush",
    accessTier: "full-library",
    commonName: "Sugar Shack buttonbush",
    botanicalName: "Cephalanthus occidentalis",
    cultivar: "Sugar Shack® ‘SMCOSS’",
    shortName: "Sugar Shack buttonbush",
    role: "Wet-site summer bloom",
    group: "summer",
    matureSize: "3–4 ft H × 3–4 ft W",
    light: "Sun / part shade",
    moisture: "Moist to wet",
    zones: "USDA 4–10",
    bloomRange: "July–August · round fruit persists",
    foliageBehavior: "Glossy green leaves; yellow fall color; persistent spherical seed heads",
    sourceUrl:
      "https://mortonarb.org/plant-and-protect/trees-and-plants/buttonbush/",
    sourceLabel: "The Morton Arboretum",
    caveat: "Best reserved for the consistently moist or wetter edge of the planting.",
    accent: "#ece7cc",
    position: [0, 0, 0],
    scale: 0.86,
    photoHeight: 2.6,
    habit: "upright",
    branchColor: "#684a3a",
    winterDisplay: {
      label: "Persistent seed heads",
      kind: "persistent-seed",
      windows: [[1, 100], [315, 365]],
      confidence: "low",
      provenance: "visual-interpolation",
      basis: "The Morton Arboretum supports persistent rounded fruits; exact cross-year display and crossfade boundaries are representative visual estimates.",
    },
    assets: generatedAssets("buttonbush"),
    seasonalNotes: {
      winter: "Round brown seed heads persist above buttonbush’s bare stems.",
      spring: "Glossy leaves return late on the compact upright frame.",
      summer: "White spherical pincushion flowers create a distinct midsummer rhythm.",
      fall: "Red-brown fruiting heads remain as the leaves turn gold.",
    },
    leaf: {
      emerge: [112, 142],
      drop: [300, 331],
      summer: "#35653e",
      fall: "#cf9d2f",
      fallWindow: [274, 315],
      size: 0.17,
      count: 320,
    },
    bloom: {
      window: [188, 236],
      color: "#f2edda",
      fadedColor: "#9f6a57",
      count: 95,
      form: "corymb",
    },
    fruit: {
      window: [225, 335],
      color: "#9a4f45",
      count: 78,
    },
  },
  {
    id: "winterberry",
    accessTier: "full-library",
    commonName: "‘Red Sprite’ winterberry",
    botanicalName: "Ilex verticillata",
    cultivar: "‘Red Sprite’",
    shortName: "Red Sprite winterberry",
    role: "Winter fruit",
    group: "winter",
    matureSize: "3–5 ft H × 3–5 ft W",
    light: "Sun / part shade",
    moisture: "Moist to wet",
    zones: "USDA 3–9",
    bloomRange: "May–June · red fruit persists into winter",
    foliageBehavior: "Green summer leaves; yellow fall color; deciduous with persistent red fruit",
    sourceUrl:
      "https://plants.ces.ncsu.edu/plants/ilex-verticillata/common-name/common-winterberry/",
    sourceLabel: "NC State Extension",
    caveat: "Red Sprite is female and needs an early-blooming male pollinator such as Jim Dandy for fruit.",
    accent: "#d5483e",
    position: [0, 0, 0],
    scale: 0.9,
    photoHeight: 2.7,
    habit: "broad",
    branchColor: "#625048",
    winterDisplay: {
      label: "Winter berries",
      kind: "persistent-fruit",
      windows: [[1, 93], [300, 365]],
      confidence: "low",
      provenance: "visual-interpolation",
      basis: "NC State Extension supports red fruit persisting into winter when a male pollinator is present; exact cross-year display and crossfade boundaries are representative visual estimates.",
    },
    assets: generatedAssets("winterberry"),
    seasonalNotes: {
      winter: "Red berries become the winterberry’s entire composition.",
      spring: "Small flowers stay quiet within the returning green canopy.",
      summer: "The broad green shrub holds quietly before fruit begins to color.",
      fall: "Yellow leaves fall away to reveal dense red berries.",
    },
    leaf: {
      emerge: [105, 135],
      drop: [285, 316],
      summer: "#416a42",
      fall: "#d6a42e",
      fallWindow: [258, 300],
      size: 0.15,
      count: 330,
    },
    bloom: {
      window: [134, 166],
      color: "#ece8d8",
      fadedColor: "#bdb8a6",
      count: 62,
      form: "corymb",
    },
    fruit: {
      window: [205, 365],
      color: "#c9332d",
      count: 140,
    },
  },
];

export const nativeFothergilla: PlantProfile = {
  ...plants[0],
  commonName: "Dwarf fothergilla",
  botanicalName: "Fothergilla gardenii",
  cultivar: "",
  shortName: "Dwarf fothergilla",
  role: "Native spring spark",
  matureSize: "1½–3 ft H × 2–4 ft W",
  zones: "USDA 5–8",
  bloomRange: "April–May · representative range",
  foliageBehavior: "Leathery blue-green leaves; orange, yellow, and scarlet fall color; deciduous",
  sourceUrl:
    "https://plants.ces.ncsu.edu/plants/fothergilla-gardenii/common-name/dwarf-fothergilla/",
  position: [-1.88, 0, 0.5],
  scale: 0.74,
  photoHeight: 2.35,
};

export const plantIsAvailable = (profile: PlantProfile, access: LibraryAccess) =>
  access === "full-library" || profile.accessTier === "preview";

export const compositionPlants = (
  nativeOnly: boolean,
  access: LibraryAccess = "full-library",
) => (nativeOnly ? [nativeFothergilla, ...plants.slice(1)] : plants).filter(
  (profile) => plantIsAvailable(profile, access),
);

export const compositionTemplates: CompositionTemplate[] = [
  {
    id: "balanced-year-3",
    name: "Balanced Year",
    size: 3,
    summary: "The original cadence: spring bloom, summer volume, fall color, and red winter stems.",
    seasonalCarry: {
      winter: "Red stems",
      spring: "Bottlebrush bloom",
      summer: "Oakleaf volume",
      fall: "Mahogany + gold",
    },
    planting: ["fothergilla", "hydrangea", "dogwood"],
    accessTier: "preview",
  },
  {
    id: "light-structure-3",
    name: "Light + Structure",
    size: 3,
    summary: "Airy blossom and lime panicles settle into a quiet evergreen frame.",
    seasonalCarry: {
      winter: "Evergreen form",
      spring: "Serviceberry bloom",
      summer: "Lime panicles",
      fall: "Gold + red foliage",
    },
    planting: ["serviceberry", "panicle-hydrangea", "boxwood"],
    accessTier: "full-library",
  },
  {
    id: "moisture-garden-3",
    name: "Moisture Garden",
    size: 3,
    summary: "A relaxed composition for the wetter edge, carried by bloom, seedheads, and winter stems.",
    seasonalCarry: {
      winter: "Red stems",
      spring: "Fresh foliage",
      summer: "White + globe bloom",
      fall: "Garnet + yellow",
    },
    planting: ["sweetspire", "buttonbush", "dogwood"],
    accessTier: "full-library",
  },
  {
    id: "layered-seasons-5",
    name: "Layered Seasons",
    size: 5,
    summary: "A flowering center with repeated spring bloom and evergreen winter footing.",
    seasonalCarry: {
      winter: "Stems + evergreen",
      spring: "Repeated bloom",
      summer: "Oakleaf anchor",
      fall: "Gold + mahogany",
    },
    planting: ["fothergilla", "hydrangea", "dogwood", "fothergilla", "boxwood"],
    accessTier: "preview",
  },
  {
    id: "woodland-framework-5",
    name: "Woodland Framework",
    size: 5,
    summary: "Airy spring blossom, cloudlike summer bloom, garnet foliage, and evergreen structure.",
    seasonalCarry: {
      winter: "Stems + evergreen",
      spring: "Serviceberry bloom",
      summer: "Annabelle clouds",
      fall: "Garnet foliage",
    },
    planting: ["serviceberry", "smooth-hydrangea", "dogwood", "sweetspire", "boxwood"],
    accessTier: "full-library",
  },
  {
    id: "long-summer-5",
    name: "Long Summer",
    size: 5,
    summary: "Gold foliage and fragrant bloom extend the season around late-summer panicles.",
    seasonalCarry: {
      winter: "Red stems + bark",
      spring: "Gold leaf + bloom",
      summer: "Fragrance + panicles",
      fall: "Yellow + russet",
    },
    planting: ["fothergilla", "panicle-hydrangea", "summersweet", "ninebark", "dogwood"],
    accessTier: "full-library",
  },
  {
    id: "seasonal-tapestry-7",
    name: "Full Seasonal Tapestry",
    size: 7,
    summary: "Seven distinct layers move from spring blossom to foliage color, bark, and evergreen form.",
    seasonalCarry: {
      winter: "Stems + evergreen",
      spring: "Layered white bloom",
      summer: "Oakleaf volume",
      fall: "Gold + garnet",
    },
    planting: [
      "fothergilla",
      "hydrangea",
      "dogwood",
      "serviceberry",
      "boxwood",
      "sweetspire",
      "ninebark",
    ],
    accessTier: "preview",
  },
  {
    id: "summer-structure-7",
    name: "Summer to Structure",
    size: 7,
    summary: "Overlapping summer bloom resolves into bark, seedheads, and evergreen mass.",
    seasonalCarry: {
      winter: "Stems + evergreen",
      spring: "Bottlebrush + gold leaf",
      summer: "Long bloom relay",
      fall: "Gold + seedheads",
    },
    planting: [
      "fothergilla",
      "smooth-hydrangea",
      "dogwood",
      "panicle-hydrangea",
      "boxwood",
      "summersweet",
      "ninebark",
    ],
    accessTier: "full-library",
  },
  {
    id: "moist-garden-drift-7",
    name: "Moist Garden Drift",
    size: 7,
    summary: "Repeated moisture-loving shrubs make a loose summer drift with strong dormant stems.",
    seasonalCarry: {
      winter: "Repeated red stems",
      spring: "Fresh foliage + bloom",
      summer: "Fragrant wet-edge drift",
      fall: "Garnet + yellow",
    },
    planting: [
      "sweetspire",
      "buttonbush",
      "dogwood",
      "fothergilla",
      "summersweet",
      "sweetspire",
      "dogwood",
    ],
    accessTier: "full-library",
  },
];

export const defaultTemplateId = "balanced-year-3";

export const templatesForSize = (size: ClusterSize) =>
  compositionTemplates.filter((template) => template.size === size);

export const previewTemplateForSize = (size: ClusterSize) =>
  compositionTemplates.find(
    (template) => template.size === size && template.accessTier === "preview",
  ) ?? compositionTemplates.find((template) => template.size === size)!;

export const templateIsAvailable = (
  template: CompositionTemplate,
  access: LibraryAccess,
) => access === "full-library" || template.accessTier === "preview";

export const defaultPlanting: PlantId[] = [
  ...compositionTemplates.find((template) => template.id === defaultTemplateId)!.planting,
];

const expansionOrder: PlantId[] = [
  "fothergilla",
  "dogwood",
  "hydrangea",
  "fothergilla",
];

export const resizePlanting = (planting: PlantId[], size: ClusterSize) => {
  if (planting.length >= size) return planting.slice(0, size);
  const next = [...planting];
  while (next.length < size) {
    next.push(expansionOrder[(next.length - defaultPlanting.length) % expansionOrder.length]);
  }
  return next;
};

const compositionLayouts: Record<
  ClusterSize,
  { position: [number, number, number]; scale: number }[]
> = {
  3: [
    { position: [-1.88, 0, 0.5], scale: 1 },
    { position: [0.1, 0.03, 0.22], scale: 1 },
    { position: [1.72, 0, -0.62], scale: 1 },
  ],
  5: [
    { position: [-2.15, 0, -0.48], scale: 0.84 },
    { position: [0, 0.03, -0.76], scale: 0.88 },
    { position: [2.05, 0, -0.5], scale: 0.82 },
    { position: [-1.05, 0.02, 0.74], scale: 0.82 },
    { position: [1.08, 0, 0.68], scale: 0.8 },
  ],
  7: [
    { position: [-2.42, 0, -0.82], scale: 0.72 },
    { position: [0, 0.02, -1.12], scale: 0.76 },
    { position: [2.38, 0, -0.78], scale: 0.7 },
    { position: [-1.35, 0.03, -0.02], scale: 0.72 },
    { position: [1.33, 0, -0.06], scale: 0.7 },
    { position: [-1.02, 0.04, 0.88], scale: 0.68 },
    { position: [1.05, 0, 0.84], scale: 0.67 },
  ],
};

export const buildComposition = (
  planting: PlantId[],
  nativeOnly: boolean,
  access: LibraryAccess = "full-library",
): PlantInstance[] => {
  const size = planting.length as ClusterSize;
  const layout = compositionLayouts[size] ?? compositionLayouts[3];
  const profiles = Object.fromEntries(
    compositionPlants(nativeOnly, access).map((profile) => [profile.id, profile]),
  ) as Record<PlantId, PlantProfile>;

  return planting.map((plantId, index) => ({
    instanceId: `plant-${index + 1}`,
    profile: profiles[plantId],
    position: layout[index].position,
    scale: profiles[plantId].scale * layout[index].scale,
  }));
};

export const plantMap = Object.fromEntries(
  plants.map((plant) => [plant.id, plant]),
) as Record<PlantId, PlantProfile>;
