import type { YearlyPathPoint } from "../domain/types";

export interface PercentileValues {
  p10: number;
  p50: number;
  p90: number;
}

export interface YearlyPercentilePoint extends PercentileValues {
  calendarYear: number;
}

export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) {
    throw new Error("values must contain at least one entry");
  }

  const sortedValues = [...values].sort((left, right) => left - right);
  const position = (sortedValues.length - 1) * percentile;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);
  const lowerValue = sortedValues[lowerIndex] ?? 0;
  const upperValue = sortedValues[upperIndex] ?? lowerValue;

  if (lowerIndex === upperIndex) {
    return lowerValue;
  }

  return lowerValue + (upperValue - lowerValue) * (position - lowerIndex);
}

export function summarizePercentiles(values: number[]): PercentileValues {
  return {
    p10: calculatePercentile(values, 0.1),
    p50: calculatePercentile(values, 0.5),
    p90: calculatePercentile(values, 0.9),
  };
}

export function calculateYearlyPercentiles(paths: YearlyPathPoint[][]): YearlyPercentilePoint[] {
  const firstPath = paths[0];

  if (firstPath == null) {
    return [];
  }

  return firstPath.map((point, index) => {
    const balances = paths
      .map((path) => path[index]?.endingBalance)
      .filter((value): value is number => value != null);

    return {
      calendarYear: point.calendarYear,
      ...summarizePercentiles(balances),
    };
  });
}
