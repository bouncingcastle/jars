import type { JarKey, JarSplitPreset } from "@/lib/types";

export const JAR_SPLIT_PRESETS: Array<{ id: JarSplitPreset; label: string; description: string }> = [
  { id: "classic", label: "Classic", description: "Spend-first with steady saving" },
  { id: "saver", label: "Saver", description: "More into Save for faster goals" },
  { id: "giver", label: "Generous", description: "Higher Give for kindness goals" },
  { id: "growth", label: "Future Focus", description: "Strong Grow + Save split" },
  { id: "custom", label: "Custom", description: "Set your own percentages" }
];

const PRESET_TARGETS: Record<Exclude<JarSplitPreset, "custom">, Record<JarKey, number>> = {
  classic: { spend: 60, save: 30, give: 10, grow: 0 },
  saver: { spend: 35, save: 45, give: 20, grow: 0 },
  giver: { spend: 40, save: 30, give: 30, grow: 0 },
  growth: { spend: 30, save: 35, give: 10, grow: 25 }
};

export function isValidSplitPreset(value: string): value is JarSplitPreset {
  return ["classic", "saver", "giver", "growth", "custom"].includes(value);
}

export function getPresetTargets(preset: JarSplitPreset, investingEnabled: boolean): Record<JarKey, number> {
  const safePreset = preset === "custom" ? "classic" : preset;
  const target = structuredClone(PRESET_TARGETS[safePreset]);
  if (!investingEnabled) {
    target.save += target.grow;
    target.grow = 0;
  }
  return target;
}

export function normalizeCustomTargets(
  input: Partial<Record<JarKey, number>>,
  investingEnabled: boolean
): Record<JarKey, number> | null {
  const spend = Math.max(0, Math.floor(input.spend ?? 0));
  const save = Math.max(0, Math.floor(input.save ?? 0));
  const give = Math.max(0, Math.floor(input.give ?? 0));
  const grow = investingEnabled ? Math.max(0, Math.floor(input.grow ?? 0)) : 0;
  const total = spend + save + give + grow;

  if (total !== 100) {
    return null;
  }

  return { spend, save, give, grow };
}
