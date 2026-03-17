import { describe, expect, it } from "vitest";
import type { AppViewModel } from "../src/view-model/ui-contracts";

describe("ui contracts", () => {
  it("defines stable shapes for summary cards, chart series, hover state, distributions, and spending panels", () => {
    const viewModel: AppViewModel = {
      chart: {
        percentileBand: [{ calendarYear: 2026, p10: 90, p50: 100, p90: 110 }],
        retirementStartYear: 2030,
        samplePaths: [
          {
            points: [{ calendarYear: 2026, endingBalance: 100, phase: "accumulation" }],
            simulation: 1,
          },
        ],
      },
      distributions: [
        {
          id: "account-assets",
          label: "Account assets",
          percentileSummary: { p10: 90, p50: 100, p90: 110 },
          values: [90, 100, 110],
        },
      ],
      hoverState: {
        calendarYear: 2026,
      },
      spendingPanel: {
        details: [
          {
            label: "Year 1 target",
            value: 50000,
          },
        ],
        headline: "Fixed spending target",
        id: "fixed-dollars",
        summary: "Tracks the withdrawal target across retirement years.",
      },
      summaryCards: [
        {
          id: "survival-probability",
          label: "Plan survival",
          value: 0.82,
        },
      ],
    };

    expect(viewModel.chart.samplePaths[0]?.points[0]?.phase).toBe("accumulation");
    expect(viewModel.distributions[0]?.id).toBe("account-assets");
    expect(viewModel.spendingPanel.id).toBe("fixed-dollars");
    expect(viewModel.summaryCards[0]?.label).toBe("Plan survival");
  });
});
