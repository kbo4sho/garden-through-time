import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { PlantInstance } from "../data/plants";

/** Soft ambient-life cadence. Stays well below Play's 42ms day tick. */
export const LIFE_FRAME_MS = 90;
export const BIRD_COUNT = 2;
export const BUTTERFLY_COUNT = 3;

function makeBirdGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.62, 0.01);
  shape.quadraticCurveTo(-0.28, 0.08, -0.04, 0.05);
  shape.lineTo(0.1, 0.36);
  shape.quadraticCurveTo(0.16, 0.1, 0.22, 0.04);
  shape.lineTo(0.56, 0.02);
  shape.quadraticCurveTo(0.6, 0, 0.54, -0.03);
  shape.lineTo(0.2, -0.04);
  shape.quadraticCurveTo(0.12, -0.2, 0.04, -0.07);
  shape.lineTo(-0.3, -0.03);
  shape.quadraticCurveTo(-0.5, -0.04, -0.62, 0.01);
  const geometry = new THREE.ShapeGeometry(shape, 3);
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

function makeButterflyGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.02);
  shape.bezierCurveTo(0.12, 0.28, 0.38, 0.26, 0.42, 0.04);
  shape.bezierCurveTo(0.4, -0.16, 0.14, -0.2, 0, -0.04);
  shape.bezierCurveTo(-0.14, -0.2, -0.4, -0.16, -0.42, 0.04);
  shape.bezierCurveTo(-0.38, 0.26, -0.12, 0.28, 0, 0.02);
  const geometry = new THREE.ShapeGeometry(shape, 5);
  geometry.center();
  geometry.rotateX(-0.32);
  geometry.computeVertexNormals();
  return geometry;
}

const skipRaycast = () => undefined;

function birdPose(index: number, time: number, reducedMotion: boolean) {
  const seed = index * 17.13;
  const period = 52 + index * 21;
  const direction = index % 2 === 0 ? 1 : -1;
  const angle = reducedMotion
    ? seed + index
    : (time / period) * Math.PI * 2 * direction + seed;
  const cx = -0.2 + index * 0.55;
  const cy = 2.52 + index * 0.18;
  const cz = 1.45 + index * 0.2;
  const rx = 1.55 + index * 0.2;
  const rz = 0.55 + index * 0.12;
  const x = cx + Math.cos(angle) * rx;
  const z = cz + Math.sin(angle) * rz;
  const y = cy + Math.sin(angle * 2 + seed) * 0.16;
  const tangentX = -Math.sin(angle) * rx * direction;
  const tangentZ = Math.cos(angle) * rz * direction;
  const yaw = Math.atan2(tangentX, tangentZ);
  const bank = Math.sin(angle * 2) * 0.16;
  return {
    position: [x, y, z] as const,
    rotation: [bank * 0.35, yaw, bank] as const,
    scale: 0.3 + index * 0.04,
  };
}

function butterflyPose(
  index: number,
  time: number,
  reducedMotion: boolean,
  anchors: readonly [number, number, number][],
) {
  const anchor = anchors[index % anchors.length] ?? ([0, 1.35, 0] as const);
  const seed = index * 9.27;
  const flap = reducedMotion ? 0.78 : 0.58 + 0.42 * Math.sin(time * (6.4 + index * 0.7) + seed);
  const orbit = reducedMotion ? seed : time * (0.2 + index * 0.045) + seed;
  const radius = 0.22 + (index % 3) * 0.06;
  const x = anchor[0] * 0.45 + Math.cos(orbit) * radius;
  const z = 1.88 + Math.sin(orbit * 1.32) * radius * 0.55;
  const y = 1.58 + index * 0.08 + Math.sin(orbit * 2.05 + seed) * 0.1;
  const size = 0.2;
  return {
    position: [x, y, z] as const,
    rotation: [0.32, orbit + Math.PI / 2, Math.sin(orbit * 2.8) * 0.16] as const,
    scale: [size * flap, size, size] as const,
  };
}

function LifeTicker({ active }: { active: boolean }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    if (!active) return;
    let timer = 0;
    const tick = () => {
      if (document.visibilityState !== "hidden") invalidate();
      timer = window.setTimeout(tick, LIFE_FRAME_MS);
    };
    timer = window.setTimeout(tick, LIFE_FRAME_MS);
    return () => window.clearTimeout(timer);
  }, [active, invalidate]);
  return null;
}

export default function AmbientLife({
  day,
  reducedMotion,
  instances,
}: {
  day: number;
  reducedMotion: boolean;
  instances: PlantInstance[];
}) {
  const birdMesh = useRef<THREE.InstancedMesh>(null);
  const mothMesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const birdGeometry = useMemo(() => makeBirdGeometry(), []);
  const mothGeometry = useMemo(() => makeButterflyGeometry(), []);
  const birdMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#4c463c",
        side: THREE.DoubleSide,
        toneMapped: true,
        transparent: true,
        opacity: 0.82,
        depthWrite: false,
      }),
    [],
  );
  const mothMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#b08948",
        side: THREE.DoubleSide,
        toneMapped: true,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
      }),
    [],
  );
  const anchors = useMemo(() => {
    if (!instances.length) return [[0, 1.35, 0] as [number, number, number]];
    return instances.slice(0, BUTTERFLY_COUNT).map((instance) => {
      const [x, , z] = instance.position;
      const height = instance.profile.photoHeight * instance.scale;
      return [x, height * 0.42, z] as [number, number, number];
    });
  }, [instances]);
  const anchorsRef = useRef(anchors);
  anchorsRef.current = anchors;

  const mothOpacity =
    day < 100 || day > 305 ? 0 : day < 128 || day > 268 ? 0.34 : 0.7;
  const birdOpacity = day < 85 || day > 335 ? 0.58 : 0.82;

  const writePoses = (time: number) => {
    const hold = reducedMotion;
    if (birdMesh.current) {
      for (let index = 0; index < BIRD_COUNT; index += 1) {
        const pose = birdPose(index, time, hold);
        dummy.position.set(...pose.position);
        dummy.rotation.set(...pose.rotation);
        dummy.scale.setScalar(pose.scale);
        dummy.updateMatrix();
        birdMesh.current.setMatrixAt(index, dummy.matrix);
      }
      birdMesh.current.instanceMatrix.needsUpdate = true;
    }
    if (mothMesh.current) {
      for (let index = 0; index < BUTTERFLY_COUNT; index += 1) {
        const pose = butterflyPose(index, time, hold, anchorsRef.current);
        dummy.position.set(...pose.position);
        dummy.lookAt(5.6, 2.8, 7.2);
        dummy.rotateZ(pose.rotation[2]);
        dummy.scale.set(...pose.scale);
        dummy.updateMatrix();
        mothMesh.current.setMatrixAt(index, dummy.matrix);
      }
      mothMesh.current.instanceMatrix.needsUpdate = true;
    }
  };

  useLayoutEffect(() => {
    writePoses(0);
    birdMaterial.opacity = birdOpacity;
    mothMaterial.opacity = mothOpacity;
  }, [birdMaterial, birdOpacity, mothMaterial, mothOpacity, reducedMotion]);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    writePoses(clock.elapsedTime);
  });

  useEffect(
    () => () => {
      birdGeometry.dispose();
      mothGeometry.dispose();
      birdMaterial.dispose();
      mothMaterial.dispose();
    },
    [birdGeometry, mothGeometry, birdMaterial, mothMaterial],
  );

  return (
    <group>
      <LifeTicker active={!reducedMotion} />
      <instancedMesh
        ref={birdMesh}
        args={[birdGeometry, birdMaterial, BIRD_COUNT]}
        frustumCulled={false}
        renderOrder={3}
        raycast={skipRaycast}
      />
      <instancedMesh
        ref={mothMesh}
        args={[mothGeometry, mothMaterial, BUTTERFLY_COUNT]}
        frustumCulled={false}
        visible={mothOpacity > 0.02}
        renderOrder={3}
        raycast={skipRaycast}
      />
    </group>
  );
}
