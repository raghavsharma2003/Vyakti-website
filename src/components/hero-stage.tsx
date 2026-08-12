"use client";

import { useEffect, useRef } from "react";
import { Cta } from "@/components/ui/cta";
import { VyaktiHead } from "@/components/head";

/**
 * Three beats of copy sit over the face and cross-fade as it assembles,
 * listens, then speaks. Each beat's window is [fade-in start, fade-out end]
 * in scroll progress.
 */
const BEATS: Array<{ in: number; out: number }> = [
  { in: 0.0, out: 0.24 },
  { in: 0.34, out: 0.58 },
  { in: 0.66, out: 0.94 },
];

function windowOpacity(p: number, start: number, end: number) {
  const fade = 0.07;
  // The first beat is the hero itself, so it starts fully visible rather than
  // fading up from nothing at scroll position zero.
  const rise = start <= 0 ? 1 : Math.min(Math.max((p - start) / fade, 0), 1);
  const fall = 1 - Math.min(Math.max((p - (end - fade)) / fade, 0), 1);
  return Math.min(rise, fall);
}

export function HeroStage() {
  const runway = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef({ current: 0 });

  // One animation frame loop for the whole section. It writes CSS custom
  // properties and a plain object the WebGL scene reads, so scrolling never
  // schedules a React render.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const tick = () => {
      const el = runway.current;
      const st = stage.current;
      if (el && st) {
        const rect = el.getBoundingClientRect();
        const span = rect.height - window.innerHeight;
        const p = span > 0 ? Math.min(Math.max(-rect.top / span, 0), 1) : 0;
        progress.current.current = p;

        BEATS.forEach((beat, i) => {
          st.style.setProperty(
            `--beat-${i}`,
            String(reduced ? (i === 0 ? 1 : 0) : windowOpacity(p, beat.in, beat.out)),
          );
        });
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section ref={runway} className="relative h-[320vh]" aria-label="Introduction">
      <div
        ref={stage}
        className="sticky top-0 flex min-h-[100dvh] items-center overflow-hidden"
        style={{ ["--beat-0" as string]: 1, ["--beat-1" as string]: 0, ["--beat-2" as string]: 0 }}
      >
        <VyaktiHead
          progress={progress.current}
          className="absolute inset-0 z-0 md:left-[26%]"
        />

        {/* Keeps display type legible where it crosses the point cloud. */}
        <div
          aria-hidden
          className="absolute inset-0 z-10 bg-gradient-to-r from-ink via-ink/72 to-transparent md:via-ink/40 md:to-transparent"
        />

        <div className="shell relative z-20 w-full">
          <div className="relative max-w-[52rem] pt-16">
            {/* Beat one is the hero proper: headline, subtext, actions. */}
            <div style={{ opacity: "var(--beat-0)" }}>
              {/* Capped below the global h1 size so a ten word headline still
                  sets in two lines at desktop. */}
              <h1 className="text-[clamp(2.125rem,1.5rem+2.7vw,3.25rem)] text-bone">
                We are building AI that is{" "}
                <span className="text-ember">indistinguishable</span> from a
                person.
              </h1>
              <p className="measure mt-6 text-lead text-ash">
                Vyakti is a research lab working on presence: turn-taking,
                emotion, memory and culture. Our first system is Meera.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Cta href="/meera#access">Request access</Cta>
                <Cta href="/research" variant="secondary">
                  Read the research
                </Cta>
              </div>
            </div>

            {/* Beats two and three ride the same pinned stage. */}
            <div
              className="absolute inset-x-0 top-16 max-w-[40rem]"
              style={{ opacity: "var(--beat-1)" }}
              aria-hidden
            >
              <p className="text-h2 font-medium tracking-[-0.028em] text-bone">
                It knows you have not finished speaking.
              </p>
              <p className="measure mt-5 text-lead text-ash">
                A pause for thought is not the end of a turn. People hear the
                difference in half a syllable. Systems that wait for silence
                cannot.
              </p>
            </div>

            <div
              className="absolute inset-x-0 top-16 max-w-[40rem]"
              style={{ opacity: "var(--beat-2)" }}
              aria-hidden
            >
              <p className="text-h2 font-medium tracking-[-0.028em] text-bone">
                And it stops the moment you start.
              </p>
              <p className="measure mt-5 text-lead text-ash">
                Interruption is not a failure to handle. It is how people
                negotiate a conversation, and it has to feel effortless in both
                directions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
