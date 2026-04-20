import { getWeeklyPrompt } from "@/lib/family-prompts";

export function FamilyPromptCard() {
  const prompt = getWeeklyPrompt();

  const jarEmoji: Record<string, string> = {
    spend: "🎈",
    save: "🏖",
    give: "💛",
    grow: "🌱",
  };

  return (
    <section className="panel panel--warm family-prompt">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Weekly money chat</span>
          <h2>{prompt.title}</h2>
        </div>
        {prompt.jarFocus ? <span style={{ fontSize: "1.8rem" }}>{jarEmoji[prompt.jarFocus]}</span> : null}
      </div>
      <p className="family-prompt__text">{prompt.prompt}</p>
      <small className="family-prompt__tip">
        Tip: Keep it casual — at dinner, in the car, or while sorting jars together.
      </small>
    </section>
  );
}
