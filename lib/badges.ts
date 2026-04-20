import { ChildMode, JarKey, LedgerEntry } from "@/lib/types";

export interface Badge {
  id: string;
  label: string;
  emoji: string;
  earned: boolean;
}

/**
 * Compute the sorting streak: how many consecutive weeks (ending this week)
 * the child made at least one allocation.
 */
export function computeStreak(entries: LedgerEntry[]): number {
  const allocations = entries
    .filter((e) => e.type === "allocation")
    .map((e) => new Date(e.createdAt));

  if (allocations.length === 0) return 0;

  // Convert date to a Monday-based week number (milliseconds since epoch, floored to weeks)
  function weekOf(d: Date): number {
    // Shift to Monday = start of week. Date.getDay(): 0=Sun..6=Sat → Mon=0
    const day = d.getDay();
    const mon = new Date(d);
    mon.setHours(0, 0, 0, 0);
    mon.setDate(mon.getDate() - ((day + 6) % 7)); // roll back to Monday
    return Math.floor(mon.getTime() / (7 * 86400000));
  }

  const weekNums = new Set(allocations.map(weekOf));
  const sorted = Array.from(weekNums).sort((a, b) => b - a); // most recent first

  const now = new Date();
  const currentWeek = weekOf(now);

  // Streak must include the current week or last week
  if (sorted[0] !== currentWeek && sorted[0] !== currentWeek - 1) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i - 1] - sorted[i] === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Full badge system — much richer than the original 3.
 */
export function computeBadges(
  balances: Record<JarKey, number>,
  lifetimeAllocated: number,
  streak: number,
  mode: ChildMode
): Badge[] {
  const spend = balances.spend ?? 0;
  const save = balances.save ?? 0;
  const give = balances.give ?? 0;
  const grow = balances.grow ?? 0;
  const total = spend + save + give + grow;

  const badges: Badge[] = [
    {
      id: "first-sort",
      emoji: "⭐",
      label: mode === "little" ? "First sort!" : "First cycle",
      earned: total > 0,
    },
    {
      id: "kind-heart",
      emoji: "💝",
      label: mode === "little" ? "Kind heart" : "Generosity started",
      earned: give > 0,
    },
    {
      id: "saver",
      emoji: "🏆",
      label: mode === "little" ? "Super saver" : "Saver activated",
      earned: save >= spend && save > 0,
    },
    {
      id: "balanced",
      emoji: "⚖️",
      label: mode === "little" ? "Balanced jars" : "Balanced portfolio",
      earned: spend > 0 && save > 0 && give > 0,
    },
    {
      id: "streak-3",
      emoji: "🔥",
      label: mode === "little" ? "3-week streak!" : "3-week consistency",
      earned: streak >= 3,
    },
    {
      id: "streak-8",
      emoji: "🌟",
      label: mode === "little" ? "8-week legend!" : "8-week discipline",
      earned: streak >= 8,
    },
    {
      id: "generous",
      emoji: "🤝",
      label: mode === "little" ? "Big giver" : "Generosity champion",
      earned: give >= Math.round(total * 0.15) && give > 0,
    },
    {
      id: "future-first",
      emoji: "🚀",
      label: mode === "little" ? "Future builder" : "Future-first thinker",
      earned: save + grow >= spend && save + grow > 0,
    },
    {
      id: "century",
      emoji: "💎",
      label: mode === "little" ? "$100 sorted!" : "Century sorted",
      earned: lifetimeAllocated >= 10000,
    },
    {
      id: "grower",
      emoji: "🌱",
      label: mode === "little" ? "Money grower" : "Growth investor",
      earned: grow > 0,
    },
  ];

  return badges;
}
