"use client";

import { Suspense, useSyncExternalStore } from "react";
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
