import type { ReactNode } from "react";

interface LockScreenProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function LockScreen({ title, subtitle, children }: LockScreenProps) {
  return (
    <section className="panel lock-screen">
      <div className="lock-screen__copy">
        <span className="eyebrow">Protected</span>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {children}
    </section>
  );
}
