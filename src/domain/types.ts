export const RETIREMENT_MODES = ["fixed-dollars", "percent-of-portfolio"] as const;

export type RetirementMode = (typeof RETIREMENT_MODES)[number];

export interface FixedDollarsRetirementStrategy {
  annualInflationAdjustment: number;
  annualSpending: number;
  mode: "fixed-dollars";
}

export interface PercentOfPortfolioRetirementStrategy {
  mode: "percent-of-portfolio";
  withdrawalRate: number;
}

export type RetirementStrategy =
  | FixedDollarsRetirementStrategy
  | PercentOfPortfolioRetirementStrategy;

export interface ScenarioInput {
  annualSavings: number;
  currentAnnualSpending?: number;
  currentPortfolio: number;
  numberOfSimulations: number;
  retirementStartYear: number;
  retirementStrategy: RetirementStrategy;
  yearsInRetirement: number;
}

export type SimulationPhase = "accumulation" | "retirement";

export interface YearlyPathPoint {
  annualReturn: number;
  calendarYear: number;
  contribution: number;
  depleted: boolean;
  endingBalance: number;
  investmentIncome: number;
  phase: SimulationPhase;
  simulation: number;
  startingBalance: number;
  withdrawal: number;
}

export interface BatchResult {
  completedPaths: number;
  points: YearlyPathPoint[][];
  resolvedSeed: number;
  totalPaths: number;
}
