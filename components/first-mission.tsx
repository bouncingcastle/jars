import { ChildMode } from "@/lib/types";

interface FirstMissionProps {
  mode: ChildMode;
  hasStarted: boolean;
}

export function FirstMission({ mode, hasStarted }: FirstMissionProps) {
  if (hasStarted) {
    return null;
  }

  return (
    <section className="panel mission-card">
      <span className="eyebrow">First mission</span>
      <h2>{mode === "little" ? "Let us sort your first coins" : "Start your first jar cycle"}</h2>
      <ol>
        <li>{mode === "little" ? "Put some money in Spend — it's yours to enjoy!" : "Put a little in Spend for things you want now."}</li>
        <li>{mode === "little" ? "Fill up Save to reach your goal." : "Move a good chunk to Save — get closer to your goal."}</li>
        <li>{mode === "little" ? "Add a little to Give — helping feels great!" : "Set aside some Give to practise generosity."}</li>
      </ol>
    </section>
  );
}
