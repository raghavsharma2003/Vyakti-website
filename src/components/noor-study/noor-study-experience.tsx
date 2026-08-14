"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft } from "@phosphor-icons/react/ArrowLeft";
import { ArrowUpRight } from "@phosphor-icons/react/ArrowUpRight";
import { createNoorRuntime } from "./runtime";

const NoorCanvas = dynamic(() => import("./noor-canvas"), {
  ssr: false,
  loading: () => <div className="noor-study-loading" aria-hidden="true" />,
});

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP, ScrollTrigger);

const BEATS = [
  { at: 0.1, title: "Diffusion", copy: "Signals search for a human outline." },
  { at: 0.32, title: "Consolidation", copy: "The outline resolves into one stable identity." },
  { at: 0.5, title: "Attention", copy: "Noor settles, makes eye contact and listens." },
  { at: 0.7, title: "Voice", copy: "Jaw, lips and inner mouth move as one anatomy." },
  { at: 0.84, title: "Presence", copy: "The expression closes into a quiet, readable person." },
] as const;

function canRender() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function nearestBeat(progress: number) {
  let closest = 0;
  let difference = Number.POSITIVE_INFINITY;
  BEATS.forEach((beat, index) => {
    const next = Math.abs(beat.at - progress);
    if (next < difference) {
      difference = next;
      closest = index;
    }
  });
  return closest;
}

export default function NoorStudyExperience() {
  const root = useRef<HTMLDivElement>(null);
  const runway = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const runtime = useMemo(() => createNoorRuntime(), []);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [rig, setRig] = useState<Uint8Array | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const frame = window.requestAnimationFrame(() => setWebgl(canRender()));
    fetch("/models/ink-lab/noor-rig.bin", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Noor rig failed to load");
        return response.arrayBuffer();
      })
      .then((buffer) => setRig(new Uint8Array(buffer)))
      .catch((error: unknown) => {
        if ((error as Error).name !== "AbortError") setWebgl(false);
      });
    return () => {
      controller.abort();
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const target = stage.current;
    if (!target || !webgl) return;
    const move = (event: PointerEvent) => {
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      runtime.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      runtime.pointerY = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    const leave = () => {
      runtime.pointerX = 0;
      runtime.pointerY = 0;
    };
    target.addEventListener("pointermove", move, { passive: true });
    target.addEventListener("pointerleave", leave, { passive: true });
    return () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerleave", leave);
    };
  }, [runtime, webgl]);

  useGSAP(
    () => {
      if (!webgl || !rig || !runway.current || !stage.current) return;
      const media = gsap.matchMedia();
      const beatElements = gsap.utils.toArray<HTMLElement>("[data-noor-beat]", root.current);
      const label = root.current?.querySelector<HTMLElement>("[data-noor-phase]");
      let activeBeat = -1;

      const update = (self: ScrollTrigger) => {
        runtime.progress = Math.min(0.99999, Math.max(0, self.progress));
        runtime.scrollVelocity = self.getVelocity();
        runtime.invalidate?.();
        const current = nearestBeat(runtime.progress);
        if (current !== activeBeat) {
          activeBeat = current;
          if (label) label.textContent = BEATS[current].title;
        }
        beatElements.forEach((element, index) => {
          const previous = index === 0 ? 0 : (BEATS[index - 1].at + BEATS[index].at) / 2;
          const next = index === BEATS.length - 1
            ? 0.96
            : (BEATS[index].at + BEATS[index + 1].at) / 2;
          const enter = gsap.utils.clamp(0, 1, (runtime.progress - previous + 0.025) / 0.05);
          const leave = gsap.utils.clamp(0, 1, (next + 0.025 - runtime.progress) / 0.05);
          const opacity = Math.min(enter, leave);
          gsap.set(element, {
            opacity,
            transform: `translate3d(0, ${(1 - opacity) * 18}px, 0)`,
          });
        });
      };

      media.add("(min-width: 900px)", () => {
        const trigger = ScrollTrigger.create({
          trigger: runway.current,
          start: "top top",
          end: () => `+=${window.innerHeight * 6}`,
          pin: stage.current,
          pinSpacing: true,
          scrub: 0.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: update,
          onToggle: (self) => {
            runtime.active = self.isActive;
            runtime.invalidate?.();
          },
        });
        triggerRef.current = trigger;
        update(trigger);
        return () => {
          triggerRef.current = null;
          trigger.kill();
        };
      });

      media.add("(max-width: 899px)", () => {
        const trigger = ScrollTrigger.create({
          trigger: runway.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: update,
          onToggle: (self) => {
            runtime.active = self.isActive;
            runtime.invalidate?.();
          },
        });
        triggerRef.current = trigger;
        update(trigger);
        return () => {
          triggerRef.current = null;
          trigger.kill();
        };
      });

      return () => media.revert();
    },
    { scope: root, dependencies: [rig, runtime, webgl] },
  );

  const jumpTo = (progress: number) => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    window.scrollTo({
      top: trigger.start + progress * (trigger.end - trigger.start),
      behavior: "smooth",
    });
  };

  const fallback = webgl === false;

  return (
    <div ref={root} className="noor-study-root">
      <header className="noor-study-nav">
        <Link href="/face-lab/ink">
          <ArrowLeft size={17} />
          Eight identities
        </Link>
        <p>Noor refinement</p>
        <span data-noor-phase>Diffusion</span>
      </header>

      <section className="noor-study-intro">
        <div>
          <p className="noor-study-kicker">Selected direction</p>
          <h1>Noor,<br />made coherent.</h1>
          <p>
            One identity refined through formation, attention and a more human voice.
          </p>
        </div>
        <nav aria-label="Noor animation chapters">
          {BEATS.map((beat) => (
            <button key={beat.title} type="button" onClick={() => jumpTo(beat.at)}>
              {beat.title}
            </button>
          ))}
        </nav>
      </section>

      {fallback ? (
        <section className="noor-study-static" aria-label="Static Noor portrait">
          <Image
            src="/models/ink-lab/noor-poster.png"
            alt="Noor, the selected soft androgynous identity"
            width={507}
            height={507}
            sizes="(max-width: 899px) 100vw, 72vw"
          />
          <div>
            <h2>Noor</h2>
            <p>Soft ambiguity, deep attention.</p>
          </div>
        </section>
      ) : (
        <div ref={runway} className="noor-study-runway">
          <div ref={stage} className="noor-study-stage">
            <div className="noor-study-canvas" aria-hidden="true">
              {rig ? (
                <NoorCanvas runtime={runtime} rig={rig} onContextLost={() => setWebgl(false)} />
              ) : (
                <div className="noor-study-loading" />
              )}
            </div>
            <div className="noor-study-beats" aria-hidden="true">
              {BEATS.map((beat, index) => (
                <article key={beat.title} data-noor-beat={index}>
                  <h2>{beat.title}</h2>
                  <p>{beat.copy}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="noor-study-mobile-runway" aria-hidden="true">
            {BEATS.map((beat) => <div key={beat.title} />)}
          </div>
        </div>
      )}

      <ol className="sr-only">
        {BEATS.map((beat) => (
          <li key={beat.title}>{beat.title}: {beat.copy}</li>
        ))}
      </ol>

      <footer className="noor-study-footer">
        <div>
          <h2>A person should remain one person.</h2>
          <p>The particles, surface, eyes and mouth now share one continuous motion system.</p>
        </div>
        <Link href="/face-lab/ink">
          Compare identities <ArrowUpRight size={17} />
        </Link>
      </footer>
    </div>
  );
}
