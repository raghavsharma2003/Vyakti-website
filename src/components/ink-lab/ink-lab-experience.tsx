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
import { INK_IDENTITIES } from "./identities";
import { createFaceLabRuntime } from "../face-lab/runtime";

const InkLabCanvas = dynamic(() => import("./ink-lab-canvas"), {
  ssr: false,
  loading: () => <div className="ink-lab-loading" aria-hidden="true" />,
});

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP, ScrollTrigger);

const GROUP_STARTS = [
  { label: "Female", index: 0, count: 3 },
  { label: "Male", index: 3, count: 3 },
  { label: "Androgynous", index: 6, count: 2 },
] as const;

function canRenderInkLab() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function smoothStep(value: number, minimum: number, maximum: number) {
  const normalized = clamp((value - minimum) / (maximum - minimum), 0, 1);
  return normalized * normalized * (3 - 2 * normalized);
}

export default function InkLabExperience() {
  const root = useRef<HTMLDivElement>(null);
  const runway = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const scrollTrigger = useRef<ScrollTrigger | null>(null);
  const liveRegion = useRef<HTMLParagraphElement>(null);
  const runtime = useMemo(() => createFaceLabRuntime(), []);
  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setWebgl(canRenderInkLab()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const pointerTarget = stage.current;
    if (!webgl || !pointerTarget) return;
    const onPointer = (event: PointerEvent) => {
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      runtime.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      runtime.pointerY = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    const onPointerLeave = () => {
      runtime.pointerX = 0;
      runtime.pointerY = 0;
    };
    pointerTarget.addEventListener("pointermove", onPointer, { passive: true });
    pointerTarget.addEventListener("pointerleave", onPointerLeave, { passive: true });
    return () => {
      pointerTarget.removeEventListener("pointermove", onPointer);
      pointerTarget.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [runtime, webgl]);

  const jumpTo = (index: number) => {
    const trigger = scrollTrigger.current;
    if (!trigger) {
      const staticTarget = root.current?.querySelector<HTMLElement>(
        `[data-static-index="${index}"]`,
      );
      if (staticTarget) staticTarget.scrollIntoView({ block: "start" });
      else if (runway.current) {
        const runwayTop = runway.current.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: runwayTop + window.innerHeight * (index + 0.5) });
      }
      return;
    }
    const destination =
      trigger.start + ((index + 0.5) / INK_IDENTITIES.length) * (trigger.end - trigger.start);
    window.scrollTo({ top: destination, behavior: "smooth" });
  };

  /* eslint-disable react-hooks/immutability -- GSAP and R3F share an imperative runtime. */
  useGSAP(
    () => {
      if (!webgl || !runway.current || !stage.current) return;
      const media = gsap.matchMedia();
      const panels = gsap.utils.toArray<HTMLElement>("[data-ink-panel]", root.current);
      const railButtons = gsap.utils.toArray<HTMLButtonElement>(
        ".ink-lab-rail button",
        root.current,
      );
      let announced = -1;
      const update = (progress: number) => {
        runtime.progress = clamp(progress, 0, 0.99999);
        runtime.invalidate?.();
        const scaled = Math.min(7.9999, runtime.progress * INK_IDENTITIES.length);
        const active = Math.floor(scaled);
        const local = scaled - active;
        const transition =
          active === INK_IDENTITIES.length - 1 ? 0 : smoothStep(local, 0.79, 0.97);

        INK_IDENTITIES.forEach((_, index) => {
          const panel = panels[index];
          const opacity =
            index === active
              ? 1 - transition
              : index === active + 1
                ? transition
                : 0;
          if (panel) {
            gsap.set(panel, {
              opacity,
              transform: `translate3d(0, ${(1 - opacity) * 22}px, 0)`,
              pointerEvents: opacity > 0.82 ? "auto" : "none",
            });
          }
          const railButton = railButtons[index];
          railButton?.toggleAttribute("data-active", index === active);
          if (index === active) railButton?.setAttribute("aria-current", "true");
          else railButton?.removeAttribute("aria-current");
        });
        if (announced !== active && liveRegion.current) {
          announced = active;
          liveRegion.current.textContent = `${INK_IDENTITIES[active].name}, ${INK_IDENTITIES[active].group} identity`;
        }
      };

      media.add("(min-width: 900px)", () => {
        const trigger = ScrollTrigger.create({
          trigger: runway.current,
          start: "top top",
          end: () => `+=${window.innerHeight * INK_IDENTITIES.length}`,
          pin: stage.current,
          pinSpacing: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => update(self.progress),
          onToggle: (self) => {
            runtime.active = self.isActive;
            runtime.invalidate?.();
          },
        });
        scrollTrigger.current = trigger;
        return () => {
          scrollTrigger.current = null;
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
          onUpdate: (self) => update(self.progress),
          onToggle: (self) => {
            runtime.active = self.isActive;
            runtime.invalidate?.();
          },
        });
        scrollTrigger.current = trigger;
        return () => {
          scrollTrigger.current = null;
          trigger.kill();
        };
      });

      update(0);
      return () => media.revert();
    },
    { scope: root, dependencies: [runtime, webgl] },
  );
  /* eslint-enable react-hooks/immutability */

  return (
    <div ref={root} className="ink-lab-root">
      <header className="ink-lab-nav">
        <Link href="/face-lab" className="ink-lab-back">
          <ArrowLeft size={17} weight="regular" />
          All directions
        </Link>
        <p>Ink identity study</p>
        <span>Eight candidates</span>
      </header>

      <section className="ink-lab-intro">
        <p className="ink-lab-kicker">The human imprint</p>
        <h1>Cast a <br />presence.</h1>
        <p className="ink-lab-deck">
          Eight faces. One visual language. Choose who Vyakti should feel like.
        </p>
        <nav className="ink-lab-groups" aria-label="Identity groups">
          {GROUP_STARTS.map((group) => (
            <button key={group.label} type="button" onClick={() => jumpTo(group.index)}>
              <span>{group.label}</span>
              <small>{group.count}</small>
            </button>
          ))}
        </nav>
      </section>

      {webgl ? (
        <div ref={runway} className="ink-lab-runway">
          <div ref={stage} className="ink-lab-stage">
            <div className="ink-lab-canvas" aria-hidden="true">
              <InkLabCanvas runtime={runtime} onContextLost={() => setWebgl(false)} />
            </div>
            <div className="ink-lab-panels" aria-hidden="true">
              {INK_IDENTITIES.map((identity, index) => (
                <article key={identity.slug} data-ink-panel={index} className="ink-lab-panel">
                  <p className="ink-lab-group">{identity.group}</p>
                  <h2>{identity.name}</h2>
                  <p className="ink-lab-character">{identity.character}</p>
                  <p className="ink-lab-description">{identity.description}</p>
                </article>
              ))}
            </div>
            <nav className="ink-lab-rail" aria-label="Identity shortcuts">
              {INK_IDENTITIES.map((identity, index) => (
                <button
                  key={identity.slug}
                  type="button"
                  aria-label={`View ${identity.group} ${identity.name}`}
                  onClick={() => jumpTo(index)}
                >
                  {identity.name}
                </button>
              ))}
            </nav>
          </div>
          <div className="ink-lab-mobile-chapters" aria-hidden="true">
            {INK_IDENTITIES.map((identity) => <div key={identity.slug} />)}
          </div>
        </div>
      ) : webgl === false ? (
        <section className="ink-lab-static" aria-label="Ink identity candidates">
          <Image
            src="/models/ink-lab/contact-sheet.png"
            alt="Eight high-contrast ink-rendered identity candidates"
            width={1600}
            height={900}
            sizes="100vw"
          />
          {INK_IDENTITIES.map((identity, index) => (
            <article key={identity.slug} data-static-index={index}>
              <p>{identity.group}</p>
              <h2>{identity.name}</h2>
              <strong>{identity.character}</strong>
              <span>{identity.description}</span>
            </article>
          ))}
        </section>
      ) : (
        <div className="ink-lab-runway" aria-hidden="true">
          <div className="ink-lab-stage"><div className="ink-lab-loading" /></div>
        </div>
      )}

      <ol className="sr-only">
        {INK_IDENTITIES.map((identity) => (
          <li key={identity.slug}>
            <h2>{identity.group}: {identity.name}</h2>
            <p>{identity.character}</p>
            <p>{identity.description}</p>
          </li>
        ))}
      </ol>
      <p ref={liveRegion} className="sr-only" aria-live="polite" aria-atomic="true" />

      <footer className="ink-lab-footer">
        <div>
          <p>Pick the person first.</p>
          <span>The final hair, voice and expression system comes after identity selection.</span>
        </div>
        <nav className="ink-lab-footer-links" aria-label="Identity study next steps">
          <Link href="/face-lab/ink/noor">
            Continue with Noor <ArrowUpRight size={17} />
          </Link>
          <Link href="/face-lab">Compare all directions</Link>
        </nav>
      </footer>
    </div>
  );
}
