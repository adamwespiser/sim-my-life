import { describe, expect, it } from "vitest";
import { getSimulationPhaseForYear } from "../src/simulation/timeline";

describe("retirement boundary", () => {
  it("treats the retirement start year as a retirement year", () => {
    expect(getSimulationPhaseForYear(2029, 2030)).toBe("accumulation");
    expect(getSimulationPhaseForYear(2030, 2030)).toBe("retirement");
    expect(getSimulationPhaseForYear(2031, 2030)).toBe("retirement");
  });
});
