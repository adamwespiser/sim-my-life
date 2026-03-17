import { describe, expect, it } from "vitest";
import type { ScenarioInput, YearlyPathPoint } from "../src/domain/types";
import { buildAppViewModel } from "../src/view-model/view-model-adapter";

describe("view-model adapter", () => {
  it("maps simulation outputs and derived metrics into stable UI contracts", () => {
    const scenario: ScenarioInput = {
      annualSavings: 50,
      currentPortfolio: 100,
      numberOfSimulations: 2,
      retirementStartYear: 2027,
      retirementStrategy: {
        mode: "percent-of-portfolio",
        withdrawalRate: 0.04,
      },
      yearsInRetirement: 1,
    };

    const paths = [
      [
        makePoint({
          calendarYear: 2026,
          endingBalance: 100,
          phase: "accumulation",
          simulation: 1,
        }),
        makePoint({
          calendarYear: 2027,
          endingBalance: 80,
          phase: "retirement",
          simulation: 1,
        }),
      ],
      [
        makePoint({
          calendarYear: 2026,
          endingBalance: 120,
          phase: "accumulation",
          simulation: 2,
        }),
        makePoint({
          calendarYear: 2027,
          endingBalance: 90,
          phase: "retirement",
          simulation: 2,
        }),
      ],
    ];

    expect(
      buildAppViewModel({
        hoverDistributions: {
          accountAssets: [80, 90],
          calendarYear: 2027,
          investmentIncome: [-10, 5],
          withdrawals: [4, 6],
        },
        hoveredCalendarYear: 2027,
        paths,
        retirementSummaries: {
          endOfPlanBalances: { p10: 81, p50: 85, p90: 89 },
          medianDepletionYear: null,
          retirementStartBalances: { p10: 81, p50: 85, p90: 89 },
          survivalProbability: 1,
          totalContributions: 50,
        },
        scenario,
        spendingSummary: {
          retirementStartIncome: { p10: 4, p50: 5, p90: 6 },
          tenthRetirementYearIncomeP10: null,
        },
        yearlyPercentiles: [
          { calendarYear: 2026, p10: 102, p50: 110, p90: 118 },
          { calendarYear: 2027, p10: 81, p50: 85, p90: 89 },
        ],
      }),
    ).toEqual({
      chart: {
        percentileBand: [
          { calendarYear: 2026, p10: 102, p50: 110, p90: 118 },
          { calendarYear: 2027, p10: 81, p50: 85, p90: 89 },
        ],
        retirementStartYear: 2027,
        samplePaths: [
          {
            points: [
              { calendarYear: 2026, endingBalance: 100, phase: "accumulation" },
              { calendarYear: 2027, endingBalance: 80, phase: "retirement" },
            ],
            simulation: 1,
          },
          {
            points: [
              { calendarYear: 2026, endingBalance: 120, phase: "accumulation" },
              { calendarYear: 2027, endingBalance: 90, phase: "retirement" },
            ],
            simulation: 2,
          },
        ],
      },
      distributions: [
        {
          id: "investment-income",
          label: "Investment income",
          percentileSummary: { p10: -8.5, p50: -2.5, p90: 3.5 },
          values: [-10, 5],
        },
        {
          id: "retirement-withdrawals",
          label: "Retirement withdrawals",
          percentileSummary: { p10: 4.2, p50: 5, p90: 5.8 },
          values: [4, 6],
        },
        {
          id: "account-assets",
          label: "Account assets",
          percentileSummary: { p10: 81, p50: 85, p90: 89 },
          values: [80, 90],
        },
      ],
      hoverState: {
        calendarYear: 2027,
      },
      spendingPanel: {
        details: [
          {
            label: "Withdrawal rate",
            value: 0.04,
            valueKind: "percent",
          },
          {
            label: "Median year 1 income",
            value: 5,
          },
          {
            label: "Year 10 income (p10)",
            value: null,
          },
        ],
        headline: "Variable retirement income",
        id: "percent-of-portfolio",
        summary: "Shows what a 4% withdrawal rule produces instead of a fixed target.",
      },
      summaryCards: [
        {
          id: "retirement-start-balance",
          label: "Retirement balance (median)",
          value: 85,
        },
        {
          id: "end-of-plan-balance",
          label: "End balance (median)",
          value: 85,
        },
        {
          id: "survival-probability",
          label: "Plan survival",
          value: 1,
        },
        {
          id: "total-contributions",
          label: "Total contributions",
          value: 50,
        },
        {
          id: "median-retirement-income",
          label: "Median retirement income",
          value: 5,
        },
        {
          id: "tenth-retirement-year-income-p10",
          label: "Year 10 income (p10)",
          value: null,
        },
      ],
    });
  });
});

function makePoint(overrides: Partial<YearlyPathPoint>): YearlyPathPoint {
  return {
    annualReturn: 0,
    calendarYear: 2026,
    contribution: 0,
    depleted: false,
    endingBalance: 0,
    investmentIncome: 0,
    phase: "retirement",
    simulation: 1,
    startingBalance: 0,
    withdrawal: 0,
    ...overrides,
  };
}
