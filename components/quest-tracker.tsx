import { computeQuestProgress } from "@/lib/quests";
import type { Quest } from "@/lib/types";

interface QuestTrackerProps {
  quests: Quest[];
  saveBalanceCents: number;
  giveBalanceCents: number;
  streak: number;
  currency: string;
}

export function QuestTracker({ quests, saveBalanceCents, giveBalanceCents, streak, currency }: QuestTrackerProps) {
  if (quests.length === 0) {
    return null;
  }

  const visible = quests
    .slice(0, 3)
    .map((quest) => computeQuestProgress(quest, { save: saveBalanceCents, give: giveBalanceCents, streak, currency }));

  return (
    <section className="panel quest-tracker">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Quests</span>
          <h2>Current missions</h2>
        </div>
      </div>
      <div className="quest-tracker__list">
        {visible.map((quest) => (
          <article className="quest-tracker__item" key={quest.id}>
            <header>
              <strong>{quest.title}</strong>
              <span className={quest.complete ? "quest-status quest-status--done" : "quest-status"}>
                {quest.complete ? "Complete" : "In progress"}
              </span>
            </header>
            <div className="quest-tracker__bar">
              <span style={{ width: `${Math.max(6, Math.round(quest.progressPercent))}%` }} />
            </div>
            <small>{quest.progressLabel}</small>
            <p>Reward: {quest.reward}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
