import Link from "next/link";
import { ReactNode } from "react";

interface RoleCardProps {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  icon: ReactNode;
}

export function RoleCard({ href, eyebrow, title, description, accent, icon }: RoleCardProps) {
  return (
    <Link className="role-card" href={href}>
      <span className="role-card__eyebrow">{eyebrow}</span>
      <div className="role-card__header">
        <span className="role-card__icon" style={{ background: accent }}>
          {icon}
        </span>
        <h2>{title}</h2>
      </div>
      <p>{description}</p>
      <span className="role-card__link">Open</span>
    </Link>
  );
}
