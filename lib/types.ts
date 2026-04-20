export type JarKey = "spend" | "save" | "give" | "grow";
export type ScheduleType = "weekly" | "fortnightly" | "monthly";
export type EntryType = "scheduled_allowance" | "manual_allowance" | "allocation";
export type ChildMode = "little" | "big";
export type ThemeId = "default" | "peppa" | "ocean" | "sunshine";
export type JarSplitPreset = "classic" | "saver" | "giver" | "growth" | "custom";
export type QuestType = "save_balance" | "give_balance" | "streak_weeks";

export interface Quest {
  id: string;
  childId: string;
  title: string;
  type: QuestType;
  targetValue: number;
  reward: string;
  archived: boolean;
  createdAt: string;
}

export interface QuestProgress extends Quest {
  progressValue: number;
  progressPercent: number;
  complete: boolean;
  progressLabel: string;
}

export interface ChildProfile {
  id: string;
  name: string;
  pinHash: string;
  pin?: string;
  investingEnabled: boolean;
  mode: ChildMode;
  goalName: string;
  goalAmountCents: number;
  allowanceCents: number;
  schedule: ScheduleType;
  scheduleAnchor: string;
  jarTargets: Record<JarKey, number>;
  jarSplitPreset?: JarSplitPreset;
  theme: ThemeId;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  childId: string;
  type: EntryType;
  amountCents: number;
  jar?: JarKey;
  createdAt: string;
  note?: string;
}

export interface HouseholdStore {
  currency: string;
  children: ChildProfile[];
  ledger: LedgerEntry[];
  quests: Quest[];
}

export interface ChildSnapshot {
  profile: ChildProfile;
  availableCents: number;
  jarBalances: Record<JarKey, number>;
  lifetimeAllocatedCents: number;
  monthlyInflowCents: number;
  monthlyAllocationCents: number;
  history: Array<{
    month: string;
    inflowCents: number;
    allocatedCents: number;
  }>;
}
