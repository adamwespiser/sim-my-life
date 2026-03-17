import { describe, expect, it, vi } from "vitest";
import { createLogger } from "../src/platform/logging";
import { createBatchRunner } from "../src/simulation/batch-runner";

describe("batch runner", () => {
  it("emits partial batch results before final completion and logs seed plus data metadata", async () => {
    const batchUpdates: number[] = [];
    const mockConsole = {
      debug: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    };
    const logger = createLogger({ console: mockConsole, verbose: true });
    const runner = createBatchRunner({
      logger,
      yieldToMainThread: async () => {},
    });

    const result = await runner.run({
      batchSize: 2,
      currentYear: 2026,
      historicalReturns: [{ totalReturn: 0, year: 2000 }],
      onBatch: (batchResult) => {
        batchUpdates.push(batchResult.completedPaths);
      },
      scenario: {
        annualSavings: 10,
        currentPortfolio: 100,
        numberOfSimulations: 3,
        retirementStartYear: 2027,
        retirementStrategy: {
          annualInflationAdjustment: 0,
          annualSpending: 50,
          mode: "fixed-dollars",
        },
        yearsInRetirement: 1,
      },
      seed: 42,
    });

    expect(batchUpdates).toEqual([2, 3]);
    expect(result).not.toBeNull();
    expect(result?.completedPaths).toBe(3);
    expect(result?.points).toHaveLength(3);
    expect(mockConsole.info).toHaveBeenCalledWith(
      "sim-returns: data-version",
      expect.objectContaining({
        version: "damodaran-sp500-tr-1928-2025-v1",
      }),
    );
    expect(mockConsole.info).toHaveBeenCalledWith(
      "sim-returns: run-start",
      expect.objectContaining({
        resolvedSeed: 42,
        totalPaths: 3,
      }),
    );
    expect(mockConsole.info).toHaveBeenCalledWith(
      "sim-returns: batch-progress",
      expect.objectContaining({
        completedPaths: 2,
        totalPaths: 3,
      }),
    );
    expect(mockConsole.info).toHaveBeenCalledWith(
      "sim-returns: run-complete",
      expect.objectContaining({
        completedPaths: 3,
        totalPaths: 3,
      }),
    );
  });

  it("stops emitting stale updates after cancellation", async () => {
    const batchUpdates: number[] = [];
    let allowNextBatch: (() => void) | undefined;
    const logger = createLogger({
      console: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
      },
      verbose: true,
    });
    const runner = createBatchRunner({
      logger,
      yieldToMainThread: () =>
        new Promise<void>((resolve) => {
          allowNextBatch = resolve;
        }),
    });

    const resultPromise = runner.run({
      batchSize: 1,
      currentYear: 2026,
      historicalReturns: [{ totalReturn: 0, year: 2000 }],
      onBatch: (batchResult) => {
        batchUpdates.push(batchResult.completedPaths);
        runner.cancel();
      },
      scenario: {
        annualSavings: 10,
        currentPortfolio: 100,
        numberOfSimulations: 3,
        retirementStartYear: 2027,
        retirementStrategy: {
          annualInflationAdjustment: 0,
          annualSpending: 50,
          mode: "fixed-dollars",
        },
        yearsInRetirement: 1,
      },
      seed: 42,
    });

    if (allowNextBatch != null) {
      allowNextBatch();
    }

    await expect(resultPromise).resolves.toBeNull();
    expect(batchUpdates).toEqual([1]);
  });
});
