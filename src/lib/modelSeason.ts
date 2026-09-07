import * as THREE from "three";
import type { PlantProfile } from "../data/plants";
import { plantState, smoothstep } from "./season";

/** Existing profile windows remain the authority; only visual interpolation lives here. */
export function modelSeason(profile: PlantProfile, day: number) {
  const state = plantState(profile, day);
  const [bloomStart, bloomEnd] = profile.bloom.window;
  let bloom = state.bloom;
  let aged = 0;
  if (profile.winterDisplay.kind === "persistent-bloom") {
    const previousHeadsEnd =
      profile.winterDisplay.windows.find(([a]) => a === 1)?.[1] ?? 1;
    // The same panicles age after flowering, stay through winter, and weather away.
    // Do not delete them in September then respawn them at the winter window.
    const oldHeads =
      1 - smoothstep(Math.max(1, previousHeadsEnd - 24), previousHeadsEnd, day);
    const retained = smoothstep(
      bloomStart,
      bloomStart + (bloomEnd - bloomStart) * 0.28,
      day,
    );
    bloom = Math.max(oldHeads, retained);
    aged = Math.max(
      1 - smoothstep(previousHeadsEnd, bloomStart, day),
      smoothstep(bloomEnd - 20, bloomEnd + 48, day),
    );
  }
  // Evergreen winter bronzing crosses New Year and recedes with spring growth.
  const fall = profile.evergreen
    ? Math.max(state.fall, 1 - smoothstep(55, profile.bloom.window[0], day)) *
      0.32
    : state.fall;
  // Reflectance authored for the common studio, independent of photographic assets.
  const studioGreens: Record<string, string> = {
    fothergilla: "#738953", hydrangea: "#657c49", dogwood: "#6c8855", boxwood: "#536f43",
  };
  const leafColor = new THREE.Color(studioGreens[profile.id] ?? profile.leaf.summer);
  const fallColor = new THREE.Color(profile.leaf.fall);
  const flowerColor = new THREE.Color(profile.bloom.color);
  if (profile.id === "hydrangea") {
    flowerColor.lerp(
      new THREE.Color(profile.bloom.fadedColor),
      smoothstep(bloomStart + 18, bloomEnd - 4, day),
    );
  }
  flowerColor.lerp(new THREE.Color("#bca888"), aged);
  return {
    leaves: state.leaves,
    fall,
    bloom,
    fruit: state.fruit,
    leafColor,
    fallColor,
    flowerColor,
    aged,
  };
}
