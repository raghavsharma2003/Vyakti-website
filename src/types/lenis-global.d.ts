/**
 * `smooth-scroll.tsx` publishes its Lenis instance here so in-page anchor
 * navigation can hand a scroll target to the smoother that owns the scroll
 * position, instead of fighting it with `scrollIntoView`. It is absent
 * whenever Lenis is not running (touch, reduced motion), which is exactly the
 * case where native scrolling is already correct.
 */
interface LenisBridge {
  scrollTo: (
    target: HTMLElement | number,
    options?: { offset?: number; immediate?: boolean },
  ) => void;
}

interface Window {
  __lenis?: LenisBridge;
}
