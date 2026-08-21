"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Desktop wheel smoothing shares GSAP's ticker with ScrollTrigger. Touch uses
 * native scrolling, and a live reduced-motion change tears the smoother down.
 */
export function SmoothScroll() {
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const root = document.documentElement;
    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;

    const stop = () => {
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
      tick = null;
      // Anchor navigation asks for the live instance; absent means native
      // scrolling is in charge and already correct.
      delete window.__lenis;
    };

    const start = () => {
      stop();
      if (motion.matches || !finePointer.matches) return;
      lenis = new Lenis({
        duration: 1.05,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
      });
      lenis.on("scroll", ({ scroll, limit }) => {
        root.style.setProperty(
          "--scroll-progress",
          String(limit > 0 ? scroll / limit : 0),
        );
        root.dataset.scrolled = scroll > 24 ? "true" : "false";
        ScrollTrigger.update();
      });
      window.__lenis = lenis;
      tick = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    };

    start();
    motion.addEventListener("change", start);
    finePointer.addEventListener("change", start);
    return () => {
      motion.removeEventListener("change", start);
      finePointer.removeEventListener("change", start);
      stop();
    };
  }, []);

  return null;
}
