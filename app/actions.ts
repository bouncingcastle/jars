"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  addManualAllowance,
  allocateFunds,
  deleteChild,
  getChildProfile,
  upsertChildProfile,
  verifyChildPin
} from "@/lib/store";
import { parseCurrencyInput } from "@/lib/money";
import { ChildMode, ScheduleType } from "@/lib/types";
import { isValidTheme } from "@/lib/themes";
import {
  clearChildSession,
  clearParentSession,
  createChildSession,
  createParentSession,
  hasChildSession,
  hasParentSession,
  verifyParentPassword
} from "@/lib/auth";

export type ActionResult = { error: string } | { success: true };

function safeRevalidate(paths: string[]) {
  for (const path of paths) {
    try {
      revalidatePath(path);
    } catch (error) {
      console.error("[actions] revalidatePath failed", { path, error });
    }
  }
}

async function requireParentSession(): Promise<string | null> {
  const isParent = await hasParentSession();
  if (!isParent) {
    return "Parent session expired. Please log in again.";
  }
  return null;
}

export async function saveChildProfileAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const authError = await requireParentSession();
  if (authError) return { error: authError };

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
  const rawTheme = String(formData.get("theme") || "default");
  const theme = isValidTheme(rawTheme) ? rawTheme : "default";

  if (!name) return { error: "Name is required." };
  if (pin && !/^\d{4,6}$/.test(pin)) return { error: "PIN must be 4 to 6 digits." };
  if (!id && !pin) return { error: "PIN is required for new children." };
  if (!goalName) return { error: "Goal name is required." };
  if (goalAmountCents < 100) return { error: "Goal amount must be at least $1.00." };
  if (mode !== "little" && mode !== "big") return { error: "Invalid kid mode." };

  try {
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
      goalAmountCents,
      theme
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save profile. Please try again.";
    return { error: message };
  }

  safeRevalidate(["/", "/admin", "/child"]);
  return { success: true };
}

export async function deleteChildAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const authError = await requireParentSession();
  if (authError) return { error: authError };

  const childId = String(formData.get("childId") || "").trim();
  if (!childId) return { error: "No child selected." };

  try {
    await deleteChild(childId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete. Please try again.";
    return { error: message };
  }

  safeRevalidate(["/", "/admin", "/child"]);
  return { success: true };
}

export async function addManualAllowanceAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const authError = await requireParentSession();
  if (authError) return { error: authError };

  const childId = String(formData.get("childId") || "");
  const amount = parseCurrencyInput(String(formData.get("amount") || "0"));
  const note = String(formData.get("note") || "Bonus pocket money");

  if (!childId || amount <= 0) return { error: "Child and a valid amount are required." };

  try {
    await addManualAllowance(childId, amount, note);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add allowance. Please try again.";
    return { error: message };
  }

  safeRevalidate(["/", "/admin", `/child/${childId}`]);
  return { success: true };
}

export async function allocateFundsAction(formData: FormData): Promise<ActionResult> {
  const childId = String(formData.get("childId") || "");
  const spend = parseCurrencyInput(String(formData.get("spend") || "0"));
  const save = parseCurrencyInput(String(formData.get("save") || "0"));
  const give = parseCurrencyInput(String(formData.get("give") || "0"));
  const grow = parseCurrencyInput(String(formData.get("grow") || "0"));

  if (!childId) return { error: "Child is required." };
  if ([spend, save, give, grow].some((amount) => amount < 0)) return { error: "Amounts cannot be negative." };

  const isParent = await hasParentSession();
  const isChild = await hasChildSession(childId);
  if (!isParent && !isChild) return { error: "Please unlock this child profile first." };

  try {
    await allocateFunds(childId, { spend, save, give, grow });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not sort funds. Please try again.";
    return { error: message };
  }

  safeRevalidate(["/", "/child", `/child/${childId}`, "/admin"]);
  return { success: true };
}

export async function parentLoginAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const password = String(formData.get("password") || "");

  if (!verifyParentPassword(password)) {
    return { error: "Incorrect password." };
  }

  await createParentSession();
  const next = String(formData.get("next") || "/admin");
  const safeNext = next.startsWith("/") ? next : "/admin";
  redirect(safeNext as "/admin");
}

export async function parentLogoutAction() {
  await clearParentSession();
  redirect("/");
}

export async function childUnlockAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const childId = String(formData.get("childId") || "");
  const pin = String(formData.get("pin") || "").trim();

  if (!/^\d{4,6}$/.test(pin)) return { error: "PIN must be 4 to 6 digits." };

  const child = await getChildProfile(childId);
  if (!child) return { error: "Child not found." };

  const isParent = await hasParentSession();
  if (!isParent) {
    const valid = await verifyChildPin(childId, pin);
    if (!valid) return { error: "Incorrect PIN. Try again." };
  }

  await createChildSession(childId);
  safeRevalidate([`/child/${childId}`]);
  return { success: true };
}

export async function childLockAction(formData: FormData) {
  try {
    const childId = String(formData.get("childId") || "");
    if (!childId) return;
    await clearChildSession(childId);
    safeRevalidate([`/child/${childId}`]);
  } catch (error) {
    console.error("[actions] childLockAction failed", error);
  }
}
