"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Live visibility, not a one-shot reveal: autoplaying figures use it to pause
 * while scrolled away so they never advance unseen.
 */
export function useInView(ref: RefObject<Element | null>, threshold = 0.2) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return inView;
}

/** Advance `step` on an interval while `active`, skipping hidden tabs. */
export function useAutoAdvance(active: boolean, ms: number, step: () => void) {
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      if (!document.hidden) step();
    }, ms);
    return () => window.clearInterval(id);
  }, [active, ms, step]);
}
