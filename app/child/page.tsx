import Link from "next/link";
import { ChildPicker } from "@/components/child-picker";
import { getHouseholdSnapshot } from "@/lib/store";

export default async function ChildIndexPage() {
  const household = await getHouseholdSnapshot();

  return (
    <main className="screen-shell">
      <header className="screen-shell__header">
        <Link href="/" className="back-link">
          Home
        </Link>
        <div>
          <span className="eyebrow">Kids zone</span>
          <h1>Pick your jar adventure</h1>
        </div>
      </header>
      {household.children.length > 0 ? (
        <ChildPicker children={household.children} currency={household.currency} />
      ) : (
        <section className="panel" style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
          <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🫙</p>
          <p style={{ color: "#6b7a84" }}>No profiles yet. Ask a parent to add you!</p>
          <Link href="/admin" className="secondary-button" style={{ marginTop: "1rem", display: "inline-block" }}>
            Go to parent setup
          </Link>
        </section>
      )}
    </main>
  );
}
