import type { YearlyPathPoint } from "../domain/types";
import { calculatePercentile, summarizePercentiles, type PercentileValues } from "./percentiles";

export interface RetirementSummaries {
  endOfPlanBalances: PercentileValues;
  medianDepletionYear: number | null;
  retirementStartBalances: PercentileValues;
  survivalProbability: number;
  totalContributions: number;
}

export function calculateRetirementSummaries(paths: YearlyPathPoint[][]): RetirementSummaries {
  const retirementStartBalances = paths
    .map((path) => path.find((point) => point.phase === "retirement")?.endingBalance)
    .filter((value): value is number => value != null);
  const endOfPlanBalances = paths
    .map((path) => path.at(-1)?.endingBalance)
    .filter((value): value is number => value != null);
  const depletionYears = paths
    .map((path) => path.find((point) => point.depleted)?.calendarYear)
    .filter((value): value is number => value != null);
  const survivedPaths = endOfPlanBalances.filter((endingBalance) => endingBalance > 0).length;
  const firstPath = paths[0] ?? [];
  const totalContributions = firstPath.reduce(
    (sum, point) => sum + (point.phase === "accumulation" ? point.contribution : 0),
    0,
  );

  return {
    endOfPlanBalances: summarizeOrZero(endOfPlanBalances),
    medianDepletionYear:
      depletionYears.length === 0 ? null : Math.round(calculatePercentile(depletionYears, 0.5)),
    retirementStartBalances: summarizeOrZero(retirementStartBalances),
    survivalProbability: paths.length === 0 ? 0 : survivedPaths / paths.length,
    totalContributions,
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
