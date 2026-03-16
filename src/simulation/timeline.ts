import type { SimulationPhase } from "../domain/types";

export function getSimulationPhaseForYear(
  calendarYear: number,
  retirementStartYear: number,
): SimulationPhase {
  return calendarYear >= retirementStartYear ? "retirement" : "accumulation";
}
