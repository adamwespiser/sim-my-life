import { describe, expect, it } from "vitest";
import type { YearlyPathPoint } from "../src/domain/types";
import { calculatePercentOfPortfolioSpendingSummary } from "../src/metrics/spending-summaries";

describe("percent-of-portfolio spending summaries", () => {
  it("reports retirement-start income bands and the tenth retirement year p10 income", () => {
    const paths = [
      makeRetirementPath([400, 390, 380, 370, 360, 350, 340, 330, 320, 300]),
      makeRetirementPath([500, 480, 460, 440, 420, 400, 380, 360, 340, 200]),
      makeRetirementPath([600, 570, 540, 510, 480, 450, 420, 390, 360, 100]),
    ];

    expect(calculatePercentOfPortfolioSpendingSummary(paths)).toEqual({
      retirementStartIncome: { p10: 420, p50: 500, p90: 580 },
      tenthRetirementYearIncomeP10: 120,
    });
  });
});

function makeRetirementPath(withdrawals: number[]): YearlyPathPoint[] {
  return withdrawals.map((withdrawal, index) => ({
    annualReturn: 0,
    calendarYear: 2030 + index,
    contribution: 0,
    depleted: false,
    endingBalance: Math.max(1000 - withdrawal, 0),
    investmentIncome: 0,
    phase: "retirement",
    simulation: 1,
    startingBalance: 1000,
    withdrawal,
  }));
}
