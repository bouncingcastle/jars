import type { ThemeId } from "@/lib/types";

export interface ThemeMeta {
  id: ThemeId;
  label: string;
  emoji: string;
  description: string;
}

export const THEMES: ThemeMeta[] = [
  {
    id: "default",
    label: "Classic",
    emoji: "🟢",
    description: "Warm cream with teal accents"
  },
  {
    id: "peppa",
    label: "Peppa Pink",
    emoji: "🐷",
    description: "Bubblegum pink with hot-pink accents"
  },
  {
    id: "ocean",
    label: "Ocean",
    emoji: "🌊",
    description: "Sky blue with aqua highlights"
  },
  {
    id: "sunshine",
    label: "Sunshine",
    emoji: "☀️",
    description: "Golden yellow with amber warmth"
  }
];

export const THEME_IDS = THEMES.map((t) => t.id);

export function isValidTheme(value: string): value is ThemeId {
  return (THEME_IDS as string[]).includes(value);
}
