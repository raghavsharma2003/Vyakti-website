# Codebase analysis — CRITICAL MISMATCH FOUND

**The codebase at `/workspace/raghavsharma2003/hihi` (branch `claude/voice-notes-app-calendar-f0d541`) is not Meera and has no connection to Vyakti.**

It is **"Echo"** — a voice-first *notes* app (`app.json` name: `Echo`, slug `echo-voice-notes`,
iOS/Android bundle id `com.echo.voicenotes`). There is no occurrence of the strings "Meera" or
"Vyakti" anywhere in the repository (README, package.json, app.json, source, migrations, or git
history/branch name). It is not a real-time conversational or voice-chat AI at all — it is a
record-transcribe-summarize utility, closer to a voice-powered version of Apple Notes / Otter.ai
with calendar/Gmail actions bolted on, than to a "human-like" conversational assistant like
Sesame, Character.ai, or a ChatGPT/Claude voice mode.

Concretely, this app has:
- No real-time voice conversation loop (no bidirectional audio streaming to an LLM, no
  turn-taking, no interruption handling, no VAD-based dialogue management).
- No TTS at all (the app never speaks back to the user in any form).
- No persona, personality, or system prompt describing an assistant "character." The only
  system prompt (`enrich-note`) is a data-extraction instruction, not a conversational persona.
- No conversation/chat history, no long-term user memory, no multi-turn dialogue state.
- No websocket/realtime API usage of any kind.
- No mention of ElevenLabs, Deepgram, Cartesia, LiveKit, Groq (as an inference provider), or any
  low-latency conversational voice stack.

Everything below documents what the codebase *actually* is, in case it is still useful raw
material (e.g., "Vyakti built X before Meera" positioning), but it should **not** be presented as
Meera or as evidence of Vyakti's conversational-AI work without the user explicitly confirming
that's the intent — this may be the wrong repo pointed at this task.

---

## 1. What it IS, concretely

**Echo** is a mobile app (Expo / React Native, iOS + Android, with an experimental Metro web
build) for taking voice notes. The core loop:

1. Tap the record button (reachable from any tab — capture is centered in the tab bar).
2. Talk. A live transcript streams onto the screen as you speak, with a moving waveform.
3. Tap stop. The note (audio file + transcript) is saved instantly to on-device SQLite —
   fully usable immediately, offline.
4. In the background (if a Supabase backend is configured), Claude reads the transcript and
   returns a title, a short summary, tags, and a list of action items (tasks / calendar events /
   email drafts / reminders) with resolved due-dates.
5. The user can review/edit the transcript, play back the audio (tap a phrase to seek to that
   moment), pin/archive/search/share notes, and — if Google is connected — one-tap turn an
   extracted action item into a real Google Calendar event or a Gmail draft (draft only, never
   auto-sent).

It is explicitly "local-first": recording, transcription, search, playback, and editing all work
fully offline with zero configuration. Supabase (sync + AI enrichment) and Google (calendar/mail)
are both optional, independent add-ons.

There is no conversational interface anywhere — the user never "talks to" an AI in real time and
gets a spoken or even textual back-and-forth response. The only AI touchpoint is asynchronous,
one-shot note enrichment.

## 2. Full feature inventory (exact user-facing names)

Screens/tabs (`app/(tabs)/_layout.tsx` titles + routes):
- **Notes** (`index.tsx`) — home tab. Notes list grouped by day; "Pinned" section pinned to top.
  Search ("Search words you said…"). Swipe to pin/archive (via `NoteCard`).
- **Today** (`today.tsx`) — "SCHEDULE" (next ~36 hrs of Google Calendar events, live "NOW"
  marker) + "FROM YOUR NOTES" (open action items extracted from notes, each linking back to its
  source note).
- **Inbox** (`inbox.tsx`) — unread Gmail digest (sender, subject, snippet, "N unread"), tapping a
  message deep-links into Gmail.
- **Settings** (`settings.tsx`) — "SYNC & ASSISTANT" (sign-in status, Sync now, Sign out),
  "CALENDAR & MAIL" (Google connect/disconnect), "LIBRARY" (Archived notes, Recordings on this
  device storage size), "ABOUT" (version, data-location statement).

Modal/stack screens:
- **Capture** (`capture.tsx`) — the recorder. Full-screen modal, auto-starts listening on open.
  Live transcript (interim text dimmed), live waveform, recording pulse animation, duration timer,
  Stop-and-save / Discard.
- **Note detail** (`note/[id].tsx`) — playback with waveform scrubber and tap-to-seek transcript,
  editable title, editable transcript ("your edit is never overwritten" by later enrichment),
  AI summary card with tags ("READING YOUR NOTE" shimmer while pending), action-item list ("WHAT
  TO DO") with per-item "run" (create calendar event / Gmail draft) and dismiss/done toggles,
  pin, share (copies text + shares audio file), delete.
- **Archive** (`archive.tsx`) — archived notes, swipe to restore.

Named user-facing capabilities:
- Voice recording with **live streaming transcription** and moving waveform.
- **Dual-format notes**: original audio + editable transcript always kept together.
- **Tap-to-seek transcript** (segment-level timestamps → jump playback to a phrase).
- **Manual transcript/title correction** that survives re-enrichment.
- **AI note enrichment**: auto title, 2–3 sentence summary, up to 4 tags, action items.
- **Action items** typed as `task | event | email | reminder`, each with resolved due date/time,
  duration, recipient.
- **One-tap "run" of an action item** → real Google Calendar event or Gmail draft (draft-only,
  never auto-sent).
- **Today agenda**: merged calendar + open action items view.
- **Gmail unread digest** (Inbox tab).
- **Full-text search** ("every word you have said").
- **Pin / Archive / Restore / Delete / Share** note management.
- **Cross-device sync** via Supabase (last-write-wins on `updated_at`, unsynced local edits
  always win).
- **Email one-time-code sign-in** (six-digit code, no password, no magic link).
- **Google Calendar + Gmail connect/disconnect** (OAuth), scoped per platform.
- **Offline-first**: every capability above except AI enrichment, sync, and calendar/mail work
  with zero network / zero configuration.

## 3. "Voice/conversation stack" — what's actually there

There is no conversational voice AI stack. What exists is a **notes pipeline**:

- **STT (speech-to-text)**: on-device only, via `expo-speech-recognition` (native
  `SFSpeechRecognizer` on iOS / Android SpeechRecognizer, routed through Google's search app
  package). Streams interim + final results with per-segment timestamps and a volume/amplitude
  channel used to drive the waveform UI. This is the *only* transcription path exercised in the
  default/local-only configuration.
- **STT fallback (optional, server-side)**: OpenAI **Whisper** (`whisper-1`) via
  `supabase/functions/transcribe-audio/index.ts`, called only when on-device recognition produced
  nothing (offline Android, unsupported locale, interrupted session). Requires
  `OPENAI_API_KEY` set as a Supabase secret; the app never calls OpenAI directly.
- **LLM**: **Anthropic Claude**, model string literally `'claude-opus-5'`
  (`supabase/functions/enrich-note/index.ts`), called server-side from a Supabase Edge Function
  with a **structured-output JSON schema** (`output_config.format.type = 'json_schema'`,
  `effort: 'medium'`). Single-shot, non-streaming, non-conversational: transcript in, {title,
  summary, tags, actionItems[]} out. Max output 8000 tokens; input transcript is truncated at
  24,000 characters. Handles Claude's `stop_reason === 'refusal'` case explicitly.
- **TTS**: none. The app never produces speech output.
- **Realtime/WebSocket**: none found anywhere in `src/` or `supabase/`.
- **VAD**: only the platform speech recognizer's own end-of-speech/silence detection (exposed as
  `speechstart`/`speechend`/`no-speech` events); no standalone VAD model, no barge-in/interruption
  handling (there's nothing to interrupt — no AI voice output exists).
- **Turn-taking / interruption handling**: not applicable — not a dialogue system.

Grep across `src/`, `supabase/`, `.env.example` for provider keywords found matches **only** in:
`supabase/functions/enrich-note/index.ts` (Anthropic/Claude), `supabase/functions/transcribe-audio/index.ts`
(OpenAI/Whisper), and `README.md` (describing the same two). No hits for elevenlabs, deepgram,
cartesia, livekit, groq (as inference), or "realtime"/"websocket" as an audio pipeline.

## 4. What makes it feel "human" / considered

There's no persona or emotional-intelligence layer — the "human" touches are UX/latency
craftsmanship around a notes app, not conversational warmth:

- **Local-first, instant save**: a note is written to SQLite the instant recording stops and is
  immediately usable — explicitly designed so the interface "never blocks" on network calls.
- **Live proof-of-listening**: the transcript streams as you talk (interim text visibly dimmed
  vs. committed text) and a waveform moves with your voice — "so you can see it is working without
  stopping to check."
- **Single capture session** (one mic stream feeding both the recorder and the recognizer) to
  avoid audio-session conflicts on iOS/Android — an engineering-correctness point, not a
  human-likeness one.
- **Auto-restart on Android silence timeout** with segment-offset stitching so "a pause mid-thought
  does not truncate the note" — accommodates natural, hesitant speech.
- **User edits are sacrosanct**: `transcriptEdited` flag means a hand-correction is never
  clobbered by a later AI re-enrichment pass.
- **Motion design tokens** distinguish user-triggered vs. system-initiated animation speed
  ("short and eased-out for anything the user triggered... longer and gentler for anything the
  system decided to show on its own — it should not startle").
- The enrichment system prompt asks Claude to read spoken transcripts "for intent rather than
  literal words" and silently correct mis-hearings — a nod to natural speech, but this is text
  post-processing, not a live conversational persona.

There is no memory of the user's preferences, no personality definition, no emotional tone
modeling, and no latency-target language for a live dialogue (the enrichment call is a background
job, not something the user waits on in a turn-taking sense).

## 5. Memory / personalization — data model

No conversational memory of any kind. Supabase schema (`supabase/migrations/20260729000000_init.sql`)
has exactly **one table**, `public.notes`:

| column | type | purpose |
|---|---|---|
| `id` | uuid (PK, client-generated) | offline-first: device mints the id |
| `user_id` | uuid → `auth.users` | owner, RLS-scoped |
| `created_at` / `updated_at` | timestamptz | `updated_at` is the sync conflict-resolution key |
| `title`, `summary`, `transcript` | text | AI-written / user-spoken content |
| `transcript_edited` | boolean | protects hand-edits from being overwritten |
| `audio_path` | text | path in the private `recordings` storage bucket |
| `duration_ms`, `amplitudes` (jsonb array) | — | waveform rendering |
| `language`, `pinned`, `archived`, `tags` (jsonb) | — | metadata/organization |
| `action_items` (jsonb) | — | AI-extracted tasks/events/emails/reminders, denormalized onto the note |
| `deleted_at` | timestamptz | soft-delete tombstone for multi-device sync |

Plus a private `recordings` Storage bucket (100 MB/file cap, wav/m4a/mp4/mpeg/aac), RLS policies
scoping every row/object to `auth.uid()`, a full-text-search GIN index over title+transcript, and
a trigger that fills `updated_at` on write. Auth is Supabase email OTP (six-digit code) — no
password, no OAuth-provider account system beyond Google Calendar/Gmail scopes (stored via
`expo-secure-store` client-side, not in this schema).

There is no `users`/`profile` table with preferences, no `conversations`/`messages` table, no
embeddings/vector table, no "memories" or "facts about the user" table. "Personalization" is
limited to the on-device library of the user's own notes.

## 6. Hard numbers worth noting

- LLM: **`claude-opus-5`**, called with **`max_tokens: 8000`**, `effort: 'medium'`.
- Input transcript truncated at **24,000 characters**.
- Whisper model: **`whisper-1`**.
- Storage bucket file size cap: **100 MB** per recording ("comfortably past an hour of 16 kHz mono
  speech").
- Background enrichment/sync poll interval: **30,000 ms (30s)**, plus immediate run on
  foregrounding and right after saving a note.
- Recording UI constants: waveform trail **42 bars**; volume sampled every **100 ms**; stored
  waveform sampled every **250 ms**.
- Android silence tolerance extended to **4000 ms** (both `COMPLETE_SILENCE_LENGTH_MILLIS` and
  `POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS`) so a thinking-pause doesn't cut off the note; auto-restart
  capped at **12** consecutive restarts.
- "Today" agenda pulls the next **36 hours** of calendar events.
- Enrichment retry backoff: starts at 60s, doubles up to a **15-minute** cap.
- Up to **12** action items accepted per note, up to **6** tags, title clipped to **120 chars**.

None of these are conversational-AI latency numbers (no round-trip STT→LLM→TTS budget exists
because there is no live dialogue loop).

## 7. Screens in order / onboarding flow

There is no dedicated onboarding wizard, permission-priming carousel, or account-creation flow.
The app opens straight into the **Notes** tab (empty state: "Say something — Tap the microphone
and start talking..."). Flow:

1. **Notes** (default tab) → tap record (bottom-center of tab bar) → **Capture** modal
   (auto-starts listening immediately; requests mic + speech-recognition OS permission the first
   time) → Stop → auto-navigates to **Note detail** for the just-created note.
2. Optional, opt-in, from **Settings** at any later time:
   - "Sync & assistant" section → email → six-digit code → signed in → cloud sync + Claude
     enrichment activate.
   - "Calendar & mail" section → "Connect Google" → OAuth → Today/Inbox tabs populate and action
     items become "runnable."
3. Other tabs (**Today**, **Inbox**) show a passive empty/CTA state ("Add a Google client ID...",
   "Connect Google") until Google is connected.

So the "onboarding" is really progressive disclosure: full core functionality (record/transcribe/
search/play/edit) with zero setup, and two independent, skippable upsell surfaces reached from
Settings for sync+AI and calendar+mail.

## 8. Visual identity tokens (exact values)

From `src/theme/tokens.ts` and `app.json`. Note this is Echo's identity, not any Meera/Vyakti
branding (none exists in the repo).

**App identity**: name "Echo", slug `echo-voice-notes`, scheme `echo://`, bundle id
`com.echo.voicenotes` (both iOS and Android). No app icon or splash image asset files exist in the
repo (no `assets/` directory) — only a splash **background color** is configured:
`#12110E` (same for light/dark in the Expo splash-screen plugin config).

**Color palette** (semantic, "one accent = one meaning" design system):

Dark theme:
- Background `#100F0C`, surface `#191713`, surface-raised `#221F19`, surface-pressed `#2B271F`
- Text `#F4F1E9`, text-muted `#A29C8E`, text-faint `#6E695D`, text-on-accent `#12110E`
- **Ember** (live voice / recording — exclusive meaning) `#F0653A`
- **Sage** (AI/assistant-authored content — exclusive meaning) `#7FC8A9`
- **Gold** (pinned) `#E8B84B`
- Danger `#F0575C`

Light theme:
- Background `#FBF9F4`, surface `#FFFFFF`, surface-pressed `#F1EDE4`
- Text `#16150F`, text-muted `#6B6659`, text-faint `#9A9486`
- Ember `#D9451B`, Sage `#1F6B4F`, Gold `#9A6F0F`, Danger `#C4292E`

**Typography**: serif (Georgia on iOS / `serif` Android) for anything "the user authored or the
app presents as writing" — titles, transcripts, display text; sans (system font) for chrome —
buttons, tabs, labels; monospace (Menlo/`monospace`) for tabular numerics (timers, durations).
Type scale named `display` (34/41, serif), `title` (26/33), `heading` (19/25), `body` (17/28),
`ui` (16/22, sans, 500 weight), `uiSmall` (14/19), `caption` (13/17), `overline` (11/14, uppercase,
weight 700), `numeric` (15/20, mono).

**Motion**: durations `instant 90ms / fast 160ms / base 240ms / slow 380ms / deliberate 620ms`;
ease-out curve `[0.16,1,0.3,1]` for user-triggered motion, symmetric ease `[0.65,0,0.35,1]` for
looping/system motion (e.g. the recording pulse); named spring configs for press feedback and
screen-entry.

**Design rationale (from README "Design notes")**: "The app is a place you talk to, so it leans
warm rather than clinical: ink and paper rather than grey-on-grey." Ember = live voice and nothing
else. Sage = machine-authored content only. Gold = pinned only. Serif/sans split makes "a screen
full of text read like a note rather than a settings panel." The record control sits at the center
of the tab bar, not a corner, "reachable with either thumb from any screen."
