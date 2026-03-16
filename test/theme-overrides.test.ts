import { afterEach, describe, expect, it } from "vitest";
import { hostThemeTokens } from "../src/styling/tokens";
import { fixtureTagName } from "../src/styling/theme-fixture";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("host theme overrides", () => {
  it("allows a host-set CSS custom property to flow into the Shadow DOM", () => {
    const element = document.createElement(fixtureTagName);
    element.style.setProperty(hostThemeTokens.colorAccent, "#ff0000");
    document.body.append(element);

    const target = element.shadowRoot?.querySelector<HTMLElement>("[data-testid='accent-target']");

    expect(target).not.toBeNull();
    expect(["#ff0000", "rgb(255, 0, 0)"]).toContain(getComputedStyle(target as HTMLElement).color);
  });
});
