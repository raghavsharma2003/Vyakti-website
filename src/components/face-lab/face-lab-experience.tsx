"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft } from "@phosphor-icons/react/ArrowLeft";
import { ArrowUpRight } from "@phosphor-icons/react/ArrowUpRight";
import { FACE_CONCEPTS } from "./concepts";
import { createFaceLabRuntime } from "./runtime";

const FaceLabCanvas = dynamic(() => import("./face-lab-canvas"), {
  ssr: false,
  loading: () => <div className="face-lab-loading" aria-hidden="true" />,
});

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP, ScrollTrigger);

function canRenderLab() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function FaceLabExperience() {
  const root = useRef<HTMLDivElement>(null);
  const runway = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  // Mutable by design: high-frequency scroll input should not re-render React.
  const runtime = useMemo(() => createFaceLabRuntime(), []);
  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const available = canRenderLab();
      setWebgl(available);
      document.documentElement.dataset.faceLabWebgl = String(available);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      runtime.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      runtime.pointerY = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => window.removeEventListener("pointermove", onPointer);
  }, [runtime]);

  /* eslint-disable react-hooks/immutability -- GSAP and R3F share one imperative runtime. */
  useGSAP(
    () => {
      if (!webgl || !runway.current || !stage.current) return;
      const media = gsap.matchMedia();
      const update = (progress: number) => {
        runtime.progress = THREEClamp(progress, 0, 0.99999);
        runtime.invalidate?.();
        const scaled = Math.min(4.9999, runtime.progress * 5);
        const current = Math.floor(scaled);
        const local = scaled - current;
        const transition =
          current === 4 ? 0 : smoothStep(local, 0.78, 0.96);
        FACE_CONCEPTS.forEach((_, index) => {
          const panel = root.current?.querySelector<HTMLElement>(
            `[data-face-panel="${index}"]`,
          );
          if (!panel) return;
          const opacity =
            index === current
              ? 1 - transition
              : index === current + 1
                ? transition
                : 0;
          gsap.set(panel, {
            opacity,
            transform: `translate3d(0, ${(1 - opacity) * 26}px, 0)`,
            pointerEvents: opacity > 0.8 ? "auto" : "none",
          });
          const rail = root.current?.querySelector<HTMLButtonElement>(
            `.face-lab-rail button:nth-child(${index + 1})`,
          );
          rail?.toggleAttribute("data-active", index === current);
        });
      };

      media.add("(min-width: 900px)", () => {
        const trigger = ScrollTrigger.create({
          trigger: runway.current,
          start: "top top",
          end: () => `+=${window.innerHeight * 5}`,
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
        return () => trigger.kill();
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
        return () => trigger.kill();
      });

      update(0);
      return () => media.revert();
    },
    { scope: root, dependencies: [runtime, webgl] },
  );
  /* eslint-enable react-hooks/immutability */

  return (
    <main ref={root} className="face-lab-root">
      <header className="face-lab-nav">
        <Link href="/" className="face-lab-back">
          <ArrowLeft size={17} weight="regular" />
          Vyakti
        </Link>
        <p>Face direction study</p>
        <span>Five candidates</span>
      </header>

      <nav className="face-lab-rail" aria-label="Face direction shortcuts">
        {FACE_CONCEPTS.map((concept, index) => (
          <button
            key={concept.slug}
            type="button"
            aria-label={`View ${concept.name}`}
            onClick={() => {
              const runwayTop = runway.current?.getBoundingClientRect().top ?? 0;
              const destination =
                window.scrollY + runwayTop + window.innerHeight * (index + 0.5);
              window.scrollTo({ top: destination, behavior: "smooth" });
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </button>
        ))}
      </nav>

      <section className="face-lab-intro">
        <p className="face-lab-kicker">Meera identity research</p>
        <h1>Which presence<br />feels like a person?</h1>
        <p className="face-lab-deck">
          Five distinct identity systems. Scroll slowly. Watch each one form,
          turn, listen and speak.
        </p>
      </section>

      {webgl ? (
        <div ref={runway} className="face-lab-runway">
          <div ref={stage} className="face-lab-stage">
            <div className="face-lab-canvas" aria-hidden="true">
              <FaceLabCanvas runtime={runtime} />
            </div>
            <div className="face-lab-panels" aria-hidden="true">
              {FACE_CONCEPTS.map((concept, index) => (
                <article
                  key={concept.slug}
                  data-face-panel={index}
                  className="face-lab-panel"
                >
                  <p className="face-lab-index">
                    {String(index + 1).padStart(2, "0")} / {String(FACE_CONCEPTS.length).padStart(2, "0")}
                  </p>
                  <h2>{concept.name}</h2>
                  <p className="face-lab-thesis">{concept.thesis}</p>
                  <p className="face-lab-description">{concept.description}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="face-lab-mobile-chapters" aria-hidden="true">
            {FACE_CONCEPTS.map((concept) => (
              <div key={concept.slug} />
            ))}
          </div>
        </div>
      ) : webgl === false ? (
        <section className="face-lab-static" aria-label="Face candidates">
          {FACE_CONCEPTS.map((concept, index) => (
            <article key={concept.slug}>
              <p>{String(index + 1).padStart(2, "0")}</p>
              <h2>{concept.name}</h2>
              <strong>{concept.thesis}</strong>
              <span>{concept.description}</span>
            </article>
          ))}
        </section>
      ) : (
        <div className="face-lab-runway" aria-hidden="true">
          <div className="face-lab-stage">
            <div className="face-lab-loading" />
          </div>
        </div>
      )}


      <ol className="sr-only">
        {FACE_CONCEPTS.map((concept) => (
          <li key={concept.slug}>
            <h2>{concept.name}</h2>
            <p>{concept.thesis}</p>
            <p>{concept.description}</p>
          </li>
        ))}
      </ol>

      <footer className="face-lab-footer">
        <p>Choose the idea, not only the prettiest frame.</p>
        <div className="face-lab-footer-links">
          <Link href="/face-lab/ink">
            Explore eight ink identities <ArrowUpRight size={17} />
          </Link>
          <Link href="/meera">
            Return to Meera <ArrowUpRight size={17} />
          </Link>
        </div>
      </footer>
    </main>
  );
}

function THREEClamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function smoothStep(value: number, minimum: number, maximum: number) {
  const normalized = THREEClamp((value - minimum) / (maximum - minimum), 0, 1);
  return normalized * normalized * (3 - 2 * normalized);
}
