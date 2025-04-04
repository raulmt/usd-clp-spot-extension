import { build } from "vite";
import fs from "fs/promises";
import path from "path";

async function copyManifest() {
  const manifest = JSON.parse(
    await fs.readFile("./src/manifest.json", "utf-8")
  );

  // Update the service worker path to point to the built file
  manifest.background.service_worker = "background.js";

  await fs.writeFile("./dist/manifest.json", JSON.stringify(manifest, null, 2));
}

async function buildExtension() {
  try {
    await build();
    await copyManifest();
    console.log("Build completed successfully!");
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

buildExtension();
