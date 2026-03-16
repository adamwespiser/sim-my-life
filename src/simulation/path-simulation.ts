import type { YearlyPathPoint } from "../domain/types";

export interface AccumulationYearInput {
  annualReturn: number;
  annualSavings: number;
  calendarYear: number;
  simulation: number;
  startingBalance: number;
}

export function simulateAccumulationYear(input: AccumulationYearInput): YearlyPathPoint {
  const investmentIncome = input.startingBalance * input.annualReturn;
  const endingBalance = input.startingBalance + investmentIncome + input.annualSavings;

  return {
    annualReturn: input.annualReturn,
    calendarYear: input.calendarYear,
    contribution: input.annualSavings,
    depleted: endingBalance <= 0,
    endingBalance,
    investmentIncome,
    phase: "accumulation",
    simulation: input.simulation,
    startingBalance: input.startingBalance,
    withdrawal: 0,
  };
}
