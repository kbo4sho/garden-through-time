export type PlantId = "fothergilla" | "hydrangea" | "dogwood";

export type PlantProfile = {
  id: PlantId;
  commonName: string;
  botanicalName: string;
  cultivar: string;
  shortName: string;
  role: string;
  matureSize: string;
  light: string;
  moisture: string;
  zones: string;
  bloomRange: string;
  foliageBehavior: string;
  sourceUrl: string;
  sourceLabel: string;
  accent: string;
  position: [number, number, number];
  scale: number;
  habit: "mound" | "broad" | "upright";
  branchColor: string;
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
    persistent?: boolean;
  };
  fruit?: {
    window: [number, number];
    color: string;
    count: number;
  };
};

export const plants: PlantProfile[] = [
  {
    id: "fothergilla",
    commonName: "Mount Airy fothergilla",
    botanicalName: "Fothergilla × intermedia",
    cultivar: "‘Mount Airy’",
    shortName: "Fothergilla",
    role: "Spring spark",
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
    habit: "mound",
    branchColor: "#5c4030",
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
    commonName: "Ruby Slippers oakleaf hydrangea",
    botanicalName: "Hydrangea quercifolia",
    cultivar: "‘Ruby Slippers’",
    shortName: "Oakleaf hydrangea",
    role: "Summer anchor",
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
    habit: "broad",
    branchColor: "#6d4d39",
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
      persistent: true,
    },
  },
  {
    id: "dogwood",
    commonName: "Arctic Fire redtwig dogwood",
    botanicalName: "Cornus sericea",
    cultivar: "Arctic Fire® ‘Farrow’",
    shortName: "Redtwig dogwood",
    role: "Winter structure",
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
    habit: "upright",
    branchColor: "#a63831",
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
};

export const compositionPlants = (nativeOnly: boolean) =>
  nativeOnly ? [nativeFothergilla, plants[1], plants[2]] : plants;

export const plantMap = Object.fromEntries(
  plants.map((plant) => [plant.id, plant]),
) as Record<PlantId, PlantProfile>;
