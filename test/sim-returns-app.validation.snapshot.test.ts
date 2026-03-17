import { afterEach, describe, expect, it } from "vitest";
import "../src/main";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("sim returns app validation shell", () => {
  it("renders the invalid state markup when the scenario fails validation", () => {
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

    expect(element.shadowRoot?.innerHTML).toMatchSnapshot();
  });
});
