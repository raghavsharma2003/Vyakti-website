"use client";

/* eslint-disable react-hooks/immutability -- Scroll progress is intentionally written into a stable R3F runtime. */

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MeeraPortrait } from "@/components/meera";
import { Cta } from "@/components/ui/cta";
import { createStoryRuntime } from "./story-runtime";
import styles from "./home.module.css";

const StoryCanvas = dynamic(() => import("./relational-story-canvas"), {
  ssr: false,
});

const MeeraStoryCanvas = dynamic(() => import("./meera-story-canvas"), {
  ssr: false,
});

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP, ScrollTrigger);

const CHAPTERS = [
  {
    at: 0.025,
    side: "left",
    label: "Vyakti is a relational intelligence lab",
    title: "Intelligence is becoming abundant. Continuity is not.",
    body: "We research AI identities that remain recognizable as the intelligence beneath them changes.",
  },
  {
    at: 0.165,
    side: "left",
    title: "A person is a pattern that persists.",
    body: "State, history, boundaries, memory, change, and expression. One response cannot establish any of them.",
  },
  {
    at: 0.31,
    side: "left",
    title: "Identity and memory must move together.",
    body: "The past has to shape what comes next without rewriting who is speaking.",
  },
  {
    at: 0.455,
    side: "left",
    title: "One inner state. Every signal.",
    body: "Voice, gaze, timing, reaction, and context should agree.",
  },
  {
    at: 0.595,
    side: "left",
    title: "The engine can change. The person should remain.",
    body: "Better models should make Meera more capable, not make her someone else.",
  },
  {
    at: 0.765,
    side: "right",
    label: "Meet Meera",
    title: "You do not configure Meera. You meet her.",
    body: "One AI person in development, designed around stable identity, selective memory, and shared context.",
  },
  {
    at: 0.925,
    side: "right",
    label: "Always AI",
    title: "The more human AI feels, the clearer its boundaries must be.",
    body: "Presence without impersonation. Connection without capture.",
  },
] as const;

const CHAPTER_BOUNDARIES = CHAPTERS.slice(0, -1).map(
  (chapter, boundaryIndex) =>
    (chapter.at + CHAPTERS[boundaryIndex + 1].at) / 2,
);
const CHAPTER_HANDOFF_HALF_SPAN = 0.022;

function canRenderWebgl() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function chapterOpacity(progress: number, index: number) {
  for (
    let boundaryIndex = 0;
    boundaryIndex < CHAPTER_BOUNDARIES.length;
    boundaryIndex += 1
  ) {
    const boundary = CHAPTER_BOUNDARIES[boundaryIndex];
    const handoffStart = boundary - CHAPTER_HANDOFF_HALF_SPAN;
    const handoffEnd = boundary + CHAPTER_HANDOFF_HALF_SPAN;

    if (progress < handoffStart || progress > handoffEnd) continue;

    if (index === boundaryIndex) {
      return progress < boundary
        ? gsap.utils.clamp(
            0,
            1,
            (boundary - progress) / CHAPTER_HANDOFF_HALF_SPAN,
          )
        : 0;
    }

    if (index === boundaryIndex + 1) {
      return progress > boundary
        ? gsap.utils.clamp(
            0,
            1,
            (progress - boundary) / CHAPTER_HANDOFF_HALF_SPAN,
          )
        : 0;
    }

    return 0;
  }

  const activeIndex = CHAPTER_BOUNDARIES.findIndex(
    (boundary) => progress < boundary,
  );
  return index === (activeIndex === -1 ? CHAPTERS.length - 1 : activeIndex)
    ? 1
    : 0;
}

export function RelationalStory() {
  const root = useRef<HTMLElement>(null);
  const runway = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const noorLayer = useRef<HTMLDivElement>(null);
  const meeraLayer = useRef<HTMLDivElement>(null);
  const leftMask = useRef<HTMLDivElement>(null);
  const rightMask = useRef<HTMLDivElement>(null);
  const noorRuntime = useMemo(() => createStoryRuntime(), []);
  const meeraRuntime = useMemo(() => createStoryRuntime(), []);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [reduced, setReduced] = useState(false);
  const [rig, setRig] = useState<Uint8Array | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduced(motion.matches);
    updateMotion();
    motion.addEventListener("change", updateMotion);
    const frame = window.requestAnimationFrame(() => setWebgl(canRenderWebgl()));
    fetch("/models/ink-lab/noor-rig.bin", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Identity rig failed to load");
        return response.arrayBuffer();
      })
      .then((buffer) => setRig(new Uint8Array(buffer)))
      .catch((error: unknown) => {
        if ((error as Error).name !== "AbortError") setWebgl(false);
      });
    return () => {
      controller.abort();
      window.cancelAnimationFrame(frame);
      motion.removeEventListener("change", updateMotion);
    };
  }, []);

  const animated = webgl === true && Boolean(rig) && !reduced;
  const fallback = webgl === false || reduced;

  useEffect(() => {
    const target = stage.current;
    if (!target || !animated) return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const move = (event: PointerEvent) => {
      if (!finePointer.matches) return;
      const pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      const pointerY = -((event.clientY / window.innerHeight) * 2 - 1);
      noorRuntime.pointerX = pointerX;
      noorRuntime.pointerY = pointerY;
      meeraRuntime.pointerX = pointerX;
      meeraRuntime.pointerY = pointerY;
      noorRuntime.invalidate?.();
      meeraRuntime.invalidate?.();
    };
    const leave = () => {
      noorRuntime.pointerX = 0;
      noorRuntime.pointerY = 0;
      meeraRuntime.pointerX = 0;
      meeraRuntime.pointerY = 0;
      noorRuntime.invalidate?.();
      meeraRuntime.invalidate?.();
    };
    target.addEventListener("pointermove", move, { passive: true });
    target.addEventListener("pointerleave", leave, { passive: true });
    return () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerleave", leave);
    };
  }, [animated, meeraRuntime, noorRuntime]);

  useGSAP(
    () => {
      if (!animated || !runway.current || !stage.current) return;
      const chapters = gsap.utils.toArray<HTMLElement>(
        "[data-story-chapter]",
        root.current,
      );
      const update = (self: ScrollTrigger) => {
        const progress = THREEClamp(self.progress);
        const velocity = self.getVelocity();
        noorRuntime.progress = progress;
        noorRuntime.scrollVelocity = velocity;
        meeraRuntime.progress = progress;
        meeraRuntime.scrollVelocity = velocity;
        noorRuntime.invalidate?.();
        meeraRuntime.invalidate?.();
        chapters.forEach((chapter, index) => {
          const opacity = chapterOpacity(progress, index);
          const direction = progress < CHAPTERS[index].at ? 1 : -1;
          gsap.set(chapter, {
            opacity,
            visibility: opacity > 0 ? "visible" : "hidden",
            transform: `translate3d(0, ${direction * (1 - opacity) * 16}px, 0)`,
          });
          chapter.style.pointerEvents = opacity > 0.7 ? "auto" : "none";
        });
        const visualHandoff = gsap.utils.clamp(0, 1, (progress - 0.62) / 0.1);
        if (leftMask.current) {
          gsap.set(leftMask.current, { opacity: 1 - visualHandoff });
        }
        if (rightMask.current) {
          gsap.set(rightMask.current, { opacity: visualHandoff });
        }

        // These scenes never cross-morph or overlap. Noor leaves, the field
        // clears to paper, and Meera enters as her own complete 3D model.
        const rawNoorExit = gsap.utils.clamp(0, 1, (progress - 0.642) / 0.018);
        const noorExit = rawNoorExit * rawNoorExit * (3 - 2 * rawNoorExit);
        const rawMeeraEntry = gsap.utils.clamp(0, 1, (progress - 0.695) / 0.04);
        const meeraEntry = rawMeeraEntry * rawMeeraEntry * (3 - 2 * rawMeeraEntry);
        if (noorLayer.current) {
          gsap.set(noorLayer.current, {
            opacity: 1 - noorExit,
            visibility: noorExit < 0.998 ? "visible" : "hidden",
          });
        }
        if (meeraLayer.current) {
          gsap.set(meeraLayer.current, {
            opacity: meeraEntry,
            visibility: meeraEntry > 0.002 ? "visible" : "hidden",
          });
        }
      };
      const trigger = ScrollTrigger.create({
        trigger: runway.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: update,
        onToggle: (self) => {
          noorRuntime.active = self.isActive;
          meeraRuntime.active = self.isActive;
          noorRuntime.invalidate?.();
          meeraRuntime.invalidate?.();
        },
      });
      update(trigger);
      return () => trigger.kill();
    },
    { scope: root, dependencies: [animated, meeraRuntime, noorRuntime] },
  );

  return (
    <section
      ref={root}
      className={[styles.story, fallback ? styles.storyFallback : ""].join(" ")}
      aria-labelledby="home-title"
    >
      <div ref={runway} className={styles.storyRunway}>
        <div ref={stage} className={styles.storyStage}>
          <div className={styles.storyVisual} aria-hidden="true">
            <div ref={noorLayer} className={styles.storyCanvasLayer}>
              {animated && rig ? (
                <StoryCanvas
                  runtime={noorRuntime}
                  rig={rig}
                  onContextLost={() => setWebgl(false)}
                />
              ) : (
                <div className={styles.loadingPortrait}>
                  <Image
                    src="/models/ink-lab/noor-poster.png"
                    alt=""
                    fill
                    loading="eager"
                    sizes="(max-width: 980px) 100vw, 62vw"
                  />
                </div>
              )}
            </div>
            <div
              ref={meeraLayer}
              className={styles.meeraSceneLayer}
              style={{ opacity: 0, visibility: "hidden" }}
            >
              {animated ? (
                <MeeraStoryCanvas
                  runtime={meeraRuntime}
                  onContextLost={() => setWebgl(false)}
                />
              ) : null}
            </div>
          </div>
          <div ref={leftMask} className={styles.leftReadingMask} aria-hidden="true" />
          <div ref={rightMask} className={styles.rightReadingMask} aria-hidden="true" />

          <div className={styles.chapterLayer}>
            {CHAPTERS.map((chapter, index) => {
              const Heading = index === 0 ? "h1" : "h2";
              return (
                <article
                  key={chapter.title}
                  data-story-chapter={index}
                  aria-hidden={animated && index > 0 ? true : undefined}
                  className={[
                    styles.chapter,
                    chapter.side === "right" ? styles.chapterRight : styles.chapterLeft,
                    index === 0 ? styles.heroChapter : "",
                  ].join(" ")}
                  style={{ opacity: index === 0 ? 1 : 0 }}
                >
                  {"label" in chapter && chapter.label ? (
                    <p
                      className={[
                        styles.chapterLabel,
                        index === 5 ? styles.meeraLabel : "",
                      ].join(" ")}
                    >
                      {chapter.label}
                    </p>
                  ) : null}
                  <Heading id={index === 0 ? "home-title" : undefined}>
                    {index === 0 ? (
                      <>
                        <span>Intelligence is becoming abundant.</span>
                        <span className={styles.signalText}>Continuity is not.</span>
                      </>
                    ) : index === 5 ? (
                      <>
                        You do not configure <span className={styles.meeraWord}>Meera</span>.
                        You meet her.
                      </>
                    ) : (
                      chapter.title
                    )}
                  </Heading>
                  <p className={styles.chapterBody}>
                    {index === 4 ? (
                      <>
                        Better models should make <span className={styles.meeraWord}>Meera</span>{" "}
                        more capable, not make her someone else.
                      </>
                    ) : (
                      chapter.body
                    )}
                  </p>
                  {index === 0 ? (
                    <div className={styles.chapterActions}>
                      <Cta href="/meera">Meet Meera</Cta>
                      <Cta href="/research" variant="secondary">
                        Explore the research
                      </Cta>
                    </div>
                  ) : null}
                  {index === CHAPTERS.length - 1 ? (
                    <div className={styles.chapterActions}>
                      <Cta href="/meera#access">Request early access</Cta>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>

        <div className={styles.staticPortraits} aria-hidden="true">
          <figure>
            <Image
              src="/models/ink-lab/noor-poster.png"
              alt=""
              width={507}
              height={507}
              sizes="(max-width: 760px) 92vw, 42vw"
            />
          </figure>
          <figure className={styles.meeraStaticPortrait}>
            <MeeraPortrait sizes="(max-width: 760px) 92vw, 42vw" />
          </figure>
        </div>
      </div>

      <ol className="sr-only" aria-hidden={animated ? undefined : true}>
        {CHAPTERS.slice(1).map((chapter) => (
          <li key={chapter.title}>
            {chapter.title} {chapter.body}
          </li>
        ))}
      </ol>
    </section>
  );
}

function THREEClamp(value: number) {
  return Math.min(0.99999, Math.max(0, value));
}
