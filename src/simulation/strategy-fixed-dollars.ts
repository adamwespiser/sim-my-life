import type { YearlyPathPoint } from "../domain/types";

export interface FixedDollarsRetirementYearInput {
  annualInflationAdjustment: number;
  annualReturn: number;
  baseAnnualSpending: number;
  calendarYear: number;
  retirementYearIndex: number;
  simulation: number;
  startingBalance: number;
}

export function simulateFixedDollarsRetirementYear(
  input: FixedDollarsRetirementYearInput,
): YearlyPathPoint {
  const investmentIncome = input.startingBalance * input.annualReturn;
  const balanceAfterGrowth = input.startingBalance + investmentIncome;
  const plannedWithdrawal =
    input.baseAnnualSpending * (1 + input.annualInflationAdjustment) ** input.retirementYearIndex;
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
