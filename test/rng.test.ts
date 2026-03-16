import { describe, expect, it } from "vitest";
import { createRng, resolveSeed } from "../src/simulation/rng";

describe("rng utilities", () => {
  it("produces deterministic sequences for a fixed seed", () => {
    const rngA = createRng(123);
    const rngB = createRng(123);

    expect([rngA(), rngA(), rngA()]).toEqual([rngB(), rngB(), rngB()]);
  });

  it("uses unix time seconds when no seed is provided", () => {
    expect(resolveSeed(undefined, () => 1700000000)).toBe(1700000000);
    expect(resolveSeed(42, () => 1700000000)).toBe(42);
  });
});
