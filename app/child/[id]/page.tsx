import { notFound } from "next/navigation";
import { childLockAction, childUnlockAction, parentLoginAction } from "@/app/actions";
import { AllocationBoard } from "@/components/allocation-board";
import { ChildShell } from "@/components/child-shell";
import { FirstMission } from "@/components/first-mission";
import { GoalStoryCard } from "@/components/goal-story-card";
import { HistoryChart } from "@/components/history-chart";
import { JarAdventure } from "@/components/jar-adventure";
import { JarOverview } from "@/components/jar-overview";
import { LockScreen } from "@/components/lock-screen";
import { RecentActivity } from "@/components/recent-activity";
import { SortingStreak } from "@/components/sorting-streak";
import { StatCard } from "@/components/stat-card";
import Link from "next/link";
import { getKidTone } from "@/lib/kid-copy";
import { computeBadges, computeStreak } from "@/lib/badges";
import { hasChildSession, hasParentSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/money";
import { getChildPageData, getChildProfile, getJarList } from "@/lib/store";

function getJarCopy(mode: "little" | "big") {
  if (mode === "little") {
    return {
      spend: { label: "Spend", hint: "Fun for right now" },
      save: { label: "Save", hint: "For your goal" },
      give: { label: "Give", hint: "To help others" },
      grow: { label: "Grow", hint: "Watch it get bigger" }
    };
  }

  return {
    spend: { label: "Spend", hint: "For near-term choices" },
    save: { label: "Save", hint: "For your goal" },
    give: { label: "Give", hint: "For generosity" },
    grow: { label: "Grow", hint: "For long-term growth" }
  };
}

export default async function ChildDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [isParent, isChildUnlocked] = await Promise.all([hasParentSession(), hasChildSession(id)]);

  if (!isParent && !isChildUnlocked) {
    const child = await getChildProfile(id);
    if (!child) {
      notFound();
    }

    const tone = getKidTone(child.mode);

    return (
      <main className={`screen-shell kid-mode-${child.mode}`}>
        <header className="screen-shell__header">
          <Link className="back-link" href="/child">
            Back
          </Link>
          <div>
            <span className="eyebrow">Child view</span>
            <h1>{child.name}&rsquo;s jars</h1>
          </div>
        </header>

        <LockScreen
          title={tone.lockTitle}
          subtitle={tone.lockSubtitle}
        >
          <form action={childUnlockAction} className="stack-form">
            <input name="childId" type="hidden" value={id} />
            <label>
              Child PIN
              <input inputMode="numeric" maxLength={6} minLength={4} name="pin" pattern="[0-9]{4,6}" required />
            </label>
            <button className="primary-button" type="submit">{tone.lockButton}</button>
          </form>
          <form action={parentLoginAction} className="stack-form">
            <input type="hidden" name="next" value={`/child/${id}`} />
            <label>
              Parent password
              <input name="password" type="password" minLength={8} autoComplete="current-password" required />
            </label>
            <button className="secondary-button" type="submit">Enter as parent</button>
          </form>
        </LockScreen>
      </main>
    );
  }

  const payload = await getChildPageData(id);

  if (!payload) {
    notFound();
  }

  const { snapshot, household, entries } = payload;
  const tone = getKidTone(snapshot.profile.mode);
  const goalBalance = snapshot.jarBalances.save;

  // Compute streak and badges from full ledger
  const streak = computeStreak(entries);
  const badges = computeBadges(
    snapshot.jarBalances,
    snapshot.lifetimeAllocatedCents,
    streak,
    snapshot.profile.mode
  );

  const jarCopy = getJarCopy(snapshot.profile.mode);
  const jars = getJarList(snapshot.profile).map((key) => ({
    key,
    label: jarCopy[key].label,
    hint: jarCopy[key].hint,
    currentBalance: snapshot.jarBalances[key]
  }));

  return (
    <main className={`kid-page kid-mode-${snapshot.profile.mode}`}>
      <ChildShell
        profile={snapshot.profile}
        controls={
          <form action={childLockAction}>
            <input name="childId" type="hidden" value={id} />
            <button className="secondary-button" type="submit">Lock profile</button>
          </form>
        }
      >
        <section className="stats-grid">
          <StatCard label={tone.leftoverLabel} value={formatCurrency(snapshot.availableCents, household.currency)} tone="sun" />
          <StatCard label="This month" value={formatCurrency(snapshot.monthlyInflowCents, household.currency)} tone="mint" />
          <StatCard label="All-time sorted" value={formatCurrency(snapshot.lifetimeAllocatedCents, household.currency)} tone="coral" />
        </section>
        <JarOverview
          jars={jars}
          availableCents={snapshot.availableCents}
          currency={household.currency}
          investingEnabled={snapshot.profile.investingEnabled}
        />
        <FirstMission mode={snapshot.profile.mode} hasStarted={snapshot.lifetimeAllocatedCents > 0} />
        <GoalStoryCard
          mode={snapshot.profile.mode}
          goalName={snapshot.profile.goalName}
          goalAmountCents={snapshot.profile.goalAmountCents}
          currentCents={goalBalance}
          currency={household.currency}
        />
        <AllocationBoard
          childId={snapshot.profile.id}
          availableCents={snapshot.availableCents}
          currency={household.currency}
          mode={snapshot.profile.mode}
          jars={jars}
          targets={snapshot.profile.jarTargets}
        />
        <JarAdventure
          currency={household.currency}
          mode={snapshot.profile.mode}
          totalAllocatedCents={snapshot.lifetimeAllocatedCents}
          targets={snapshot.profile.jarTargets}
          balances={snapshot.jarBalances}
          investingEnabled={snapshot.profile.investingEnabled}
          badges={badges}
        />
        <SortingStreak streak={streak} mode={snapshot.profile.mode} />
        <HistoryChart history={snapshot.history} currency={household.currency} mode={snapshot.profile.mode} />
        <RecentActivity entries={entries} currency={household.currency} mode={snapshot.profile.mode} />
      </ChildShell>
    </main>
  );
}
