import { describe, expect, it } from "vitest";
import { validateScenarioInput } from "../src/domain/scenario-validation";
import { simulatePath } from "../src/simulation/path-simulation";
import { simulatePercentOfPortfolioRetirementYear } from "../src/simulation/strategy-percent-of-portfolio";

describe("simulation edge cases", () => {
  it("allows retirement to start in the current year", () => {
    expect(
      validateScenarioInput(
        {
          annualSavings: 0,
          currentPortfolio: 500000,
          numberOfSimulations: 100,
          retirementStartYear: 2030,
          retirementStrategy: {
            annualInflationAdjustment: 0.02,
            annualSpending: 50000,
            mode: "fixed-dollars",
          },
          yearsInRetirement: 30,
        },
        2030,
      ),
    ).toEqual({ errors: [], isValid: true });
  });

  it("keeps a zero-balance path pinned at zero from the start", () => {
    expect(
      simulatePath({
        annualReturns: [0.1, 0.1],
        currentYear: 2030,
        scenario: {
          annualSavings: 0,
          currentPortfolio: 0,
          numberOfSimulations: 1,
          retirementStartYear: 2030,
          retirementStrategy: {
            annualInflationAdjustment: 0,
            annualSpending: 20000,
            mode: "fixed-dollars",
          },
          yearsInRetirement: 2,
        },
        simulation: 1,
      }).map((point) => ({
        depleted: point.depleted,
        endingBalance: point.endingBalance,
        withdrawal: point.withdrawal,
      })),
    ).toEqual([
      { depleted: true, endingBalance: 0, withdrawal: 0 },
      { depleted: true, endingBalance: 0, withdrawal: 0 },
    ]);
  });

  it("returns zero withdrawal for percent mode when the balance is already zero", () => {
    expect(
      simulatePercentOfPortfolioRetirementYear({
        annualReturn: 0.12,
        calendarYear: 2035,
        simulation: 4,
        startingBalance: 0,
        withdrawalRate: 0.2,
      }),
    ).toMatchObject({
      depleted: true,
      endingBalance: 0,
      withdrawal: 0,
    });
  });
});
