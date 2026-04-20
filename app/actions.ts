"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  addManualAllowance,
  allocateFunds,
  getChildProfile,
  upsertChildProfile,
  verifyChildPin
} from "@/lib/store";
import { parseCurrencyInput } from "@/lib/money";
import { ChildMode, ScheduleType } from "@/lib/types";
import {
  clearChildSession,
  clearParentSession,
  createChildSession,
  createParentSession,
  hasChildSession,
  hasParentSession,
  verifyParentPassword
} from "@/lib/auth";

async function requireParentSession() {
  const isParent = await hasParentSession();
  if (!isParent) {
    throw new Error("Parent authentication is required");
  }
}

export async function saveChildProfileAction(formData: FormData) {
  await requireParentSession();

  const name = String(formData.get("name") || "").trim();
  const pin = String(formData.get("pin") || "").trim();
  const allowance = String(formData.get("allowance") || "0");
  const schedule = String(formData.get("schedule") || "weekly") as ScheduleType;
  const scheduleAnchor = String(formData.get("scheduleAnchor") || new Date().toISOString().slice(0, 10));
  const investingEnabled = formData.get("investingEnabled") === "on";
  const mode = String(formData.get("mode") || "big") as ChildMode;
  const goalName = String(formData.get("goalName") || "Big goal").trim();
  const goalAmountCents = parseCurrencyInput(String(formData.get("goalAmount") || "0"));
  const id = String(formData.get("id") || "").trim();

  if (!name) {
    throw new Error("Name is required");
  }

  if (pin && !/^\d{4,6}$/.test(pin)) {
    throw new Error("PIN must be 4 to 6 digits");
  }

  if (!id && !pin) {
    throw new Error("PIN is required for new children");
  }

  if (!goalName) {
    throw new Error("Goal name is required");
  }

  if (goalAmountCents < 100) {
    throw new Error("Goal amount must be at least 1.00");
  }

  if (mode !== "little" && mode !== "big") {
    throw new Error("Invalid kid mode");
  }

  await upsertChildProfile({
    id: id || undefined,
    name,
    pin: pin || undefined,
    allowanceCents: parseCurrencyInput(allowance),
    schedule,
    scheduleAnchor,
    investingEnabled,
    mode,
    goalName,
    goalAmountCents
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/child");
}

export async function addManualAllowanceAction(formData: FormData) {
  await requireParentSession();

  const childId = String(formData.get("childId") || "");
  const amount = parseCurrencyInput(String(formData.get("amount") || "0"));
  const note = String(formData.get("note") || "Bonus pocket money");

  if (!childId || amount <= 0) {
    throw new Error("Child and amount are required");
  }

  await addManualAllowance(childId, amount, note);
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/child/${childId}`);
}

export async function allocateFundsAction(formData: FormData) {
  const childId = String(formData.get("childId") || "");
  const spend = parseCurrencyInput(String(formData.get("spend") || "0"));
  const save = parseCurrencyInput(String(formData.get("save") || "0"));
  const give = parseCurrencyInput(String(formData.get("give") || "0"));
  const grow = parseCurrencyInput(String(formData.get("grow") || "0"));

  if (!childId) {
    throw new Error("Child is required");
  }

  if ([spend, save, give, grow].some((amount) => amount < 0)) {
    throw new Error("Amounts cannot be negative");
  }

  const isParent = await hasParentSession();
  const isChild = await hasChildSession(childId);
  if (!isParent && !isChild) {
    throw new Error("Please unlock this child profile first");
  }

  await allocateFunds(childId, { spend, save, give, grow });
  revalidatePath("/");
  revalidatePath("/child");
  revalidatePath(`/child/${childId}`);
  revalidatePath("/admin");
}

export async function parentLoginAction(formData: FormData) {
  const password = String(formData.get("password") || "");
  const nextPath = String(formData.get("next") || "/admin");

  if (!verifyParentPassword(password)) {
    throw new Error("Incorrect parent password");
  }

  await createParentSession();
  redirect(nextPath.startsWith("/") ? nextPath : "/admin");
}

export async function parentLogoutAction() {
  await clearParentSession();
  redirect("/");
}

export async function childUnlockAction(formData: FormData) {
  const childId = String(formData.get("childId") || "");
  const pin = String(formData.get("pin") || "").trim();

  if (!/^\d{4,6}$/.test(pin)) {
    throw new Error("PIN must be 4 to 6 digits");
  }

  const child = await getChildProfile(childId);
  if (!child) {
    throw new Error("Child not found");
  }

  const isParent = await hasParentSession();
  if (!isParent) {
    const valid = await verifyChildPin(childId, pin);
    if (!valid) {
      throw new Error("Incorrect PIN");
    }
  }

  await createChildSession(childId);
  revalidatePath(`/child/${childId}`);
}

export async function childLockAction(formData: FormData) {
  const childId = String(formData.get("childId") || "");
  if (!childId) {
    return;
  }
  await clearChildSession(childId);
  revalidatePath(`/child/${childId}`);
}
