import { useEffect, useLayoutEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { PlantProfile } from "../data/plants";
import { modelHeight } from "../data/modelPlants";
import { modelSeason } from "../lib/modelSeason";

type LayerName = "branches" | "leaves" | "blooms" | "fruit";

const SPECIES = { fothergilla: 0, hydrangea: 1, dogwood: 2, boxwood: 3 } as const;

const CANOPY_GLSL = /* glsl */ `
float canopyHash(vec2 p) {
  return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}
float fothLeaf(vec2 p) {
  float t = clamp(p.y * 0.5 + 0.42, 0.0, 1.0);
  float body = pow(max(0.0, sin(3.14159 * pow(t, 0.78))), 0.7);
  float tooth = 1.0 + 0.15 * sin(t * 34.0);
  float halfW = 0.36 * body * tooth;
  float d = abs(p.x) / max(0.02, halfW);
  return (1.0 - smoothstep(0.78, 1.06, d)) * smoothstep(-0.08, 0.06, t) * smoothstep(1.05, 0.88, t);
}
float oakLeaf(vec2 p) {
  float t = clamp(p.y * 0.48 + 0.46, 0.0, 1.0);
  float lobe = 0.2;
  lobe = max(lobe, 0.44 * exp(-pow((t - 0.2) / 0.12, 2.0) * 1.7));
  lobe = max(lobe, 0.74 * exp(-pow((t - 0.38) / 0.13, 2.0) * 1.7));
  lobe = max(lobe, 0.98 * exp(-pow((t - 0.56) / 0.14, 2.0) * 1.7));
  lobe = max(lobe, 0.66 * exp(-pow((t - 0.74) / 0.12, 2.0) * 1.7));
  lobe = max(lobe, 0.3 * exp(-pow((t - 0.9) / 0.1, 2.0) * 1.7));
  float body = pow(max(0.0, sin(3.14159 * pow(t, 0.92))), 0.68);
  float halfW = 0.52 * body * lobe;
  float d = abs(p.x) / max(0.02, halfW);
  return (1.0 - smoothstep(0.8, 1.06, d)) * smoothstep(-0.06, 0.08, t) * smoothstep(1.04, 0.9, t);
}
float dogLeaf(vec2 p) {
  float t = clamp(p.y * 0.5 + 0.44, 0.0, 1.0);
  float body = pow(max(0.0, sin(3.14159 * pow(t, 1.05))), 0.82);
  float halfW = 0.32 * body;
  float d = abs(p.x) / max(0.02, halfW);
  return (1.0 - smoothstep(0.78, 1.05, d)) * smoothstep(-0.06, 0.07, t) * smoothstep(1.04, 0.9, t);
}
float boxLeaf(vec2 p) {
  vec2 q = p * vec2(1.35, 1.0);
  return 1.0 - smoothstep(0.42, 0.62, length(q));
}
float speciesLeaf(vec2 p, float species) {
  if (species < 0.5) return fothLeaf(p);
  if (species < 1.5) return oakLeaf(p);
  if (species < 2.5) return dogLeaf(p);
  return boxLeaf(p);
}
float foliageMask(vec2 uv, float species, float phase) {
  float edge = smoothstep(0.0, 0.07, uv.x) * smoothstep(0.0, 0.07, uv.y)
    * smoothstep(1.0, 0.93, uv.x) * smoothstep(1.0, 0.93, uv.y);
  float mask = 0.0;
  float count = species > 2.5 ? 14.0 : 10.0;
  for (int i = 0; i < 14; i++) {
    float fi = float(i);
    if (fi >= count) break;
    float ang = fi * 2.39996 + phase * 5.7;
    float rad = sqrt((fi + 0.35) / count) * 0.34;
    vec2 c = vec2(0.5) + vec2(cos(ang), sin(ang) * 0.82) * rad;
    float scale = species > 2.5 ? 7.4 : species < 1.5 ? 3.15 : 3.55;
    vec2 p = (uv - c) * scale;
    float ca = cos(ang + phase);
    float sa = sin(ang + phase);
    p = vec2(ca * p.x - sa * p.y, sa * p.x + ca * p.y);
    mask = max(mask, speciesLeaf(p, species));
  }
  float core = smoothstep(0.46, 0.14, length((uv - vec2(0.5)) * vec2(1.05, 0.88)));
  float coreAmt = species > 2.5 ? 0.78 : 0.52;
  mask = max(mask, core * coreAmt);
  return mask * edge;
}
float bloomMask(vec2 uv, float species, float phase) {
  float edge = smoothstep(0.0, 0.06, uv.x) * smoothstep(0.0, 0.06, uv.y)
    * smoothstep(1.0, 0.94, uv.x) * smoothstep(1.0, 0.94, uv.y);
  vec2 p = uv - 0.5;
  float mask = 0.0;
  if (species < 0.5) {
    for (int i = 0; i < 18; i++) {
      float fi = float(i);
      float ang = fi * 2.39996 + phase * 4.0;
      float t = fi / 18.0;
      vec2 c = vec2(cos(ang), (t - 0.5) * 1.15) * (0.12 + t * 0.08);
      float filament = 1.0 - smoothstep(0.012, 0.03, length(p - c));
      mask = max(mask, filament);
    }
    mask = max(mask, smoothstep(0.34, 0.1, length(p * vec2(1.35, 0.72))) * 0.55);
  } else if (species < 1.5) {
    for (int i = 0; i < 12; i++) {
      float fi = float(i);
      float ang = fi * 2.39996 + phase * 3.2;
      float rad = sqrt((fi + 0.2) / 12.0) * 0.32;
      vec2 c = vec2(cos(ang), sin(ang) * 0.86) * rad;
      mask = max(mask, 1.0 - smoothstep(0.07, 0.14, length(p - c)));
    }
    mask = max(mask, smoothstep(0.36, 0.12, length(p * vec2(1.05, 0.9))) * 0.62);
  } else if (species < 2.5) {
    for (int i = 0; i < 9; i++) {
      float fi = float(i);
      float ang = fi * 2.39996;
      vec2 c = vec2(cos(ang), sin(ang)) * 0.16 * sqrt((fi + 0.4) / 9.0);
      mask = max(mask, 1.0 - smoothstep(0.05, 0.1, length(p - c)));
    }
    mask = max(mask, smoothstep(0.28, 0.1, length(p)) * 0.45);
  } else {
    mask = smoothstep(0.28, 0.1, length(p * vec2(1.1, 1.0)));
  }
  return mask * edge;
}
float sprayMask(vec2 uv, float phase) {
  float edge = smoothstep(0.0, 0.05, uv.x) * smoothstep(0.0, 0.05, uv.y)
    * smoothstep(1.0, 0.95, uv.x) * smoothstep(1.0, 0.95, uv.y);
  vec2 p = uv - 0.5;
  float mask = 0.0;
  for (int i = 0; i < 18; i++) {
    float fi = float(i);
    float ang = fi * 2.39996 + phase * 6.28;
    vec2 dir = vec2(cos(ang), sin(ang) * 1.15);
    float along = dot(p, dir);
    float span = 0.18 + fract(phase * 17.0 + fi * 0.13) * 0.28;
    float line = abs(p.x * dir.y - p.y * dir.x);
    float stroke = (1.0 - smoothstep(0.003, 0.011, line)) * smoothstep(0.0, 0.02, along) * smoothstep(span, span * 0.72, along);
    mask = max(mask, stroke);
  }
  mask = max(mask, smoothstep(0.16, 0.04, length(p * vec2(1.1, 0.95))) * 0.35);
  return mask * edge;
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
      attribute vec2 uv;
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
        float fleck = 0.74 + 0.32 * fract(sin(dot(vCanopyUv * 17.0 + vSeasonPhase, vec2(127.1, 311.7))) * 43758.5453);
        float cool = 0.9 + 0.16 * fract(sin(vSeasonPhase * 59.2 + vWorldPosition.x * 8.4) * 43758.5453);
        float canopy = mix(0.68, 1.04, clamp(vWorldPosition.y * 0.4, 0.0, 1.0));
        float tuftAo = mix(0.7, 1.0, smoothstep(0.08, 0.42, length(vCanopyUv - 0.5)));
        diffuseColor.rgb *= foliage * fleck * canopy * tuftAo;
        diffuseColor.rgb *= vec3(mix(0.92, 1.05, cool), 1.0, mix(0.86, 0.98, fleck));
        if (!gl_FrontFacing) {
          diffuseColor.rgb *= vec3(1.12, 1.04, 0.78);
        }
        float mask = foliageMask(vCanopyUv, species, vSeasonPhase);
        float dither = canopyHash(gl_FragCoord.xy);
        diffuseColor.a = mask;
        if (mask < mix(0.16, 0.78, dither)) discard;
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
        if (vCluster > 0.5) {
          float mask = sprayMask(vCanopyUv, vSeasonPhase);
          float dither = canopyHash(gl_FragCoord.xy);
          diffuseColor.a = mask;
          if (mask < mix(0.2, 0.84, dither)) discard;
          diffuseColor.rgb *= 0.78 + 0.28 * grain;
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
        if (vCluster > 0.5) {
          float mask = bloomMask(vCanopyUv, species, vSeasonPhase);
          float dither = canopyHash(gl_FragCoord.xy);
          diffuseColor.a = mask;
          if (mask < mix(0.14, 0.76, dither)) discard;
        }
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
  material.customProgramCacheKey = () => `seasonal-gltf-v4-${name}-${species}`;
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
