import { afterEach, describe, expect, it, vi } from "vitest";
import "../src/main";
import { setSimReturnsAppBatchRunnerFactoryForTest } from "../src/ui/custom-element";

afterEach(() => {
  setSimReturnsAppBatchRunnerFactoryForTest(null);
  document.body.innerHTML = "";
});

describe("sim returns app mode switching", () => {
  it("shows the correct retirement fields for the selected mode", () => {
    const element = document.createElement("sim-returns-app");
    element.setAttribute("data-current-year", "2030");
    document.body.append(element);

    const select = element.shadowRoot?.querySelector<HTMLSelectElement>("#retirement-mode");
    const fixedFields = element.shadowRoot?.querySelector<HTMLElement>(
      "[data-field='fixed-dollars']",
    );
    const percentFields = element.shadowRoot?.querySelector<HTMLElement>(
      "[data-field='percent-of-portfolio']",
    );

    expect(select).not.toBeNull();
    expect(fixedFields?.hidden).toBe(false);
    expect(percentFields?.hidden).toBe(true);

    if (select == null) {
      throw new Error("expected retirement mode select to exist");
    }

    select.value = "percent-of-portfolio";
    select.dispatchEvent(new Event("change", { bubbles: true }));

    const updatedFixedFields = element.shadowRoot?.querySelector<HTMLElement>(
      "[data-field='fixed-dollars']",
    );
    const updatedPercentFields = element.shadowRoot?.querySelector<HTMLElement>(
      "[data-field='percent-of-portfolio']",
    );

    expect(updatedFixedFields?.hidden).toBe(true);
    expect(updatedPercentFields?.hidden).toBe(false);
  });

  it("renders a mode-aware spending panel after a run", async () => {
    const fixedRunner = {
      cancel: vi.fn(),
      run: vi.fn(async () => createBatchResult(2031)),
    };
    setSimReturnsAppBatchRunnerFactoryForTest(() => fixedRunner);

    const fixedElement = document.createElement("sim-returns-app");
    fixedElement.setAttribute("data-current-year", "2030");
    document.body.append(fixedElement);

    fixedElement.shadowRoot?.querySelector<HTMLButtonElement>("[data-action='run']")?.click();
    await Promise.resolve();

    expect(fixedElement.shadowRoot?.textContent).toContain("Fixed spending target");
    expect(fixedElement.shadowRoot?.textContent).toContain("Year 30 target");

    document.body.innerHTML = "";

    const percentRunner = {
      cancel: vi.fn(),
      run: vi.fn(async () => createBatchResult(2031)),
    };
    setSimReturnsAppBatchRunnerFactoryForTest(() => percentRunner);

    const percentElement = document.createElement("sim-returns-app");
    percentElement.setAttribute("data-current-year", "2030");
    document.body.append(percentElement);

    const select = percentElement.shadowRoot?.querySelector<HTMLSelectElement>("#retirement-mode");

    if (select == null) {
      throw new Error("expected retirement mode select to exist");
    }

    select.value = "percent-of-portfolio";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    percentElement.shadowRoot?.querySelector<HTMLButtonElement>("[data-action='run']")?.click();
    await Promise.resolve();

    expect(percentElement.shadowRoot?.textContent).toContain("Variable retirement income");
    expect(percentElement.shadowRoot?.textContent).toContain("Withdrawal rate");
  });
});

function createBatchResult(retirementYear: number) {
  return {
    completedPaths: 2,
    points: [
      [
        {
          annualReturn: 0.05,
          calendarYear: retirementYear - 1,
          contribution: 80000,
          depleted: false,
          endingBalance: 605000,
          investmentIncome: 25000,
          phase: "accumulation" as const,
          simulation: 1,
          startingBalance: 500000,
          withdrawal: 0,
        },
        {
          annualReturn: 0.04,
          calendarYear: retirementYear,
          contribution: 0,
          depleted: false,
          endingBalance: 579200,
          investmentIncome: 24200,
          phase: "retirement" as const,
          simulation: 1,
          startingBalance: 605000,
          withdrawal: 50000,
        },
      ],
      [
        {
          annualReturn: 0.02,
          calendarYear: retirementYear - 1,
          contribution: 80000,
          depleted: false,
          endingBalance: 590000,
          investmentIncome: 10000,
          phase: "accumulation" as const,
          simulation: 2,
          startingBalance: 500000,
          withdrawal: 0,
        },
        {
          annualReturn: 0.01,
          calendarYear: retirementYear,
          contribution: 0,
          depleted: false,
          endingBalance: 545900,
          investmentIncome: 5900,
          phase: "retirement" as const,
          simulation: 2,
          startingBalance: 590000,
          withdrawal: 50000,
        },
      ],
    ],
    resolvedSeed: 42,
    totalPaths: 2,
  };
}
