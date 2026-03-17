import { describe, expect, it } from "vitest";
import type { YearlyPathPoint } from "../src/domain/types";
import { getHoverYearDistributions } from "../src/metrics/hover-distributions";

describe("hover year distributions", () => {
  it("returns investment income, withdrawal, and asset distributions for the selected year", () => {
    const paths = [
      [
        makePoint({
          calendarYear: 2026,
          endingBalance: 1100,
          investmentIncome: 100,
          phase: "accumulation",
          withdrawal: 0,
        }),
        makePoint({
          calendarYear: 2027,
          endingBalance: 900,
          investmentIncome: -100,
          phase: "retirement",
          withdrawal: 200,
        }),
      ],
      [
        makePoint({
          calendarYear: 2026,
          endingBalance: 950,
          investmentIncome: 200,
          phase: "retirement",
          withdrawal: 50,
        }),
        makePoint({
          calendarYear: 2027,
          endingBalance: 1200,
          investmentIncome: 150,
          phase: "retirement",
          withdrawal: 75,
        }),
      ],
    ];

    expect(getHoverYearDistributions(paths, 2026)).toEqual({
      accountAssets: [1100, 950],
      calendarYear: 2026,
      investmentIncome: [100, 200],
      withdrawals: [0, 50],
    });

    expect(getHoverYearDistributions(paths, 2027)).toEqual({
      accountAssets: [900, 1200],
      calendarYear: 2027,
      investmentIncome: [-100, 150],
      withdrawals: [200, 75],
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
