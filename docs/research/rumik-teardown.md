# Rumik.ai — Forensic Design Teardown

Captured 2026-08-12. Two distinct design systems on one property:
- **Marketing site** (`rumik.ai`, `/silk-api`) — built in **Framer**, editorial/research-lab aesthetic, cream paper texture, dashed-border "notebook" sections, postage-stamp cards, ASCII art.
- **Ira product app** (`ira.rumik.ai/Onboarding`) — built in **Expo/React Native Web**, anime-illustration hero, glossy 3D bubble wordmark, polaroid photo cards. Totally different visual language from the marketing site — feels like a separate acquired product, not a unified brand system.

Note on capture: headless Chromium initially failed with `ERR_CONNECTION_RESET` on every request (including example.com) because this sandbox MITM-intercepts HTTPS via an "Anthropic Egress Gateway" proxy, and Chromium 141's TLS ClientHello (post-quantum X25519Kyber768 keyshare + Encrypted Client Hello GREASE) was not parseable by the intercepting proxy, causing it to reset the socket right after ClientHello. Fixed by launching with `--proxy-server=http://127.0.0.1:34809 --ignore-certificate-errors --disable-features=PostQuantumKyber,EncryptedClientHello,UseDnsHttpsSvcbAlpn,ECH --ssl-version-max=tls1.2`.

---

## 1. Design tokens

### 1.1 Marketing site (rumik.ai, /silk-api) — Framer

**Color palette** (from `:root` CSS custom properties, Framer `--token-*` vars):

| Hex | Role (observed usage) |
|---|---|
| `#fff8e1` | Primary page background (warm cream, paper-textured with a grain/noise overlay + dot-grid pattern) |
| `#fcfaf6` / `#fffdf7` | Secondary near-white surfaces (cards) |
| `#fff4e6` (rgb 255,244,230) | Postage-stamp card fill, sticky-note fill |
| `#f0f0f0` | Neutral light gray surface |
| `#e3e3e3` | Divider/border light |
| `#ccc` | Muted border |
| `#aba9a7` | Muted secondary text / border |
| `#969696` / `#666` | Secondary/tertiary text (e.g. "our first most expressive voice model") |
| `#212121` | Near-black text |
| `#000` / `#0f0f0f` | Primary text, primary borders, ASCII art fill |
| `#161718` (rgb 22,23,24) | Dark pill buttons ("talk to ira", "call now" filled variant), dark CTA band background |
| `#ff5112` | Orange accent token present in `:root` (not visually prominent in captured viewport states — likely a hover/link accent reserved for interactive states) |
| `#cec8b5` | `--border-color` custom property, used for the dashed/solid rule lines inside notebook sections |
| `#ffffff17` (11% white) | Overlay/glass tint |
| legacy default link blue `rgb(0,0,238)` | Appears on some anchor-styled CTAs as computed color fallback (Framer default `<a>` before override) |

**Typography**

- Primary UI/heading typeface: **Manrope** (`Manrope, "Manrope Placeholder", sans-serif`) — used everywhere for headings, nav, buttons, body copy.
- Monospace accent typeface: **Fragment Mono** (`"Fragment Mono", monospace`) — used for the audio-demo transcript cards ("description: a male 40s british voice...") on /silk-api, giving a "code/terminal" feel to the voice examples.
- A serif (**Young Serif**, `"Young Serif", "Young Serif Placeholder", serif`) is declared in the CSS but not obviously visible in the captured hero/body — likely reserved for a specific callout not hit during scroll capture.
- Fallback `"Source Sans 3"` also declared, likely for embedded widgets.

Measured computed styles:

| Element | Font size | Weight | Line height | Family |
|---|---|---|---|---|
| Hero headline "building the / most human ai" (home) | **50px** | **800** | 60px | Manrope |
| H1 "text-to-speech api built for real-time conversations" (/silk-api) | **56px** | **700** | — | Manrope |
| H2 section headers ("built to be versatile and human", "the models", "integrate production-grade tts…") | **32px** | **800** | — | Manrope |
| Eyebrow/kicker text ("we are a focused ai research lab") | 21px | 500 | 25.2px | Manrope |
| H4 footer column headers (contact, careers, api, community) | 18px | 600 | 25.2px | Manrope |
| Body paragraph | 18-20px | 400-500 | 24px | Manrope |
| Secondary/caption text ("our first most expressive voice model") | 14px | 500 | 16.8px | Manrope |
| Button label ("call now", "talk to ira") | 12-13px | 400 | normal | sans-serif (Framer default button reset) |

**Border radius**: highly rounded pill buttons dominate — `147px`, `46px`, `45px`, `35px`, `33.6px` (pill/circle buttons and avatar containers); `20px` and `16px` (cards, sticky note); `16px 16px 16px 4px` (chat-bubble asymmetric corner — speech-bubble tail effect); `0px 25px 0px 0px` (single-corner cut, decorative); `50%` (circular avatars/icons).

**Container widths**: `960px`, `1000px` (content column widths), `1800px` (outer full-bleed section wrapper), several `100%`/`85%` fluid wrappers. Visually the notebook-style bordered sections sit at roughly **956px** wide, centered, with generous ~64-96px vertical rhythm between sections (approximate from screenshots — Framer doesn't expose `<section>` tags so exact padding wasn't captured programmatically).

**Signature visual devices**:
- Full-page **paper-grain texture + dot-grid pattern** background (subtle noise photo overlay + repeating dot pattern), giving a "graph paper / notebook" feel.
- **Dashed-border rectangular sections** ("notebook cards") with cross-tick marks at the corners of inner content blocks (like ruler/measurement marks) — used for the "meet ira" feature block.
- **Postage-stamp cards** with scalloped/perforated edges for the "mulberry / muga / spider" model cards — genuinely distinctive, unusual CSS (likely `mask-image` with a repeating semicircle pattern).
- **Sticky note with paperclip icon** UI (top of hero) — mimics a physical Post-it stuck to the page, complete with a fold/rotation.
- **ASCII-art bust/portrait** rendered in monospace 1s and 0s (binary), on the hero, reinforcing "ai/human" duality.
- Dark, high-contrast **halftone-dot texture band** for the final CTA-before-footer section ("start building with rumik's tts api").

### 1.2 Ira app (ira.rumik.ai/Onboarding) — Expo/React Native Web

**Color palette**:
- `#ffffff` primary background (page chrome / top install banner)
- `#f3f4f6` (rgb 243,244,246) light neutral
- `#b0b5bf` muted gray
- `rgba(18,19,20,0.8)`, `rgba(8,8,8,0.8)` near-black translucent text
- `#e8e8e8`, `#e1e0e0` light borders
- `#525860` mid-gray border
- Illustrated **anime sky/meadow background** (blue sky, clouds, tree, distant city skyline, girl seated in grass) — this is a full-bleed hero illustration, not a color field.
- Glossy pink 3D bubble-letter logotype "IRA" (candy/balloon-letter style, magenta-pink gradient, ~`#f472b6`-ish with white highlight)

**Typography**: `averia-serif-libre` (used for the serif "ira" wordmark under the bubble logo), `instrument-regular` / `instrument-medium` (Instrument Sans, body/UI), system fallback stack `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`.

**Border radius**: much softer/varied set than the marketing site — `4px`, `6.3px`, `8.5px`, `12.7px`, `13.7px`, `14.8px`, `16.9px` (photo-card corners at various scales/rotations), `32.7px`, `37px`, `65.5px`, `97px`, `105.6px` (large pill CTA "say hi to ira" and circular social icons).

**Layout**: This is effectively a **single, roughly viewport-height landing/gate screen** (confirmed — scroll 75%/100% captures are blank/near-empty, ~5-6KB PNGs), not a scrolling marketing page. It's a pre-auth splash before the actual product ("Onboarding" is the page `<title>`, and `ira.rumik.ai/` redirects straight to `/Onboarding`).

**Trackers/SDKs detected**: Microsoft Clarity (`clarity.ms`), Google Sign-In (`accounts.google.com/gsi/client`), OTPless headless auth SDK, Cloudflare Insights beacon, Expo web runtime bundle (`_expo/static/js/web/...`).

---

## 2. Information architecture (order of sections, top to bottom)

### rumik.ai (homepage)
1. **Nav** (pill-shaped, floating) — logo "✷ rumik.ai" · api · research · community · careers · "talk to ira ↗" (dark pill button, sticky/fixed across scroll)
2. **Hero** — kicker "we are a focused ai research lab" + big headline "building the most human ai" + ASCII-art bust graphic + a "preview silk 1" sticky-note popup (dismissible, has a waveform icon + "call now" CTA)
3. **"this requires mastering 3 essentials:"** — three stacked notebook-style feature blocks, each with a codename:
   - **1. voice** `/ codename: silk/` — copy + phone-call UI mock with waveform + "call now"
   - **2. memory** `/ codename: mesh /` — copy + simulated chat thread (Hinglish messages)
   - **3. conversation** `/ codename: peek /` — copy + a small node/graph diagram (input → time/emoji/image → signals → context×3 → meaning) + chat bubble example ("I'm fine" / "3am hai... pakka sab theek hai?")
4. **"meet ira"** — product intro copy, "talk to ira ↗" CTA, "you can find ira on whatsapp, telegram, ios/android"
5. **Footer / "join us"** — recruiting blurb + "get in touch" CTA, plus 3-column link list (company / api / community) and copyright line

### rumik.ai/silk-api
1. Nav (same as home)
2. **Hero** — "text-to-speech api built for real-time conversations" + "get an api key ↗" + "documentation" CTAs
3. **"built to be versatile and human"** — use-case tag list (voice agents, call centres and ivr, customer support automation, conversational applications, dubbing and localisation, content and media platforms, indian-language products) + an interactive playground widget (emotion-tag input, sample text, model toggle mulberry/muga, "generate audio")
4. **"the models"** — 3 postage-stamp cards: mulberry, muga, spider (each with bullet specs + "read more" / "experience the live demo")
5. **"integrate production-grade tts with a few lines of code."** — Python code sample (`from rumikai import Rumik...`) with copy/download buttons
6. **"silk keeps the voice intact even through language changes"** — 4 audio demo cards (narrator, podcast host, support, streamer) each with description text, sample line (English + Hindi/Hinglish), and an audio player (0:00/0:00)
7. **"pay for what you need"** — pricing cards: silk mulberry ₹0.50/1k chars, silk muga ₹0.99/1k chars, silk spider (contact team)
8. **"hear silk in conversation" / "meet the teams already speaking through silk"** — 3 case-study cards: curvet ai (100+ hours in 2 days), snap tv, monk learning
9. **"faqs"** — accordion, 12 questions (pricing, languages, streaming, voice agents, credits, concurrency, commercial use, integration speed)
10. **Dark halftone CTA band** — "start building with rumik's tts api" + "get an api key"
11. Footer (identical structure to homepage)

### ira.rumik.ai/Onboarding (and ira.rumik.ai/ which redirects here)
1. **(mobile only) Install banner** — "ira: your all-time friend / get the ira app" + "get app" button + dismiss X
2. **Single hero screen** (anime sky/meadow illustration) containing:
   - "follow ira" label + X and Instagram icon buttons
   - Floating polaroid-style photo cards (4-5 images of "ira" in different settings) at varied rotations
   - A voice-note style audio player card (00:10, waveform, play button)
   - Glossy pink 3D "IRA" bubble-letter wordmark
   - Serif "ira" logotype + tagline "your personal companion"
   - "👋 say hi to ira" dark pill CTA (bottom-center)
3. Nothing below the fold — page height ≈ viewport height; it's a gate/splash screen, not a scrolling page.

---

## 3. Verbatim copy

### Homepage hero
> we are a focused ai research lab
> **building the most human ai**

Sticky-note popup: "preview silk 1" / "our first most expressive voice model" / **call now**

### "3 essentials" section
- **voice** `/ codename: silk/` — "model trained to pause, scream, whisper, sing, yap, cry, laugh, tease in your language."
- **memory** `/ codename: mesh /` — "a messy memory that knows what to remember and what to forget." (chat sample includes lines like "yaad hai woh din jab tumne apni bestfriend ke liye gift liya tha? woh smile kitni priceless thi!", "mujhe yaad hai tumhare childhood pet ka naam oreo hai")
- **conversation** `/ codename: peek /` — "because same words can have different meanings. it understands \"i'm fine\" in every context." (example: "I'm fine" → "3am hai... pakka sab theek hai? kuch baat karni hai?")

### "meet ira"
> silk, mesh & peek power our first true companion, **ira**.
> she chats, calls, sends voice notes. watches youtube with you, plays chess, exchanges gifs, stickers, emojis and much more!
> **talk to ira** — you can find ira on whatsapp, telegram, ios/android.

### Footer ("join us")
> we are a close-knit group of researchers, engineers, and designers working on the hardest problems in ai.
> **get in touch**

Footer columns — **company**: contact, careers, research, ira, privacy policy, terms. **api**: playground, api keys, agents, pricing, docs, support. **community**: X, linkedin, discord, instagram, youtube.
Copyright: "2026 - rumik intelligence private limited"

### /silk-api hero
> **text-to-speech api built for real-time conversations**
> get an api key · documentation

### /silk-api body
- "built to be versatile and human" — tags: voice agents, call centres and ivr, customer support automation, conversational applications, dubbing and localisation, content and media platforms, indian-language products
- Demo input placeholder: "type ‹ to insert emotion tags"; sample line: "Hi, I'm calling to confirm your appointment for tomorrow at 3 PM. Does that time still work for you?"
- "the models" — **mulberry**: "starts speaking in 162 ms, faster than a blink." / "creates the voice you describe instantly." — **muga**: "24 kHz studio-quality audio" / "6 built-in emotions (happy, sad, angry, excited, whisper, neutral)" — **spider**: "our most advanced model yet" / "experience the live demo"
- "integrate production-grade tts with a few lines of code." / "get a key. send a request. receive 24 khz audio."
- Code sample uses package `rumikai`, class `Rumik()`, method `client.speech.create(text=..., model="muga"/"mulberry", description=..., speaker=...)`.
- "silk keeps the voice intact even through language changes" — 4 voice personas: narrator (male 40s British), podcast host (female 30s Hindi), support (female 30s Indian), streamer (male 20s American), each with a description string and bilingual sample line.
- "pay for what you need" / "browse credit packs" — silk mulberry ₹0.50/1k chars ("sota tts model"), silk muga ₹0.99/1k chars ("sota voice design"), silk spider ("our most advanced model", "contact the team for preview access")
- "hear silk in conversation" / "meet the teams already speaking through silk" — curvet ai ("100+ hours in 2 days" — "curvet put mulberry and muga directly inside its ai workflow canvas..."), snap tv ("snaptv uses silk to give a voice to bite-sized lessons made for how india learns, quickly, on mobile, in simple hindi and easy english."), monk learning ("jee concepts are difficult enough. monk learning uses silk to turn dense explanations into clear, natural voice for aspirants preparing every day.")
- FAQs (12, verbatim, condensed): what is rumik's tts api? / how much does it cost? ("silk mulberry starts at $0.005 per 1k characters (₹0.40/min in india). pay for what you need with credit packs — no subscriptions.") / which languages are supported? ("english, hindi, hinglish, tamil, telugu, bengali, marathi and more — with natural mid-sentence switching between them.") / does it support real-time streaming? ("yes. websocket streaming with low time-to-first-byte, fast enough for live conversations.") / can it be used for voice agents? ("yes. silk is built for voice agents, calls and conversational experiences, with pipecat and livekit integrations.") / how does voice design work? / how are credits consumed? / what happens when credits run out? / what concurrency limits apply? / is commercial usage allowed? / how quickly can developers integrate?
- Final CTA: "start building with rumik's tts api" / "get an api key"

### ira.rumik.ai/Onboarding
> **ira**
> your personal companion
> follow ira
> 👋 say hi to ira

Mobile-only banner: "ira: your all-time friend / get the ira app" / "get app"

### Nav items (both marketing pages)
api · research · community · careers · **talk to ira ↗** (dark pill, persistent)

### Meta/SEO
- Title: "rumik — research lab building the most human ai"
- Description: "rumik is a research lab building the most human ai — foundation models across text, voice and video. our first launch: silk, a family of three voice models."
- /silk-api title: "real-time text-to-speech api for english and indian languages | rumik silk"

---

## 4. Motion / animation

- **Platform**: Marketing pages are built on **Framer** (`framerusercontent.com/.../script_main.CQ4rkwZt.mjs`, `events.framer.com/script`) — Framer's runtime bundles its own animation engine (a Motion/Framer-Motion-derived system) rather than loading a separate public `gsap`/`framer-motion` package; no `window.gsap`, `ScrollTrigger`, `Lenis`, `THREE`, `AOS`, or `anime` globals were detected on any page.
- **Scroll-linked element**: on the homepage, the small circular "ira" avatar (from the chat-mock in the "memory" section) **animates upward and docks into the nav bar** as the user scrolls past that section — captured mid-transition at the 50% scroll screenshot, where the avatar and "ira · online" label visibly overlap/merge with the nav pill. This is a classic scroll-driven position/opacity tween (most likely Framer's built-in scroll-effects, i.e. a position transform interpolated by scroll progress).
- **Model tab switcher** on /silk-api ("mulberry" / "muga" segmented control) sticks near the top of the viewport while its content area scrolls underneath — a pinned/sticky element, visible mid-transition in the 50% scroll capture with the tab bar partially overlapping the nav.
- **Hover micro-interaction**: hovering the "talk to ira" pill button shifts the diagonal arrow icon slightly (confirmed via before/after hover screenshots — `hover_before.png` vs `hover_after.png`) — a small translate/nudge on hover, typical of Framer's "arrow slides up-right" link affordance.
- **FAQ accordion** on /silk-api expands/collapses (chevron icon rows) — standard height/opacity accordion, not captured animating but structurally present (`<button>` + chevron `∨` icon per row).
- Audio-demo cards on /silk-api include native `<audio>`-style play buttons and progress bars (0:00/0:00) — interaction is functional, not purely decorative motion.
- **Analytics/marketing scripts loaded** (not animation but relevant to the stack): Microsoft Clarity, Google Tag Manager + gtag (two measurement IDs), Google Ads conversion tracking (`googleads.g.doubleclick.net`), Framer's own analytics beacon.
- **Ira app** (Expo/React Native Web): floating photo cards are pre-rotated at different fixed angles (a "scattered polaroids on a table" static composition) rather than obviously scroll-animated — no scroll-triggered motion is possible since the page is a single viewport-height screen. Likely relies on RN Web's Animated/Reanimated for any micro-interactions (button press states), not observable from static screenshots.

---

## 5. Screenshots captured

All PNG, saved under `/tmp/claude-0/-home-user-Vyakti-website/bbf35a7c-3e96-5790-a646-b661b554dae4/scratchpad/research/rumik/screenshots/`:

**Homepage (rumik.ai/)**
- `home_desktop_fullpage.png`, `home_desktop_scroll0.png`, `home_desktop_scroll25.png`, `home_desktop_scroll50.png`, `home_desktop_scroll75.png`, `home_desktop_scroll100.png`
- `home_mobile_fullpage.png`, `home_mobile_scroll0.png`, `home_mobile_scroll25.png`, `home_mobile_scroll50.png`, `home_mobile_scroll75.png`, `home_mobile_scroll100.png`

**/silk-api**
- `silk-api_desktop_fullpage.png`, `silk-api_desktop_scroll0.png`, `silk-api_desktop_scroll25.png`, `silk-api_desktop_scroll50.png`, `silk-api_desktop_scroll75.png`, `silk-api_desktop_scroll100.png`
- `silk-api_mobile_fullpage.png`, `silk-api_mobile_scroll0.png`, `silk-api_mobile_scroll25.png`, `silk-api_mobile_scroll50.png`, `silk-api_mobile_scroll75.png`, `silk-api_mobile_scroll100.png`

**ira.rumik.ai/ (redirects to /Onboarding — captured under both labels, identical content)**
- `ira-home_desktop_fullpage.png`, `ira-home_desktop_scroll0.png`, `ira-home_desktop_scroll25.png`, `ira-home_desktop_scroll50.png`, `ira-home_desktop_scroll75.png` (near-blank, below-fold), `ira-home_desktop_scroll100.png` (near-blank, below-fold)
- `ira-home_mobile_fullpage.png`, `ira-home_mobile_scroll0.png`, `ira-home_mobile_scroll25.png`, `ira-home_mobile_scroll50.png`, `ira-home_mobile_scroll75.png` (near-blank), `ira-home_mobile_scroll100.png` (near-blank)

**ira.rumik.ai/Onboarding**
- `ira-onboarding_desktop_fullpage.png`, `ira-onboarding_desktop_scroll0.png`, `ira-onboarding_desktop_scroll25.png`, `ira-onboarding_desktop_scroll50.png`, `ira-onboarding_desktop_scroll75.png` (near-blank), `ira-onboarding_desktop_scroll100.png` (near-blank)
- `ira-onboarding_mobile_fullpage.png`, `ira-onboarding_mobile_scroll0.png`, `ira-onboarding_mobile_scroll25.png`, `ira-onboarding_mobile_scroll50.png`, `ira-onboarding_mobile_scroll75.png` (near-blank), `ira-onboarding_mobile_scroll100.png` (near-blank)

**Hover-state probe (homepage "talk to ira" CTA)**
- `hover_before.png`, `hover_after.png`

Raw extracted design-system JSON (computed styles, CSS vars, colors, copy per page/viewport): `/tmp/claude-0/-home-user-Vyakti-website/bbf35a7c-3e96-5790-a646-b661b554dae4/scratchpad/research/rumik/data/design-data.json`
