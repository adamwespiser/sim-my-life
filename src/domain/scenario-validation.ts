import type { ScenarioInput } from "./types";

export interface ScenarioValidationResult {
  errors: string[];
  isValid: boolean;
}

export function normalizeScenarioInput(input: ScenarioInput): ScenarioInput {
  return {
    ...input,
    numberOfSimulations: Math.round(input.numberOfSimulations),
    retirementStartYear: Math.round(input.retirementStartYear),
    yearsInRetirement: Math.round(input.yearsInRetirement),
  };
}

export function validateScenarioInput(
  input: ScenarioInput,
  currentYear: number,
): ScenarioValidationResult {
  const errors: string[] = [];

  if (input.annualSavings < 0) {
    errors.push("annualSavings must be greater than or equal to 0");
  }

  if (input.currentPortfolio < 0) {
    errors.push("currentPortfolio must be greater than or equal to 0");
  }

  if (input.numberOfSimulations < 1) {
    errors.push("numberOfSimulations must be greater than or equal to 1");
  }

  if (input.retirementStartYear < currentYear) {
    errors.push("retirementStartYear must be greater than or equal to the current year");
  }

  if (input.yearsInRetirement < 1) {
    errors.push("yearsInRetirement must be greater than or equal to 1");
  }

  if (input.currentAnnualSpending != null && input.currentAnnualSpending < 0) {
    errors.push("currentAnnualSpending must be greater than or equal to 0");
  }

  if (input.retirementStrategy.mode === "fixed-dollars") {
    if (input.retirementStrategy.annualSpending <= 0) {
      errors.push("annualSpending must be greater than 0 in fixed-dollars mode");
    }

    if (input.retirementStrategy.annualInflationAdjustment < 0) {
      errors.push(
        "annualInflationAdjustment must be greater than or equal to 0 in fixed-dollars mode",
      );
    }
  }

  if (input.retirementStrategy.mode === "percent-of-portfolio") {
    if (input.retirementStrategy.withdrawalRate <= 0) {
      errors.push("withdrawalRate must be greater than 0 in percent-of-portfolio mode");
    }
  }

  return {
    errors,
    isValid: errors.length === 0,
  };
}
