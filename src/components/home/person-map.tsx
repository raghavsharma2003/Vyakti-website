"use client";

import { useCallback, useRef, useState } from "react";
import {
  usePrefersReducedMotion,
  useSelfReveal,
} from "@/components/figures/figure-shared";
import { DIMENSIONS, FAMILIES, FAMILY_SIDES, type FamilyKey } from "./vision-data";
import { useAutoAdvance, useInView } from "./use-in-view";
import styles from "./vision.module.css";

const CX = 350;
const CY = 350;
const R_NODE = 196;
const R_ARC = 232;
const R_LABEL = 262;
const R_HUB = 58;
const SLOTS = DIMENSIONS.length + FAMILIES.length;
const STEP = (Math.PI * 2) / SLOTS;

const at = (angle: number, radius: number) =>
  [
    Number((CX + Math.cos(angle) * radius).toFixed(1)),
    Number((CY + Math.sin(angle) * radius).toFixed(1)),
  ] as const;

/* One empty slot between families, so each family reads as its own arc. */
const GEOMETRY = (() => {
  let slot = 0;
  const angles: number[] = [];
  const range = {} as Record<FamilyKey, { from: number; to: number }>;
  DIMENSIONS.forEach((d, i) => {
    if (i === 0 || DIMENSIONS[i - 1].family !== d.family) {
      if (i) slot += 1;
      range[d.family] = { from: slot, to: slot };
    }
    angles.push(-Math.PI / 2 + (slot + 0.5) * STEP);
    range[d.family].to = slot;
    slot += 1;
  });
  const nodes = angles.map((a) => at(a, R_NODE));
  const spokes = angles.map((a) => [at(a, R_HUB + 4), at(a, R_NODE - 15)] as const);
  const families = FAMILIES.map((f) => {
    const r = range[f.key];
    const a1 = -Math.PI / 2 + r.from * STEP + STEP * 0.15;
    const a2 = -Math.PI / 2 + (r.to + 1) * STEP - STEP * 0.15;
    const [x1, y1] = at(a1, R_ARC);
    const [x2, y2] = at(a2, R_ARC);
    const mid = (a1 + a2) / 2;
    const [lx, ly] = at(mid, R_LABEL);
    const cos = Math.cos(mid);
    const sin = Math.sin(mid);
    const anchor: "start" | "end" | "middle" =
      cos > 0.25 ? "start" : cos < -0.25 ? "end" : "middle";
    const dy = sin > 0.4 ? 16 : sin < -0.4 ? -6 : 5;
    return {
      key: f.key,
      side: f.side,
      arc: `M ${x1} ${y1} A ${R_ARC} ${R_ARC} 0 ${a2 - a1 > Math.PI ? 1 : 0} 1 ${x2} ${y2}`,
      label: { x: lx, y: Number((ly + dy).toFixed(1)), anchor },
    };
  });
  return { nodes, spokes, families };
})();

const pad = (n: number) => String(n).padStart(2, "0");

export function PersonMap() {
  const [selected, setSelected] = useState(0);
  const [auto, setAuto] = useState(true);
  const reduced = usePrefersReducedMotion();
  const { ref: revealRef, revealed } = useSelfReveal<HTMLDivElement>();
  const viewRef = useRef<HTMLDivElement>(null);
  const inView = useInView(viewRef, 0.3);

  const advance = useCallback(
    () => setSelected((s) => (s + 1) % DIMENSIONS.length),
    [],
  );
  useAutoAdvance(auto && !reduced && inView, 4600, advance);

  const choose = (i: number) => {
    setAuto(false);
    setSelected((i + DIMENSIONS.length) % DIMENSIONS.length);
  };

  const current = DIMENSIONS[selected];
  const [hx, hy] = GEOMETRY.nodes[selected];

  return (
    <div ref={viewRef} className={styles.mapWrap}>
      <div className={styles.famChips}>
        {FAMILY_SIDES.map((side) => (
          <div key={side.key} className={styles.famGroup} role="group" aria-label={`Families: ${side.label.toLowerCase()}`}>
            <span className={styles.famSide}>{side.label}</span>
            {FAMILIES.filter((f) => f.side === side.key).map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={current.family === f.key}
                onClick={() => choose(DIMENSIONS.findIndex((d) => d.family === f.key))}
              >
                <b>{f.key}</b>
                {f.name}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className={styles.mapBody}>
        <div
          ref={revealRef}
          className={[styles.mapVis, revealed ? styles.mapLive : ""].join(" ")}
        >
          <svg
            viewBox="0 0 700 700"
            role="img"
            aria-label="A map of 25 dimensions of understanding a person, grouped into seven families around the person at the centre: five describe the person, and two, drawn dashed, describe the AI."
          >
            {[84, 128, 172].map((r, i) => (
              <circle
                key={r}
                cx={CX}
                cy={CY}
                r={r}
                className={styles.orbitRing}
                style={{ animationDuration: `${60 + i * 24}s` }}
              />
            ))}
            {GEOMETRY.spokes.map(([[x1, y1], [x2, y2]], i) => (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                pathLength={1}
                className={[styles.spoke, i === selected ? styles.spokeOn : ""].join(" ")}
                style={{ ["--i" as string]: i }}
              />
            ))}
            {GEOMETRY.families.map((f) => {
              const on = f.key === current.family;
              const fam = FAMILIES.find((x) => x.key === f.key)!;
              return (
                <g key={f.key}>
                  <path d={f.arc} className={[styles.arc, f.side === "ai" ? styles.arcAi : "", on ? styles.arcOn : ""].join(" ")} />
                  <text
                    x={f.label.x}
                    y={f.label.y}
                    textAnchor={f.label.anchor}
                    className={[styles.famLabel, on ? styles.famLabelOn : ""].join(" ")}
                  >
                    <tspan className={styles.famKey}>{f.key}</tspan> {fam.name}
                  </text>
                </g>
              );
            })}
            <circle cx={hx} cy={hy} r={25} className={styles.halo} />
            {GEOMETRY.nodes.map(([x, y], i) => {
              const d = DIMENSIONS[i];
              return (
                <g
                  key={d.name}
                  role="button"
                  tabIndex={0}
                  aria-label={`${i + 1}. ${d.name}`}
                  aria-pressed={i === selected}
                  className={[
                    styles.node,
                    d.first ? styles.nodeFirst : "",
                    i === selected ? styles.nodeOn : "",
                  ].join(" ")}
                  style={{ ["--i" as string]: i }}
                  onClick={() => choose(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      choose(i);
                    }
                  }}
                >
                  <circle cx={x} cy={y} r={15} />
                  <text x={x} y={y}>
                    {i + 1}
                  </text>
                </g>
              );
            })}
            <circle cx={CX} cy={CY} r={R_HUB} className={styles.hub} />
            <text x={CX} y={CY} className={styles.hubText}>
              a person
            </text>
          </svg>
        </div>

        <div className={styles.dimStack} aria-live={auto ? "off" : "polite"}>
          {DIMENSIONS.map((d, i) => {
            const fam = FAMILIES.find((f) => f.key === d.family)!;
            const on = i === selected;
            return (
              <article
                key={d.name}
                className={[styles.dimCard, on ? styles.dimCardOn : ""].join(" ")}
                aria-hidden={!on}
                inert={!on}
              >
                <div className={styles.dimTop}>
                  <span>
                    {fam.key} · {fam.long}
                  </span>
                  <span className={d.first ? styles.chipFirst : styles.chipLater}>
                    {d.first ? "First research target" : "Later"}
                  </span>
                </div>
                <h3>
                  <span className={styles.dimNum}>{pad(i + 1)}</span>
                  <span>{d.name}</span>
                </h3>
                <dl>
                  <div>
                    <dt>Core question</dt>
                    <dd>{d.question}</dd>
                  </div>
                  <div>
                    <dt>Why it’s still open</dt>
                    <dd>{d.open}</dd>
                  </div>
                  <div>
                    <dt>Ground truth</dt>
                    <dd className={styles.truth}>{d.truth}</dd>
                  </div>
                </dl>
                <div className={styles.dimNav}>
                  <button type="button" aria-label="Previous dimension" onClick={() => choose(i - 1)}>
                    ←
                  </button>
                  <button type="button" aria-label="Next dimension" onClick={() => choose(i + 1)}>
                    →
                  </button>
                  <span>
                    {pad(i + 1)} / {DIMENSIONS.length} · filled nodes are first targets
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
