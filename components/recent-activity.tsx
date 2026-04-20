import { describeEntry } from "@/lib/store";
import { formatCurrency } from "@/lib/money";
import { ChildMode, LedgerEntry } from "@/lib/types";
import { getKidTone } from "@/lib/kid-copy";

interface RecentActivityProps {
  entries: LedgerEntry[];
  currency: string;
  mode: ChildMode;
}

function getEntryMeta(entry: LedgerEntry, mode: ChildMode) {
  if (entry.type === "scheduled_allowance") {
    return {
      emoji: "💸",
      kind: mode === "little" ? "Pocket money landed" : "Scheduled pocket money",
      incoming: true,
    };
  }

  if (entry.type === "manual_allowance") {
    return {
      emoji: "🎁",
      kind: mode === "little" ? "Bonus coins" : "Bonus top-up",
      incoming: true,
    };
  }

  return {
    emoji: "🪙",
    kind: mode === "little" ? "You sorted coins" : "Sorted",
    incoming: false,
  };
}

export function RecentActivity({ entries, currency, mode }: RecentActivityProps) {
  const tone = getKidTone(mode);
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Activity</span>
          <h2>{tone.activityTitle}</h2>
        </div>
      </div>
      <div className="activity-list">
        {entries.length === 0 ? (
          <p className="empty-state">{mode === "little" ? "No activity yet — sort some coins!" : "No activity yet"}</p>
        ) : (
          entries.map((entry) => {
            const meta = getEntryMeta(entry, mode);
            return (
              <article key={entry.id} className={`activity-item ${meta.incoming ? "activity-item--incoming" : ""}`}>
                <div className="activity-item__lead">
                  <span aria-hidden="true" className="activity-item__emoji">{meta.emoji}</span>
                  <div>
                    <strong>{describeEntry(entry)}</strong>
                    <span>{meta.kind} · {new Date(entry.createdAt).toLocaleDateString("en-AU")}</span>
                  </div>
                </div>
                <strong>{formatCurrency(entry.amountCents, currency)}</strong>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
