import { formatCurrency } from "@/lib/money";
import { JarVisual } from "@/components/jar-visual";
import { Badge } from "@/lib/badges";
import { ChildMode, JarKey } from "@/lib/types";

interface JarAdventureProps {
  currency: string;
  mode: ChildMode;
  totalAllocatedCents: number;
  targets: Partial<Record<JarKey, number>>;
  balances: Partial<Record<JarKey, number>>;
  investingEnabled: boolean;
  badges: Badge[];
}

const jarMeta: Record<JarKey, { label: string; color: string }> = {
  spend: { label: "Spend", color: "#ec6b3b" },
  save: { label: "Save", color: "#f4b942" },
  give: { label: "Give", color: "#ef8f7a" },
  grow: { label: "Grow", color: "#00796b" }
};

const badgeUnlockTips: Record<string, string> = {
  "first-sort": "Sort any amount into a jar.",
  "kind-heart": "Put any coins into Give.",
  "saver": "Have Save at least as high as Spend.",
  "balanced": "Have coins in Spend, Save, and Give.",
  "streak-3": "Sort coins in 3 weeks in a row.",
  "streak-8": "Sort coins in 8 weeks in a row.",
  generous: "Keep Give at 15% or more of your total jars.",
  "future-first": "Keep Save + Grow at least as high as Spend.",
  century: "Sort $100 total across all time.",
  grower: "Put any coins into Grow.",
};

export function JarAdventure({ currency, mode, totalAllocatedCents, targets, balances, investingEnabled, badges }: JarAdventureProps) {
  const visibleJars = (Object.keys(jarMeta) as JarKey[]).filter((jar) => investingEnabled || jar !== "grow");
  const earnedBadges = badges.filter((b) => b.earned);
  const unearnedBadges = badges.filter((b) => !b.earned);

  return (
    <section className="panel panel--warm">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Adventure board</span>
          <h2>{mode === "little" ? "Your jar quests" : "Jar strategy"}</h2>
        </div>
      </div>

      <div className="quest-grid">
        {visibleJars.map((jar) => {
          const percent = targets[jar] ?? 0;
          const jarBalance = balances[jar] ?? 0;
          const expected = Math.round((totalAllocatedCents * percent) / 100);
          const ratio = expected > 0 ? Math.min((jarBalance / expected) * 100, 100) : jarBalance > 0 ? 100 : 0;

          return (
            <article className="quest-card" key={jar}>
              <header>
                <JarVisual jarKey={jar} fillPercent={ratio} size={48} />
                <strong>{jarMeta[jar].label}</strong>
              </header>
              <p>{mode === "little" ? `Target: ${percent}%` : `Target split: ${percent}%`}</p>
              <div className="quest-bar">
                <span style={{ width: `${ratio}%`, background: jarMeta[jar].color }} />
              </div>
              <small>
                {formatCurrency(jarBalance, currency)} / {formatCurrency(expected, currency)}
              </small>
            </article>
          );
        })}
      </div>

      <div className="badge-list">
        {earnedBadges.length > 0 ? (
          earnedBadges.map((badge) => (
            <span
              className="badge-pill badge-pill--new"
              key={badge.id}
              title={`Unlocked. ${badgeUnlockTips[badge.id] ?? "Keep sorting to earn more badges."}`}
            >
              {badge.emoji} {badge.label}
            </span>
          ))
        ) : (
          <span className="badge-pill">
            {mode === "little" ? "Sort coins to unlock badges!" : "Start sorting to unlock badges"}
          </span>
        )}
      </div>

      {unearnedBadges.length > 0 && earnedBadges.length > 0 && (
        <div className="badge-list badge-list--locked">
          {unearnedBadges.map((badge) => (
            <span
              className="badge-pill badge-pill--locked"
              key={badge.id}
              title={`How to unlock: ${badgeUnlockTips[badge.id] ?? "Keep sorting each week."}`}
            >
              {badge.emoji} {badge.label}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
