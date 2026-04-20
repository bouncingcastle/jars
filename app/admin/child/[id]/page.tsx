import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminChildCard } from "@/components/admin-child-card";
import { ManualTopupForm } from "@/components/manual-topup-form";
import { StatCard } from "@/components/stat-card";
import { parentLogoutAction } from "@/app/actions";
import { hasParentSession } from "@/lib/auth";
import { getChildQuests, getChildSnapshot, getHouseholdSnapshot } from "@/lib/store";
import { formatCurrency } from "@/lib/money";

interface AdminChildDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminChildDetailPage({ params }: AdminChildDetailPageProps) {
  const isParent = await hasParentSession();
  if (!isParent) {
    redirect("/admin");
  }

  const { id } = await params;
  const [snapshot, household, quests] = await Promise.all([
    getChildSnapshot(id),
    getHouseholdSnapshot(),
    getChildQuests(id)
  ]);

  if (!snapshot) {
    notFound();
  }

  return (
    <main className="screen-shell admin-detail-shell">
      <header className="screen-shell__header">
        <Link href="/admin" className="back-link">
          Parent dashboard
        </Link>
        <div>
          <span className="eyebrow">Manage child</span>
          <h1>{snapshot.profile.name}</h1>
          <p className="child-shell__subtitle">Profile, rules, quests, and quick top-ups all in one focused place.</p>
        </div>
        <div className="header-actions">
          <Link className="secondary-button" href={`/child/${snapshot.profile.id}`}>
            Open child view
          </Link>
          <form action={parentLogoutAction}>
            <button className="secondary-button" type="submit">Leave parent mode</button>
          </form>
        </div>
      </header>

      <section className="stats-grid">
        <StatCard label="Ready to sort" value={formatCurrency(snapshot.availableCents, household.currency)} tone="sun" />
        <StatCard label="Active quests" value={String(quests.filter((quest) => !quest.archived).length)} tone="mint" />
        <StatCard label="Saved in jars" value={formatCurrency(snapshot.jarBalances.save + snapshot.jarBalances.give + snapshot.jarBalances.grow, household.currency)} tone="coral" />
      </section>

      <section className="admin-detail-grid">
        <div className="admin-detail-grid__main">
          <AdminChildCard child={snapshot} currency={household.currency} quests={quests.filter((quest) => !quest.archived)} />
        </div>
        <aside className="admin-detail-grid__side">
          <ManualTopupForm children={[snapshot]} />
          <section className="panel admin-rules-summary">
            <div className="section-heading">
              <div>
                <span className="eyebrow">At a glance</span>
                <h2>Current rules</h2>
              </div>
            </div>
            <div className="admin-rules-summary__list">
              <p>
                Theme
                <strong>{snapshot.profile.theme}</strong>
              </p>
              <p>
                Split preset
                <strong>{snapshot.profile.jarSplitPreset ?? "custom"}</strong>
              </p>
              <p>
                Pocket money
                <strong>{formatCurrency(snapshot.profile.allowanceCents, household.currency)}</strong>
              </p>
              <p>
                Schedule
                <strong>{snapshot.profile.schedule}</strong>
              </p>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
