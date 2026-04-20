import { formatCurrency } from "@/lib/money";
import { ChildMode } from "@/lib/types";
import { getKidTone } from "@/lib/kid-copy";

interface HistoryChartProps {
  history: Array<{
    month: string;
    inflowCents: number;
    allocatedCents: number;
  }>;
  currency: string;
  mode: ChildMode;
}

export function HistoryChart({ history, currency, mode }: HistoryChartProps) {
  const tone = getKidTone(mode);
  const maxValue = Math.max(...history.flatMap((entry) => [entry.inflowCents, entry.allocatedCents]), 1);

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Progress</span>
          <h2>{tone.chartTitle}</h2>
        </div>
      </div>
      <div className="history-chart">
        {history.map((entry) => (
          <div key={entry.month} className="history-chart__month">
            <div className="history-chart__bars">
              <span
                className="history-chart__bar history-chart__bar--inflow"
                style={{ height: `${Math.max((entry.inflowCents / maxValue) * 100, 6)}%` }}
                title={formatCurrency(entry.inflowCents, currency)}
              />
              <span
                className="history-chart__bar history-chart__bar--allocated"
                style={{ height: `${Math.max((entry.allocatedCents / maxValue) * 100, 6)}%` }}
                title={formatCurrency(entry.allocatedCents, currency)}
              />
            </div>
            <span>{entry.month.slice(5)}</span>
          </div>
        ))}
      </div>
      <div className="history-chart__legend">
        <span className="history-chart__legend-dot history-chart__legend-dot--inflow" />
        <span>Received</span>
        <span className="history-chart__legend-dot history-chart__legend-dot--allocated" />
        <span>Sorted</span>
      </div>
    </section>
  );
}
