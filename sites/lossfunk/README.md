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
