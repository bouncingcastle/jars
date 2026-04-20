import { useId } from "react";
import { JarKey } from "@/lib/types";

interface JarVisualProps {
  jarKey: JarKey;
  /** 0–100 fill percentage */
  fillPercent: number;
  /** Dollar amount to display */
  label?: string;
  size?: number;
  /** True when the jar just received coins — triggers a bounce */
  bouncing?: boolean;
}

const jarColors: Record<JarKey, { fill: string; lid: string; glow: string }> = {
  spend: { fill: "#ec6b3b", lid: "#d45a2e", glow: "rgba(236, 107, 59, 0.35)" },
  save: { fill: "#f4b942", lid: "#d9a235", glow: "rgba(244, 185, 66, 0.35)" },
  give: { fill: "#ef8f7a", lid: "#d97a66", glow: "rgba(239, 143, 122, 0.35)" },
  grow: { fill: "#00796b", lid: "#005a50", glow: "rgba(0, 121, 107, 0.35)" },
};

const jarEmoji: Record<JarKey, string> = {
  spend: "🎈",
  save: "🏖",
  give: "💛",
  grow: "🌱",
};

const emptyMessages: Record<JarKey, string> = {
  spend: "Ready to fill!",
  save: "Start saving!",
  give: "Share the love!",
  grow: "Plant a seed!",
};

export function JarVisual({ jarKey, fillPercent, label, size = 120, bouncing }: JarVisualProps) {
  const colors = jarColors[jarKey];
  const fill = Math.max(0, Math.min(100, fillPercent));
  const isEmpty = fill < 1;

  // Jar body: y=35 to y=92 (57 units). Fill rises from bottom via CSS custom property.
  const bodyTop = 35;
  const bodyBottom = 92;
  const bodyHeight = bodyBottom - bodyTop;
  const fillHeight = (bodyHeight * fill) / 100;
  const fillY = bodyBottom - fillHeight;

  // Unique IDs per instance to avoid SVG def collisions
  const uid = useId().replace(/:/g, "");

  return (
    <div
      className={`jar-visual${bouncing ? " jar-visual--bounce" : ""}${isEmpty ? " jar-visual--empty" : ""}`}
      style={{ width: size, height: size + 24, "--jar-fill": `${fill}%` } as React.CSSProperties}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} aria-label={`${jarKey} jar, ${Math.round(fill)}% full`} role="img">
        <defs>
          <clipPath id={`jb-${uid}`}>
            <rect x="18" y={bodyTop} width="64" height={bodyHeight} rx="12" ry="12" />
          </clipPath>
          <linearGradient id={`jf-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.fill} stopOpacity="0.92" />
            <stop offset="100%" stopColor={colors.fill} stopOpacity="0.6" />
          </linearGradient>
          <filter id={`jg-${uid}`}>
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={colors.glow} floodOpacity="1" />
          </filter>
        </defs>

        {/* Glass body */}
        <rect x="18" y={bodyTop} width="64" height={bodyHeight} rx="12" ry="12" fill="rgba(255,255,255,0.45)" stroke="rgba(30,41,48,0.1)" strokeWidth="1.5" filter={`url(#jg-${uid})`} />

        {/* Liquid — uses inline style for smooth CSS transition */}
        <g clipPath={`url(#jb-${uid})`}>
          <rect x="18" y={fillY} width="64" height={fillHeight + 1} fill={`url(#jf-${uid})`} style={{ transition: "y 400ms ease, height 400ms ease" }} />
          {fill > 2 && fill < 98 && (
            <ellipse cx="50" cy={fillY} rx="32" ry="3" fill={colors.fill} opacity="0.45" className="jar-visual__wave" />
          )}
          {/* Coins */}
          {fill > 8 && (
            <>
              <circle cx="35" cy={bodyBottom - 8} r="4.5" fill="rgba(255,255,255,0.25)" />
              <circle cx="55" cy={bodyBottom - 12} r="3.5" fill="rgba(255,255,255,0.2)" />
              <circle cx="45" cy={bodyBottom - 5} r="3" fill="rgba(255,255,255,0.18)" />
            </>
          )}
          {fill > 35 && (
            <>
              <circle cx="62" cy={fillY + fillHeight * 0.4} r="3" fill="rgba(255,255,255,0.2)" />
              <circle cx="30" cy={fillY + fillHeight * 0.55} r="3.5" fill="rgba(255,255,255,0.15)" />
            </>
          )}
          {fill > 65 && (
            <circle cx="50" cy={fillY + fillHeight * 0.25} r="4" fill="rgba(255,255,255,0.12)" />
          )}
        </g>

        {/* Glass highlight */}
        <rect x="24" y={bodyTop + 4} width="6" height="20" rx="3" fill="rgba(255,255,255,0.35)" />

        {/* Lid */}
        <rect x="14" y="24" width="72" height="14" rx="7" fill={colors.lid} />
        <rect x="20" y="27" width="30" height="4" rx="2" fill="rgba(255,255,255,0.25)" />
      </svg>
      <span className="jar-visual__emoji">{jarEmoji[jarKey]}</span>
      {isEmpty && <span className="jar-visual__empty-msg">{emptyMessages[jarKey]}</span>}
      {label && <span className="jar-visual__label">{label}</span>}
    </div>
  );
}
