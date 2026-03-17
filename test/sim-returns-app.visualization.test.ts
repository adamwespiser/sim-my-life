import { afterEach, describe, expect, it, vi } from "vitest";
import type { BatchResult, YearlyPathPoint } from "../src/domain/types";
import "../src/main";
import { setSimReturnsAppBatchRunnerFactoryForTest } from "../src/ui/custom-element";

afterEach(() => {
  setSimReturnsAppBatchRunnerFactoryForTest(null);
  document.body.innerHTML = "";
});

describe("sim returns app visualization", () => {
  it("renders chart, summary, and hover-driven distributions from simulation results", async () => {
    const result = createVisualizationResult();
    const runner = {
      cancel: vi.fn(),
      run: vi.fn(async () => result),
    };
    setSimReturnsAppBatchRunnerFactoryForTest(() => runner);

    const element = document.createElement("sim-returns-app");
    element.setAttribute("data-current-year", "2030");
    document.body.append(element);

    updateInput(element, "#retirement-start-year", "2031");
    updateInput(element, "#years-in-retirement", "2");
    updateInput(element, "#simulation-count", "2");

    const runButton = element.shadowRoot?.querySelector<HTMLButtonElement>("[data-action='run']");

    if (runButton == null) {
      throw new Error("expected run button to exist");
    }

    runButton.click();
    await flushPromises();

    expect(element.shadowRoot?.querySelector("[data-testid='chart-svg']")).not.toBeNull();
    expect(element.shadowRoot?.querySelector("[data-testid='chart-median-line']")).not.toBeNull();
    expect(element.shadowRoot?.textContent).toContain("Retirement balance (median)");
    expect(
      element.shadowRoot?.querySelector("[data-testid='distribution-year-label']")?.textContent,
    ).toContain("2031");
    expect(element.shadowRoot?.textContent).toContain("Investment income in 2031");
    expect(element.shadowRoot?.textContent).toContain("Min");
    expect(element.shadowRoot?.textContent).toContain("Median");
    expect(element.shadowRoot?.textContent).toContain("Max");

    const hoverTarget = element.shadowRoot?.querySelector<HTMLElement>("[data-hover-year='2032']");

    if (hoverTarget == null) {
      throw new Error("expected hover target for 2032 to exist");
    }

    hoverTarget.dispatchEvent(new Event("mouseenter", { bubbles: true }));

    expect(
      element.shadowRoot?.querySelector("[data-testid='distribution-year-label']")?.textContent,
    ).toContain("2032");
    expect(element.shadowRoot?.textContent).toContain("Investment income in 2032");
  });

  it("abbreviates very large values in the three distribution panels", async () => {
    const runner = {
      cancel: vi.fn(),
      run: vi.fn(async () => createLargeValueVisualizationResult()),
    };
    setSimReturnsAppBatchRunnerFactoryForTest(() => runner);

    const element = document.createElement("sim-returns-app");
    element.setAttribute("data-current-year", "2030");
    document.body.append(element);

    element.shadowRoot?.querySelector<HTMLButtonElement>("[data-action='run']")?.click();
    await flushPromises();

    expect(element.shadowRoot?.textContent).toContain("Min $11M");
    expect(element.shadowRoot?.textContent).toContain("Median $13M");
    expect(element.shadowRoot?.textContent).toContain("Max $15M");
    expect(element.shadowRoot?.textContent).toContain("P10$11M");
    expect(element.shadowRoot?.textContent).toContain("P50$13M");
    expect(element.shadowRoot?.textContent).toContain("P90$15M");
    expect(element.shadowRoot?.textContent).not.toContain("$11,000,000");
  });
});

function createVisualizationResult(): BatchResult {
  return {
    completedPaths: 2,
    points: [
      [
        makePoint({
          calendarYear: 2030,
          contribution: 10,
          endingBalance: 110,
          investmentIncome: 10,
          phase: "accumulation",
          simulation: 1,
          startingBalance: 100,
        }),
        makePoint({
          calendarYear: 2031,
          endingBalance: 90,
          investmentIncome: 5,
          phase: "retirement",
          simulation: 1,
          startingBalance: 110,
          withdrawal: 25,
        }),
        makePoint({
          calendarYear: 2032,
          endingBalance: 80,
          investmentIncome: 4,
          phase: "retirement",
          simulation: 1,
          startingBalance: 90,
          withdrawal: 14,
        }),
      ],
      [
        makePoint({
          calendarYear: 2030,
          contribution: 10,
          endingBalance: 105,
          investmentIncome: -5,
          phase: "accumulation",
          simulation: 2,
          startingBalance: 100,
        }),
        makePoint({
          calendarYear: 2031,
          endingBalance: 60,
          investmentIncome: 2,
          phase: "retirement",
          simulation: 2,
          startingBalance: 105,
          withdrawal: 47,
        }),
        makePoint({
          calendarYear: 2032,
          depleted: true,
          endingBalance: 0,
          investmentIncome: -6,
          phase: "retirement",
          simulation: 2,
          startingBalance: 60,
          withdrawal: 54,
        }),
      ],
    ],
    resolvedSeed: 55,
    totalPaths: 2,
  };
}

function createLargeValueVisualizationResult(): BatchResult {
  return {
    completedPaths: 2,
    points: [
      [
        makePoint({
          calendarYear: 2030,
          endingBalance: 15000000,
          investmentIncome: 11000000,
          phase: "accumulation",
          simulation: 1,
          startingBalance: 4000000,
        }),
      ],
      [
        makePoint({
          calendarYear: 2030,
          endingBalance: 11000000,
          investmentIncome: 15000000,
          phase: "accumulation",
          simulation: 2,
          startingBalance: 4000000,
        }),
      ],
    ],
    resolvedSeed: 99,
    totalPaths: 2,
  };
}

function makePoint(overrides: Partial<YearlyPathPoint>): YearlyPathPoint {
  return {
    annualReturn: 0,
    calendarYear: 2030,
    contribution: 0,
    depleted: false,
    endingBalance: 0,
    investmentIncome: 0,
    phase: "retirement",
    simulation: 1,
    startingBalance: 0,
    withdrawal: 0,
    ...overrides,
  };
}

function updateInput(element: Element, selector: string, value: string) {
  const input = element.shadowRoot?.querySelector<HTMLInputElement>(selector);

  if (input == null) {
    throw new Error(`expected input ${selector} to exist`);
  }

  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

async function flushPromises(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}
