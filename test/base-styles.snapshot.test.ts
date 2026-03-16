import { afterEach, describe, expect, it } from "vitest";
import { baseStyles } from "../src/styling/base-styles";

class BaseStylesFixtureElement extends HTMLElement {
  constructor() {
    super();

    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>${baseStyles}</style>
      <div class="fixture-shell">
        <section>Base styles fixture</section>
      </div>
    `;
  }
}

if (!customElements.get("base-styles-fixture")) {
  customElements.define("base-styles-fixture", BaseStylesFixtureElement);
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("base Shadow DOM styles", () => {
  it("renders a host-scoped style tag and shell markup", () => {
    const element = document.createElement("base-styles-fixture");
    document.body.append(element);

    expect(element.shadowRoot?.innerHTML).toMatchSnapshot();
  });
});
