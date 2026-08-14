"use client";

import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";

const HeadScene = dynamic(() => import("./head-scene"), { ssr: false });

export type Progress = { current: number };

/** Probed once and cached; neither answer changes over the page's lifetime. */
let webglSupport: boolean | null = null;

function canRunScene() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (webglSupport === null) {
    try {
      const probe = document.createElement("canvas");
      webglSupport = Boolean(
        probe.getContext("webgl2") ?? probe.getContext("webgl"),
      );
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}

/**
 * True when the browser can run the scene and the user has not asked for
 * reduced motion. Read through useSyncExternalStore so the server renders the
 * fallback and the client swaps in without a state update inside an effect.
 */
export function useWebglAllowed() {
  return useSyncExternalStore(
    subscribeToMotionPreference,
    canRunScene,
    () => false,
  );
}

function subscribeToMotionPreference(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * The face. Renders a point cloud sampled from a real head scan; `progress`
 * is a mutable 0 to 1 value the caller updates in its own animation frame, so
 * the scene never triggers a React render while scrolling.
 */
export function VyaktiHead({
  progress,
  className = "",
}: {
  progress: Progress;
  className?: string;
}) {
  const allowed = useWebglAllowed();
  const root = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(true);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNearViewport(entry.isIntersecting),
      { rootMargin: "50% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={root} className={className} aria-hidden>
      {allowed && nearViewport ? (
        <Suspense fallback={<HeadFallback />}>
          <HeadScene progress={progress} />
        </Suspense>
      ) : (
        <HeadFallback />
      )}
    </div>
  );
}

/**
 * Stands in for the scene when WebGL is unavailable or motion is reduced:
 * a soft warm light rather than an obviously missing asset.
 */
export function HeadFallback() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute top-1/2 left-1/2 aspect-[0.72] h-[58%] -translate-x-1/2 -translate-y-1/2 rounded-[48%_52%_46%_54%/42%_43%_57%_58%] border border-bone/30 bg-[radial-gradient(circle_at_55%_40%,transparent_0_34%,color-mix(in_oklab,var(--color-ember)_10%,transparent)_72%)]" />
      <div className="absolute top-[44%] left-[43%] h-1.5 w-1.5 rounded-full bg-bone/50" />
      <div className="absolute top-[44%] left-[56%] h-1.5 w-1.5 rounded-full bg-bone/50" />
      <div className="absolute top-[57%] left-1/2 h-px w-10 -translate-x-1/2 bg-bone/30" />
    </div>
  );
}
