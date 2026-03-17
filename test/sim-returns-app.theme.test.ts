import { afterEach, describe, expect, it } from "vitest";
import "../src/main";
import { hostThemeTokens } from "../src/styling/tokens";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("sim returns app theme contract", () => {
  it("applies documented host token overrides on the real app shell", () => {
    const element = document.createElement("sim-returns-app");
    element.style.setProperty(hostThemeTokens.colorAccent, "#ff0000");
    element.setAttribute("data-current-year", "2030");
    document.body.append(element);

    const eyebrow = element.shadowRoot?.querySelector<HTMLElement>(".eyebrow");

    expect(eyebrow).not.toBeNull();
    expect(["#ff0000", "rgb(255, 0, 0)"]).toContain(getComputedStyle(eyebrow as HTMLElement).color);
  });
});
