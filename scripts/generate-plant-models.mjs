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
    stems: 14,
    leaf: 0.16,
    color: "#66834b",
  },
  hydrangea: {
    seed: 182,
    h: 2.72,
    w: 1.38,
    stems: 11,
    leaf: 0.27,
    color: "#547449",
  },
  dogwood: {
    seed: 431,
    h: 3.05,
    w: 1.18,
    stems: 18,
    leaf: 0.16,
    color: "#5a804e",
  },
  boxwood: {
    seed: 992,
    h: 2.32,
    w: 1.14,
    stems: 14,
    leaf: 0.09,
    color: "#3f653f",
  },
};
const manifest = {
  version: 2,
  license: "Project-owned; see LICENSE.md",
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
      // Blade-local vein/cupping tone travels with geometry, never a baked light.
      const vein = g.getAttribute("bladeTone")?.getX(i) ?? 1;
      colors.push(col.r * vein, col.g * vein, col.b * vein);
    }
    g.deleteAttribute("bladeTone");
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
      radius > 0.012 ? 7 : radius < .004 ? 3 : 5,
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
  // Actual lobed/toothed silhouettes with a curved midrib and secondary veins.
  // All colour is organ pigmentation; studio direction is exclusively runtime light.
  function leafShape(length) {
    const oak = id === "hydrangea", box = id === "boxwood";
    const rows = oak ? 12 : box ? 4 : 8;
    const points = [], indices = [], tones = [];
    const bend = .07 + r() * .11, skew = (r() - .5) * .16;
    const cols = box ? 3 : 5;
    for (let i = 0; i <= rows; i++) {
      const t = i / rows;
      let width = Math.pow(Math.sin(Math.PI * t), box ? .55 : .8) * length;
      width *= oak ? .47 : id === "fothergilla" ? .38 : box ? .30 : .28;
      if (oak) width *= .59 + .41 * Math.cos((t - .12) * Math.PI * 6);
      if (id === "fothergilla" && t > .35) width *= i % 2 ? .94 : 1.02;
      for (let col = 0; col < cols; col++) {
        const x = col / (cols - 1) * 2 - 1;
        points.push(width * x + skew * length * t * t, t * length,
          length * (Math.sin(t * Math.PI) * bend - x*x * .065 * Math.sin(t * Math.PI) + x * .024 * Math.sin(t * Math.PI * 3)));
        // Subtle vein pigmentation, not a bright stripe on every blade.
        tones.push(Math.abs(x)<.01 ? 1.025 : .97 + .025 * Math.sin(t * Math.PI));
      }
      if (i < rows) for (let col = 0; col < cols-1; col++) {
        const k = i * cols + col;
        indices.push(k,k+cols,k+1,k+1,k+cols,k+cols+1);
      }
    }
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(points, 3));
    g.setAttribute("bladeTone", new T.Float32BufferAttribute(tones, 1));
    g.setIndex(indices); g.computeVertexNormals();
    return g;
  }
  function leaf(at, angle, size, phase, vigor = 1) {
    const g = leafShape(size);
    // Leaves reach out from the shoot with a broad distribution of inclinations.
    g.rotateX(.35 + r() * 2.40);
    g.rotateY(angle);
    g.rotateZ((r() - .5) * 1.50);
    g.translate(...at);
    const color = new T.Color().setRGB(.65 + vigor * .24, .69 + vigor * .23, .58 + vigor * .27);
    color.multiplyScalar(.84 + r() * .16);
    add("leaves", g, at, color, phase);
  }
  function floret(at, size, anchor, tint, phase, face = v(0,1,0)) {
    const orientation = new T.Quaternion().setFromUnitVectors(v(0,0,1), face.clone().normalize());
    for (let p = 0; p < 4; p++) {
      const points = [0, size*.35, size*.14], indices=[];
      const uneven = .86+r()*.28;
      const segments = id === "hydrangea" ? 8 : 5;
      for (let ring=1;ring<=2;ring++) for (let k=0;k<segments;k++) {
        const a=k/segments*Math.PI*2, f=ring*.5;
        points.push(Math.cos(a)*size*.36*uneven*f, size*.35+Math.sin(a)*size*.43*f, size*(.14-.16*f*f));
        if (ring===1) indices.push(0,k+1,(k+1)%segments+1);
        else {
          const inside=k+1, next=(k+1)%segments+1;
          indices.push(inside,inside+segments,next, next,inside+segments,next+segments);
        }
      }
      const g = new T.BufferGeometry().setAttribute("position",new T.Float32BufferAttribute(points,3)).setIndex(indices);
      g.computeVertexNormals();
      g.rotateZ(p*Math.PI/2+(r()-.5)*.2);
      g.applyQuaternion(orientation);
      g.translate(...at);
      add("blooms",g,anchor,tint,phase);
    }
  }
  const terminals = [];
  const isBox = id === "boxwood";
  const isDog = id === "dogwood";
  const isOak = id === "hydrangea";
  function shoot(start, end, radius, count, terminal = false) {
    const mid = start.clone().lerp(end, .5).add(v((r()-.5)*.08, .025, (r()-.5)*.08));
    twig(start, mid, radius);
    twig(mid, end, radius * .64);
    const angle = Math.atan2(end.z - start.z, end.x - start.x);
    for (let j = 0; j < count; j++) {
      const paired = isDog || isOak || isBox;
      const t = paired ? (Math.floor(j / 2) + 1) / (Math.ceil(count / 2) + 1) : (j + 1) / (count + 1);
      const at = t < .5 ? start.clone().lerp(mid, t * 2) : mid.clone().lerp(end, (t-.5)*2);
      const la = angle + (j % 2 ? 1 : -1) * (1.0 + r()*.38);
      const petiole = at.clone().add(v(Math.cos(la) * .035, .01, Math.sin(la) * .035));
      // Fine petioles disappear with their leaves, leaving a clean winter scaffold.
      const phase = r();
      leaf(petiole, la, c.leaf * (.90 + r()*.75), phase, .5 + t*.5);
    }
    if (terminal) terminals.push(end);
  }
  if (isBox) {
    // A rounded, naturally mounded evergreen. Shoots occupy an ellipsoid rather
    // than sharing the deciduous shrubs' upright cane topology.
    const center = v(0, c.h * .47, 0);
    for (let n = 0; n < 240; n++) {
      const y = 1 - 2 * (n + .5) / 240;
      const a = n * 2.39996, radial = Math.sqrt(1-y*y);
      const tip = center.clone().add(v(Math.cos(a)*radial*c.w, y*c.h*.40, Math.sin(a)*radial*c.w));
      tip.add(v((r()-.5)*.07, (r()-.5)*.07, (r()-.5)*.07));
      const inner = center.clone().lerp(tip, .48);
      if (n % 8 === 0) twig(v(0,.04,0), inner, .014);
      const base = center.clone().lerp(tip, .72);
      shoot(inner, tip, .0038, 6, n % 30 === 0);
      const angle = a + .7;
      for (const side of [-1, 1]) {
        const end = tip.clone().add(v(Math.cos(angle)*side*.12, (r()-.5)*.12, Math.sin(angle)*side*.12));
        shoot(base, end, .0026, 4);
      }
    }
  }
  for (let stem = 0; !isBox && stem < c.stems; stem++) {
    const angle = stem * 2.39996 + (r()-.5)*.55;
    const radial = Math.sqrt((stem + .5) / c.stems);
    const reach = c.w * radial * (isDog ? .82 : 1.04);
    const height = c.h * (.87+r()*.23) * (isBox ? .80 - radial*radial*.23 : isOak ? .85 - radial*.40 : isDog ? .96 - radial*.39 + (r()-.5)*.15 : .91 - radial*radial*.40);
    const rootSpread = isDog ? reach*.48 : .24;
    let prev = v(Math.cos(angle)*rootSpread, 0, Math.sin(angle)*rootSpread);
    for (let step = 1; step <= 6; step++) {
      const t = step === 6 ? 1 : (step + (r()-.5)*.8) / 6;
      const next = v(Math.cos(angle)*reach*(isDog ? .48 + .52*Math.pow(t, .85) : Math.sin(t*Math.PI*.5)), height*t, Math.sin(angle)*reach*(isDog ? .48 + .52*Math.pow(t, .85) : Math.sin(t*Math.PI*.5)));
      next.add(v((r()-.5)*.075, 0, (r()-.5)*.075));
      twig(prev, next, (isDog ? .022 : isOak ? .038 : .028)*(1-t*.83), "branches", prev,
        isDog ? new T.Color("#685043").lerp(new T.Color("#b72e38"), .15+t*.85) : undefined);
      if (step >= (isBox ? 1 : 2)) {
        const sides = 2;
        for (let side = 0; side < sides; side++) {
          const a = angle + (side % 2 ? 1 : -1)*(.58+r()*1.05) + (side === 2 ? Math.PI : 0);
          const span = (isBox ? .32 : isOak ? .40 : .30) * (.7 + r()*.7) * (1-t*.3);
          const end = next.clone().add(v(Math.cos(a)*span, .10+r()*.17, Math.sin(a)*span));
          shoot(next, end, .008*(1-t*.4), isBox ? 6 : 2, !isBox && step > 3 && side === 0);
          // Ramified side shoots make a canopy volume, not a ladder of flat sprays.
          const forks = 2;
          for (let k = 0; k < forks; k++) {
            const attach = next.clone().lerp(end, .28 + k / forks * .65);
            const fa = a + (k % 2 ? 1 : -1) * (1.0+r()*.8);
            const length = (isBox ? .22 : isOak ? .28 : .23)*(.65+r()*.7);
            const tip = attach.clone().add(v(Math.cos(fa)*length, .045+r()*.14, Math.sin(fa)*length));
            shoot(attach, tip, .0038, isBox ? 6 : 2, !isBox && step >= 4 && k === 1 && stem % 2 === 0);
          }
        }
      }
      prev = next;
    }
    terminals.push(prev);
  }
  terminals.forEach((at, i) => {
    const firstPart = layers.blooms.length;
    const phase = r();
    if (id === "hydrangea" && i % 3 === 0) {
      const top = at.clone().add(v(0.04, 0.37, 0));
      twig(at, top, 0.008, "blooms", at, "#b9ab83");
      for (let j = 0; j < 24; j++) {
        const t = Math.pow(r(), .82),
          a = r()*Math.PI*2,
          rad = .18*Math.pow(1-t,.72)*(.75+r()*.25)+.008;
        const p = at
          .clone()
          .add(v(Math.cos(a) * rad, t * 0.37, Math.sin(a) * rad));
        floret(
          p,
          0.075 + r() * 0.024,
          at,
          new T.Color("#ffffff").multiplyScalar(0.82 + r() * 0.18),
          phase,
          v(Math.cos(a)*.65, .5+r()*.7, Math.sin(a)*.65),
        );
      }
    } else if (id === "fothergilla" && i % 2 === 0) {
      twig(at, at.clone().add(v(0, 0.22, 0)), 0.006, "blooms", at, "#d4ce9e");
      for (let j = 0; j < 26; j++) {
        const a = j * 2.4,
          t = j / 26,
          root = at.clone().add(v(0, t * 0.22, 0));
        const end = root
          .clone()
          .add(v(Math.cos(a) * 0.065, 0.025, Math.sin(a) * 0.065));
        twig(root, end, 0.0022, "blooms", at, "#eee9cd");
        const g = new T.OctahedronGeometry(0.009);
        g.translate(...end);
        add("blooms", g, at, "#fffbed", phase);
      }
    } else if (id === "dogwood" && i % 3 === 0) {
      for (let j = 0; j < 14; j++) {
        const a = j * 2.4,
          rad = Math.sqrt(j / 14) * 0.13;
        const p = at
          .clone()
          .add(v(Math.cos(a) * rad, 0.025 + r() * 0.045, Math.sin(a) * rad));
        floret(p, 0.024, at, "#f2eedc", phase);
        if (j < 5) {
          const g = new T.IcosahedronGeometry(0.028, 0);
          g.translate(...p);
          add("fruit", g, at, "#d8ddd1", phase);
        }
      }
    } else if (id === "boxwood" && i % 5 === 0) {
      const g = new T.IcosahedronGeometry(0.017, 0);
      g.translate(...at);
      add("blooms", g, at, "#d9d4a7", phase);
    }
    if (isOak) {
      const tilt = new T.Euler((r()-.5)*.70, r()*Math.PI*2, (r()-.5)*.60);
      const scale = .76+r()*.48;
      for (const part of layers.blooms.slice(firstPart)) {
        part.translate(-at.x,-at.y,-at.z);
        part.scale(scale,scale,scale);
        part.applyQuaternion(new T.Quaternion().setFromEuler(tilt));
        part.translate(...at);
      }
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
      roughness: name === "leaves" ? .72 : .92,
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
