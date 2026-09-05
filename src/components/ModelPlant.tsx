import { useEffect, useLayoutEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { PlantProfile } from "../data/plants";
import { modelHeight } from "../data/modelPlants";
import { modelSeason } from "../lib/modelSeason";

type LayerName = "branches" | "leaves" | "blooms" | "fruit";

const SPECIES = { fothergilla: 0, hydrangea: 1, dogwood: 2, boxwood: 3 } as const;

const CANOPY_GLSL = /* glsl */ `
float tuftMask(vec2 uv, float phase, float lobes, float fat) {
  vec2 p = (uv - 0.5) * vec2(1.04, 0.9);
  float r = length(p);
  float ang = atan(p.y, p.x);
  float wobble = 0.055 * sin(ang * lobes + phase * 8.4);
  wobble += 0.02 * sin(ang * (lobes * 1.7) - phase * 5.1);
  return smoothstep(fat + wobble, fat - 0.2 + wobble * 0.4, r);
}
float foliageMask(vec2 uv, float species, float phase) {
  float edge = smoothstep(0.0, 0.04, uv.x) * smoothstep(0.0, 0.04, uv.y)
    * smoothstep(1.0, 0.96, uv.x) * smoothstep(1.0, 0.96, uv.y);
  float lobes = species > 2.5 ? 11.0 : species > 0.5 && species < 1.5 ? 5.0 : 6.5;
  float fat = species > 2.5 ? 0.5 : 0.47;
  return tuftMask(uv, phase, lobes, fat) * edge;
}
float bloomMask(vec2 uv, float species, float phase) {
  float edge = smoothstep(0.0, 0.04, uv.x) * smoothstep(0.0, 0.04, uv.y)
    * smoothstep(1.0, 0.96, uv.x) * smoothstep(1.0, 0.96, uv.y);
  float fat = species < 0.5 ? 0.42 : 0.46;
  float lobes = species < 0.5 ? 8.0 : 5.5;
  return tuftMask(uv, phase, lobes, fat) * edge;
}
float sprayMask(vec2 uv, float phase) {
  float edge = smoothstep(0.0, 0.03, uv.x) * smoothstep(0.0, 0.03, uv.y)
    * smoothstep(1.0, 0.97, uv.x) * smoothstep(1.0, 0.97, uv.y);
  return tuftMask(uv, phase, 7.0, 0.49) * edge;
}
float photoFleck(vec2 uv, float phase) {
  float n1 = fract(sin(dot(uv * 19.0 + phase, vec2(127.1, 311.7))) * 43758.5453);
  float n2 = fract(sin(dot(uv * 6.4 + phase * 3.1, vec2(91.2, 47.3))) * 23421.163);
  return mix(0.68, 1.14, n1 * 0.65 + n2 * 0.35);
}
`;

function makeMaterial(name: LayerName, source: THREE.MeshStandardMaterial, species: number) {
  const material = source.clone();
  const uniforms = {
    growth: { value: 1 },
    fall: { value: 0 },
    summerColor: { value: new THREE.Color() },
    fallColor: { value: new THREE.Color() },
    stemBoost: { value: 0 },
    species: { value: species },
  };
  material.metalness = 0;
  material.roughness =
    name === "fruit" ? 0.52 : name === "blooms" ? 0.58 : name === "branches" ? 0.94 : 0.86;
  material.side = THREE.DoubleSide;
  material.transparent = false;
  material.alphaTest = 0;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader =
      `attribute vec3 _anchor; attribute float _phase; attribute float _cluster;
      uniform float growth; varying float vSeasonPhase; varying float vCluster;
      varying vec2 vCanopyUv;
      varying vec3 vWorldNormal; varying vec3 vWorldPosition;\n` +
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
      vCluster = _cluster;
      vCanopyUv = uv;
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
      `uniform float fall; uniform vec3 summerColor; uniform vec3 fallColor;
      uniform float stemBoost; uniform float species;
      varying float vSeasonPhase; varying float vCluster; varying vec2 vCanopyUv;
      varying vec3 vWorldNormal; varying vec3 vWorldPosition;
      ${CANOPY_GLSL}\n` +
      shader.fragmentShader;
    if (name === "leaves") {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <roughnessmap_fragment>",
        `
        #include <roughnessmap_fragment>
        roughnessFactor = clamp(0.7 + 0.22 * vSeasonPhase, 0.52, 0.96);
      `,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        `
        #include <color_fragment>
        float autumn = smoothstep(vSeasonPhase * .35, .65 + vSeasonPhase * .35, fall);
        vec3 autumnColor = mix(fallColor, fallColor * vec3(1.18, .88, .58), vSeasonPhase);
        vec3 foliage = mix(summerColor, autumnColor, autumn);
        float fleck = photoFleck(vCanopyUv, vSeasonPhase);
        float cool = 0.88 + 0.18 * fract(sin(vSeasonPhase * 59.2 + vWorldPosition.x * 8.4) * 43758.5453);
        float canopy = mix(0.78, 1.06, clamp(vWorldPosition.y * 0.4, 0.0, 1.0));
        float tuftAo = mix(0.82, 1.0, smoothstep(0.06, 0.38, length(vCanopyUv - 0.5)));
        diffuseColor.rgb *= foliage * fleck * canopy * tuftAo;
        diffuseColor.rgb *= vec3(mix(0.9, 1.06, cool), 1.0, mix(0.84, 0.98, fleck));
        if (!gl_FrontFacing) {
          diffuseColor.rgb *= vec3(1.1, 1.03, 0.8);
        }
        float mask = foliageMask(vCanopyUv, species, vSeasonPhase);
        if (mask < 0.14) discard;
      `,
      );
    } else if (name === "branches") {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        `
        #include <color_fragment>
        float grain = 0.78 + 0.28 * fract(sin(vWorldPosition.y * 52.0 + vWorldPosition.x * 13.7) * 43758.5453);
        float mottling = (0.88 + 0.14 * vSeasonPhase) * grain;
        vec3 winterRed = vec3(0.74, 0.2, 0.16);
        diffuseColor.rgb = mix(diffuseColor.rgb * mottling, winterRed * (0.7 + 0.3 * grain), stemBoost);
        if (vSeasonPhase > 1.02) {
          float mask = sprayMask(vCanopyUv, vSeasonPhase);
          if (mask < 0.16) discard;
          float fleck = photoFleck(vCanopyUv, vSeasonPhase);
          diffuseColor.rgb *= (0.72 + 0.34 * grain) * fleck;
        }
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
        float rim = 0.9 + 0.14 * vSeasonPhase;
        float fleck = 0.86 + 0.18 * fract(sin(dot(vCanopyUv * 14.0, vec2(91.2, 47.3))) * 43758.5453);
        diffuseColor.rgb *= rim * fleck;
        if (!gl_FrontFacing) {
          diffuseColor.rgb *= vec3(1.04, 1.01, 0.94);
        }
        float mask = bloomMask(vCanopyUv, species, vSeasonPhase);
        if (mask < 0.14) discard;
        diffuseColor.rgb *= photoFleck(vCanopyUv, vSeasonPhase);
      `,
      );
    }
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <opaque_fragment>",
      `
      vec3 nWorld = normalize(vWorldNormal) * (gl_FrontFacing ? 1.0 : -1.0);
      vec3 lightDir = normalize(vec3(-0.42, 0.78, 0.48));
      float wrap = ${name === "leaves" ? "0.62" : name === "blooms" ? "0.48" : "0.22"};
      float nDotL = dot(nWorld, lightDir);
      float wrapDiffuse = clamp((nDotL + wrap) / (1.0 + wrap), 0.0, 1.0);
      float backLit = pow(clamp(-nDotL, 0.0, 1.0), 1.35);
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float trans = pow(clamp(dot(viewDir, -lightDir), 0.0, 1.0), 1.8) * backLit;
      ${
        name === "leaves"
          ? `outgoingLight += diffuseColor.rgb * (0.14 + wrapDiffuse * 0.24 + trans * 0.36);
      outgoingLight += diffuseColor.rgb * vec3(1.14, 0.97, 0.5) * trans * 0.34;`
          : name === "blooms"
            ? `outgoingLight += diffuseColor.rgb * (0.1 + wrapDiffuse * 0.14 + trans * 0.2);`
            : name === "branches"
              ? `outgoingLight += diffuseColor.rgb * (0.04 + wrapDiffuse * 0.08);`
              : `outgoingLight += diffuseColor.rgb * (0.06 + wrapDiffuse * 0.1);`
      }
      #include <opaque_fragment>
    `,
    );
  };
  material.customProgramCacheKey = () => `seasonal-gltf-v6-${name}-${species}`;
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
  const species = SPECIES[profile.id as keyof typeof SPECIES] ?? 0;
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
      const count = object.geometry.getAttribute("position").count;
      if (!object.geometry.getAttribute("_cluster")) {
        const fill =
          name === "leaves" || name === "blooms" ? 1 : 0;
        object.geometry.setAttribute(
          "_cluster",
          new THREE.Float32BufferAttribute(new Float32Array(count).fill(fill), 1),
        );
      }
      if (!object.geometry.getAttribute("uv")) {
        object.geometry.setAttribute(
          "uv",
          new THREE.Float32BufferAttribute(new Float32Array(count * 2), 2),
        );
      }
      result.push({
        name,
        geometry: object.geometry,
        ...makeMaterial(
          name,
          object.material as THREE.MeshStandardMaterial,
          species,
        ),
      });
    });
    if (!result.some((layer) => layer.name === "branches"))
      throw new Error("Missing seasonal model scaffold");
    return result;
  }, [gltf, species]);
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
      uniforms.species.value = species;
      if (name === "blooms") material.color.copy(state.flowerColor);
    }
  }, [layers, profile.id, species, state]);
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
