import { describe, expect, it } from "vitest";
import {
  RETIREMENT_MODES,
  type BatchResult,
  type ScenarioInput,
  type YearlyPathPoint,
} from "../src/domain/types";

describe("domain types", () => {
  it("exposes the supported retirement modes and core scenario/result shapes", () => {
    const scenario: ScenarioInput = {
      annualSavings: 12000,
      currentPortfolio: 50000,
      numberOfSimulations: 5000,
      retirementStartYear: 2051,
      retirementStrategy: {
        annualInflationAdjustment: 0.025,
        annualSpending: 50000,
        mode: "fixed-dollars",
      },
      yearsInRetirement: 30,
    };

    const point: YearlyPathPoint = {
      annualReturn: 0.1,
      calendarYear: 2026,
      contribution: 12000,
      depleted: false,
      endingBalance: 67000,
      investmentIncome: 5000,
      phase: "accumulation",
      simulation: 1,
      startingBalance: 50000,
      withdrawal: 0,
    };

    const batch: BatchResult = {
      completedPaths: 10,
      points: [[point]],
      resolvedSeed: 1700000000,
      totalPaths: 100,
    };

    expect(RETIREMENT_MODES).toEqual(["fixed-dollars", "percent-of-portfolio"]);
    expect(scenario.retirementStrategy.mode).toBe("fixed-dollars");
    expect(batch.points[0][0].phase).toBe("accumulation");
  });
});
