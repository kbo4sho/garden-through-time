import { useEffect, useLayoutEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { PlantProfile } from "../data/plants";
import { modelHeight } from "../data/modelPlants";
import { modelSeason } from "../lib/modelSeason";

type LayerName = "branches" | "leaves" | "blooms" | "fruit";

function makeMaterial(name: LayerName, source: THREE.MeshStandardMaterial) {
  const material = source.clone();
  const depthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, side: THREE.DoubleSide });
  const uniforms = {
    growth: { value: 1 },
    fall: { value: 0 },
    dry: { value: 0 },
    summerColor: { value: new THREE.Color() },
    fallColor: { value: new THREE.Color() },
  };
  material.roughness = name === "fruit" ? .56 : name === "leaves" ? .72 : .94;
  // Opaque curved organs avoid sorted alpha layers and mobile overdraw.
  material.side = THREE.DoubleSide;
  const deform: THREE.MeshStandardMaterial["onBeforeCompile"] = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader =
      `attribute vec3 _anchor; attribute float _phase;
      ${name === "blooms" ? "attribute float _petal; uniform float dry;" : ""}
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
      transformed = _anchor + (position - _anchor) * size;
      ${name === "blooms" ? `
        transformed = mix(transformed, _anchor + (transformed - _anchor) * .70, dry * _petal);
        transformed += normal * length(position - _anchor) * dry * _petal * .32 * size;
      ` : ""}`
      }
    `,
    );
    if (name === "blooms") shader.vertexShader = shader.vertexShader.replace(
      "#include <beginnormal_vertex>",
      `#include <beginnormal_vertex>
      objectNormal = normalize(objectNormal + (position - _anchor) * dry * _petal * 8.0);`,
    );
  };
  depthMaterial.onBeforeCompile = deform;
  material.onBeforeCompile = (shader, renderer) => {
    deform(shader, renderer);
    if (name === "leaves") {
      shader.vertexShader = "#define USE_UV\n" + shader.vertexShader;
      shader.fragmentShader =
        `#define USE_UV
        uniform float fall; uniform vec3 summerColor; uniform vec3 fallColor;
        varying float vSeasonPhase;\n` + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <color_fragment>",
        `
        #include <color_fragment>
        float autumn = smoothstep(vSeasonPhase * .35, .65 + vSeasonPhase * .35, fall);
        vec3 autumnColor = mix(fallColor * vec3(.82, .63, .74), fallColor * vec3(1.18, 1.30, .68), vSeasonPhase);
        if (!gl_FrontFacing) diffuseColor.rgb *= vec3(1.06, 1.12, 1.01);
        diffuseColor.rgb *= mix(summerColor, autumnColor, autumn);
        // Blade-local pigmentation follows its midrib and paired lateral veins.
        // Derivative filtering removes subpixel vein shimmer during phone Play.
        float across = abs(vUv.x - .5);
        float aa = max(fwidth(vUv.x), .003);
        float midrib = 1.0 - smoothstep(.004, .008 + aa, across);
        float veinDistance = abs(fract(vUv.y * 6.0 - across * 3.2 + .5) - .5);
        float veinAA = max(fwidth(veinDistance), .02);
        float veins = (1.0 - smoothstep(.018, .025 + veinAA, veinDistance)) * (1.0 - across);
        float mottling = sin(vUv.x * 31.0 + sin(vUv.y * 17.0)) * sin(vUv.y * 39.0);
        diffuseColor.rgb *= 1.0 + .10 * midrib + .065 * veins + .025 * mottling;
      `,
      );
      // A restrained backlit lift, retaining standard PBR directional shading.
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        `
        // Thin-leaf transmission responds to the shared key, not a baked glow.
        vec3 keyDirection = normalize((viewMatrix * vec4(-4.5, 7.8, 5.2, 0.0)).xyz);
        float through = pow(max(0.0, dot(-normal, keyDirection)), 1.5);
        outgoingLight += diffuseColor.rgb * through * .48;
        #include <opaque_fragment>
      `,
      );
    }
    if (name === "blooms") {
      shader.fragmentShader = "uniform float dry;\n" + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace("#include <opaque_fragment>", `
        vec3 keyDirection = normalize((viewMatrix * vec4(-4.5, 7.8, 5.2, 0.0)).xyz);
        float through = max(0.0, dot(-normal, keyDirection));
        outgoingLight += diffuseColor.rgb * through * .17 * (1.0 - dry * .6);
        #include <opaque_fragment>
      `);
    }
  };
  material.customProgramCacheKey = () => `seasonal-gltf-studio-v5-${name}`;
  depthMaterial.customProgramCacheKey = () => `seasonal-gltf-depth-v3-${name}`;
  if (name === "leaves") material.color.set("#ffffff");
  return { material, depthMaterial, uniforms };
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
      depthMaterial: THREE.MeshDepthMaterial;
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
      uniforms.dry.value = state.aged;
      uniforms.summerColor.value.copy(state.leafColor);
      uniforms.fallColor.value.copy(state.fallColor);
      if (name === "blooms") {
        material.color.copy(state.flowerColor);
        material.roughness = THREE.MathUtils.lerp(.82, .98, state.aged);
      }
    }
  }, [layers, state]);
  useEffect(
    () => () => {
      layers.forEach(({ material, depthMaterial }) => { material.dispose(); depthMaterial.dispose(); });
    },
    [layers],
  );
  return (
    <group
      rotation={[0, variation * 2.39996, 0]}
      scale={profile.photoHeight / modelHeight(profile.id)}
    >
      {layers.map(({ name, geometry, material, depthMaterial }) => (
        <mesh
          key={name}
          name={`model-${profile.id}-${name}`}
          geometry={geometry}
          material={material}
          customDepthMaterial={depthMaterial}
          castShadow
          receiveShadow
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
