import { describe, expect, it } from "vitest";
import { getDefaultScenario } from "../src/domain/scenario-defaults";

describe("default scenario", () => {
  it("derives the retirement start year from the current year offset", () => {
    const scenario = getDefaultScenario(2026);

    expect(scenario.currentPortfolio).toBe(100000);
    expect(scenario.annualSavings).toBe(23500);
    expect(scenario.retirementStartYear).toBe(2046);
    expect(scenario.yearsInRetirement).toBe(30);
    expect(scenario.numberOfSimulations).toBe(1000);
    expect(scenario.retirementStrategy.mode).toBe("fixed-dollars");
  });
});
