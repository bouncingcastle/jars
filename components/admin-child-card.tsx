"use client";

import { useActionState } from "react";
import { archiveQuestAction, createQuestAction, deleteChildAction, saveChildProfileAction } from "@/app/actions";
import type { ActionResult } from "@/app/actions";
import { JAR_SPLIT_PRESETS } from "@/lib/jar-splits";
import type { ChildSnapshot, Quest } from "@/lib/types";
import { THEMES } from "@/lib/themes";
import { formatCurrency } from "@/lib/money";

interface AdminChildCardProps {
  child: ChildSnapshot;
  currency: string;
  quests: Quest[];
}

export function AdminChildCard({ child, currency, quests }: AdminChildCardProps) {
  const [saveState, saveAction, savePending] = useActionState<ActionResult | null, FormData>(saveChildProfileAction, null);
  const [deleteState, deleteAction, deletePending] = useActionState<ActionResult | null, FormData>(deleteChildAction, null);
  const [questState, questAction, questPending] = useActionState<ActionResult | null, FormData>(createQuestAction, null);
  const [archiveState, archiveAction, archivePending] = useActionState<ActionResult | null, FormData>(archiveQuestAction, null);

  const split = child.profile.jarTargets;
  const splitTotal = split.spend + split.save + split.give + split.grow;
  const selectedPreset = child.profile.jarSplitPreset ?? "custom";

  return (
    <article className="panel admin-child-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Profile</span>
          <h2>{child.profile.name}</h2>
        </div>
        <strong>{formatCurrency(child.availableCents, currency)} unallocated</strong>
      </div>
      <form action={saveAction} className="stack-form">
        <input type="hidden" name="id" value={child.profile.id} />
        <label>
          Name
          <input defaultValue={child.profile.name} name="name" required />
        </label>
        <label>
          Set new PIN (optional)
          <input inputMode="numeric" maxLength={6} minLength={4} name="pin" placeholder="Leave blank to keep current PIN" />
        </label>
        <label>
          Pocket money
          <input defaultValue={(child.profile.allowanceCents / 100).toFixed(2)} inputMode="decimal" name="allowance" required />
        </label>
        <label>
          Kid mode
          <select defaultValue={child.profile.mode} name="mode">
            <option value="little">Little Kids (ages 5-8)</option>
            <option value="big">Big Kids (ages 9+)</option>
          </select>
        </label>
        <label>
          Goal name
          <input defaultValue={child.profile.goalName} name="goalName" required />
        </label>
        <label>
          Goal amount
          <input defaultValue={(child.profile.goalAmountCents / 100).toFixed(2)} inputMode="decimal" name="goalAmount" required />
        </label>
        <label>
          Schedule
          <select defaultValue={child.profile.schedule} name="schedule">
            <option value="weekly">Weekly</option>
            <option value="fortnightly">Fortnightly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
        <label>
          Start date
          <input defaultValue={child.profile.scheduleAnchor.slice(0, 10)} name="scheduleAnchor" type="date" required />
        </label>
        <label className="checkbox-row">
          <input defaultChecked={child.profile.investingEnabled} name="investingEnabled" type="checkbox" />
          Grow jar enabled
        </label>
        <fieldset className="split-fieldset">
          <legend>Jar split</legend>
          <label>
            Preset
            <select defaultValue={selectedPreset} name="splitPreset">
              {JAR_SPLIT_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label} - {preset.description}
                </option>
              ))}
            </select>
          </label>
          <div className="split-grid">
            <label>
              Spend %
              <input defaultValue={split.spend} inputMode="numeric" min={0} max={100} name="targetSpend" type="number" required />
            </label>
            <label>
              Save %
              <input defaultValue={split.save} inputMode="numeric" min={0} max={100} name="targetSave" type="number" required />
            </label>
            <label>
              Give %
              <input defaultValue={split.give} inputMode="numeric" min={0} max={100} name="targetGive" type="number" required />
            </label>
            <label>
              Grow %
              <input defaultValue={split.grow} inputMode="numeric" min={0} max={100} name="targetGrow" type="number" required />
            </label>
          </div>
          <small className="split-hint">Current total: {splitTotal}% (custom must be exactly 100%)</small>
        </fieldset>
        <label>
          Theme
          <select defaultValue={child.profile.theme ?? "default"} name="theme">
            {THEMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.emoji} {t.label} — {t.description}
              </option>
            ))}
          </select>
        </label>
        <button className="secondary-button" type="submit" disabled={savePending}>
          {savePending ? "Saving…" : "Save profile"}
        </button>
        {saveState && "error" in saveState && <p className="form-error">{saveState.error}</p>}
        {saveState && "success" in saveState && <p className="form-success">Saved.</p>}
      </form>

      <section className="stack-form" style={{ marginTop: "1rem" }}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Quests</span>
            <h3>Quest manager</h3>
          </div>
        </div>
        <div className="quest-admin-list">
          {quests.length === 0 ? <p className="empty-state">No active quests yet.</p> : null}
          {quests.map((quest) => (
            <div className="quest-admin-item" key={quest.id}>
              <div>
                <strong>{quest.title}</strong>
                <small>{quest.reward}</small>
              </div>
              <form action={archiveAction}>
                <input type="hidden" name="questId" value={quest.id} />
                <input type="hidden" name="childId" value={child.profile.id} />
                <button className="secondary-button" type="submit" disabled={archivePending}>Archive</button>
              </form>
            </div>
          ))}
        </div>
        <form action={questAction} className="stack-form">
          <input type="hidden" name="childId" value={child.profile.id} />
        <label>
          Quest title
          <input name="title" placeholder="Save for a scooter helmet" required />
        </label>
        <label>
          Quest type
          <select name="type" defaultValue="save_balance">
            <option value="save_balance">Save jar amount</option>
            <option value="give_balance">Give jar amount</option>
            <option value="streak_weeks">Sorting streak (weeks)</option>
          </select>
        </label>
        <label>
          Target
          <input name="target" placeholder="20.00 or 4" required />
        </label>
        <label>
          Reward text
          <input name="reward" placeholder="Movie night pick" required />
        </label>
        <button className="secondary-button" type="submit" disabled={questPending}>
          {questPending ? "Adding quest..." : "Add quest"}
        </button>
        </form>
        {questState && "error" in questState && <p className="form-error">{questState.error}</p>}
        {questState && "success" in questState && <p className="form-success">Quest added.</p>}
        {archiveState && "error" in archiveState && <p className="form-error">{archiveState.error}</p>}
      </section>

      <form action={deleteAction} className="stack-form" style={{ marginTop: "1rem" }}>
        <input type="hidden" name="childId" value={child.profile.id} />
        <button
          className="danger-button"
          type="submit"
          disabled={deletePending}
          onClick={(e) => {
            if (!confirm(`Remove ${child.profile.name}? This deletes all their data.`)) {
              e.preventDefault();
            }
          }}
        >
          {deletePending ? "Removing…" : `Remove ${child.profile.name}`}
        </button>
        {deleteState && "error" in deleteState && <p className="form-error">{deleteState.error}</p>}
      </form>
    </article>
  );
}
