import * as THREE from "three";
import type { PlantProfile } from "../data/plants";

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const smoothstep = (edge0: number, edge1: number, value: number) => {
  const x = clamp01((value - edge0) / Math.max(1, edge1 - edge0));
  return x * x * (3 - 2 * x);
};

export const windowIntensity = (
  day: number,
  [start, end]: [number, number],
  feather = 0.28,
) => {
  if (day < start || day > end) return 0;
  const length = end - start;
  const fade = Math.max(2, length * feather);
  return Math.min(
    smoothstep(start, start + fade, day),
    1 - smoothstep(end - fade, end, day),
  );
};

export const leafDensity = (profile: PlantProfile, day: number) => {
  const leafIn = smoothstep(
    profile.leaf.emerge[0],
    profile.leaf.emerge[1],
    day,
  );
  const leafOut =
    1 - smoothstep(profile.leaf.drop[0], profile.leaf.drop[1], day);
  return Math.min(leafIn, leafOut);
};

export const leafColor = (profile: PlantProfile, day: number) => {
  const transition = smoothstep(
    profile.leaf.fallWindow[0],
    profile.leaf.fallWindow[1],
    day,
  );
  return new THREE.Color(profile.leaf.summer).lerp(
    new THREE.Color(profile.leaf.fall),
    transition,
  );
};

export const plantState = (profile: PlantProfile, day: number) => {
  const leaves = leafDensity(profile, day);
  const bloom = windowIntensity(day, profile.bloom.window);
  const fruit = profile.fruit ? windowIntensity(day, profile.fruit.window) : 0;
  const fall = smoothstep(
    profile.leaf.fallWindow[0],
    profile.leaf.fallWindow[1],
    day,
  );
  const persistentBloom = profile.bloom.persistent
    ? day >= profile.bloom.window[1] - 16
      ? 0.82 - smoothstep(310, 365, day) * 0.28
      : day < 112
        ? 0.54 * (1 - smoothstep(72, 112, day))
        : 0
    : 0;

  return { leaves, bloom, fruit, fall, persistentBloom };
};

export const dayToDate = (day: number) => {
  const date = new Date(2026, 0, Math.round(day));
  return {
    month: new Intl.DateTimeFormat("en-US", { month: "long" }).format(date),
    shortMonth: new Intl.DateTimeFormat("en-US", { month: "short" }).format(
      date,
    ),
    day: date.getDate(),
    label: new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
    }).format(date),
  };
};

export const dayPhase = (profile: PlantProfile, day: number) => {
  const state = plantState(profile, day);
  if (state.bloom > 0.18) return "In bloom";
  if (state.fruit > 0.18) return "Fruit forming";
  if (state.fall > 0.2 && state.leaves > 0.15) return "Fall color";
  if (state.persistentBloom > 0.18) return "Aged flower heads";
  if (state.leaves > 0.7) return "Full foliage";
  if (state.leaves > 0.08) return day < 190 ? "Leafing out" : "Leaves falling";
  return profile.id === "dogwood" ? "Red winter stems" : "Dormant structure";
};

export const seasonCopy = (day: number) => {
  if (day < 80 || day >= 345)
    return { name: "Deep winter", note: "Structure carries the composition" };
  if (day < 125)
    return { name: "Early spring", note: "Buds swell before the canopy returns" };
  if (day < 165)
    return { name: "Late spring", note: "The first flowering handoff begins" };
  if (day < 245)
    return { name: "Summer", note: "Layered foliage holds the garden together" };
  if (day < 285)
    return { name: "Early fall", note: "Fruit and first color shifts emerge" };
  if (day < 325)
    return { name: "Late fall", note: "Foliage gives way to form and bark" };
  return { name: "Early winter", note: "The red stems take the lead" };
};

export const mulberry32 = (seed: number) => {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let result = Math.imul(value ^ (value >>> 15), 1 | value);
    result = (result + Math.imul(result ^ (result >>> 7), 61 | result)) ^ result;
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
};
