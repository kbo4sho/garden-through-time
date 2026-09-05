// Original, deterministic glTF geometry. No downloaded meshes or image textures.
// Attempt 2: cheap UV cluster cards + winter spray cards. Silhouette mass is
// authored in the runtime canopy shader (hashed alpha), not as discrete leaf ribbons.
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
    leaf: 0.5,
    leaves: 6,
    fill: 520,
    spray: 220,
    color: "#66834b",
  },
  hydrangea: {
    seed: 182,
    h: 2.72,
    w: 1.38,
    stems: 13,
    leaf: 0.62,
    leaves: 6,
    fill: 480,
    spray: 180,
    color: "#547449",
  },
  dogwood: {
    seed: 431,
    h: 3.05,
    w: 1.18,
    stems: 22,
    leaf: 0.44,
    leaves: 6,
    fill: 500,
    spray: 200,
    color: "#5a804e",
  },
  boxwood: {
    seed: 992,
    h: 2.32,
    w: 1.14,
    stems: 20,
    leaf: 0.26,
    leaves: 8,
    fill: 900,
    spray: 0,
    color: "#3f653f",
  },
};
const barkTint = {
  fothergilla: "#655444",
  hydrangea: "#795740",
  dogwood: "#a63831",
  boxwood: "#5a4a38",
};
const manifest = {
  version: 1,
  provenance: "Original project assets; no third-party mesh or texture content",
  generator: "scripts/generate-plant-models.mjs",
  models: {},
};

function clusterCard(width, height, cup = 0.11) {
  const hw = width * 0.5;
  const lift = height * cup;
  const g = new T.BufferGeometry();
  g.setAttribute(
    "position",
    new T.Float32BufferAttribute(
      [
        -hw,
        0,
        0,
        0,
        0,
        lift * 0.28,
        hw,
        0,
        0,
        -hw,
        height,
        lift * 0.42,
        0,
        height,
        lift,
        hw,
        height,
        lift * 0.42,
      ],
      3,
    ),
  );
  g.setAttribute(
    "uv",
    new T.Float32BufferAttribute(
      [0, 0, 0.5, 0, 1, 0, 0, 1, 0.5, 1, 1, 1],
      2,
    ),
  );
  g.setIndex([0, 1, 4, 0, 4, 3, 1, 2, 5, 1, 5, 4]);
  g.computeVertexNormals();
  return g;
}

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

  function paintBark(g, tint) {
    const pos = g.attributes.position;
    const colors = [];
    for (let i = 0; i < pos.count; i++) {
      const mottling = 0.72 + r() * 0.36;
      const col = tint.clone().multiplyScalar(mottling);
      colors.push(col.r, col.g, col.b);
    }
    g.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
  }

  function paintCard(g, tint) {
    const colors = [];
    const col = tint.clone();
    for (let i = 0; i < g.attributes.position.count; i++) {
      const shade = 0.84 + r() * 0.2;
      colors.push(col.r * shade, col.g * shade, col.b * shade);
    }
    g.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
  }

  function add(layer, geometry, anchor, tint = "#ffffff", phase = r(), cluster = 0) {
    let g = geometry.index ? geometry.toNonIndexed() : geometry;
    const n = g.attributes.position.count;
    if (!g.getAttribute("uv")) {
      const uvs = [];
      for (let i = 0; i < n; i++) uvs.push(0, 0);
      g.setAttribute("uv", new T.Float32BufferAttribute(uvs, 2));
    }
    if (!g.getAttribute("color")) {
      const colors = [];
      const col = tint instanceof T.Color ? tint : new T.Color(tint);
      for (let i = 0; i < n; i++) {
        const vein = 0.9 + r() * 0.12;
        colors.push(col.r * vein, col.g * vein, col.b * vein);
      }
      g.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
    }
    const a = [];
    const p = [];
    const cl = [];
    for (let i = 0; i < n; i++) {
      a.push(...anchor);
      p.push(phase);
      cl.push(cluster);
    }
    g.setAttribute("anchor", new T.Float32BufferAttribute(a, 3));
    g.setAttribute("phase", new T.Float32BufferAttribute(p, 1));
    g.setAttribute("cluster", new T.Float32BufferAttribute(cl, 1));
    layers[layer].push(g);
  }

  function twig(a, b, radius, layer = "branches", anchor = a, tint, radial = 5) {
    const d = b.clone().sub(a);
    const len = Math.max(0.004, d.length());
    const g = new T.CylinderGeometry(
      radius * (0.5 + r() * 0.12),
      radius * (1.02 + r() * 0.1),
      len,
      radial,
      1,
      true,
    );
    if (radius > 0.006) {
      const pos = g.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const n = 0.9 + r() * 0.2;
        pos.setX(i, pos.getX(i) * n);
        pos.setZ(i, pos.getZ(i) * n);
      }
      pos.needsUpdate = true;
      g.computeVertexNormals();
    }
    g.applyQuaternion(
      new T.Quaternion().setFromUnitVectors(v(0, 1, 0), d.normalize()),
    );
    const bark =
      tint instanceof T.Color
        ? tint
        : new T.Color(
            tint ??
              (id === "dogwood"
                ? "#a63831"
                : barkTint[id]),
          );
    paintBark(g, bark);
    g.translate(...a.clone().add(b).multiplyScalar(0.5));
    add(layer, g, anchor, bark, r(), 0);
  }

  function orientCard(g, yaw) {
    g.rotateX(0.28 + r() * 1.05);
    g.rotateY(yaw + (r() - 0.5) * 0.95);
    g.rotateZ((r() - 0.5) * 0.32);
  }

  function leaf(at, yaw, size, phase) {
    const width = size * (id === "boxwood" ? 1.05 : 1.12);
    const height = size * (id === "hydrangea" ? 1.18 : id === "boxwood" ? 0.92 : 1.08);
    const g = clusterCard(width, height, id === "boxwood" ? 0.08 : 0.12);
    paintCard(g, new T.Color("#f2f4ee"));
    orientCard(g, yaw);
    g.translate(...at);
    add("leaves", g, at, "#ffffff", phase, 1);
  }

  function puff(layer, at, yaw, width, height, tint, phase) {
    const g = clusterCard(width, height, 0.16);
    paintCard(g, tint instanceof T.Color ? tint : new T.Color(tint));
    orientCard(g, yaw);
    g.translate(...at);
    add(layer, g, at, tint, phase, 1);
  }

  const terminals = [];
  for (let stem = 0; stem < c.stems; stem++) {
    const angle = stem * 2.39996 + r() * 0.35;
    const reach = c.w * (0.28 + r() * 0.7);
    const height = c.h * (0.38 + r() * 0.5);
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
      next.x += (r() - 0.5) * (id === "dogwood" ? 0.055 : 0.11);
      next.z += (r() - 0.5) * (id === "dogwood" ? 0.055 : 0.11);
      if (id === "dogwood") next.y += (1 - t) * 0.04;
      const barkColor =
        id === "dogwood"
          ? new T.Color("#6a4e3d").lerp(
              new T.Color("#c13c32"),
              0.18 + t * 0.82,
            )
          : new T.Color(barkTint[id]).lerp(
              new T.Color("#4a3a2c"),
              (1 - t) * 0.28,
            );
      const baseRadius =
        (id === "dogwood" ? 0.016 : id === "hydrangea" ? 0.03 : 0.027) *
        (1.18 - t * 0.72);
      twig(prev, next, baseRadius, "branches", prev, barkColor);
      if (step >= 1) {
        for (let side = 0; side < 2; side++) {
          const a = angle + (side ? 1 : -1) * (0.65 + r() * 0.85);
          const end = next
            .clone()
            .add(
              v(
                Math.cos(a) * (0.18 + r() * 0.34),
                0.14 + r() * 0.26,
                Math.sin(a) * (0.18 + r() * 0.34),
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
          twig(next, end, baseRadius * 0.42, "branches", next, barkColor);
          if (id !== "boxwood") {
            const twigs = id === "dogwood" ? 4 : 3;
            for (let k = 0; k < twigs; k++) {
              const twigAngle = a + (k - 1) * (0.4 + r() * 0.7);
              const twigEnd = end
                .clone()
                .add(
                  v(
                    Math.cos(twigAngle) * (0.12 + r() * 0.22),
                    0.03 + r() * 0.18,
                    Math.sin(twigAngle) * (0.12 + r() * 0.22),
                  ),
                );
              twig(
                end.clone().lerp(next, r() * 0.4),
                twigEnd,
                baseRadius * 0.14,
                "branches",
                end,
                barkColor,
                3,
              );
            }
          }
          const leafCount = c.leaves;
          for (let j = 0; j < leafCount; j++) {
            const lt =
              id === "dogwood" || id === "hydrangea"
                ? (Math.floor(j / 2) + 1) / (Math.ceil(leafCount / 2) + 1)
                : (j + 1) / (leafCount + 1);
            const at = next.clone().lerp(end, lt);
            const la = a + (j % 2 ? 1 : -1) * 1.25;
            const petiole = at
              .clone()
              .add(v(Math.cos(la) * 0.055, 0.022, Math.sin(la) * 0.055));
            twig(at, petiole, 0.0022, "branches", at, barkColor, 3);
            leaf(
              petiole,
              la,
              c.leaf * (id === "boxwood" ? 0.82 + r() * 0.28 : 0.92 + r() * 0.28),
              r(),
            );
            if (id === "boxwood") {
              leaf(petiole, la + Math.PI, c.leaf * (0.78 + r() * 0.24), r());
            }
          }
          if (step >= 4 && side === 0) terminals.push(end);
        }
      }
      prev = next;
    }
    terminals.push(prev);
    if (id === "fothergilla" || id === "dogwood") {
      for (let spray = 0; spray < (id === "dogwood" ? 9 : 8); spray++) {
        const sa = angle + (r() - 0.5) * 1.4;
        const start = v(
          Math.cos(sa) * reach * (0.15 + r() * 0.45),
          height * (0.35 + r() * 0.45),
          Math.sin(sa) * reach * (0.15 + r() * 0.45),
        );
        const finish = start
          .clone()
          .add(
            v(
              Math.cos(sa) * (0.08 + r() * 0.16),
              0.12 + r() * 0.28,
              Math.sin(sa) * (0.08 + r() * 0.16),
            ),
          );
        twig(
          start,
          finish,
          id === "dogwood" ? 0.006 : 0.005,
          "branches",
          start,
          id === "dogwood"
            ? new T.Color("#b83a30")
            : new T.Color(barkTint[id]),
          3,
        );
      }
    }
  }

  const fillCount = c.fill;
  for (let i = 0; i < fillCount; i++) {
    const theta = r() * Math.PI * 2;
    const u = Math.sqrt(r());
    const rad = c.w * (id === "boxwood" ? 0.22 + u * 0.92 : 0.18 + u * 0.88);
    const cap =
      Math.sqrt(Math.max(0.04, 1 - (rad / (c.w * 1.18)) ** 2));
    const y =
      id === "boxwood"
        ? c.h * (0.1 + r() * 0.78 * cap)
        : c.h * (0.2 + r() * 0.74);
    const at = v(Math.cos(theta) * rad, y, Math.sin(theta) * rad);
    leaf(
      at,
      theta + (r() - 0.5) * 1.4,
      c.leaf * (id === "boxwood" ? 0.88 + r() * 0.32 : 0.95 + r() * 0.34),
      r(),
    );
  }

  for (let i = 0; i < c.spray; i++) {
    const theta = r() * Math.PI * 2;
    const rad = c.w * (0.12 + Math.sqrt(r()) * 0.9);
    const at = v(
      Math.cos(theta) * rad,
      c.h * (0.22 + r() * 0.7),
      Math.sin(theta) * rad,
    );
    const size = 0.34 + r() * 0.28;
    const g = clusterCard(size, size * (0.9 + r() * 0.35), 0.06);
    paintCard(
      g,
      id === "dogwood" ? new T.Color("#b83a30") : new T.Color(barkTint[id]),
    );
    orientCard(g, theta);
    g.translate(...at);
    add("branches", g, at, barkTint[id], r(), 1);
  }

  terminals.forEach((at, i) => {
    const phase = r();
    const yaw = r() * Math.PI * 2;
    if (id === "hydrangea" && i % 2 === 0) {
      const top = at.clone().add(v(0.03, 0.46, 0.01));
      twig(at, top, 0.0075, "blooms", at, "#b9ab83");
      for (let j = 0; j < 12; j++) {
        const t = j / 12;
        const a = j * 2.4;
        const rad = 0.16 * (1 - t) + 0.02;
        const p = at
          .clone()
          .add(v(Math.cos(a) * rad, t * 0.42, Math.sin(a) * rad));
        puff(
          "blooms",
          p,
          a,
          0.28 + r() * 0.08,
          0.26 + r() * 0.08,
          new T.Color("#fff8ee").multiplyScalar(0.88 + r() * 0.12),
          phase,
        );
      }
    } else if (id === "fothergilla") {
      const tip = at.clone().add(v(0, 0.24, 0));
      twig(at, tip, 0.0055, "blooms", at, "#d4ce9e");
      for (let j = 0; j < 8; j++) {
        const p = at.clone().add(v((r() - 0.5) * 0.07, 0.02 + (j % 4) * 0.055, (r() - 0.5) * 0.07));
        puff("blooms", p, yaw + j, 0.22, 0.3, "#f4f0dc", phase);
      }
    } else if (id === "dogwood" && i % 3 === 0) {
      puff("blooms", at.clone().add(v(0, 0.04, 0)), yaw, 0.26, 0.2, "#f4f0de", phase);
      puff(
        "blooms",
        at.clone().add(v(0.04, 0.02, -0.03)),
        yaw + 1.1,
        0.2,
        0.16,
        "#efe8d2",
        phase,
      );
      for (let j = 0; j < 6; j++) {
        const a = j * 2.4;
        const rad = Math.sqrt(j / 6) * 0.1;
        const p = at
          .clone()
          .add(v(Math.cos(a) * rad, 0.01 + r() * 0.03, Math.sin(a) * rad));
        const berry = new T.SphereGeometry(0.026, 5, 3);
        berry.scale(1, 0.88, 1);
        const colors = [];
        for (let k = 0; k < berry.attributes.position.count; k++) {
          const s = 0.88 + r() * 0.14;
          colors.push(0.84 * s, 0.87 * s, 0.8 * s);
        }
        berry.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
        berry.translate(...p.clone().add(v(0, -0.02, 0)));
        add("fruit", berry, at, "#d8ddd1", phase, 0);
      }
    } else if (id === "boxwood" && i % 5 === 0) {
      puff("blooms", at, yaw, 0.08, 0.07, "#d9d4a7", phase);
    }
  });

  const scene = new T.Group();
  scene.name = id;
  const stats = {};
  for (const [name, parts] of Object.entries(layers)) {
    if (!parts.length) continue;
    const geometry = mergeVertices(mergeGeometries(parts));
    for (const attr of ["position", "anchor", "phase", "cluster"]) {
      if (!geometry.attributes[attr]) continue;
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
      roughness: name === "branches" ? 0.94 : name === "blooms" ? 0.62 : 0.84,
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
