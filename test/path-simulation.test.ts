import { describe, expect, it } from "vitest";
import { simulatePath } from "../src/simulation/path-simulation";

describe("path simulation", () => {
  it("simulates accumulation followed by retirement over a controlled return sequence", () => {
    const points = simulatePath({
      annualReturns: [0.1, -0.1, 0.2, 0],
      currentYear: 2026,
      scenario: {
        annualSavings: 1000,
        currentPortfolio: 10000,
        numberOfSimulations: 1,
        retirementStartYear: 2028,
        retirementStrategy: {
          annualInflationAdjustment: 0,
          annualSpending: 3000,
          mode: "fixed-dollars",
        },
        yearsInRetirement: 2,
      },
      simulation: 1,
    });

    expect(points).toHaveLength(4);
    expect(points.map((point) => point.calendarYear)).toEqual([2026, 2027, 2028, 2029]);
    expect(points.map((point) => point.phase)).toEqual([
      "accumulation",
      "accumulation",
      "retirement",
      "retirement",
    ]);
    expect(points.map((point) => point.endingBalance)).toEqual([12000, 11800, 11160, 8160]);
  });

  it("keeps later years at zero once a path has depleted", () => {
    const points = simulatePath({
      annualReturns: [-0.5, 0.3, 0.3],
      currentYear: 2026,
      scenario: {
        annualSavings: 0,
        currentPortfolio: 1000,
        numberOfSimulations: 1,
        retirementStartYear: 2026,
        retirementStrategy: {
          annualInflationAdjustment: 0,
          annualSpending: 700,
          mode: "fixed-dollars",
        },
        yearsInRetirement: 3,
      },
      simulation: 7,
    });

    expect(points.map((point) => point.endingBalance)).toEqual([0, 0, 0]);
    expect(points.map((point) => point.withdrawal)).toEqual([500, 0, 0]);
    expect(points.map((point) => point.depleted)).toEqual([true, true, true]);
    expect(points[1]?.investmentIncome).toBe(0);
    expect(points[2]?.investmentIncome).toBe(0);
  });
});
