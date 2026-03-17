import type { YearlyPathPoint } from "../domain/types";
import { calculatePercentile, summarizePercentiles, type PercentileValues } from "./percentiles";

export interface PercentOfPortfolioSpendingSummary {
  retirementStartIncome: PercentileValues;
  tenthRetirementYearIncomeP10: number | null;
}

export function calculatePercentOfPortfolioSpendingSummary(
  paths: YearlyPathPoint[][],
): PercentOfPortfolioSpendingSummary {
  const retirementPaths = paths.map((path) => path.filter((point) => point.phase === "retirement"));
  const retirementStartWithdrawals = retirementPaths
    .map((path) => path[0]?.withdrawal)
    .filter((value): value is number => value != null);
  const tenthRetirementYearWithdrawals = retirementPaths
    .map((path) => path[9]?.withdrawal)
    .filter((value): value is number => value != null);

  return {
    retirementStartIncome: summarizeOrZero(retirementStartWithdrawals),
    tenthRetirementYearIncomeP10:
      tenthRetirementYearWithdrawals.length === 0
        ? null
        : calculatePercentile(tenthRetirementYearWithdrawals, 0.1),
  };
}

function summarizeOrZero(values: number[]): PercentileValues {
  if (values.length === 0) {
    return {
      p10: 0,
      p50: 0,
      p90: 0,
    };
  }

  return summarizePercentiles(values);
}
