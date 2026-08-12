# Design Principles — Synthesis

A distilled, cross-referenced set of concrete rules pulled from every skill in this directory:
`animate`, `animation-vocabulary`, `apple-design`, `ask-sonner`, `emil-design-eng`,
`find-animation-opportunities`, `gsap-framer-scroll-animation`, `improve-animations`,
`pick-ui-library`, `prototype`, `review-animations`, `taste-skill` (design-taste-frontend).

Use this file as the quick-reference entry point. Load the individual `SKILL.md` files when you
need the full workflow, output format, or reference tables behind a rule.

---

## 1. Should it animate at all? (the gate before any other decision)

| Frequency seen by user | Verdict |
| --- | --- |
| 100+ times/day (keyboard shortcuts, command palette toggle) | **No animation. Ever.** |
| Tens of times/day (hover states, list navigation) | Remove or drastically reduce — near-imperceptible only |
| Occasional (modals, drawers, toasts, settings) | Standard animation |
| Rare / first-time (onboarding, success, celebration) | Delight budget lives here |

Every animation must name its purpose in one word: **feedback, spatial consistency, state
indication, preventing a jarring change, explanation** (marketing/onboarding only), or **delight**
(rare-tier only). "It looks cool" on a frequently-seen element is not a valid purpose — reject it.

---

## 2. Easing — exact curves, decision order

```css
--ease-out:    cubic-bezier(0.23, 1, 0.32, 1);      /* strong ease-out for UI */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);     /* strong ease-in-out for on-screen movement */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);      /* iOS-like drawer curve (Ionic) */
```

Decision order:
1. Entering or exiting → `ease-out` (or the strong custom curve above)
2. Moving/morphing on screen → `ease-in-out`
3. Hover/color change → `ease` (bare)
4. Constant motion (marquee, progress) → `linear`
5. Default → `ease-out`

**Never `ease-in` on UI** — it delays the exact moment the user is watching, so it *feels* slower
than `ease-out` even at an identical duration. Built-in CSS easings are considered too weak for
deliberate motion; pull stronger curves from easing.dev / easings.co rather than hand-rolling.

GSAP-specific: use `ease: 'none'` whenever `scrub` is active — any real easing feels wrong once
motion is scroll-linked. Framer Motion whileInView entrances commonly use
`ease: [0.21, 0.47, 0.32, 0.98]` or `[0.16, 1, 0.3, 1]`.

---

## 3. Duration — exact ms budgets

| Element | Duration |
| --- | --- |
| Button press feedback | 100–160ms |
| Tooltips, small popovers | 125–200ms |
| Dropdowns, selects | 150–250ms |
| Modals, drawers | 200–500ms |
| Marketing / explanatory | Can be longer |

**Rule: UI animations stay under 300ms.** A 180ms dropdown reads as more responsive than a 400ms
one at identical logic. Perceived performance rules of thumb: a faster-spinning spinner makes load
*feel* faster at identical load time; once one tooltip in a toolbar is open, subsequent tooltips
should skip both delay and animation (`transition-duration: 0ms`) so the toolbar feels instant.

---

## 4. Spring physics — exact configs

```js
// Apple-style (recommended, easier to reason about)
{ type: "spring", duration: 0.5, bounce: 0.2 }

// Traditional physics (more control)
{ type: "spring", mass: 1, stiffness: 100, damping: 10 }
```

- Keep `bounce` at **0.1–0.3**; avoid bounce in most UI. Reserve visible bounce for drag-to-dismiss
  and momentum-driven, physical interactions.
- Apple's own design-system values (from *Designing Fluid Interfaces*, translated to
  damping-ratio + response):

  | Interaction | Damping | Response |
  | --- | --- | --- |
  | Move / reposition (e.g. PiP) | `1.0` | `0.4` |
  | Rotation | `0.8` | `0.4` |
  | Drawer / sheet | `0.8` | `0.3` |

  Damping `1.0` = critically damped, no overshoot — the safe default for anything not carrying
  gesture momentum. Damping `~0.8` = slight bounce, use only when the motion followed a flick or
  drag release.
- Springs carry velocity through an interruption; keyframes and CSS `@keyframes` restart from
  zero. That's why gesture-driven, reversible, or rapidly-retriggered motion (drag, toasts,
  toggles) must use springs or CSS *transitions*, never keyframes.
- Velocity handoff on drag release: `relativeVelocity = gestureVelocity / (targetValue − currentValue)`.
  Framer Motion/Motion usually just wants the raw px/s velocity.
- Momentum projection (flick landing point), Apple's exact function:
  ```js
  function project(initialVelocity, decelerationRate = 0.998) {
    return (initialVelocity / 1000) * decelerationRate / (1 - decelerationRate);
  }
  const target = nearestSnapPoint(currentPosition + project(releaseVelocity));
  ```
- Rubber-banding at a drag boundary:
  ```js
  function rubberband(overshoot, dimension, constant = 0.55) {
    return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
  }
  ```

---

## 5. Properties, transforms, physicality

- **Animate only `transform` and `opacity`.** They skip layout and paint and run on the GPU.
  `width`/`height`/`margin`/`padding`/`top`/`left` trigger layout + paint + composite every frame.
  `clip-path` is the sanctioned fourth property for reveals/masks. `height` is tolerated only for
  accordions (no transform equivalent).
- **Never `transform: scale(0)`** as an entrance. Nothing in the real world appears from nothing.
  Start at `scale(0.9–0.97)` + `opacity: 0`.
- **`transform-origin` at the trigger** for popovers/dropdowns/menus/tooltips
  (`var(--transform-origin)` in Base UI). **Modals are exempt** — not anchored to a trigger, stay
  `transform-origin: center`.
- **Percentages in `translate()`** are relative to the element's own size —
  `translateY(100%)` moves by its own height regardless of content (how Sonner/Vaul position
  toasts/drawers). Prefer over hardcoded pixels.
- **Framer/Motion shorthand props (`x`, `y`, `scale`) are NOT hardware-accelerated** — they run
  on the main thread via `requestAnimationFrame` and drop frames under load. Use the full
  transform string:
  ```jsx
  <motion.div animate={{ x: 100 }} />                          // drops frames under load
  <motion.div animate={{ transform: "translateX(100px)" }} />  // hardware accelerated
  ```
- **Never drive a child's transform through a CSS variable set on the parent** — it recalculates
  styles for every child. Set `transform` on the element directly.
- `scale()` scales children too (font, icons, content) — a feature for press feedback, not a bug.
- `clip-path: inset(top right bottom left)` is a first-class animation tool: reveals, hold-to-delete
  overlays, tab color transitions (duplicate the tab, clip the active copy), before/after sliders.

---

## 6. Interruptibility, gestures, drag

- **CSS transitions retarget from the current value mid-animation; `@keyframes` restart from
  zero.** Use transitions (or springs) for anything triggered rapidly or reversibly: toasts,
  toggles, drags, expand/collapse. Reserve keyframes for predetermined, uninterruptible motion.
- **Always animate from the presentation (current) value on interrupt**, never the target/logical
  value — read the live on-screen transform and start the new animation from there, or you get a
  visible jump.
- **Momentum dismissal**: don't gate on distance alone. Compute
  `velocity = Math.abs(dragDistance) / elapsedMs`; dismiss if `velocity > ~0.11` even if the
  distance threshold wasn't crossed.
- **Pointer capture** (`setPointerCapture`) once a drag starts, so tracking survives the pointer
  leaving the element's bounds. **Multi-touch protection**: `if (isDragging) return` on new touch
  points — switching fingers mid-drag otherwise makes the element jump.
- **Friction over hard stops** at drag boundaries — apply rising resistance (rubber-banding, §4)
  rather than an invisible wall.
- **Enter and exit along the same path.** A toast/panel that slides in from one edge must leave
  through that same edge — symmetric paths are what make swipe-to-dismiss feel obvious.
- **Asymmetric timing where the user is deciding vs. where the system responds**: slow the
  deliberate phase (hold-to-confirm press: `2s linear`), snap the release (`200ms ease-out`).

---

## 7. Stagger, crossfades, reduced motion

- **Stagger 30–80ms between items** for group entrances. Longer feels slow. Stagger is decorative
  — it must never block interaction while it plays.
- **Blur masks an imperfect crossfade** that no amount of easing/duration tuning fixes:
  `filter: blur(2px)` + `opacity: 0.7` during the transition, blended back to normal. Keep blur
  under 20px — expensive, especially in Safari.
- **`prefers-reduced-motion: reduce` means fewer and gentler animations, not zero.** Keep
  opacity/color transitions that aid comprehension; drop transform-based movement.
  ```css
  @media (prefers-reduced-motion: reduce) {
    .element { animation: fade 0.2s ease; }
  }
  @media (hover: hover) and (pointer: fine) {
    .element:hover { transform: scale(1.05); } /* touch fires false hovers on tap */
  }
  ```
- Apple's broader reduced-motion checklist: also respect `prefers-reduced-transparency` (raise
  background opacity, drop blur) and `prefers-contrast: more` (near-solid backgrounds, defined
  border). Avoid full-viewport moving backgrounds and slow oscillations near 0.2 Hz (one cycle per
  ~5s) regardless of the media query.

---

## 8. Typography — exact scale, tracking, leading

From Apple's WWDC typography guidance, applied to the web:

- **Tracking is size-specific, never one `letter-spacing` for every size.** Large display text
  wants negative tracking; small text wants slightly positive tracking. Example:
  `letter-spacing: -0.02em` on a `clamp(2rem, 5vw, 4rem)` display heading; body text near `0`.
- **Leading tracks size inversely** — tight on large headings (`line-height: 1.05`), looser on
  body copy. Loosen for scripts with tall ascenders/descenders; tighten for dense UI.
- **Build hierarchy from weight + size + leading together**, not size alone.
- Default to the platform system font (`font: 100%/1.5 system-ui, sans-serif`) before a custom
  face — it ships optical sizing and tracking tables already tuned.

From `taste-skill`'s type-scale defaults (landing/marketing pages):

- **Display/headline default:** `text-4xl md:text-6xl tracking-tighter leading-none`. For most
  heroes, cap at `text-4xl md:text-5xl lg:text-6xl` — only reach `text-6xl md:text-7xl` when the
  headline is 3–5 words. A 4-line hero headline is a font-size error, not a copy-length error.
- **Body/paragraph default:** `text-base text-gray-600 leading-relaxed max-w-[65ch]`.
- **Sans-serif is the default display face**, not Inter. Prefer Geist, Outfit, Cabinet Grotesk,
  Satoshi, or a brand-appropriate alternative. Inter is acceptable only for an explicitly
  neutral/Linear-style brief or accessibility-first/public-sector work.
- **Serif is discouraged as a default** — "feels creative/premium" is not sufficient justification.
  Use it only when the brief explicitly names a serif, or the aesthetic is genuinely
  editorial/luxury/publication/heritage and you can defend the specific choice. `Fraunces` and
  `Instrument_Serif` are specifically banned as defaults (the two most-overused LLM display
  serifs).
- **Italic descender clearance:** any italic word containing `y g j p q` needs
  `line-height: 1.1` minimum plus `pb-1`/`mb-1` reserve, or `leading-none` clips the descender.
- **Emphasis inside a headline** uses italic or bold of the *same* font family — never inject a
  second font family into one headline for emphasis.

---

## 9. Spacing, layout, density

- **Breakpoints:** `sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`. Contain page width with
  `max-w-7xl mx-auto` or `max-w-[1400px] mx-auto`.
- **Viewport stability:** never `h-screen` for a full-height hero — use `min-h-[100dvh]` to avoid
  iOS Safari address-bar jump.
- **Grid over flex-math:** never hand-compute flexbox percentages
  (`w-[calc(33%-1rem)]`); use CSS Grid (`grid grid-cols-1 md:grid-cols-3 gap-6`).
- **Density dial → section padding:** Art Gallery/spacious `py-32` to `py-48`; Daily App
  `py-16` to `py-24`; Cockpit/dense `font-mono` numerals, hairline dividers instead of cards.
- **Hero top padding cap:** max `pt-24` at desktop — beyond that, hero content reads as
  floating/broken, not intentional.
- **Hero content cap:** headline ≤ 2 lines, subtext ≤ 20 words and ≤ 4 lines, CTAs visible without
  scrolling; at most 4 text elements total (eyebrow *or* brand strip, headline, subtext, CTAs) —
  no trust micro-strip or pricing teaser stuffed into the hero.
- **Navigation:** single line at desktop, height capped at 80px (default 64–72px).
- **Shape Consistency Lock:** pick one corner-radius system for the whole page (all-sharp / all
  12–16px soft / all-pill for interactive elements) and apply it everywhere.
- **Section-layout repetition ban:** a layout family (3-col cards, zig-zag split, full-width
  quote…) can appear at most once per page; an 8-section page needs at least 4 different layout
  families. Max 2 consecutive image+text split ("zigzag") sections.
- **Eyebrow restraint:** max 1 uppercase micro-label eyebrow per 3 sections (hero counts as one).
  Mechanical check: count `uppercase tracking` instances, must be ≤ `ceil(sectionCount / 3)`.
- **Bento grids:** exact cell count for content count (N items → N cells, no empty filler cells);
  vary tile sizes/backgrounds so at least 2–3 cells carry real visual weight (image, gradient,
  pattern) instead of uniform white-on-white text tiles.

---

## 10. Color — exact bans and formula

- **Max one accent color per project, saturation under 80% by default.** Neutral bases (Zinc /
  Slate / Stone) + one high-contrast accent (Emerald, Electric Blue, Deep Rose, Burnt Orange…).
- **"The Lila Rule":** no default AI-purple/blue glow gradients or automatic button glows unless
  the brand explicitly calls for purple.
- **Color Consistency Lock:** once an accent is picked, it's used identically in every section —
  no surprise teal badge in the footer of a rose-accented page.
- **No pure `#000000` or `#ffffff`.** Use off-black (e.g. zinc-950) and off-white — pure values
  kill perceived depth.
- **Premium-consumer palette ban:** the beige/cream background + brass/clay/oxblood/ochre accent +
  espresso-near-black text combination (specific banned hex families:
  backgrounds `#f5f1ea #f7f5f1 #fbf8f1 #efeae0 #ece6db #faf7f1 #e8dfcb`; accents
  `#b08947 #b6553a #9a2436 #9c6e2a #bc7c3a #7d5621`; text `#1a1714 #1a1814 #1b1814`) is banned as
  the default reach for cookware/wellness/artisan/luxury briefs — it is the single most-repeated
  AI palette tell. Rotate instead: Cold Luxury (silver-grey/chrome/smoke), Forest (deep
  green/bone/amber), Black-and-Tan (off-black + warm tan, no beige), Cobalt+Cream, Terracotta+Slate,
  Olive+Brick+Paper, or pure monochrome + one saturated pop.
- **Dark mode:** design both modes from the start; respect `prefers-color-scheme`; WCAG AA minimum
  contrast for body text, AAA target for hero copy; brand accent must stay recognizable (not
  desaturated) in dark mode.

---

## 11. Buttons, forms, states — mandatory a11y checks

- **Press feedback:** `transform: scale(0.97)` on `:active`,
  `transition: transform 160ms var(--ease-out)`; keep the scale subtle, `0.95–0.98`.
- **Button contrast check:** no white-on-white, no `bg-white` CTA with `text-white` label, no
  ghost button over a photo with no scrim/stroke. WCAG AA minimum: 4.5:1 body, 3:1 for text ≥18px.
- **CTA labels must fit one line** at desktop — shorten the label (1–3 words for primary CTAs)
  rather than letting it wrap or artificially constraining button width.
- **No duplicate CTA intent** on one page — "Get in touch" / "Contact us" / "Let's talk" are the
  same intent; pick one label and reuse it everywhere.
- **Forms:** label above input, helper text present in markup, error text below input,
  `gap-2` between input blocks, never placeholder-as-label. Inputs/placeholders/focus
  rings/helper/error text must all pass WCAG AA against the section background.
- **Full interaction cycles required**, not just the success state: skeletal loaders shaped like
  the final layout (not generic spinners), composed empty states, inline/contextual error states.

---

## 12. What makes something read as "vibecoded" vs. designed

Concrete, checkable tells (any single one is a giveaway; several together is a slop page):

- Centered hero over a dark mesh/purple gradient background; three identical feature cards in a row.
- `Inter` + `slate-900` used as an unexamined default.
- Infinite-loop micro-animations on every card "because motion library is available."
- Generic glassmorphism applied to everything regardless of hierarchy.
- Em-dash (`—`) anywhere visible — headline, eyebrow, body, quote attribution, button, alt text.
  Treated as a hard, zero-tolerance ban, not "use sparingly" — the em-dash is the single
  most-repeated LLM stylistic tell.
- Section-number eyebrows (`00 / INDEX`, `001 · Capabilities`), version labels in the hero
  (`V0.6`, `BETA`), decoration text strips at the hero bottom (`BRAND. MOTION. SPATIAL.`).
- Div-based fake product screenshots (fake terminal, fake task list, fake dashboard built from
  styled `<div>`s) — the #1 visual tell for "AI built this."
- Fake-precise, unsourced numbers (`92%`, `4.1×`, `48k`) with no real data behind them.
- Generic names ("John Doe"), generic avatars (SVG eggs / Lucide user icon), startup-slop brand
  names ("Acme", "Nexus", "SmartFlow"), filler verbs ("Elevate", "Unleash", "Next-Gen").
- Scroll cues ("↓ Scroll to explore"), decorative colored status dots with no real semantic
  meaning, locale/weather strips ("LIS 14:23 · 18°C") on a brief that isn't genuinely
  place-focused.
- `border-t` + `border-b` on every row of a long spec/list table — the laziest possible long-list
  layout; use grouped chunks, a card grid, or tabs instead once a list exceeds ~5 items.
- Animating a keyboard-triggered or 100+/day action at all (command palette, shortcuts) — the
  single clearest sign the builder never asked "should this animate."
- `transition: all` instead of naming exact properties; `ease-in` on a UI entrance;
  `transform-origin: center` on a trigger-anchored popover; `scale(0)` entrances.

What separates designed work: every animation has a one-word purpose you can name, every color/
type/spacing choice is a value you can defend, one accent color and one corner-radius system held
consistently across the whole page, real images (generated or sourced) instead of placeholder
divs, and a hero that fits the initial viewport without forcing a scroll to find the CTA.

---

## 13. GSAP ScrollTrigger recipes

Setup (always required before any ScrollTrigger use):
```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
```

**Critical rules:** always `ease: 'none'` when `scrub` is active; in React use `useGSAP` from
`@gsap/react` (never plain `useEffect` — it auto-cleans ScrollTriggers on unmount and handles
StrictMode's double-invoke); remove `markers: true` before production; for horizontal-scroll `end`
values use the function form (`end: () => "+=" + el.offsetWidth`) so it recalculates on resize;
animate only `transform`/`opacity`.

**Fade-in batch reveal** (better than one ScrollTrigger per element):
```js
ScrollTrigger.batch('.card', {
  onEnter: els => gsap.from(els, { opacity: 0, y: 50, stagger: 0.15, duration: 0.8, ease: 'power2.out' }),
  start: 'top 85%',
});
```

**Scrub / scroll-linked** (no pin):
```js
gsap.to('.hero-image', {
  scale: 1.3, opacity: 0, ease: 'none',
  scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: true }
});
```

**Pinned timeline:**
```js
const tl = gsap.timeline({
  scrollTrigger: { trigger: '.story-section', start: 'top top', end: '+=300%', pin: true, scrub: 1, anticipatePin: 1 }
});
tl.from('.title', { opacity: 0, y: 60, duration: 1 })
  .from('.image', { scale: 0.85, opacity: 0, duration: 1 }, '-=0.3')
  .from('.text', { x: 80, opacity: 0, duration: 1 }, '-=0.3');
```

**Sticky-stack (cards pin and stack, react component skeleton):**
```tsx
useGSAP(() => {
  const cardEls = gsap.utils.toArray<HTMLElement>('.stack-card');
  cardEls.forEach((card, i) => {
    if (i === cardEls.length - 1) return;
    ScrollTrigger.create({
      trigger: card, start: 'top top',                 // pin at viewport top — NOT "top center"
      endTrigger: cardEls[cardEls.length - 1], end: 'top top',
      pin: true, pinSpacing: false,
    });
    gsap.to(card, {
      scale: 0.92, opacity: 0.55, ease: 'none',
      scrollTrigger: { trigger: cardEls[i + 1], start: 'top bottom', end: 'top top', scrub: true },
    });
  });
}, { scope: ref });
```
Common failure: using `start: "top center"` or `"top 80%"` instead of `"top top"` — the trigger
fires halfway through the scroll instead of pinning cleanly at the viewport top.

**Horizontal scroll / pan:**
```js
const sections = gsap.utils.toArray('.panel');
gsap.to(sections, {
  xPercent: -100 * (sections.length - 1), ease: 'none',
  scrollTrigger: {
    trigger: '.horizontal-section', pin: true, scrub: 1,
    snap: 1 / (sections.length - 1),
    end: () => `+=${document.querySelector('.panels-container').offsetWidth}`,
    invalidateOnRefresh: true,
  }
});
```

**Character stagger text reveal (SplitType):**
```js
const text = new SplitType('.hero-title', { types: 'chars' });
gsap.from(text.chars, {
  opacity: 0, y: 80, rotateX: -90, stagger: 0.03, duration: 0.6, ease: 'back.out(1.7)',
  scrollTrigger: { trigger: '.hero-title', start: 'top 85%', toggleActions: 'play none none none' }
});
```

**Scroll progress bar:**
```js
gsap.to('.progress-bar', {
  scaleX: 1, ease: 'none', transformOrigin: 'left center',
  scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 }
});
```

**Lenis smooth scroll + GSAP:**
```js
const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
lenis.on('scroll', ScrollTrigger.update);
```

**Responsive with matchMedia + reduced motion guard:**
```js
gsap.matchMedia().add(
  { isDesktop: '(min-width: 768px)', isMobile: '(max-width: 767px)', noMotion: '(prefers-reduced-motion: reduce)' },
  ctx => {
    if (ctx.conditions.noMotion) return;
    gsap.from('.box', { x: ctx.conditions.isDesktop ? 200 : 0, y: ctx.conditions.isMobile ? 100 : 0, opacity: 0,
      scrollTrigger: { trigger: '.box', start: 'top 80%' } });
  }
);
```

`toggleActions` cheat sheet: `"onEnter onLeave onEnterBack onLeaveBack"`. Most common for a
one-shot entrance: `"play none none none"`.

`start`/`end` syntax: `"[trigger edge] [viewport edge]"` — e.g. `"top 80%"` = trigger's top hits
80% down the viewport; `"+=200"` / `"+=200%"` = offset after the trigger position.

---

## 14. Framer Motion / Motion (v12) scroll recipes

Setup:
```js
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'motion/react';
// framer-motion still works, same API — motion/react is the current package
```
Every file using these hooks needs `'use client'` in Next.js App Router.

**Scroll-triggered (fires once):**
```jsx
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-80px' }}
  transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
/>
```

**Scroll-linked (continuous, must use `style`, not `animate`):**
```jsx
const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
return <motion.div style={{ y }} />;
```
`offset` pairs: `['start end', 'end start']` = tracked the entire time the element is in view;
`['start start', 'end start']` = tracks while the element exits the top.

**Smoothing a progress value:**
```js
const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
```

**Reusable ScrollReveal wrapper:**
```tsx
export function ScrollReveal({ children, delay = 0, duration = 0.6, once = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >{children}</motion.div>
  );
}
```

**Staggered card grid via variants** (variants propagate parent→children automatically):
```tsx
const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] } }
};
// <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
//   {cards.map(c => <motion.div key={c.id} variants={cardVariants} />)}
```

**Scroll-linked navbar (hide on scroll down, show on scroll up):**
```tsx
useMotionValueEvent(scrollY, 'change', latest => {
  setScrolled(latest > 80);
  setHidden(latest > prevRef.current && latest > 200);
  prevRef.current = latest;
});
```

**Reduced motion guard:**
```tsx
const prefersReducedMotion = useReducedMotion();
const y = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [100, -100]);
```

**Common pitfalls to avoid:** `<div style={{ y }}>` on a plain element does nothing — must be
`<motion.div style={{ y }}>`; `useScroll()` without `target`/`offset` tracks the whole page, not
the element; scroll-linked values go in `style`, never `animate` (which only runs on mount/unmount).

---

## 15. Forbidden scroll/animation patterns (both libraries)

- `window.addEventListener('scroll', ...)` — no batching, jank-prone. Use `useScroll()`,
  `ScrollTrigger`, `IntersectionObserver`, or CSS `animation-timeline: view()` instead.
- Storing scroll progress in React `useState` inside a scroll handler — re-renders every frame.
  Use motion values (`useMotionValue`/`useTransform`) instead.
- `requestAnimationFrame` loops that write to React state.
- Wrapping static, non-animating content in `layout`/`layoutId` props "for safety" — costs
  measurement work for nothing.
- More than one horizontal marquee per page.
- GSAP for a moment with no stated reason ("GSAP because it's available" is not motivation) —
  every ScrollTrigger, pin, and marquee needs a one-sentence justification (hierarchy,
  storytelling, feedback, or state transition).

---

## 16. Library picks (when the task needs a dependency, not hand-rolled code)

| Task | Library |
| --- | --- |
| Unstyled accessible primitives (dialog, popover, menu, select) | base-ui |
| Command palette (⌘K) | cmdk |
| Toasts | Sonner |
| General animation (springs, layout, gesture) | Motion (motion.dev) |
| Animated numbers/counters | NumberFlow |
| Drag and drop | dnd kit |
| Long-list virtualization | Virtuoso |
| State management | zustand |
| Conditional className strings | clsx (cva if truly variant-shaped) |

Reach for a full animation library only when the motion needs springs, layout animation, exit
animation, or gesture-driven values — a hover or fade is plain CSS, no dependency required.

---

## 17. Pre-flight checklist (condensed)

Before calling any landing page / marketing page done:

- [ ] Zero em-dashes anywhere visible.
- [ ] One accent color, one corner-radius system, one theme (light/dark), applied everywhere.
- [ ] Every CTA passes WCAG AA contrast and fits one line.
- [ ] Hero fits the initial viewport with no scroll needed to find the CTA.
- [ ] No two sections share the same layout family more than necessary; ≤2 consecutive zig-zag splits.
- [ ] Eyebrow count ≤ `ceil(sectionCount / 3)`.
- [ ] Real images (generated or sourced), not div-based fake screenshots.
- [ ] Every animation's purpose is nameable in one sentence; keyboard/100+-per-day actions have none.
- [ ] `prefers-reduced-motion` and `hover`/`pointer` media queries are handled everywhere motion exists.
- [ ] Both light and dark mode tested, not just assumed to work.
