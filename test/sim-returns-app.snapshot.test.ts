import { afterEach, describe, expect, it } from "vitest";
import "../src/main";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("sim returns app shell", () => {
  it("renders the default static shell inside Shadow DOM", () => {
    const element = document.createElement("sim-returns-app");
    element.setAttribute("data-current-year", "2030");
    document.body.append(element);

    expect(element.shadowRoot?.innerHTML).toMatchSnapshot();
  });
});
