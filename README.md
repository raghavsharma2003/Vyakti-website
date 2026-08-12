# vyakti.ai

Marketing and research site for **Vyakti**, an AI research lab working on human
indistinguishability in conversation. Built with Next.js 16 (App Router,
Turbopack), React 19, Tailwind v4 and Three.js.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the build
npx eslint .     # lint
npx tsc --noEmit # typecheck
```

## Structure

```
src/app/            routes: /, /research, /meera, /company
  opengraph-image   generated 1200x630 social card
  sitemap.ts        route list for search engines
  robots.ts
src/components/
  hero-stage        pinned hero: owns the scroll runway and copy beats
  head/             the WebGL face (scene, shaders, capability gate)
  turn-diagram      annotated conversation figure
  site-header       site-footer  ui/cta  reveal  smooth-scroll
src/lib/site.ts     copy source of truth: nav, footer, research tracks
docs/research/      competitor and landscape research behind the positioning
```

## Design system

Tokens live in `src/app/globals.css`. Colours resolve through `--c-*` custom
properties so the dark and light themes are one set of semantic names, not two
parallel stylesheets.

- **Type.** One family (Geist) plus Geist Mono for labels and data. Tracking is
  size-specific and tightens as type grows.
- **Colour.** Warm near-black surfaces with a single ember accent, carried over
  from the product build so the site and the app read as one brand. Solid ember
  fills use `--color-on-ember`, which flips per theme to hold AA contrast.
- **Motion.** One easing family and four durations. Scroll reveals fire once and
  stay revealed. Everything collapses under `prefers-reduced-motion`.

## The face

`/models/head-geo.glb` is surface-sampled into a 72k point cloud (26k on small
screens) and drawn with a custom shader. Scroll progress drives four beats:
assemble, listen, speak, disperse.

Two things are load-bearing:

- Sampling uses a **seeded PRNG**, so the cloud is identical on every render and
  the pass stays pure enough to run during render.
- The animation loop reads uniforms off the **live material ref**, not a
  memoised object. Suspense can replay the component, and a closure captured
  before the replay animates an orphaned copy while the material that is
  actually on screen keeps its initial values.

The page degrades to a soft warm gradient when WebGL is unavailable or the user
has asked for reduced motion.

## Credits

Head geometry is the "Infinite" head scan by Lee Perry-Smith
(Infinite-Realities), distributed with three.js under CC BY 3.0. Full details in
`public/models/CREDITS.md`.
