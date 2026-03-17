import type { SimulationPhase } from "../domain/types";
import type { HoverYearDistributions } from "../metrics/hover-distributions";
import type { PercentileValues, YearlyPercentilePoint } from "../metrics/percentiles";

export interface SummaryCardData {
  id: string;
  label: string;
  value: number | null;
}

export interface SamplePathPointContract {
  calendarYear: number;
  endingBalance: number;
  phase: SimulationPhase;
}

export interface SamplePathSeriesContract {
  points: SamplePathPointContract[];
  simulation: number;
}

export interface ChartViewModel {
  percentileBand: YearlyPercentilePoint[];
  retirementStartYear: number;
  samplePaths: SamplePathSeriesContract[];
}

export interface HoverStateViewModel {
  calendarYear: number | null;
}

export type DistributionViewId = "investment-income" | "retirement-withdrawals" | "account-assets";

export interface DistributionViewData {
  id: DistributionViewId;
  label: string;
  percentileSummary: PercentileValues;
  values: HoverYearDistributions[keyof Pick<
    HoverYearDistributions,
    "investmentIncome" | "withdrawals" | "accountAssets"
  >];
}

export type SpendingPanelId = "fixed-dollars" | "percent-of-portfolio";

export type SpendingPanelValueKind = "currency" | "percent";

export interface SpendingPanelDetail {
  label: string;
  value: number | null;
  valueKind?: SpendingPanelValueKind;
}

export interface SpendingPanelViewModel {
  details: SpendingPanelDetail[];
  headline: string;
  id: SpendingPanelId;
  summary: string;
}

export interface AppViewModel {
  chart: ChartViewModel;
  distributions: DistributionViewData[];
  hoverState: HoverStateViewModel;
  spendingPanel: SpendingPanelViewModel;
  summaryCards: SummaryCardData[];
}
