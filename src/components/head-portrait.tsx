"use client";

import { useEffect, useRef } from "react";
import { VyaktiHead } from "@/components/head";

/**
 * The face held as a portrait rather than driven by scroll. It drifts slowly
 * across the assembled range so it is never perfectly still, and never busy.
 */
export function HeadPortrait({ className = "" }: { className?: string }) {
  const progress = useRef({ current: 0.4 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let start: number | null = null;
    const PERIOD_MS = 17_000;

    const tick = (t: number) => {
      start ??= t;
      const phase = ((t - start) % PERIOD_MS) / PERIOD_MS;
      // 0.34 to 0.56: assembled, drifting just into the speaking window.
      progress.current.current = 0.45 + Math.sin(phase * Math.PI * 2) * 0.11;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <VyaktiHead progress={progress.current} className={className} />;
}
