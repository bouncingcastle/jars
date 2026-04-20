"use client";

import { useActionState } from "react";
import { childUnlockAction, parentLoginAction, ActionResult } from "@/app/actions";
import { KidTone } from "@/lib/kid-copy";

interface ChildUnlockFormProps {
  childId: string;
  tone: KidTone;
}

export function ChildUnlockForm({ childId, tone }: ChildUnlockFormProps) {
  const [pinState, pinAction, pinPending] = useActionState<ActionResult | null, FormData>(childUnlockAction, null);
  const [parentState, parentAction, parentPending] = useActionState<ActionResult | null, FormData>(parentLoginAction, null);

  return (
    <>
      <form action={pinAction} className="stack-form">
        <input name="childId" type="hidden" value={childId} />
        <label>
          Child PIN
          <input inputMode="numeric" maxLength={6} minLength={4} name="pin" pattern="[0-9]{4,6}" required />
        </label>
        <button className="primary-button" type="submit" disabled={pinPending}>
          {pinPending ? "Checking…" : tone.lockButton}
        </button>
        {pinState && "error" in pinState && <p className="form-error">{pinState.error}</p>}
      </form>
      <form action={parentAction} className="stack-form">
        <input type="hidden" name="next" value={`/child/${childId}`} />
        <label>
          Parent password
          <input name="password" type="password" minLength={8} autoComplete="current-password" required />
        </label>
        <button className="secondary-button" type="submit" disabled={parentPending}>
          {parentPending ? "Checking…" : "Enter as parent"}
        </button>
        {parentState && "error" in parentState && <p className="form-error">{parentState.error}</p>}
      </form>
    </>
  );
}
