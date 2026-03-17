import { afterEach, describe, expect, it } from "vitest";
import "../src/main";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("sim returns app form input behavior", () => {
  it("preserves raw decimal and large-number drafts while the form rerenders", () => {
    const element = document.createElement("sim-returns-app");
    element.setAttribute("data-current-year", "2030");
    document.body.append(element);

    const withdrawalMode = element.shadowRoot?.querySelector<HTMLSelectElement>("#retirement-mode");

    if (withdrawalMode == null) {
      throw new Error("expected retirement mode select to exist");
    }

    withdrawalMode.value = "percent-of-portfolio";
    withdrawalMode.dispatchEvent(new Event("change", { bubbles: true }));

    const withdrawalRateInput =
      element.shadowRoot?.querySelector<HTMLInputElement>("#withdrawal-rate");

    if (withdrawalRateInput == null) {
      throw new Error("expected withdrawal rate input to exist");
    }

    withdrawalRateInput.value = "4.25";
    withdrawalRateInput.dispatchEvent(new Event("input", { bubbles: true }));

    const updatedWithdrawalRateInput =
      element.shadowRoot?.querySelector<HTMLInputElement>("#withdrawal-rate");
    expect(updatedWithdrawalRateInput?.value).toBe("4.25");

    const portfolioInput =
      element.shadowRoot?.querySelector<HTMLInputElement>("#current-portfolio");

    if (portfolioInput == null) {
      throw new Error("expected current portfolio input to exist");
    }

    portfolioInput.value = "1,250,000";
    portfolioInput.dispatchEvent(new Event("input", { bubbles: true }));

    const updatedPortfolioInput =
      element.shadowRoot?.querySelector<HTMLInputElement>("#current-portfolio");
    expect(updatedPortfolioInput?.value).toBe("1,250,000");
  });
});
