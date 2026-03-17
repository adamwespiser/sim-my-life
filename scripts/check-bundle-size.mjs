import { gzipSync } from "node:zlib";
import { readFileSync } from "node:fs";

const bundlePath = new URL("../dist/sim-returns.js", import.meta.url);
const targetGzipBytes = 150 * 1024;
const hardLimitGzipBytes = 200 * 1024;

function formatKilobytes(bytes) {
  return `${(bytes / 1024).toFixed(2)} KB`;
}

let bundle;

try {
  bundle = readFileSync(bundlePath);
} catch (error) {
  console.error(
    "Bundle size check failed: dist/sim-returns.js was not found. Run npm run build first.",
  );
  throw error;
}

const gzipBytes = gzipSync(bundle).byteLength;
const rawBytes = bundle.byteLength;

console.log("Bundle: dist/sim-returns.js");
console.log(`Raw size: ${formatKilobytes(rawBytes)}`);
console.log(`Gzip size: ${formatKilobytes(gzipBytes)}`);
console.log(`Target gzip budget: ${formatKilobytes(targetGzipBytes)}`);
console.log(`Hard gzip limit: ${formatKilobytes(hardLimitGzipBytes)}`);

if (gzipBytes > hardLimitGzipBytes) {
  console.error("Bundle size check failed: gzip size exceeds the hard bundle budget.");
  process.exit(1);
}

if (gzipBytes > targetGzipBytes) {
  console.warn(
    "Bundle size warning: gzip size exceeds the target budget but is still under the hard limit.",
  );
}
