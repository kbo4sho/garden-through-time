import { useEffect, useLayoutEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { PlantProfile } from "../data/plants";
import { modelHeight } from "../data/modelPlants";
import { modelSeason } from "../lib/modelSeason";

type LayerName = "branches" | "leaves" | "blooms" | "fruit";

function makeMaterial(name: LayerName, source: THREE.MeshStandardMaterial) {
  const material = source.clone();
  const uniforms = {
    growth: { value: 1 },
    fall: { value: 0 },
    summerColor: { value: new THREE.Color() },
    fallColor: { value: new THREE.Color() },
  };
  material.roughness = name === "fruit" ? 0.65 : 0.88;
  // Opaque folded geometry avoids sorted alpha layers and mobile overdraw.
  material.side = THREE.DoubleSide;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader =
      `attribute vec3 _anchor; attribute float _phase;
      uniform float growth; varying float vSeasonPhase;\n` +
      shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `
      #include <begin_vertex>
      vSeasonPhase = _phase;
      ${
        name === "branches"
          ? ""
          : `float size = smoothstep(_phase * 0.65, _phase * 0.65 + 0.35, growth);
      transformed = _anchor + (position - _anchor) * size;`
      }
    `,
    );
    if (name === "leaves") {
      shader.fragmentShader =
        `uniform float fall; uniform vec3 summerColor; uniform vec3 fallColor;
        varying float vSeasonPhase;\n` + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        `
        #include <color_fragment>
        float autumn = smoothstep(vSeasonPhase * .35, .65 + vSeasonPhase * .35, fall);
        vec3 autumnColor = mix(fallColor, fallColor * vec3(1.14, .83, .62), vSeasonPhase);
        diffuseColor.rgb *= mix(summerColor, autumnColor, autumn);
      `,
      );
      // A restrained backlit lift, retaining standard PBR directional shading.
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        `
        outgoingLight += diffuseColor.rgb * 0.075;
        #include <opaque_fragment>
      `,
      );
    }
  };
  material.customProgramCacheKey = () => `seasonal-gltf-v1-${name}`;
  if (name === "leaves") material.color.set("#ffffff");
  return { material, uniforms };
}

export default function ModelPlant({
  profile,
  day,
  variation,
}: {
  profile: PlantProfile;
  day: number;
  variation: number;
}) {
  // Cache immutable geometry per species, across repeats and all views. No remote decoder.
  const gltf = useGLTF(
    `${import.meta.env.BASE_URL}models/${profile.id}.glb`,
    false,
    true,
  );
  const layers = useMemo(() => {
    const result: {
      name: LayerName;
      geometry: THREE.BufferGeometry;
      material: THREE.MeshStandardMaterial;
      uniforms: ReturnType<typeof makeMaterial>["uniforms"];
    }[] = [];
    gltf.scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const name = object.name as LayerName;
      if (!["branches", "leaves", "blooms", "fruit"].includes(name)) return;
      if (
        !object.geometry.getAttribute("_anchor") ||
        !object.geometry.getAttribute("_phase")
      )
        throw new Error("Invalid seasonal model attributes");
      result.push({
        name,
        geometry: object.geometry,
        ...makeMaterial(name, object.material as THREE.MeshStandardMaterial),
      });
    });
    if (!result.some((layer) => layer.name === "branches"))
      throw new Error("Missing seasonal model scaffold");
    return result;
  }, [gltf]);
  const state = modelSeason(profile, day);
  useLayoutEffect(() => {
    for (const layer of layers) {
      const { name, material, uniforms } = layer;
      uniforms.growth.value =
        name === "leaves"
          ? state.leaves
          : name === "blooms"
            ? state.bloom
            : name === "fruit"
              ? state.fruit
              : 1;
      uniforms.fall.value = state.fall;
      uniforms.summerColor.value.copy(state.leafColor);
      uniforms.fallColor.value.copy(state.fallColor);
      if (name === "blooms") material.color.copy(state.flowerColor);
    }
  }, [layers, state]);
  useEffect(
    () => () => {
      layers.forEach(({ material }) => material.dispose());
    },
    [layers],
  );
  return (
    <group
      rotation={[0, variation * 2.39996, 0]}
      scale={profile.photoHeight / modelHeight(profile.id)}
    >
      {layers.map(({ name, geometry, material }) => (
        <mesh
          key={name}
          name={`model-${profile.id}-${name}`}
          geometry={geometry}
          material={material}
          dispose={null}
          visible={
            name === "branches" ||
            (name === "leaves"
              ? state.leaves
              : name === "blooms"
                ? state.bloom
                : state.fruit) > 0.001
          }
        />
      ))}
    </group>
  );
}
