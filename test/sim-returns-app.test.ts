import { afterEach, describe, expect, it } from "vitest";
import "../src/main";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("sim returns app custom element", () => {
  it("mounts a shadow-root app shell with the required top-level sections", () => {
    const element = document.createElement("sim-returns-app");
    element.setAttribute("data-current-year", "2030");
    document.body.append(element);

    const chartSection = element.shadowRoot?.querySelector<HTMLElement>("[data-testid='chart']");
    const chartPanel = element.shadowRoot?.querySelector<HTMLElement>(
      "[data-testid='chart-panel']",
    );
    const runStatePanel = element.shadowRoot?.querySelector<HTMLElement>(
      "[data-testid='run-state-panel']",
    );

    expect(element.shadowRoot).not.toBeNull();
    expect(element.shadowRoot?.querySelector("[data-testid='intro']")).not.toBeNull();
    expect(element.shadowRoot?.querySelector("[data-testid='controls']")).not.toBeNull();
    expect(element.shadowRoot?.querySelector("[data-testid='summary']")).not.toBeNull();
    expect(chartSection).not.toBeNull();
    expect(element.shadowRoot?.querySelector("[data-testid='distributions']")).not.toBeNull();
    expect(element.shadowRoot?.querySelector("[data-testid='methodology']")).not.toBeNull();
    expect(chartSection?.classList.contains("panel-split")).toBe(false);
    expect(chartPanel).not.toBeNull();
    expect(runStatePanel).not.toBeNull();

    if (chartPanel == null || runStatePanel == null) {
      throw new Error("expected stacked chart and run-state panels to exist");
    }

    expect(
      runStatePanel.compareDocumentPosition(chartPanel) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
