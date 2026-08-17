import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const assetDirectory = path.join(root, "public", "textures", "hand-drawn-page");
const plants = [
  "fothergilla",
  "hydrangea",
  "dogwood",
  "smooth-hydrangea",
  "panicle-hydrangea",
  "sweetspire",
  "summersweet",
  "viburnum",
  "serviceberry",
  "ninebark",
  "boxwood",
  "buttonbush",
  "winterberry",
];
const stages = ["winter", "leafout", "bloom", "summer", "fall"];
const expectedNames = plants.flatMap((plant) =>
  stages.map((stage) => `${plant}-${stage}.png`),
);
const expectedNameSet = new Set(expectedNames);
const minimumBytes = 10_000;
const errors = [];
const hashes = new Map();

let entries = [];
try {
  entries = await readdir(assetDirectory, { withFileTypes: true });
} catch (error) {
  errors.push(
    `Unable to read ${assetDirectory}: ${error instanceof Error ? error.message : error}`,
  );
}

const pngNames = entries
  .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".png"))
  .map((entry) => entry.name)
  .sort();

if (pngNames.length !== expectedNames.length) {
  errors.push(`Expected exactly ${expectedNames.length} PNGs; found ${pngNames.length}.`);
}

for (const name of expectedNames) {
  if (!pngNames.includes(name)) errors.push(`Missing expected asset: ${name}.`);
}

for (const name of pngNames) {
  if (!expectedNameSet.has(name)) errors.push(`Unexpected PNG asset: ${name}.`);
}

for (const name of expectedNames) {
  if (!pngNames.includes(name)) continue;
  const filePath = path.join(assetDirectory, name);
  const [buffer, fileStats] = await Promise.all([readFile(filePath), stat(filePath)]);
  const pngSignature = buffer.subarray(0, 8).equals(
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  );

  if (!pngSignature || buffer.length < 33 || buffer.toString("ascii", 12, 16) !== "IHDR") {
    errors.push(`${name} is not a structurally recognizable PNG.`);
    continue;
  }

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const colorType = buffer[25];
  if (width !== 600 || height !== 600) {
    errors.push(`${name} is ${width}x${height}; expected 600x600.`);
  }
  if (colorType !== 4 && colorType !== 6) {
    errors.push(
      `${name} uses PNG color type ${colorType}; expected alpha-capable type 4 or 6.`,
    );
  }
  if (fileStats.size < minimumBytes) {
    errors.push(
      `${name} is only ${fileStats.size} bytes; expected at least ${minimumBytes}.`,
    );
  }

  const hash = createHash("sha256").update(buffer).digest("hex");
  const duplicate = hashes.get(hash);
  if (duplicate) {
    errors.push(`${name} duplicates ${duplicate} (SHA-256 ${hash}).`);
  } else {
    hashes.set(hash, name);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Hand-drawn page asset audit passed: ${expectedNames.length} unique 600x600 alpha PNGs.`,
  );
}
