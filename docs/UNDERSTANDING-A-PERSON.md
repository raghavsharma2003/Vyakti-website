# Understanding a person: the Vyakti / Taxila research and system spec

**For:** any agent or engineer continuing this work. Read it top to bottom before designing, building or claiming anything.
**Written:** 2026-10-21, from the Lossfunk research proposal (lossfunk.vyakti.ai, source in `vyakti-website/sites/lossfunk/`),
Taxila's research (`Taxila/docs/research/learning-science.md`, `Taxila/docs/research/world-best/understanding-detection.md`)
and the Maya product's measured lessons (`html-portfolio/context/`).

**Status, stated honestly.** This is a plan and a partly built system. Taxila is live with a handful of children
(6 real children, 22 lessons as of 2026-10-21). Almost nothing below has been measured on children at scale.
Every number from the literature is marked with its source. Every number we will produce must come with
n, method and date (see §14). Never present a design target as a result.

---

## 0. The one-paragraph version

Language models learned language by predicting the next word. Vyakti learns **a person** by predicting **the person**.
It keeps a written, evidence-backed theory of each person. Every belief in it is a **bet** on what the person will do
next. Reality grades each bet, and each miss rewrites the theory, with the reason kept. Learning is where we start,
because learning has an answer key: a fresh problem a week later shows whether the AI was right about the child.
The relationship is part of the measuring instrument, because people reveal more to someone they trust.
The research question: **can an AI measurably get to know a person, and get better at it over time?**

---

## 1. The problem

Intelligence is no longer the bottleneck; understanding the person is. Models write production code, and an AI system
has produced a machine-checked proof for Navier–Stokes, a Millennium Prize problem. Yet a tutor still cannot tell
whether a child understood, a coach cannot tell when someone is about to quit, and an assistant agrees when it should
push back.

How far AI has climbed toward a person (published results, none ours):

| Rung | What it means | Where the field is | Source |
|---|---|---|---|
| Remember you | Recall what you said | 90%+ | LongMemEval (Wu et al., ICLR 2025) |
| Infer you | Work out what you know, want or believe | 37–65% | PersonaMem-v2 (2025); CUPID (COLM 2025) |
| Act on it | Use what it inferred | 15–50% unprompted; ~95% if reminded | SimpleToM (Gu, Tafjord et al., ICLR 2026) |
| Get better at you | Improve with every conversation | **No benchmark exists** | This is Vyakti's question |

Remembering a person is close to solved. Understanding one, acting on that understanding, and getting better at it over
time are not, and almost nobody measures them.

## 2. Why learning first

Learning is where misreading a person costs the most, and where being right can be proven.

- **Confusion hides.** In class, a student asks about one question every nine hours. With a one-to-one tutor, about 26
  questions are asked per hour (Graesser & Person, 1994).
- **Learners can't see it either.** People's judgement of their own understanding tracks reality at only about r = .27
  (Dunlosky & Lipko, 2007).
- **AI tutors make it worse when they trust surface success.** In one study practice scores rose 48% while exam scores
  fell 17% (Bastani et al., PNAS 2025).
- **Learning has an answer key.** A fresh problem a week later, or a transfer problem, shows whether the AI's belief
  about the person was right. Most other domains (companionship, coaching) have no clean ground truth yet.

The founder's origin, which is also the product's thesis: Kota, India's coaching city. Lakhs of students sit in classes of
hundreds and nod along. Many are lost and nobody knows, often not even the student. "Haan, samajh gaya" ("yes, got it")
is easier to say than "I don't get it". A right answer can hide a wrong idea for years.

---

## 3. The map: seven families, 25 dimensions

Understanding a person is not one skill. **A–E describe the person. F and G describe the AI**: its own self, and the
loop that makes it better. Each dimension has a core question, the reason it is still open, and a **ground truth** that
could prove the AI right. The ground truth decides what can be researched first; **first targets** have a ground truth
clean enough to study now.

| # | Family | Dimension | Core question | Why it's still open | Ground truth | First target |
|---|---|---|---|---|---|---|
| 1 | A Knows | Understood vs just answered | Did they really get it, or just produce the right answer? | No study checks whether a tutor's "understood" judgement predicts a later test | A fresh problem 7 days later; a transfer problem | Yes |
| 2 | A Knows | Hidden mental model | What wrong idea produces their mistakes? | LLMs score under 50% diagnosing errors freely | Errors on items built to target a specific misconception | Yes |
| 3 | A Knows | Self-calibration gap | Do they know what they know? | Self-judged understanding correlates only ~.27 with the real thing | Their confidence compared with the delayed test | Yes |
| 4 | A Knows | Belief gap blocking their goal | What do they believe that differs from reality and stops them? | Frontier models still fail at this (Beyond Words, 2026) | Whether the goal succeeds once the gap is fixed | Later |
| 5 | B Learns | How this person learns | Which explanations, examples or representations work for them? | "Learning styles" failed; real per-person differences need within-person tests | Delayed outcome per teaching approach, same person | Yes |
| 6 | B Learns | Reasoning habits | How do they attack problems ("always rushes the last step")? | Rarely modelled beyond right or wrong | Does the predicted error pattern recur? | Later |
| 7 | B Learns | Silent disengagement | When have they switched off while still nodding? | Classroom-scale blind spot; little evidence on detecting it in conversation | A comprehension check right after | Later |
| 8 | B Learns | Behaviour over weeks | Patterns of return, avoidance, procrastination | Studied in apps, never tied to understanding | Actual return and avoidance logs | Later |
| 9 | C Feels | Productive vs stuck struggle | Confusion that helps, or frustration that harms? | Confusion helps only when resolved (D'Mello); telling which is hard | Resolved or not in the next turns; later outcome | Yes |
| 10 | C Feels | Goals and interests | Why are they here; what do they care about? | Models score under 50% inferring context-dependent preferences (CUPID) | The person confirms; engagement with hooks | Later |
| 11 | C Feels | Fear of looking stupid | What makes them hide confusion? | Help avoidance is well studied in people, unmodelled in AI | Rate of admitted confusion | Later |
| 12 | D Talks | What isn't said | Hedges, filler agreement, long pauses, topic avoidance, language switching | Mostly untested, especially in code-mixed speech | Whether these predict the delayed test | Yes |
| 13 | D Talks | Pacing and turn-taking | Is this silence thinking, or being lost? | An off-the-shelf turn-end model read children's silences at 0.62 accuracy (0.5 = chance) | Cut-off rate; whether the learner continues | Yes |
| 14 | D Talks | Register | Formal or casual (tu/tum/aap), humour tolerance, directness | Persona work ignores per-person register | The person's reaction and continuation | Later |
| 15 | E Relates | Trust as a sensor | Does trust make people reveal confusion and truth? | Strong in human research (alliance r ≈ .28); unmeasured for AI | Disclosure rate against relationship continuity | Yes |
| 16 | E Relates | Relationship arc | Stages, rupture and repair, shared history | Companion apps fake it; no evaluation exists | Behaviour after a rupture; return | Later |
| 17 | E Relates | Feeling understood, accurately | Can AI make someone feel understood without flattering them? | Studies show both the "feeling heard" benefit and the dependency risk | Person's rating plus accuracy of what the AI claimed | Later |
| 18 | E Relates | Honesty vs comfort | When to challenge, when to support? | Models preserve the user's face ~45 points more than people (ELEPHANT, ICLR 2026) | Was the challenge right, judged by outcome? | Later |
| 19 | E Relates | Restraint | When not to speak or bring something up | Only group-chat studies exist; nothing one-to-one or long-term | The person's reaction; regret signals | Later |
| 20 | E Relates | Healthy dependence | Growing their independence, not reliance | Heavy chatbot use correlates with loneliness (MIT Media Lab & OpenAI, 2025) | Independent performance without the AI | Later |
| 21 | F Self | One personality that grows | The same someone for months, yet evolving | Persona drift appears within 8 rounds, worst in emotional chats (Li et al., 2024) | Blind consistency judgements over time | Later |
| 22 | F Self | Knowing what it doesn't know about you | Does it ask instead of assuming? | Memory benchmarks reward recall, not humility | Rate of made-up claims about the person | Later |
| 23 | F Self | Keeping commitments | Promises remembered and kept | Untested | Promise logs against follow-through | Later |
| 24 | G Evolves | Knowing vs using | Does it act on what it infers about you? | Models act on inferred mental states only 15–50% of the time (SimpleToM) | Was the action matched to the stated belief? | Yes |
| 25 | G Evolves | Learning from being wrong about you | Does it get better at this person over time? | No benchmark scores this | Its predictions about you, scored as weeks pass | Yes |

**Rule for agents:** when you add a feature, say which dimensions it serves. A feature that serves none is decoration.

---

## 4. The insight that ties it together: the relationship is part of the instrument

People reveal more to someone they trust. The strength of the relationship predicts therapy outcomes at r ≈ .28 across
nearly 300 studies and more than 30,000 patients (Flückiger et al., 2018). Teams that feel psychologically safe admit
errors and ask for help (Edmondson, 1999).

So for an AI, **memory, one steady personality and a bond that grows are not product features. They are how honest
signals get in.** The loop:

1. **Trust**: it is safe to be wrong here.
2. **Honest signals**: "I don't get it" gets said out loud.
3. **A truer theory**: the AI sees what is real, not what is performed.
4. **Feeling understood, without flattery**: which builds more trust.

Relational intelligence (being someone to the person) and understanding (knowing the person) are one loop, not two
products. This is why the Maya work (persistent identity) and the Taxila work (understanding detection) are the same
company.

---

## 5. The hypothesis

**Main claim.** The system forms beliefs about the whole person: what they know (A), how they learn (B), what they feel
(C), what their talk gives away (D) and how far they trust it (E). Every belief is a bet on what the person will do next,
and reality grades every bet. Each miss rewrites the theory, so it should understand the person better in week six
than in week one, and teach them better because of it.

Four sub-hypotheses, each with the families it tests and the result that would prove it wrong:

| | Hypothesis | Families | Wrong if |
|---|---|---|---|
| **H1 Seeing** | What a person knows, feels and hides shows in ordinary interaction | A B C D | Its reading predicts what they do a week later no better than asking them |
| **H2 Acting** | Writing a belief before each move turns inference into action | B G | Moves fit the person no better, judged blind |
| **H3 Trusting** | Continuity and a steady self make people reveal more | C E F | Admitted confusion doesn't rise with memory switched on |
| **H4 Growing** | Accuracy about each person rises with time, in every family | A–E, G | The hit rate stays flat, or plain memory keeps pace |

**The headline measurement** ("Does it get better at you?"): the share of the AI's written predictions about a person
that came true, plotted per week. Three lines:
- **Vyakti**: should rise week after week.
- **The same model with plain memory** (no theory, no ledger): the baseline that must be beaten.
- **The learner's own judgement** ("will you solve this next week?"): expected to stay low (~.27 calibration).

Example bets, one per family: (A) solves a new comparison problem next week; (B) a number line will beat a pie chart
for her; (C) this struggle will resolve within a few turns; (D) her quick "okay" after a pause means lost;
(E) she will admit confusion unprompted this week.

---

## 6. The living theory of the person

Vyakti keeps a written theory of each person, in its own words. It is not a profile and not a memory dump.

**Every belief has:**
- the claim, in plain language ("holds a hidden rule: a bigger bottom number means a bigger fraction");
- the family and dimension it belongs to;
- its **evidence**: what was observed, with pointers to the turns;
- a **confidence** that moves with each interaction;
- a **last confirmed** time, so it **decays** if nothing re-confirms it;
- its **history**: when a belief is contradicted it is rewritten, and the old version plus the reason are kept.

**Four rules (shown on the proposal site):**
1. **Evidence, not impressions.** Every belief cites what it saw.
2. **Confidence that moves.** Each interaction nudges it up or down.
3. **Fades without fresh proof.** Old beliefs decay unless retested.
4. **Yours to read and correct.** The person (or a parent) can see it, fix it, delete it.

Consequence: no belief can harden into a label. "Pie charts don't work for her", untested for three weeks, fades on its
own.

**The prediction ledger.** Separate from the theory: every bet the system makes, with its probability, its due date
and, later, its outcome (came true / missed / still open). The ledger is what makes H4 measurable and what the
overnight Reflector scores. A missed bet must rewrite the belief that produced it.

**Worked example (Meher, illustrative learner, from the site):**

| Moment | A Knows | B Learns | C Feels | D Talks | E Relates | Bets |
|---|---|---|---|---|---|---|
| Session 1 | Gets procedures right; unclear if she understands why (30%) | No evidence yet (10%) | Quiet after corrections: thinking or upset? (30%) | Agrees quickly; switches language when unsure (45%) | New; polite and formal (20%) | Solves a fresh comparison in 7 days: 60%, open |
| Session 4 | Hidden rule: bigger bottom number = bigger fraction, seen twice (65%) | Number line worked, pie chart didn't, one example each (40%) | | Quick agreement after a long pause came before both wrong answers (60%) | | First bet **missed** → "her quick agreement means comfort, not understanding" |
| Week 2 | Rule seen four times; procedure fine, idea underneath isn't (80%) | Number lines land, 2 of 2 (70%) | Quiet after correction = stuck; a short break helps (70%) | | Her first "I don't get it" came right after the AI admitted a mistake of its own (55%) | Places 3/8 on a number line: **came true** |
| Week 5 | Explains why 3/5 > 3/8 in her own words; solved one hidden in a decimals lesson (85%) | Learns best predicting first, then checking (75%) | Struggle now productive; asks for a hint before giving up (70%) | Fewer quick agreements; says when lost (80%) | Jokes; admits confusion on her own several times a week (80%) | "Admits confusion unprompted": **came true**. "Pie charts don't work": **fading** |

---

## 7. How "did they understand?" is actually decided

This is the core technical problem. Rules, in priority order. Confidence labels are from Taxila's research review.

### 7.1 Evidence rules
1. **Never use self-report as evidence.** "Samjha? / Do you understand?" is not a decision point. If asked
   conversationally, ignore the answer and follow with a real probe. (High)
2. **"Mastered" needs three kinds of evidence:** (a) a correct independent attempt, no hints; (b) a generative or
   transfer probe passed (an explanation covering the expected points, a "why?" after a correct answer, or a
   near-transfer variant); (c) **delayed retrieval success in a later session**. Before (c) the state is
   "learned today", not "mastered". (High)
3. **After a correct answer, ask a cheap "why/how" on a schedule:** always for new concepts, sampled (30–50%) for
   consolidating ones. A correct answer with a wrong explanation is a **misconception flag**, not a success. (High)
4. **A model never grades a closed item.** Closed answers are classified against **verified answer keys** in code.
   LLMs label turns (skill, correctness, misconception id) and write summaries; they do not decide mastery. (High)
5. **The mastery ledger is a small interpretable model per skill**: BKT with forgetting, or Elo/IRT, with FSRS-style
   retrievability for scheduling. Knowledge tracing beats LLMs at prediction on structured data (Bhattacharyya et al.,
   2026). LLM turn labels must reach κ ≥ 0.7 against human raters on Indian child transcripts before being trusted
   (our target). (High)
6. **Restrict misconception labels per item.** Each item carries its own small set of known misconceptions. The best
   misconception classifiers in the world win this way; a general "misconception detector" fails silently on new
   items (Kaggle MAP / Eedi). Harvest per-item sets from real NCERT turns. (High)
7. **Paralinguistic signals (latency, fillers, hedges) are tie-breakers and triggers only.** They are normalised per
   child and question type, turns with low speech-recognition confidence are excluded, and their update is capped. They may
   trigger a probe, soften a hint or slow down; they may not move mastery by more than a small calibrated amount or
   label a child. Hinglish discourse markers ("matlab", "haan haan") are not automatically uncertainty. (High as a
   constraint)
8. **Abstain explicitly.** When the evidence disagrees or is thin, the state is `uncertain`, which triggers one more
   probe. Parents see "still checking", not a guess. Deferring the 20% most uncertain predictions raises accuracy
   2.3–3.0 points, and deferred cases are wrong 1.45–1.6× as often (Mitton et al., 2026). (High)
9. **Low speech-recognition confidence = no evidence.** Re-ask, rephrase or switch to tap-to-answer. Never score an uncertain
   transcript as wrong.
10. **Gaming and inattention discount everything else** in that window (rapid guesses, "just tell me", hint spam).

### 7.2 The probe catalogue (how understanding is read without a quiz)

Reliability = validity as evidence of durable understanding, from the literature, **not yet calibrated on our data**.
Starting likelihood-ratio bands: High ≈ 3–10, Medium ≈ 1.5–3, Low ≈ 1.1–1.5. Ages: ● good fit, ◐ adapt, ○ avoid.

| # | Probe | How it runs | Reliability | 6–9 | 10–15 |
|---|---|---|---|---|---|
| P1 | Teach-back to a protégé | Announced at the start ("you'll teach this to Gappu"); child explains to a character who doesn't know; character asks one naive follow-up | High | ◐ | ● |
| P2 | "Why/how?" after a correct answer | One short follow-up | High | ◐ (choice form) | ● |
| P3 | Near-transfer variant | Same structure, new surface, ideally the child's interest | High | ● | ● |
| P4 | Real-life application | Market, cricket, cooking | High if passed; ambiguous if failed | ◐ | ● |
| P5 | Predict-before-reveal | "What will happen if…?", then reveal, then "why the difference?" | Medium-High | ◐ | ● |
| P6 | Teacher's planted mistake | One error typical of a known misconception; always resolved; only after basic mastery | Medium-High | ○/◐ | ● |
| P7 | Spoken diagnostic choice | 2–3 options, each wrong one mapped to a misconception | High for which misconception | ● | ● |
| P8 | Contrasting cases | "These two look alike; what's different?" | Medium-High | ● | ● |
| P9 | "Which method?" | Choose the strategy before solving, on mixed problems | High (maths) | ◐ | ● |
| P10 | **Delayed retrieval** | Next session, unannounced, re-ask a key item or variant | **Highest** | ● | ● |
| P11 | "Main idea in a few words", delayed | "Tell me yesterday's big idea in one line" | Medium-High | ◐ | ● |
| P12 | Confidence bet | "A little sure or very sure?" before feedback | Low/Medium as evidence; high as a learning move | ◐ | ● |
| P13 | Reverse problem | Give the answer; ask for a question that produces it | Medium-High | ○/◐ | ● |
| P14 | Representation translation | Words ↔ numbers ↔ number line ↔ story | Medium-High | ● | ● |
| P15 | Hint-ladder consumption | Passive: pumps, hints, prompts needed | High (as a tracing input) | ● | ● |
| P16 | Self-correction in a turn | Passive | Medium | ● | ● |
| P17 | Child-initiated questions | Passive, occasionally invited | Medium | ○ | ◐ |
| P18 | Response onset latency | Passive; normalised per child × item type × language | Low | ◐ | ◐ |
| P19 | Disfluency and hedges ("shayad", "I think") | Passive | Low-Medium | ◐ | ◐ |
| P20 | "Pata nahi" / silence / minimal-answer loops | Passive, over 3+ turns | Medium (for confusion → frustration) | ● | ● |
| P21 | Wheel-spinning detector | No 3-in-a-row within ~10 opportunities | High (as a "change approach" trigger) | ● | ● |
| P22 | Gaming detector | Rapid guesses, "just tell me" | Medium | ● | ● |
| P23 | Instruction paraphrase | "Tell me what we're about to do" | Medium | ● | ◐ |
| P24 | Unprompted connection | Passive: "this is like…" | High when present | ◐ | ● |

**Never evidence:** "Do you understand?"; a single correct recall answer alone; output of an acoustic emotion
classifier; an immediate self-rating of learning; time on task.

### 7.3 Fusion rules
1. **Evidence accumulates; single cues never decide.** Mastery is a probability; each probe updates it by its
   likelihood ratio; passive signals are capped small.
2. **Base rates matter.** Rare-event detectors (hidden misconceptions, affect) mostly produce false alarms at real
   prevalence (8:1 in Eedi's hidden-misconception data). A detector **triggers a verifying probe**; it never acts directly.
3. **Probe budget.** Probes cost time and, overused, feel like an interrogation. Starting policy: one generative or
   transfer probe per concept; "why?" on 30–50% of correct answers for consolidating skills and 100% for new ones;
   2–4 delayed retrieval items at each session start; passive signals are free.
4. **Calibrate against observable truth.** Every probe's likelihood ratio is re-estimated against **delayed** items (P10)
   and periodic external benchmark items, per age band and language mix.

### 7.4 Knowledge states
`unseen → introduced → practising → learned-today → mastered (needs delayed success) → due-for-review`, plus misconception
flags `{misconceptionId, evidenceCount, lastSeen, resolved}`. A plain-language summary is regenerated **from** the numeric
state for parents and for the tutor's context. It is never the source of truth.

### 7.5 The research advance: Epistemic Speech Evidence (ESE)
No published system produces a calibrated, per-child, voice-native estimate of understanding. Taxila has all the inputs
at once: always-voice lessons, code-graded evidence, and a scheduler that places delayed and transfer checks.

1. **Labels for free, from the future.** Every graded answer at time t is later followed by a delayed or transfer check
   on the same skill. The pair (answer + speech features at t, delayed result later) trains
   P(delayed success | correct now, speech features now, mastery estimate now). No human labelling, no emotion label: the
   target is a future knowledge outcome.
2. **Features, all epistemic and measured in code:** onset latency z-score (within child, within item-difficulty band);
   self-repair toward the correct answer; "pata nahi" (not known) vs "yaad nahi" (not recalled); hedges on correct
   answers; speech-recognition confidence. **No pitch or energy features** (too close to emotion recognition; see §11).
3. **Model:** a hierarchical logistic model (population effects + a per-child intercept and latency slope), fitted
   offline. Its only output is a likelihood-ratio multiplier on the existing evidence, **clamped to [0.9, 1.1]**.
4. **Abstention on top:** when the multiplier and the ledger disagree, the skill becomes `uncertain` and gets one probe.
   Voice buys a better-placed probe, never a mastery jump.
5. **Kill conditions:** if the gain in AUC on delayed items is under 0.03 after two monthly fits, archive it and publish
   the null result. If the effect differs by home language or speech difference by more than 0.02 AUC, remove those
   features for everyone.

---

## 8. Psychology the system is built on

Each principle is what the design does with a finding.

| Principle | Finding | What the system does |
|---|---|---|
| Confusion hides | Classroom: ~1 question per 9 hours vs ~26/hour one-to-one (Graesser & Person 1994) | Makes "I don't get it" cheap and safe to say; never relies on the child volunteering it |
| Self-judgement is poor | Calibration ~.27 (Dunlosky & Lipko 2007); children are overconfident | Never trusts self-report; uses the confidence bet as a learning move, not as evidence |
| Productive vs stuck struggle | Confusion helps only if resolved (D'Mello 2012/2014) | Lets confusion run on a timer (2–3 failed hint steps), then escalates support; detects wheel-spinning and changes approach |
| Help avoidance / fear of looking stupid | Well documented in people | Models the person's admitted-confusion rate as a trust signal (dim. 11, 15); the AI admits its own mistakes, which preceded Meher's first "I don't get it" |
| Psychological safety and alliance | Edmondson 1999; Flückiger 2018 (r ≈ .28) | Continuity, memory and one steady personality are treated as measurement infrastructure |
| Learning by teaching | Teach-back with announced expectancy g ≈ 0.48 vs ≈ −0.02 without (Kobayashi 2019/2024) | Announces the protégé ("you'll teach Gappu") at the start; grades the teach-back against expected points |
| Prediction error | Predict-before-reveal (Brod 2018/2020/2021) | Logs the prediction as evidence of the prior model; always resolves the conflict |
| Error detection | Planted mistakes help after basic mastery (Große & Renkl 2007) | Plants one typical error only after mastery; always resolves it; never for novices |
| Expertise reversal | Novices need worked examples; experienced learners benefit from attempting first | Worked → faded example for novices; attempt-first for experienced learners; gated by the knowledge model, not by time |
| No learning styles | Matching instruction to "styles" fails (Pashler 2008 and later) | Never labels a child; measures which **teaching formats** produce **delayed** success per topic type, shrunk toward the population (§8.1) |
| Interest personalisation | Retention g ≈ 0.48, transfer g ≈ 0.36 (Walkington; 2024 meta) | Puts problems in the child's world (cricket, cooking, trains), learned in conversation |
| Autonomy | Choice helps (Patall 2008) | Offers 2–4 low-stakes choices per session; never a choice between the evidence-based core and fluff |
| Rewards | Tangible rewards undermine motivation, more in children (Deci, Koestner & Ryan 1999) | Game wrappers yes; points, coins and streak-loss guilt no; celebrates real milestones informatively |
| Praise | Praise the process, not the person (Mueller & Dweck 1998) | Feedback is specific, about task and process, and true |
| Sycophancy | Models preserve the user's face ~45 points more than people (ELEPHANT) | Graded on being right, never on being liked; a planted-mistake catch is graded against the key, never by agreement |
| Restraint | Unstudied one-to-one | Knowing when not to speak or bring something up is a measured dimension (19) |
| Healthy dependence | Heavy chatbot use correlates with loneliness (MIT & OpenAI 2025) | Success = independent performance without the AI; points the child outward to parents, friends, teachers |
| Children's turn-taking | Children answer ~1.5× slower and pause mid-utterance | Waits longer after questions; calibrates endpointing per age band; never reads pipeline latency as hesitation |
| Retrieval and spacing | Strong effects (Agarwal 2021; Cepeda) | Every session opens with retrieval; spacing and interleaving live in the scheduler, not the persona |

### 8.1 The learning profile (what replaces learning styles)
- **Format families** (teaching moves, not styles): F1 short explanation + on-screen anchor (default); F2 worked → faded
  example; F3 visual-first (number line, diagram, manipulative); F4 story or the child's world; F5 chant/song (only for
  verbatim sequences); F6 game wrapper; F7 learn-by-teaching; F8 attempt-first.
- **Topic types:** T1 verbatim/sequence, T2 vocabulary, T3 concepts ("why"), T4 procedures, T5 problem solving.
- **Reward for comparing formats = delayed success**, never immediate correctness (which optimises for easy and fluent).
- **Model:** hierarchical Bayesian, `logit P(delayed success) = skillDifficulty + childAbility + β[format, topic] + u[child, format, topic]`.
  The child effect `u` is shrunk toward zero; most children's `u` will stay near zero, and that is the honest expectation.
- **Allocation:** hard rules first (expertise reversal; F5 only for T1/T2; retrieval and worked examples never
  bandit-allocated), then Thompson sampling with a 10–20% uniform exploration floor, compared on matched skills. When two
  formats are close, **offer the child the choice**.
- **Parent claim threshold:** posterior ≥ 0.9 that A beats B for this child × topic type, over ≥ 8–10 delayed comparisons.
  Otherwise: "still learning what works best for this kind of topic".
- **Kill criterion (E-PROFILE):** randomise profile-driven formats against population-best formats. If profile-driven
  formats don't win on delayed retention and transfer, drop per-child format personalisation and say so.

---

## 9. The system architecture

**Principle: software made of minds, each on its own clock.** LLM-native end to end. Every judgement (what to notice,
what it means, what to do) is a model's, **written down with its reason**. **Code keeps the records, the state machine and
the grading against verified keys. Reality keeps the score.**

This reconciles two rules that look contradictory: "no hand-written decision tree" (judgement belongs to models) and
"enforce lesson structure in code" (step order, the hint ladder, when an answer may be revealed, and answer-leak checks
are code, because prompts alone could not provide reliable structure; Kestin et al.).

### 9.1 The four lanes

| Lane | Clock | Minds / stores | Job |
|---|---|---|---|
| **Live** | Every turn; small fast models | **Listener** | Notices; never concludes. Writes observations, not interpretations |
| | | **Director** | Reads the theory, states its intent before acting, picks the surface (voice, board, game, simulation, story) |
| | | **Prober** | Designs the quiet check (from the probe catalogue) |
| | | **Maker** | Builds what the moment needs, live (a game on her exact mistake, a number line) |
| | | **Voice** | Speaks in one steady personality, inside the pause |
| **Held** | Read before every move; written by models | **Prediction ledger** | Every bet, with probability and due date |
| | | **Theory of the person** | Beliefs · evidence · confidence · history (§6) |
| | | **Self** | Who the AI is with this person: personality, commitments, shared history |
| **Overnight** | Strong models, judged by reality | **Reality** | What the person actually did next (delayed checks, return, admitted confusion) |
| | | **Reflector** | Scores due bets, rewrites the theory, keeps the reasons |
| | | **Dreamer** | Rehearses upcoming moves with a simulated version of the person (never cited as evidence) |
| **Weekly, then later** | Across all learners | **Playbook evolver** | Tests which patterns predict people better across learners; every teacher inherits what works |
| | | **Self keeper** | Growth without drift: checks the personality stays recognisably itself |
| | | **Weights (later)** | A model that has learned this person, owned, readable and deletable by them |

### 9.2 One moment, slowed down
1. **Listener:** notices a 3-second pause, then quick agreement with no words of her own. Writes what it saw, not a conclusion.
2. **Theory of the person:** this pattern came before her last two wrong answers. Belief: comfort, not understanding, 70%.
3. **Director + Self:** states its intent before acting ("check quietly, don't quiz"). Picks the surface: a game where a
   puppet makes her mistake.
4. **Prober + Maker:** design the check and build it live while the conversation continues.
5. **Voice:** speaks in the same warm, steady personality she knows, inside the pause.
6. **Reality + Ledger:** she sides with the puppet, so the wrong idea is confirmed in her own words. A new bet goes in the
   ledger, due in seven days.
7. **Reflector → Playbook evolver:** overnight her theory is rewritten; weekly, the pattern is tested across learners.

### 9.3 Design laws (measured in the Maya product; ignore at your peril)
- **Write the belief before the move.** Inference without a written belief is not acted on (SimpleToM: 15–50%). The
  Director must name the belief it is acting on; the move is later judged against it (dimension 24).
- **Sentence-shaped prompt text gets recited.** Write shapes and notes in prompts, never lines the AI could say
  (Maya: recitation fell from 4/5 to 0 after removing example quotes).
- **Position is mechanism.** A rule buried mid-prompt fired 0/8 times; the same rule placed last fired 8/8. Rules that must
  fire go last.
- **Truncation is silent.** A budget gate must throw before an assembled prompt exceeds its cap; truncation eats the end,
  where the newest and most safety-relevant text sits.
- **Safety by predicate, not instruction.** Crisis detection, answer-leak checks and "never deny being an AI" are enforced
  in code and tested, not only requested in prompts.
- **A model never grades a closed item.** Classify against verified keys (Taxila's kits are blind-solved).
- **Identity is an authenticated child id, never a device.** A shared family phone has several children.
- **Measure, don't reason.** Several obviously-good ideas in this codebase turned out measurably wrong. Read
  `context/rejected.md` in each repo before proposing something "obvious".

### 9.4 Senses in, surfaces out
**In (with consent):** voice, words, hands (what she writes or erases), screen (where she is stuck, for how long), and time
(what she skips over days). Each signal alone is a hint; together they are evidence. Example verdict: 3 seconds of silence then a
quick "got it" + "okay, makes sense" with no words of her own + erased her first answer + stuck on step 3 for 40 seconds
+ skipped decimals twice = **probably lost; plan a quiet check, not a quiz.**

**Out:** the Director picks the surface the way it picks words: voice only (walking home, eyes busy), a board drawn live
(number lines land for her), a game on her mistake (catching it feels safe), a simulation (she moves the pieces), her
world (she loves cricket).

---

## 10. Beyond one subject and one learner

- **Learning anything.** The answer key changes by subject; the person doesn't. What travels with the person: how they
  learn best, what they avoid, stuck vs thinking, what they care about, how they talk, how much they trust. From fractions
  to French, code to chemistry, a child's homework to an adult's new career.
- **A class of forty.** Every student gets their own theory. The teacher finally sees the room: who is lost, who could
  explain it to whom, which idea broke for half the class.
- **A common friend.** One identity, separate relationships. What you tell it stays with you; it bridges only with
  permission. Privacy is enforced by structure (before retrieval), not by asking the model to behave.
- **The community brain.** What it learns about how people learn flows into a shared playbook every teacher inherits.
  What it learns about you stays yours.
- **Order of domains:** learning first; then mentors, companions, elder care and health, widening only as the evidence does.

## 11. Built for the models that are coming

1. **When thinking is almost free:** attention per person, not model size; a hundred thoughts on every sentence.
2. **When models answer instantly:** real-time theory of mind fits inside a pause; it becomes part of every voice agent.
3. **When models learn continually:** the theory becomes weights. The person should own, read and delete it.
4. **When systems improve themselves:** a reward that can't be faked, namely whether a real person later does what was
   predicted. Optimise for growth, never engagement.
5. **When intelligence is general:** the last mile is one person. An AGI aligned with humanity still has to be aligned
   with this child, today, in this mood.

---

## 12. The research programme

One hard question: **can an AI measurably get to know a person?**

| # | Question | Dimensions | What would answer it |
|---|---|---|---|
| 01 | Can understanding be read without testing? From conversation, voice and behaviour alone, does the reading of a learner predict a fresh problem a week later? | 1, 2, 3, 12, 13 | Calibration of the "understood" call against delayed and transfer items, vs asking the learner |
| 02 | Does a living theory beat memory? | 5, 24, 25 | Prediction hit rate and calibration: theory + ledger vs the same model with plain memory |
| 03 | Is trust a sensor? Do continuity and a steady personality make people reveal more? | 11, 15, 21 | Admitted-confusion rate with memory/persona on vs off |
| 04 | Can it improve itself from its misses? | G (24, 25) | Accuracy on **new** people after the playbook rewrites itself from wrong predictions |

**What will exist at the end:**
- **The Vyakti layer:** an open, LLM-native architecture any agent can use.
- **"Does it know you?":** an evaluation that scores an AI's beliefs about a person against what the person later does.
- **Living theories:** real learners' theories evolving over weeks, shared with consent.
- **The write-up:** what worked, what broke and why, failures first. Every prediction and every miss is logged in the open.

### 12.1 The "Does it know you?" metric (define it exactly before building)
- **Unit:** a written prediction with a probability, a due date, the family/dimension, the evidence it was based on, and an
  objectively checkable outcome.
- **Scores:** hit rate per week; **calibration** (Brier score and expected calibration error); discrimination (AUC);
  deferral error ratio (are abstained cases really harder?).
- **Baselines:** the same base model with plain memory (no theory, no ledger); the learner's own prediction; a
  population-only model (no per-person information).
- **Hygiene:** predictions are frozen at write time; outcomes are graded by code against keys; splits are time-ordered
  and held out by child; no simulated students quoted as learner evidence.

### 12.2 Measurement backlog (first experiments)

| id | Question | Method |
|---|---|---|
| E1 | Speech-recognition word error rate and endpointing on Indian children's Hindi/English/Hinglish, by age band | ~50–100 consented children; hand transcription; error and cut-off rates by age, language mix, noise |
| E2 | Does LLM grading of teach-back and "why?" answers agree with expert teachers? | 300+ explanations, two teacher raters, κ against the LLM using the expectation/misconception rubric |
| E3 | Are latency and disfluency valid predictors in our pipeline? | Logistic model of correctness on normalised latency/disfluency, controlling for difficulty and recognition confidence |
| E4 | Best spoken-segment length and wait time per age band | Within-child micro-RCT; immediate and delayed recall |
| E5 | Teach-back with announced expectancy vs none | Micro-RCT on delayed retention |
| E6 | E-PROFILE (§8.1) | Preregistered RCT; kill criterion set in advance |
| E7 | Relationship-health indicators (attachment talk, disclosures, session-length creep, late-night use) | Aggregate monitoring; flagged transcripts reviewed with a child-safeguarding advisor |
| E8 | Placement accuracy vs an ASER-style oral test | 100+ children |
| WB-M1 | "Pata nahi" vs "yaad nahi": does recognition succeed more after "not recalled"? | ≥ 200 events per class band |
| WB-M2 | Are abstained ("uncertain") claims really wrong more often? | Delayed-probe error ratio |

**Every result is logged with n, method and date. Every rejected idea is logged with what specifically broke.**

---

## 13. Guardrails (product, not compliance; they never move)

- **Always says it is an AI.** Never claims to be human or to have feelings.
- **Helplines built in** (India: Childline 1098, Tele-MANAS 14416), with a tested crisis protocol and safeguarding hand-off.
- **No companion or romance behaviour with minors.** A teacher with warmth, not a friend replacement; points the child
  outward to people.
- **The person owns their theory:** they (or the parent) can read, correct, export and delete it.
- **Scored on being right, never on being liked.** Never optimise engagement.
- **Never manipulate.**
- **No acoustic emotion recognition for decisions; inferred emotions are not stored.** (Microsoft's Azure AI Code of
  Conduct restricts inferring emotional states from speech; get written confirmation before using even latency-based
  knowledge inference.)
- **Voice data:** transcribe, then delete audio by default; no voiceprints.
- **Parents see everything by default:** weekly evidence report, transcripts on request, time controls, deletion.
- **India DPDP:** verifiable parental consent, data minimisation, no advertising; get a legal opinion on section 9(3)
  before shipping the cross-session learning profile.

## 14. Anti-patterns (what the field learned the hard way)

- Trusting "Do you understand?".
- Quoting benchmarks built on simulated students as learner evidence.
- Deploying a general misconception detector to new items (it fails silently).
- Using LLM-coded engagement or ICAP labels as a learner state (κ 0.59–0.66, errors concentrated in the middle levels).
- Letting an LLM estimate item discrimination (ρ ≈ 0.23).
- Acting on uncertain predictions with full confidence.
- Carrying grader-confusion corrections across model versions; pin the grader and re-run calibration on every model swap.
- Leaky knowledge-tracing evaluation (unsorted timestamps, multi-skill label leaks).
- Treating "confusion from voice" as allowed because it sounds cognitive.
- Rewarding immediate correctness when choosing formats.
- Labelling children ("visual learner"), in any layer.

## 15. Glossary
- **Belief:** a claim about the person with evidence, confidence, last-confirmed time and history.
- **Bet / prediction:** a belief turned into a checkable statement with a probability and due date.
- **Ledger:** the store of bets and their outcomes.
- **Ground truth:** the later, objective observation that grades a bet (delayed problem, return, admitted confusion).
- **Delayed retrieval:** an unannounced re-check of a skill in a later session; the gold-standard evidence.
- **Transfer:** using the idea in a new surface or context.
- **Abstention / `uncertain`:** the system declines to claim and schedules a probe instead.
- **Likelihood ratio (LR):** how much one piece of evidence should move the mastery probability.
- **BKT / IRT / FSRS:** standard knowledge-tracing, item-response and spaced-repetition models.
- **Protégé:** the character the child teaches (e.g. Gappu); turns teach-back into the main end-of-concept probe.

## 16. Source files
- Proposal site (canonical narrative and data): `vyakti-website/sites/lossfunk/index.html`, `app.js` (the 25 dimensions in
  `DIMS`, Meher's theory in `theory()`, the "one moment" walkthrough in the stepper).
- Taxila learning science, rules and probe catalogue: `Taxila/docs/research/learning-science.md` (§6–§9).
- Taxila understanding-detection frontier and ESE: `Taxila/docs/research/world-best/understanding-detection.md`.
- Taxila learner model and comprehension engine: `Taxila/docs/research/learner/*`, `Taxila/docs/research/comprehension/*`.
- Measured lessons from Maya (what failed, and why): `html-portfolio/context/rejected.md`, `decisions.md`, `measurements.md`.
- Full citations used on the site: the Sources list at the bottom of lossfunk.vyakti.ai.
