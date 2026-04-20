import Link from "next/link";
import { ChildSnapshot } from "@/lib/types";
import { formatCurrency } from "@/lib/money";
import { getKidTone } from "@/lib/kid-copy";
import { JarVisual } from "@/components/jar-visual";
import { getJarList } from "@/lib/store";

interface ChildPickerProps {
  children: ChildSnapshot[];
  currency: string;
}

export function ChildPicker({ children, currency }: ChildPickerProps) {
  return (
    <div className="child-picker">
      {children.map((child) => {
        const tone = getKidTone(child.profile.mode);
        const jars = getJarList(child.profile);
        const maxBalance = Math.max(1, ...jars.map((j) => child.jarBalances[j] ?? 0));
        return (
          <Link key={child.profile.id} href={`/child/${child.profile.id}`} className="child-picker__card">
            <div className="child-picker__avatar">{child.profile.name.slice(0, 1).toUpperCase()}</div>
            <span className="eyebrow">{child.profile.mode === "little" ? "Little kids" : "Big kids"}</span>
            <h2>{child.profile.name}</h2>
            <div className="child-picker__jars">
              {jars.map((jar) => (
                <JarVisual
                  key={jar}
                  jarKey={jar}
                  fillPercent={Math.round(((child.jarBalances[jar] ?? 0) / maxBalance) * 100)}
                  size={32}
                />
              ))}
            </div>
            <p>{formatCurrency(child.availableCents, currency)} {tone.leftoverLabel}</p>
          </Link>
        );
      })}
    </div>
  );
}
