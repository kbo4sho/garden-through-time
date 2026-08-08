import { copyFile, mkdir, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));

function run(modulePath, args) {
  const result = spawnSync(process.execPath, [modulePath, ...args], {
    cwd: root,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run(path.join(root, "node_modules/typescript/bin/tsc"), ["-b"]);
await rm(path.join(root, "dist"), { recursive: true, force: true });
run(path.join(root, "node_modules/vite/bin/vite.js"), ["build"]);

const serverDirectory = path.join(root, "dist/server");
await mkdir(serverDirectory, { recursive: true });
await copyFile(
  path.join(root, "sites/worker.js"),
  path.join(serverDirectory, "index.js"),
);
