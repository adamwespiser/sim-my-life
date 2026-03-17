import { describe, expect, it } from "vitest";
import type { YearlyPathPoint } from "../src/domain/types";
import { calculateYearlyPercentiles } from "../src/metrics/percentiles";

describe("yearly percentiles", () => {
  it("calculates p10, p50, and p90 for each modeled year", () => {
    const paths = [
      [
        makePoint({ calendarYear: 2026, endingBalance: 100 }),
        makePoint({ calendarYear: 2027, endingBalance: 50 }),
      ],
      [
        makePoint({ calendarYear: 2026, endingBalance: 200 }),
        makePoint({ calendarYear: 2027, endingBalance: 150 }),
      ],
      [
        makePoint({ calendarYear: 2026, endingBalance: 300 }),
        makePoint({ calendarYear: 2027, endingBalance: 250 }),
      ],
    ];

    expect(calculateYearlyPercentiles(paths)).toEqual([
      { calendarYear: 2026, p10: 120, p50: 200, p90: 280 },
      { calendarYear: 2027, p10: 70, p50: 150, p90: 230 },
    ]);
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
