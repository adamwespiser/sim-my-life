import { afterEach, describe, expect, it, vi } from "vitest";
import type { BatchResult } from "../src/domain/types";
import "../src/main";
import {
  AUTO_RUN_DEBOUNCE_MS,
  setSimReturnsAppBatchRunnerFactoryForTest,
} from "../src/ui/custom-element";

afterEach(() => {
  setSimReturnsAppBatchRunnerFactoryForTest(null);
  document.body.innerHTML = "";
  vi.useRealTimers();
});

describe("sim returns app runner lifecycle", () => {
  it("shows manual-run progress and completion state", async () => {
    const runner = {
      cancel: vi.fn(),
      run: vi.fn(async (input) => {
        input.onBatch?.(createBatchResult(2, input.scenario.numberOfSimulations, 77));

        return createBatchResult(
          input.scenario.numberOfSimulations,
          input.scenario.numberOfSimulations,
          77,
        );
      }),
    };
    setSimReturnsAppBatchRunnerFactoryForTest(() => runner);

    const element = document.createElement("sim-returns-app");
    element.setAttribute("data-current-year", "2030");
    document.body.append(element);

    const runButton = element.shadowRoot?.querySelector<HTMLButtonElement>("[data-action='run']");

    if (runButton == null) {
      throw new Error("expected run button to exist");
    }

    runButton.click();

    expect(runner.run).toHaveBeenCalledTimes(1);
    expect(getRunStatusMessage(element)).toContain("Running 2 of 100 paths.");
    expect(getRunProgress(element)).toBe("2 / 100");

    await flushPromises();

    expect(getRunBadge(element)).toBe("completed");
    expect(getRunProgress(element)).toBe("100 / 100");
    expect(getRunSeed(element)).toBe("77");
    expect(getRunStatusMessage(element)).toContain("Simulation complete.");
  });

  it("debounces auto-reruns and cancels the in-flight run before restarting", async () => {
    vi.useFakeTimers();

    const firstRun = createDeferred<BatchResult | null>();
    const secondRun = createDeferred<BatchResult | null>();
    const runner = {
      cancel: vi.fn(),
      run: vi
        .fn()
        .mockImplementationOnce(() => firstRun.promise)
        .mockImplementationOnce(() => secondRun.promise),
    };
    setSimReturnsAppBatchRunnerFactoryForTest(() => runner);

    const element = document.createElement("sim-returns-app");
    element.setAttribute("data-current-year", "2030");
    document.body.append(element);

    const annualSavingsInput =
      element.shadowRoot?.querySelector<HTMLInputElement>("#annual-savings");

    if (annualSavingsInput == null) {
      throw new Error("expected annual savings input to exist");
    }

    annualSavingsInput.value = "13000";
    annualSavingsInput.dispatchEvent(new Event("input", { bubbles: true }));

    expect(getRunBadge(element)).toBe("scheduled");
    expect(runner.run).toHaveBeenCalledTimes(0);

    await vi.advanceTimersByTimeAsync(AUTO_RUN_DEBOUNCE_MS);

    expect(runner.run).toHaveBeenCalledTimes(1);
    expect(getRunBadge(element)).toBe("running");

    const updatedAnnualSavingsInput =
      element.shadowRoot?.querySelector<HTMLInputElement>("#annual-savings");

    if (updatedAnnualSavingsInput == null) {
      throw new Error("expected rerendered annual savings input to exist");
    }

    updatedAnnualSavingsInput.value = "14000";
    updatedAnnualSavingsInput.dispatchEvent(new Event("input", { bubbles: true }));

    expect(runner.cancel).toHaveBeenCalledTimes(1);
    expect(getRunBadge(element)).toBe("scheduled");
    expect(getRunStatusMessage(element)).toContain("Auto-rerun scheduled");

    await vi.advanceTimersByTimeAsync(AUTO_RUN_DEBOUNCE_MS);

    expect(runner.run).toHaveBeenCalledTimes(2);

    firstRun.resolve(null);
    secondRun.resolve(createBatchResult(100, 100, 88));
    await flushPromises();

    expect(getRunBadge(element)).toBe("completed");
    expect(getRunSeed(element)).toBe("88");
  });

  it("surfaces runner failures in the visible run state", async () => {
    const runner = {
      cancel: vi.fn(),
      run: vi.fn(async () => {
        throw new Error("boom");
      }),
    };
    setSimReturnsAppBatchRunnerFactoryForTest(() => runner);

    const element = document.createElement("sim-returns-app");
    element.setAttribute("data-current-year", "2030");
    document.body.append(element);

    element.shadowRoot?.querySelector<HTMLButtonElement>("[data-action='run']")?.click();
    await flushPromises();

    expect(getRunBadge(element)).toBe("error");
    expect(getRunStatusMessage(element)).toContain("Simulation failed: boom");
  });
});

function createBatchResult(
  completedPaths: number,
  totalPaths: number,
  resolvedSeed: number,
): BatchResult {
  return {
    completedPaths,
    points: [],
    resolvedSeed,
    totalPaths,
  };
}

function createDeferred<T>() {
  let resolvePromise: ((value: T) => void) | undefined;
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve;
  });

  return {
    promise,
    resolve(value: T) {
      if (resolvePromise == null) {
        throw new Error("deferred promise resolver was not initialized");
      }

      resolvePromise(value);
    },
  };
}

function getRunBadge(element: Element): string {
  return (
    element.shadowRoot
      ?.querySelector<HTMLElement>("[data-testid='run-status-badge']")
      ?.textContent?.trim() ?? ""
  );
}

function getRunProgress(element: Element): string {
  return (
    element.shadowRoot
      ?.querySelector<HTMLElement>("[data-testid='run-progress']")
      ?.textContent?.trim() ?? ""
  );
}

function getRunSeed(element: Element): string {
  return (
    element.shadowRoot
      ?.querySelector<HTMLElement>("[data-testid='run-seed']")
      ?.textContent?.trim() ?? ""
  );
}

function getRunStatusMessage(element: Element): string {
  return (
    element.shadowRoot
      ?.querySelector<HTMLElement>("[data-testid='run-status-message']")
      ?.textContent?.trim() ?? ""
  );
}

async function flushPromises(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}
