import type { ScenarioInput } from "./types";

export const DEFAULT_RETIREMENT_START_YEAR_OFFSET = 20;

export function getDefaultScenario(currentYear: number): ScenarioInput {
  return {
    annualSavings: 23500,
    currentAnnualSpending: 50000,
    currentPortfolio: 100000,
    numberOfSimulations: 1000,
    retirementStartYear: currentYear + DEFAULT_RETIREMENT_START_YEAR_OFFSET,
    retirementStrategy: {
      annualInflationAdjustment: 0.025,
      annualSpending: 50000,
      mode: "fixed-dollars",
    },
    yearsInRetirement: 30,
  };
}
