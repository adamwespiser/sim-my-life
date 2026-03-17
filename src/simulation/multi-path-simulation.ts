import {
  historicalReturns as defaultHistoricalReturns,
  type HistoricalReturnRecord,
} from "../data/historical-returns";
import type { BatchResult, ScenarioInput } from "../domain/types";
import { createRng, resolveSeed, type UnixTimeSecondsProvider } from "./rng";
import { getTotalSimulationYears, simulatePath } from "./path-simulation";

export interface SimulateBootstrapPathsInput {
  currentYear: number;
  getUnixTimeSeconds?: UnixTimeSecondsProvider;
  historicalReturns?: HistoricalReturnRecord[];
  scenario: ScenarioInput;
  seed?: number;
}

export function simulateBootstrapPaths(input: SimulateBootstrapPathsInput): BatchResult {
  const returns = input.historicalReturns ?? defaultHistoricalReturns;

  if (returns.length === 0) {
    throw new Error("historicalReturns must contain at least one record");
  }

  const resolvedSeed = resolveSeed(input.seed, input.getUnixTimeSeconds);
  const rng = createRng(resolvedSeed);
  const totalYears = getTotalSimulationYears(
    input.currentYear,
    input.scenario.retirementStartYear,
    input.scenario.yearsInRetirement,
  );

  const points = Array.from({ length: input.scenario.numberOfSimulations }, (_, index) =>
    simulatePath({
      annualReturns: sampleAnnualReturns(totalYears, returns, rng),
      currentYear: input.currentYear,
      scenario: input.scenario,
      simulation: index + 1,
    }),
  );

  return {
    completedPaths: points.length,
    points,
    resolvedSeed,
    totalPaths: input.scenario.numberOfSimulations,
  };
}

function sampleAnnualReturns(
  totalYears: number,
  returns: HistoricalReturnRecord[],
  rng: () => number,
): number[] {
  return Array.from({ length: totalYears }, () => {
    const index = Math.floor(rng() * returns.length);
    return returns[index]?.totalReturn ?? 0;
  });
}
