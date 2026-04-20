import { ChildMode } from "@/lib/types";

export interface KidTone {
  title: string;
  subtitle: string;
  cta: string;
  sortTitle: string;
  sortHint: string;
  autoFill: string;
  chartTitle: string;
  activityTitle: string;
  lockTitle: string;
  lockSubtitle: string;
  lockButton: string;
  leftoverLabel: string;
  overLabel: string;
}

export function getKidTone(mode: ChildMode): KidTone {
  if (mode === "little") {
    return {
      title: "Money mission",
      subtitle: "Pick a jar and grow your treasure",
      cta: "Sort my coins",
      sortTitle: "Tap to sort your coins",
      sortHint: "Every coin gets a home",
      autoFill: "Magic split",
      chartTitle: "My jar story",
      activityTitle: "What I did",
      lockTitle: "Your secret PIN",
      lockSubtitle: "Type your PIN to open your money mission.",
      lockButton: "Open my jars",
      leftoverLabel: "left to place",
      overLabel: "too much"
    };
  }

  return {
    title: "Jar dashboard",
    subtitle: "Build strong money habits",
    cta: "Sort funds",
    sortTitle: "Allocate your money",
    sortHint: "Give every dollar a purpose",
    autoFill: "Suggested split",
    chartTitle: "Monthly progress",
    activityTitle: "Recent actions",
    lockTitle: "Unlock profile",
    lockSubtitle: "Enter your PIN to open your jar dashboard.",
    lockButton: "Unlock profile",
    leftoverLabel: "left unsorted",
    overLabel: "over"
  };
}
