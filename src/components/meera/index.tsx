"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState } from "react";
import { useWebglAllowed } from "@/components/head";

const MeeraScene = dynamic(() => import("./meera-scene"), { ssr: false });

export function MeeraPortrait({ className = "" }: { className?: string }) {
  const allowed = useWebglAllowed();
  const root = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNearViewport(entry.isIntersecting),
      { rootMargin: "45% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={root} className={className} aria-hidden>
      {allowed && nearViewport ? (
        <Suspense fallback={<MeeraFallback />}>
          <MeeraScene />
        </Suspense>
      ) : (
        <MeeraFallback />
      )}
    </div>
  );
}

function MeeraFallback() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute top-[46%] left-1/2 h-[54%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-[48%_52%_45%_55%/40%_40%_60%_60%] bg-[linear-gradient(135deg,var(--color-raised),var(--color-hairline))] shadow-[0_28px_90px_rgb(17_18_15/10%)]" />
      <div className="absolute top-[17%] left-1/2 h-[58%] w-[54%] -translate-x-1/2 rounded-t-[50%] border-x border-t border-bone/30" />
      <div className="absolute top-[40%] left-[43%] h-2 w-2 rounded-full bg-bone/70" />
      <div className="absolute top-[40%] left-[56%] h-2 w-2 rounded-full bg-bone/70" />
      <div className="absolute top-[54%] left-1/2 h-px w-12 -translate-x-1/2 bg-ember/70" />
    </div>
  );
}
