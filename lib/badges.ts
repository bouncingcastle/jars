import { formatCurrency } from "@/lib/money";
import { ChildMode, JarKey, LedgerEntry } from "@/lib/types";

export interface Badge {
  id: string;
  label: string;
  emoji: string;
  earned: boolean;
}

export interface BadgeProgress {
  percent: number;
  detail: string;
}

export interface BadgeProgressStats {
  spend: number;
  save: number;
  give: number;
  grow: number;
  total: number;
  lifetime: number;
  streak: number;
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

export function getBadgeProgress(badgeId: string, currency: string, stats: BadgeProgressStats): BadgeProgress {
  const { spend, save, give, grow, total, lifetime, streak } = stats;

  switch (badgeId) {
    case "first-sort": {
      const target = 100;
      return {
        percent: total > 0 ? 100 : 0,
        detail: `${formatCurrency(Math.min(total, target), currency)} / ${formatCurrency(target, currency)}`,
      };
    }
    case "kind-heart": {
      const target = 100;
      return {
        percent: give > 0 ? 100 : 0,
        detail: `${formatCurrency(Math.min(give, target), currency)} / ${formatCurrency(target, currency)} in Give`,
      };
    }
    case "saver": {
      if (spend <= 0) {
        return {
          percent: save > 0 ? 100 : 0,
          detail: `${formatCurrency(save, currency)} saved`,
        };
      }
      return {
        percent: Math.max(0, Math.min((save / spend) * 100, 100)),
        detail: `${formatCurrency(save, currency)} save vs ${formatCurrency(spend, currency)} spend`,
      };
    }
    case "balanced": {
      const filled = [spend, save, give].filter((v) => v > 0).length;
      return { percent: (filled / 3) * 100, detail: `${filled} / 3 jars started` };
    }
    case "streak-3": {
      return { percent: Math.min((streak / 3) * 100, 100), detail: `${Math.min(streak, 3)} / 3 weeks` };
    }
    case "streak-8": {
      return { percent: Math.min((streak / 8) * 100, 100), detail: `${Math.min(streak, 8)} / 8 weeks` };
    }
    case "generous": {
      const target = Math.max(Math.round(total * 0.15), 100);
      return {
        percent: target > 0 ? Math.min((give / target) * 100, 100) : 0,
        detail: `${formatCurrency(give, currency)} / ${formatCurrency(target, currency)} in Give`,
      };
    }
    case "future-first": {
      const future = save + grow;
      const target = Math.max(spend, 100);
      return {
        percent: Math.min((future / target) * 100, 100),
        detail: `${formatCurrency(future, currency)} future jars vs ${formatCurrency(spend, currency)} spend`,
      };
    }
    case "century": {
      const target = 10000;
      return {
        percent: Math.min((lifetime / target) * 100, 100),
        detail: `${formatCurrency(lifetime, currency)} / ${formatCurrency(target, currency)} sorted`,
      };
    }
    case "grower": {
      const target = 100;
      return {
        percent: grow > 0 ? 100 : 0,
        detail: `${formatCurrency(Math.min(grow, target), currency)} / ${formatCurrency(target, currency)} in Grow`,
      };
    }
    default:
      return { percent: 0, detail: "Keep sorting to unlock" };
  }
}

export function getClosestBadge(
  badges: Badge[],
  currency: string,
  stats: BadgeProgressStats
): { badge: Badge; progress: BadgeProgress } | null {
  const candidates = badges.filter((badge) => !badge.earned);
  if (candidates.length === 0) {
    return null;
  }
  const withProgress = candidates.map((badge) => ({
    badge,
    progress: getBadgeProgress(badge.id, currency, stats)
  }));
  withProgress.sort((a, b) => b.progress.percent - a.progress.percent);
  return withProgress[0] ?? null;
}
