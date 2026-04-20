import type { ReactNode } from "react";
import Link from "next/link";
import { ChildProfile } from "@/lib/types";
import { getKidTone } from "@/lib/kid-copy";

interface ChildShellProps {
  children: ReactNode;
  profile: ChildProfile;
  controls?: ReactNode;
}

export function ChildShell({ children, profile, controls }: ChildShellProps) {
  const tone = getKidTone(profile.mode);
  return (
    <div className={`screen-shell kid-mode-${profile.mode}`}>
      <header className="screen-shell__header">
        <Link href="/child" className="back-link">
          Back
        </Link>
        <div>
          <span className="eyebrow">{tone.title}</span>
          <h1>{profile.name}&rsquo;s jars</h1>
          <p className="child-shell__subtitle">{tone.subtitle}</p>
        </div>
        {controls}
      </header>
      {children}
    </div>
  );
}
