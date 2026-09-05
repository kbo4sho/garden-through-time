import { useEffect, useLayoutEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { PlantProfile } from "../data/plants";
import { modelHeight } from "../data/modelPlants";
import { modelSeason } from "../lib/modelSeason";

type LayerName = "branches" | "leaves" | "blooms" | "fruit";

function makeMaterial(
  name: LayerName,
  source: THREE.MeshStandardMaterial,
  profileId: PlantProfile["id"],
) {
  const material = source.clone();
  const uniforms = {
    growth: { value: 1 },
    fall: { value: 0 },
    summerColor: { value: new THREE.Color() },
    fallColor: { value: new THREE.Color() },
    bare: { value: 0 },
    stemAccent: { value: profileId === "dogwood" ? 1 : 0 },
  };
  material.roughness = name === "fruit" ? 0.58 : name === "blooms" ? 0.84 : 0.93;
  // Opaque folded geometry avoids sorted alpha layers and mobile overdraw.
  material.side = THREE.DoubleSide;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader =
      `attribute vec3 _anchor; attribute float _phase;
      uniform float growth;
      varying float vSeasonPhase;
      varying vec3 vStudioWorld;\n` + shader.vertexShader;
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
    shader.vertexShader = shader.vertexShader.replace(
      "#include <project_vertex>",
      `
      #include <project_vertex>
      vStudioWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
      `,
    );
    shader.fragmentShader =
      `uniform float fall; uniform vec3 summerColor; uniform vec3 fallColor;
      uniform float bare; uniform float stemAccent;
      varying float vSeasonPhase;
      varying vec3 vStudioWorld;\n` + shader.fragmentShader;
    if (name === "leaves") {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        `
        #include <color_fragment>
        float autumn = smoothstep(vSeasonPhase * .35, .65 + vSeasonPhase * .35, fall);
        vec3 autumnColor = mix(fallColor, fallColor * vec3(1.12, .86, .64), vSeasonPhase);
        diffuseColor.rgb *= mix(summerColor, autumnColor, autumn);
      `,
      );
    }
    if (name === "branches") {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        `
        #include <color_fragment>
        float grain = fract(sin(dot(vStudioWorld.xy, vec2(17.13, 41.27))) * 43758.5453);
        float ring = 0.9 + 0.12 * sin(vStudioWorld.y * 38.0 + grain * 6.2831);
        diffuseColor.rgb *= ring * (0.92 + 0.1 * grain);
        vec3 winterStem = mix(diffuseColor.rgb, vec3(0.4, 0.075, 0.068), stemAccent * bare);
        diffuseColor.rgb = winterStem;
      `,
      );
    }
    // Studio wrap + stylized leaf transmission. Distinct from photographic billboards.
    // Attempt 2: a little more interior lift so 390px canopies read as volume.
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <opaque_fragment>",
      `
      vec3 studioV = normalize(vViewPosition);
      float ndv = abs(dot(normal, studioV));
      float wrap = clamp((ndv * 0.42) + 0.26, 0.0, 1.0);
      float interior = clamp(length(vStudioWorld.xz) * 0.18 + vStudioWorld.y * 0.1, 0.0, 1.0);
      float rim = pow(clamp(1.0 - ndv, 0.0, 1.0), 1.45);
      outgoingLight *= 0.88 + 0.2 * interior;
      outgoingLight += diffuseColor.rgb * wrap * ${name === "leaves" ? "0.34" : name === "branches" ? "0.09" : "0.16"};
      ${
        name === "leaves"
          ? `outgoingLight += diffuseColor.rgb * vec3(1.06, 0.97, 0.78) * rim * 0.22;`
          : `outgoingLight += diffuseColor.rgb * rim * 0.08;`
      }
      ${
        name === "blooms"
          ? `outgoingLight += diffuseColor.rgb * 0.08;`
          : ""
      }
      #include <opaque_fragment>
      `,
    );
  };
  material.customProgramCacheKey = () =>
    `studio-botanical-v2-${name}-${profileId}`;
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
        ...makeMaterial(
          name,
          object.material as THREE.MeshStandardMaterial,
          profile.id,
        ),
      });
    });
    if (!result.some((layer) => layer.name === "branches"))
      throw new Error("Missing seasonal model scaffold");
    return result;
  }, [gltf, profile.id]);
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
      uniforms.bare.value = profile.evergreen ? 0 : 1 - state.leaves;
      if (name === "blooms") material.color.copy(state.flowerColor);
    }
  }, [layers, profile.evergreen, state]);
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
