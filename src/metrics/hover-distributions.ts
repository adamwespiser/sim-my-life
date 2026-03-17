import type { YearlyPathPoint } from "../domain/types";

export interface HoverYearDistributions {
  accountAssets: number[];
  calendarYear: number;
  investmentIncome: number[];
  withdrawals: number[];
}

export function getHoverYearDistributions(
  paths: YearlyPathPoint[][],
  calendarYear: number,
): HoverYearDistributions {
  const points = paths
    .map((path) => path.find((point) => point.calendarYear === calendarYear))
    .filter((point): point is YearlyPathPoint => point != null);

  return {
    accountAssets: points.map((point) => point.endingBalance),
    calendarYear,
    investmentIncome: points.map((point) => point.investmentIncome),
    withdrawals: points.map((point) => point.withdrawal),
  };
}
