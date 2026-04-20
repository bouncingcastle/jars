import Link from "next/link";
import type { ChildSnapshot } from "@/lib/types";
import { formatCurrency } from "@/lib/money";

interface AdminChildSummaryCardProps {
  child: ChildSnapshot;
  currency: string;
  activeQuestCount: number;
}

export function AdminChildSummaryCard({ child, currency, activeQuestCount }: AdminChildSummaryCardProps) {
  const enabledJars = ["Spend", "Save", "Give", child.profile.investingEnabled ? "Grow" : null].filter(Boolean).join(" · ");

  return (
    <article className="panel admin-child-summary-card">
      <div className="admin-child-summary-card__header">
        <div>
          <span className="eyebrow">Child</span>
          <h2>{child.profile.name}</h2>
        </div>
        <span className="admin-chip">{child.profile.mode === "little" ? "Little Kids" : "Big Kids"}</span>
      </div>

      <div className="admin-child-summary-card__stats">
        <div>
          <small>Ready to sort</small>
          <strong>{formatCurrency(child.availableCents, currency)}</strong>
        </div>
        <div>
          <small>Active quests</small>
          <strong>{activeQuestCount}</strong>
        </div>
        <div>
          <small>Theme</small>
          <strong>{child.profile.theme}</strong>
        </div>
      </div>

      <div className="admin-child-summary-card__meta">
        <p>
          Pocket money: <strong>{formatCurrency(child.profile.allowanceCents, currency)}</strong>
        </p>
        <p>
          Goal: <strong>{child.profile.goalName}</strong>
        </p>
        <p>
          Split: <strong>{child.profile.jarTargets.spend}/{child.profile.jarTargets.save}/{child.profile.jarTargets.give}/{child.profile.jarTargets.grow}</strong>
        </p>
        <p>
          Jars: <strong>{enabledJars}</strong>
        </p>
      </div>

      <div className="admin-child-summary-card__actions">
        <Link className="primary-button" href={`/admin/child/${child.profile.id}`}>
          Manage child
        </Link>
        <Link className="secondary-button" href={`/child/${child.profile.id}`}>
          Open child view
        </Link>
      </div>
    </article>
  );
}
