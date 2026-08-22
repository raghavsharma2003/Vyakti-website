import type { Metadata } from "next";
import Link from "next/link";
import { Cta } from "@/components/ui/cta";
import { ResearchFigure } from "@/components/research/figures";
import { HashAnchors } from "@/components/research/hash-anchors";
import { PILLARS } from "@/lib/site";
import {
  LAB,
  PAPERS,
  RELEASES,
  RESULTS,
  RETRACTIONS,
  STATUS_LABEL,
} from "@/lib/research";
import styles from "./research.module.css";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Vyakti researches identity continuity, relational memory, multimodal expression and evaluation for persistent AI identities. Read our preprint, active research note, measured findings and artifact status.",
  alternates: { canonical: "/research" },
  openGraph: {
    title: "Research at Vyakti",
    description:
      "Research on the systems that let an AI identity remain coherent across time, context and model change.",
    url: "/research",
  },
};

const release = RELEASES[0];

const INVENTORY = [
  ["01", "web preprint", "#publications"],
  ["01", "research note in progress", "#publications"],
  ["03", "empirical findings", "#findings"],
  ["01", "systems measurement", "#findings"],
  ["02", "documented retractions", "#method"],
] as const;

const RESULT_SUMMARIES: Record<string, string> = {
  "gate0-structural-privacy":
    "A retrieval-time database predicate produced zero leaks across 31,122 checks. The same privacy rule expressed only as a prompt instruction leaked in most tested scenarios.",
  "vision-gate-engagement":
    "A matched-arm study found that more proactive screen commentary roughly doubled engagement, with no statistically detected rise in fabrication in the powered follow-up.",
  "ground-truth-ceiling-standalone":
    "A trusted AI judge reproduced only 74 of its own 96 prior verdicts. The measured ceiling sat below the qualification bar fixed before the run.",
  "cache-economics":
    "On measured production calls, prompt caching reduced the cost of an otherwise identical turn by roughly nine times.",
};

export default function ResearchPage() {
  return (
    <>
      <HashAnchors />

      <section className={styles.hero}>
        <div className="shell">
          <p className={styles.kicker}>Vyakti Research</p>
          <h1>Researching what lets an AI remain itself.</h1>
          <p className={styles.heroCopy}>
            Intelligence can be replaced. A relationship cannot. We study the
            state, memory, perception and evaluation systems that make
            continuity testable.
          </p>

          <div className={styles.inventory} aria-label="Research inventory">
            {INVENTORY.map(([value, label, href]) => (
              <Link href={href} key={label} className={styles.inventoryItem}>
                <strong>{value}</strong>
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <nav className={styles.localNav} aria-label="Research sections">
        <div className="shell">
          <div className={styles.localNavTrack}>
            <Link href="#publications">Publications</Link>
            <Link href="#agenda">Agenda</Link>
            <Link href="#findings">Findings</Link>
            <Link href="#method">Method</Link>
            <Link href="#artifacts">Artifacts</Link>
          </div>
        </div>
      </nav>

      <section id="publications" className={styles.publications}>
        <div className="shell">
          <div className={styles.sectionIntro}>
            <h2>Current work</h2>
            <p>
              One completed web preprint and one research note still collecting
              its primary comparison. Their status is part of the result.
            </p>
          </div>

          <div className={styles.paperList}>
            {PAPERS.map((paper, index) => (
              <article key={paper.id} className={styles.paper}>
                <div className={styles.paperMeta}>
                  <span>{STATUS_LABEL[paper.status]}</span>
                  <time>{paper.statusAsOf}</time>
                </div>
                <div className={styles.paperBody}>
                  <p className={styles.paperType}>
                    {index === 0 ? "Web preprint" : "Research note in progress"}
                  </p>
                  <h3>
                    <Link href={`/research/papers/${paper.slug}`}>
                      {paper.title}
                    </Link>
                  </h3>
                  <p>{paper.cardSummary}</p>

                  {paper.cardNumbers.length ? (
                    <dl className={styles.paperNumbers}>
                      {paper.cardNumbers.map((entry) => (
                        <div key={entry.label}>
                          <dt>{entry.value}</dt>
                          <dd>{entry.label}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className={styles.notFinding}>
                      No result is published. The primary comparison remains
                      incomplete.
                    </p>
                  )}

                  <Link
                    href={`/research/papers/${paper.slug}`}
                    className={styles.textLink}
                  >
                    {index === 0 ? "Read the preprint" : "Read the research status"}
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.figurePanel}>
            <ResearchFigure figure="fig-f1-agreement-forest" />
          </div>
        </div>
      </section>

      <section id="agenda" className={styles.agenda}>
        <div className="shell">
          <div className={styles.sectionIntro}>
            <h2>Research agenda</h2>
            <p>
              Five connected questions define the relational layer. We treat
              them as one system, not a list of companion features.
            </p>
          </div>

          <div className={styles.agendaGrid}>
            {PILLARS.map((pillar) => (
              <article key={pillar.id} id={pillar.id} className={styles.agendaItem}>
                <h3>{pillar.title}</h3>
                <p className={styles.agendaQuestion}>{pillar.short}</p>
                <p>{pillar.summary}</p>
                <ul aria-label={`${pillar.title} topics`}>
                  {pillar.terms.map((term) => (
                    <li key={term}>{term}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="findings" className={styles.findings}>
        <div className="shell">
          <div className={styles.sectionIntro}>
            <h2>Measured findings</h2>
            <p>
              Three empirical findings and one systems measurement. Each value
              keeps its sample, method, date and source attached.
            </p>
          </div>

          <div className={styles.resultGrid}>
            {RESULTS.map((result, index) => (
              <article key={result.id} id={result.id} className={styles.result}>
                <p className={styles.resultType}>
                  {index === RESULTS.length - 1
                    ? "Systems measurement"
                    : "Empirical finding"}
                </p>
                <strong className={styles.resultNumber}>{result.number}</strong>
                {result.numberNote ? (
                  <p className={styles.resultNote}>{result.numberNote}</p>
                ) : null}
                <h3>{result.headline}</h3>
                <p className={styles.resultSummary}>
                  {RESULT_SUMMARIES[result.id]}
                </p>
                <details className={styles.provenance}>
                  <summary>Method and provenance</summary>
                  <dl>
                    <div>
                      <dt>Sample</dt>
                      <dd>{result.provenance.n}</dd>
                    </div>
                    <div>
                      <dt>Method</dt>
                      <dd>{result.provenance.method}</dd>
                    </div>
                    <div>
                      <dt>Date</dt>
                      <dd>{result.provenance.date}</dd>
                    </div>
                    <div>
                      <dt>Source</dt>
                      <dd>{result.provenance.source}</dd>
                    </div>
                  </dl>
                </details>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="method" className={styles.method}>
        <div className="shell">
          <div className={styles.methodGrid}>
            <div>
              <p className={styles.kicker}>Method</p>
              <h2>Make the claim earn its typography.</h2>
              <p className={styles.methodLead}>{LAB.standfirst}</p>
            </div>
            <ol className={styles.methodSteps}>
              <li>
                <strong>Fix the bar first.</strong>
                <span>Qualification criteria are written before candidates run.</span>
              </li>
              <li>
                <strong>Run the control.</strong>
                <span>Alternative explanations are tested, not narrated away.</span>
              </li>
              <li>
                <strong>Keep provenance attached.</strong>
                <span>Every number travels with its sample, method, date and source.</span>
              </li>
              <li>
                <strong>Publish the correction.</strong>
                <span>A failed explanation remains visible with the control that killed it.</span>
              </li>
            </ol>
          </div>

          <div className={styles.retractions}>
            {RETRACTIONS.map((retraction) => (
              <article key={retraction.id}>
                <p className={styles.struck}>{retraction.claim}</p>
                <p>{retraction.control}</p>
                <small>{retraction.source}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="artifacts" className={styles.artifacts}>
        <div className="shell">
          <div className={styles.artifactGrid}>
            <div>
              <p className={styles.kicker}>Artifact package</p>
              <h2>{release.name}</h2>
              <p>{release.description}</p>
            </div>
            <div className={styles.artifactStatus}>
              <strong>Publication pending</strong>
              <p>{release.status}</p>
              <dl>
                <div>
                  <dt>Code license</dt>
                  <dd>{release.licenses.code}</dd>
                </div>
                <div>
                  <dt>Data license</dt>
                  <dd>{release.licenses.data}</dd>
                </div>
              </dl>
              <Link
                href={`/research/releases/${release.slug}`}
                className={styles.textLink}
              >
                Read the artifact datasheet <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.collaborate}>
        <div className="shell-narrow">
          <h2>Build the evidence with us.</h2>
          <p>
            We want to work with researchers in speech, conversation analysis,
            memory, evaluation and long-horizon systems.
          </p>
          <Cta href="/company#careers">Work with Vyakti</Cta>
        </div>
      </section>
    </>
  );
}
