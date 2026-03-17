import type { ScenarioInput, YearlyPathPoint } from "../domain/types";
import type { HoverYearDistributions } from "../metrics/hover-distributions";
import { summarizePercentiles, type YearlyPercentilePoint } from "../metrics/percentiles";
import type { RetirementSummaries } from "../metrics/retirement-summaries";
import type { PercentOfPortfolioSpendingSummary } from "../metrics/spending-summaries";
import type {
  AppViewModel,
  DistributionViewData,
  SpendingPanelDetail,
  SpendingPanelViewModel,
  SummaryCardData,
} from "./ui-contracts";

export interface BuildAppViewModelInput {
  hoverDistributions: HoverYearDistributions;
  hoveredCalendarYear: number | null;
  paths: YearlyPathPoint[][];
  retirementSummaries: RetirementSummaries;
  scenario: ScenarioInput;
  spendingSummary?: PercentOfPortfolioSpendingSummary | null;
  yearlyPercentiles: YearlyPercentilePoint[];
}

export function buildAppViewModel(input: BuildAppViewModelInput): AppViewModel {
  return {
    chart: {
      percentileBand: input.yearlyPercentiles,
      retirementStartYear: input.scenario.retirementStartYear,
      samplePaths: input.paths.map((path) => ({
        points: path.map((point) => ({
          calendarYear: point.calendarYear,
          endingBalance: point.endingBalance,
          phase: point.phase,
        })),
        simulation: path[0]?.simulation ?? 0,
      })),
    },
    distributions: buildDistributions(input.hoverDistributions),
    hoverState: {
      calendarYear: input.hoveredCalendarYear,
    },
    spendingPanel: buildSpendingPanel(
      input.scenario,
      input.retirementSummaries,
      input.spendingSummary ?? null,
    ),
    summaryCards: buildSummaryCards(
      input.scenario,
      input.retirementSummaries,
      input.spendingSummary ?? null,
    ),
  };
}

function buildSummaryCards(
  scenario: ScenarioInput,
  retirementSummaries: RetirementSummaries,
  spendingSummary: PercentOfPortfolioSpendingSummary | null,
): SummaryCardData[] {
  const cards: SummaryCardData[] = [
    {
      id: "retirement-start-balance",
      label: "Retirement balance (median)",
      value: retirementSummaries.retirementStartBalances.p50,
    },
    {
      id: "end-of-plan-balance",
      label: "End balance (median)",
      value: retirementSummaries.endOfPlanBalances.p50,
    },
    {
      id: "survival-probability",
      label: "Plan survival",
      value: retirementSummaries.survivalProbability,
    },
    {
      id: "total-contributions",
      label: "Total contributions",
      value: retirementSummaries.totalContributions,
    },
  ];

  if (scenario.retirementStrategy.mode === "fixed-dollars") {
    cards.push({
      id: "final-spending-target",
      label: "Final spending target",
      value: getFinalFixedDollarTarget(
        scenario.retirementStrategy.annualSpending,
        scenario.retirementStrategy.annualInflationAdjustment,
        scenario.yearsInRetirement,
      ),
    });
  }

  if (scenario.retirementStrategy.mode === "percent-of-portfolio" && spendingSummary != null) {
    cards.push(
      {
        id: "median-retirement-income",
        label: "Median retirement income",
        value: spendingSummary.retirementStartIncome.p50,
      },
      {
        id: "tenth-retirement-year-income-p10",
        label: "Year 10 income (p10)",
        value: spendingSummary.tenthRetirementYearIncomeP10,
      },
    );
  }

  return cards;
}

function buildSpendingPanel(
  scenario: ScenarioInput,
  retirementSummaries: RetirementSummaries,
  spendingSummary: PercentOfPortfolioSpendingSummary | null,
): SpendingPanelViewModel {
  if (scenario.retirementStrategy.mode === "fixed-dollars") {
    const finalTarget = getFinalFixedDollarTarget(
      scenario.retirementStrategy.annualSpending,
      scenario.retirementStrategy.annualInflationAdjustment,
      scenario.yearsInRetirement,
    );
    const details: SpendingPanelDetail[] = [
      {
        label: "Year 1 target",
        value: scenario.retirementStrategy.annualSpending,
      },
      {
        label: `Year ${scenario.yearsInRetirement} target`,
        value: finalTarget,
      },
      {
        label: "Inflation adjustment",
        value: scenario.retirementStrategy.annualInflationAdjustment,
        valueKind: "percent",
      },
    ];

    return {
      details,
      headline: "Fixed spending target",
      id: "fixed-dollars",
      summary: `This plan keeps targeting the same lifestyle while survival is ${Math.round(
        retirementSummaries.survivalProbability * 100,
      )}%.`,
    };
  }

  return {
    details: [
      {
        label: "Withdrawal rate",
        value: scenario.retirementStrategy.withdrawalRate,
        valueKind: "percent",
      },
      {
        label: "Median year 1 income",
        value: spendingSummary?.retirementStartIncome.p50 ?? null,
      },
      {
        label: "Year 10 income (p10)",
        value: spendingSummary?.tenthRetirementYearIncomeP10 ?? null,
      },
    ],
    headline: "Variable retirement income",
    id: "percent-of-portfolio",
    summary: `Shows what a ${Math.round(
      scenario.retirementStrategy.withdrawalRate * 100,
    )}% withdrawal rule produces instead of a fixed target.`,
  };
}

function buildDistributions(hoverDistributions: HoverYearDistributions): DistributionViewData[] {
  return [
    {
      id: "investment-income",
      label: "Investment income",
      percentileSummary: summarizeValues(hoverDistributions.investmentIncome),
      values: hoverDistributions.investmentIncome,
    },
    {
      id: "retirement-withdrawals",
      label: "Retirement withdrawals",
      percentileSummary: summarizeValues(hoverDistributions.withdrawals),
      values: hoverDistributions.withdrawals,
    },
    {
      id: "account-assets",
      label: "Account assets",
      percentileSummary: summarizeValues(hoverDistributions.accountAssets),
      values: hoverDistributions.accountAssets,
    },
  ];
}

function getFinalFixedDollarTarget(
  annualSpending: number,
  annualInflationAdjustment: number,
  yearsInRetirement: number,
): number {
  return annualSpending * (1 + annualInflationAdjustment) ** Math.max(0, yearsInRetirement - 1);
}

function summarizeValues(values: number[]) {
  if (values.length === 0) {
    return {
      p10: 0,
      p50: 0,
      p90: 0,
    };
  }

  return summarizePercentiles(values);
}
