"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Cta } from "@/components/ui/cta";
import { VyaktiHead } from "@/components/head";

const BEATS = [
  { start: 0, end: 0.2 },
  { start: 0.22, end: 0.39 },
  { start: 0.42, end: 0.59 },
  { start: 0.62, end: 0.79 },
  { start: 0.82, end: 1 },
] as const;

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP, ScrollTrigger);

function opacityAt(progress: number, start: number, end: number) {
  const fade = 0.055;
  const rise = start === 0 ? 1 : Math.min(Math.max((progress - start) / fade, 0), 1);
  const fall = end === 1 ? 1 : 1 - Math.min(Math.max((progress - (end - fade)) / fade, 0), 1);
  return Math.min(rise, fall);
}

export function HeroStage() {
  const runway = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef(0);

  useGSAP(() => {
    const pinned = stage.current;
    const trigger = runway.current;
    if (!pinned || !trigger) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      progress.current = 0.3;
      BEATS.forEach((_, index) => pinned.style.setProperty(`--beat-${index}`, index === 0 ? "1" : "0"));
      return;
    }

    ScrollTrigger.create({
      trigger,
      start: "top top",
      end: "+=320%",
      pin: pinned,
      pinSpacing: true,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: ({ progress: value }) => {
        progress.current = value;
        BEATS.forEach((beat, index) => {
          pinned.style.setProperty(`--beat-${index}`, String(opacityAt(value, beat.start, beat.end)));
        });
      },
    });
  }, { scope: runway });

  return (
    <section ref={runway} className="relative min-h-[100dvh] bg-ink" aria-labelledby="hero-title">
      <div
        ref={stage}
        className="sticky top-0 min-h-[100svh] overflow-hidden"
        style={
          {
            "--beat-0": 1,
            "--beat-1": 0,
            "--beat-2": 0,
            "--beat-3": 0,
            "--beat-4": 0,
          } as React.CSSProperties
        }
      >
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_78%_48%,color-mix(in_oklab,var(--color-ember)_7%,transparent),transparent_34%)]" />
        <div aria-hidden className="absolute top-[14%] right-[8%] h-[56vw] max-h-[760px] w-[56vw] max-w-[760px] rounded-full border border-hairline/75" />
        <div aria-hidden className="absolute top-[20%] right-[14%] h-[44vw] max-h-[600px] w-[44vw] max-w-[600px] rounded-full border border-hairline/50" />

        <VyaktiHead
          progress={progress}
          className="absolute inset-y-0 -right-[24%] left-[-8%] z-0 sm:-right-[8%] sm:left-[18%] lg:left-[34%]"
        />

        <div aria-hidden className="absolute inset-0 z-10 bg-[linear-gradient(90deg,var(--color-ink)_0%,color-mix(in_oklab,var(--color-ink)_92%,transparent)_33%,transparent_67%)] max-md:bg-[linear-gradient(180deg,var(--color-ink)_0%,color-mix(in_oklab,var(--color-ink)_90%,transparent)_38%,transparent_70%)]" />

        <div className="shell relative z-20 flex min-h-[100svh] items-center py-24">
          <div className="relative w-full">
            <div
              className="max-w-[64rem] transition-opacity duration-150"
              style={{ opacity: "var(--beat-0)" }}
            >
              <p className="eyebrow">Independent AI research lab</p>
              <h1 id="hero-title" className="mt-7 text-[clamp(3rem,7vw,7rem)] leading-[0.92] tracking-[-0.065em] md:max-w-none">
                <span className="block md:whitespace-nowrap">Intelligence answers.</span>
                <span className="block md:whitespace-nowrap"><span className="serif-italic text-ember">Personality</span> remains.</span>
              </h1>
              <p className="measure mt-7 max-w-[48ch] text-lead text-ash md:mt-9">
                Vyakti builds multimodal personalities with identity, memory,
                perception and expression. Meera is our first companion.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Cta href="/meera">Meet Meera</Cta>
                <Cta href="/research" variant="secondary">Explore our research</Cta>
              </div>
            </div>

            {[
              { label: "Identity", title: "A point of view that holds.", body: "Not a costume changed by every prompt. A recognisable voice, values, boundaries and contradictions." },
              { label: "Memory", title: "A past that changes the present.", body: "Not a list of facts. A history with weight: what mattered, what faded and what became part of the relationship." },
              { label: "Expression", title: "One inner state. Every signal.", body: "Words, voice, timing, gaze and reaction moving together, because people notice when the seams do not." },
              { label: "Presence", title: "Coherence over time.", body: "What makes someone feel like someone is not one perfect response. It is the pattern that remains as everything else changes." },
            ].map((beat, index) => (
              <div
                key={beat.label}
                aria-hidden
                className="absolute inset-x-0 top-1/2 max-w-[35rem] -translate-y-1/2 transition-opacity duration-150"
                style={{ opacity: `var(--beat-${index + 1})` }}
              >
                <p className="font-mono text-micro tracking-[0.16em] text-ember uppercase">{beat.label}</p>
                <p className="mt-5 text-[clamp(2.5rem,3.6vw,4.7rem)] leading-[0.98] font-medium tracking-[-0.055em]">{beat.title}</p>
                <p className="measure mt-6 text-lead text-ash">{beat.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="sr-only">
          <h2>The architecture of presence</h2>
          <p>Identity: a point of view that holds.</p>
          <p>Memory: a past that changes the present.</p>
          <p>Expression: one inner state across every signal.</p>
          <p>Presence: coherence over time.</p>
        </div>
      </div>
    </section>
  );
}
