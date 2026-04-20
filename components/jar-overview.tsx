import { JarVisual } from "@/components/jar-visual";
import { formatCurrency } from "@/lib/money";
import { JarKey } from "@/lib/types";

interface JarOverviewProps {
  jars: Array<{
    key: JarKey;
    label: string;
    currentBalance: number;
  }>;
  availableCents: number;
  currency: string;
  investingEnabled: boolean;
}

export function JarOverview({ jars, availableCents, currency }: JarOverviewProps) {
  // Calculate a reasonable max for fill visualisation
  const maxBalance = Math.max(...jars.map((j) => j.currentBalance), availableCents, 1);

  return (
    <section className="jar-overview" aria-label="Your jars">
      {jars.map((jar) => {
        const fillPercent = maxBalance > 0 ? (jar.currentBalance / maxBalance) * 100 : 0;
        return (
          <JarVisual
            key={jar.key}
            jarKey={jar.key}
            fillPercent={fillPercent}
            label={`${jar.label} ${formatCurrency(jar.currentBalance, currency)}`}
            size={90}
          />
        );
      })}
    </section>
  );
}
