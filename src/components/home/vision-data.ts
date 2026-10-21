/**
 * The map of a person: seven families, 25 dimensions. Each dimension carries
 * the question an AI would have to answer, why that question is still open,
 * and the ground truth that could prove the AI right or wrong. The last field
 * decides research order, so `first` marks the dimensions with a ground truth
 * clean enough to study now.
 *
 * Citations in `open` are to published work; nothing here is a Vyakti result.
 */

export type FamilyKey = "A" | "B" | "C" | "D" | "E" | "F" | "G";

/** A to E describe the person being understood; F and G describe the AI doing the understanding. */
export type FamilySide = "person" | "ai";

export const FAMILY_SIDES: ReadonlyArray<{ key: FamilySide; label: string }> = [
  { key: "person", label: "The person" },
  { key: "ai", label: "The AI" },
];

export const FAMILIES: ReadonlyArray<{ key: FamilyKey; name: string; long: string; side: FamilySide }> = [
  { key: "A", name: "Knows", long: "What the person knows", side: "person" },
  { key: "B", name: "Learns", long: "How they think and learn", side: "person" },
  { key: "C", name: "Feels", long: "Their inner state", side: "person" },
  { key: "D", name: "Talks", long: "The signal in how they talk", side: "person" },
  { key: "E", name: "Relates", long: "The relationship", side: "person" },
  { key: "F", name: "Self", long: "The AI’s own self", side: "ai" },
  { key: "G", name: "Evolves", long: "The loop that makes it grow", side: "ai" },
];

export type Dimension = {
  family: FamilyKey;
  name: string;
  question: string;
  open: string;
  truth: string;
  first: boolean;
};

export const DIMENSIONS: ReadonlyArray<Dimension> = [
  { family: "A", name: "Understood vs just answered", question: "Did they really get it, or just produce the right answer?", open: "No study checks whether a tutor’s “understood” judgement predicts a later test.", truth: "A fresh problem seven days later; a transfer problem.", first: true },
  { family: "A", name: "Hidden mental model", question: "What wrong idea produces their mistakes?", open: "Language models score under 50% when diagnosing errors freely.", truth: "Errors on items built to target a specific misconception.", first: true },
  { family: "A", name: "Self-calibration gap", question: "Do they know what they know?", open: "Self-judged understanding correlates only about .27 with the real thing.", truth: "Their confidence compared with the delayed test.", first: true },
  { family: "A", name: "Belief gap blocking their goal", question: "What do they believe that differs from reality and stops them?", open: "Frontier models still fail at this (Beyond Words, 2026).", truth: "Whether the goal succeeds once the gap is fixed.", first: false },
  { family: "B", name: "How this person learns", question: "Which explanations, examples or representations work for them?", open: "“Learning styles” failed. Real per-person differences need careful within-person tests.", truth: "Delayed outcome per teaching approach, same person.", first: true },
  { family: "B", name: "Reasoning habits", question: "How do they attack problems?", open: "Rarely modelled beyond right or wrong.", truth: "Does the predicted error pattern recur?", first: false },
  { family: "B", name: "Silent disengagement", question: "When have they switched off while still nodding?", open: "A classroom-scale blind spot, with little evidence on detecting it in conversation.", truth: "A comprehension check right after.", first: false },
  { family: "B", name: "Behaviour over weeks", question: "Patterns of return, avoidance and procrastination.", open: "Studied in apps, never tied to understanding.", truth: "Actual return and avoidance logs.", first: false },
  { family: "C", name: "Productive vs stuck struggle", question: "Confusion that helps, or frustration that harms?", open: "Confusion helps only when it gets resolved (D’Mello); telling which is hard.", truth: "Resolved or not in the next turns; the later outcome.", first: true },
  { family: "C", name: "Goals and interests", question: "Why are they here, and what do they care about?", open: "Models score under 50% at inferring context-dependent preferences (CUPID).", truth: "The person confirms; engagement with what was offered.", first: false },
  { family: "C", name: "Fear of looking stupid", question: "What makes them hide confusion?", open: "Help avoidance is well studied in people and unmodelled in AI.", truth: "Rate of admitted confusion.", first: false },
  { family: "D", name: "What isn’t said", question: "Hedges, filler agreement, long pauses, topic avoidance, switching language.", open: "Mostly untested, especially in code-mixed speech.", truth: "Whether these predict the delayed test.", first: true },
  { family: "D", name: "Pacing and turn-taking", question: "Is this silence thinking, or being lost?", open: "An off-the-shelf turn-end model read children’s silences at 0.62 accuracy, where 0.5 is chance.", truth: "Cut-off rate; whether the person continues.", first: true },
  { family: "D", name: "Register", question: "Formal or casual, humour tolerance, directness.", open: "Persona work ignores per-person register.", truth: "The person’s reaction and whether they continue.", first: false },
  { family: "E", name: "Trust as a sensor", question: "Does trust make people reveal confusion and truth?", open: "Strong in human research (alliance r ≈ .28); unmeasured for AI.", truth: "Disclosure rate against relationship continuity.", first: true },
  { family: "E", name: "Relationship arc", question: "Stages, rupture and repair, shared history.", open: "Companion apps imitate it; no evaluation exists.", truth: "Behaviour after a rupture; whether they return.", first: false },
  { family: "E", name: "Feeling understood, accurately", question: "Can AI make someone feel understood without flattering them?", open: "Studies show both the “feeling heard” benefit and the dependency risk.", truth: "The person’s rating plus the accuracy of what the AI claimed.", first: false },
  { family: "E", name: "Honesty vs comfort", question: "When to challenge, and when to support?", open: "Models preserve the user’s face about 45 points more than people do (ELEPHANT).", truth: "Was the challenge right, judged by outcome?", first: false },
  { family: "E", name: "Restraint", question: "When not to speak, or not to bring something up.", open: "Only group-chat studies exist; nothing one-to-one or long-term.", truth: "The person’s reaction; regret signals.", first: false },
  { family: "E", name: "Healthy dependence", question: "Growing their independence, not their reliance.", open: "Heavy chatbot use correlates with loneliness (MIT and OpenAI, 2025).", truth: "Independent performance without the AI.", first: false },
  { family: "F", name: "One personality that grows", question: "The same someone for months, yet evolving.", open: "Persona drift appears within eight rounds, worst in emotional chats.", truth: "Blind consistency judgements over time.", first: false },
  { family: "F", name: "Knowing what it doesn’t know about you", question: "Does it ask instead of assuming?", open: "Memory benchmarks reward recall, not humility.", truth: "Rate of made-up claims about the person.", first: false },
  { family: "F", name: "Keeping commitments", question: "Promises remembered and kept.", open: "Untested.", truth: "Promise logs against follow-through.", first: false },
  { family: "G", name: "Knowing vs using", question: "Does it act on what it infers about you?", open: "Models infer mental states but act on them only 15–50% of the time (SimpleToM).", truth: "Was the action matched to the stated belief?", first: true },
  { family: "G", name: "Learning from being wrong about you", question: "Does it get better at this person over time?", open: "No benchmark scores this.", truth: "Its predictions about you, scored as weeks pass.", first: true },
];

/**
 * An illustrative living theory of one learner. Rows carry forward unless a
 * stage rewrites them, so each stage lists only what changed. Learning is the
 * example because it is the one domain with an answer key.
 */
export type TheoryRowKey = "A" | "B" | "C" | "D" | "E";
export type Bet = { claim: string; odds: string; state: "open" | "hit" | "miss" };
export type TheoryStage = {
  at: string;
  rows: Partial<Record<TheoryRowKey, { text: string; confidence: number }>>;
  fading?: Partial<Record<TheoryRowKey, string>>;
  bets: Bet[];
  note: string;
  noteLead: string;
};

export const THEORY_ROWS: ReadonlyArray<{ key: TheoryRowKey; label: string }> = [
  { key: "A", label: "Knows" },
  { key: "B", label: "Learns" },
  { key: "C", label: "Feels" },
  { key: "D", label: "Talks" },
  { key: "E", label: "Relates" },
];

export const THEORY: ReadonlyArray<TheoryStage> = [
  {
    at: "Session 1",
    rows: {
      A: { text: "Gets fraction procedures right. Unclear whether she understands why.", confidence: 0.3 },
      B: { text: "No evidence yet about what works for her.", confidence: 0.1 },
      C: { text: "Goes quiet after corrections. Thinking, or upset? Unknown.", confidence: 0.3 },
      D: { text: "Agrees quickly. Switches language when unsure.", confidence: 0.45 },
      E: { text: "New. Polite and formal.", confidence: 0.2 },
    },
    bets: [{ claim: "Solves a fresh comparison within seven days", odds: "60%", state: "open" }],
    noteLead: "First impressions.",
    note: "Low confidence everywhere, on purpose.",
  },
  {
    at: "Session 4",
    rows: {
      A: { text: "Holds a hidden rule: a bigger bottom number means a bigger fraction. Seen twice.", confidence: 0.65 },
      B: { text: "A number line worked. A pie chart didn’t. One example each.", confidence: 0.4 },
      D: { text: "A quick agreement after a long pause came before both wrong answers.", confidence: 0.6 },
    },
    bets: [
      { claim: "Solves a fresh comparison within seven days", odds: "60%", state: "miss" },
      { claim: "Places 3/8 correctly on a number line", odds: "55%", state: "open" },
    ],
    noteLead: "A missed bet rewrites a belief.",
    note: "Her quick agreement now reads as comfort, not understanding.",
  },
  {
    at: "Week 2",
    rows: {
      A: { text: "The hidden rule, seen four times. The procedure is fine; the idea underneath isn’t.", confidence: 0.8 },
      B: { text: "Number lines land for her, two out of two. Pie charts don’t.", confidence: 0.7 },
      C: { text: "Quiet after a correction means stuck, not thinking. A short break helps.", confidence: 0.7 },
      E: { text: "Her first “I don’t get it” came right after the AI admitted a mistake of its own.", confidence: 0.55 },
    },
    bets: [
      { claim: "Places 3/8 correctly on a number line", odds: "55%", state: "hit" },
      { claim: "Admits confusion unprompted this week", odds: "45%", state: "open" },
    ],
    noteLead: "Trust changed what she says.",
    note: "Her own words now carry more weight in the theory.",
  },
  {
    at: "Week 5",
    rows: {
      A: { text: "Explains in her own words why 3/5 is bigger. Solved a fresh one hidden in a decimals lesson.", confidence: 0.85 },
      B: { text: "Learns best when she predicts first, then checks.", confidence: 0.75 },
      C: { text: "Her struggle is productive now: she asks for a hint before giving up.", confidence: 0.7 },
      D: { text: "Fewer quick agreements. Says when she’s lost.", confidence: 0.8 },
      E: { text: "Jokes about the puppet. Admits confusion on her own, several times a week.", confidence: 0.8 },
    },
    fading: { B: "“Pie charts don’t work for her”: untested for three weeks, so it fades." },
    bets: [
      { claim: "Admits confusion unprompted this week", odds: "45%", state: "hit" },
      { claim: "Applies fractions to a recipe she has never seen", odds: "70%", state: "open" },
    ],
    noteLead: "An old belief retires on its own.",
    note: "Nothing re-confirmed it, so its confidence decayed.",
  },
];

/** Carry each row forward through the stages and mark what changed. */
export function resolveTheory() {
  const out: Array<Record<TheoryRowKey, { text: string; confidence: number; previous?: string; changed: boolean }>> = [];
  THEORY.forEach((stage, i) => {
    const prev = out[i - 1];
    const cur = {} as (typeof out)[number];
    for (const { key } of THEORY_ROWS) {
      const next = stage.rows[key];
      const before = prev?.[key];
      if (next) {
        const changed = i > 0 && before?.text !== next.text;
        cur[key] = { ...next, previous: changed ? before?.text : undefined, changed };
      } else if (before) {
        cur[key] = { text: before.text, confidence: before.confidence, changed: false };
      }
    }
    out.push(cur);
  });
  return out;
}
