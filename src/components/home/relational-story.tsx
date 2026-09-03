"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Cta } from "@/components/ui/cta";
import { APPLY_LABEL, APPLY_MAILTO } from "@/lib/site";
import { createStoryRuntime } from "./story-runtime";
import styles from "./home.module.css";

const StoryCanvas = dynamic(() => import("./relational-story-canvas"), {
  ssr: false,
  loading: () => <InitialSignalField />,
});

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
  // Mobile browser chrome changes the visual viewport while a swipe is still
  // moving. Refreshing trigger geometry for those small resizes causes jumps.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/**
 * The canvas beats are authored in a fixed story space: formation ends at
 * 0.255, the look and blink sit around 0.29 to 0.36, speech runs 0.405 to
 * 0.535, and the release into signal completes at 0.655. The runway used to
 * carry a second identity after that release, so scroll progress mapped
 * straight through. It no longer does, so scroll is remapped onto the part of
 * the story that has a picture in it. Nothing after the release is scrolled
 * past on an empty stage.
 */
const STORY_SPAN = 0.72;

const CHAPTERS = [
  {
    at: 0.025,
    label: "Vyakti Rooms",
    title: "One creator. A room for each follower.",
    body: "An AI version of the creator, and a private, continuing relationship with it for every person who follows them.",
  },
  {
    at: 0.185,
    title: "You answer the same forty questions every week.",
    body: "There are more people asking than there are hours in the week. Most of them get nothing back.",
  },
  {
    at: 0.4,
    title: "So you train an apprentice.",
    body: "You show them your work. They ask. You correct them. Eventually they take the easy meetings alone.",
  },
  {
    at: 0.6,
    title: "Then it answers in your place.",
    body: "It has to sound like you, and you have to be able to check that it does before anyone hears it.",
  },
  {
    at: 0.8,
    title: "Thousands of conversations at once.",
    body: "Each one is private. What a follower says stays in their room, and no other follower ever learns they were there.",
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
  const noorRuntime = useRef(createStoryRuntime());
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [reduced, setReduced] = useState(false);
  const [rig, setRig] = useState<Uint8Array | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);

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

  const noor3d = webgl === true && Boolean(rig) && !reduced;
  const motionEnabled = !reduced;
  const fallback = reduced;

  useEffect(() => {
    const target = stage.current;
    if (!target || !noor3d) return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const move = (event: PointerEvent) => {
      if (!finePointer.matches) return;
      noorRuntime.current.pointerX =
        (event.clientX / window.innerWidth) * 2 - 1;
      noorRuntime.current.pointerY =
        -((event.clientY / window.innerHeight) * 2 - 1);
      noorRuntime.current.invalidate?.();
    };
    const leave = () => {
      noorRuntime.current.pointerX = 0;
      noorRuntime.current.pointerY = 0;
      noorRuntime.current.invalidate?.();
    };
    target.addEventListener("pointermove", move, { passive: true });
    target.addEventListener("pointerleave", leave, { passive: true });
    return () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerleave", leave);
    };
  }, [noor3d]);

  useGSAP(
    () => {
      if (!motionEnabled || !runway.current || !stage.current) return;
      const chapters = gsap.utils.toArray<HTMLElement>(
        "[data-story-chapter]",
        root.current,
      );
      const chapterWasVisible: Array<boolean | null> = chapters.map(() => null);
      const update = (progressValue: number, velocity: number) => {
        const progress = clampProgress(progressValue);
        noorRuntime.current.progress = progress * STORY_SPAN;
        noorRuntime.current.scrollVelocity = velocity;
        noorRuntime.current.invalidate?.();
        chapters.forEach((chapter, index) => {
          const opacity = chapterOpacity(progress, index);
          const visible = opacity > 0;
          if (!visible && chapterWasVisible[index] === false) return;
          const direction = progress < CHAPTERS[index].at ? 1 : -1;
          chapter.style.opacity = String(opacity);
          chapter.style.visibility = visible ? "visible" : "hidden";
          chapter.style.transform = `translate3d(0, ${direction * (1 - opacity) * 16}px, 0)`;
          chapter.style.pointerEvents = opacity > 0.7 ? "auto" : "none";
          chapterWasVisible[index] = visible;
        });

        // The identity releases back into signal over the last chapter. Fading
        // the layer out with it keeps the empty paper at the end of the runway
        // clean rather than holding a few stray points on screen.
        const raw = gsap.utils.clamp(0, 1, (progress - 0.9) / 0.09);
        const release = raw * raw * (3 - 2 * raw);
        if (noorLayer.current) {
          noorLayer.current.style.opacity = String(1 - release);
          noorLayer.current.style.visibility =
            release < 0.998 ? "visible" : "hidden";
        }
      };
      const touchLayout = window.matchMedia(
        "(max-width: 980px), (hover: none), (pointer: coarse)",
      ).matches;
      let trigger: ScrollTrigger | null = null;
      let tween: gsap.core.Tween | null = null;
      const triggerConfig: ScrollTrigger.Vars = {
        trigger: runway.current,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onToggle: (self) => {
          noorRuntime.current.active = self.isActive;
          noorRuntime.current.invalidate?.();
        },
      };

      if (touchLayout) {
        // Native touch scrolling already supplies momentum. A second scrub
        // tween makes the scene trail the finger and continue after release.
        trigger = ScrollTrigger.create({
          ...triggerConfig,
          onUpdate: (self) => update(self.progress, self.getVelocity()),
        });
      } else {
        const progress = { value: 0 };
        tween = gsap.to(progress, {
          value: 0.99999,
          ease: "none",
          onUpdate: () => update(progress.value, trigger?.getVelocity() ?? 0),
        });
        trigger = ScrollTrigger.create({
          ...triggerConfig,
          animation: tween,
          scrub: true,
        });
      }

      update(trigger.progress, 0);
      return () => {
        trigger?.kill();
        tween?.kill();
      };
    },
    { scope: root, dependencies: [motionEnabled] },
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
              {!fallback ? (
                <div
                  className={[
                    styles.signalLoader,
                    canvasReady ? styles.signalLoaderHidden : "",
                  ].join(" ")}
                >
                  <InitialSignalField />
                </div>
              ) : null}
              {noor3d && rig ? (
                <div
                  className={[
                    styles.liveCanvas,
                    canvasReady ? styles.liveCanvasReady : "",
                  ].join(" ")}
                >
                  <StoryCanvas
                    runtime={noorRuntime}
                    rig={rig}
                    onReady={() => setCanvasReady(true)}
                    onContextLost={() => {
                      setCanvasReady(false);
                      setWebgl(false);
                    }}
                  />
                </div>
              ) : null}
            </div>
          </div>
          <div className={styles.leftReadingMask} aria-hidden="true" />

          <div className={styles.chapterLayer}>
            {CHAPTERS.map((chapter, index) => {
              const Heading = index === 0 ? "h1" : "h2";
              return (
                <article
                  key={chapter.title}
                  data-story-chapter={index}
                  aria-hidden={motionEnabled && index > 0 ? true : undefined}
                  className={[
                    styles.chapter,
                    styles.chapterLeft,
                    index === 0 ? styles.heroChapter : "",
                  ].join(" ")}
                  style={{ opacity: index === 0 ? 1 : 0 }}
                >
                  {"label" in chapter && chapter.label ? (
                    <p className={styles.chapterLabel}>{chapter.label}</p>
                  ) : null}
                  {fallback && index === 0 ? (
                    <figure className={[styles.fallbackPortrait, styles.fallbackNoor].join(" ")}>
                      <Image
                        src="/models/ink-lab/noor-poster.png"
                        alt=""
                        fill
                        sizes="(max-width: 760px) 92vw, 42vw"
                      />
                    </figure>
                  ) : null}
                  <Heading id={index === 0 ? "home-title" : undefined}>
                    {index === 0 ? (
                      <>
                        <span>One creator.</span>
                        <span className={styles.signalText}>
                          A room for each follower.
                        </span>
                      </>
                    ) : (
                      chapter.title
                    )}
                  </Heading>
                  <p className={styles.chapterBody}>{chapter.body}</p>
                  {index === 0 ? (
                    <div className={styles.chapterActions}>
                      <Cta href={APPLY_MAILTO}>{APPLY_LABEL}</Cta>
                      <Cta href="/#rooms" variant="secondary">
                        How it works
                      </Cta>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>

      </div>

      <ol className="sr-only" aria-hidden={motionEnabled ? undefined : true}>
        {CHAPTERS.slice(1).map((chapter) => (
          <li key={chapter.title}>
            {chapter.title} {chapter.body}
          </li>
        ))}
      </ol>
    </section>
  );
}

function clampProgress(value: number) {
  return Math.min(0.99999, Math.max(0, value));
}

function InitialSignalField() {
  return <div className={styles.initialSignalField} aria-hidden="true" />;
}
