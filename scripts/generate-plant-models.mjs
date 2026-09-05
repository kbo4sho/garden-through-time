// Original, deterministic glTF geometry. No downloaded meshes or image textures.
// Studio-botanical: folded 3D organs and a winter armature, not photo cards.
// Attempt 2: fill the authored envelope (soft mass at 390px) without expanding
// the hull or climbing toward photographic albedo / tuft cards.
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
    w: 1.22,
    stems: 19,
    steps: 6,
    leaf: 0.28,
    leaves: 8,
    cluster: 3,
    sprays: 6,
    fills: 210,
    color: "#66834b",
  },
  hydrangea: {
    seed: 182,
    h: 2.72,
    w: 1.38,
    stems: 15,
    steps: 6,
    leaf: 0.41,
    leaves: 4,
    cluster: 3,
    sprays: 4,
    fills: 150,
    color: "#547449",
  },
  dogwood: {
    seed: 431,
    h: 3.05,
    w: 1.08,
    stems: 25,
    steps: 6,
    leaf: 0.25,
    leaves: 6,
    cluster: 3,
    sprays: 5,
    fills: 230,
    color: "#5a804e",
  },
  boxwood: {
    seed: 992,
    h: 2.32,
    w: 1.18,
    stems: 18,
    steps: 5,
    leaf: 0.128,
    leaves: 7,
    cluster: 2,
    sprays: 0,
    fills: 80,
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
    const col = tint instanceof T.Color ? tint : new T.Color(tint);
    for (let i = 0; i < n; i++) {
      a.push(...anchor);
      p.push(phase);
      colors.push(col.r, col.g, col.b);
    }
    g.setAttribute("anchor", new T.Float32BufferAttribute(a, 3));
    g.setAttribute("phase", new T.Float32BufferAttribute(p, 1));
    g.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
    layers[layer].push(g);
  }
  function barkTint(t = 0.5) {
    if (id === "dogwood") {
      // Arctic Fire crimson, not coral-pink.
      return new T.Color("#5a3830").lerp(new T.Color("#8f241c"), 0.32 + t * 0.68);
    }
    if (id === "hydrangea") return new T.Color("#7a5a42");
    if (id === "boxwood") return new T.Color("#5a4a38");
    return new T.Color("#655444");
  }
  function twig(a, b, radius, layer = "branches", anchor = a, tint) {
    const d = b.clone().sub(a);
    const length = Math.max(0.004, d.length());
    const sides = radius < 0.007 ? 3 : 4;
    const g = new T.CylinderGeometry(
      radius * 0.56,
      radius,
      length,
      sides,
      1,
      true,
    );
    g.applyQuaternion(
      new T.Quaternion().setFromUnitVectors(v(0, 1, 0), d.normalize()),
    );
    g.translate(...a.clone().add(b).multiplyScalar(0.5));
    add(layer, g, anchor, tint ?? barkTint(b.y / c.h), r());
  }
  function envelopeRadius(y) {
    const t = Math.min(1, Math.max(0, y / c.h));
    if (id === "boxwood") {
      const yt = (t - 0.05) / 0.95;
      return c.w * Math.sqrt(Math.max(0, 1 - yt * yt));
    }
    if (id === "dogwood") {
      return c.w * (0.32 + 0.68 * Math.sin(Math.PI * Math.pow(t, 0.82)));
    }
    if (id === "hydrangea") {
      return (
        c.w *
        (0.24 + 0.84 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.72)), 0.7))
      );
    }
    return (
      c.w * (0.22 + 0.86 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.68)), 0.66))
    );
  }
  function clampHabit(end) {
    const radial = Math.sqrt(end.x ** 2 + end.z ** 2);
    const maxR = Math.max(0.05, envelopeRadius(end.y));
    if (radial > maxR && radial > 1e-6) {
      end.x *= maxR / radial;
      end.z *= maxR / radial;
    }
    const maxY =
      id === "boxwood"
        ? c.h * (0.58 + 0.42 * Math.sqrt(Math.max(0, 1 - radial / (c.w * 1.12))))
        : c.h *
          (0.9 + 0.1 * Math.sqrt(Math.max(0, 1 - radial / (c.w * 1.22))));
    end.y = Math.min(Math.max(end.y, 0.02), maxY);
    return end;
  }
  // Folded botanical blades. Fewer rows than attempt 1 so more overlapping
  // organs fit the download budget. Lobes and teeth stay geometry, not cards.
  function leafShape(length) {
    const oak = id === "hydrangea";
    const round = id === "boxwood" || id === "fothergilla";
    const rows = oak ? 5 : 2;
    const points = [];
    const indices = [];
    for (let i = 0; i <= rows; i++) {
      const t = i / rows;
      let width =
        Math.pow(Math.sin(Math.PI * t), round ? 0.48 : 0.78) *
        length *
        (oak ? 0.46 : round ? 0.42 : 0.32);
      if (oak) width *= 0.64 + 0.36 * Math.cos(t * Math.PI * 8);
      else if (id === "fothergilla") width *= i % 2 ? 0.88 : 1;
      const cup = Math.sin(t * Math.PI);
      points.push(
        -width,
        t * length,
        cup * length * 0.06,
        0,
        t * length,
        cup * length * 0.16,
        width,
        t * length,
        cup * length * 0.06,
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
  function leafTint() {
    const hue =
      id === "boxwood"
        ? 0.28 + (r() - 0.5) * 0.03
        : id === "fothergilla"
          ? 0.22 + (r() - 0.5) * 0.05
          : id === "hydrangea"
            ? 0.3 + (r() - 0.5) * 0.04
            : 0.26 + (r() - 0.5) * 0.04;
    return new T.Color().setHSL(hue, 0.12 + r() * 0.08, 0.68 + r() * 0.24);
  }
  function leaf(at, angle, size, phase) {
    const g = leafShape(size);
    g.rotateX(0.92 + r() * 0.55);
    g.rotateY(angle + (r() - 0.5) * 0.28);
    g.rotateZ((r() - 0.5) * 0.32);
    g.translate(...at);
    add("leaves", g, at, leafTint(), phase);
  }
  function leafCluster(at, angle, size, phase) {
    const n = c.cluster;
    for (let i = 0; i < n; i++) {
      const offset = v(
        Math.cos(angle + i * 2.1) * 0.016 * (i + 0.4),
        0.008 * i,
        Math.sin(angle + i * 2.1) * 0.016 * (i + 0.4),
      );
      leaf(
        at.clone().add(offset),
        angle + (i - (n - 1) / 2) * 0.3,
        size * (0.88 + r() * 0.26),
        phase,
      );
    }
  }
  function spray(origin, count) {
    for (let i = 0; i < count; i++) {
      const a = r() * Math.PI * 2;
      const len = 0.05 + r() * (id === "dogwood" ? 0.12 : 0.1);
      const end = clampHabit(
        origin.clone().add(v(Math.cos(a) * len, 0.02 + r() * 0.1, Math.sin(a) * len)),
      );
      twig(origin, end, 0.0044 + r() * 0.0022);
    }
  }
  function floret(at, size, anchor, tint, phase) {
    for (let p = 0; p < 3; p++) {
      const g = new T.CircleGeometry(size * 0.48, 4);
      g.translate(0, size * 0.42, 0);
      g.scale(0.82, 1, 0.58);
      g.rotateX(1.02);
      g.rotateY((p * Math.PI * 2) / 3 + (r() - 0.5) * 0.12);
      g.translate(...at);
      add("blooms", g, anchor, tint, phase);
    }
  }
  const terminals = [];
  const reachExp = id === "dogwood" ? 0.88 : 0.72;
  for (let stem = 0; stem < c.stems; stem++) {
    const angle = stem * 2.39996 + r() * 0.32;
    const upright = id === "dogwood" ? 0.86 : 1;
    const reach = c.w * (0.28 + r() * 0.68) * upright;
    const height = c.h * (0.58 + r() * 0.4);
    let prev = v(
      Math.cos(angle) * (0.05 + r() * 0.12),
      0,
      Math.sin(angle) * (0.05 + r() * 0.12),
    );
    for (let step = 1; step <= c.steps; step++) {
      const t = step / c.steps;
      const next = clampHabit(
        v(
          Math.cos(angle) * reach * Math.pow(t, reachExp),
          height * t,
          Math.sin(angle) * reach * Math.pow(t, reachExp),
        ),
      );
      next.x += (r() - 0.5) * 0.05;
      next.z += (r() - 0.5) * 0.05;
      clampHabit(next);
      twig(
        prev,
        next,
        (id === "dogwood" ? 0.018 : 0.026) * (1 - t * 0.5),
        "branches",
        prev,
      );
      if (step >= 1) {
        const sideCount = id === "boxwood" ? 2 : 2;
        for (let side = 0; side < sideCount; side++) {
          const a = angle + (side ? 1 : -1) * (0.55 + r() * 0.8);
          const end = clampHabit(
            next.clone().add(
              v(
                Math.cos(a) * (0.12 + r() * 0.22) * upright,
                0.08 + r() * 0.16,
                Math.sin(a) * (0.12 + r() * 0.22) * upright,
              ),
            ),
          );
          twig(next, end, 0.0084);
          if (c.sprays && step >= 2) spray(end, c.sprays);
          for (let j = 0; j < c.leaves; j++) {
            const along =
              id === "dogwood" || id === "hydrangea"
                ? (Math.floor(j / 2) + 1) / (Math.ceil(c.leaves / 2) + 1)
                : (j + 1) / (c.leaves + 1);
            const at = next.clone().lerp(end, along);
            const la = a + (j % 2 ? 1 : -1) * 1.18;
            const petiole = clampHabit(
              at.clone().add(v(Math.cos(la) * 0.045, 0.016, Math.sin(la) * 0.045)),
            );
            twig(at, petiole, 0.002);
            leafCluster(petiole, la, c.leaf * (1.08 + r() * 0.55), r());
            if (id === "boxwood") {
              leafCluster(
                petiole,
                la + Math.PI,
                c.leaf * (0.98 + r() * 0.4),
                r(),
              );
            }
          }
          if (step >= c.steps - 1 && side === 0) terminals.push(end);
        }
      }
      prev = next;
    }
    terminals.push(prev);
  }
  // Interior winter armature: short twigs that stay inside the envelope so
  // the 390px silhouette reads as a soft mass instead of a few long sticks.
  for (let i = 0; i < c.fills; i++) {
    const y = c.h * (0.12 + r() * 0.78);
    const a = r() * Math.PI * 2;
    const rad = envelopeRadius(y) * (0.12 + r() * 0.72);
    const origin = v(Math.cos(a) * rad, y, Math.sin(a) * rad);
    const a2 = a + (r() - 0.5) * 1.4;
    const len = 0.045 + r() * 0.1;
    const end = clampHabit(
      origin.clone().add(v(Math.cos(a2) * len, 0.015 + r() * 0.07, Math.sin(a2) * len)),
    );
    twig(origin, end, 0.0056 + r() * 0.003);
    if (i % 3 === 0) {
      leafCluster(end, a2, c.leaf * (0.86 + r() * 0.28), r());
    }
  }
  terminals.forEach((at, i) => {
    const phase = r();
    if (id === "hydrangea" && i % 2 === 0) {
      const top = clampHabit(at.clone().add(v(0.03, 0.36, 0)));
      twig(at, top, 0.0072, "blooms", at, "#b9ab83");
      for (let j = 0; j < 32; j++) {
        const t = j / 32,
          a = j * 2.4,
          rad = 0.16 * (1 - t) + 0.01;
        const p = at.clone().add(v(Math.cos(a) * rad, t * 0.36, Math.sin(a) * rad));
        floret(
          p,
          0.054 + r() * 0.02,
          at,
          new T.Color("#ffffff").multiplyScalar(0.84 + r() * 0.16),
          phase,
        );
      }
    } else if (id === "fothergilla") {
      twig(at, at.clone().add(v(0, 0.22, 0)), 0.0052, "blooms", at, "#d4ce9e");
      for (let j = 0; j < 18; j++) {
        const a = j * 2.4,
          t = j / 18,
          root = at.clone().add(v(0, t * 0.22, 0));
        const end = root
          .clone()
          .add(
            v(Math.cos(a) * (0.05 + t * 0.018), 0.018, Math.sin(a) * (0.05 + t * 0.018)),
          );
        twig(root, end, 0.0024, "blooms", at, "#eee9cd");
        const tip = new T.ConeGeometry(0.01, 0.016, 3);
        tip.translate(...end);
        add("blooms", tip, at, "#fffbed", phase);
      }
    } else if (id === "dogwood" && i % 3 === 0) {
      for (let j = 0; j < 14; j++) {
        const a = j * 2.4,
          rad = Math.sqrt(j / 14) * 0.11;
        const p = at
          .clone()
          .add(v(Math.cos(a) * rad, 0.02 + r() * 0.04, Math.sin(a) * rad));
        floret(p, 0.022, at, "#f2eedc", phase);
        if (j < 6) {
          const g = new T.IcosahedronGeometry(0.026, 0);
          g.translate(...p);
          add("fruit", g, at, "#d8ddd1", phase);
        }
      }
    } else if (id === "boxwood" && i % 6 === 0) {
      const g = new T.IcosahedronGeometry(0.015, 0);
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
    for (const attr of ["position", "anchor", "phase"]) {
      const values = geometry.attributes[attr].array;
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
      roughness: 0.9,
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
  await doc.transform(
    reorder({ encoder: MeshoptEncoder, target: "size" }),
    quantize({ pattern: /^(NORMAL|COLOR_0)$/ }),
  );
  doc.createExtension(EXTMeshoptCompression).setRequired(true);
  const buffer = await io.writeBinary(doc);
  await writeFile(new URL(`${id}.glb`, out), Buffer.from(buffer));
  const bounds = new T.Box3().setFromObject(scene);
  const points = [];
  scene.children.forEach((mesh) => {
    const positions = mesh.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++)
      points.push(new T.Vector3().fromBufferAttribute(positions, i));
  });
  const hull = new ConvexHull().setFromPoints(points);
  const silhouette = new Map();
  for (const face of hull.faces) {
    let edge = face.edge;
    do {
      const point = edge.head().point.toArray();
      silhouette.set(point.join(","), point);
      edge = edge.next;
    } while (edge !== face.edge);
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
