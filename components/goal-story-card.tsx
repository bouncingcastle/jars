import { formatCurrency } from "@/lib/money";
import { ChildMode } from "@/lib/types";
import { JarVisual } from "@/components/jar-visual";

interface GoalStoryCardProps {
  mode: ChildMode;
  goalName: string;
  goalAmountCents: number;
  currentCents: number;
  currency: string;
}

export function GoalStoryCard({ mode, goalName, goalAmountCents, currentCents, currency }: GoalStoryCardProps) {
  const safeGoal = Math.max(goalAmountCents, 1);
  const progress = Math.min((currentCents / safeGoal) * 100, 100);
  const remaining = Math.max(safeGoal - currentCents, 0);
  const done = remaining === 0;

  return (
    <section className="panel panel--warm goal-story-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{mode === "little" ? "Save jar goal" : "Save goal"}</span>
          <h2>{mode === "little" ? "What makes you smile?" : "Goal tracker"}</h2>
        </div>
        <strong>{Math.round(progress)}%</strong>
      </div>

      <div className="goal-story-card__visual">
        <JarVisual jarKey="save" fillPercent={progress} size={72} />
        <div>
          <p className="goal-story-card__title">{goalName}</p>
          <p>
            {formatCurrency(currentCents, currency)} saved of {formatCurrency(safeGoal, currency)}
          </p>
          <small>
            {done
              ? mode === "little"
                ? "You did it. Goal unlocked!"
                : "Goal complete. Excellent work."
              : `${formatCurrency(remaining, currency)} to go`}
          </small>
        </div>
      </div>

      <div className="goal-story-card__rail">
        <span style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}
