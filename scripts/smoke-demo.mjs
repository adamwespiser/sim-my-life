import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  createMountedApp,
  ensureBuiltBundleExists,
  loadBuiltAppBundle,
} from "./browser-harness.mjs";

const demoHtml = await readFile(resolve(process.cwd(), "demo.html"), "utf8");

if (!demoHtml.includes('<script type="module" src="./dist/sim-returns.js"></script>')) {
  throw new Error("demo.html must load ./dist/sim-returns.js");
}

if (!demoHtml.includes("<sim-returns-app></sim-returns-app>")) {
  throw new Error("demo.html must include the one-line <sim-returns-app></sim-returns-app> embed.");
}

await ensureBuiltBundleExists();
await loadBuiltAppBundle();

const element = createMountedApp();

if (element.shadowRoot == null) {
  throw new Error("Built bundle did not mount a Shadow DOM app shell.");
}

if (element.shadowRoot.querySelector("[data-testid='controls']") == null) {
  throw new Error("Built bundle did not render the expected controls section.");
}

console.log("demo smoke passed");
