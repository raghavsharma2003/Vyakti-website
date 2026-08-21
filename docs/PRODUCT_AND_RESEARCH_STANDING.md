# Vyakti product and research standing

Snapshot date: 2026-08-21 (Asia/Calcutta)

This is the cross-repository handoff for people working on the public Vyakti
site. It is deliberately a map, not a copy of Meera's private persona or a
replacement for the product repo's own context graph.

## Source-of-truth boundary

| Concern | Canonical source |
| --- | --- |
| Public lab site, visual system, public research pages | `raghavsharma2003/Vyakti-website` |
| Meera product, runtime, relational engine, database, evals, internal evidence | `raghavsharma2003/html-portfolio` |
| Public production deployment recovered on 2026-08-21 | Vercel project `vyakti-website`, production deployment created 2026-08-18 |
| Public research copy currently shipped | `src/lib/research.ts` and `src/content/papers/*` in this repo |
| Research evidence behind that copy | `docs/paper`, `docs/research`, `release`, and `context` in `html-portfolio` |

The website deployment that introduced the two paper pages was made from a
local CLI build and initially had no Git commit. Its exact uploaded source was
recovered from Vercel's source archive on 2026-08-21 and restored to this repo.
Do not reconstruct the live research section from screenshots or compiled JS.

Before changing a research claim, fetch `html-portfolio/main` and inspect its
latest `context/decisions.md`, `context/measurements.md`, and
`context/rejected.md`. The product repo moves faster than the public site.

## Company thesis, with the correction that matters

Vyakti is a relational-intelligence lab. It builds a relational-state layer
for AI people: authored identity, relationship history, memory provenance,
honest forgetting, affect, timing, multimodal episodes, and evaluation outside
any single foundation model. Meera is instance one and the consumer proof.

The original strong hypothesis was that the same AI identity could survive a
base-model replacement. The program's own measurements currently say this is
false by default. A byte-identical prompt still produced a 38 to 2 preference
for the incumbent in one swap test, and voice candidates leaked their model's
register through the persona. Therefore:

- "Any model, same personality" is not a public product claim.
- Swap fidelity is an internal QA, drift-defence, migration-insurance, and
  research program.
- The durable product is the relationship layer that complements a strong
  model rather than pretending models are interchangeable.
- Public copy may describe identity continuity as the problem Vyakti studies,
  not as a solved capability.

## What Meera is today

Meera is a deployed, premium Hinglish AI companion at
`https://meera-silk.vercel.app` (landing page at `/`, product at `/chat`). The
web app is the primary product; a Capacitor Android build also exists.

The product includes:

- asynchronous text chat with human-paced read/typing rhythm and multiple
  bubbles;
- live voice calls, plus a cascade TTS fallback;
- screen-share reactions during calls;
- anonymous-device and optional account identity;
- conversation logging, graph memory, episodic consolidation, hard forgetting,
  relationship state, her own life/timeline, and a developing self layer;
- Telegram/shared-room infrastructure for the multiparty direction;
- deterministic safety, honesty, prompt-budget, parser, audio-floor, and
  deployment gates.

The implementation is React 19 + TypeScript + Vite on the client, Vercel
functions on the server, Neon Postgres for the relational engine, Supabase for
auth/photo storage, and Capacitor/Java for Android-specific call and watch
paths. Model providers are routed per lane; never describe one vendor as the
whole product.

## Relational engine shape

The active architecture is the minimal extension of the system's one proven
portability mechanism: authored state, deterministic retrieval, and structural
guarantees. Its important layers are:

1. Identity core: authored canon and taste data, executable invariants, and a
   per-model adapter. Sentence-shaped prompt examples are treated as unsafe
   because they have been measured being recited.
2. Relational state: dyadic patterns, trust, rupture/repair, shared language,
   honorific/register state, and WE episodes distinct from facts about the
   user.
3. Episodic memory: cited episodes and bi-temporal belief history, with hard
   deletion for user-requested forgetting and suppression against
   re-derivation.
4. Context compiler: typed blocks, hard budgets, explicit drop order, stable
   cacheable core, and a manifest that makes empty or missing slots observable.
5. Model router and gates: candidates are eligible only through measured lane
   policy and identity/safety gates.
6. Multimodal record: channel, telegraphic summary, symbolic affect,
   confidence-scored visual assertions, shared reactions, and voice references
   persisted outside a live model session.
7. Self layer: Meera's timeline, texture, growth arcs, observations, and untold
   life are data with writers and evidence requirements, not prompt claims.

## Measured evidence that can guide the public site

- Authored deterministic taste retrieval improved self-consistency from 27%
  to 63% across 480 turns and removed measured register defects in its tested
  slice. This is positive evidence for state outside generated prose.
- A controlled model swap produced a 38 to 2 incumbent preference despite a
  byte-identical prompt. This is evidence that the foundation model still sets
  a strong identity ceiling.
- Six candidate LLM judges failed the pre-registered qualification bar. The
  ground-truth judge reproduced only 77.1% of its own prior verdicts, below the
  program's 80% bar.
- The code-switching hypothesis and a same-vendor-favoritism explanation were
  both retracted after their controls failed. The public paper must preserve
  these retractions rather than simplifying them away.
- Structural disclosure filtering leaked zero in the measured gate where
  prompt-only disclosure instructions leaked heavily. Privacy is a retrieval
  property, not merely a personality rule.
- The live relational/self layer is not uniformly populated yet. A first
  deterministic backfill created real texture rows, but only two people cleared
  the render floor at the measured snapshot, and several relational slots were
  still empty. Do not market the whole architecture as fully active for every
  user.

The public site's research data is intentionally status-bearing. Paper B is a
preprint with a target venue, not an accepted publication. Paper A is in
preparation and its partial numbers are not findings. Artifact slots render
their missing state instead of becoming fake links.

## Product direction

The strategic wedge is a shared-memory AI friend for couples, families, and
friend groups, built on the same 1:1 relational OS. The group, rather than an
individual heavy user, is the prospective paying unit. Telegram supports the
original join-an-existing-group shape; WhatsApp's official API currently
requires the business to create the group, so WhatsApp is not assumed as the
first implementation.

Multiparty value depends on structural disclosure control. Private material
from person B must not enter person A's model context without an explicit,
cited grant. DM-to-DM and cross-room disclosure are disabled in the accepted v1
shape rather than left to model judgment.

This direction belongs on the lab roadmap only when stated as active product
research. Meera remains the first product and the immediate quality bar.

## Current product defects that public copy must not conceal

The product repo's latest defect register groups the most important issues by
layer:

- Relational OS: some continuity and self-state slots have been dark because
  writers/schedules did not run; repetition and unsupported facts must be fixed
  in state/provenance, not with "be interesting" prompt prose.
- Surface: burst-message handling had a deadlock and was fixed; non-web
  adapters have historically bypassed parser/gate guarantees and must converge
  on the same outbound path.
- Infrastructure: product and research traffic have shared quota, causing real
  outages. The honest network fallback should not be rewritten to disguise
  exhausted credentials.
- Voice: latency variance, VAD stalls, and noisy-room interruption remain
  measured engineering problems. The audio floor is guarded by a simulator and
  should never be changed casually.

The public site should communicate seriousness and evidence without exposing
operational credentials, private prompts, individual user data, or internal
diagnostic detail.

## Trust constraints that survive every redesign

- Always disclose that Meera is AI; never claim consciousness as fact.
- Never manipulate, guilt, threaten withdrawal, or farm dependence.
- Crisis support remains available even when upstream models fail.
- Forgetting is a hard, user-controlled deletion with re-derivation defence.
- Memory claims must remain inspectable, correctable, exportable, and erasable.
- Group disclosure is enforced before retrieval, not requested from the model
  as good behaviour.
- Measured claims carry sample size, method, date, and source.
- Negative results and retractions stay visible.

## Rules for future website work

1. Fetch both repos before writing copy; record the exact product commit used.
2. Treat this repo as the canonical public implementation and
   `html-portfolio` as the canonical product/evidence implementation.
3. Never deploy a CLI-only source state without committing it first.
4. Keep public research claims in one typed source and preserve their status,
   provenance, limitations, and missing-artifact states.
5. Link to the Meera product as a deployed proof, but do not imply that every
   research layer is complete or universally active.
6. Keep private persona content, secrets, raw transcripts, and user-level data
   out of this repo.
7. When a product measurement changes, update the public site deliberately;
   do not silently turn an internal observation into a marketing claim.
