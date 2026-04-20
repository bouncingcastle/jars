import { ChildMode } from "@/lib/types";

interface SortingStreakProps {
  streak: number;
  mode: ChildMode;
}

export function SortingStreak({ streak, mode }: SortingStreakProps) {
  if (streak < 1) return null;

  const flames = streak >= 8 ? "🔥🔥🔥" : streak >= 3 ? "🔥🔥" : "🔥";

  const message =
    mode === "little"
      ? streak === 1
        ? "You sorted this week!"
        : `${streak} weeks in a row!`
      : streak === 1
        ? "Sorted this week"
        : `${streak}-week sorting streak`;

  return (
    <section className="panel streak-card" aria-label="Sorting streak">
      <span className="streak-card__flame">{flames}</span>
      <div>
        <span className="streak-card__count">{streak}</span>
        <p className="streak-card__label">{message}</p>
      </div>
    </section>
  );
}
