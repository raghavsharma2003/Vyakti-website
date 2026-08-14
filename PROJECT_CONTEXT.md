# Vyakti project context

Last updated: 2026-08-14

This is the durable source of truth for the Vyakti website and product narrative. Read it before making product, copy, brand, or motion decisions. Add dated entries to the decision log when the direction changes.

## Company thesis

Vyakti is a relational intelligence lab.

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

Current external product: Meera.

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

Useful framing:

> You do not configure Meera. You meet her.

Meera should be clearly and consistently identified as AI. Presence must not depend on deception.

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

The recommended homepage sequence is:

1. Abundance: intelligence is becoming cheap and interchangeable.
2. The open problem: what makes an intelligence remain someone?
3. Formation: a human identity consolidates from signal into a coherent face.
4. Research: identity, relational memory, social cognition, expression, and evaluation operate as one system.
5. Model independence: engines can change while identity persists.
6. Meera: the first consumer expression of the research, shown as a distinct female identity.
7. Trust: the more human AI feels, the clearer its boundaries must be.
8. Invitation: meet Meera, follow the research, or work with the lab.

The homepage should not lead with market size, generic capability lists, fake metrics, investor language, or an API diagram. Strategy can be precise without making the public site feel like a deck.

## Visual and motion direction

Theme: light only, with an editorial white or cool-paper background.

Palette: near-black ink, cool white paper, and one saturated signal accent. The current warm orange should be recalibrated toward a sharper signal red unless a later brand decision changes it.

Design character: premium, precise, strange, calm, and category-defining. Avoid startup-template cards, purple AI gradients, fake dashboards, ornamental tech grids, and generic "future is here" copy.

Typography: high-contrast scale, tight display tracking, readable body type, restrained use of mono for actual system notation only.

Primary visual language: real-time 3D human geometry. The face is not decoration. It demonstrates the product thesis by forming, holding, listening, speaking, reacting, and dissolving through reversible scroll-linked motion.

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

The public homepage now uses two independent React Three Fiber scenes. They are deliberately not a shared mesh, morph target, or identity dissolve:

1. a dispersed signal field resolves into Noor
2. Noor consolidates as the lab identity
3. Noor holds, looks, blinks, and performs one deterministic speech phrase
4. Noor releases into his own signal field and exits completely
5. a short clear-paper beat separates the lab identity from the product identity
6. Meera enters as a complete, separately authored, full-colour 3D model
7. Meera turns under scroll, settles beside her introduction, and remains present through the trust chapter

Noor uses `androgynous-soft.glb` and a semantic oral rig. Skin, mouth socket, and teeth receive coherent jaw and viseme transforms, so speech does not depend on a hardcoded mouth-region ripple.

Meera uses `meera-portrait-mesh-v2.glb`: a separate two-part asset made from a portrait-faithful MediaPipe facial depth mesh and a TripoSR curl/bust reconstruction. Her original synthetic portrait supplies the facial texture, so the eyes, lips, skin, and curly-hair identity remain recognisable. The model is a real 3D mesh with a restrained scroll-controlled yaw; it does not share Noor's topology and never forms out of Noor's particles. The source portrait is a fictional adult identity generated for Vyakti, not a real person.

The main page is deliberately white-first and editorial. It uses black plus one signal-red accent, one face-as-research-object, asymmetric research blocks, an architecture map, and an evaluation timeline. It does not use decorative marquees, fake waveforms, invented benchmark numbers, or repeated startup-style card grids.

Desktop uses a sticky long-form story. Mobile uses native scrolling with a compact sticky visual and protected reading band. Reduced-motion and WebGL failure modes become a linear editorial layout with static portraits rather than a blank canvas. Both 3D scenes render on demand, cap DPR, and are only invalidated by scroll or restrained pointer input.

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
- a separate full-colour Meera 3D portrait mesh, source portrait, licensed reconstruction notes, and dedicated scene
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
- Whether the production Meera model should eventually be artist-retopologised with expression blendshapes while preserving the current synthetic portrait identity.
- Private beta mechanics and form destination.
- Which research artifacts can be published with real data.
- Final age policy after legal review.

## Decision log

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
- Built and visually gated a separate full-colour 3D Meera asset using MIT-licensed TripoSR geometry and Apache-2.0 MediaPipe face topology.
- Limited Meera's scroll turn to the angle range where the single-image reconstruction remains coherent, while keeping the motion fully reversible.
