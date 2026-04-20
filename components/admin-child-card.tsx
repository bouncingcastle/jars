import { saveChildProfileAction } from "@/app/actions";
import { ChildSnapshot } from "@/lib/types";
import { formatCurrency } from "@/lib/money";

interface AdminChildCardProps {
  child: ChildSnapshot;
  currency: string;
}

export function AdminChildCard({ child, currency }: AdminChildCardProps) {
  return (
    <article className="panel admin-child-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Profile</span>
          <h2>{child.profile.name}</h2>
        </div>
        <strong>{formatCurrency(child.availableCents, currency)} unallocated</strong>
      </div>
      <form action={saveChildProfileAction} className="stack-form">
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
        <button className="secondary-button" type="submit">Save profile</button>
      </form>
    </article>
  );
}
