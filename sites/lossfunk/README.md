# lossfunk.vyakti.ai

The Vyakti research proposal for the Lossfunk residency: a static, 14-slide
deck (desktop) that becomes a scrolling page on phones and tablets.

- Deployed by the Vercel project `vyakti-lossfunk` with this folder as its
  root directory. No build step: the files here are served as they are.
- `face.js` loads the ink head model and its rig from
  `https://www.vyakti.ai/models/ink-lab/`, so those files must stay published
  by the main site. It retries twice before falling back to the face-less hero.
- three.js r128 comes from cdnjs; fonts from Google Fonts.
- Desktop deck mode is
  `(min-width: 1000px) and (min-height: 540px) and (min-aspect-ratio: 5/4)`.
  Every slide must fit one screen there. The root size,
  `clamp(10.5px, min(1.19vw, 2.12vh), 30px)`, was raised from
  `min(1.04vw, 1.86vh)` on 2026-10-14 after the owner found the deck too small.
  At that size every slide fit at 12 tested sizes from 1024x768 to 2560x1300.

## Visit recording (added 2026-10-14)

Every visit is recorded in detail, for the owner to see who read what.

- `v/s.js` (loaded by `index.html`): a visitor id per browser and a session per tab. It records the slide
  entered and left (with time and active time), scroll depth, every click (described by what was clicked),
  navigation keys, copy and text selection, hover dwell, tab switches, idle time, resizes, errors and
  load speed. Device, screen, timezone, languages and GPU go in the session's context. `?r=<name>`
  (also `ref`, `via`, `utm_*`) tags a visit, and the first tag a browser arrives with is remembered.
- `v/r.js` is rrweb 2.1.6 (session replay). `v/p.js` and `v/p.css` are rrweb-player 2.1.6, used by `/admin`.
  They are vendored under neutral names so content blockers leave them alone.
- `api/e.js` stores batches in the Neon project `vyakti-lossfunk-analytics` (`DATABASE_URL`) and adds IP
  and Vercel geo headers. Replay chunks are stored gzipped.
- `middleware.js` logs every fetch of the page itself into `page_hits`, before any script runs. That
  catches visitors with JavaScript off, and link-preview bots that fetch the URL the moment it is shared.
- `/admin` (key `ADMIN_KEY`, read through `api/q.js`) lists sessions, shows the reading funnel and raw page
  fetches, and plays each session back. Opening it marks that browser as the owner's (`vy_me`), so the
  owner's own visits are flagged and hidden by default. Headless browsers are flagged as bots.
