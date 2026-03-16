import { describe, expect, it } from "vitest";
import { simulateAccumulationYear } from "../src/simulation/path-simulation";

describe("accumulation year simulation", () => {
  it("applies annual growth and then adds annual savings", () => {
    const point = simulateAccumulationYear({
      annualReturn: 0.1,
      annualSavings: 12000,
      calendarYear: 2026,
      simulation: 1,
      startingBalance: 50000,
    });

    expect(point).toEqual({
      annualReturn: 0.1,
      calendarYear: 2026,
      contribution: 12000,
      depleted: false,
      endingBalance: 67000,
      investmentIncome: 5000,
      phase: "accumulation",
      simulation: 1,
      startingBalance: 50000,
      withdrawal: 0,
    });
  });
});
