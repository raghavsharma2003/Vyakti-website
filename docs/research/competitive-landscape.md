# Vyakti — Competitive & Positioning Landscape Research
Compiled 2026-08-12. Sources at bottom.

---

## GROUP 1 — Direct competitors (human-like voice / conversational AI)

### Sesame AI (sesame.com)
- **Positioning today (pivoted):** Sesame has moved from "voice research lab" to a consumer hardware/agent company. Current hero: **"Curiosity, met"** / *"Personal intelligence with a point of view. Made to help you do more of what you love."* Product is now "beautiful, intelligent eyewear" with a hands-free agent, targeted 2027 launch. Nav is minimal: Blog, Team, Mobile Preview, Research Preview.
- **Why they still matter — the research post is the single most important artifact in this space.** "Crossing the Uncanny Valley of Conversational Voice" (sesame.com/research/crossing_the_uncanny_valley_of_voice):
  - Opening line: *"How do we know when someone truly understands us? It is rarely just our words—it is in the subtleties of voice: the rising excitement, the thoughtful pause, the warm reassurance."*
  - Names the core problem: today's assistants suffer **"emotional flatness"** that becomes **"more than just disappointing—it becomes exhausting"** over extended use.
  - Coins the target concept: **"voice presence — the magical quality that makes spoken interactions feel real, understood, and valued."**
  - Defines it via four pillars (steal this structure): **emotional intelligence** (reading/responding to emotional context), **conversational dynamics** (natural timing, pauses, interruptions, emphasis), **contextual awareness** (adjusting tone/style to situation), **consistent personality** (coherent, reliable presence over time).
  - Technical concept: **Conversational Speech Model (CSM)** — frames speech as an "end-to-end multimodal learning task using transformers," conditioning on conversation history for coherence, not just per-sentence TTS.
  - Notable humility/credibility move: *"We're not there yet."* — admitting limitations builds trust; worth emulating in Vyakti's research tone.
  - Approach to imperfection as a feature: embracing hesitation, laughter, subtle emotional inflection — "alive," not just "correct."

### Hume AI (hume.ai)
- **Positioning:** Has moved toward being an *evaluation/data layer*, not just a voice product. Hero: **"The data and evaluation layer for emotionally intelligent voice AI."** Sub: *"Build & measure AI the way people experience it, based on research and grounded in real human judgment."*
- **Structure:** "Four products. One scientific foundation." → Build, Kairos (auto-generate/run scenarios), Expression Measurement API, Human Feedback API. Section: "Leaderboards: The standard for voice AI performance."
- **Differentiator claim:** grounding in actual affective-science research (48+ emotions, 600+ voice descriptors, 50+ languages), leaderboards as credibility device, "proven on real models."
- **Design idea worth noting:** treating *evaluation* itself as a product category — positions Hume as the "science" authority others get measured against.

### ElevenLabs (elevenlabs.io)
- **Positioning:** Broad audio/video platform, not narrowly "human-like." Hero: **"Bringing technology to life."** Sub: *"Powering the best enterprises, creators, and developers. From ElevenAgents for customer experience, ElevenCreative for content creation, to the leading AI voice generator."*
- **Structure:** Two platforms on one research foundation (Creative / Agents) + APIs. Sections: "Research that redefines human technology interaction," "Safety, built in."
- **Differentiators:** 5,000+ voices / 70+ languages, 98% STT accuracy, 75ms latency (Flash model), heavy emphasis on provenance/safety/moderation — signals maturity toward enterprise trust.

### Cartesia (cartesia.ai)
- **Positioning:** Infra/model company, not a downstream companion. Hero: **"Architecting AI that learns and interacts like humans."** Sub: *"Today's AI learns from data curated by humans. We're building AI that learns from the world as it is, and gets better with every interaction."*
- **Structure:** Sonic (TTS) / Ink (STT) / Line (voice agents) — "full stack for interactive intelligence." Section: "Frontier research, deployed in every conversation."
- **Differentiator:** State Space Models (SSMs) instead of transformers for latency/long-context efficiency; #1 rankings on Artificial Analysis Speech Arena; deployment flexibility (cloud/on-prem/on-device) for data residency/compliance.

### Character.AI (character.ai)
- **Positioning:** Consumer companion/roleplay platform. Tagline found across pages: **"Personalized AI for every moment of your day"**; newer variant: **"AI Chat, Reimagined – Your Words. Your World."**
- Focus is persona-driven chat/roleplay at consumer scale, not enterprise infra — useful negative example (no "research lab" framing at all, pure consumer app).

### Inworld AI (inworld.ai)
- **Positioning:** Infra + research lab hybrid. Hero: **"Inworld AI is a research lab and inference provider focused on realtime AI models."** Sub: *"The voice that makes AI agents human. Realtime AI for consumer-facing applications."*
- **Products framed as removing integration pain:** Realtime API ("One integrated voice loop instead of stitching three vendors; ships in days, fails in fewer places"), Realtime TTS ("Voices that sound human enough that users stay on the call and come back."), Router, STT, Inference.
- **Differentiators:** full-duplex via WebSocket, 220+ LLM routing, voice cloning from 15s audio, cross-lingual voice identity, streaming with word/phoneme/**viseme** timestamps for lipsync — good example of naming the full plumbing stack as a credibility flex.

### Tavus (tavus.io)
- **Positioning:** The closest analog to Vyakti's ambition. Hero: **"You've never met AI like this."** Sub: **"Human-like AI that can see, hear, act, and emotionally understand us, all in real-time. We call them PALs."**
- **Naming idea worth studying:** they've branded their agents as a category — "PALs" — rather than "bots" or "agents." Section: *"What if you could talk to your computer like a `friend`?"*
- **Products:** Developer API (perception, understanding, voice, rendering), Enterprise Solutions (bespoke PAL deployments), PAL Maker (no-code).
- **Differentiator:** three proprietary models — Phoenix-4 (rendering), Raven-1 (perception), Sparrow-1 (conversation flow) — named/personified models as a credibility+brand device. "Pioneering human computing since 2020."

### Synthesia (synthesia.io)
- **Positioning:** Enterprise AI video, not conversational AI. Hero: **"All-in-one AI Video platform for business."** Heavy enterprise-trust signaling: SOC2/ISO 42001/GDPR, "approved by legal, signed off by CFOs," "90% of Fortune 100." Useful as the *anti-model* — thoroughly de-risked, compliance-forward, unemotional copy. Vyakti should contrast against this literalism.

### HeyGen (heygen.com)
- **Positioning:** AI avatar video. Hero: **"AI videos starring you, made in minutes."** Sub: **"Be everywhere without being everywhere."** (strong, quotable line).
- **Product:** "Avatar V" — pitch: *"Character consistency is what separates a useful avatar from a gimmick."* Rated "#1 most realistic on G2."

### Retell AI (retellai.com)
- **Positioning:** Phone-call automation, enterprise ops framing. Hero: **"#1 AI Voice Agent Platform for Automating PHONE Calls."** Sub: **"Meet your AI call center from the future."** Section title worth noting: **"Talks Like People."**
- **Differentiators:** ~600ms latency, "proprietary turn-taking model," voices "built from real performance data."

### Vapi (vapi.ai)
- **Positioning:** Developer/API-first voice agent infra. Hero: **"Speak human to every customer."** Strong compact line. Emphasis on infra maturity: <500ms latency, 2.5M+ agents launched, 1B calls, SOC2/HIPAA/PCI.

### Bland AI (bland.ai)
- **Positioning:** Regulated-industry phone AI, security-first. Hero explicitly names verticals: healthcare, insurance, financial services, logistics. Sub: **"Built for high-stakes phone calls where security and trust actually matter."** Differentiator: on customer-owned infra, 400ms vs "1,240ms industry average" — calling out the average is a good competitive-copy trick.

### Rime (rime.ai)
- **Positioning:** Linguist-built voice models. Hero: **"Voice models made for human conversation."** Section: **"Built by linguists."** / **"Spoken like a local."** Differentiator: founded by language researchers, deterministic pronunciation control, regional dialect accuracy — "linguistics as credibility," a positioning lane Vyakti could partially borrow (cultural nuance, dialect).

### Deepgram (deepgram.com)
- **Positioning:** Infra/API layer, unifies STT/TTS/orchestration. Hero: **"The Voice AI Economy is Powered by Deepgram."** Product: Flux ("detects the language and knows when you're done speaking") and Nova.

### PlayAI / Play.ht
- Site was unreachable during this research pass (DNS/503 errors); known publicly for expressive TTS and voice cloning API, consumer + developer dual audience. Treat as a minor player relative to ElevenLabs/Cartesia.

### Newer 2025–2026 entrants
- **Smallest.ai** — raised $13M Series A (Seligman Ventures, Sierra Ventures, 3one4 Capital; ~$21M total). Thesis explicitly: *voice AI built to pass the Turing test*, via **small, specialized models** rather than bigger LLMs — "Electron v2," a 4B-parameter voice model with **53ms time-to-first-token**. Their bet: the next leap comes from mimicking human conversational timing, not raw model scale. This is close to Vyakti's thesis and worth watching as a direct competitor for the "indistinguishable from human" claim.
- **Nomi AI** — shipped "V3 voices" (early 2026) specifically to fix "flat-sounding TTS" with better emotional inflection — signal that companion apps are racing on emotional prosody now, not just chat quality.
- **Anima Lab** — reportedly uses *hand-written* (non-procedural) voice performance direction for more human-quality output — an interesting production-process differentiator (craft/direction vs. pure model scale).
- Broader market context: AI companion market > $1B consumer spend in 2025; estimates for 2026 vary widely ($120–300M mobile companion spend low-end, to $24–50B if "AI companion" is defined broadly). Category is heating up fast — window for a credible "research lab" entrant (vs. a companion app) is open now.

---

## GROUP 2 — AI research lab website craft

| Site | Hero headline | Nav / IA | Notes |
|---|---|---|---|
| **Anthropic** | "AI research and products that put safety at the frontier" | Research, Policy, Commitments (Initiatives, Trust Center), Learn (Learn, Company), News, Try Claude | Explicit safety-first framing threaded into the hero itself, not relegated to a subpage. Footer clusters: Products, Models, Solutions, Resources, Company. |
| **DeepMind** | "Explore our next generation AI systems" / "Our mission is to build AI responsibly to benefit humanity" | Models, Research, Science, About | Clean 4-pillar top nav — **Models / Research / Science / About** is a very clean pattern for a lab with both products and pure research (their "Science" vertical—AlphaFold, AlphaGenome—shows how a lab can carve out a distinct "science" identity from "research"). |
| **SSI (ssi.inc)** | "Superintelligence is within reach." | almost no nav | Extreme minimalism as *the* credibility device. "We have started the world's first straight-shot SSI lab, with one goal and one product." Anti-marketing tone (no demos, no logos, no pricing) reads as more serious, not less. Explicitly rejects "distraction by management overhead or product cycles." Ends by recruiting: "do your life's work." |
| **Thinking Machines Lab** | "Thinking Machines Lab is an artificial intelligence research and product company." / "We're building a future where everyone has access to the knowledge and tools to make AI work for their unique needs and goals." | Inkling, Tinker, Connectionism, News, Join us | Section "Science is better when shared" — openness as a value statement. Named their research blog "Connectionism" — a lab can name its own publication/blog as a mini-brand. |
| **Physical Intelligence (pi.website)** | "Physical Intelligence is bringing general-purpose AI into the physical world." | Home, Research, Join Us | About as minimal as it gets — 3 nav items. Versioned model naming in blog posts (π0 → π0.7) shown as a visible progress narrative. Backer logos (Bezos, OpenAI, Sequoia) used for institutional trust in a 3-page site. |
| **World Labs** | "World Labs — Spatial Intelligence" | About, Research & Insights, Marble Labs, Community Showcase, Case Studies, Learn, API, Spark, Careers | Coined its own category term ("Spatial Intelligence") and named the flagship product distinctly (Marble) — pattern: **lab name = field name, product = proper noun**, exactly analogous to Vyakti (lab/thesis) + Meera (product). |
| **Decart** | "We're Building The Live AI Lab the World Runs On" | Optimization stack, Models, Research, Blog, Company | Poetic + technical mix ("Math to Matter," "IDEAS YOU CAN TOUCH"). Names their own stack ("Decart Optimization Stack / DOS") — internal infra given a brand name for credibility. |
| **Mistral** | "Frontier AI. In your hands." | Products, Solutions, Research, Developers, Blog, Customers, Company | "Frontier" is the shared vocabulary word nearly every lab uses (Anthropic, Mistral) to claim state-of-the-art status without a benchmark citation. |
| **Cohere** | "Own your AI" | Products, Solutions, Research, Resources, Company | Enterprise-sovereignty as the entire positioning ("Your data. Your infrastructure."). |
| **Runway** | "Building Real-World Intelligence" | Creative, Dev, Robotics, Research, Resources, Enterprise, Pricing | Explicitly separates **Research** as its own top-nav item distinct from product surfaces (Creative/Dev/Robotics) — validates giving research a permanent nav slot even with a single flagship product. |
| **Suno** | "Make any song you can imagine" | simple: Log in / Open App / Join free | Consumer-simple nav — no "Research" nav item at all despite deep model work; all research lives in blog/behind the scenes. Useful contrast: consumer products can hide the lab entirely; Vyakti should NOT, since credibility (uncanny-valley claims) is the whole point. |
| OpenAI, Midjourney | not reliably fetchable this pass (403s) | — | Known patterns from general knowledge / design commentary: OpenAI's homepage uses a single dominant headline + one CTA + minimal chrome per viewport ("first viewport should contain only brand, one headline, one short supporting sentence, one CTA group, one dominant image" — their own frontend guidance, per developers.openai.com). Midjourney is famous for near-zero marketing copy — a gallery/grid of generated images *is* the homepage, letting output quality replace claims. |

### Cross-lab IA pattern (what to copy)
Nearly every serious lab site converges on the same skeleton:
1. **Hero** — one thesis-statement sentence (not a feature list), often a mission claim bigger than the product.
2. **Research** — own top-level nav item, signals the lab does more than ship a product; often splits further into a "Science"/"Insights" sub-vertical for less product-tied work.
3. **Product(s)** — a named flagship (Claude, Gemini, Tinker, π-model, Marble, Meera-for-Vyakti) presented as evidence of the research thesis, not just a SKU.
4. **Company/Team** — small labs lean hard on named researchers + investor logos for credibility in place of a long enterprise-trust section.
5. **Careers/Join us** — nearly always a final, direct CTA aimed at talent, phrased as mission recruitment ("do your life's work," "Join us"), not a generic jobs page link.
6. **Blog/News/Index** — a distinctly named research/writing channel (Connectionism, Science, Research Preview) rather than a generic "Blog."
7. Minimal labs (SSI, Physical Intelligence) use **restraint itself** as the trust signal — fewer nav items, no pricing, no logos wall, no demo video. Product-heavy labs (Runway, Mistral, Cohere) use conventional SaaS structure (Solutions/Pricing/Customers) because they're selling infra, not a research thesis.

---

## Technical vocabulary glossary (20+ credible terms for Vyakti copy)

- **Full-duplex conversation** — both parties (human and AI) can speak and listen simultaneously, versus half-duplex "wait your turn" systems; required for natural interruption and overlap.
- **Turn-taking** — the conversational policy governing when each speaker holds the floor; humans do this with ~200ms gaps across languages.
- **Endpointing (EP)** — detecting when a speaker has actually finished their turn (vs. just pausing), distinct from raw voice activity detection; among the hardest problems in real-time voice AI, especially with background noise.
- **Barge-in** — the ability for a user to interrupt the AI mid-utterance and have it stop/yield naturally; industry rule of thumb is under ~150ms from end-of-user-speech to TTS flush for it to feel natural.
- **VAD (Voice Activity Detection)** — the low-level signal-processing step that detects presence/absence of speech in an audio stream, feeding into endpointing.
- **TTFB (Time to First Byte) / TTFT (Time to First Token)** — the latency from input to the first piece of generated audio/text; Smallest.ai cites 53ms TTFT as a headline spec.
- **Latency budget** — the end-to-end time allowance across ASR → LLM → TTS before a response feels laggy; turn-taking gap target is commonly cited as 200–450ms depending on use case.
- **Prosody** — the rhythm, stress, and intonation of speech (pitch, loudness, duration) that conveys meaning beyond the words themselves.
- **Paralinguistics** — non-verbal, non-lexical elements of speech (tone, sighs, laughter, pacing) that carry emotional/attitudinal meaning alongside literal content.
- **Emotional TTS / expressive speech synthesis** — text-to-speech systems that render specified or inferred emotional states in the output voice, not just correct pronunciation.
- **Speech-to-speech models** — architectures that go directly from audio input to audio output (or condition generation on raw audio + text jointly), as opposed to cascaded ASR→LLM→TTS pipelines; Sesame's CSM and OpenAI/Azure Realtime are examples.
- **Voice cloning** — reproducing a specific speaker's vocal identity from a short reference sample (industry range: 15 seconds–5 minutes depending on vendor).
- **Cross-lingual voice identity** — preserving a cloned voice's identity/timbre when it speaks a different language than the reference sample (Inworld TTS-2 claims this).
- **Uncanny valley** — the perceptual dip where near-human-but-imperfect renders feel *more* unsettling than clearly artificial ones; Sesame's framing device for the whole category problem.
- **Voice presence** (Sesame's coined term) — the quality of a spoken interaction that makes it feel real, understood, and valued; a good aspirational benchmark term Vyakti could adopt or riff on.
- **Backchanneling** — small verbal acknowledgments ("mm-hmm," "right," "yeah") a listener gives while the other party is speaking, without taking the turn; a strong human-likeness signal that's rare in current voice AI.
- **Disfluencies / filler words** — natural speech imperfections (um, uh, false starts, self-corrections, filled pauses) that synthetic voices often lack, contributing to the "too clean" uncanny effect.
- **Speaker diarization** — automatically segmenting audio by "who spoke when," independent of identifying who they are by name.
- **Expressive/style-controllable speech generation** — models allowing explicit control over delivery style (pace, emotion, emphasis) rather than a single fixed voice performance.
- **Avatar / lipsync / video generation (viseme timestamps)** — animating a face to match generated speech; visemes are the visual (mouth-shape) counterpart to phonemes, streamed alongside audio to drive lip movement in real time.
- **Turing-test-style evals for conversational AI** — human-judgment protocols (not just automated MOS) where evaluators try to distinguish AI from human dialogue; increasingly the standard evaluation frame for this category (see benchmarks below).
- **State Space Models (SSMs)** — an alternative to transformer attention (used by Cartesia) claimed to offer better latency/long-context efficiency for streaming audio.
- **Contextual awareness** (Sesame's term) — adjusting tone/register/style to match situational context across a conversation, not just per-turn.

## Benchmarks / evals for "human-likeness"

- **Audio Turing Test (ATT)** — arxiv 2505.11200. Multi-dimensional Chinese-language corpus + Turing-test-inspired protocol where evaluators judge whether a voice sounds human. Key finding: even the top TTS model scored only ~0.4 human-likeness on ATT, far below real human speech and far below what MOS scores would suggest — evidence that MOS overstates human-likeness and a dedicated Turing-style eval is needed.
- **Speech-to-Speech Turing Test** — arxiv 2602.24080. Collected 2,968 human judgments comparing 9 state-of-the-art S2S systems against 28 human participants; produced an 18-dimension taxonomy of human-likeness (useful as a rubric Vyakti's own evals could mirror or cite).
- **RW-Voice-EQ Bench** — arxiv 2607.14846. Real-world benchmark, 785,679 TTS ratings + 48,053 STS ratings, covering emotion understanding and robustness across conversational conditions.
- **MirrorBench** — arxiv 2601.08118. Evaluates "user-proxy" conversational agents on human-likeness via lexical-diversity + LLM-judge metrics.
- **Full-Duplex-Bench-v3** — arxiv 2604.04847. Benchmarks tool use for full-duplex voice agents specifically under real-world disfluency conditions — directly relevant to Vyakti's "no interruption, natural turn-taking" claim.
- **MOS (Mean Opinion Score)** — the long-standing TTS quality standard, now understood to be a weaker/more subjective proxy than Turing-style human-likeness judgments; worth naming in copy to explicitly position Vyakti's evals as going beyond it.

---

## Deliverable summary (see final response to caller for the dense synthesis)

Sources are listed in the final response's Sources section, replicated here for the file:

### Sources
- [Sesame — homepage](https://www.sesame.com)
- [Sesame — Crossing the Uncanny Valley of Conversational Voice](https://www.sesame.com/research/crossing_the_uncanny_valley_of_voice)
- [Hume AI](https://www.hume.ai)
- [ElevenLabs](https://elevenlabs.io)
- [Cartesia](https://cartesia.ai)
- [Character.AI tagline reference](https://character.ai/character/e1vn5D40/nonsensical-surreal-conversationalist)
- [Inworld AI](https://inworld.ai)
- [Tavus](https://www.tavus.io)
- [Synthesia](https://www.synthesia.io)
- [HeyGen](https://www.heygen.com)
- [Retell AI](https://www.retellai.com)
- [Vapi](https://vapi.ai)
- [Bland AI](https://www.bland.ai)
- [Rime](https://rime.ai)
- [Deepgram](https://deepgram.com)
- [TechCrunch — Smallest.ai raises $13M to build ultra-fast voice AI that sounds genuinely human](https://techcrunch.com/2026/07/31/smallest-ai-raises-13m-to-build-ultra-fast-voice-ai-that-sounds-genuinely-human/)
- [TechBuzz — Smallest.ai Raises $13M for Voice AI That Passes Turing Test](https://www.techbuzz.ai/articles/smallest-ai-raises-13m-for-voice-ai-that-passes-turing-test)
- [StartupHub.ai — The 20 Best AI Companion Apps in 2026](https://www.startuphub.ai/ai-news/insights/2026/top-ai-companion-apps-2026)
- [AssemblyAI — Voice AI in 2026](https://www.assemblyai.com/blog/voice-ai-in-2026-series-1)
- [Anthropic](https://www.anthropic.com)
- [Google DeepMind](https://deepmind.google)
- [Safe Superintelligence Inc.](https://ssi.inc)
- [Thinking Machines Lab](https://thinkingmachines.ai)
- [Physical Intelligence](https://www.pi.website/)
- [World Labs](https://www.worldlabs.ai)
- [Decart](https://decart.ai)
- [Mistral AI](https://mistral.ai)
- [Cohere](https://cohere.com)
- [Runway](https://runway.com/)
- [Suno](https://suno.com)
- [arXiv — Audio Turing Test: Benchmarking Human-likeness of TTS](https://arxiv.org/abs/2505.11200)
- [arXiv — Human or Machine? A Preliminary Turing Test for Speech-to-Speech Interaction](https://arxiv.org/pdf/2602.24080)
- [arXiv — RW-Voice-EQ Bench](https://arxiv.org/html/2607.14846)
- [arXiv — MirrorBench](https://arxiv.org/pdf/2601.08118)
- [arXiv — Full-Duplex-Bench-v3](https://arxiv.org/pdf/2604.04847)
- [FutureAGI — Voice AI Barge-In and Turn-Taking: A 2026 Implementation Guide](https://futureagi.com/blog/voice-ai-barge-in-turn-taking-2026/)
- [Decagon — What is voice agent barge-in?](https://decagon.ai/glossary/what-is-voice-agent-barge-in)
- [lipsync.com — AI Lip Sync Glossary](https://lipsync.com/glossary)
- [Puppetry — AI Video Glossary](https://www.puppetry.com/glossary)
- [Gallio — Speaker Diarization glossary](https://gallio.pro/glossary/speaker-diarization/)
