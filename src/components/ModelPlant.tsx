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
    stemBoost: { value: 0 },
  };
  material.metalness = 0;
  material.roughness =
    name === "fruit" ? 0.52 : name === "blooms" ? 0.58 : name === "branches" ? 0.94 : 0.86;
  // Opaque folded geometry avoids sorted alpha layers and mobile overdraw.
  material.side = THREE.DoubleSide;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader =
      `attribute vec3 _anchor; attribute float _phase;
      uniform float growth; varying float vSeasonPhase; varying vec3 vWorldNormal; varying vec3 vWorldPosition;\n` +
      shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <defaultnormal_vertex>",
      `
      #include <defaultnormal_vertex>
      vWorldNormal = normalize(mat3(modelMatrix) * objectNormal);
    `,
    );
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
      vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
    `,
    );
    shader.fragmentShader =
      `uniform float fall; uniform vec3 summerColor; uniform vec3 fallColor; uniform float stemBoost;
      varying float vSeasonPhase; varying vec3 vWorldNormal; varying vec3 vWorldPosition;\n` +
      shader.fragmentShader;
    if (name === "leaves") {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <roughnessmap_fragment>",
        `
        #include <roughnessmap_fragment>
        roughnessFactor = clamp(0.74 + 0.2 * vSeasonPhase, 0.55, 0.98);
      `,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        `
        #include <color_fragment>
        float autumn = smoothstep(vSeasonPhase * .35, .65 + vSeasonPhase * .35, fall);
        vec3 autumnColor = mix(fallColor, fallColor * vec3(1.16, .86, .6), vSeasonPhase);
        vec3 foliage = mix(summerColor, autumnColor, autumn);
        float vein = 0.86 + 0.16 * diffuseColor.g;
        float mottling = 0.86 + 0.2 * fract(sin(vSeasonPhase * 127.1) * 43758.5453);
        diffuseColor.rgb *= foliage * vein * mottling;
        if (!gl_FrontFacing) {
          diffuseColor.rgb *= vec3(1.12, 1.04, 0.82);
        }
      `,
      );
    } else if (name === "branches") {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        `
        #include <color_fragment>
        float mottling = 0.9 + 0.12 * vSeasonPhase;
        vec3 winterRed = vec3(0.78, 0.22, 0.18);
        diffuseColor.rgb = mix(diffuseColor.rgb * mottling, winterRed * (0.72 + 0.28 * mottling), stemBoost);
      `,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <roughnessmap_fragment>",
        `
        #include <roughnessmap_fragment>
        roughnessFactor = clamp(0.88 + 0.1 * vSeasonPhase - stemBoost * 0.12, 0.62, 0.98);
      `,
      );
    } else if (name === "blooms") {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        `
        #include <color_fragment>
        float rim = 0.92 + 0.1 * vSeasonPhase;
        diffuseColor.rgb *= rim;
        if (!gl_FrontFacing) {
          diffuseColor.rgb *= vec3(1.04, 1.01, 0.94);
        }
      `,
      );
    }
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <opaque_fragment>",
      `
      vec3 nWorld = normalize(vWorldNormal) * (gl_FrontFacing ? 1.0 : -1.0);
      vec3 lightDir = normalize(vec3(-0.42, 0.78, 0.48));
      float wrap = ${name === "leaves" ? "0.55" : name === "blooms" ? "0.42" : "0.22"};
      float nDotL = dot(nWorld, lightDir);
      float wrapDiffuse = clamp((nDotL + wrap) / (1.0 + wrap), 0.0, 1.0);
      float backLit = pow(clamp(-nDotL, 0.0, 1.0), 1.35);
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float trans = pow(clamp(dot(viewDir, -lightDir), 0.0, 1.0), 1.8) * backLit;
      ${
        name === "leaves"
          ? `outgoingLight += diffuseColor.rgb * (0.12 + wrapDiffuse * 0.22 + trans * 0.34);
      outgoingLight += diffuseColor.rgb * vec3(1.12, 0.96, 0.52) * trans * 0.32;`
          : name === "blooms"
            ? `outgoingLight += diffuseColor.rgb * (0.08 + wrapDiffuse * 0.12 + trans * 0.18);`
            : name === "branches"
              ? `outgoingLight += diffuseColor.rgb * (0.04 + wrapDiffuse * 0.08);`
              : `outgoingLight += diffuseColor.rgb * (0.06 + wrapDiffuse * 0.1);`
      }
      #include <opaque_fragment>
    `,
    );
  };
  material.customProgramCacheKey = () => `seasonal-gltf-v2-${name}`;
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
      uniforms.stemBoost.value =
        profile.id === "dogwood" ? (1 - state.leaves) * 0.72 : 0;
      if (name === "blooms") material.color.copy(state.flowerColor);
    }
  }, [layers, profile.id, state]);
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
