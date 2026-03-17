import { describe, expect, it, vi } from "vitest";
import { createLogger } from "../src/platform/logging";

describe("logger", () => {
  it("prefixes structured log events and suppresses debug output unless verbose", () => {
    const mockConsole = {
      debug: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    };
    const logger = createLogger({
      console: mockConsole,
      verbose: false,
    });

    logger.info("startup", { mounted: true });
    logger.debug("trace", { step: 1 });
    logger.error("fatal", { message: "boom" });

    expect(mockConsole.info).toHaveBeenCalledWith("sim-returns: startup", { mounted: true });
    expect(mockConsole.debug).not.toHaveBeenCalled();
    expect(mockConsole.error).toHaveBeenCalledWith("sim-returns: fatal", { message: "boom" });
  });
});
