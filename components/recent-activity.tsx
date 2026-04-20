import { describeEntry } from "@/lib/store";
import { formatCurrency } from "@/lib/money";
import { ChildMode, LedgerEntry } from "@/lib/types";
import { getKidTone } from "@/lib/kid-copy";

interface RecentActivityProps {
  entries: LedgerEntry[];
  currency: string;
  mode: ChildMode;
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
          entries.map((entry) => (
            <article key={entry.id} className="activity-item">
              <div>
                <strong>{describeEntry(entry)}</strong>
                <span>{new Date(entry.createdAt).toLocaleDateString("en-AU")}</span>
              </div>
              <strong>{formatCurrency(entry.amountCents, currency)}</strong>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
