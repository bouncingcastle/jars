"use client";

import { useCallback, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { allocateFundsAction } from "@/app/actions";
import { getKidTone } from "@/lib/kid-copy";
import { formatCurrency } from "@/lib/money";
import { playCoinClink, playSuccessChime, playBadgeUnlock } from "@/lib/sounds";
import { JarVisual } from "@/components/jar-visual";
import { ChildMode, JarKey } from "@/lib/types";

interface AllocationBoardProps {
  childId: string;
  availableCents: number;
  currency: string;
  mode: ChildMode;
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

export function AllocationBoard({ childId, availableCents, currency, mode, jars, targets }: AllocationBoardProps) {
  const tone = getKidTone(mode);
  const [draft, setDraft] = useState(zeroDraft);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [bouncingJar, setBouncingJar] = useState<JarKey | null>(null);

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

  function applySuggestedSplit() {
    if (availableCents <= 0) return;

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

    setDraft(next);
  }

  function humanizeError(message: string) {
    if (message.includes("exceeds available")) {
      return mode === "little" ? "Oops, that is more coins than you have." : "That split is above your available amount.";
    }
    if (message.includes("unlock")) {
      return mode === "little" ? "Please open your profile first with your PIN." : "Unlock this profile first, then try again.";
    }
    return mode === "little" ? "Hmm, let us try that again." : "Something did not save. Please try again.";
  }

  async function handleSubmit(formData: FormData) {
    setFeedback(null);
    const result = await allocateFundsAction(formData);
    if ("error" in result) {
      setFeedback(humanizeError(result.error));
      return;
    }
    setDraft(zeroDraft);
    setCelebrating(true);
    playSuccessChime();
    setTimeout(() => playBadgeUnlock(), 600);
    setFeedback(mode === "little" ? "Awesome sorting!" : "Great allocation. Nicely done.");
    setTimeout(() => setCelebrating(false), 1400);
  }

  return (
    <section className="panel panel--warm">
      {celebrating ? (
        <div className="coin-drop-burst" aria-hidden="true">
          <span /><span /><span /><span />
          <span /><span /><span /><span />
        </div>
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
      <button className="secondary-button" onClick={applySuggestedSplit} type="button">
        {tone.autoFill}
      </button>

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
              <div className="jar-input" key={jar.key}>
                <input type="hidden" name={jar.key} value={(cents / 100).toFixed(2)} />
                <div className="jar-input__header">
                  <JarVisual jarKey={jar.key} fillPercent={fillPercent} size={80} bouncing={bouncingJar === jar.key} />
                  <span className="jar-input__label">{jar.label}</span>
                  <small>{jar.hint}</small>
                </div>
                <span className="jar-input__balance">
                  {formatCurrency(jar.currentBalance, currency)} now
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
      </form>
      </>
      )}
    </section>
  );
}
