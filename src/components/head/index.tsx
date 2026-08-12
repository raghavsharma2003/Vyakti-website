"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";

const HeadScene = dynamic(() => import("./head-scene"), { ssr: false });

export type Progress = { current: number };

/** True when the browser can actually run the scene and the user wants motion. */
export function useWebglAllowed() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      const probe = document.createElement("canvas");
      const ctx = probe.getContext("webgl2") ?? probe.getContext("webgl");
      if (!ctx) return;
    } catch {
      return;
    }
    setAllowed(true);
  }, []);

  return allowed;
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

  return (
    <div className={className} aria-hidden>
      {allowed ? (
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
    <div
      className="h-full w-full"
      style={{
        background:
          "radial-gradient(46% 42% at 52% 45%, color-mix(in oklab, var(--color-ember) 18%, transparent) 0%, color-mix(in oklab, var(--color-ember) 5%, transparent) 45%, transparent 72%)",
      }}
    />
  );
}
