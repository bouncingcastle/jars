# Features Roadmap: World-Class Child Experience

## Vision
Build a child experience that feels like a delightful game world while preserving financial learning.

Every session should answer three questions in under 5 seconds:
1. What should I do now?
2. How close am I?
3. What happens next if I keep going?

## Product Principles
- Clarity before complexity: one primary action per screen section.
- Celebrate progress, not perfection: reward effort loops (streaks, near-wins, micro-completions).
- Touch-first always: large tap targets, low friction, gesture-friendly interactions.
- Emotional continuity: recurring themes, stories, and identity cues make children return.
- Fast feedback: visible response within 300ms for taps and 1s for major actions.

## Success Metrics
- Time to first meaningful action (open child page -> first coin interaction) < 20 seconds.
- Session completion rate (started sorting -> successful submit) > 75%.
- Weekly return rate per child +20% from current baseline.
- Quest completion rate > 60% per active week.
- Child confusion events (lock/session/jar-disabled failures) reduced week over week.

## Build Plan

### Phase 1: Mission-Centered Home (Now)
Goal: make the child page immediately actionable.

Scope:
- Add a mission strip near the top with:
  - Primary mission (sort today / come back for payday)
  - Nearest badge progress snapshot
  - Next payday countdown
  - One clear CTA to start sorting
- Keep visual density low: compact cards, no additional forms.

Acceptance criteria:
- Child can identify next action without scrolling.
- CTA always visible above fold on mobile and tablet.
- Mission strip updates from live data (available amount, streak/badge progress, payday date).

### Phase 2: Reward Summary Loop
Goal: make successful sorting feel meaningful.

Scope:
- Post-sort summary panel:
  - Amount sorted this turn
  - Streak impact
  - Badge progress delta
  - Quest progress delta
- Add stronger visual/audio confirmation for successful submit.

Acceptance criteria:
- Every successful sort ends with a concise, celebratory summary.
- Summary disappears gracefully and returns child to next mission state.

### Phase 3: Quest System Depth
Goal: quests feel collectible and motivating, not just fields.

Scope:
- Quest categories: micro (daily), weekly, epic.
- Quest lifecycle: active -> complete -> claimed.
- Trophy shelf seed UI for completed quests.

Acceptance criteria:
- Completed quests visibly move to a separate trophy area.
- Children can distinguish in-progress vs completed vs claimed at a glance.

### Phase 4: Story + Seasonal Layer
Goal: emotional stickiness through narrative progression.

Scope:
- Introduce seasonal worlds and themed quest arcs.
- Weekly chapter unlocks tied to consistency.
- Theme-linked visuals across mission strip, badges, and quests.

Acceptance criteria:
- Child sees current world/season on every visit.
- Weekly progress feels like chapter progression, not isolated tasks.

### Phase 5: Performance + Delight Polish
Goal: premium feel on touch devices.

Scope:
- Touch ergonomics polish (hit area audits, haptics where supported).
- Motion tuning for reduced jank.
- Optional quiet mode for sound effects.

Acceptance criteria:
- Smooth interactions across common iPad/mobile breakpoints.
- No visual crowding regression in child pages.

## Implementation Notes
- Preserve server-first rendering and current JSON store model for v1 speed.
- Keep components composable so mission/reward logic can be reused across phases.
- Prefer additive progression; avoid replacing working mechanics until replacement is validated.

## Immediate Next Task (Phase 1)
Implement the mission strip and wire it into the child dashboard using existing badge and payday data.
