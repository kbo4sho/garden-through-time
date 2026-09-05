import * as THREE from "three";
import modelManifest from "../../public/models/manifest.json";
import type { CompositionTemplate, PlantId, PlantInstance } from "./plants";

export const modelPlantIds = [
  "fothergilla",
  "hydrangea",
  "dogwood",
  "boxwood",
] as const;
export const hasPlantModel = (id: PlantId) =>
  modelPlantIds.some((modelId) => modelId === id);

// Renderer-only recommendation: existing photographic template IDs keep their meaning.
export const modelYearTemplate: CompositionTemplate = {
  id: "living-framework-7",
  name: "Living Framework",
  size: 7,
  summary:
    "Repeated spring bloom, broad oakleaf foliage, and two evergreen anchors frame red winter stems.",
  seasonalCarry: {
    winter: "Red stems + evergreen",
    spring: "Repeated bottlebrush bloom",
    summer: "Oakleaf volume",
    fall: "Gold + mahogany",
  },
  planting: [
    "fothergilla",
    "hydrangea",
    "dogwood",
    "fothergilla",
    "dogwood",
    "boxwood",
    "boxwood",
  ],
  accessTier: "preview",
};

export function modelBounds(instance: PlantInstance, variation: number) {
  const model =
    modelManifest.models[
      instance.profile.id as keyof typeof modelManifest.models
    ];
  if (!model) return null;
  const box = new THREE.Box3(
    new THREE.Vector3(...model.bounds.min),
    new THREE.Vector3(...model.bounds.max),
  );
  const scale = (instance.scale * instance.profile.photoHeight) / model.height;
  const transform = new THREE.Matrix4().compose(
      new THREE.Vector3(...instance.position),
      new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        variation * 2.39996,
      ),
      new THREE.Vector3(scale, scale, scale),
    );
  return { box: box.applyMatrix4(transform), points: model.silhouette.map(point => new THREE.Vector3(...point).applyMatrix4(transform)) };
}
export const modelHeight = (id: PlantId) =>
  modelManifest.models[id as keyof typeof modelManifest.models]?.height ?? 1;
