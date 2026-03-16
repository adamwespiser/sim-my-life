import { describe, expect, it } from "vitest";
import { simulateFixedDollarsRetirementYear } from "../src/simulation/strategy-fixed-dollars";

describe("fixed-dollars retirement strategy", () => {
  it("grows spending by the annual inflation adjustment", () => {
    const point = simulateFixedDollarsRetirementYear({
      annualInflationAdjustment: 0.02,
      annualReturn: -0.1,
      baseAnnualSpending: 5000,
      calendarYear: 2032,
      retirementYearIndex: 2,
      simulation: 1,
      startingBalance: 100000,
    });

    expect(point.withdrawal).toBeCloseTo(5202, 6);
    expect(point.endingBalance).toBeCloseTo(84798, 6);
    expect(point.depleted).toBe(false);
    expect(point.phase).toBe("retirement");
  });

  it("caps withdrawals at available assets and marks the path depleted", () => {
    const point = simulateFixedDollarsRetirementYear({
      annualInflationAdjustment: 0,
      annualReturn: -0.5,
      baseAnnualSpending: 10000,
      calendarYear: 2030,
      retirementYearIndex: 0,
      simulation: 1,
      startingBalance: 10000,
    });

    expect(point.withdrawal).toBe(5000);
    expect(point.endingBalance).toBe(0);
    expect(point.depleted).toBe(true);
  });
});
