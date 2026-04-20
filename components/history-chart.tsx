import { formatCurrency } from "@/lib/money";
import { ChildMode, ScheduleType } from "@/lib/types";
import { getKidTone } from "@/lib/kid-copy";

interface HistoryChartProps {
  history: Array<{
    month: string;
    inflowCents: number;
    allocatedCents: number;
  }>;
  currency: string;
  mode: ChildMode;
  allowanceCents: number;
  nextPaydayIso: string | null;
  nextThreePaydays: string[];
  schedule: ScheduleType;
}

function scheduleLabel(schedule: ScheduleType) {
  if (schedule === "fortnightly") return "every 2 weeks";
  if (schedule === "monthly") return "every month";
  return "every week";
}

export function HistoryChart({ history, currency, mode, allowanceCents, nextPaydayIso, nextThreePaydays, schedule }: HistoryChartProps) {
  const tone = getKidTone(mode);
  const maxValue = Math.max(...history.flatMap((entry) => [entry.inflowCents, entry.allocatedCents]), 1);
  const nextDate = nextPaydayIso ? new Date(nextPaydayIso) : null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const daysUntilNext = nextDate ? Math.max(Math.ceil((nextDate.getTime() - now.getTime()) / 86400000), 0) : null;
  const paydayCards = nextThreePaydays
    .map((iso) => new Date(iso))
    .filter((date) => !Number.isNaN(date.getTime()))
    .map((date) => {
      const daysAway = Math.max(Math.ceil((date.getTime() - now.getTime()) / 86400000), 0);
      return {
        date,
        daysAway,
        label: daysAway === 0 ? "today" : `in ${daysAway} day${daysAway === 1 ? "" : "s"}`,
      };
    });

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Money story</span>
          <h2>{tone.chartTitle}</h2>
        </div>
      </div>
      <div className="payday-card">
        {nextDate ? (
          <>
            <strong>🗓️ Next pocket money: {nextDate.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}</strong>
            <span>
              +{formatCurrency(allowanceCents, currency)} {scheduleLabel(schedule)}
              {daysUntilNext === 0 ? " · today" : ` · in ${daysUntilNext} day${daysUntilNext === 1 ? "" : "s"}`}
            </span>
            <div className="payday-mini-calendar" role="list" aria-label="Next three paydays">
              {paydayCards.slice(0, 3).map((item) => (
                <article className="payday-mini-calendar__item" key={item.date.toISOString()} role="listitem">
                  <small>{item.date.toLocaleDateString("en-AU", { weekday: "short" })}</small>
                  <strong>{item.date.toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</strong>
                  <span>{item.label}</span>
                  <em>+{formatCurrency(allowanceCents, currency)}</em>
                </article>
              ))}
            </div>
          </>
        ) : (
          <>
            <strong>🗓️ Next pocket money date unavailable</strong>
            <span>Check your schedule start date in parent settings.</span>
          </>
        )}
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
        <span>{mode === "little" ? "Coins in" : "Received"}</span>
        <span className="history-chart__legend-dot history-chart__legend-dot--allocated" />
        <span>{mode === "little" ? "Coins sorted" : "Sorted"}</span>
      </div>
    </section>
  );
}
