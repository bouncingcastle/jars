import { addManualAllowanceAction } from "@/app/actions";
import { ChildSnapshot } from "@/lib/types";

interface ManualTopupFormProps {
  children: ChildSnapshot[];
}

export function ManualTopupForm({ children }: ManualTopupFormProps) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Manual entry</span>
          <h2>Add bonus pocket money</h2>
        </div>
      </div>
      <form action={addManualAllowanceAction} className="stack-form">
        <label>
          Child
          <select name="childId" required>
            {children.map((child) => (
              <option key={child.profile.id} value={child.profile.id}>
                {child.profile.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Amount
          <input inputMode="decimal" name="amount" placeholder="5.00" required />
        </label>
        <label>
          Note
          <input name="note" placeholder="Helping with chores" />
        </label>
        <button className="primary-button" type="submit">Add top-up</button>
      </form>
    </section>
  );
}
