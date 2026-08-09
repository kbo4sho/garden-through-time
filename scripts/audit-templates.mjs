import { readFile } from "node:fs/promises";
import ts from "typescript";

const sourceUrl = new URL("../src/data/plants.ts", import.meta.url);
const source = await readFile(sourceUrl, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: sourceUrl.pathname,
}).outputText;
const dataUrl = `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`;
const {
  compositionTemplates,
  defaultPlanting,
  defaultTemplateId,
  plants,
} = await import(dataUrl);

const errors = [];
const sizes = [3, 5, 7];
const plantById = new Map(plants.map((plant) => [plant.id, plant]));

if (compositionTemplates.length !== 9) {
  errors.push(`Expected 9 templates; found ${compositionTemplates.length}.`);
}

const templateIds = compositionTemplates.map((template) => template.id);
if (new Set(templateIds).size !== templateIds.length) {
  errors.push("Template IDs must be unique.");
}

for (const size of sizes) {
  const templates = compositionTemplates.filter((template) => template.size === size);
  if (templates.length !== 3) {
    errors.push(`Expected 3 templates for size ${size}; found ${templates.length}.`);
  }
  if (templates.filter((template) => template.accessTier === "preview").length !== 1) {
    errors.push(`Size ${size} must have exactly one preview template.`);
  }
}

for (const template of compositionTemplates) {
  if (template.planting.length !== template.size) {
    errors.push(
      `${template.id} declares size ${template.size} but has ${template.planting.length} positions.`,
    );
  }
  for (const plantId of template.planting) {
    const plant = plantById.get(plantId);
    if (!plant) {
      errors.push(`${template.id} references unknown plant ${plantId}.`);
      continue;
    }
    if (template.accessTier === "preview" && plant.accessTier !== "preview") {
      errors.push(`${template.id} depends on full-library plant ${plantId}.`);
    }
  }
  for (const season of ["winter", "spring", "summer", "fall"]) {
    if (!template.seasonalCarry[season]?.trim()) {
      errors.push(`${template.id} is missing its ${season} seasonal carrier.`);
    }
  }
}

const defaultTemplate = compositionTemplates.find(
  (template) => template.id === defaultTemplateId,
);
if (!defaultTemplate) {
  errors.push(`Default template ${defaultTemplateId} does not exist.`);
} else if (defaultPlanting.join("|") !== defaultTemplate.planting.join("|")) {
  errors.push("The protected default planting no longer matches its template.");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Template audit passed: ${compositionTemplates.length} templates, ` +
      `${plants.length} plants, one preview recommendation per size.`,
  );
}
