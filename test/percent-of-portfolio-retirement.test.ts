import { describe, expect, it } from "vitest";
import { simulatePercentOfPortfolioRetirementYear } from "../src/simulation/strategy-percent-of-portfolio";

describe("percent-of-portfolio retirement strategy", () => {
  it("withdraws a percentage of the post-growth balance", () => {
    const point = simulatePercentOfPortfolioRetirementYear({
      annualReturn: 0.1,
      calendarYear: 2030,
      simulation: 1,
      startingBalance: 100000,
      withdrawalRate: 0.04,
    });

    expect(point.withdrawal).toBeCloseTo(4400, 6);
    expect(point.endingBalance).toBeCloseTo(105600, 6);
    expect(point.depleted).toBe(false);
    expect(point.phase).toBe("retirement");
  });

  it("caps withdrawals at available assets and depletes the path at zero", () => {
    const point = simulatePercentOfPortfolioRetirementYear({
      annualReturn: -0.6,
      calendarYear: 2031,
      simulation: 2,
      startingBalance: 10000,
      withdrawalRate: 1.5,
    });

    expect(point.withdrawal).toBe(4000);
    expect(point.endingBalance).toBe(0);
    expect(point.depleted).toBe(true);
  });
});
