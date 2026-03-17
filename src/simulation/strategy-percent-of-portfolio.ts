import type { YearlyPathPoint } from "../domain/types";

export interface PercentOfPortfolioRetirementYearInput {
  annualReturn: number;
  calendarYear: number;
  simulation: number;
  startingBalance: number;
  withdrawalRate: number;
}

export function simulatePercentOfPortfolioRetirementYear(
  input: PercentOfPortfolioRetirementYearInput,
): YearlyPathPoint {
  const investmentIncome = input.startingBalance * input.annualReturn;
  const balanceAfterGrowth = input.startingBalance + investmentIncome;
  const plannedWithdrawal = input.withdrawalRate * balanceAfterGrowth;
  const withdrawal = Math.min(plannedWithdrawal, balanceAfterGrowth);
  const endingBalance = Math.max(balanceAfterGrowth - withdrawal, 0);

  return {
    annualReturn: input.annualReturn,
    calendarYear: input.calendarYear,
    contribution: 0,
    depleted: endingBalance <= 0,
    endingBalance,
    investmentIncome,
    phase: "retirement",
    simulation: input.simulation,
    startingBalance: input.startingBalance,
    withdrawal,
  };
}
