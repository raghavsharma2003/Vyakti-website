"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Lenis smooth scroll, wired to a single rAF loop.
 *
 * Also publishes the page scroll progress onto <html> as `--scroll-progress`
 * (0 → 1) so CSS and the WebGL scene can read one shared source of truth
 * instead of each registering their own scroll listener.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.05,
      // Gentle exponential ease-out. Anything springier reads as a gimmick.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
    });

    const root = document.documentElement;
    lenis.on("scroll", ({ scroll, limit }: { scroll: number; limit: number }) => {
      root.style.setProperty(
        "--scroll-progress",
        String(limit > 0 ? scroll / limit : 0),
      );
      root.dataset.scrolled = scroll > 24 ? "true" : "false";
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
