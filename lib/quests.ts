import { formatCurrency } from "@/lib/money";
import type { Quest, QuestProgress } from "@/lib/types";

interface QuestStats {
  save: number;
  give: number;
  streak: number;
  currency: string;
}

export function computeQuestProgress(quest: Quest, stats: QuestStats): QuestProgress {
  let progressValue = 0;
  let progressLabel = "";

  if (quest.type === "save_balance") {
    progressValue = stats.save;
    progressLabel = `${formatCurrency(stats.save, stats.currency)} / ${formatCurrency(quest.targetValue, stats.currency)}`;
  } else if (quest.type === "give_balance") {
    progressValue = stats.give;
    progressLabel = `${formatCurrency(stats.give, stats.currency)} / ${formatCurrency(quest.targetValue, stats.currency)}`;
  } else {
    progressValue = stats.streak;
    progressLabel = `${Math.min(stats.streak, quest.targetValue)} / ${quest.targetValue} weeks`;
  }

  const progressPercent = quest.targetValue > 0 ? Math.min((progressValue / quest.targetValue) * 100, 100) : 0;

  return {
    ...quest,
    progressValue,
    progressPercent,
    complete: progressValue >= quest.targetValue,
    progressLabel
  };
}
