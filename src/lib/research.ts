/**
 * The research section's single source of numbers.
 *
 * Transcribed from `docs/website-research/content.json` (generated
 * 2026-08-18) plus the additive site-authored fields the pages need:
 * `pillars` (which of the five research tracks a piece of evidence backs),
 * `slug`, `shortTitle` and the `rail` copy. Every numeric string is copied
 * from that file character for character. Nothing here is re-typed from
 * memory and nothing is rounded on the way in.
 *
 * Copy law, applied here rather than at the call site: em-dashes survive only
 * inside verbatim scholarly text that editing would falsify, which in this
 * file means `title`, `abstractPlain`, `bibtex` and the figure descriptions
 * that must stay byte-identical to the figure's own `<desc>`. Everything the
 * site authors itself, headlines and claims and captions and labels, uses a
 * colon, a comma or a full stop.
 */

export type PillarId =
  | "identity"
  | "memory"
  | "perception"
  | "expression"
  | "agency"
  | "evaluation";

/**
 * Status is an enum, never free text, so moving a paper from preprint to
 * submitted to under review is a one-word edit and cannot quietly become a
 * claim about a third party. The venue never appears inside the chip.
 */
export type PaperStatus =
  | "in_preparation"
  | "preprint"
  | "submitted"
  | "under_review"
  | "accepted"
  | "published";

export const STATUS_LABEL: Record<PaperStatus, string> = {
  in_preparation: "In preparation",
  preprint: "Preprint",
  submitted: "Submitted",
  under_review: "Under review",
  accepted: "Accepted",
  published: "Published",
};

/** n, method, date and source travel with every number, in the same block. */
export type Provenance = {
  n: string;
  method: string;
  date: string;
  source: string;
};

export type ArtifactSlot = {
  key: "pdf" | "arxiv" | "code" | "benchmark";
  label: string;
  url: string | null;
  /** Verbatim from content.json `links.*_status`. Never softened. */
  status: string;
};

export type KeyFinding = {
  headline: string;
  meaning: string;
  source: string;
};

export type RailState = "measured" | "in_preparation" | "struck" | "open";

export type Rail = {
  state: RailState;
  /** Site-authored, one sentence, a claim rather than a title. */
  claim: string;
  /** The one scannable value. Null is legal and means the row shows a chip. */
  number: string | null;
  /** n, method and date, copied from the fields above, never re-typed. */
  meta: string;
  /** Only on a struck row: the control that killed the claim. */
  control?: string;
  href?: string;
  linkLabel?: string;
};

export type FigureId =
  | "fig-f1-agreement-forest"
  | "fig-f2-slot-a-evacuation"
  | "fig-f3-english-recovery";

export type Paper = {
  id: string;
  slug: string;
  /** Breadcrumb and card. Four words at most. */
  shortTitle: string;
  /** Verbatim scholarly text. Em-dashes permitted. */
  title: string;
  subtitle: string;
  status: PaperStatus;
  statusNote: string;
  statusAsOf: string;
  venue: {
    /** Prefixed "Submission target:" until the venue has accepted. */
    line: string;
    deadline: string | null;
  };
  authors: readonly string[];
  affiliation: string;
  date: string | null;
  /** Verbatim scholarly text. Em-dashes permitted. */
  abstractPlain: string;
  /** Which markdown section carries the paper's own technical abstract. */
  abstractTechnicalSection: string;
  /** One sentence, site-authored, for the card. */
  cardSummary: string;
  cardNumbers: { value: string; label: string }[];
  keyFindings: KeyFinding[];
  /** Required and non-empty. A paper page without it does not build. */
  limitations: string;
  bodyFile: string;
  figures: FigureId[];
  links: ArtifactSlot[];
  bibtex: string | null;
  pillars: PillarId[];
  rail: Rail;
};

export type Result = {
  id: string;
  headline: string;
  /** The scannable value, set at display size. */
  number: string;
  /** The rest of the value string, set at reading size beneath it. */
  numberNote?: string;
  comparisonNumber: string;
  meaning: string;
  provenance: Provenance;
  pillars: PillarId[];
  rail: Rail | null;
  /**
   * One measurement can bear on two tracks. Where it does, the claim is
   * written for the track it is sitting under, so the same row does not read
   * as boilerplate twice. Only the sentence changes; the number, the meta
   * line and the source never do.
   */
  railClaimByPillar?: Partial<Record<PillarId, string>>;
  /** The page's one accent number. Spent once, on the strongest thing. */
  accent?: true;
  /** Labels a real operating number that is not a research finding. */
  label?: string;
};

export type Retraction = {
  id: string;
  /** The struck claim. Rendered at headline scale, line-through. */
  claim: string;
  /** The control that killed it. Rendered in the seam grammar. */
  control: string;
  source: string;
};

export type CommitRow = {
  date: string;
  time: string;
  hash: string;
  message: string;
  /** The delta row: the interval, not the hash, is the evidence. */
  delta?: string;
};

const AUTHORS = ["Raghav Sharma", "Gaurav Sharma", "Aryan Tiwari"] as const;

export const AUTHOR_LINE = AUTHORS.join(" · ");

export const LAB = {
  positioning:
    "Vyakti.ai builds the relational-state layer for AI companions: memory, relationship history and honest forgetting that live outside any one model, so a companion's identity and the relationship a person has built with her do not reset when the underlying model changes. Because that claim is empirical rather than aspirational, our research arm treats evaluation as an engineering problem rather than a formality. We pre-register qualification bars before running candidates, publish our failures and retractions alongside our results, and release the harnesses and datasets that produced every number we cite.",
  standfirst:
    "Vyakti is a three-person team. Our research output is small by design and every entry in it is load-bearing: pre-registered before we saw the data, retracted in public when our own controls proved us wrong, and released with the harness that produced it.",
} as const;

export const PAPERS: Paper[] = [
  {
    id: "paper-b-judge-qualification",
    slug: "judge-qualification",
    shortTitle: "Judge qualification",
    title:
      "It's Not the Code-Switching: Six Frontier LLM Judges Fail a Pre-Registered Qualification Bar — and the Bar Was Above Its Own Ground Truth's Ceiling",
    subtitle:
      "A blind, counterbalanced, pre-registered judge-qualification study on a deployed Hinglish AI-companion product, with two self-run retractions and a measured reliability ceiling",
    status: "preprint",
    statusNote:
      "Not yet submitted. The JUDGe 2026 workshop deadline is 29 August 2026 AoE. This label changes to Submitted only once submission is sent, and to Under review only once the venue confirms receipt.",
    statusAsOf: "18 August 2026",
    venue: {
      line: "Submission target: JUDGe 2026, “Can We Trust the Judge?”, a NeurIPS 2026 workshop, non-archival.",
      deadline: "Deadline 29 August 2026 AoE.",
    },
    authors: AUTHORS,
    affiliation: "Vyakti.ai",
    date: "2026-08-18",
    abstractPlain:
      "Companies increasingly ask one AI model to judge another AI model's output. Common wisdom says a few safeguards — hiding which model wrote which reply, checking both presentation orders, using a judge from a different company — make the result trustworthy. We tested that directly: we took real judgments our team had already made and acted on, choosing which AI model would power our product, and asked six well-known AI models to reproduce them. All six failed a bar we set in advance; four did no better than random guessing. More important: the original judge, redoing its own past judgments, agreed with itself only 77 times out of 100 — below our own bar, unreachable from the start, which we only learned by measuring it. We also tested and ruled out our leading explanation (mixing Hindi and English) and a claim that one judge favored its own company's model — both looked believable and both were wrong. We release the test, the data, and the mistakes.",
    abstractTechnicalSection: "abstract",
    cardSummary:
      "Six frontier judges were backtested against verdicts that had already decided which model serves a live product. All six failed, and the bar itself turned out to sit above the ground truth's own measured ceiling.",
    cardNumbers: [
      { value: "6 / 6", label: "candidate judges failed" },
      { value: "77.1%", label: "ground truth's own ceiling" },
      { value: "≥80%", label: "bar, fixed before any run" },
    ],
    keyFindings: [
      {
        headline: "6 / 6 candidate judges fail",
        meaning:
          "Every credit-billed frontier judge tested, DeepSeek-V4-Flash, DeepSeek-V4-Pro, Mistral-Large-3, grok-4.3, gpt-5.6-terra and Cohere command-a-plus, failed a pre-registered ≥80% agreement bar against trusted verdicts. Pooled agreement ranged 28.1% to 54.2%, and command-a-plus was disqualified outright for failing to follow the output protocol.",
        source:
          "docs/paper/CAMERA.md §4.1; context/measurements.md judge-backtest, grok43-judge, deepseek-pro-judge, cohere-judge",
      },
      {
        headline: "4 of 5 scorable judges ≈ a coin flip",
        meaning:
          "Against the measured 30.5% chance baseline for this task's scoring rule, four of the five judges that produced scorable output carried no statistically detectable information about which reply a native-register-aligned judge would prefer.",
        source: "docs/paper/CAMERA.md §4.2",
      },
      {
        headline: "77.1%, the ground truth's own ceiling, below its own 80% bar",
        meaning:
          "Having the model that authored the trusted verdicts re-judge its own archive under the identical protocol reproduced only 74 of 96 verdicts (95% CI [67.7%, 84.4%]), so the pre-registered bar was, in hindsight, unreachable by construction. The study surfaced that only because it measured the ceiling rather than assuming one.",
        source:
          "context/measurements.md ground-truth-ceiling; docs/paper/CAMERA.md §4.1",
      },
      {
        headline: "Position bias evacuates the counterbalance, it does not just add noise",
        meaning:
          "A judge with a fixed slot-A propensity q ties on q² + (1−q)² of counterbalanced units by construction. Two of the tested judges landed almost exactly on that degenerate prediction, meaning their apparent caution was the complete absence of a real judgment.",
        source:
          "docs/paper/CAMERA.md §4.2 (analytic result, the paper's one non-measured quantity, plotted against measured points)",
      },
      {
        headline: "Two self-retractions, reported rather than dropped",
        meaning:
          "A cleanly measured ~16× same-vendor favoritism effect did not survive a between-judge control, and the paper's own working title, attributing failure to Hindi and English code-switching, was refuted by a monolingual-English translation control (recovery −3.1 to +6.6 pp, entirely inside this programme's own 13.6 pp measurement noise floor).",
        source:
          "context/measurements.md grok43-favoritism-retracted, r4-english-control; docs/paper/CAMERA.md §4.4 to §4.5",
      },
    ],
    limitations:
      "The ground truth is a trusted AI model's judgment, not a human one, and that is the study's largest open limitation. It is also a single product, a single language pair and 96 units, adequate to reject a pre-registered bar cleanly but not to finely rank the candidates against each other. A human-annotation run, at least two native Hinglish raters, blind and counterbalanced the same way, is the upgrade this paper needs before we would call the underlying construct validated rather than merely self-consistent, and it is planned, not done.",
    bodyFile: "judge-qualification.md",
    figures: [
      "fig-f1-agreement-forest",
      "fig-f2-slot-a-evacuation",
      "fig-f3-english-recovery",
    ],
    links: [
      {
        key: "pdf",
        label: "PDF",
        url: null,
        status:
          "Camera-ready draft complete (docs/paper/CAMERA.md, internal); public PDF not yet posted.",
      },
      {
        key: "arxiv",
        label: "arXiv",
        url: null,
        status:
          "arXiv preprint (cs.CL) planned before workshop submission; id not yet issued, and we will not fabricate one.",
      },
      {
        key: "code",
        label: "Code",
        url: null,
        status:
          "Release bundle vyakti-judge-qual built and de-identification-gated internally (release/vyakti-judge-qual/); public repository URL pending.",
      },
      {
        key: "benchmark",
        label: "Benchmark",
        url: null,
        status:
          "Same bundle as the code release. Harness, protocol and the 192-verdict ground-truth set ship together, not as a separate benchmark artifact.",
      },
    ],
    bibtex:
      "@misc{sharma2026notcodeswitching,\n  title        = {It's Not the Code-Switching: Six Frontier LLM Judges Fail a Pre-Registered Qualification Bar --- and the Bar Was Above Its Own Ground Truth's Ceiling},\n  author       = {Sharma, Raghav and Sharma, Gaurav and Tiwari, Aryan},\n  year         = {2026},\n  howpublished = {Submitted to JUDGe 2026 (NeurIPS Workshop, non-archival)},\n  note         = {Preprint; arXiv identifier pending at time of writing},\n  institution  = {Vyakti.ai}\n}",
    pillars: ["evaluation"],
    rail: {
      state: "measured",
      claim:
        "Six frontier judges failed a bar that was fixed in writing before any of them ran.",
      number: "6 / 6",
      meta:
        "n = 96 units, 192 judgments · pre-registered backtest · 18 Aug 2026",
      href: "/research/papers/judge-qualification",
      linkLabel: "Read the paper",
    },
  },
  {
    id: "paper-a-identity-ceiling",
    slug: "identity-ceiling",
    shortTitle: "Identity ceiling",
    title:
      "An Externalised, Citation-Enforced Relational-State Layer Does Not Lift a Frontier Model Into Register Band",
    subtitle:
      "Working title; re-scoped after a partially overlapping external result. Data collection in progress.",
    status: "in_preparation",
    statusNote:
      "This paper is genuinely incomplete, not merely unannounced. The central comparison arm is at roughly 3% of its target size (74 of a planned 2,304 calls) and is rate-limited to ~75 calls/day on its current pool, which puts full data collection roughly a month out absent additional compute. No headline number for this paper is final, and nothing on its page is a finding.",
    statusAsOf: "18 August 2026",
    venue: {
      line: "No submission target. There is no draft to submit.",
      deadline: null,
    },
    authors: AUTHORS,
    affiliation: "Vyakti.ai",
    date: null,
    abstractPlain:
      "This paper is in preparation and its data is incomplete, so no results are published yet. The question it is built to answer: if you give a different underlying AI model the exact same compiled memory, relationship history and context as an existing one — byte-for-byte identical input — does the companion still feel like the same person? Early, partial data suggests the answer is no by default: swapping the model changes surface behaviour (word choice, question-asking habits, and in one measured case, an unwanted script-mixing failure) even when every other input is held fixed. A related, larger independent study published elsewhere in 2026 found a similar pattern, so this paper's contribution is narrower and sharper than originally planned: whether a specific engineering approach — externalised memory enforced by citations rather than free text — narrows that gap. We will publish honestly whichever way the data comes out.",
    abstractTechnicalSection: "abstract",
    cardSummary:
      "The question it is built to answer: does a byte-identical compiled context survive a model swap, or does the serving model set the ceiling on whether a companion stays recognisable?",
    cardNumbers: [],
    keyFindings: [],
    limitations:
      "There are no findings on this page and no figure, because the primary comparison arm does not exist yet. The one observation shown is raw and unadjudicated, taken from a run with no relational-layer mitigation active by design, which is the paper's baseline condition rather than its test condition. The second blocker is the subject matter of the other paper: no credit-billed judge has cleared qualification for the relational axes this comparison needs.",
    bodyFile: "identity-ceiling.md",
    figures: [],
    links: [
      {
        key: "pdf",
        label: "PDF",
        url: null,
        status: "Not written; data collection incomplete.",
      },
      {
        key: "arxiv",
        label: "arXiv",
        url: null,
        status: "Not applicable. The paper is pre-draft.",
      },
      { key: "code", label: "Code", url: null, status: "Not applicable yet." },
      {
        key: "benchmark",
        label: "Benchmark",
        url: null,
        status: "Not applicable yet.",
      },
    ],
    bibtex: null,
    pillars: ["identity"],
    rail: {
      state: "in_preparation",
      claim: "Does byte-identical compiled context survive a model swap?",
      number: null,
      meta:
        "74 of 2,304 calls in the primary arm · rate-limited to ~75 calls/day · not a finding",
      href: "/research/papers/identity-ceiling",
      linkLabel: "Read the status",
    },
  },
];

/**
 * Paper A's one early observation, quarantined. The number is set at body
 * size in slate rather than at heading size in bone, because typographic
 * weight is a truth claim and an unadjudicated raw count has not earned one.
 */
export const PRELIMINARY_OBSERVATION = {
  paperSlug: "identity-ceiling",
  headline: "7 raw Devanagari-script hits on the swap candidate's surface output",
  meaning:
    "The raw candidate model, given the same compiled context as the incumbent, produced native-script characters against a hard-fail axis (any hit fails) in early generation. This is an unadjudicated data point, not a scored result, since the confirmatory incumbent-side comparison has not yet been generated.",
  caveat:
    "Raw and unscored. No adapter or relational-layer mitigation was active in this run by design; this measures the model swapped in with nothing added, the paper's baseline condition, not its test condition.",
  source: "context/measurements.md terra-arm-2304",
} as const;

export type CompletionRow = {
  label: string;
  value: string;
  note: string;
  href?: string;
};

/** Paper A's completion rail. Slate, never ember, and it does not animate. */
export const COMPLETION_RAIL: { fraction: number; rows: CompletionRow[] } = {
  fraction: 74 / 2304,
  rows: [
    { label: "Primary comparison arm", value: "74 of 2,304 calls", note: "3%" },
    {
      label: "Candidate arm",
      value: "2,304 of 2,304 calls",
      note: "complete",
    },
    {
      label: "Rate limit",
      value: "~75 calls/day on the current pool",
      note: "",
    },
    {
      label: "Blocked on",
      value: "a qualified judge, which is Paper B's own subject matter",
      note: "",
      href: "/research/papers/judge-qualification",
    },
  ],
};

export const RESULTS: Result[] = [
  {
    id: "gate0-structural-privacy",
    headline:
      "0 leaks in 31,122 checks: structural privacy against prompt-instructed privacy",
    number: "0 / 31,122",
    comparisonNumber:
      "57.1% (naturalistic) and 98.1% (adversarial) leak rate for a prompt-instruction-based privacy rule tested the same way",
    meaning:
      "In a multi-party (group) memory setting, telling the model “don't share X with people who shouldn't see it” as a prompt instruction leaked in the majority of naturalistic scenarios and nearly all adversarial ones. Replacing the instruction with a database-level retrieval predicate, so the model is structurally never shown the disqualifying rows, leaked zero times across 494 disclosure scenarios and 31,122 row-by-scenario checks. A negative control, the predicate deliberately weakened, correctly caught 162 violations, which is how we know the harness discriminates rather than trivially passing.",
    provenance: {
      n: "494 scenarios, 31,122 row×scenario checks",
      method:
        "Offline fixture battery, prompt-instruction arm against SQL-predicate arm, negative control run to validate the harness's own sensitivity",
      date: "2026-08-18",
      source: "context/measurements.md gate0-structural",
    },
    pillars: ["memory"],
    accent: true,
    rail: {
      state: "measured",
      claim:
        "A retrieval-time database predicate leaked zero times where the same rule written as a prompt instruction leaked in most scenarios.",
      number: "0 / 31,122",
      meta:
        "n = 494 scenarios, 31,122 checks · offline fixture battery · 18 Aug 2026",
      href: "/research#gate0-structural-privacy",
      linkLabel: "Read the result",
    },
  },
  {
    id: "vision-gate-engagement",
    headline: "Engagement roughly doubles with no detected rise in fabrication",
    number: "20.4% → 41.7%",
    numberNote: "engaged-on-a-stop (+21.3 pp)",
    comparisonNumber:
      "fabrication 10.2% → 11.2% (+1.0 pp, 95% CI [−3.1, +5.1], p = 0.64, no detected rise)",
    meaning:
      "Tuning how a companion comments on a shared screen to be more proactive roughly doubled how often people engaged when she paused, and a properly powered confirmatory run (n ≥ 300 per arm, correcting an earlier underpowered read) found no statistically detectable increase in how often she described something not actually on screen. This is stated as no difference detected, not no difference exists: a true rise of up to about 5 pp is still inside the confidence interval.",
    provenance: {
      n: "3,201 new calls (2,656 generation + 545 judged); confirmatory fabrication comparison at n = 313 and n = 695 assertion-level judgments",
      method:
        "Matched-arm A/B on an identical stimulus set, archived matched pairs plus a new confirmatory judged run, engagement compared by two-proportion test, fabrication by 95% CI on the difference",
      date: "2026-08-15",
      source: "context/measurements.md visiongate-powered",
    },
    pillars: ["perception", "agency"],
    railClaimByPillar: {
      perception:
        "Tuning how she reads and comments on a shared screen doubled engagement, with no detected rise in describing things that were not there.",
      agency:
        "Making her more forward when she pauses roughly doubled engagement, and a powered re-run found no detected rise in fabrication.",
    },
    rail: {
      state: "measured",
      claim:
        "Making her more forward on a shared screen roughly doubled engagement, with no detected rise in fabrication.",
      number: "20.4% → 41.7%",
      meta:
        "n = 3,201 calls, confirmatory arms at n = 313 and n = 695 · matched-arm A/B · 15 Aug 2026",
      href: "/research#vision-gate-engagement",
      linkLabel: "Read the result",
    },
  },
  {
    id: "ground-truth-ceiling-standalone",
    headline: "A trusted judge agrees with its own past verdicts only 77.1% of the time",
    number: "74 / 96 = 77.1%",
    numberNote: "95% CI [67.7%, 84.4%]",
    comparisonNumber:
      "against a pre-registered ≥80% qualification bar, fixed before this measurement existed",
    meaning:
      "Before treating any archived AI-judged decision as ground truth for a downstream evaluation, we measured how reproducible that judge's own verdicts are, by having it re-judge the same material under the identical blind, counterbalanced protocol seven days later. It reproduced itself only slightly more than three times in four. Any qualification bar for a replacement judge should be set relative to this measured ceiling, not to an arbitrary round number.",
    provenance: {
      n: "96 conversation units, 192 judgments (both presentation orders)",
      method:
        "Test-retest: same judge, same archive, same protocol, re-run and scored against its own prior verdicts",
      date: "2026-08-18",
      source: "context/measurements.md ground-truth-ceiling",
    },
    pillars: ["evaluation"],
    rail: {
      state: "measured",
      claim:
        "The judge that wrote our ground truth reproduced only three of every four of its own past verdicts.",
      number: "77.1%",
      meta:
        "n = 96 units, 192 judgments · test-retest under the identical protocol · 18 Aug 2026",
      href: "/research#ground-truth-ceiling-standalone",
      linkLabel: "Read the result",
    },
  },
  {
    id: "cache-economics",
    headline: "Prompt caching cuts serving cost roughly 9×",
    number: "9.2×",
    numberNote:
      "cheaper with caching enabled ($0.0017 against $0.0160 per turn, identical turn)",
    comparisonNumber:
      "measured production cache-hit rate 99.8% (chat) / 99.9% (call); $5,000 of inference buys ≈2.7M chat turns or ≈35,000 ten-minute voice calls at measured rates",
    meaning:
      "For a companion product with a large, mostly-static system context re-sent on every turn, prompt caching is not a marginal optimisation: it is close to a prerequisite for the unit economics to work at all. This measurement is why the lab treats compute cost as a solved constraint for this product shape and spends its attention on quality instead.",
    provenance: {
      n: "live production API calls, real persona context",
      method:
        "Same-turn A/B with caching enabled against disabled, provider-reported usage",
      date: "2026-08-11",
      source: "context/measurements.md cache-9x",
    },
    pillars: [],
    label: "Operating conditions",
    rail: null,
  },
];

/**
 * The two claims this lab retracted, each with the control that killed it.
 * Rendered at headline scale, struck, static. A lab that did not run the
 * control has nothing to strike through.
 */
export const RETRACTIONS: Retraction[] = [
  {
    id: "vendor-favoritism",
    claim: "A judge favours its own vendor's model, by roughly 16×.",
    control:
      "A between-judge control killed it. A judge with no vendor conflict at all showed a larger effect, which is the opposite of what the favoritism explanation predicts. The agreement failure stands; only the causal attribution is withdrawn.",
    source:
      "context/measurements.md grok43-favoritism-retracted; docs/paper/CAMERA.md §4.4",
  },
  {
    id: "code-switching",
    claim: "Six frontier judges failed because the material is code-switched.",
    control:
      "The identical 96 units, machine-translated to monolingual English and re-judged: −3.1 to +6.6 pp, every interval overlapping its Hinglish counterpart. Inside our own 13.6 pp noise floor. It is not the code-switching.",
    source:
      "context/measurements.md r4-english-control; docs/paper/CAMERA.md §4.5",
  },
];

/**
 * The pre-registration chain, with the timestamps the paper cites. The delta
 * row is the evidence: a reader does not need to verify a hash to feel that
 * someone was counting minutes.
 */
export const COMMIT_CHAIN: CommitRow[] = [
  {
    date: "2026-08-13",
    time: "12:20:22Z",
    hash: "2e82a0f",
    message: "Methodology and the ≥80% bar fixed, two days before any candidate ran",
  },
  {
    date: "2026-08-15",
    time: "09:37:58Z",
    hash: "c18b239",
    message: "Judge-qualification instantiation committed",
  },
  {
    date: "2026-08-15",
    time: "10:02:49Z",
    hash: "dd0a04c",
    message: "First backtest result committed",
    delta: "+25 min",
  },
  {
    date: "2026-08-15",
    time: "10:24:29Z",
    hash: "bfeb979",
    message: "Pre-registration proper",
  },
  {
    date: "2026-08-15",
    time: "11:28:09Z",
    hash: "a053019",
    message: "Amended, qualification bar unchanged",
  },
];

export const COMMIT_CHAIN_SOURCE =
  "docs/paper/CAMERA.md §3; docs/paper/DRAFT.md §13.6; also a7198a2 and d10e840 in the same chain";

/** The worked example the method module annotates, part by part. */
export const ANNOTATED_MEASURE_ID = "gate0-structural-privacy";

export const DEIDENTIFICATION = {
  gates: "22 / 22",
  gatesNote: "gates passed, run against the built bundle rather than the source tree",
  leaks: "1",
  leaksNote:
    "real leak caught and fixed before anything shipped: a provider error message carrying a full cloud tenant hostname",
  source: "docs/paper/DRAFT.md §13.4",
  datasheetSummary:
    "The ground truth in this release was produced by an AI model, not by human annotators. Every agreement figure means agreement with one trusted judge. It never means accuracy.",
  datasheetAttribution:
    "the vyakti-judge-qual datasheet, section 1, in summary",
} as const;

export const NOISE_FLOOR_NOTE =
  "The fabrication metric's own noise floor exists because a claim was once reported without enough n to separate signal from noise, and a properly powered re-run moved the effect by up to 75 pp on byte-identical input. Any claim from that instrument below the sample size that produced that swing is now treated as noise by policy.";

export type Release = {
  slug: string;
  name: string;
  description: string;
  status: string;
  ctaLabel: string;
  contents: string[];
  exclusions: string[];
  licenses: { code: string; data: string };
  limitsFirst: string[];
  source: string;
  paperSlug: string;
};

export const RELEASES: Release[] = [
  {
    slug: "vyakti-judge-qual",
    name: "vyakti-judge-qual",
    description:
      "The full judge-qualification protocol, harness and dataset behind the paper “It's Not the Code-Switching”. Released so other teams evaluating LLM judges on affective or open-ended preference tasks can qualify their own candidates against a real backtest rather than assuming trustworthiness.",
    status:
      "Built and internally gated; public repository URL pending alongside the paper's arXiv posting.",
    ctaLabel: "Repository URL posts with the arXiv preprint",
    limitsFirst: [
      "The ground truth was produced by an AI model, not by human annotators. Every agreement figure in this release means agreement with one trusted judge, and never accuracy.",
      "96 conversation units clustered on 12 beats. That is adequate to reject an 80% bar and inadequate for finely ranking the failures against each other.",
      "One product, one persona and one language pair, on two archives. Generalisation is an open question here, never a claim.",
      "Judge results are date-stamped evidence, 15 and 18 August 2026, rather than properties of a model name. A deployment shifting behaviour over days has already been measured on this programme.",
      "Adopting this as a benchmark of judge correctness is the principal misuse risk. It measures agreement with one trusted judge's decisions on one product's construct.",
    ],
    contents: [
      "The generalised qualification harness, including the transport-validity and parse-validity guards that make a run self-invalidate rather than report a crippled result. The paper describes these as a contribution in their own right, not as incidental plumbing.",
      "192 ground-truth verdicts with free-text rationales, across seven judged axes (warmth, humour, register, specificity, brevity, personhood, overall). The scarcest asset in the release.",
      "Both arms of both source archives, stripped to {user, reply} plus {model, lane, beat, replicate}. No persona prompt text, no production user data.",
      "1,536 primary judgment rows plus 5,760 six-axis extension rows and 960 English-translation-control rows: every judgment call any figure or table in the paper is computed from.",
      "A per-vendor deployment quirk log (token-parameter names, silent hidden-reasoning token burn, output-format violations) that practitioners are expected to use more than the headline results.",
      "A Gebru-style datasheet stating, in its own first section, that the ground truth is LLM-produced rather than human-annotated, and that every agreement figure means agreement with one trusted judge, never accuracy.",
    ],
    exclusions: [
      "The product's persona prompt. It is not released and is not needed for any claim the paper makes. Archived files that embedded it are processed by an extraction script rather than copied, and the built bundle is checked by a 22-gate de-identification sweep before anything ships.",
    ],
    licenses: { code: "Apache-2.0", data: "CC BY 4.0" },
    source: "docs/paper/CAMERA.md §7; docs/paper/DRAFT.md §13.4",
    paperSlug: "judge-qualification",
  },
];

/**
 * Figure registry. `component` is resolved in
 * `src/components/research/figures.tsx`; the data table beneath each figure
 * is the same numbers in a form a screen reader can read row by row.
 */
export type FigureSpec = {
  id: FigureId;
  label: string;
  caption: string;
  source: string;
  table: {
    caption: string;
    columns: string[];
    rows: string[][];
    note?: string;
  };
};

export const FIGURES: Record<FigureId, FigureSpec> = {
  "fig-f1-agreement-forest": {
    id: "fig-f1-agreement-forest",
    label: "Figure 1",
    caption:
      "Pooled agreement between six candidate AI judges and a trusted verdict set, against a pre-registered 80% qualification bar. Every judge fails; the hatched band marks the trusted judge's own measured 77.1% test-retest ceiling, which sits below the bar itself.",
    source: "Rebuilt from docs/paper/figures/fig-f1-agreement-forest.mjs",
    table: {
      caption: "Figure 1 data: pooled agreement and cluster-bootstrap intervals",
      columns: ["Judge", "Agreement", "95% CI (cluster-bootstrap)", "Verdict"],
      rows: [
        ["gpt-5.6-terra", "54.2% (52/96)", "[43.8%, 64.6%]", "FAIL"],
        ["grok-4.3", "34.4% (33/96)", "[25.0%, 43.8%]", "FAIL"],
        ["DeepSeek-V4-Pro", "30.9% (29/94)", "[20.7%, 41.5%]", "FAIL"],
        ["Mistral-Large-3", "29.2% (28/96)", "[20.8%, 38.5%]", "FAIL"],
        ["DeepSeek-V4-Flash", "28.1% (27/96)", "[18.8%, 39.6%]", "FAIL"],
        [
          "Cohere command-a-plus",
          "0 scorable units",
          "not plottable",
          "DISQUALIFIED",
        ],
        [
          "claude-opus-4.8 (ceiling, not a candidate)",
          "77.1% (74/96)",
          "[67.7%, 84.4%]",
          "CEILING",
        ],
        [
          "claude-opus-5 (invalid, not a result)",
          "100.0% (17/17)",
          "parse-selected denominator",
          "INVALID",
        ],
      ],
      note: "Pre-registered bar ≥80%. Chance baselines: uniform-random 30.5%, pure slot-A 21.9%, both derived from the archived verdict distribution. Cohere command-a-plus is absent from the plot because 158 of 192 calls failed to parse, which is a disqualification for cause rather than a low score.",
    },
  },
  "fig-f2-slot-a-evacuation": {
    id: "fig-f2-slot-a-evacuation",
    label: "Figure 2",
    caption:
      "Left: how often each judge picked the first-presented reply, against the trusted judge's 58.9% on identical rows. Right: what that pick rate alone predicts for the tie rate, and where each judge actually lands. A judge sitting on the dashed curve has stopped reading the replies. The curve is analytic, derived from the pick rate, and is the paper's one non-measured quantity.",
    source: "Rebuilt from docs/paper/figures/fig-f2-slot-a-evacuation.mjs",
    table: {
      caption: "Figure 2 data: pooled slot-A pick rate per judge",
      columns: ["Judge", "Slot-A pick rate (pooled)", "Rows"],
      rows: [
        ["Mistral-Large-3", "89.6%", "n = 192"],
        ["DeepSeek-V4-Flash", "80.2%", "n = 192"],
        ["grok-4.3", "73.4%", "n = 192"],
        ["DeepSeek-V4-Pro", "65.8%", "n = 190"],
        ["gpt-5.6-terra", "62.0%", "n = 192"],
        ["claude-opus-4.8 (trusted judge)", "58.9%", "n = 192"],
      ],
      note: "On the 38 to 2 landslide archive, Mistral-Large-3 and DeepSeek-V4-Flash each land at 16.7% (8/48) agreement against an archived tie rate of 16.7%, exactly on the content-blind prediction.",
    },
  },
  "fig-f3-english-recovery": {
    id: "fig-f3-english-recovery",
    label: "Figure 3",
    caption:
      "The same 96 units, machine-translated to monolingual English and re-judged. Every recovery is small and falls inside this programme's own ±13.6-point measurement noise floor, so removing the code-switching rescues no judge. Disclosed confound: gpt-5.6-terra is both a judge under test and the translator that produced the English condition for all five judges.",
    source: "Rebuilt from docs/paper/figures/fig-f3-english-recovery.mjs",
    table: {
      caption: "Figure 3 data: Hinglish and English agreement per judge",
      columns: ["Judge", "Hinglish", "English", "Recovery"],
      rows: [
        ["DeepSeek-V4-Pro", "30.9% (29/94)", "37.5% (36/96)", "+6.6 pp"],
        ["Mistral-Large-3", "29.2% (28/96)", "34.7% (33/95)", "+5.6 pp"],
        ["DeepSeek-V4-Flash", "28.1% (27/96)", "31.9% (29/91)", "+3.7 pp"],
        ["grok-4.3", "34.4% (33/96)", "37.5% (36/96)", "+3.1 pp"],
        ["gpt-5.6-terra", "54.2% (52/96)", "51.0% (49/96)", "−3.1 pp"],
      ],
      note: "Noise floor band ±13.6 percentage points, this programme's own measured judged-rate spread across 300 byte-identical arm-pairs (context/measurements.md fab-noise-floor).",
    },
  },
};

/** Evidence rows attached to one pillar, in a shape the rail can render. */
export type EvidenceRow = Rail & { id: string };

export function evidenceFor(pillar: PillarId): EvidenceRow[] {
  const rows: EvidenceRow[] = [];
  for (const paper of PAPERS) {
    if (paper.pillars.includes(pillar)) rows.push({ id: paper.id, ...paper.rail });
  }
  for (const result of RESULTS) {
    if (result.rail && result.pillars.includes(pillar)) {
      const claim = result.railClaimByPillar?.[pillar] ?? result.rail.claim;
      rows.push({ id: result.id, ...result.rail, claim });
    }
  }
  return rows;
}

/**
 * The open state, on the one track where nothing has been measured yet. The
 * second sentence is the honest reason and it is true. It is not softened and
 * it is not removed, and no loosely related number is attached to fill the
 * cell.
 */
export const OPEN_RAIL: Record<string, string> = {
  expression:
    "No published measurement yet. This track is where the product work is ahead of the paper work.",
};

/** The struck row, used once, on the pillar whose claim it qualifies. */
export const STRUCK_RAIL: Record<string, EvidenceRow> = {
  evaluation: {
    id: "code-switching-retraction",
    state: "struck",
    claim: RETRACTIONS[1].claim,
    number: null,
    meta: "context/measurements.md r4-english-control · translation control · 18 Aug 2026",
    control:
      "Re-judged in monolingual English: −3.1 to +6.6 pp, inside our own 13.6 pp noise floor.",
    href: "/research#method",
    linkLabel: "How we work",
  },
};

const WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six"] as const;

const count = (n: number) => WORDS[n] ?? String(n);

/**
 * Four counts, all derived, all a count of a thing you can click. No
 * percentages, no growth, no adjective.
 */
export const HERO_COUNTS = [
  `${count(PAPERS.length)} papers`,
  `${count(RESULTS.length)} standalone results`,
  `${count(RETRACTIONS.length)} retractions`,
  `${count(RELEASES.length)} released benchmark`,
].join(". ");

export function paperBySlug(slug: string): Paper | undefined {
  return PAPERS.find((paper) => paper.slug === slug);
}

export function releaseBySlug(slug: string): Release | undefined {
  return RELEASES.find((release) => release.slug === slug);
}
