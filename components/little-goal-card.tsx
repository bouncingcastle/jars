import { formatCurrency } from "@/lib/money";

interface LittleGoalCardProps {
  goalName: string;
  currentCents: number;
  goalAmountCents: number;
  currency: string;
}

export function LittleGoalCard({ goalName, currentCents, goalAmountCents, currency }: LittleGoalCardProps) {
  const safeGoal = Math.max(goalAmountCents, 1);
  const percent = Math.min((currentCents / safeGoal) * 100, 100);

  return (
    <section className="panel little-goal-card" aria-label="Saving goal">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Saving mission</span>
          <h2>{goalName}</h2>
        </div>
        <strong>{Math.round(percent)}%</strong>
      </div>
      <div className="little-goal-card__bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)}>
        <span style={{ width: `${Math.max(4, Math.round(percent))}%` }} />
      </div>
      <p>
        {formatCurrency(currentCents, currency)} / {formatCurrency(goalAmountCents, currency)}
      </p>
    </section>
  );
}
