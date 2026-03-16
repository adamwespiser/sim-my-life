import { describe, expect, it } from "vitest";
import { normalizeScenarioInput, validateScenarioInput } from "../src/domain/scenario-validation";
import type { ScenarioInput } from "../src/domain/types";

describe("scenario validation", () => {
  it("normalizes integer-like fields and accepts a valid fixed-dollars scenario", () => {
    const rawScenario = {
      annualSavings: 12000,
      currentPortfolio: 50000,
      numberOfSimulations: 5000.4,
      retirementStartYear: 2050.6,
      retirementStrategy: {
        annualInflationAdjustment: 0.025,
        annualSpending: 50000,
        mode: "fixed-dollars" as const,
      },
      yearsInRetirement: 30.2,
    } satisfies ScenarioInput;

    const normalized = normalizeScenarioInput(rawScenario);

    expect(normalized.numberOfSimulations).toBe(5000);
    expect(normalized.retirementStartYear).toBe(2051);
    expect(normalized.yearsInRetirement).toBe(30);
    expect(validateScenarioInput(normalized, 2026)).toEqual({ errors: [], isValid: true });
  });

  it("rejects invalid numeric values and past retirement years", () => {
    const invalidScenario: ScenarioInput = {
      annualSavings: -1,
      currentPortfolio: -10,
      numberOfSimulations: 0,
      retirementStartYear: 2025,
      retirementStrategy: {
        annualInflationAdjustment: -0.01,
        annualSpending: 0,
        mode: "fixed-dollars",
      },
      yearsInRetirement: 0,
    };

    const result = validateScenarioInput(invalidScenario, 2026);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("annualSavings must be greater than or equal to 0");
    expect(result.errors).toContain("currentPortfolio must be greater than or equal to 0");
    expect(result.errors).toContain("numberOfSimulations must be greater than or equal to 1");
    expect(result.errors).toContain(
      "retirementStartYear must be greater than or equal to the current year",
    );
    expect(result.errors).toContain("yearsInRetirement must be greater than or equal to 1");
    expect(result.errors).toContain("annualSpending must be greater than 0 in fixed-dollars mode");
    expect(result.errors).toContain(
      "annualInflationAdjustment must be greater than or equal to 0 in fixed-dollars mode",
    );
  });
});
