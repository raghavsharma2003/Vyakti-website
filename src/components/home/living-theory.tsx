"use client";

import { useCallback, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/figures/figure-shared";
import { THEORY, THEORY_ROWS, resolveTheory, type Bet } from "./vision-data";
import { useAutoAdvance, useInView } from "./use-in-view";
import styles from "./vision.module.css";

const RESOLVED = resolveTheory();
const BET_LABEL: Record<Bet["state"], string> = { open: "Open", hit: "Came true", miss: "Missed" };

/**
 * One learner's theory, rewritten across five weeks. The live layer keeps the
 * same row elements between stages so confidence bars move from their old
 * value; invisible copies of every stage share its grid cell so the card is
 * always as tall as its tallest stage and the page never jumps.
 */
export function LivingTheory() {
  const [stage, setStage] = useState(0);
  const [auto, setAuto] = useState(true);
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, 0.3);
  const playing = auto && !reduced;

  const advance = useCallback(() => setStage((s) => (s + 1) % THEORY.length), []);
  useAutoAdvance(playing && inView, 5600, advance);

  return (
    <div ref={ref} className={styles.theory}>
      <div className={styles.theoryTop}>
        <div>
          <h3>Meher</h3>
          <span>Illustrative learner · rewritten after every session</span>
        </div>
        {!reduced ? (
          <button
            type="button"
            className={styles.play}
            aria-label={auto ? "Pause" : "Play"}
            onClick={() => setAuto((a) => !a)}
          >
            {auto ? "❚❚" : "▶"}
          </button>
        ) : null}
      </div>

      <div className={styles.timeline} role="tablist" aria-label="Moments in the theory">
        <i
          className={styles.timelineFill}
          // dots sit at the column centres, 12.5% to 87.5% of the track
          style={{ width: `${(stage / (THEORY.length - 1)) * (100 - 100 / THEORY.length)}%` }}
        />
        {THEORY.map((s, i) => (
          <button
            key={s.at}
            type="button"
            role="tab"
            aria-selected={i === stage}
            className={[i <= stage ? styles.past : "", i === stage ? styles.cur : ""].join(" ")}
            onClick={() => {
              setAuto(false);
              setStage(i);
            }}
          >
            {s.at}
          </button>
        ))}
      </div>

      <div className={styles.theoryStack}>
        <StageView index={stage} live />
        {THEORY.map((s, i) => (
          <StageView key={s.at} index={i} />
        ))}
      </div>
    </div>
  );
}

function StageView({ index, live = false }: { index: number; live?: boolean }) {
  const st = THEORY[index];
  const rows = RESOLVED[index];
  const previousBets = index ? THEORY[index - 1].bets : [];

  return (
    <div
      className={live ? styles.stageLive : styles.stageSizer}
      aria-hidden={live ? undefined : true}
      role={live ? "tabpanel" : undefined}
    >
      <div className={styles.rows}>
        {THEORY_ROWS.map(({ key, label }) => {
          const r = rows[key];
          const fading = st.fading?.[key];
          const revised = r.changed && Boolean(r.previous);
          const added = r.changed && !r.previous;
          return (
            <div key={key} className={[styles.row, live && r.changed ? styles.rowChanged : ""].join(" ")}>
              <span className={styles.rowKey}>
                <b>{key}</b>
                {label}
              </span>
              <div className={styles.rowText} key={live ? `${index}-${key}` : undefined}>
                {/* the old belief strikes through and gives way to the new
                    one in the same cell, so a revision never adds height */}
                <div className={styles.swap}>
                  {revised ? (
                    <s className={live ? styles.old : styles.oldStatic}>{r.previous}</s>
                  ) : null}
                  <span className={live && r.changed ? (revised ? styles.enterLate : styles.enter) : undefined}>
                    {r.text}
                    {revised ? <em className={styles.tagRevised}>revised</em> : null}
                    {added ? <em className={styles.tagNew}>new</em> : null}
                  </span>
                </div>
                {fading ? (
                  <span className={styles.fadeLine}>
                    <em className={styles.tagFading}>fading</em> {fading}
                  </span>
                ) : null}
              </div>
              <div className={styles.conf}>
                <span>{Math.round(r.confidence * 100)}% sure</span>
                <i>
                  <b style={{ width: `${Math.round(r.confidence * 100)}%` }} />
                </i>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.bets}>
        <span className={styles.betsHead}>Open bets, graded by what she does</span>
        {st.bets.map((b) => {
          const before = previousBets.find((p) => p.claim === b.claim);
          const flipped = live && before && before.state !== b.state;
          return (
            <div key={b.claim} className={[styles.bet, flipped ? styles.betFlip : ""].join(" ")}>
              <span>{b.claim}</span>
              <span className={styles.odds}>{b.odds}</span>
              <span className={[styles.betState, styles[`bet_${b.state}`]].join(" ")}>
                {BET_LABEL[b.state]}
              </span>
            </div>
          );
        })}
      </div>

      <p className={styles.theoryNote}>
        <b>{st.noteLead}</b> {st.note}
      </p>
    </div>
  );
}
