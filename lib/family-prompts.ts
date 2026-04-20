/**
 * Family money conversation prompts — inspired by the Barefoot
 * "Barefoot Date Night" philosophy of regular, casual money chats.
 *
 * Returns a rotating prompt based on the current week number so it
 * changes weekly but is deterministic (same prompt for all parents
 * in the same week).
 */

const prompts = [
  {
    title: "The Spend check-in",
    prompt: "Ask your child: 'What's the best thing you bought with your Spend jar this week?' Talk about whether it felt worth it.",
    jarFocus: "spend" as const,
  },
  {
    title: "The Save dream",
    prompt: "Ask your child: 'If your Save jar was full right now, what would it be for?' Let them dream big — then talk about the steps to get there.",
    jarFocus: "save" as const,
  },
  {
    title: "The Give heart",
    prompt: "Ask your child: 'Who would you most like to help right now, and why?' Explore how even a small amount in Give can make a real difference.",
    jarFocus: "give" as const,
  },
  {
    title: "Needs vs wants",
    prompt: "Pick something your child wants to buy and ask: 'Is this a need or a want?' There's no wrong answer — the goal is building the habit of asking.",
    jarFocus: null,
  },
  {
    title: "The waiting game",
    prompt: "Ask: 'Is there something you nearly bought but decided to wait on?' Celebrate the patience — waiting is a money superpower.",
    jarFocus: "save" as const,
  },
  {
    title: "Money mistakes are OK",
    prompt: "Share a time you spent money and regretted it. Ask your child if they've had that feeling. Normalise mistakes — they're the best teacher.",
    jarFocus: null,
  },
  {
    title: "Grow your future",
    prompt: "Ask: 'If you planted a money tree today, what would you want it to grow into in 10 years?' Introduce the idea that money can grow over time.",
    jarFocus: "grow" as const,
  },
  {
    title: "The generosity ripple",
    prompt: "Ask: 'What's the kindest thing someone did for you this week that didn't cost any money?' Talk about how giving isn't always about dollars.",
    jarFocus: "give" as const,
  },
  {
    title: "What's your goal worth?",
    prompt: "Look at the Save jar goal together and ask: 'How many weeks of pocket money until you reach it?' Make the maths real and exciting.",
    jarFocus: "save" as const,
  },
  {
    title: "The jar balance",
    prompt: "Review all the jars together. Ask: 'Are you happy with how your money is split, or would you change anything next time?'",
    jarFocus: null,
  },
  {
    title: "Earning extra",
    prompt: "Ask: 'If you could earn extra money this week, what job would you do, and which jar would it go in?'",
    jarFocus: null,
  },
  {
    title: "The price of things",
    prompt: "Next time you're shopping, pick an item and ask: 'How many weeks of pocket money would that cost?' Connect prices to effort.",
    jarFocus: "spend" as const,
  },
];

function getWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
}

export function getWeeklyPrompt() {
  const week = getWeekNumber();
  return prompts[week % prompts.length];
}

export function getAllPrompts() {
  return prompts;
}
