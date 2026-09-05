// Original, deterministic glTF geometry. No downloaded meshes or image textures.
import * as T from "three";
import {
  mergeGeometries,
  mergeVertices,
} from "three/addons/utils/BufferGeometryUtils.js";
import { ConvexHull } from "three/addons/math/ConvexHull.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { NodeIO } from "@gltf-transform/core";
import {
  EXTMeshoptCompression,
  KHRMeshQuantization,
} from "@gltf-transform/extensions";
import { reorder, quantize } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";
import { mkdir, writeFile } from "node:fs/promises";
class FileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((v) => {
      this.result = v;
      this.onloadend?.();
    });
  }
}
globalThis.FileReader = FileReader;
const out = new URL("../public/models/", import.meta.url);
await mkdir(out, { recursive: true });
const configs = {
  fothergilla: {
    seed: 71,
    h: 2.55,
    w: 1.25,
    stems: 15,
    leaf: 0.19,
    leaves: 8,
    color: "#66834b",
  },
  hydrangea: {
    seed: 182,
    h: 2.72,
    w: 1.38,
    stems: 13,
    leaf: 0.28,
    leaves: 6,
    color: "#547449",
  },
  dogwood: {
    seed: 431,
    h: 3.05,
    w: 1.18,
    stems: 22,
    leaf: 0.18,
    leaves: 7,
    color: "#5a804e",
  },
  boxwood: {
    seed: 992,
    h: 2.32,
    w: 1.14,
    stems: 20,
    leaf: 0.095,
    leaves: 10,
    color: "#3f653f",
  },
};
const manifest = {
  version: 1,
  provenance: "Original project assets; no third-party mesh or texture content",
  generator: "scripts/generate-plant-models.mjs",
  models: {},
};
for (const [id, c] of Object.entries(configs)) {
  let seed = c.seed;
  const r = () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let v = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    v = (v + Math.imul(v ^ (v >>> 7), 61 | v)) ^ v;
    return ((v ^ (v >>> 14)) >>> 0) / 4294967296;
  };
  const layers = { branches: [], leaves: [], blooms: [], fruit: [] };
  const v = (x = 0, y = 0, z = 0) => new T.Vector3(x, y, z);
  function add(layer, geometry, anchor, tint = "#ffffff", phase = r()) {
    let g = geometry.index ? geometry.toNonIndexed() : geometry;
    g.deleteAttribute("uv");
    const n = g.attributes.position.count;
    const a = [],
      p = [],
      colors = [];
    const col = new T.Color(tint);
    for (let i = 0; i < n; i++) {
      a.push(...anchor);
      p.push(phase);
      const vein = 1;
      colors.push(col.r * vein, col.g * vein, col.b * vein);
    }
    g.setAttribute("anchor", new T.Float32BufferAttribute(a, 3));
    g.setAttribute("phase", new T.Float32BufferAttribute(p, 1));
    g.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
    layers[layer].push(g);
  }
  function twig(a, b, radius, layer = "branches", anchor = a, tint) {
    const d = b.clone().sub(a);
    const g = new T.CylinderGeometry(
      radius * 0.58,
      radius,
      d.length(),
      5,
      1,
      true,
    );
    g.applyQuaternion(
      new T.Quaternion().setFromUnitVectors(v(0, 1, 0), d.normalize()),
    );
    g.translate(...a.clone().add(b).multiplyScalar(0.5));
    add(
      layer,
      g,
      anchor,
      tint ??
        (id === "dogwood"
          ? "#a63831"
          : id === "hydrangea"
            ? "#795740"
            : "#655444"),
    );
  }
  // A folded, pointed blade with a raised midrib. Lobes are geometry, not alpha cards.
  function leafShape(length, oak = false, round = false) {
    const rows = oak ? 12 : id === "boxwood" ? 4 : 6,
      points = [],
      indices = [];
    for (let i = 0; i <= rows; i++) {
      const t = i / rows;
      let width =
        Math.pow(Math.sin(Math.PI * t), round ? 0.48 : 0.78) *
        length *
        (oak ? 0.43 : round ? 0.37 : 0.31);
      if (oak) width *= 0.66 + 0.34 * Math.cos(t * Math.PI * 8);
      else if (id === "fothergilla") width *= i % 2 ? 0.91 : 1;
      points.push(
        -width,
        t * length,
        Math.sin(t * Math.PI) * length * 0.055,
        0,
        t * length,
        Math.sin(t * Math.PI) * length * 0.16,
        width,
        t * length,
        Math.sin(t * Math.PI) * length * 0.055,
      );
      if (i < rows) {
        const k = i * 3;
        indices.push(
          k,
          k + 3,
          k + 1,
          k + 1,
          k + 3,
          k + 4,
          k + 1,
          k + 4,
          k + 2,
          k + 2,
          k + 4,
          k + 5,
        );
      }
    }
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(points, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }
  function leaf(at, angle, size, phase) {
    const g = leafShape(
      size,
      id === "hydrangea",
      id === "boxwood" || id === "fothergilla",
    );
    g.rotateX(0.65 + r() * 1.85);
    g.rotateY(angle);
    g.rotateZ((r() - 0.5) * 0.55);
    g.translate(...at);
    const color = new T.Color("#ffffff").multiplyScalar(0.7 + r() * 0.3);
    add("leaves", g, at, color, phase);
  }
  function floret(at, size, anchor, tint, phase) {
    // Four separate cupped sepals, each a small low-poly petal.
    for (let p = 0; p < 4; p++) {
      const g = new T.CircleGeometry(size * 0.48, 5);
      g.translate(0, size * 0.45, 0);
      g.scale(0.85, 1, 0.6);
      g.rotateX(1.05);
      g.rotateY((p * Math.PI) / 2);
      g.translate(...at);
      add("blooms", g, anchor, tint, phase);
    }
  }
  const terminals = [];
  for (let stem = 0; stem < c.stems; stem++) {
    const angle = stem * 2.39996 + r() * 0.35;
    const reach = c.w * (0.28 + r() * 0.7),
      height = c.h * (0.38 + r() * 0.5);
    let prev = v(
      Math.cos(angle) * (0.08 + r() * 0.18),
      0,
      Math.sin(angle) * (0.08 + r() * 0.18),
    );
    for (let step = 1; step <= 5; step++) {
      const t = step / 5;
      const next = v(
        Math.cos(angle) * reach * Math.pow(t, 1.15),
        height * t,
        Math.sin(angle) * reach * Math.pow(t, 1.15),
      );
      next.x += (r() - 0.5) * 0.09;
      next.z += (r() - 0.5) * 0.09;
      twig(
        prev,
        next,
        (id === "dogwood" ? 0.018 : 0.026) * (1 - t * 0.65),
        "branches",
        prev,
        id === "dogwood"
          ? new T.Color("#6e5445").lerp(new T.Color("#a63831"), 0.2 + t * 0.8)
          : undefined,
      );
      if (step >= 1) {
        for (let side = 0; side < 2; side++) {
          const a = angle + (side ? 1 : -1) * (0.7 + r() * 0.8);
          const end = next
            .clone()
            .add(
              v(
                Math.cos(a) * (0.19 + r() * 0.32),
                0.16 + r() * 0.23,
                Math.sin(a) * (0.19 + r() * 0.32),
              ),
            );
          if (id === "boxwood") {
            const limit =
              c.h *
              (0.72 +
                0.22 *
                  Math.sqrt(
                    Math.max(
                      0,
                      1 - (end.x ** 2 + end.z ** 2) / (c.w * 1.4) ** 2,
                    ),
                  ));
            end.y = Math.min(end.y, limit);
          }
          twig(next, end, 0.008);
          for (let j = 0; j < c.leaves; j++) {
            const t = (id === "dogwood" || id === "hydrangea")
              ? (Math.floor(j / 2) + 1) / (Math.ceil(c.leaves / 2) + 1)
              : (j + 1) / (c.leaves + 1);
            const
              at = next.clone().lerp(end, t);
            const la = a + (j % 2 ? 1 : -1) * 1.25;
            const petiole = at
              .clone()
              .add(v(Math.cos(la) * 0.055, 0.022, Math.sin(la) * 0.055));
            twig(at, petiole, 0.0025);
            leaf(petiole, la, c.leaf * (1.1 + r() * 0.85), r());
            if (id === "boxwood")
              leaf(petiole, la + Math.PI, c.leaf * (1 + r() * 0.6), r());
          }
          if (step >= 4 && side === 0) terminals.push(end);
        }
      }
      prev = next;
    }
    terminals.push(prev);
  }
  terminals.forEach((at, i) => {
    const phase = r();
    if (id === "hydrangea" && i % 2 === 0) {
      const top = at.clone().add(v(0.04, 0.42, 0));
      twig(at, top, 0.008, "blooms", at, "#b9ab83");
      for (let j = 0; j < 54; j++) {
        const t = j / 54,
          a = j * 2.4,
          rad = 0.18 * (1 - t) + 0.008;
        const p = at
          .clone()
          .add(v(Math.cos(a) * rad, t * 0.42, Math.sin(a) * rad));
        floret(
          p,
          0.055 + r() * 0.025,
          at,
          new T.Color("#ffffff").multiplyScalar(0.82 + r() * 0.18),
          phase,
        );
      }
    } else if (id === "fothergilla") {
      twig(at, at.clone().add(v(0, 0.22, 0)), 0.006, "blooms", at, "#d4ce9e");
      for (let j = 0; j < 36; j++) {
        const a = j * 2.4,
          t = j / 36,
          root = at.clone().add(v(0, t * 0.22, 0));
        const end = root
          .clone()
          .add(v(Math.cos(a) * 0.065, 0.025, Math.sin(a) * 0.065));
        twig(root, end, 0.0035, "blooms", at, "#eee9cd");
        const g = new T.OctahedronGeometry(0.014);
        g.translate(...end);
        add("blooms", g, at, "#fffbed", phase);
      }
    } else if (id === "dogwood" && i % 3 === 0) {
      for (let j = 0; j < 22; j++) {
        const a = j * 2.4,
          rad = Math.sqrt(j / 22) * 0.13;
        const p = at
          .clone()
          .add(v(Math.cos(a) * rad, 0.025 + r() * 0.045, Math.sin(a) * rad));
        floret(p, 0.024, at, "#f2eedc", phase);
        if (j < 9) {
          const g = new T.IcosahedronGeometry(0.028, 1);
          g.translate(...p);
          add("fruit", g, at, "#d8ddd1", phase);
        }
      }
    } else if (id === "boxwood" && i % 5 === 0) {
      const g = new T.IcosahedronGeometry(0.017, 0);
      g.translate(...at);
      add("blooms", g, at, "#d9d4a7", phase);
    }
  });
  const scene = new T.Group();
  scene.name = id;
  const stats = {};
  for (const [name, parts] of Object.entries(layers)) {
    if (!parts.length) continue;
    const geometry = mergeVertices(mergeGeometries(parts));
    for (const name of ["position", "anchor", "phase"]) {
      const values = geometry.attributes[name].array;
      for (let i = 0; i < values.length; i++)
        values[i] = Math.round(values[i] * 4096) / 4096;
    }
    geometry.computeVertexNormals();
    geometry.normalizeNormals();
    geometry.computeBoundingSphere();
    const material = new T.MeshStandardMaterial({
      color: name === "leaves" ? c.color : "#ffffff",
      vertexColors: true,
      side: T.DoubleSide,
      roughness: 0.88,
    });
    const mesh = new T.Mesh(geometry, material);
    mesh.name = name;
    scene.add(mesh);
    stats[name] = {
      vertices: geometry.attributes.position.count,
      triangles: geometry.index.count / 3,
    };
  }
  const raw = await new GLTFExporter().parseAsync(scene, { binary: true });
  await MeshoptEncoder.ready;
  const io = new NodeIO()
    .registerExtensions([EXTMeshoptCompression, KHRMeshQuantization])
    .registerDependencies({ "meshopt.encoder": MeshoptEncoder });
  const doc = await io.readBinary(new Uint8Array(raw));
  // Keep POSITION and _ANCHOR in exactly the same model coordinate system.
  await doc.transform(
    reorder({ encoder: MeshoptEncoder, target: "size" }),
    quantize({ pattern: /^(NORMAL|COLOR_0)$/ }),
  );
  doc.createExtension(EXTMeshoptCompression).setRequired(true);
  const buffer = await io.writeBinary(doc);
  await writeFile(new URL(`${id}.glb`, out), Buffer.from(buffer));
  const bounds = new T.Box3().setFromObject(scene);
  const points = [];
  scene.children.forEach(mesh => {
    const positions = mesh.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) points.push(new T.Vector3().fromBufferAttribute(positions, i));
  });
  const hull = new ConvexHull().setFromPoints(points);
  const silhouette = new Map();
  for (const face of hull.faces) {
    let edge = face.edge;
    do { const point = edge.head().point.toArray(); silhouette.set(point.join(','), point); edge = edge.next; } while (edge !== face.edge);
  }
  manifest.models[id] = {
    height: c.h,
    silhouette: [...silhouette.values()],
    bounds: { min: bounds.min.toArray(), max: bounds.max.toArray() },
    file: `${id}.glb`,
    bytes: buffer.byteLength,
    layers: stats,
  };
  console.log(id, buffer.byteLength, stats);
}
await writeFile(
  new URL("manifest.json", out),
  JSON.stringify(manifest, null, 2) + "\n",
);
