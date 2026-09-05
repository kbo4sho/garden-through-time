import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import { NodeIO } from "@gltf-transform/core";
import {
  EXTMeshoptCompression,
  KHRMeshQuantization,
} from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";
const dataUrl = (s) =>
  `data:text/javascript;base64,${Buffer.from(s).toString("base64")}`;
const compile = async (path) =>
  ts
    .transpileModule(await readFile(new URL(path, import.meta.url), "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.ES2022,
        target: ts.ScriptTarget.ES2022,
      },
    })
    .outputText.replace(
      /from ["']three["']/g,
      `from '${import.meta.resolve("three")}'`,
    );
const plantModule = await compile("../src/data/plants.ts");
const { plants, compositionTemplates } = await import(dataUrl(plantModule));
const season = dataUrl(await compile("../src/lib/season.ts"));
const { modelSeason } = await import(
  dataUrl(
    (await compile("../src/lib/modelSeason.ts")).replace(
      /["']\.\/season["']/,
      `'${season}'`,
    ),
  )
);
const manifest = JSON.parse(
  await readFile(
    new URL("../public/models/manifest.json", import.meta.url),
    "utf8",
  ),
);
const modelCode = (await compile("../src/data/modelPlants.ts")).replace(
  /import modelManifest from .*?;/,
  `const modelManifest = ${JSON.stringify(manifest)};`,
);
const { modelYearTemplate, hasPlantModel } = await import(dataUrl(modelCode));
const { serializeShareSearch, parseShareSearch } = await import(
  dataUrl(await compile("../src/lib/shareLink.ts"))
);
const catalog = {
  templates: [...compositionTemplates, modelYearTemplate],
  plantIds: new Set(plants.map((p) => p.id)),
  defaultTemplateId: "balanced-year-3",
};
for (const id of [
  "balanced-year-3",
  "layered-seasons-5",
  "living-framework-7",
]) {
  const t = catalog.templates.find((t) => t.id === id);
  assert(t.planting.every(hasPlantModel), `${id} must use only model plants`);
  const query = serializeShareSearch(
    {
      day: 15,
      templateId: id,
      planting: t.planting,
      templatePlanting: t.planting,
      from: "Kevin",
    },
    { style: "model3d" },
  );
  assert.equal(query.get("renderer"), "gltf");
  assert.deepEqual(parseShareSearch(query, catalog).planting, t.planting);
}
assert(!hasPlantModel("winterberry"));
assert(!hasPlantModel("serviceberry"));
const get = (id, day) =>
  modelSeason(
    plants.find((p) => p.id === id),
    day,
  );
for (const id of Object.keys(manifest.models))
  for (let day = 1; day <= 365; day++) {
    const state = get(id, day);
    for (const key of ["leaves", "fall", "bloom", "fruit"])
      assert(
        Number.isFinite(state[key]) && state[key] >= 0 && state[key] <= 1,
        `${id} ${day} ${key}`,
      );
    if (id === "boxwood") assert.equal(state.leaves, 1);
    else if (day === 1 || day === 365) assert.equal(state.leaves, 0);
    if (day < 365)
      for (const key of ["leaves", "fall", "bloom", "fruit"])
        assert(
          Math.abs(state[key] - get(id, day + 1)[key]) < 0.2,
          `${id} abrupt ${key} at ${day}`,
        );
  }
assert(
  get("fothergilla", 125).bloom > 0.5 && get("hydrangea", 125).bloom === 0,
);
assert(
  get("hydrangea", 190).bloom === 1 && get("fothergilla", 190).bloom === 0,
);
assert(get("dogwood", 225).fruit > 0.5 && get("dogwood", 15).fruit === 0);
for (const day of [245, 270, 300, 315, 350, 1, 50])
  assert(
    get("hydrangea", day).bloom > 0.5,
    "No missing or respawning aged heads",
  );
assert(get("hydrangea", 105).bloom === 0);
assert(get("boxwood", 365).fall === get("boxwood", 1).fall);
await MeshoptDecoder.ready;
const io = new NodeIO()
  .registerExtensions([EXTMeshoptCompression, KHRMeshQuantization])
  .registerDependencies({ "meshopt.decoder": MeshoptDecoder });
let bytes = 0,
  decoded = 0;
for (const [id, info] of Object.entries(manifest.models)) {
  const binary = await readFile(
    new URL(`../public/models/${info.file}`, import.meta.url),
  );
  bytes += binary.length;
  assert.equal(binary.length, info.bytes);
  const doc = await io.readBinary(binary);
  assert.equal(doc.getRoot().listTextures().length, 0);
  const names = doc
    .getRoot()
    .listNodes()
    .map((n) => n.getName());
  for (const layer of ["branches", "leaves", "blooms"])
    assert(names.includes(layer));
  for (const mesh of doc.getRoot().listMeshes())
    for (const prim of mesh.listPrimitives()) {
      const position = prim.getAttribute("POSITION"),
        anchor = prim.getAttribute("_ANCHOR"),
        phase = prim.getAttribute("_PHASE");
      assert(position && anchor && phase);
      assert.equal(position.getCount(), anchor.getCount());
      assert.equal(position.getCount(), phase.getCount());
      for (const semantic of prim.listSemantics()) {
        const a = prim.getAttribute(semantic).getArray();
        decoded += a.byteLength;
        assert(a.every(Number.isFinite), `${id} invalid ${semantic}`);
      }
      assert(
        prim
          .getIndices()
          .getArray()
          .every((i) => i < position.getCount()),
      );
    }
}
assert(bytes < 5_000_000, `Model download budget exceeded: ${bytes}`);
assert(
  decoded < 24_000_000,
  `Shared geometry memory budget exceeded: ${decoded}`,
);
console.log(
  `Model checks passed: all 365 days, independent seasons, cross-year continuity, 3/5/7 shares, valid geometry. ${bytes} asset bytes; ${decoded} decoded attribute bytes shared by repeats.`,
);
