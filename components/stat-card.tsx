interface StatCardProps {
  label: string;
  value: string;
  tone?: "sun" | "mint" | "coral";
}

export function StatCard({ label, value, tone = "sun" }: StatCardProps) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
