import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("demo smoke assumptions", () => {
  it("loads the built bundle and mounts the one-line embed contract", () => {
    const demoHtml = readFileSync(resolve(process.cwd(), "demo.html"), "utf8");

    expect(demoHtml).toContain('<script type="module" src="./dist/sim-returns.js"></script>');
    expect(demoHtml).toContain("<sim-returns-app></sim-returns-app>");
  });
});
