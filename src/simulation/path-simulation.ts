import type { ScenarioInput, SimulationPhase, YearlyPathPoint } from "../domain/types";
import { simulateFixedDollarsRetirementYear } from "./strategy-fixed-dollars";
import { simulatePercentOfPortfolioRetirementYear } from "./strategy-percent-of-portfolio";
import { getSimulationPhaseForYear } from "./timeline";

export interface AccumulationYearInput {
  annualReturn: number;
  annualSavings: number;
  calendarYear: number;
  simulation: number;
  startingBalance: number;
}

export function simulateAccumulationYear(input: AccumulationYearInput): YearlyPathPoint {
  const investmentIncome = input.startingBalance * input.annualReturn;
  const endingBalance = input.startingBalance + investmentIncome + input.annualSavings;

  return {
    annualReturn: input.annualReturn,
    calendarYear: input.calendarYear,
    contribution: input.annualSavings,
    depleted: endingBalance <= 0,
    endingBalance,
    investmentIncome,
    phase: "accumulation",
    simulation: input.simulation,
    startingBalance: input.startingBalance,
    withdrawal: 0,
  };
}

export interface SimulatePathInput {
  annualReturns: number[];
  currentYear: number;
  scenario: ScenarioInput;
  simulation: number;
}

export function getTotalSimulationYears(
  currentYear: number,
  retirementStartYear: number,
  yearsInRetirement: number,
): number {
  return retirementStartYear - currentYear + yearsInRetirement;
}

export function simulatePath(input: SimulatePathInput): YearlyPathPoint[] {
  const totalYears = getTotalSimulationYears(
    input.currentYear,
    input.scenario.retirementStartYear,
    input.scenario.yearsInRetirement,
  );

  if (input.annualReturns.length !== totalYears) {
    throw new Error(
      `expected ${totalYears} annual returns, received ${input.annualReturns.length}`,
    );
  }

  const points: YearlyPathPoint[] = [];
  let runningBalance = input.scenario.currentPortfolio;
  let depleted = false;

  for (const [index, annualReturn] of input.annualReturns.entries()) {
    const calendarYear = input.currentYear + index;
    const phase = getSimulationPhaseForYear(calendarYear, input.scenario.retirementStartYear);

    const point: YearlyPathPoint = depleted
      ? createDepletedYearPoint({
          annualReturn,
          calendarYear,
          phase,
          simulation: input.simulation,
        })
      : simulateActiveYear({
          annualReturn,
          calendarYear,
          phase,
          scenario: input.scenario,
          simulation: input.simulation,
          startingBalance: runningBalance,
        });

    points.push(point);
    runningBalance = point.endingBalance;
    depleted ||= point.depleted;
  }

  return points;
}

interface SimulateActiveYearInput {
  annualReturn: number;
  calendarYear: number;
  phase: SimulationPhase;
  scenario: ScenarioInput;
  simulation: number;
  startingBalance: number;
}

function simulateActiveYear(input: SimulateActiveYearInput): YearlyPathPoint {
  if (input.phase === "accumulation") {
    return simulateAccumulationYear({
      annualReturn: input.annualReturn,
      annualSavings: input.scenario.annualSavings,
      calendarYear: input.calendarYear,
      simulation: input.simulation,
      startingBalance: input.startingBalance,
    });
  }

  if (input.scenario.retirementStrategy.mode === "fixed-dollars") {
    return simulateFixedDollarsRetirementYear({
      annualInflationAdjustment: input.scenario.retirementStrategy.annualInflationAdjustment,
      annualReturn: input.annualReturn,
      baseAnnualSpending: input.scenario.retirementStrategy.annualSpending,
      calendarYear: input.calendarYear,
      retirementYearIndex: input.calendarYear - input.scenario.retirementStartYear,
      simulation: input.simulation,
      startingBalance: input.startingBalance,
    });
  }

  return simulatePercentOfPortfolioRetirementYear({
    annualReturn: input.annualReturn,
    calendarYear: input.calendarYear,
    simulation: input.simulation,
    startingBalance: input.startingBalance,
    withdrawalRate: input.scenario.retirementStrategy.withdrawalRate,
  });
}

interface CreateDepletedYearPointInput {
  annualReturn: number;
  calendarYear: number;
  phase: SimulationPhase;
  simulation: number;
}

function createDepletedYearPoint(input: CreateDepletedYearPointInput): YearlyPathPoint {
  return {
    annualReturn: input.annualReturn,
    calendarYear: input.calendarYear,
    contribution: 0,
    depleted: true,
    endingBalance: 0,
    investmentIncome: 0,
    phase: input.phase,
    simulation: input.simulation,
    startingBalance: 0,
    withdrawal: 0,
  };
}
