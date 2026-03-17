import { afterEach, describe, expect, it, vi } from "vitest";
import "../src/main";
import { setSimReturnsAppBatchRunnerFactoryForTest } from "../src/ui/custom-element";

afterEach(() => {
  setSimReturnsAppBatchRunnerFactoryForTest(null);
  document.body.innerHTML = "";
});

describe("sim returns app embed lifecycle", () => {
  it("keeps app markup inside Shadow DOM instead of the light DOM", () => {
    const element = document.createElement("sim-returns-app");
    element.setAttribute("data-current-year", "2030");
    document.body.append(element);

    expect(element.querySelector("h1")).toBeNull();
    expect(element.shadowRoot?.querySelector("h1")?.textContent).toContain(
      "Simulate a savings path before the chart arrives.",
    );
  });

  it("cancels the runner when the element disconnects", () => {
    const runner = {
      cancel: vi.fn(),
      run: vi.fn(async () => null),
    };
    setSimReturnsAppBatchRunnerFactoryForTest(() => runner);

    const element = document.createElement("sim-returns-app");
    element.setAttribute("data-current-year", "2030");
    document.body.append(element);

    element.remove();

    expect(runner.cancel).toHaveBeenCalledTimes(1);
  });
});
