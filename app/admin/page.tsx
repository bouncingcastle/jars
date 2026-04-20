import Link from "next/link";
import { AdminChildCard } from "@/components/admin-child-card";
import { FamilyPromptCard } from "@/components/family-prompt-card";
import { LockScreen } from "@/components/lock-screen";
import { ManualTopupForm } from "@/components/manual-topup-form";
import { NewChildForm } from "@/components/new-child-form";
import { ParentLoginForm } from "@/components/parent-login-form";
import { StatCard } from "@/components/stat-card";
import { parentLogoutAction } from "@/app/actions";
import { hasParentSession } from "@/lib/auth";
import { getHouseholdSnapshot } from "@/lib/store";
import { formatCurrency } from "@/lib/money";

export default async function AdminPage() {
  const isParent = await hasParentSession();
  if (!isParent) {
    return (
      <main className="screen-shell">
        <header className="screen-shell__header">
          <Link href="/" className="back-link">
            Home
          </Link>
          <div>
            <span className="eyebrow">Parent view</span>
            <h1>Household controls</h1>
          </div>
        </header>

        <LockScreen title="Parent login required" subtitle="Use your household password to manage allowances and profiles.">
          <ParentLoginForm />
        </LockScreen>
      </main>
    );
  }

  const household = await getHouseholdSnapshot();

  return (
    <main className="screen-shell">
      <header className="screen-shell__header">
        <Link href="/" className="back-link">
          Home
        </Link>
        <div>
          <span className="eyebrow">Parent view</span>
          <h1>Household controls</h1>
        </div>
        <div className="header-actions">
          <a className="secondary-button" href="/api/backup">Download backup</a>
          <form action={parentLogoutAction}>
            <button className="secondary-button" type="submit">Leave parent mode</button>
          </form>
        </div>
      </header>

      <section className="stats-grid">
        <StatCard label="Children" value={String(household.children.length)} tone="sun" />
        <StatCard label="Ready to sort" value={formatCurrency(household.totalUnallocatedCents, household.currency)} tone="mint" />
        <StatCard label="Protected jars" value={formatCurrency(household.totalSavedCents, household.currency)} tone="coral" />
      </section>

      <FamilyPromptCard />

      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">New child</span>
            <h2>Add a profile</h2>
          </div>
        </div>
        <NewChildForm />
      </section>

      <ManualTopupForm children={household.children} />

      <section className="admin-grid">
        {household.children.map((child) => (
          <AdminChildCard child={child} currency={household.currency} key={child.profile.id} />
        ))}
      </section>
    </main>
  );
}
