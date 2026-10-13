import { LineChart } from "@mantine/charts";
import type { PriceChange } from "../../../api/types";
import { toChartPoints } from "../chartPoints";

const axisDate = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });

export function PriceChart({ history }: { history: PriceChange[] }) {
  return (
    <div role="img" aria-label="Price chart">
      <LineChart
        h={200}
        data={toChartPoints(history)}
        dataKey="date"
        series={[{ name: "price", label: "Price", color: "blue.6" }]}
        curveType="stepAfter"
        xAxisProps={{ tickFormatter: (value: string) => axisDate.format(new Date(value)) }}
      />
    </div>
  );
}
