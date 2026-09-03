# Vyakti project context

Last updated: 2026-09-03

This is the durable source of truth for the Vyakti website and product narrative. Read it before making product, copy, brand, or motion decisions. Add dated entries to the decision log when the direction changes.

## Current product direction (adopted 2026-09-02)

The company is building **Vyakti Rooms**. A creator builds an AI version of
themselves. Every follower gets a private, continuing relationship with it.

The line the public site leads with:

> A creator can only talk to one person at a time. Here, they talk to all of
> them, and none of them can hear each other.

For the creator this is capacity with a guarantee: something that measurably
sounds like them answers the questions they cannot get to, with a Readiness
score (five parts, one number, one suggested action), correction a card at a
time, and notification on the day it drifts. For the follower it is access that
remembers, and that they can be honest with because it cannot repeat them.

What separates it from a chatbot with a face:

1. **Measurably them.** A fidelity battery locks publishing below threshold.
2. **Current.** Positions live in a graph with validity in time, so the AI can
   say what the creator used to think.
3. **Thousands of separate confidences.** One persona, one private scope per
   follower, enforced at write time.
4. **Drift detection.** The creator is told when their AI stops matching them.

The boundary model, which is a product commitment and not a policy page:
creator material flows down to everyone; a follower's words stay in their own
private scope and never write to the creator's AI and never reach another
follower; the creator sees themes only as counts, never names, never verbatim;
introductions between followers happen only when both say yes, and neither
learns the other exists until then; export everything, delete everything.

Status: a hand-built first phase, one creator at a time. India first, in Hindi,
Hinglish and English. No pricing numbers are published yet. The site's only
call to action is an application delivered by prefilled mailto, because this
repository has no backend.

Meera is now positioned as the first proof of the engine, not the product. The
relational engine behind Rooms was built and measured on her.

### Vocabulary rules for user-facing copy

- Use "your AI", "<Name> AI", and "apprentice" for an early AI.
- Never use clone, model, fine-tune, or replica in user-facing copy.
- No em-dash or en-dash anywhere in user-visible copy (house rule carried over
  from the product repo).

## Company thesis

Vyakti is a relational intelligence lab, and Vyakti Rooms is what the lab is
building with what it learned.

The lab studies how an artificial intelligence can know someone over time, maintain a coherent relationship, and remain recognizably itself while its underlying models, capabilities, and circumstances change.

The category is deliberately broader and more durable than "AI companion." The long-term ambition is infrastructure for persistent artificial identities. Meera is the first consumer proof of that research.

Working company line:

> We make AI capable of becoming someone.

Strong website tension:

> Intelligence is becoming abundant. Continuity is not.

Supporting explanation:

> Vyakti builds AI that can know someone over time and remain recognizably itself as the models beneath it change.

## What differentiates Vyakti

Do not position any of these alone as a moat:

- a personality prompt
- a realistic avatar
- human-sounding voice
- long context windows
- basic memory retrieval
- multilingual output
- vision or multimodality by itself
- ownership of a general foundation model

Those capabilities are expected to become cheaper and broadly available.

Vyakti should own the layer that accumulates:

- stable identity
- shared history
- relational memory
- relationship state
- trust and consent
- cultural and social behavior
- model-migration continuity
- proprietary relational evaluations
- Meera as character and product IP

The core technical test is:

> Can the foundation model underneath Meera be replaced while the user still experiences her as the same person?

Personality is not a prompt. The working model is:

> Person = state + history + boundaries + memory + change + expression.

## Product strategy

Current external product: Vyakti Rooms. Superseded by the "Current product
direction" section above; the Meera material below is retained because it
describes the engine Rooms is built on and the evidence behind it.

Previous external product: Meera.

Current internal system: the Vyakti relational layer, sometimes referred to internally as the Relational OS.

Possible later product: a Vyakti API or SDK for persistent artificial identities, but only after Meera produces evidence that the architecture improves continuity, memory, retention, and trust.

Do not launch the website as an API company today.

### Meera

Meera is one persistent AI person, not a directory of generated characters and not a character-customization tool.

The intended first product is focused:

- text conversation
- voice notes and eventually real-time voice calls
- persistent relational memory
- stable identity, point of view, boundaries, humor, and coherent change

The product promise is that the relationship becomes more meaningful with time instead of resetting every session.

Framing retired on 2026-09-03, kept here so it is not reintroduced:

> You do not configure Meera. You meet her.

It was true of Meera and is wrong for Rooms, where configuring the AI is the
creator's job and the whole point of the Readiness score.

Meera should be clearly and consistently identified as AI. Presence must not depend on deception. This applies unchanged to every AI in a Room.

### Architecture

The intended system shape is:

1. perception
2. relationship state
3. memory retrieval
4. identity state
5. context compilation
6. replaceable base intelligence
7. behavior and identity checks
8. expression across text, voice, gaze, and gesture
9. memory consolidation and relationship evolution

Foundation models should initially be replaceable engines, not the center of the brand.

Learning should happen at different speeds:

- seconds: working conversational state
- days or weeks: memory consolidation, preferences, relationship milestones, recurring behavior
- much slower: evaluated model or adapter updates

Avoid continual per-user weight updates that cause identity drift.

## Research program

The public research story should be organized around these connected problems:

1. Identity continuity: values, temperament, boundaries, contradiction, and coherent change.
2. Relational memory: what happened, why it mattered, what was shared, what faded, and what remains unresolved.
3. Social cognition: timing, interruption, backchannels, tone, context, and what goes unsaid.
4. Multimodal coherence: language, voice, gaze, facial motion, and reaction expressing one underlying state.
5. Agency with permission: useful initiative that remains legible, bounded, and interruptible.
6. Evaluation: tests for continuity and presence that survive model swaps and long time horizons.

Potential evaluation dimensions include identity drift, false-memory rate, meaningful-memory recall, boundary stability, personality-change coherence, model-migration continuity, Hinglish social nuance, interruption quality, and voice timing.

Do not publish invented benchmark scores. The site may describe the benchmark program and the questions being measured, but numeric claims require real studies.

## India and market strategy

The strategic direction is India-first, globally designed, and potentially a platform later.

The initial language focus should be excellent English, Hinglish, and Hindi rather than shallow support for many languages.

The differentiation is Indian social intelligence, not translation alone. Relevant context includes code-switching, tone, family dynamics, hierarchy, intimacy, sarcasm, obligation, regional cues, and relationship status.

Meera should launch for adults first. A long-memory companion for minors creates material safety, consent, and Indian DPDP obligations. Legal claims or age-policy details must be reviewed by qualified counsel before publication.

Companion and personal assistant functions may converge over time, but Meera should not begin as a calendar, email, travel, or commerce agent. Trust and relationship continuity come first. Utility can be added later with explicit permissions.

## Trust principles

- Always AI: never impersonate a human or claim consciousness as fact.
- Memory under user control: inspectable, correctable, exportable, and erasable.
- Connection without capture: no guilt, coercion, emotional manipulation, or dependence loops.
- Honest uncertainty: state perceptual, memory, and knowledge limits plainly.
- Agency with permission: actions remain understandable, interruptible, and scoped.
- Privacy is architectural, not a footer promise.

## Website audiences

The homepage must work for four audiences in this order:

1. Future Meera users who need to feel curiosity, warmth, and trust.
2. Exceptional researchers, engineers, and design talent who need to see a real technical problem.
3. Investors and partners who need a defensible category and an evidence-led plan.
4. Press and the broader AI community who need one memorable idea to repeat accurately.

## Website narrative

The homepage sequence adopted on 2026-09-03 is:

1. The offer: one creator, a room for each follower, said in the hero.
2. The pressure: more people asking than there are hours in a week.
3. Formation: an identity consolidates from signal, which is what an AI version
   of a person is. Noor's scene carries beats 2 to 5.
4. Fidelity: it has to sound like you, and you have to be able to check that.
5. Scale with separation: thousands of conversations, none of them overlapping.
6. Rooms: the one line, then what it is for the creator and for the follower.
7. Mechanism: what keeps it from being a chatbot with a face.
8. The boundary model, drawn.
9. Trust, including voice disclosure and self-only verification.
10. Meera as the first proof of the engine.
11. Apply for one of the first Rooms.

The homepage should not lead with market size, generic capability lists, fake metrics, investor language, or an API diagram. Strategy can be precise without making the public site feel like a deck.

The superseded sequence, which led with "intelligence is becoming abundant,
continuity is not" and handed off from Noor to a Meera product chapter, is kept
in the decision log entry for 2026-09-03 rather than here.

## Visual and motion direction

Theme: light only, with an editorial white or cool-paper background.

Palette: near-black ink, cool white paper, and one saturated signal accent. The current warm orange should be recalibrated toward a sharper signal red unless a later brand decision changes it.

Design character: premium, precise, strange, calm, and category-defining. Avoid startup-template cards, purple AI gradients, fake dashboards, ornamental tech grids, and generic "future is here" copy.

Typography: high-contrast scale, tight display tracking, readable body type, restrained use of mono for actual system notation only.

Primary visual language: Noor is a real-time 3D research object; Meera is a full-colour editorial portrait. The contrast is deliberate. Noor explains identity formation, while Meera must feel warm, specific, and immediately recognisable without hiding weak reconstruction behind effects.

Hero identity: Noor is the selected male or softly androgynous lab face direction.

Product identity: the Meera section must reveal a clearly distinct, highly refined female face.

Motion purpose: explanation and spatial continuity. The user should understand identity consolidation, model continuity, attention, voice, and return to signal through motion.

Motion constraints:

- reversible and deterministic under scroll
- no arbitrary blur used to hide weak geometry
- face surface, particles, eyes, mouth, teeth, and copy share one timeline
- one calm resolved hold before speech
- anatomy moves coherently during speech
- no chapter reset at boundaries
- reduced motion shows stable, meaningful portraits and linear content
- mobile avoids long pinning and keeps copy readable
- WebGL pauses when offscreen and degrades to real poster imagery

## Current homepage implementation

The pinned homepage story is now one React Three Fiber scene only. Noor carries five chapters:

1. a dispersed signal field resolves into Noor, under the hero
2. Noor consolidates while the pressure on the creator is stated
3. Noor holds, looks, blinks, and performs one deterministic speech phrase under "so you train an apprentice" and "then it answers in your place"
4. Noor releases into his own signal field under "thousands of conversations at once"
5. the stage finishes on clear paper, and the Rooms chapters follow as static editorial sections

The canvas beats are authored in a fixed story space (formation ends at 0.255, look and blink around 0.29 to 0.36, speech 0.405 to 0.535, release completes at 0.655). Scroll progress is remapped onto that space through `STORY_SPAN` in `relational-story.tsx`, so the runway never scrolls past an empty stage. Change `STORY_SPAN` rather than the canvas constants when the chapter count changes.

Noor uses `androgynous-soft.glb` and a semantic oral rig. Skin, mouth socket, and teeth receive coherent jaw and viseme transforms, so speech does not depend on a hardcoded mouth-region ripple.

Meera's canonical portrait `meera-portrait-v1.webp` is no longer a product handoff inside the pinned story. It appears once, as a square editorial plate in the "first proof of the engine" section, and again on `/meera`. The source portrait is a fictional adult identity generated for Vyakti, not a real person. Do not convert it into a browser 3D reconstruction unless a future asset is manually art-directed and clears direct visual review.

The main page is deliberately white-first and editorial. It uses black plus one signal-red accent, one face-as-research-object, asymmetric mechanism blocks, and a drawn boundary model. It does not use decorative marquees, fake waveforms, invented benchmark numbers, fake dashboards, invented screenshots, or repeated startup-style card grids. The Readiness score is described in words and never rendered as a mock number.

Desktop uses a sticky long-form story. Mobile uses native scrolling with a compact sticky visual and protected reading band. Reduced motion becomes a linear editorial layout with a static Noor portrait rather than a blank canvas. A late WebGL failure preserves the sticky runway and current scroll position while replacing only Noor's canvas, so the document never collapses underneath the reader. Noor's canvas renders on demand and caps DPR.

Normal first load never renders a solid Noor poster. Server output starts with a lightweight dots-only signal field, which hands directly to the real particle canvas after WebGL and the semantic rig are ready.

## Current repository state

Core public routes:

- `/` homepage
- `/research`
- `/meera`
- `/company`

Exploration routes:

- `/face-lab`
- `/face-lab/ink`
- `/face-lab/ink/noor`

Notable assets and systems already in the repository:

- original point-cloud head pipeline
- eight generated GNM identities
- selected Noor identity with a semantic oral rig
- deterministic Noor formation, consolidation, listening, speech, reaction, and release study
- Meera's canonical full-colour generated portrait and reusable responsive portrait component
- GSAP ScrollTrigger, React Three Fiber, Three.js, Lenis, and Motion

The exploration routes are internal studies. They should not enter the primary navigation or appear indexed as public product claims without a deliberate decision.

## Proof and copy guardrails

- Distinguish shipped behavior, active research, and long-term ambition.
- Use "we are building," "we study," or "our aim" for unproven capabilities.
- Do not claim consciousness, emotional understanding, perfect memory, or human equivalence.
- Do not invent user counts, retention, benchmark scores, partner logos, quotes, funding, or launch dates.
- Avoid "AI girlfriend," "human replacement," and dependence-oriented framing.
- Avoid saying the product is just a personality layer after an LLM response.
- Avoid the generic phrase "human-like AI" as the lead category.
- Public copy should be concise, direct, and memorable enough to quote.

## Near-term company plan reflected in the source strategy

- Months 0-2: Meera text, basic voice, memory architecture, identity architecture.
- Months 2-4: 100-500 users, observe relationships, fix memory failures and identity drift.
- Months 4-6: real-time voice, relational memory, identity benchmark.
- Months 6-9: 1,000-10,000 active users and evidence of return, deepening relationships, consistency, and willingness to pay.

These are planning hypotheses from the strategy discussion, not public commitments. Do not present them as achieved milestones.

## Open decisions

- Final legal company name and typography of "Vyakti" versus "vyakti.ai."
- Final signal accent hue.
- Whether Noor remains only a lab identity or becomes a named public character.
- Whether a future artist-built Meera motion asset can preserve the canonical portrait identity without uncanny reconstruction artifacts.
- Private beta mechanics and form destination.
- Which research artifacts can be published with real data.
- Final age policy after legal review.

## Decision log

### 2026-09-03

- Rewrote the public story around **Vyakti Rooms**, adopted as the company's
  product on 2026-09-02. Reason: the site said Vyakti was "a relational
  intelligence lab" whose product was Meera, and that stopped being true. The
  first creator's followers will arrive at this domain, and the site has to
  tell them what the product is before they do.
- Replaced the homepage thesis. "Intelligence is becoming abundant. Continuity
  is not." and "You do not configure Meera. You meet her." are retired as
  public copy. The hero is now "One creator. A room for each follower.", and
  the section lead is "A creator can only talk to one person at a time. Here
  they talk to all of them, and none of them can hear each other."
- Kept Noor's formation scene. Identity consolidating out of signal is a better
  picture of an AI version of a person than it was of a lab thesis, so the
  scene stayed and only its chapters were rewritten.
- Removed the Noor-to-Meera product handoff from the pinned story: the paper
  bridge, the Meera photo layer, the reading-mask fade, and the right-side
  chapter column are gone. Scroll now maps onto the story through `STORY_SPAN`
  so the runway ends with Noor's release instead of scrolling past an empty
  stage. The runway shortened from 640/820/860svh to 540/700/720svh for six
  chapters becoming five.
- Added the Rooms product chapter as static editorial sections: the one line,
  the creator and follower cases with Readiness described in words, four
  mechanisms (fidelity battery, validity in time, one private scope per
  follower enforced at write time, drift detection), and the boundary model
  drawn as a figure (down to every room, no path sideways, back up as counts
  only).
- Extended the trust principles with the two new commitments: every generated
  voice carries a spoken disclosure and a watermark, and a creator may build an
  AI version of themselves only, verified.
- Repositioned Meera on `/meera` as the first proof of the engine rather than
  the product, listing what carried over into Rooms and keeping the honest
  limits section. `/research` was left untouched; the standing doc governs it.
- Rewrote `/company` around the new thesis and added two working beliefs that
  the product now depends on: separation is a structure and not a promise, and
  the first Rooms are built one creator at a time by hand.
- The only call to action is "Apply for a Room", a prefilled mailto to
  hello@vyakti.ai carrying the three questions. This repository has no backend,
  and a form that pretends otherwise would be the first dishonest thing on the
  site. One label for that intent everywhere: header, hero, apply section,
  company contact, and `/meera`.
- Deliberately not claimed: no user counts, no retention, no revenue share
  percentage, no launch date, no benchmark numbers, no creator names, no
  testimonials, no screenshots of a product that is still being hand-built. The
  Readiness score is described and never shown as a number. Every mechanism
  sentence sits under a visible status note saying this is what we are building
  now.
- Vocabulary enforced in user-facing copy: no clone, model, fine-tune, or
  replica; no em-dash or en-dash. Verified against the rendered HTML of `/`,
  `/meera` and `/company`. `/research` still contains one en-dash inside the
  actual title of a preprint, which is a citation and was left alone.
- Updated metadata, keywords, the JSON-LD graph (the SoftwareApplication is now
  Vyakti Rooms), the social card, the sitemap date, navigation and footer.

### 2026-08-24

- Removed numeric GSAP scrub from the touch layout. Native mobile momentum now drives story progress directly, so the face no longer trails the finger or keeps catching up after a swipe.
- Kept desktop Lenis and ScrollTrigger synchronized through the existing linear scrub path; the mobile change does not alter desktop motion.
- Reduced compact-canvas particles from 7,000 to 4,800, capped canvas DPR at 1.25 and compact point DPR at 1, stopped rewriting already-hidden chapters, and isolated sticky-stage painting.
- Configured ScrollTrigger to ignore small mobile browser-chrome resizes during an active swipe while still refreshing for meaningful layout and orientation changes.

### 2026-08-22

- Rebuilt the homepage story clock around one GSAP progress proxy. Touch devices use a restrained scrub buffer while desktop remains synchronized with Lenis, preventing fast mobile flicks from skipping the face formation, diffusion, and Meera handoff.
- Lengthened the mobile story runway and the identity handoff phases. Noor now exits completely, a paper beat separates identities, and Meera enters independently rather than appearing as a morph or dissolve target.
- Made Noor speech time-based inside a scroll-gated chapter so pausing a swipe cannot leave the mouth frozen mid-viseme. Removed the artificial mouth-band shading that caused a dark lip artifact.
- Added a dots-only first-paint layer and a first-valid-frame canvas handoff. Normal server rendering never flashes a solid face poster before the particle system is ready.
- Made WebGL context loss geometry-stable: late failure swaps the visual layer without changing the runway height, active chapter, or scroll position.
- Standardized Meera around square editorial framing with dedicated portrait, tablet, and short-landscape compositions. Her full hair silhouette remains visible across 390x844, 430x932, 768x1024, 844x390, 1280x720, and 1440x900 layouts.
- Replaced the repainted scroll-scrubbed image clip with compositor transforms and reserved burgundy for Meera's literal identity highlight.
- Reorganized `/research` around current publications first, followed by the agenda, measured findings, methods, retractions, and artifact status. The finished paper and work-in-progress note now have visibly different editorial treatments.
- Corrected research-state claims: one web preprint, one research note in progress, and an artifact package pending publication. Removed the false submitted/benchmark-release implications from metadata and citation output.
- Added mobile paper contents navigation, reduced scholarly title scale, stacked narrow metadata rows, suppressed duplicate limitation/artifact sections, and avoided scholarly-publication schema for incomplete work.
- Reduced generic reveal motion on desktop and disabled it on touch, preserving a fast, stable research reading experience.
- Removed the decorative "Always AI" eyebrow from the final Meera chapter. The headline already establishes the boundary principle, and the extra label crowded the fixed header on short desktop viewports.

### 2026-08-21

- Recovered the exact production source that added the public research index,
  two paper pages, and release page from Vercel's uploaded source archive. The
  deployment had been created by CLI and was not represented by a Git commit.
- Restored the production research implementation to `Vyakti-website` so this
  repository is again the canonical editable form of what is live.
- Established the cross-repo source-of-truth boundary: this repository owns
  the public lab site; `html-portfolio` owns the active Meera product,
  relational engine, internal evidence, and research history.
- Recorded the current product and research standing in
  `docs/PRODUCT_AND_RESEARCH_STANDING.md`. Future website agents must fetch the
  product repo before changing research or capability claims.
- Corrected the strategic interpretation: identity continuity across arbitrary
  base models is an unsolved research question and internal gate, not a shipped
  product promise. The durable product is the relational-state layer; Meera is
  instance one, and the shared-memory group friend is the active wedge.

### 2026-08-14

- Adopted "relational intelligence lab" as the primary category.
- Chose consumer-first Meera, internal Vyakti relational layer, possible API later.
- Made identity continuity and model migration the core differentiation.
- Kept a white-first premium visual direction with one signal accent.
- Selected Noor as the strongest current lab-face direction and required a distinct female Meera face.
- Required durable project context in this file so future compacted sessions can restore product and design intent.
- Rebuilt the homepage around one continuous Noor-to-Meera signal transformation rather than separate face demos.
- Adopted an anatomy-aware semantic lip, jaw, mouth-socket, and teeth rig for both identities.
- Selected the feminine-sculpted GNM identity and a long particle-hair silhouette for the current Meera prototype.
- Replaced overlapping chapter crossfades with reversible fade-through handoffs.
- Aligned `/research`, `/meera`, `/company`, metadata, structured data, and footer copy with truthful relational-intelligence positioning.
- Verified the new site at desktop and 390-by-844 mobile sizes; lint, TypeScript, and the Next.js production build pass.
- Rejected the procedural particle-hair Meera prototype because it read as a wig rather than authored curly hair.
- Rejected a Noor-to-Meera topology morph; Noor and Meera are now completely separate scenes with a clear-paper beat between them.
- Established the generated curly-haired portrait as Meera's current canonical synthetic visual identity.
- Prototyped a separate full-colour 3D Meera asset using TripoSR and MediaPipe, then rejected it after direct live review because the single-image reconstruction still looked uncanny.
- Replaced the rejected 3D product scene with Meera's canonical photograph, presented as a separate sharp editorial reveal after Noor exits.
