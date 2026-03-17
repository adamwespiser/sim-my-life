import {
  historicalReturns as defaultHistoricalReturns,
  historicalReturnsMetadata,
  type HistoricalReturnRecord,
} from "../data/historical-returns";
import type { BatchResult, ScenarioInput, YearlyPathPoint } from "../domain/types";
import { createLogger, type Logger } from "../platform/logging";
import { createRng, resolveSeed, type UnixTimeSecondsProvider } from "./rng";
import { getTotalSimulationYears, simulatePath } from "./path-simulation";

export type YieldToMainThread = () => Promise<void>;

export interface CreateBatchRunnerInput {
  logger?: Logger;
  yieldToMainThread?: YieldToMainThread;
}

export interface RunBatchSimulationInput {
  batchSize: number;
  currentYear: number;
  getUnixTimeSeconds?: UnixTimeSecondsProvider;
  historicalReturns?: HistoricalReturnRecord[];
  onBatch?: (result: BatchResult) => void;
  scenario: ScenarioInput;
  seed?: number;
}

export interface BatchRunner {
  cancel: () => void;
  run: (input: RunBatchSimulationInput) => Promise<BatchResult | null>;
}

export function createBatchRunner(input: CreateBatchRunnerInput = {}): BatchRunner {
  const logger = input.logger ?? createLogger();
  const yieldToMainThread = input.yieldToMainThread ?? defaultYieldToMainThread;
  let activeRunId = 0;

  return {
    cancel: () => {
      activeRunId += 1;
    },
    run: async (runInput) => {
      const runId = ++activeRunId;
      const returns = runInput.historicalReturns ?? defaultHistoricalReturns;

      if (returns.length === 0) {
        throw new Error("historicalReturns must contain at least one record");
      }

      const resolvedSeed = resolveSeed(runInput.seed, runInput.getUnixTimeSeconds);
      const rng = createRng(resolvedSeed);
      const totalYears = getTotalSimulationYears(
        runInput.currentYear,
        runInput.scenario.retirementStartYear,
        runInput.scenario.yearsInRetirement,
      );
      const batchSize = Math.max(1, Math.round(runInput.batchSize));
      const points: YearlyPathPoint[][] = [];
      const totalPaths = runInput.scenario.numberOfSimulations;

      logger.info("data-version", historicalReturnsMetadata);
      logger.info("run-start", {
        batchSize,
        resolvedSeed,
        scenario: runInput.scenario,
        totalPaths,
      });

      try {
        for (let startIndex = 0; startIndex < totalPaths; startIndex += batchSize) {
          if (runId !== activeRunId) {
            logger.info("run-canceled", {
              completedPaths: points.length,
              totalPaths,
            });
            return null;
          }

          const endIndex = Math.min(startIndex + batchSize, totalPaths);

          for (let pathIndex = startIndex; pathIndex < endIndex; pathIndex += 1) {
            points.push(
              simulatePath({
                annualReturns: sampleAnnualReturns(totalYears, returns, rng),
                currentYear: runInput.currentYear,
                scenario: runInput.scenario,
                simulation: pathIndex + 1,
              }),
            );
          }

          const batchResult = {
            completedPaths: points.length,
            points: [...points],
            resolvedSeed,
            totalPaths,
          };

          runInput.onBatch?.(batchResult);
          logger.info("batch-progress", {
            completedPaths: batchResult.completedPaths,
            totalPaths,
          });

          if (batchResult.completedPaths < totalPaths) {
            await yieldToMainThread();
          }
        }

        if (runId !== activeRunId) {
          logger.info("run-canceled", {
            completedPaths: points.length,
            totalPaths,
          });
          return null;
        }

        const finalResult = {
          completedPaths: points.length,
          points,
          resolvedSeed,
          totalPaths,
        };

        logger.info("run-complete", {
          completedPaths: finalResult.completedPaths,
          resolvedSeed: finalResult.resolvedSeed,
          totalPaths: finalResult.totalPaths,
        });

        return finalResult;
      } catch (error) {
        logger.error("run-error", error);
        throw error;
      }
    },
  };
}

const defaultYieldToMainThread: YieldToMainThread = () =>
  new Promise<void>((resolve) => {
    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => resolve());
      return;
    }

    setTimeout(resolve, 0);
  });

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
