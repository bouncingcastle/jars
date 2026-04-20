"use client";

import { useMemo, useState, type TouchEvent } from "react";
import { formatCurrency } from "@/lib/money";
import { JarVisual } from "@/components/jar-visual";
import { Badge, getBadgeProgress } from "@/lib/badges";
import { ChildMode, JarKey } from "@/lib/types";

interface JarAdventureProps {
  currency: string;
  mode: ChildMode;
  totalAllocatedCents: number;
  targets: Partial<Record<JarKey, number>>;
  balances: Partial<Record<JarKey, number>>;
  investingEnabled: boolean;
  badges: Badge[];
  streak: number;
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

export function JarAdventure({ currency, mode, totalAllocatedCents, targets, balances, investingEnabled, badges, streak }: JarAdventureProps) {
  const [activeBadgeId, setActiveBadgeId] = useState<string | null>(null);
  const [sheetDragY, setSheetDragY] = useState(0);
  const [sheetTouchStartY, setSheetTouchStartY] = useState<number | null>(null);
  const visibleJars = (Object.keys(jarMeta) as JarKey[]).filter((jar) => investingEnabled || jar !== "grow");
  const earnedBadges = badges.filter((b) => b.earned);
  const unearnedBadges = badges.filter((b) => !b.earned);
  const allBadges = useMemo(() => [...earnedBadges, ...unearnedBadges], [earnedBadges, unearnedBadges]);
  const activeBadge = activeBadgeId ? allBadges.find((badge) => badge.id === activeBadgeId) ?? null : null;
  const spend = balances.spend ?? 0;
  const save = balances.save ?? 0;
  const give = balances.give ?? 0;
  const grow = balances.grow ?? 0;
  const total = spend + save + give + grow;
  const activeBadgeProgress = activeBadge
    ? getBadgeProgress(activeBadge.id, currency, {
      spend,
      save,
      give,
      grow,
      total,
      lifetime: totalAllocatedCents,
      streak,
    })
    : null;

  function openBadgeSheet(badgeId: string) {
    setActiveBadgeId(badgeId);
  }

  function closeBadgeSheet() {
    setActiveBadgeId(null);
    setSheetDragY(0);
    setSheetTouchStartY(null);
  }

  function onSheetTouchStart(event: TouchEvent<HTMLElement>) {
    setSheetTouchStartY(event.touches[0]?.clientY ?? null);
  }

  function onSheetTouchMove(event: TouchEvent<HTMLElement>) {
    if (sheetTouchStartY === null) return;
    const currentY = event.touches[0]?.clientY ?? sheetTouchStartY;
    setSheetDragY(Math.max(currentY - sheetTouchStartY, 0));
  }

  function onSheetTouchEnd() {
    if (sheetDragY > 90) {
      closeBadgeSheet();
      return;
    }
    setSheetDragY(0);
    setSheetTouchStartY(null);
  }

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
            <div className="badge-pill-wrap" key={badge.id}>
              <button
                className="badge-pill badge-pill--new badge-pill-trigger"
                type="button"
                aria-describedby={`badge-tip-earned-${badge.id}`}
                onClick={() => openBadgeSheet(badge.id)}
              >
                {badge.emoji} {badge.label}
              </button>
              <span className="badge-tooltip" id={`badge-tip-earned-${badge.id}`} role="tooltip">
                Unlocked. {badgeUnlockTips[badge.id] ?? "Keep sorting to earn more badges."}
              </span>
            </div>
          ))
        ) : (
          <span className="badge-pill">
            {mode === "little" ? "Sort coins to unlock badges!" : "Start sorting to unlock badges"}
          </span>
        )}
      </div>
      <p className="badge-help-text">Tap a badge to see how it is unlocked.</p>

      {unearnedBadges.length > 0 && earnedBadges.length > 0 && (
        <div className="badge-list badge-list--locked">
          {unearnedBadges.map((badge) => (
            <div className="badge-pill-wrap" key={badge.id}>
              <button
                className="badge-pill badge-pill--locked badge-pill-trigger"
                type="button"
                aria-describedby={`badge-tip-locked-${badge.id}`}
                onClick={() => openBadgeSheet(badge.id)}
              >
                {badge.emoji} {badge.label}
              </button>
              <span className="badge-tooltip" id={`badge-tip-locked-${badge.id}`} role="tooltip">
                How to unlock: {badgeUnlockTips[badge.id] ?? "Keep sorting each week."}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeBadge ? (
        <div className="badge-sheet" role="dialog" aria-modal="true" aria-label="Badge details">
          <button className="badge-sheet__scrim" type="button" onClick={closeBadgeSheet} aria-label="Close badge details" />
          <article
            className="badge-sheet__panel"
            onTouchStart={onSheetTouchStart}
            onTouchMove={onSheetTouchMove}
            onTouchEnd={onSheetTouchEnd}
            style={{ transform: `translateY(${sheetDragY}px)` }}
          >
            <div className="badge-sheet__handle" aria-hidden="true" />
            <header>
              <strong>
                {activeBadge.emoji} {activeBadge.label}
              </strong>
              <button className="secondary-button" type="button" onClick={closeBadgeSheet}>Close</button>
            </header>
            <p className="badge-sheet__status">
              {activeBadge.earned ? "Unlocked!" : "Locked"}
            </p>
            <p className="badge-sheet__tip">
              {badgeUnlockTips[activeBadge.id] ?? "Keep sorting each week to unlock more badges."}
            </p>
            {activeBadgeProgress ? (
              <div className="badge-progress">
                <div className="badge-progress__track">
                  <span style={{ width: `${activeBadgeProgress.percent <= 0 ? 0 : Math.max(6, Math.round(activeBadgeProgress.percent))}%` }} />
                </div>
                <small>{activeBadgeProgress.detail}</small>
              </div>
            ) : null}
          </article>
        </div>
      ) : null}
    </section>
  );
}
