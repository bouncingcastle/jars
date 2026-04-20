import { PiggyBank, Shield } from "lucide-react";
import { RoleCard } from "@/components/role-card";
import { StatCard } from "@/components/stat-card";
import { JarVisual } from "@/components/jar-visual";
import { getHouseholdSnapshot } from "@/lib/store";
import { formatCurrency } from "@/lib/money";

export default async function HomePage() {
  const household = await getHouseholdSnapshot();

  return (
    <main className="home-page">
      <section className="hero">
        <div className="hero__copy">
          <span className="eyebrow">Barefoot-style pocket money</span>
          <h1>Teach every dollar where it belongs.</h1>
          <p>
            A private family app for splitting pocket money into Spend, Save, Give, and Grow jars — inspired by the
            Barefoot Investor for Families.
          </p>
        </div>
        <div className="hero-jars" aria-hidden="true">
          <JarVisual jarKey="spend" fillPercent={65} size={72} />
          <JarVisual jarKey="save" fillPercent={45} size={72} />
          <JarVisual jarKey="give" fillPercent={30} size={72} />
          <JarVisual jarKey="grow" fillPercent={20} size={72} />
        </div>
        <div className="hero__stats">
          <StatCard label="Children" value={String(household.children.length)} tone="sun" />
          <StatCard label="Ready to sort" value={formatCurrency(household.totalUnallocatedCents, household.currency)} tone="mint" />
          <StatCard label="Already protected" value={formatCurrency(household.totalSavedCents, household.currency)} tone="coral" />
        </div>
      </section>

      <section className="role-grid">
        <RoleCard
          href="/child"
          eyebrow="Child"
          title="Sort my money"
          description="Open a child profile, watch pocket money land, and move it into jars."
          accent="linear-gradient(135deg, #f4b942, #ec6b3b)"
          icon={<PiggyBank size={28} />}
        />
        <RoleCard
          href="/admin"
          eyebrow="Parent"
          title="Run the household"
          description="Manage each child, set schedules, add manual top-ups, and review progress."
          accent="linear-gradient(135deg, #00796b, #7ec8a5)"
          icon={<Shield size={28} />}
        />
      </section>
    </main>
  );
}
