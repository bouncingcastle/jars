import type { Badge } from "@/lib/badges";
import { getClosestBadge } from "@/lib/badges";

interface ClosestBadgeCalloutProps {
  badges: Badge[];
  currency: string;
  spend: number;
  save: number;
  give: number;
  grow: number;
  lifetimeAllocatedCents: number;
  streak: number;
}

export function ClosestBadgeCallout({
  badges,
  currency,
  spend,
  save,
  give,
  grow,
  lifetimeAllocatedCents,
  streak
}: ClosestBadgeCalloutProps) {
  const total = spend + save + give + grow;
  const closest = getClosestBadge(badges, currency, {
    spend,
    save,
    give,
    grow,
    total,
    lifetime: lifetimeAllocatedCents,
    streak
  });

  if (!closest) {
    return (
      <section className="panel badge-callout badge-callout--done" aria-live="polite">
        <span className="eyebrow">Closest badge</span>
        <h3>All badges unlocked</h3>
        <p>Incredible consistency. Keep sorting to keep the streak alive.</p>
      </section>
    );
  }

  const progressWidth = Math.max(8, Math.round(closest.progress.percent));

  return (
    <section className="panel badge-callout" aria-live="polite">
      <div className="badge-callout__head">
        <span className="eyebrow">Closest badge</span>
        <strong>
          {closest.badge.emoji} {closest.badge.label}
        </strong>
      </div>
      <div className="badge-callout__track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(closest.progress.percent)}>
        <span style={{ width: `${progressWidth}%` }} />
      </div>
      <p>{closest.progress.detail}</p>
    </section>
  );
}
