import { describe, expect, it } from "vitest";
import type { YearlyPathPoint } from "../src/domain/types";
import { calculateRetirementSummaries } from "../src/metrics/retirement-summaries";

describe("retirement summaries", () => {
  it("derives balance percentiles, survival probability, median depletion year, and contributions", () => {
    const paths = [
      [
        makePoint({
          calendarYear: 2026,
          contribution: 100,
          endingBalance: 1100,
          phase: "accumulation",
        }),
        makePoint({ calendarYear: 2027, endingBalance: 900, phase: "retirement", withdrawal: 100 }),
        makePoint({ calendarYear: 2028, endingBalance: 800, phase: "retirement", withdrawal: 100 }),
      ],
      [
        makePoint({
          calendarYear: 2026,
          contribution: 100,
          endingBalance: 1100,
          phase: "accumulation",
        }),
        makePoint({ calendarYear: 2027, endingBalance: 700, phase: "retirement", withdrawal: 300 }),
        makePoint({
          calendarYear: 2028,
          depleted: true,
          endingBalance: 0,
          phase: "retirement",
          withdrawal: 700,
        }),
      ],
      [
        makePoint({
          calendarYear: 2026,
          contribution: 100,
          endingBalance: 1100,
          phase: "accumulation",
        }),
        makePoint({ calendarYear: 2027, endingBalance: 1000, phase: "retirement", withdrawal: 50 }),
        makePoint({ calendarYear: 2028, endingBalance: 950, phase: "retirement", withdrawal: 50 }),
      ],
    ];

    expect(calculateRetirementSummaries(paths)).toEqual({
      endOfPlanBalances: { p10: 160, p50: 800, p90: 920 },
      medianDepletionYear: 2028,
      retirementStartBalances: { p10: 740, p50: 900, p90: 980 },
      survivalProbability: 2 / 3,
      totalContributions: 100,
    });
  });
});

function makePoint(overrides: Partial<YearlyPathPoint>): YearlyPathPoint {
  return {
    annualReturn: 0,
    calendarYear: 2026,
    contribution: 0,
    depleted: false,
    endingBalance: 0,
    investmentIncome: 0,
    phase: "retirement",
    simulation: 1,
    startingBalance: 0,
    withdrawal: 0,
    ...overrides,
  };
}
