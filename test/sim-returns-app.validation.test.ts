import { afterEach, describe, expect, it } from "vitest";
import "../src/main";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("sim returns app validation", () => {
  it("renders validation feedback and resets back to defaults", () => {
    const element = document.createElement("sim-returns-app");
    element.setAttribute("data-current-year", "2030");
    document.body.append(element);

    const portfolioInput =
      element.shadowRoot?.querySelector<HTMLInputElement>("#current-portfolio");

    if (portfolioInput == null) {
      throw new Error("expected current portfolio input to exist");
    }

    portfolioInput.value = "-1";
    portfolioInput.dispatchEvent(new Event("input", { bubbles: true }));

    const validationErrors = element.shadowRoot?.querySelector("[data-testid='validation-errors']");
    expect(validationErrors?.textContent).toContain(
      "currentPortfolio must be greater than or equal to 0",
    );

    const resetButton =
      element.shadowRoot?.querySelector<HTMLButtonElement>("[data-action='reset']");

    if (resetButton == null) {
      throw new Error("expected reset button to exist");
    }

    resetButton.click();

    const resetPortfolioInput =
      element.shadowRoot?.querySelector<HTMLInputElement>("#current-portfolio");
    expect(element.shadowRoot?.querySelector("[data-testid='validation-errors']")).toBeNull();
    expect(resetPortfolioInput?.value).toBe("100000");
  });
});
