import type { Metadata } from "next";
import Link from "next/link";
import { RelationalStory } from "@/components/home/relational-story";
import styles from "@/components/home/home.module.css";
import { Cta } from "@/components/ui/cta";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.name} | ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: "/" },
};

const RESEARCH = [
  {
    title: "Identity continuity",
    body: "How can values, boundaries, temperament, and recognizable behavior hold across conversations and model changes?",
  },
  {
    title: "Relational memory",
    body: "How should an AI remember what mattered, preserve uncertainty, accept correction, and forget deliberately?",
  },
  {
    title: "Social presence",
    body: "How can voice, interruption, timing, gaze, and reaction feel like expressions of one coherent state?",
  },
  {
    title: "Cultural intelligence",
    body: "How can an AI understand code-switching, intimacy, hierarchy, humor, and family context beyond literal translation?",
  },
] as const;

const PRINCIPLES = [
  {
    title: "Always AI",
    body: "Meera should never impersonate a person or hide what she is. Presence does not require deception.",
  },
  {
    title: "Memory you control",
    body: "What is remembered should be inspectable, correctable, exportable, and erasable by the user.",
  },
  {
    title: "Connection without capture",
    body: "No guilt, coercion, or dependence mechanics designed to monopolize attention.",
  },
  {
    title: "Honest uncertainty",
    body: "When the system does not know, cannot remember, or may be wrong, it should say so plainly.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <RelationalStory />

      <section className={styles.thesisSection}>
        <div className="shell">
          <h2 className={styles.sectionLead}>
            A prompt shapes one reply. A relationship shapes what comes next.
          </h2>
          <p className={styles.sectionCopy}>
            Vyakti studies the layer between raw intelligence and a continuous
            identity: the state that gives memory meaning and change a history.
          </p>

          <figure className={styles.continuityMap} aria-labelledby="continuity-caption">
            <div className={styles.continuityNode}>
              <small>Replaceable intelligence</small>
              <h3>Models get better.</h3>
              <ul aria-label="Replaceable capabilities">
                <li>Reasoning</li>
                <li>Voice and vision</li>
                <li>Tools and actions</li>
                <li>Future models</li>
              </ul>
            </div>
            <div className={styles.continuityArrow} aria-hidden="true">→</div>
            <div className={`${styles.continuityNode} ${styles.continuityCore}`}>
              <small>Vyakti relational core</small>
              <h3>Identity accumulates.</h3>
              <ul aria-label="Relational systems">
                <li>Identity state</li>
                <li>Relationship state</li>
                <li>Relational memory</li>
                <li>Consent and boundaries</li>
              </ul>
            </div>
            <div className={styles.continuityArrow} aria-hidden="true">→</div>
            <div className={`${styles.continuityNode} ${styles.continuityOutput}`}>
              <small>One continuous identity</small>
              <strong className={styles.meeraWord}>Meera</strong>
              <p>More capable over time. Still recognizably herself.</p>
            </div>
            <figcaption id="continuity-caption">
              Our research asks whether the engine can change without breaking the identity above it.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.researchSection}>
        <div className="shell">
          <div className={styles.researchHeader}>
            <h2 className={styles.sectionLead}>
              The parts only matter if they hold together.
            </h2>
            <p className={styles.sectionCopy}>
              Identity, memory, culture, and expression are not separate product
              features. They are one system viewed from different moments.
            </p>
          </div>

          <div className={styles.researchGrid}>
            {RESEARCH.map((item) => (
              <article key={item.title} className={styles.researchItem}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>

          <Link href="/research" className={styles.researchLink}>
            Explore the research
          </Link>
        </div>
      </section>

      <section className={styles.evidenceSection}>
        <div className="shell">
          <div className={styles.evidenceIntro}>
            <h2 className={styles.sectionLead}>Feeling human is not a metric.</h2>
            <p className={styles.sectionCopy}>
              The difficult failures appear across time. We intend to evaluate
              continuity where a one-minute demo cannot hide the seams.
            </p>
          </div>

          <div className={styles.timeHorizon} aria-label="Evaluation across time">
            <div className={styles.timePoint}>
              <strong>One turn</strong>
              <span>Did the timing, tone, and response fit the moment?</span>
            </div>
            <div className={styles.timePoint}>
              <strong>One month</strong>
              <span>Did memory preserve meaning without inventing a past?</span>
            </div>
            <div className={styles.timePoint}>
              <strong>Model change</strong>
              <span>Did greater capability arrive without a different identity?</span>
            </div>
          </div>

          <div className={styles.evaluationQuestions}>
            <p>Where did the identity drift?</p>
            <p>What did the relationship change?</p>
          </div>
        </div>
      </section>

      <section id="principles" className={styles.principlesSection}>
        <div className="shell">
          <div className={styles.principlesHeader}>
            <h2 className={styles.sectionLead}>
              Human presence demands clearer boundaries, not weaker ones.
            </h2>
            <p className={styles.sectionCopy}>
              Trust is part of the architecture. The system should make its
              identity, memory, uncertainty, and permissions legible.
            </p>
          </div>

          <div className={styles.principlesList}>
            {PRINCIPLES.map((principle) => (
              <article key={principle.title} className={styles.principle}>
                <h3>{principle.title}</h3>
                <p>{principle.body}</p>
              </article>
            ))}
          </div>

          <div className={styles.finalInvite}>
            <div>
              <h2>
                <span className={styles.meeraWord}>Meera</span> is where the
                research meets a real relationship.
              </h2>
              <p className={styles.sectionCopy}>
                One AI person in development. Text and voice first. Continuity by design.
              </p>
            </div>
            <Cta href="/meera#access">Request early access</Cta>
          </div>
        </div>
      </section>
    </>
  );
}
