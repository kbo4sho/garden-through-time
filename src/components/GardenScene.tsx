import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Billboard,
  Instance,
  Instances,
  PerspectiveCamera,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";
import type {
  PhotoStage,
  PlantId,
  PlantInstance,
  PlantProfile,
} from "../data/plants";
import { mulberry32, plantState, smoothstep } from "../lib/season";

const assetPath = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;

type GardenSceneProps = {
  day: number;
  selectedId: PlantId;
  onSelect: (id: PlantId) => void;
  reducedMotion: boolean;
  instances: PlantInstance[];
  viewId: GardenViewId;
  visualStyle: VisualStyle;
  primary?: boolean;
  onReady?: () => void;
};

export type VisualStyle = "photographic" | "editorial";

export const gardenViews = [
  { id: "portrait", number: "01", label: "Garden portrait", note: "The whole composition" },
  { id: "front-elevation", number: "02", label: "Front elevation", note: "Height and overlap" },
  { id: "planting-plan", number: "03", label: "Planting plan", note: "Spacing and repetition" },
  { id: "seasonal-detail", number: "04", label: "Seasonal detail", note: "The selected plant" },
] as const;

export type GardenViewId = (typeof gardenViews)[number]["id"];

const paperPlanPose = (instance: PlantInstance, instances: PlantInstance[]) => {
  const ordered = [...instances].sort((left, right) => {
    const dx = left.position[0] - right.position[0];
    return Math.abs(dx) > 0.08 ? dx : left.position[2] - right.position[2];
  });
  const index = Math.max(
    0,
    ordered.findIndex((item) => item.instanceId === instance.instanceId),
  );
  const count = Math.max(1, ordered.length);
  const spacing = count <= 3 ? 0.5 : count <= 5 ? 0.52 : 0.44;
  const scaleBoost = count <= 3 ? 1.22 : count <= 5 ? 1.02 : 0.86;
  return {
    position: [
      (index - (count - 1) / 2) * spacing,
      instance.position[2] * 0.2,
      0,
    ] as [number, number, number],
    scale: instance.scale * scaleBoost,
  };
};

const paperPlanBounds = (instances: PlantInstance[]) => {
  const poses = instances.map((instance) => {
    const pose = paperPlanPose(instance, instances);
    const radius = instance.profile.photoHeight * pose.scale * 0.28;
    return {
      x: pose.position[0],
      y: pose.position[1],
      radius,
      height: instance.profile.photoHeight * pose.scale,
    };
  });
  const minX = Math.min(...poses.map((pose) => pose.x - pose.radius));
  const maxX = Math.max(...poses.map((pose) => pose.x + pose.radius));
  const minY = Math.min(...poses.map((pose) => pose.y - pose.radius * 0.18));
  const maxY = Math.max(...poses.map((pose) => pose.y + pose.height * 0.5));
  return {
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
    spanX: Math.max(0.9, maxX - minX),
    spanY: Math.max(0.9, maxY - minY),
  };
};

const cameraPresets: Record<
  GardenViewId,
  { position: [number, number, number]; target: [number, number, number]; fov: number }
> = {
  portrait: { position: [5.8, 3.1, 7.35], target: [-0.82, 1.14, 0.05], fov: 32 },
  "front-elevation": {
    position: [0.02, 2.68, 8.65],
    target: [0, 1.16, 0.02],
    fov: 29,
  },
  "planting-plan": {
    position: [4.7, 7.35, 6.15],
    target: [0, 0.52, 0.02],
    fov: 31,
  },
  "seasonal-detail": {
    position: [2.4, 2.15, 3.2],
    target: [0, 1.3, 0],
    fov: 24,
  },
};

type Branch = {
  start: [number, number, number];
  end: [number, number, number];
  radius: number;
};

type Particle = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  shade: number;
};

const seedForPlant = (id: PlantId) =>
  [...id].reduce((seed, character) => (seed * 31 + character.charCodeAt(0)) >>> 0, 8172);

const habitDimensions = {
  mound: { width: 1.42, height: 2.05, lower: 0.28 },
  broad: { width: 1.62, height: 2.35, lower: 0.34 },
  upright: { width: 1.25, height: 2.92, lower: 0.4 },
};

const makeLeafGeometry = (habit: PlantProfile["habit"]) => {
  const shape = new THREE.Shape();
  if (habit === "broad") {
    const points = [
      [-0.05, -1],
      [0.24, -0.58],
      [0.64, -0.7],
      [0.5, -0.27],
      [0.94, -0.08],
      [0.5, 0.12],
      [0.72, 0.54],
      [0.24, 0.47],
      [0, 1],
      [-0.24, 0.47],
      [-0.72, 0.54],
      [-0.5, 0.12],
      [-0.94, -0.08],
      [-0.5, -0.27],
      [-0.64, -0.7],
      [-0.24, -0.58],
    ] as [number, number][];
    shape.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
    shape.closePath();
  } else {
    shape.moveTo(0, -1);
    shape.bezierCurveTo(0.7, -0.6, 0.72, 0.52, 0, 1);
    shape.bezierCurveTo(-0.72, 0.52, -0.7, -0.6, 0, -1);
  }
  const geometry = new THREE.ShapeGeometry(shape, 4);
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
};

const generatePlant = (profile: PlantProfile) => {
  const random = mulberry32(seedForPlant(profile.id));
  const dim = habitDimensions[profile.habit];
  const branches: Branch[] = [];
  const leaves: Particle[] = [];
  const flowers: Particle[] = [];
  const fruit: Particle[] = [];
  const stemCount = profile.habit === "upright" ? 23 : 18;

  for (let stem = 0; stem < stemCount; stem += 1) {
    const angle = random() * Math.PI * 2;
    const baseRadius = 0.08 + random() * 0.3;
    let previous: [number, number, number] = [
      Math.cos(angle) * baseRadius,
      0.04,
      Math.sin(angle) * baseRadius,
    ];
    const stemHeight = dim.height * (0.72 + random() * 0.28);
    const lean = (0.12 + random() * 0.42) *
      (profile.habit === "upright" ? 0.58 : 1);

    for (let step = 1; step <= 6; step += 1) {
      const t = step / 6;
      const bend = Math.sin(t * Math.PI * 0.7) * lean;
      const next: [number, number, number] = [
        previous[0] + Math.cos(angle) * bend * 0.34 + (random() - 0.5) * 0.08,
        stemHeight * t,
        previous[2] + Math.sin(angle) * bend * 0.34 + (random() - 0.5) * 0.08,
      ];
      branches.push({
        start: previous,
        end: next,
        radius: Math.max(0.012, 0.038 * (1 - t * 0.72)),
      });

      if (step >= 2 && step <= 5 && random() > 0.28) {
        const branchAngle = angle + (random() > 0.5 ? 1 : -1) * (0.55 + random());
        const branchLength = dim.width * (0.18 + random() * 0.18) * (1 - t * 0.22);
        const branchEnd: [number, number, number] = [
          next[0] + Math.cos(branchAngle) * branchLength,
          next[1] + 0.12 + random() * 0.22,
          next[2] + Math.sin(branchAngle) * branchLength,
        ];
        branches.push({
          start: next,
          end: branchEnd,
          radius: Math.max(0.009, 0.021 * (1 - t * 0.45)),
        });
      }
      previous = next;
    }
  }

  for (let index = 0; index < profile.leaf.count; index += 1) {
    const yT = Math.pow(random(), profile.habit === "upright" ? 0.72 : 0.9);
    const y = dim.lower + yT * (dim.height - dim.lower);
    const canopy = Math.sin(Math.PI * clampRange((yT + 0.08) * 0.9, 0.05, 0.95));
    const angle = random() * Math.PI * 2;
    const spread = Math.sqrt(random()) * dim.width * (0.42 + canopy * 0.58);
    const uprightTightness = profile.habit === "upright" ? 0.74 : 1;
    leaves.push({
      position: [
        Math.cos(angle) * spread * uprightTightness + (random() - 0.5) * 0.12,
        y,
        Math.sin(angle) * spread + (random() - 0.5) * 0.12,
      ],
      rotation: [
        Math.PI / 2 + (random() - 0.5) * 1.25,
        angle + (random() - 0.5) * 0.5,
        (random() - 0.5) * 0.9,
      ],
      scale: 0.66 + random() * 0.58,
      shade: random(),
    });
  }

  const bloomClusters =
    profile.bloom.form === "panicle" ? 14 : profile.bloom.form === "brush" ? 15 : 11;
  const bloomRandom = mulberry32(seedForPlant(profile.id) + 991);
  const centers = Array.from({ length: bloomClusters }, (_, index) => {
    const angle = (index / bloomClusters) * Math.PI * 2 + bloomRandom() * 0.7;
    const radius = dim.width * (0.34 + bloomRandom() * 0.5);
    return [
      Math.cos(angle) * radius,
      dim.height * (0.58 + bloomRandom() * 0.34),
      Math.sin(angle) * radius,
    ] as [number, number, number];
  });

  for (let index = 0; index < profile.bloom.count; index += 1) {
    const center = centers[index % centers.length];
    const local = index / profile.bloom.count;
    let offset: [number, number, number];
    if (profile.bloom.form === "brush") {
      const step = Math.floor(index / centers.length) % 9;
      const angle = bloomRandom() * Math.PI * 2;
      offset = [
        Math.cos(angle) * 0.055 * bloomRandom(),
        step * 0.04,
        Math.sin(angle) * 0.055 * bloomRandom(),
      ];
    } else if (profile.bloom.form === "panicle") {
      const level = (Math.floor(index / centers.length) % 12) / 11;
      const angle = bloomRandom() * Math.PI * 2;
      const radius = (1 - level * 0.72) * 0.22 * Math.sqrt(bloomRandom());
      offset = [Math.cos(angle) * radius, level * 0.52, Math.sin(angle) * radius];
    } else {
      const angle = bloomRandom() * Math.PI * 2;
      const radius = Math.sqrt(bloomRandom()) * 0.25;
      offset = [Math.cos(angle) * radius, bloomRandom() * 0.07, Math.sin(angle) * radius];
    }
    flowers.push({
      position: [center[0] + offset[0], center[1] + offset[1], center[2] + offset[2]],
      rotation: [bloomRandom() * Math.PI, bloomRandom() * Math.PI, local * Math.PI],
      scale:
        profile.bloom.form === "panicle"
          ? 0.055 + bloomRandom() * 0.035
          : 0.045 + bloomRandom() * 0.03,
      shade: bloomRandom(),
    });
  }

  if (profile.fruit) {
    for (let index = 0; index < profile.fruit.count; index += 1) {
      const center = centers[index % centers.length];
      const angle = random() * Math.PI * 2;
      const radius = random() * 0.19;
      fruit.push({
        position: [
          center[0] + Math.cos(angle) * radius,
          center[1] - 0.08 - random() * 0.16,
          center[2] + Math.sin(angle) * radius,
        ],
        rotation: [0, 0, 0],
        scale: 0.04 + random() * 0.025,
        shade: random(),
      });
    }
  }

  return { branches, leaves, flowers, fruit };
};

const clampRange = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function BranchMesh({
  branch,
  color,
  opacity = 1,
}: {
  branch: Branch;
  color: string;
  opacity?: number;
}) {
  const transform = useMemo(() => {
    const start = new THREE.Vector3(...branch.start);
    const end = new THREE.Vector3(...branch.end);
    const direction = end.clone().sub(start);
    const midpoint = start.clone().add(end).multiplyScalar(0.5);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize(),
    );
    return { midpoint, quaternion, length: direction.length() };
  }, [branch]);

  return (
    <mesh
      position={transform.midpoint}
      quaternion={transform.quaternion}
      castShadow={opacity > 0.25}
    >
      <cylinderGeometry
        args={[branch.radius * 0.72, branch.radius, transform.length, 10]}
      />
      <meshPhysicalMaterial
        color={color}
        transparent={opacity < 1}
        opacity={opacity}
        roughness={0.74}
        clearcoat={0.08}
        clearcoatRoughness={0.82}
      />
    </mesh>
  );
}

const photoStageIndex: Record<PhotoStage, number> = {
  winter: 0,
  leafout: 1,
  bloom: 2,
  summer: 3,
  fall: 4,
};

const photoStages: PhotoStage[] = [
  "winter",
  "leafout",
  "bloom",
  "summer",
  "fall",
];

const seasonalAssetPaths = (
  profile: PlantProfile,
  visualStyle: VisualStyle,
) =>
  photoStages.map((stage) =>
    visualStyle === "editorial"
      ? `/textures/hand-drawn-page/${profile.id}-${stage}.png`
      : profile.assets[stage],
  );

const photoKeyframes = (profile: PlantProfile): { day: number; stage: PhotoStage }[] => {
  if (profile.evergreen) {
    return [
      { day: 1, stage: "winter" },
      { day: 90, stage: "winter" },
      { day: 112, stage: "leafout" },
      { day: profile.bloom.window[0], stage: "bloom" },
      { day: profile.bloom.window[1], stage: "bloom" },
      { day: 175, stage: "summer" },
      { day: profile.leaf.fallWindow[0], stage: "summer" },
      { day: profile.leaf.fallWindow[1], stage: "fall" },
      { day: 348, stage: "winter" },
      { day: 365, stage: "winter" },
    ];
  }

  const emergeStart = Math.max(72, profile.leaf.emerge[0] - 12);
  const bloomStart = profile.bloom.window[0];
  const bloomEnd = profile.bloom.window[1];
  const fallStart = profile.leaf.fallWindow[0];
  const fallEnd = Math.min(profile.leaf.drop[1] - 4, profile.leaf.fallWindow[1]);
  const earlyWinterBoundary =
    profile.winterDisplay.windows.find(([start]) => start === 1)?.[1] ?? emergeStart;
  const lateWinterBoundary =
    profile.winterDisplay.windows.find(([, end]) => end === 365)?.[0] ?? fallEnd;
  const bloomStageEnd = Math.max(
    bloomStart + 12,
    Math.min(bloomEnd, fallStart - 20),
  );
  const bloomFull = Math.min(
    bloomStageEnd,
    bloomStart + Math.min(18, Math.max(9, (bloomStageEnd - bloomStart) * 0.3)),
  );
  const summerStart = Math.min(
    fallStart - 8,
    Math.max(bloomStageEnd, profile.fruit?.window[0] ?? bloomStageEnd + 18),
  );
  const fruitEndsBeforeFall = Boolean(
    profile.fruit && profile.fruit.window[1] < fallStart - 4,
  );
  const fruitEndsDuringFall = Boolean(
    profile.fruit &&
      profile.fruit.window[1] >= fallStart - 4 &&
      profile.fruit.window[1] < lateWinterBoundary,
  );
  const preBloomStage: PhotoStage =
    bloomStart < profile.leaf.emerge[1] && profile.winterDisplay.kind === "structure"
      ? "winter"
      : "leafout";

  const keyframes: { day: number; stage: PhotoStage }[] = [
    { day: 1, stage: "winter" },
    { day: earlyWinterBoundary, stage: "winter" },
    { day: Math.min(profile.leaf.emerge[1], bloomStart), stage: "leafout" },
    { day: bloomStart, stage: preBloomStage },
    { day: bloomFull, stage: "bloom" },
    { day: bloomStageEnd, stage: "bloom" },
    { day: summerStart, stage: "summer" },
  ];
  if (fruitEndsBeforeFall && profile.fruit) {
    keyframes.push(
      { day: profile.fruit.window[1], stage: "summer" },
      {
        day: Math.min(fallStart - 4, profile.fruit.window[1] + 14),
        stage: "leafout",
      },
    );
  }
  keyframes.push(
    { day: fallStart, stage: fruitEndsBeforeFall ? "leafout" : "summer" },
  );
  if (fruitEndsDuringFall && profile.fruit) {
    keyframes.push({ day: profile.fruit.window[1], stage: "fall" });
  }
  keyframes.push(
    { day: lateWinterBoundary, stage: "fall" },
    { day: profile.leaf.drop[1], stage: "winter" },
    { day: 365, stage: "winter" },
  );
  return keyframes.sort((a, b) => a.day - b.day);
};

const photographicWeights = (profile: PlantProfile, day: number) => {
  const weights = [0, 0, 0, 0, 0];
  const keyframes = photoKeyframes(profile);
  const nextIndex = keyframes.findIndex((keyframe) => day <= keyframe.day);
  if (nextIndex <= 0) {
    weights[photoStageIndex[keyframes[0].stage]] = 1;
    return weights;
  }
  const previous = keyframes[nextIndex - 1];
  const next = keyframes[nextIndex];
  const progress = smoothstep(previous.day, next.day, day);
  weights[photoStageIndex[previous.stage]] += 1 - progress;
  weights[photoStageIndex[next.stage]] += progress;
  return weights;
};

function SeasonalBillboardCanopy({
  profile,
  day,
  visualStyle,
  viewId,
  opacity = 1,
}: {
  profile: PlantProfile;
  day: number;
  visualStyle: VisualStyle;
  viewId: GardenViewId;
  opacity?: number;
}) {
  const stagePaths = seasonalAssetPaths(profile, visualStyle);
  const textures = useTexture(stagePaths.map(assetPath)) as THREE.Texture[];
  const weights = photographicWeights(profile, day);
  const height = profile.photoHeight;
  const editorial = visualStyle === "editorial";
  const geometry = useMemo(() => {
    if (editorial) {
      return new THREE.PlaneGeometry(1, 1);
    }
    const canopy = new THREE.PlaneGeometry(1, 1, 32, 32);
    const positions = canopy.attributes.position;
    for (let index = 0; index < positions.count; index += 1) {
      const x = positions.getX(index) / 0.5;
      const y = positions.getY(index) / 0.5;
      positions.setZ(index, 0.045 * (1 - y * y) - 0.2 * x * x);
    }
    positions.needsUpdate = true;
    canopy.computeVertexNormals();
    return canopy;
  }, [editorial]);
  const uniforms = useMemo(
    () => ({
      uWinter: { value: textures[0] },
      uLeafout: { value: textures[1] },
      uBloom: { value: textures[2] },
      uSummer: { value: textures[3] },
      uFall: { value: textures[4] },
      uWeights: { value: new THREE.Vector4() },
      uExtraWeights: { value: new THREE.Vector4() },
      uOpacity: { value: 1 },
      uSaturation: {
        value:
          profile.id === "dogwood" && visualStyle === "photographic" ? 0.38 : 0.9,
      },
      uBrightness: {
        value:
          profile.id === "dogwood" && visualStyle === "photographic" ? 0.8 : 1,
      },
      uEditorial: { value: editorial ? 1 : 0 },
      uPlanMode: { value: 0 },
    }),
    [editorial, profile.id, textures, visualStyle],
  );
  uniforms.uWeights.value.set(
    weights[0],
    weights[1],
    weights[2],
    weights[3],
  );
  uniforms.uExtraWeights.value.set(weights[4], 0, 0, 0);
  uniforms.uOpacity.value = opacity;

  textures.forEach((texture) => {
    texture.colorSpace = editorial ? THREE.NoColorSpace : THREE.SRGBColorSpace;
    texture.premultiplyAlpha = false;
    if (editorial) {
      texture.anisotropy = 1;
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
    } else {
      texture.anisotropy = 12;
    }
  });

  uniforms.uPlanMode.value = editorial && viewId === "planting-plan" ? 1 : 0;
  const billboardY = height * 0.31;
  const editorialFragment = `
          uniform sampler2D uWinter;
          uniform sampler2D uLeafout;
          uniform sampler2D uBloom;
          uniform sampler2D uSummer;
          uniform sampler2D uFall;
          uniform vec4 uWeights;
          uniform vec4 uExtraWeights;
          uniform float uOpacity;
          uniform float uPlanMode;
          varying vec2 vUv;
          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }
          void main() {
            vec2 uv = vUv;
            vec4 winter = texture2D(uWinter, uv);
            vec4 leafout = texture2D(uLeafout, uv);
            vec4 bloom = texture2D(uBloom, uv);
            vec4 summer = texture2D(uSummer, uv);
            vec4 fall = texture2D(uFall, uv);
            float sourceAlpha = winter.a * uWeights.x + leafout.a * uWeights.y + bloom.a * uWeights.z + summer.a * uWeights.w + fall.a * uExtraWeights.x;
            float n1 = hash(vUv * vec2(37.0, 19.0));
            float n2 = hash(vUv * vec2(91.0, 53.0) + 2.7);
            float atFoot = 1.0 - smoothstep(0.04, 0.22, vUv.y);
            float alphaGate = mix(0.035, 0.11, 1.0 - atFoot);
            if (sourceAlpha < alphaGate) discard;
            vec3 premul =
              winter.rgb * uWeights.x +
              leafout.rgb * uWeights.y +
              bloom.rgb * uWeights.z +
              summer.rgb * uWeights.w +
              fall.rgb * uExtraWeights.x;
            vec3 color = premul / max(sourceAlpha, 0.001);
            vec3 paper = vec3(0.9529, 0.9333, 0.8863);
            float paperDist = length(color - paper);
            float luma = dot(color, vec3(0.299, 0.587, 0.114));
            float chroma = max(max(color.r, color.g), color.b) - min(min(color.r, color.g), color.b);
            if (atFoot < 0.35) {
              if (paperDist < 0.12 && chroma < 0.08) discard;
              if (luma > 0.93 && chroma < 0.07) discard;
              if (sourceAlpha < 0.82 && paperDist < 0.2) discard;
            }
            float broken = 0.006 + 0.02 * n1 + 0.01 * sin(vUv.x * 29.0 + n2 * 6.2831);
            if (vUv.y < broken) discard;
            float nibble = 0.12 + 0.08 * hash(vUv * vec2(64.0, 81.0));
            if (atFoot < 0.35 && sourceAlpha < nibble && paperDist < 0.22 && chroma < 0.08) discard;
            float intoPage = mix(0.55 + 0.45 * smoothstep(broken, broken + 0.05, vUv.y), 1.0, 1.0 - atFoot);
            float alpha = sourceAlpha * intoPage * uOpacity;
            if (alpha < 0.04) discard;
            gl_FragColor = vec4(color * alpha, alpha);
          }
          `;

  const canopyMaterial = (
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={`
          varying vec2 vUv;
          varying vec3 vNormal;
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
          `}
          fragmentShader={
            editorial
              ? editorialFragment
              : `
          uniform sampler2D uWinter;
          uniform sampler2D uLeafout;
          uniform sampler2D uBloom;
          uniform sampler2D uSummer;
          uniform sampler2D uFall;
          uniform vec4 uWeights;
          uniform vec4 uExtraWeights;
          uniform float uOpacity;
          uniform float uSaturation;
          uniform float uBrightness;
          uniform float uEditorial;
          varying vec2 vUv;
          varying vec3 vNormal;
          void main() {
            vec4 winter = texture2D(uWinter, vUv);
            vec4 leafout = texture2D(uLeafout, vUv);
            vec4 bloom = texture2D(uBloom, vUv);
            vec4 summer = texture2D(uSummer, vUv);
            vec4 fall = texture2D(uFall, vUv);
            float sourceAlpha = winter.a * uWeights.x + leafout.a * uWeights.y + bloom.a * uWeights.z + summer.a * uWeights.w + fall.a * uExtraWeights.x;
            if (sourceAlpha < 0.072) discard;
            float alpha = smoothstep(0.072, 0.19, sourceAlpha) * uOpacity;
            float groundFeather = smoothstep(0.18, 0.32, vUv.y);
            alpha *= groundFeather * groundFeather;
            if (alpha < 0.035) discard;
            vec3 premultiplied =
              winter.rgb * winter.a * uWeights.x +
              leafout.rgb * leafout.a * uWeights.y +
              bloom.rgb * bloom.a * uWeights.z +
              summer.rgb * summer.a * uWeights.w +
              fall.rgb * fall.a * uExtraWeights.x;
            vec3 color = premultiplied / max(sourceAlpha, 0.001);
            float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
            float dormant = clamp(uWeights.x, 0.0, 1.0);
            float seasonalSaturation = mix(uSaturation, min(uSaturation, 0.58), dormant);
            color = mix(vec3(luminance), color, seasonalSaturation);
            color = clamp((color - 0.5) * 1.045 + 0.5, 0.0, 1.0);
            color *= mix(1.0, 0.86, dormant) * uBrightness;
            float diffuse = 0.95 + 0.07 * max(dot(normalize(vNormal), normalize(vec3(-0.35, 0.72, 0.6))), 0.0);
            gl_FragColor = vec4(color * diffuse, alpha);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
          `
          }
          transparent
          depthWrite={!editorial}
          side={THREE.DoubleSide}
          toneMapped={!editorial}
          premultipliedAlpha={editorial}
          blending={editorial ? THREE.CustomBlending : THREE.NormalBlending}
          blendSrc={editorial ? THREE.OneFactor : THREE.SrcAlphaFactor}
          blendDst={THREE.OneMinusSrcAlphaFactor}
        />
  );

  const canopyMesh = (
      <mesh
        geometry={geometry}
        scale={[height, height, editorial ? 1 : height]}
        position={editorial ? [0, height * 0.46, 0] : [0, 0, 0]}
      >
        {canopyMaterial}
      </mesh>
  );

  if (editorial) {
    return canopyMesh;
  }

  return (
    <Billboard follow lockX lockZ position={[0, billboardY, 0]}>
      {canopyMesh}
    </Billboard>
  );
}

function GroundingShadow({
  profile,
  visualStyle,
}: {
  profile: PlantProfile;
  visualStyle: VisualStyle;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 192;
    canvas.height = 96;
    const context = canvas.getContext("2d");
    if (context) {
      const gradient = context.createRadialGradient(96, 48, 2, 96, 48, 92);
      gradient.addColorStop(0, "rgba(37, 32, 25, 0.31)");
      gradient.addColorStop(0.42, "rgba(37, 32, 25, 0.13)");
      gradient.addColorStop(1, "rgba(37, 32, 25, 0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 192, 96);
    }
    const shadow = new THREE.CanvasTexture(canvas);
    shadow.colorSpace = THREE.SRGBColorSpace;
    return shadow;
  }, []);
  const height = profile.photoHeight;
  if (visualStyle === "editorial") return null;

  return (
    <mesh
      position={[0, 0.018, 0]}
      rotation={[-Math.PI / 2, 0, 0.72]}
      scale={[height * 0.96, height * 0.34, 1]}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.42}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function SelectionWash({ profile }: { profile: PlantProfile }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 80;
    const context = canvas.getContext("2d");
    if (context) {
      const gradient = context.createRadialGradient(80, 40, 1, 80, 40, 76);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.74)");
      gradient.addColorStop(0.48, "rgba(255, 255, 255, 0.22)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 160, 80);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);
  const height = profile.photoHeight;

  return (
    <mesh
      position={[0, 0.02, 0]}
      rotation={[-Math.PI / 2, 0, 0.72]}
      scale={[height * 0.92, height * 0.34, 1]}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        color={profile.accent}
        transparent
        opacity={0.16}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

const makeCurvedPlaneGeometry = () => {
  const geometry = new THREE.PlaneGeometry(1, 1, 7, 7);
  const positions = geometry.attributes.position;
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const arch = Math.sin((y + 0.5) * Math.PI) * 0.065;
    positions.setZ(index, arch + x * 0.025);
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
};

function TexturedLeaves({
  profile,
  particles,
  density,
  fall,
}: {
  profile: PlantProfile;
  particles: Particle[];
  density: number;
  fall: number;
}) {
  const summerTextures = useTexture(
    [1, 2, 3].map((variant) =>
      assetPath(`/textures/${profile.id}-leaf-${variant}.webp`),
    ),
  ) as THREE.Texture[];
  const fallTextures = useTexture(
    [1, 2, 3].map(
      (variant) => assetPath(`/textures/${profile.id}-leaf-${variant}-fall.webp`),
    ),
  ) as THREE.Texture[];
  const geometry = useMemo(() => makeCurvedPlaneGeometry(), []);

  [...summerTextures, ...fallTextures].forEach((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
  });

  const summerOpacity = density * (1 - fall);
  const fallOpacity = density * fall;
  const sizeMultiplier = profile.habit === "broad" ? 2.1 : 2.18;

  return (
    <>
      {summerTextures.map((texture, variant) => (
        <Instances
          key={`summer-${variant}`}
          limit={Math.ceil(particles.length / 3)}
          geometry={geometry}
          castShadow
          receiveShadow
          visible={summerOpacity > 0.015}
        >
          <meshPhysicalMaterial
            map={texture}
            side={THREE.DoubleSide}
            transparent
            opacity={Math.max(0.02, summerOpacity)}
            alphaTest={0.13}
            depthWrite={summerOpacity > 0.32}
            roughness={0.71}
            clearcoat={0.08}
            clearcoatRoughness={0.8}
            sheen={0.3}
            sheenColor={new THREE.Color("#b8d29e")}
            sheenRoughness={0.84}
            transmission={0.025}
            thickness={0.04}
          />
          {particles.map((leaf, index) => {
            if (index % 3 !== variant) return null;
            const size = profile.leaf.size * leaf.scale * sizeMultiplier;
            return (
              <Instance
                key={index}
                position={leaf.position}
                rotation={leaf.rotation}
                scale={[size * (0.92 + leaf.shade * 0.14), size, size]}
              />
            );
          })}
        </Instances>
      ))}
      {fallTextures.map((texture, variant) => (
        <Instances
          key={`fall-${variant}`}
          limit={Math.ceil(particles.length / 3)}
          geometry={geometry}
          castShadow
          receiveShadow
          visible={fallOpacity > 0.015}
        >
          <meshPhysicalMaterial
            map={texture}
            side={THREE.DoubleSide}
            transparent
            opacity={Math.max(0.02, fallOpacity)}
            alphaTest={0.13}
            depthWrite={fallOpacity > 0.62}
            roughness={0.76}
            clearcoat={0.055}
            sheen={0.18}
            polygonOffset
            polygonOffsetFactor={-1}
          />
          {particles.map((leaf, index) => {
            if (index % 3 !== variant) return null;
            const size = profile.leaf.size * leaf.scale * sizeMultiplier;
            return (
              <Instance
                key={index}
                position={leaf.position}
                rotation={leaf.rotation}
                scale={[size * (0.92 + leaf.shade * 0.14), size, size]}
              />
            );
          })}
        </Instances>
      ))}
    </>
  );
}

function TexturedBlooms({
  profile,
  particles,
  bloom,
  persistent,
}: {
  profile: PlantProfile;
  particles: Particle[];
  bloom: number;
  persistent: number;
}) {
  const textureName =
    profile.id === "hydrangea" ? "hydrangea-bloom-clean" : `${profile.id}-bloom`;
  const texture = useTexture(assetPath(`/textures/${textureName}.webp`)) as THREE.Texture;
  const geometry = useMemo(() => makeCurvedPlaneGeometry(), []);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  const opacity = Math.max(bloom, Math.min(1, persistent * 2.2));
  const clusterCount =
    profile.bloom.form === "panicle" ? 14 : profile.bloom.form === "brush" ? 15 : 11;
  const centers = particles.slice(0, clusterCount);
  const scale =
    profile.bloom.form === "panicle"
      ? [0.54, 0.72, 1]
      : profile.bloom.form === "brush"
        ? [0.29, 0.52, 1]
        : [0.48, 0.42, 1];
  const color = persistent > bloom ? "#765f4b" : "#ffffff";

  return (
    <Instances
      limit={centers.length * 2}
      geometry={geometry}
      castShadow
      visible={opacity > 0.015}
    >
      <meshPhysicalMaterial
        map={texture}
        color={color}
        side={THREE.DoubleSide}
        transparent
        opacity={Math.max(0.02, opacity)}
        alphaTest={0.12}
        depthWrite={opacity > 0.5}
        roughness={0.68}
        sheen={0.16}
      />
      {centers.flatMap((flower, index) => {
        const angle = (index / centers.length) * Math.PI * 2;
        return [
          <Instance
            key={`${index}-a`}
            position={flower.position}
            rotation={[0, angle, 0]}
            scale={scale as [number, number, number]}
          />,
          <Instance
            key={`${index}-b`}
            position={flower.position}
            rotation={[0, angle + Math.PI / 2, 0]}
            scale={[
              scale[0] * 0.88,
              scale[1] * 0.92,
              scale[2],
            ] as [number, number, number]}
          />,
        ];
      })}
    </Instances>
  );
}

function TexturedFruit({ particles, opacity }: { particles: Particle[]; opacity: number }) {
  const texture = useTexture(assetPath("/textures/dogwood-fruit.webp")) as THREE.Texture;
  const geometry = useMemo(() => makeCurvedPlaneGeometry(), []);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  const centers = particles.filter((_, index) => index % 8 === 0);
  return (
    <Instances
      limit={centers.length * 2}
      geometry={geometry}
      castShadow
      visible={opacity > 0.015}
    >
      <meshPhysicalMaterial
        map={texture}
        side={THREE.DoubleSide}
        transparent
        opacity={Math.max(0.02, opacity)}
        alphaTest={0.12}
        depthWrite={opacity > 0.42}
        roughness={0.58}
      />
      {centers.flatMap((berry, index) => [
        <Instance
          key={`${index}-a`}
          position={berry.position}
          rotation={[0, index * 0.8, 0]}
          scale={[0.28, 0.31, 1]}
        />,
        <Instance
          key={`${index}-b`}
          position={berry.position}
          rotation={[0, index * 0.8 + Math.PI / 2, 0]}
          scale={[0.25, 0.29, 1]}
        />,
      ])}
    </Instances>
  );
}

function Shrub({
  instance,
  instances,
  instanceSeed,
  day,
  selected,
  onSelect,
  reducedMotion,
  visualStyle,
  viewId,
}: {
  instance: PlantInstance;
  instances: PlantInstance[];
  instanceSeed: number;
  day: number;
  selected: boolean;
  onSelect: () => void;
  reducedMotion: boolean;
  visualStyle: VisualStyle;
  viewId: GardenViewId;
}) {
  const group = useRef<Group>(null);
  const paperPlan = visualStyle === "editorial" && viewId === "planting-plan";
  const planPose = paperPlan ? paperPlanPose(instance, instances) : null;
  const groupPosition: [number, number, number] = planPose
    ? planPose.position
    : instance.position;
  const groupScale = planPose ? planPose.scale : instance.scale;

  useFrame(({ clock }) => {
    if (!group.current || reducedMotion || visualStyle === "editorial") return;
    group.current.rotation.z =
      Math.sin(clock.elapsedTime * 0.42 + seedForPlant(instance.profile.id) + instanceSeed) * 0.0028;
  });

  return (
    <group
      ref={group}
      position={groupPosition}
      scale={groupScale}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onPointerEnter={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerLeave={() => {
        document.body.style.cursor = "default";
      }}
    >
      <GroundingShadow profile={instance.profile} visualStyle={visualStyle} />
      {selected && visualStyle !== "editorial" && <SelectionWash profile={instance.profile} />}
      <SeasonalBillboardCanopy
        profile={instance.profile}
        day={day}
        visualStyle={visualStyle}
        viewId={viewId}
      />
    </group>
  );
}

function SnapshotCamera({
  viewId,
  focus,
  visualStyle,
  instances,
}: {
  viewId: GardenViewId;
  focus?: PlantInstance;
  visualStyle: VisualStyle;
  instances: PlantInstance[];
}) {
  const size = useThree((state) => state.size);
  const set = useThree((state) => state.set);
  const photoCamera = useRef<THREE.PerspectiveCamera>(null);
  const editorial = visualStyle === "editorial";
  const planBounds = useMemo(
    () =>
      editorial && viewId === "planting-plan" && instances.length
        ? paperPlanBounds(instances)
        : null,
    [editorial, instances, viewId],
  );
  const preset = useMemo(() => {
    if (editorial) {
      if (viewId === "planting-plan") {
        const cx = planBounds?.cx ?? 0.08;
        const cy = (planBounds?.cy ?? 0.12) + 0.06;
        return {
          position: [cx, cy, 8] as [number, number, number],
          target: [cx, cy, 0] as [number, number, number],
          halfH: 1.15,
          spanX: planBounds?.spanX ?? 2.4,
          spanY: planBounds?.spanY ?? 1.6,
        };
      }
      if (viewId === "seasonal-detail" && focus) {
        const [x] = focus.position;
        const focusHeight = Math.min(1.55, focus.profile.photoHeight * focus.scale * 0.52);
        return {
          position: [x, focusHeight, 8] as [number, number, number],
          target: [x, focusHeight, 0] as [number, number, number],
          halfH: 1.38,
        };
      }
      if (viewId === "front-elevation") {
        return {
          position: [0.02, 1.12, 8] as [number, number, number],
          target: [0, 1.12, 0] as [number, number, number],
          halfH: 1.82,
        };
      }
      return {
        position: [0.48, 1.08, 8] as [number, number, number],
        target: [0.48, 1.08, 0] as [number, number, number],
        halfH: 1.72,
      };
    }
    const base = cameraPresets[viewId];
    if (viewId !== "seasonal-detail" || !focus) {
      return { ...base, halfH: 0 };
    }
    const [x, , z] = focus.position;
    const focusHeight = Math.min(1.72, focus.profile.photoHeight * focus.scale * 0.48);
    return {
      position: [x + 2.25, focusHeight + 0.78, z + 2.95] as [number, number, number],
      target: [x, focusHeight, z] as [number, number, number],
      fov: base.fov,
      halfH: 0,
    };
  }, [editorial, focus, planBounds, viewId]);
  const target = useMemo(() => new THREE.Vector3(...preset.target), [preset]);
  const orthoCamera = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 40), []);
  const aspect = size.width / Math.max(size.height, 1);
  const halfH = (() => {
    if (planBounds && "spanX" in preset) {
      const pad = 1.02;
      const neededW = (planBounds.spanX / 2) * pad;
      const neededH = (planBounds.spanY / 2) * pad;
      return neededW / neededH > aspect ? neededH : neededW / aspect;
    }
    return preset.halfH || 1.8;
  })();
  const halfW = halfH * aspect;

  useLayoutEffect(() => {
    if (!editorial) return;
    orthoCamera.left = -halfW;
    orthoCamera.right = halfW;
    orthoCamera.top = halfH;
    orthoCamera.bottom = -halfH;
    orthoCamera.position.set(...preset.position);
    orthoCamera.lookAt(target);
    orthoCamera.updateProjectionMatrix();
    set({ camera: orthoCamera });
  }, [editorial, halfH, halfW, orthoCamera, preset.position, set, target]);

  if (editorial) {
    return <primitive object={orthoCamera} />;
  }

  return (
    <PerspectiveCamera
      ref={photoCamera}
      makeDefault
      position={preset.position}
      fov={"fov" in preset ? (preset.fov as number) : cameraPresets[viewId].fov}
      onUpdate={(activeCamera) => activeCamera.lookAt(target)}
    />
  );
}

function SharedPageGround({
  instances,
  viewId,
}: {
  instances: PlantInstance[];
  viewId: GardenViewId;
}) {
  const paperPlan = viewId === "planting-plan";
  const texture = useMemo(() => {
    const width = 1024;
    const height = 256;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (context) {
      const random = mulberry32(77129);
      context.clearRect(0, 0, width, height);
      for (let blob = 0; blob < 14; blob += 1) {
        const cx = width * (0.12 + random() * 0.76);
        const cy = height * (0.5 + (random() - 0.5) * 0.18);
        const rx = width * (0.22 + random() * 0.28);
        const ry = height * (0.32 + random() * 0.2);
        const gradient = context.createRadialGradient(cx, cy, 6, cx, cy, rx);
        const alpha = 0.04 + random() * 0.06;
        gradient.addColorStop(0, `rgba(138, 142, 112, ${alpha})`);
        gradient.addColorStop(0.62, `rgba(150, 144, 120, ${alpha * 0.4})`);
        gradient.addColorStop(1, "rgba(150, 144, 120, 0)");
        context.fillStyle = gradient;
        context.beginPath();
        context.ellipse(cx, cy, rx, ry, (random() - 0.5) * 0.25, 0, Math.PI * 2);
        context.fill();
      }
      for (let index = 0; index < 5200; index += 1) {
        const x = random() * width;
        const y = height * (0.22 + random() * 0.56);
        const radius = 0.25 + random() * 1.2;
        const ink = 78 + random() * 32;
        context.fillStyle = `rgba(${ink + random() * 14}, ${ink + 8 + random() * 12}, ${ink - 8 + random() * 10}, ${0.04 + random() * 0.13})`;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }
    }
    const wash = new THREE.CanvasTexture(canvas);
    wash.colorSpace = THREE.NoColorSpace;
    return wash;
  }, []);
  const uniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uOpacity: { value: 0.72 },
    }),
    [texture],
  );

  const layout = useMemo(() => {
    if (paperPlan && instances.length) {
      const bounds = paperPlanBounds(instances);
      return {
        position: [bounds.cx, bounds.cy + 0.04, -0.25] as [number, number, number],
        scale: [bounds.spanX + 0.55, bounds.spanY + 0.7, 1] as [number, number, number],
      };
    }
    const xs = instances.map((instance) => instance.position[0]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const cx = (minX + maxX) / 2;
    const span = Math.max(3.6, maxX - minX + 1.9);
    return {
      position: [cx, 0.24, -0.4] as [number, number, number],
      scale: [span, 0.92, 1] as [number, number, number],
    };
  }, [instances, paperPlan]);

  return (
    <mesh position={layout.position} scale={layout.scale} renderOrder={-1}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        transparent
        depthWrite={false}
        toneMapped={false}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform sampler2D uMap;
          uniform float uOpacity;
          varying vec2 vUv;
          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }
          void main() {
            vec4 tex = texture2D(uMap, vUv);
            float nx = vUv.x * 2.0 - 1.0;
            float ny = vUv.y * 2.0 - 1.0;
            float n = hash(vUv * vec2(37.0, 19.0));
            float n2 = hash(vUv * vec2(91.0, 53.0) + 3.1);
            float blob = 1.0 - (nx * nx * 0.62 + ny * ny * 1.55);
            blob -= 0.1 * n + 0.06 * sin(vUv.x * 18.0 + n2 * 6.0);
            if (blob < 0.04) discard;
            float mask = smoothstep(0.04, 0.3, blob);
            float alpha = max(tex.a, 0.18) * mask * uOpacity;
            if (alpha < 0.03) discard;
            vec3 color = mix(vec3(0.545, 0.557, 0.439), tex.rgb, 0.55);
            gl_FragColor = vec4(color * alpha, alpha);
          }
        `}
        premultipliedAlpha
        blending={THREE.CustomBlending}
        blendSrc={THREE.OneFactor}
        blendDst={THREE.OneMinusSrcAlphaFactor}
      />
    </mesh>
  );
}

function PlantingBed() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    if (context) {
      const gradient = context.createRadialGradient(128, 128, 12, 128, 128, 126);
      gradient.addColorStop(0, "rgba(93, 81, 65, 0.48)");
      gradient.addColorStop(0.58, "rgba(105, 92, 73, 0.3)");
      gradient.addColorStop(0.82, "rgba(113, 101, 83, 0.11)");
      gradient.addColorStop(1, "rgba(113, 101, 83, 0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 256, 256);
    }
    const bed = new THREE.CanvasTexture(canvas);
    bed.colorSpace = THREE.SRGBColorSpace;
    return bed;
  }, []);

  return (
    <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[9.2, 5.1]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.72}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function Ground({ day, visualStyle }: { day: number; visualStyle: VisualStyle }) {
  if (visualStyle === "editorial") return null;
  const winter = day < 85 || day > 335;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[96, 96]} />
        <meshPhysicalMaterial
          color={winter ? "#d8d4ca" : "#d1d4c6"}
          roughness={1}
          clearcoat={0}
        />
      </mesh>
      <PlantingBed />
    </group>
  );
}

function Scene({
  day,
  selectedId,
  onSelect,
  reducedMotion,
  instances,
  viewId,
  visualStyle,
  primary = false,
  onReady,
}: GardenSceneProps) {
  const seasonalWarmth =
    (1 + Math.cos(((day - 188) / 365) * Math.PI * 2)) / 2;
  const editorial = visualStyle === "editorial";
  const winter = day < 85 || day > 335;
  const sky = new THREE.Color(winter ? "#d8d4ca" : "#d1d4c6");
  const haze = sky.clone();
  const focus = instances.find((instance) => instance.profile.id === selectedId) ?? instances[0];

  const visibleInstances =
    editorial && viewId === "seasonal-detail"
      ? instances.filter((instance) => instance.profile.id === selectedId)
      : instances;

  return (
    <>
      {!editorial && <color attach="background" args={[sky]} />}
      {!editorial && <fog attach="fog" args={[haze, 13.5, 27]} />}
      <SnapshotCamera
        viewId={viewId}
        focus={focus}
        visualStyle={visualStyle}
        instances={visibleInstances}
      />
      {editorial ? null : (
        <>
          <hemisphereLight
            args={["#fffaf0", "#9d9b8d", 1.3 + seasonalWarmth * 0.12]}
          />
          <directionalLight
            position={[-4.5, 7.8, 5.2]}
            color={seasonalWarmth > 0.4 ? "#fff2dc" : "#eef0ec"}
            intensity={1.62}
          />
        </>
      )}
      <Ground day={day} visualStyle={visualStyle} />
      {editorial ? <SharedPageGround instances={visibleInstances} viewId={viewId} /> : null}
      {visibleInstances.map((instance, index) => (
        <Shrub
          key={instance.instanceId}
          instance={instance}
          instances={visibleInstances}
          instanceSeed={index * 1.73}
          day={day}
          selected={selectedId === instance.profile.id}
          onSelect={() => onSelect(instance.profile.id)}
          reducedMotion={reducedMotion}
          visualStyle={visualStyle}
          viewId={viewId}
        />
      ))}
      <SceneReady onReady={onReady} />
    </>
  );
}

function SceneReady({ onReady }: { onReady?: () => void }) {
  useLayoutEffect(() => {
    onReady?.();
  }, [onReady]);
  return <group visible={false} />;
}

export default function GardenScene(props: GardenSceneProps) {
  const editorial = props.visualStyle === "editorial";
  return (
    <Canvas
      className="garden-canvas"
      shadows={!editorial}
      orthographic={editorial}
      frameloop="demand"
      dpr={editorial ? 2 : props.primary ? [1, 1.5] : [0.8, 1.15]}
      gl={{
        antialias: !editorial,
        alpha: editorial,
        premultipliedAlpha: editorial,
        toneMapping: editorial
          ? THREE.NoToneMapping
          : THREE.ACESFilmicToneMapping,
        toneMappingExposure: editorial ? 1 : 1.02,
        powerPreference: "high-performance",
      }}
      onCreated={
        editorial
          ? ({ gl, scene }) => {
              gl.setClearColor(0x000000, 0);
              gl.outputColorSpace = THREE.LinearSRGBColorSpace;
              scene.background = null;
            }
          : undefined
      }
      fallback={
        <div className="canvas-fallback">
          <p>3D view unavailable.</p>
          <p>The seasonal plant timeline remains available below.</p>
        </div>
      }
    >
      <Suspense fallback={null}>
        <Scene {...props} />
      </Suspense>
    </Canvas>
  );
}
