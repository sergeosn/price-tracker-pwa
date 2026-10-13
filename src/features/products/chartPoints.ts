import type { PriceChange } from "../../api/types";

/** A type alias (not an interface) so it fits Mantine charts' `Record<string, any>[]` data. */
export type ChartPoint = {
  /** ISO timestamp; the chart formats it for the axis. */
  date: string;
  price: number;
};

/** The API returns newest first; the chart needs oldest first. */
export function toChartPoints(history: PriceChange[]): ChartPoint[] {
  return history
    .map((change) => ({ date: change.detected_at, price: Number(change.new_price) }))
    .reverse();
}
