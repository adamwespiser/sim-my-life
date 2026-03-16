import { describe, expect, it } from "vitest";
import { historicalReturns, historicalReturnsMetadata } from "../src/data/historical-returns";

describe("historical returns dataset", () => {
  it("loads bundled historical returns and metadata from code", () => {
    expect(historicalReturns.length).toBeGreaterThan(0);
    expect(historicalReturnsMetadata.sourceName).toBe("Aswath Damodaran historical returns table");
  });

  it("matches the expected coverage window and metadata version", () => {
    expect(historicalReturns).toHaveLength(98);
    expect(historicalReturns[0]).toEqual({ totalReturn: 0.4381, year: 1928 });
    expect(historicalReturns.at(-1)).toEqual({ totalReturn: 0.1778, year: 2025 });
    expect(historicalReturnsMetadata.coverageStartYear).toBe(1928);
    expect(historicalReturnsMetadata.coverageEndYear).toBe(2025);
    expect(historicalReturnsMetadata.version).toBe("damodaran-sp500-tr-1928-2025-v1");
  });
});
