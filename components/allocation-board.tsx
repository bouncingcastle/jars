"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { useFormStatus } from "react-dom";
import { allocateFundsAction } from "@/app/actions";
import { getKidTone } from "@/lib/kid-copy";
import { Badge, computeBadges, getClosestBadge } from "@/lib/badges";
import { formatCurrency } from "@/lib/money";
import { computeQuestProgress } from "@/lib/quests";
import { playCoinClink, playSuccessChime, playBadgeUnlock } from "@/lib/sounds";
import { JarVisual } from "@/components/jar-visual";
import { ChildMode, JarKey, Quest } from "@/lib/types";

interface AllocationBoardProps {
  sectionId?: string;
  childId: string;
  availableCents: number;
  currency: string;
  mode: ChildMode;
  streak: number;
  sortedThisWeek: boolean;
  activeQuests: Quest[];
  currentBalances: Partial<Record<JarKey, number>>;
  totalAllocatedCents: number;
  currentBadges: Badge[];
  targets: Partial<Record<JarKey, number>>;
  jars: Array<{
    key: JarKey;
    label: string;
    hint: string;
    currentBalance: number;
  }>;
}

const zeroDraft: Record<JarKey, number> = {
  spend: 0,
  save: 0,
  give: 0,
  grow: 0
};

/** Step size in cents: $1 for little kids, $0.50 for big kids */
function getStep(mode: ChildMode) {
  return mode === "little" ? 100 : 50;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="primary-button" disabled={pending} type="submit">
      {pending ? "Sorting..." : label}
    </button>
  );
}

interface RewardSummary {
  sortedCents: number;
  streakDelta: number;
  badgeSummary: string;
  questSummaries: string[];
}

interface FlyingCoin {
  id: string;
  label: string;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
}

interface JarImpact {
  id: string;
  x: number;
  y: number;
  jar: JarKey;
}

export function AllocationBoard({
  sectionId,
  childId,
  availableCents,
  currency,
  mode,
  streak,
  sortedThisWeek,
  activeQuests,
  currentBalances,
  totalAllocatedCents,
  currentBadges,
  jars,
  targets
}: AllocationBoardProps) {
  const tone = getKidTone(mode);
  const [draft, setDraft] = useState(zeroDraft);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [magicSorting, setMagicSorting] = useState(false);
  const [bouncingJar, setBouncingJar] = useState<JarKey | null>(null);
  const [dropTargetJar, setDropTargetJar] = useState<JarKey | null>(null);
  const [rewardSummary, setRewardSummary] = useState<RewardSummary | null>(null);
  const [flyingCoins, setFlyingCoins] = useState<FlyingCoin[]>([]);
  const [jarImpacts, setJarImpacts] = useState<JarImpact[]>([]);
  const touchDragCoinRef = useRef<number | null>(null);
  const [touchDragCoin, setTouchDragCoin] = useState<number | null>(null);
  const [touchGhostPos, setTouchGhostPos] = useState<{ x: number; y: number } | null>(null);

  const step = getStep(mode);

  const draftTotal = useMemo(() => {
    return jars.reduce((sum, jar) => sum + (draft[jar.key] || 0), 0);
  }, [draft, jars]);

  const remaining = availableCents - draftTotal;

  const nudge = useCallback(
    (key: JarKey, delta: number) => {
      playCoinClink();
      setBouncingJar(key);
      setTimeout(() => setBouncingJar(null), 360);
      setDraft((prev) => {
        const current = prev[key] || 0;
        const next = Math.max(0, current + delta);
        // Don't allow going over available
        const newTotal = draftTotal - current + next;
        if (newTotal > availableCents) return prev;
        return { ...prev, [key]: next };
      });
    },
    [draftTotal, availableCents]
  );

  const nudgeRef = useRef(nudge);
  nudgeRef.current = nudge;

  const coinTray = mode === "little"
    ? [100, 200, 500].filter((value) => value <= Math.max(availableCents, 100))
    : [];

  function triggerCoinAnimation(coinValue: number, startX: number, startY: number, jarKey: JarKey, jarRect: DOMRect) {
    const targetX = jarRect.left + jarRect.width * 0.5;
    const targetY = jarRect.top + jarRect.height * 0.4;
    const coin: FlyingCoin = {
      id: crypto.randomUUID(),
      label: formatCurrency(coinValue, currency),
      startX,
      startY,
      dx: targetX - startX,
      dy: targetY - startY
    };
    setFlyingCoins((prev) => [...prev, coin]);
    setTimeout(() => {
      const impact: JarImpact = { id: crypto.randomUUID(), x: targetX, y: targetY, jar: jarKey };
      setJarImpacts((prev) => [...prev, impact]);
      setTimeout(() => setJarImpacts((prev) => prev.filter((item) => item.id !== impact.id)), 420);
    }, 520);
    setTimeout(() => setFlyingCoins((prev) => prev.filter((item) => item.id !== coin.id)), 650);
  }

  function handleCoinDragStart(event: DragEvent<HTMLButtonElement>, coinValue: number) {
    event.dataTransfer.setData("text/plain", String(coinValue));
    event.dataTransfer.effectAllowed = "copy";
  }

  function handleJarDrop(event: DragEvent<HTMLDivElement>, jar: JarKey) {
    event.preventDefault();
    setDropTargetJar(null);
    const raw = event.dataTransfer.getData("text/plain");
    const coinValue = Number(raw);
    if (!Number.isFinite(coinValue) || coinValue <= 0) return;
    const jarRect = event.currentTarget.getBoundingClientRect();
    const startX = Number.isFinite(event.clientX) ? event.clientX : jarRect.left + jarRect.width * 0.5;
    const startY = Number.isFinite(event.clientY) ? event.clientY : jarRect.top + jarRect.height * 0.5;
    triggerCoinAnimation(coinValue, startX, startY, jar, jarRect);
    nudge(jar, coinValue);
  }

  function handleCoinTouchStart(e: React.TouchEvent<HTMLButtonElement>, coinValue: number) {
    e.preventDefault();
    touchDragCoinRef.current = coinValue;
    setTouchDragCoin(coinValue);
    const touch = e.touches[0];
    setTouchGhostPos({ x: touch.clientX, y: touch.clientY });
  }

  function buildSuggestedSplit() {
    const next: Record<JarKey, number> = { ...zeroDraft };
    let assigned = 0;

    jars.forEach((jar, index) => {
      if (index === jars.length - 1) {
        next[jar.key] = Math.max(availableCents - assigned, 0);
        return;
      }
      const target = targets[jar.key] ?? 0;
      const amount = Math.floor((availableCents * target) / 100);
      assigned += amount;
      next[jar.key] = amount;
    });

    return next;
  }

  function applySuggestedSplit() {
    if (availableCents <= 0) return;
    const next = buildSuggestedSplit();
    setDraft(next);
  }

  function buildAllocationFormData(allocations: Record<JarKey, number>) {
    const formData = new FormData();
    formData.set("childId", childId);
    formData.set("spend", (allocations.spend / 100).toFixed(2));
    formData.set("save", (allocations.save / 100).toFixed(2));
    formData.set("give", (allocations.give / 100).toFixed(2));
    formData.set("grow", (allocations.grow / 100).toFixed(2));
    return formData;
  }

  function humanizeError(message: string) {
    const normalized = message.toLowerCase();
    if (normalized.includes("exceed") || normalized.includes("more coins")) {
      return mode === "little" ? "Oops, that is more coins than you have." : "That split is above your available amount.";
    }
    if (normalized.includes("unlock") || normalized.includes("session")) {
      return mode === "little" ? "Please open your profile first with your PIN." : "Unlock this profile first, then try again.";
    }
    if (normalized.includes("not enabled")) {
      return mode === "little" ? "That jar is not open for this profile yet." : "That jar is disabled for this child profile.";
    }
    return mode === "little" ? "Hmm, let us try that again." : "Something did not save. Please try again.";
  }

  async function processSubmission(allocations: Record<JarKey, number>) {
    setFeedback(null);
    setRewardSummary(null);

    const sortedCents = allocations.spend + allocations.save + allocations.give + allocations.grow;
    if (sortedCents <= 0) {
      setFeedback(mode === "little" ? "Tap + or use Magic Sort to move some coins." : "Add at least one amount before sorting.");
      return;
    }
    const streakAfter = sortedThisWeek ? streak : streak + 1;
    const projectedBalances = {
      spend: (currentBalances.spend ?? 0) + allocations.spend,
      save: (currentBalances.save ?? 0) + allocations.save,
      give: (currentBalances.give ?? 0) + allocations.give,
      grow: (currentBalances.grow ?? 0) + allocations.grow
    };

    const closestBefore = getClosestBadge(currentBadges, currency, {
      spend: currentBalances.spend ?? 0,
      save: currentBalances.save ?? 0,
      give: currentBalances.give ?? 0,
      grow: currentBalances.grow ?? 0,
      total: (currentBalances.spend ?? 0) + (currentBalances.save ?? 0) + (currentBalances.give ?? 0) + (currentBalances.grow ?? 0),
      lifetime: totalAllocatedCents,
      streak
    });

    const projectedBadges = computeBadges(projectedBalances, totalAllocatedCents + sortedCents, streakAfter, mode);
    const closestAfter = getClosestBadge(projectedBadges, currency, {
      spend: projectedBalances.spend,
      save: projectedBalances.save,
      give: projectedBalances.give,
      grow: projectedBalances.grow,
      total: projectedBalances.spend + projectedBalances.save + projectedBalances.give + projectedBalances.grow,
      lifetime: totalAllocatedCents + sortedCents,
      streak: streakAfter
    });

    const badgeSummary = !closestAfter
      ? "All badges unlocked. Amazing work."
      : closestBefore && closestBefore.badge.id === closestAfter.badge.id
        ? (() => {
            const beforePercent = Math.round(closestBefore.progress.percent);
            const afterPercent = Math.round(closestAfter.progress.percent);
            if (afterPercent <= beforePercent) {
              return `${closestAfter.badge.emoji} ${closestAfter.badge.label}: still ${afterPercent}%. Keep going.`;
            }
            return `${closestAfter.badge.emoji} ${closestAfter.badge.label}: ${beforePercent}% -> ${afterPercent}%`;
          })()
        : `New focus: ${closestAfter.badge.emoji} ${closestAfter.badge.label} at ${Math.round(closestAfter.progress.percent)}%`;

    const questSummaries = activeQuests
      .slice(0, 2)
      .map((quest) => {
        const before = computeQuestProgress(quest, {
          save: currentBalances.save ?? 0,
          give: currentBalances.give ?? 0,
          streak,
          currency
        });
        const after = computeQuestProgress(quest, {
          save: projectedBalances.save,
          give: projectedBalances.give,
          streak: streakAfter,
          currency
        });
        if (after.complete && !before.complete) {
          return `${quest.title}: completed! Reward unlocked.`;
        }
        const delta = Math.max(0, Math.round(after.progressPercent - before.progressPercent));
        if (delta === 0) {
          return `${quest.title}: progress held. Keep sorting to move this quest.`;
        }
        return `${quest.title}: +${delta}% progress`;
      });

    const result = await allocateFundsAction(buildAllocationFormData(allocations));
    if ("error" in result) {
      setFeedback(humanizeError(result.error));
      return;
    }
    setDraft(zeroDraft);
    setCelebrating(true);
    playSuccessChime();
    setTimeout(() => playBadgeUnlock(), 600);
    setFeedback(mode === "little" ? "Awesome sorting!" : "Great allocation. Nicely done.");
    setRewardSummary({
      sortedCents,
      streakDelta: sortedThisWeek ? 0 : 1,
      badgeSummary,
      questSummaries
    });
    setTimeout(() => setCelebrating(false), 1400);
  }

  async function handleSubmit(_formData: FormData) {
    await processSubmission({ ...draft });
  }

  async function handleMagicSort() {
    if (availableCents <= 0 || magicSorting) {
      return;
    }
    setMagicSorting(true);
    const next = buildSuggestedSplit();
    setDraft(next);
    await processSubmission(next);
    setMagicSorting(false);
  }

  useEffect(() => {
    if (touchDragCoin === null) return;

    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      const touch = e.touches[0];
      setTouchGhostPos({ x: touch.clientX, y: touch.clientY });
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const jarEl = el?.closest("[data-jar-key]") as HTMLElement | null;
      setDropTargetJar(jarEl ? (jarEl.dataset.jarKey as JarKey) : null);
    }

    function onTouchEnd(e: TouchEvent) {
      const coinValue = touchDragCoinRef.current;
      touchDragCoinRef.current = null;
      setTouchDragCoin(null);
      setTouchGhostPos(null);
      setDropTargetJar(null);
      if (coinValue == null) return;
      const touch = e.changedTouches[0];
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const jarEl = el?.closest("[data-jar-key]") as HTMLElement | null;
      if (!jarEl) return;
      const jarKey = jarEl.dataset.jarKey as JarKey;
      const jarRect = jarEl.getBoundingClientRect();
      triggerCoinAnimation(coinValue, touch.clientX, touch.clientY, jarKey, jarRect);
      nudgeRef.current(jarKey, coinValue);
    }

    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);
    return () => {
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [touchDragCoin]);

  return (
    <section className="panel panel--warm" id={sectionId}>
      {touchGhostPos != null && touchDragCoin != null ? (
        <div
          className="touch-drag-ghost"
          aria-hidden="true"
          style={{ left: `${touchGhostPos.x}px`, top: `${touchGhostPos.y}px` } as React.CSSProperties}
        >
          {formatCurrency(touchDragCoin, currency)}
        </div>
      ) : null}
      {flyingCoins.length > 0 ? (
        <div className="flying-coins-layer" aria-hidden="true">
          {flyingCoins.map((coin) => (
            <span
              key={coin.id}
              className="flying-coin"
              style={{
                left: `${coin.startX}px`,
                top: `${coin.startY}px`,
                "--coin-dx": `${coin.dx}px`,
                "--coin-dy": `${coin.dy}px`
              } as React.CSSProperties}
            >
              {coin.label}
            </span>
          ))}
        </div>
      ) : null}
      {jarImpacts.length > 0 ? (
        <div className="jar-impacts-layer" aria-hidden="true">
          {jarImpacts.map((impact) => (
            <span
              key={impact.id}
              className={`jar-impact-spark jar-impact-spark--${impact.jar}`}
              style={{
                left: `${impact.x}px`,
                top: `${impact.y}px`
              } as React.CSSProperties}
            />
          ))}
        </div>
      ) : null}
      {celebrating ? (
        <div className="coin-drop-burst" aria-hidden="true">
          <span /><span /><span /><span />
          <span /><span /><span /><span />
        </div>
      ) : null}
      {celebrating && mode === "little" ? (
        <div className="celebration-ribbon" aria-live="polite">🎉 Jar Power Unlocked! 🎉</div>
      ) : null}

      <div className="section-heading">
        <div>
          <span className="eyebrow">{tone.sortTitle}</span>
          <h2>{tone.sortHint}</h2>
        </div>
        <strong>{formatCurrency(availableCents, currency)} to sort</strong>
      </div>

      {availableCents === 0 ? (
        <p className="empty-state">{mode === "little" ? "All sorted! Come back when you get more coins." : "Nothing to sort right now. Check back after your next allowance."}</p>
      ) : (
      <>
      <div className="allocation-actions-row">
        {mode !== "little" ? (
          <button className="secondary-button" onClick={applySuggestedSplit} type="button">
            {tone.autoFill}
          </button>
        ) : null}
        {mode === "little" ? (
          <button className="primary-button magic-sort-button" onClick={handleMagicSort} type="button" disabled={magicSorting}>
            {magicSorting ? "Magic sorting..." : "✨ Magic Sort"}
          </button>
        ) : null}
      </div>

      {mode === "little" ? (
        <section className="coin-tray" aria-label="Drag coins into jars">
          <p>Drag coins into the jars:</p>
          <div className="coin-tray__row">
            {coinTray.map((coin) => (
              <button
                key={coin}
                className="coin-token"
                draggable
                onDragStart={(event) => handleCoinDragStart(event, coin)}
                onTouchStart={(event) => handleCoinTouchStart(event, coin)}
                onClick={() => setFeedback("Drag a coin onto a jar, or tap Magic Sort.")}
                type="button"
                aria-label={`Coin ${formatCurrency(coin, currency)}`}
              >
                {formatCurrency(coin, currency)}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <form action={handleSubmit} className="allocation-form">
        <input name="childId" type="hidden" value={childId} />
        <div className="jar-grid">
          {jars.map((jar) => {
            const cents = draft[jar.key] || 0;
            const totalInJar = jar.currentBalance + cents;
            // Show fill as proportion of a reasonable max (current balance + available)
            const visualMax = Math.max(jar.currentBalance + availableCents, 1);
            const fillPercent = (totalInJar / visualMax) * 100;

            return (
              <div
                className={`jar-input${mode === "little" ? " jar-input--little" : ""}${dropTargetJar === jar.key ? " jar-input--drop" : ""}`}
                data-jar-key={jar.key}
                key={jar.key}
                onDragOver={(event) => event.preventDefault()}
                onDragEnter={() => setDropTargetJar(jar.key)}
                onDragLeave={() => setDropTargetJar((current) => (current === jar.key ? null : current))}
                onDrop={(event) => handleJarDrop(event, jar.key)}
              >
                <input type="hidden" name={jar.key} value={(cents / 100).toFixed(2)} />
                <div className="jar-input__header">
                  <JarVisual jarKey={jar.key} fillPercent={fillPercent} size={mode === "little" ? 120 : 80} bouncing={bouncingJar === jar.key} />
                  <span className="jar-input__label">{jar.label}</span>
                  <small>{mode === "little" ? "Drop coins here" : jar.hint}</small>
                </div>
                <span className="jar-input__balance">
                  {mode === "little" ? `${formatCurrency(jar.currentBalance, currency)} in jar` : `${formatCurrency(jar.currentBalance, currency)} now`}
                </span>
                <div className="coin-stepper">
                  <button
                    className="coin-stepper__btn coin-stepper__btn--minus"
                    onClick={() => nudge(jar.key, -step)}
                    type="button"
                    aria-label={`Remove ${(step / 100).toFixed(2)} from ${jar.label}`}
                  >
                    −
                  </button>
                  <span className="coin-stepper__value">
                    {formatCurrency(cents, currency)}
                  </span>
                  <button
                    className="coin-stepper__btn coin-stepper__btn--plus"
                    onClick={() => nudge(jar.key, step)}
                    type="button"
                    aria-label={`Add ${(step / 100).toFixed(2)} to ${jar.label}`}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="allocation-footer">
          <p>
            {remaining >= 0
              ? `${formatCurrency(remaining, currency)} ${tone.leftoverLabel}`
              : `${tone.overLabel} ${formatCurrency(Math.abs(remaining), currency)}`}
          </p>
          <SubmitButton label={tone.cta} />
        </div>
        {feedback ? <p className="kid-feedback">{feedback}</p> : null}
        {rewardSummary ? (
          <article className="reward-summary" aria-live="polite">
            <header>
              <strong>{mode === "little" ? "Level up summary" : "Sorting summary"}</strong>
              <span>+{formatCurrency(rewardSummary.sortedCents, currency)} sorted</span>
            </header>
            <p>
              {rewardSummary.streakDelta > 0
                ? `Streak boosted: +${rewardSummary.streakDelta} ${rewardSummary.streakDelta === 1 ? "week" : "weeks"}`
                : "Streak held strong this week"}
            </p>
            <p>{rewardSummary.badgeSummary}</p>
            <ul>
              {(rewardSummary.questSummaries.length > 0
                ? rewardSummary.questSummaries
                : [mode === "little" ? "No quests yet. Ask your parent to add one!" : "No active quests yet. Ask your parent to set one."]
              ).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ) : null}
      </form>
      </>
      )}
    </section>
  );
}
