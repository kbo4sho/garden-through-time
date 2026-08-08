import { useEffect, useMemo, useRef } from "react";
import { extend, useFrame, useThree } from "@react-three/fiber";
import {
  PackedSplats,
  SparkRenderer as SparkRendererImpl,
  SplatMesh as SplatMeshImpl,
} from "@sparkjsdev/spark";
import type { PlantInstance } from "../data/plants";

const SparkRenderer = extend(SparkRendererImpl);
const SplatMesh = extend(SplatMeshImpl);

const assetPath = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;

function HydrangeaSplatInstance({
  instance,
  opacity,
  splats,
}: {
  instance: PlantInstance;
  opacity: number;
  splats: PackedSplats;
}) {
  const mesh = useRef<SplatMeshImpl>(null);
  const args = useMemo(
    () => ({ packedSplats: splats, raycastable: false }),
    [splats],
  );

  useFrame(() => {
    if (mesh.current) mesh.current.opacity = opacity;
  });

  return (
    <group position={instance.position} scale={instance.scale}>
      <group
        position={[0, 1.34, 0]}
        rotation={[0, Math.PI * 0.23, 0]}
        scale={3.02}
      >
        <SplatMesh ref={mesh} args={[args]} />
      </group>
    </group>
  );
}

export default function HydrangeaSplatLayer({
  instances,
  opacity,
  onReady,
}: {
  instances: PlantInstance[];
  opacity: number;
  onReady: () => void;
}) {
  const renderer = useThree((state) => state.gl);
  const rendererArgs = useMemo(() => ({ renderer }), [renderer]);
  const splats = useMemo(
    () => new PackedSplats({ url: assetPath("/splats/hydrangea-summer-lgm.spz") }),
    [],
  );

  useEffect(() => {
    let active = true;
    void splats.initialized.then(() => {
      if (active) onReady();
    });
    return () => {
      active = false;
      splats.dispose();
    };
  }, [onReady, splats]);

  return (
    <>
      <SparkRenderer args={[rendererArgs]} />
      {instances
        .filter((instance) => instance.profile.id === "hydrangea")
        .map((instance) => (
          <HydrangeaSplatInstance
            key={`splat-${instance.instanceId}`}
            instance={instance}
            opacity={opacity}
            splats={splats}
          />
        ))}
    </>
  );
}
