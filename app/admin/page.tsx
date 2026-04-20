import Link from "next/link";
import { AdminChildCard } from "@/components/admin-child-card";
import { FamilyPromptCard } from "@/components/family-prompt-card";
import { LockScreen } from "@/components/lock-screen";
import { ManualTopupForm } from "@/components/manual-topup-form";
import { StatCard } from "@/components/stat-card";
import { parentLoginAction, parentLogoutAction, saveChildProfileAction } from "@/app/actions";
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
          <form action={parentLoginAction} className="stack-form">
            <input type="hidden" name="next" value="/admin" />
            <label>
              Password
              <input name="password" type="password" autoComplete="current-password" minLength={8} required />
            </label>
            <button className="primary-button" type="submit">Enter parent mode</button>
          </form>
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
        <form action={saveChildProfileAction} className="stack-form">
          <label>
            Name
            <input name="name" placeholder="Mia" required />
          </label>
          <label>
            PIN
            <input inputMode="numeric" minLength={4} maxLength={6} name="pin" pattern="[0-9]{4,6}" placeholder="1234" required />
          </label>
          <label>
            Pocket money
            <input inputMode="decimal" name="allowance" placeholder="10.00" required />
          </label>
          <label>
            Kid mode
            <select name="mode" defaultValue="big">
              <option value="little">Little Kids (ages 5-8)</option>
              <option value="big">Big Kids (ages 9+)</option>
            </select>
          </label>
          <label>
            Goal name
            <input name="goalName" placeholder="Blue scooter" required />
          </label>
          <label>
            Goal amount
            <input inputMode="decimal" name="goalAmount" placeholder="80.00" required />
          </label>
          <label>
            Schedule
            <select name="schedule">
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          <label>
            Start date
            <input defaultValue={new Date().toISOString().slice(0, 10)} name="scheduleAnchor" type="date" required />
          </label>
          <label className="checkbox-row">
            <input name="investingEnabled" type="checkbox" />
            Enable the Grow jar
          </label>
          <button className="primary-button" type="submit">Create child</button>
        </form>
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
