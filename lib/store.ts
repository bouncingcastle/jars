import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { defaultStore } from "@/lib/default-store";
import { hashPin, verifyPin } from "@/lib/pin";
import { ChildMode, ChildProfile, ChildSnapshot, HouseholdStore, JarKey, LedgerEntry, ScheduleType } from "@/lib/types";

const storePath = path.join(process.cwd(), "data", "store.json");
const enabledJars: JarKey[] = ["spend", "save", "give", "grow"];

async function ensureStore() {
  await mkdir(path.dirname(storePath), { recursive: true });
  try {
    await readFile(storePath, "utf8");
  } catch {
    await writeFile(storePath, JSON.stringify(defaultStore, null, 2), "utf8");
  }
}

export async function readStore() {
  await ensureStore();
  const raw = await readFile(storePath, "utf8");
  try {
    return JSON.parse(raw) as HouseholdStore;
  } catch {
    // Recover from corrupted JSON writes by preserving the broken file and resetting.
    const corruptPath = `${storePath}.corrupt-${Date.now()}.json`;
    try {
      await writeFile(corruptPath, raw, "utf8");
    } catch (error) {
      console.error("[store] failed to write corrupt backup", error);
    }
    const recovered = structuredClone(defaultStore) as HouseholdStore;
    try {
      await writeStore(recovered);
    } catch (error) {
      console.error("[store] failed to persist recovered store", error);
    }
    return recovered;
  }
}

async function writeStore(store: HouseholdStore) {
  const tmpPath = `${storePath}.tmp`;
  await writeFile(tmpPath, JSON.stringify(store, null, 2), "utf8");
  await rename(tmpPath, storePath);
}

function makeUniqueChildId(store: HouseholdStore, preferred: string) {
  const base = preferred || "child";
  let candidate = base;
  let suffix = 2;
  while (store.children.some((child) => child.id === candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

function addInterval(date: Date, schedule: ScheduleType) {
  const next = new Date(date);
  if (schedule === "weekly") {
    next.setDate(next.getDate() + 7);
    return next;
  }
  if (schedule === "fortnightly") {
    next.setDate(next.getDate() + 14);
    return next;
  }
  next.setMonth(next.getMonth() + 1);
  return next;
}

function makeId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export async function syncScheduledAllowances() {
  const store = await readStore();
  const now = new Date();
  let changed = false;

  for (const child of store.children) {
    if (!child.pinHash && child.pin) {
      child.pinHash = hashPin(child.pin);
      delete child.pin;
      changed = true;
    }
    if (!child.mode) {
      child.mode = "big";
      changed = true;
    }
    if (!child.goalName) {
      child.goalName = "Big goal";
      changed = true;
    }
    if (!child.goalAmountCents || child.goalAmountCents < 100) {
      child.goalAmountCents = 10000;
      changed = true;
    }
    // Migrate invest → grow in jar targets
    const targets = child.jarTargets as Record<string, number>;
    if ("invest" in targets && !("grow" in targets)) {
      targets.grow = targets.invest;
      delete targets.invest;
      changed = true;
    } else if (!("grow" in targets)) {
      targets.grow = 0;
      changed = true;
    }
  }

  // Migrate invest → grow in ledger entries
  for (const entry of store.ledger) {
    if ((entry.jar as string) === "invest") {
      (entry as { jar: string }).jar = "grow";
      changed = true;
    }
  }

  for (const child of store.children) {
    let cursor = new Date(child.scheduleAnchor);
    if (Number.isNaN(cursor.getTime())) {
      cursor = now;
    }

    while (cursor <= now) {
      const exists = store.ledger.some((entry) => {
        return entry.childId === child.id && entry.type === "scheduled_allowance" && entry.createdAt.slice(0, 10) === cursor.toISOString().slice(0, 10);
      });

      if (!exists) {
        store.ledger.push({
          id: makeId("sched"),
          childId: child.id,
          type: "scheduled_allowance",
          amountCents: child.allowanceCents,
          createdAt: cursor.toISOString(),
          note: `${child.schedule} pocket money`
        });
        changed = true;
      }

      cursor = addInterval(cursor, child.schedule);
    }
  }

  if (changed) {
    store.ledger.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
    try {
      await writeStore(store);
    } catch (error) {
      // Do not break page rendering if scheduled sync cannot be persisted.
      console.error("[store] syncScheduledAllowances write failed", error);
    }
  }

  return store;
}

function emptyBalances() {
  return {
    spend: 0,
    save: 0,
    give: 0,
    grow: 0
  };
}

export function buildChildSnapshot(store: HouseholdStore, childId: string) {
  const profile = store.children.find((child) => child.id === childId);
  if (!profile) {
    return null;
  }

  const entries = store.ledger.filter((entry) => entry.childId === childId);
  const jarBalances = emptyBalances();
  let inflow = 0;
  let allocated = 0;
  const byMonth = new Map<string, { inflowCents: number; allocatedCents: number }>();

  for (const entry of entries) {
    const month = entry.createdAt.slice(0, 7);
    const bucket = byMonth.get(month) ?? { inflowCents: 0, allocatedCents: 0 };
    if (entry.type === "allocation" && entry.jar) {
      jarBalances[entry.jar] += entry.amountCents;
      allocated += entry.amountCents;
      bucket.allocatedCents += entry.amountCents;
    } else {
      inflow += entry.amountCents;
      bucket.inflowCents += entry.amountCents;
    }
    byMonth.set(month, bucket);
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentTotals = byMonth.get(currentMonth) ?? { inflowCents: 0, allocatedCents: 0 };
  const history = Array.from(byMonth.entries())
    .sort((left, right) => left[0].localeCompare(right[0]))
    .slice(-6)
    .map(([month, totals]) => ({
      month,
      inflowCents: totals.inflowCents,
      allocatedCents: totals.allocatedCents
    }));

  return {
    profile,
    availableCents: inflow - allocated,
    jarBalances,
    lifetimeAllocatedCents: allocated,
    monthlyInflowCents: currentTotals.inflowCents,
    monthlyAllocationCents: currentTotals.allocatedCents,
    history
  } satisfies ChildSnapshot;
}

export async function getHouseholdSnapshot() {
  const store = await syncScheduledAllowances();
  const children = store.children
    .map((child) => buildChildSnapshot(store, child.id))
    .filter((snapshot): snapshot is ChildSnapshot => Boolean(snapshot));

  return {
    currency: store.currency,
    children,
    totalUnallocatedCents: children.reduce((sum, child) => sum + child.availableCents, 0),
    totalSavedCents: children.reduce((sum, child) => {
      return sum + child.jarBalances.save + child.jarBalances.give + child.jarBalances.grow;
    }, 0)
  };
}

export async function upsertChildProfile(input: {
  id?: string;
  name: string;
  pin?: string;
  allowanceCents: number;
  schedule: ScheduleType;
  scheduleAnchor: string;
  investingEnabled: boolean;
  mode: ChildMode;
  goalName: string;
  goalAmountCents: number;
}) {
  const store = await readStore();
  const normalizedId = input.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const childId = input.id || makeUniqueChildId(store, normalizedId);
  const existing = store.children.find((child) => child.id === childId);
  const jarTargets = input.investingEnabled
    ? { spend: 40, save: 30, give: 10, grow: 20 }
    : { spend: 60, save: 30, give: 10, grow: 0 };

  if (existing) {
    existing.name = input.name;
    if (input.pin) {
      existing.pinHash = hashPin(input.pin);
    }
    existing.allowanceCents = input.allowanceCents;
    existing.schedule = input.schedule;
    existing.scheduleAnchor = input.scheduleAnchor;
    existing.investingEnabled = input.investingEnabled;
    existing.mode = input.mode;
    existing.goalName = input.goalName;
    existing.goalAmountCents = input.goalAmountCents;
    existing.jarTargets = jarTargets;
  } else {
    if (!input.pin) {
      throw new Error("PIN is required for new children");
    }
    store.children.push({
      id: childId,
      name: input.name,
      pinHash: hashPin(input.pin),
      allowanceCents: input.allowanceCents,
      schedule: input.schedule,
      scheduleAnchor: input.scheduleAnchor,
      investingEnabled: input.investingEnabled,
      mode: input.mode,
      goalName: input.goalName,
      goalAmountCents: input.goalAmountCents,
      jarTargets,
      createdAt: new Date().toISOString()
    });
  }

  await writeStore(store);
}

export async function addManualAllowance(childId: string, amountCents: number, note: string) {
  const store = await readStore();
  const exists = store.children.some((child) => child.id === childId);
  if (!exists) {
    throw new Error("Child not found");
  }
  store.ledger.push({
    id: makeId("manual"),
    childId,
    type: "manual_allowance",
    amountCents,
    createdAt: new Date().toISOString(),
    note
  });
  await writeStore(store);
}

export async function deleteChild(childId: string) {
  const store = await readStore();
  const index = store.children.findIndex((child) => child.id === childId);
  if (index === -1) {
    throw new Error("Child not found");
  }
  store.children.splice(index, 1);
  store.ledger = store.ledger.filter((entry) => entry.childId !== childId);
  await writeStore(store);
}

export async function allocateFunds(childId: string, allocations: Partial<Record<JarKey, number>>) {
  const store = await readStore();
  const snapshot = buildChildSnapshot(store, childId);
  if (!snapshot) {
    throw new Error("Child not found");
  }

  const activeJars = getJarList(snapshot.profile);

  const total = enabledJars.reduce((sum, jar) => sum + (allocations[jar] ?? 0), 0);
  if (total > snapshot.availableCents) {
    throw new Error("Allocation exceeds available funds");
  }

  if (total < 0) {
    throw new Error("Allocation cannot be negative");
  }

  for (const jar of enabledJars) {
    const amount = allocations[jar] ?? 0;
    if (!amount) {
      continue;
    }
    if (!Number.isInteger(amount) || amount < 0) {
      throw new Error("Allocation amount is invalid");
    }
    if (!activeJars.includes(jar)) {
      throw new Error(`Jar ${jar} is not enabled for this child`);
    }
    store.ledger.push({
      id: makeId("alloc"),
      childId,
      type: "allocation",
      amountCents: amount,
      jar,
      createdAt: new Date().toISOString(),
      note: `Moved to ${jar}`
    });
  }

  await writeStore(store);
}

export async function getChildSnapshot(childId: string) {
  const store = await syncScheduledAllowances();
  return buildChildSnapshot(store, childId);
}

export async function getChildProfile(childId: string) {
  const store = await syncScheduledAllowances();
  return store.children.find((child) => child.id === childId) ?? null;
}

export async function verifyChildPin(childId: string, pin: string) {
  const child = await getChildProfile(childId);
  if (!child) {
    return false;
  }

  if (child.pinHash) {
    return verifyPin(pin, child.pinHash);
  }

  if (child.pin) {
    return child.pin === pin;
  }

  return false;
}

export async function getChildProfiles() {
  const store = await syncScheduledAllowances();
  return store.children;
}

export async function getRecentEntries(childId: string) {
  const store = await syncScheduledAllowances();
  return store.ledger
    .filter((entry) => entry.childId === childId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 12);
}

export async function getChildPageData(childId: string) {
  const store = await syncScheduledAllowances();
  const snapshot = buildChildSnapshot(store, childId);
  if (!snapshot) {
    return null;
  }

  const household = {
    currency: store.currency,
    children: store.children
      .map((child) => buildChildSnapshot(store, child.id))
      .filter((child): child is ChildSnapshot => Boolean(child)),
    totalUnallocatedCents: 0,
    totalSavedCents: 0
  };

  household.totalUnallocatedCents = household.children.reduce((sum, child) => sum + child.availableCents, 0);
  household.totalSavedCents = household.children.reduce((sum, child) => {
    return sum + child.jarBalances.save + child.jarBalances.give + child.jarBalances.grow;
  }, 0);

  const entries = store.ledger
    .filter((entry) => entry.childId === childId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 12);

  return {
    household,
    snapshot,
    entries
  };
}

export function isJarEnabled(profile: ChildProfile, jar: JarKey) {
  return jar !== "grow" || profile.investingEnabled;
}

export function getJarList(profile: ChildProfile) {
  return enabledJars.filter((jar) => isJarEnabled(profile, jar));
}

export function describeEntry(entry: LedgerEntry) {
  const jarLabels: Record<JarKey, string> = { spend: "Spend", save: "Save", give: "Give", grow: "Grow" };
  if (entry.type === "allocation" && entry.jar) {
    return `Sorted into ${jarLabels[entry.jar]}`;
  }
  if (entry.type === "scheduled_allowance") {
    return "Scheduled pocket money";
  }
  return entry.note || "Manual top-up";
}
