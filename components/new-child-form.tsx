"use client";

import { useActionState } from "react";
import { saveChildProfileAction } from "@/app/actions";
import type { ActionResult } from "@/app/actions";
export function NewChildForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(saveChildProfileAction, null);

  return (
    <form action={action} className="stack-form">
      <label>
        Name
        <input name="name" placeholder="Mia" required />
      </label>
      <label>
        PIN
        <input inputMode="numeric" minLength={4} maxLength={6} name="pin" pattern="[0-9]{4,6}" placeholder="1234" required />
      </label>
      <label>
        Pocket money
        <input inputMode="decimal" name="allowance" placeholder="10.00" required />
      </label>
      <label>
        Kid mode
        <select name="mode" defaultValue="big">
          <option value="little">Little Kids (ages 5-8)</option>
          <option value="big">Big Kids (ages 9+)</option>
        </select>
      </label>
      <label>
        Goal name
        <input name="goalName" placeholder="Blue scooter" required />
      </label>
      <label>
        Goal amount
        <input inputMode="decimal" name="goalAmount" placeholder="80.00" required />
      </label>
      <label>
        Schedule
        <select name="schedule">
          <option value="weekly">Weekly</option>
          <option value="fortnightly">Fortnightly</option>
          <option value="monthly">Monthly</option>
        </select>
      </label>
      <label>
        Start date
        <input defaultValue={new Date().toISOString().slice(0, 10)} name="scheduleAnchor" type="date" required />
      </label>
      <label className="checkbox-row">
        <input name="investingEnabled" type="checkbox" />
        Enable the Grow jar
      </label>
      <button className="primary-button" type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create child"}
      </button>
      {state && "error" in state && <p className="form-error">{state.error}</p>}
      {state && "success" in state && <p className="form-success">Child created!</p>}
    </form>
  );
}
