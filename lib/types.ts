export type JarKey = "spend" | "save" | "give" | "grow";
export type ScheduleType = "weekly" | "fortnightly" | "monthly";
export type EntryType = "scheduled_allowance" | "manual_allowance" | "allocation";
export type ChildMode = "little" | "big";

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
