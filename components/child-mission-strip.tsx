import Link from "next/link";
import { formatCurrency } from "@/lib/money";
import type { Badge } from "@/lib/badges";

interface ChildMissionStripProps {
  mode: "little" | "big";
  availableCents: number;
  currency: string;
  nearestBadge: { badge: Badge; percent: number; detail: string } | null;
  nextPaydayIso: string | null;
}

function getCountdownLabel(nextPaydayIso: string | null) {
  if (!nextPaydayIso) return "No upcoming payday";
  const target = new Date(nextPaydayIso);
  const today = new Date();
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const days = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (days <= 0) return "Payday is today";
  if (days === 1) return "Payday in 1 day";
  return `Payday in ${days} days`;
}

export function ChildMissionStrip({ mode, availableCents, currency, nearestBadge, nextPaydayIso }: ChildMissionStripProps) {
  const hasFundsToSort = availableCents > 0;
  const mission = hasFundsToSort
    ? `Sort ${formatCurrency(availableCents, currency)} today`
    : mode === "little"
      ? "All sorted. Come back for payday"
      : "All sorted. Check in at the next payday";

  const badgeLine = nearestBadge
    ? `${nearestBadge.badge.emoji} ${nearestBadge.badge.label} (${Math.round(nearestBadge.percent)}%)`
    : "All badges unlocked";

  return (
    <section className="panel mission-strip" aria-live="polite">
      <div className="mission-strip__lead">
        <span className="eyebrow">Your next move</span>
        <h2>{mission}</h2>
        <p>{getCountdownLabel(nextPaydayIso)}</p>
      </div>
      <div className="mission-strip__meta" role="list" aria-label="Progress highlights">
        <article role="listitem">
          <small>Nearest badge</small>
          <strong>{badgeLine}</strong>
        </article>
        <article role="listitem">
          <small>What happens next</small>
          <strong>{hasFundsToSort ? "Sort now to grow streak + rewards" : "Return on payday for a fresh mission"}</strong>
        </article>
      </div>
      <div className="mission-strip__actions">
        <Link className="primary-button" href="#allocation-board">
          {hasFundsToSort ? "Start sorting" : "Jump to plan"}
        </Link>
      </div>
    </section>
  );
}
