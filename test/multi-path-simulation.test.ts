import { describe, expect, it } from "vitest";
import { simulateBootstrapPaths } from "../src/simulation/multi-path-simulation";

describe("multi-path simulation", () => {
  it("bootstraps deterministic paths from historical returns for a fixed seed", () => {
    const result = simulateBootstrapPaths({
      currentYear: 2026,
      historicalReturns: [
        { totalReturn: 0.1, year: 2000 },
        { totalReturn: -0.2, year: 2001 },
        { totalReturn: 0, year: 2002 },
      ],
      scenario: {
        annualSavings: 10,
        currentPortfolio: 100,
        numberOfSimulations: 2,
        retirementStartYear: 2027,
        retirementStrategy: {
          annualInflationAdjustment: 0,
          annualSpending: 50,
          mode: "fixed-dollars",
        },
        yearsInRetirement: 1,
      },
      seed: 123,
    });

    expect(result.resolvedSeed).toBe(123);
    expect(result.completedPaths).toBe(2);
    expect(result.totalPaths).toBe(2);
    expect(result.points).toHaveLength(2);
    expect(result.points[0]?.map((point) => point.annualReturn)).toEqual([0, 0.1]);
    expect(result.points[1]?.map((point) => point.annualReturn)).toEqual([-0.2, 0.1]);
    expect(result.points[0]?.map((point) => point.endingBalance)).toEqual([110, 71]);
    expect(result.points[1]?.map((point) => point.endingBalance)).toEqual([90, 49]);
  });
});
