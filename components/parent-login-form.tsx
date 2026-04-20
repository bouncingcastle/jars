"use client";

import { useActionState } from "react";
import { parentLoginAction } from "@/app/actions";
import type { ActionResult } from "@/app/actions";

export function ParentLoginForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(parentLoginAction, null);

  return (
    <form action={action} className="stack-form">
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" minLength={8} required />
      </label>
      <button className="primary-button" type="submit" disabled={pending}>
        {pending ? "Logging in…" : "Enter parent mode"}
      </button>
      {state && "error" in state && <p className="form-error">{state.error}</p>}
    </form>
  );
}
