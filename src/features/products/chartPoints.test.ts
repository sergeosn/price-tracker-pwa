import { expect, it } from "vitest";
import { makePriceChange } from "../../test/factories";
import { toChartPoints } from "./chartPoints";

it("orders points oldest first and converts prices to numbers", () => {
  const history = [
    makePriceChange({ new_price: "1199.00", detected_at: "2026-10-12T00:00:00Z" }),
    makePriceChange({ new_price: "1299.50", detected_at: "2026-10-01T00:00:00Z" }),
  ];

  expect(toChartPoints(history)).toEqual([
    { date: "2026-10-01T00:00:00Z", price: 1299.5 },
    { date: "2026-10-12T00:00:00Z", price: 1199 },
  ]);
});

it("does not mutate the input", () => {
  const history = [makePriceChange({ id: 1 }), makePriceChange({ id: 2 })];
  toChartPoints(history);
  expect(history.map((change) => change.id)).toEqual([1, 2]);
});
