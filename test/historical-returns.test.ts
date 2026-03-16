import { describe, expect, it } from "vitest";
import { historicalReturns, historicalReturnsMetadata } from "../src/data/historical-returns";

describe("historical returns dataset", () => {
  it("loads bundled historical returns and metadata from code", () => {
    expect(historicalReturns.length).toBeGreaterThan(0);
    expect(historicalReturnsMetadata.sourceName).toBe("Aswath Damodaran historical returns table");
  });
});
