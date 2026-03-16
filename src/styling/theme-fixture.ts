import { baseStyles } from "./base-styles";
import { hostThemeTokens } from "./tokens";

export const fixtureTagName = "theme-fixture";

export class ThemeFixtureElement extends HTMLElement {
  constructor() {
    super();

    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        ${baseStyles}

        .accent-target {
          color: var(${hostThemeTokens.colorAccent});
        }
      </style>
      <div class="fixture-shell">
        <p class="accent-target" data-testid="accent-target">Theme fixture</p>
      </div>
    `;
  }
}

if (!customElements.get(fixtureTagName)) {
  customElements.define(fixtureTagName, ThemeFixtureElement);
}
