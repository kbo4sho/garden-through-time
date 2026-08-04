import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Billboard,
  Instance,
  Instances,
  OrbitControls,
  PerspectiveCamera,
  SoftShadows,
  useTexture,
} from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import type { Group } from "three";
import type { PlantId, PlantProfile } from "../data/plants";
import { mulberry32, plantState, smoothstep } from "../lib/season";

type GardenSceneProps = {
  day: number;
  selectedId: PlantId;
  onSelect: (id: PlantId) => void;
  reducedMotion: boolean;
  profiles: PlantProfile[];
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

const seedByPlant: Record<PlantId, number> = {
  fothergilla: 8172,
  hydrangea: 31993,
  dogwood: 50261,
};

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
  const random = mulberry32(seedByPlant[profile.id]);
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
  const bloomRandom = mulberry32(seedByPlant[profile.id] + 991);
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

const photoHeightByPlant: Record<PlantId, number> = {
  fothergilla: 2.55,
  hydrangea: 2.72,
  dogwood: 3.05,
};

type PhotoStage = "winter" | "leafout" | "bloom" | "summer" | "fall";

const photoStageIndex: Record<PhotoStage, number> = {
  winter: 0,
  leafout: 1,
  bloom: 2,
  summer: 3,
  fall: 4,
};

const photoKeyframes: Record<PlantId, { day: number; stage: PhotoStage }[]> = {
  fothergilla: [
    { day: 1, stage: "winter" },
    { day: 94, stage: "winter" },
    { day: 111, stage: "bloom" },
    { day: 145, stage: "bloom" },
    { day: 165, stage: "summer" },
    { day: 255, stage: "summer" },
    { day: 286, stage: "fall" },
    { day: 310, stage: "fall" },
    { day: 325, stage: "winter" },
    { day: 365, stage: "winter" },
  ],
  hydrangea: [
    { day: 1, stage: "winter" },
    { day: 92, stage: "winter" },
    { day: 112, stage: "leafout" },
    { day: 150, stage: "leafout" },
    { day: 178, stage: "bloom" },
    { day: 242, stage: "bloom" },
    { day: 258, stage: "summer" },
    { day: 262, stage: "summer" },
    { day: 290, stage: "fall" },
    { day: 315, stage: "fall" },
    { day: 332, stage: "winter" },
    { day: 365, stage: "winter" },
  ],
  dogwood: [
    { day: 1, stage: "winter" },
    { day: 92, stage: "winter" },
    { day: 112, stage: "leafout" },
    { day: 135, stage: "leafout" },
    { day: 145, stage: "bloom" },
    { day: 170, stage: "bloom" },
    { day: 190, stage: "leafout" },
    { day: 198, stage: "leafout" },
    { day: 220, stage: "summer" },
    { day: 255, stage: "summer" },
    { day: 282, stage: "fall" },
    { day: 300, stage: "fall" },
    { day: 318, stage: "winter" },
    { day: 365, stage: "winter" },
  ],
};

const photographicWeights = (profile: PlantProfile, day: number) => {
  const weights = [0, 0, 0, 0, 0];
  const keyframes = photoKeyframes[profile.id];
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

function PhotographicCanopy({ profile, day }: { profile: PlantProfile; day: number }) {
  const stagePaths: Record<PlantId, string[]> = {
    fothergilla: [
      "/textures/fothergilla-winter.webp",
      "/textures/fothergilla-summer.webp",
      "/textures/fothergilla-spring.webp",
      "/textures/fothergilla-summer.webp",
      "/textures/fothergilla-fall.webp",
    ],
    hydrangea: [
      "/textures/hydrangea-winter.webp",
      "/textures/hydrangea-spring.webp",
      "/textures/hydrangea-summer.webp",
      "/textures/hydrangea-summer.webp",
      "/textures/hydrangea-fall.webp",
    ],
    dogwood: [
      "/textures/dogwood-winter.webp",
      "/textures/dogwood-leafout.webp",
      "/textures/dogwood-spring.webp",
      "/textures/dogwood-summer.webp",
      "/textures/dogwood-fall.webp",
    ],
  };
  const textures = useTexture(stagePaths[profile.id]) as THREE.Texture[];
  const weights = photographicWeights(profile, day);
  const height = photoHeightByPlant[profile.id];
  const geometry = useMemo(() => {
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
  }, []);
  const uniforms = useMemo(
    () => ({
      uWinter: { value: textures[0] },
      uLeafout: { value: textures[1] },
      uBloom: { value: textures[2] },
      uSummer: { value: textures[3] },
      uFall: { value: textures[4] },
      uWeights: { value: new THREE.Vector4() },
      uExtraWeights: { value: new THREE.Vector4() },
    }),
    [textures],
  );
  uniforms.uWeights.value.set(
    weights[0],
    weights[1],
    weights[2],
    weights[3],
  );
  uniforms.uExtraWeights.value.set(weights[4], 0, 0, 0);

  textures.forEach((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 12;
  });

  return (
    <Billboard follow lockX lockZ position={[0, height * 0.425, 0]}>
      <mesh geometry={geometry} scale={[height, height, height]}>
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
          fragmentShader={`
          uniform sampler2D uWinter;
          uniform sampler2D uLeafout;
          uniform sampler2D uBloom;
          uniform sampler2D uSummer;
          uniform sampler2D uFall;
          uniform vec4 uWeights;
          uniform vec4 uExtraWeights;
          varying vec2 vUv;
          varying vec3 vNormal;
          void main() {
            vec4 winter = texture2D(uWinter, vUv);
            vec4 leafout = texture2D(uLeafout, vUv);
            vec4 bloom = texture2D(uBloom, vUv);
            vec4 summer = texture2D(uSummer, vUv);
            vec4 fall = texture2D(uFall, vUv);
            float alpha = winter.a * uWeights.x + leafout.a * uWeights.y + bloom.a * uWeights.z + summer.a * uWeights.w + fall.a * uExtraWeights.x;
            if (alpha < 0.055) discard;
            vec3 premultiplied =
              winter.rgb * winter.a * uWeights.x +
              leafout.rgb * leafout.a * uWeights.y +
              bloom.rgb * bloom.a * uWeights.z +
              summer.rgb * summer.a * uWeights.w +
              fall.rgb * fall.a * uExtraWeights.x;
            vec3 color = premultiplied / max(alpha, 0.001);
            float diffuse = 0.82 + 0.18 * max(dot(normalize(vNormal), normalize(vec3(-0.35, 0.72, 0.6))), 0.0);
            gl_FragColor = vec4(color * diffuse, alpha);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
          `}
          transparent
          depthWrite
          side={THREE.DoubleSide}
          toneMapped
        />
      </mesh>
    </Billboard>
  );
}

function GroundingShadow({ profile }: { profile: PlantProfile }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 192;
    canvas.height = 96;
    const context = canvas.getContext("2d");
    if (context) {
      const gradient = context.createRadialGradient(96, 48, 2, 96, 48, 92);
      gradient.addColorStop(0, "rgba(8, 14, 9, 0.68)");
      gradient.addColorStop(0.42, "rgba(8, 14, 9, 0.34)");
      gradient.addColorStop(1, "rgba(8, 14, 9, 0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 192, 96);
    }
    const shadow = new THREE.CanvasTexture(canvas);
    shadow.colorSpace = THREE.SRGBColorSpace;
    return shadow;
  }, []);
  const height = photoHeightByPlant[profile.id];

  return (
    <mesh
      position={[0, 0.018, 0]}
      rotation={[-Math.PI / 2, 0, 0.72]}
      scale={[height * 0.82, height * 0.34, 1]}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.62}
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
    [1, 2, 3].map((variant) => `/textures/${profile.id}-leaf-${variant}.webp`),
  ) as THREE.Texture[];
  const fallTextures = useTexture(
    [1, 2, 3].map(
      (variant) => `/textures/${profile.id}-leaf-${variant}-fall.webp`,
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
  const texture = useTexture(`/textures/${textureName}.webp`) as THREE.Texture;
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
  const texture = useTexture("/textures/dogwood-fruit.webp") as THREE.Texture;
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
  profile,
  day,
  selected,
  onSelect,
  reducedMotion,
}: {
  profile: PlantProfile;
  day: number;
  selected: boolean;
  onSelect: () => void;
  reducedMotion: boolean;
}) {
  const group = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!group.current || reducedMotion) return;
    group.current.rotation.z =
      Math.sin(clock.elapsedTime * 0.42 + seedByPlant[profile.id]) * 0.0028;
  });

  return (
    <group
      ref={group}
      position={profile.position}
      scale={profile.scale}
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
      <GroundingShadow profile={profile} />
      <PhotographicCanopy profile={profile} day={day} />

      {selected && (
        <mesh position={[0, 0.024, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.34, 0.37, 64]} />
          <meshBasicMaterial
            color={profile.accent}
            transparent
            opacity={0.58}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

function Ground({ day }: { day: number }) {
  const winter = day < 85 || day > 335;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[7.5, 160]} />
      <meshPhysicalMaterial
        color={winter ? "#4b5145" : "#465944"}
        roughness={1}
        clearcoat={0.018}
      />
    </mesh>
  );
}

function Scene({ day, selectedId, onSelect, reducedMotion, profiles }: GardenSceneProps) {
  const seasonalWarmth =
    (1 + Math.cos(((day - 188) / 365) * Math.PI * 2)) / 2;
  const sky = new THREE.Color("#aeb9b2").lerp(
    new THREE.Color("#9db59f"),
    seasonalWarmth,
  );
  const haze = new THREE.Color("#69766d").lerp(
    new THREE.Color("#657c67"),
    seasonalWarmth,
  );

  return (
    <>
      <color attach="background" args={[sky]} />
      <fog attach="fog" args={[haze, 8.8, 18]} />
      <PerspectiveCamera makeDefault position={[6.9, 3.65, 7.8]} fov={34} />
      <SoftShadows size={18} samples={12} focus={0.48} />
      <hemisphereLight
        args={["#dbe3d9", "#29352b", 1.7 + seasonalWarmth * 0.3]}
      />
      <directionalLight
        position={[-4.5, 7.8, 5.2]}
        color={seasonalWarmth > 0.4 ? "#fff0cf" : "#e5edf0"}
        intensity={2.25}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={18}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-4}
      />
      <Ground day={day} />
      {profiles.map((plant) => (
        <Shrub
          key={plant.id}
          profile={plant}
          day={day}
          selected={selectedId === plant.id}
          onSelect={() => onSelect(plant.id)}
          reducedMotion={reducedMotion}
        />
      ))}
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom
        minDistance={6.5}
        maxDistance={11.5}
        minPolarAngle={Math.PI * 0.27}
        maxPolarAngle={Math.PI * 0.48}
        minAzimuthAngle={0.22}
        maxAzimuthAngle={1.22}
        target={[0, 1.15, 0]}
        dampingFactor={0.045}
        enableDamping
      />
      <EffectComposer multisampling={4}>
        <Bloom luminanceThreshold={0.93} mipmapBlur intensity={0.18} />
        <Vignette eskil={false} offset={0.17} darkness={0.48} />
      </EffectComposer>
    </>
  );
}

export default function GardenScene(props: GardenSceneProps) {
  return (
    <Canvas
      className="garden-canvas"
      shadows
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        alpha: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
        powerPreference: "high-performance",
      }}
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
