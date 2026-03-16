import { afterEach, describe, expect, it } from "vitest";

class SnapshotFixtureElement extends HTMLElement {
  constructor() {
    super();

    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <section data-testid="fixture-shell">
        <h1>Snapshot Fixture</h1>
        <p>Shadow DOM snapshot coverage is wired.</p>
      </section>
    `;
  }
}

if (!customElements.get("snapshot-fixture")) {
  customElements.define("snapshot-fixture", SnapshotFixtureElement);
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("shadow DOM snapshot scaffold", () => {
  it("serializes a shadow root to a snapshot", () => {
    const element = document.createElement("snapshot-fixture");
    document.body.append(element);

    expect(element.shadowRoot?.innerHTML).toMatchSnapshot();
  });
});
