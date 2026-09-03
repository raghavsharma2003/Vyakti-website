import type { Metadata } from "next";
import Link from "next/link";
import { RelationalStory } from "@/components/home/relational-story";
import styles from "@/components/home/home.module.css";
import { MeeraPortrait } from "@/components/meera";
import { Cta } from "@/components/ui/cta";
import { APPLY_LABEL, APPLY_MAILTO, APPLY_QUESTIONS, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.name} | ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: "/" },
};

const MECHANISMS = [
  {
    title: "Measurably them",
    body: "A fidelity battery scores every version of a creator's AI against the creator's own material. Below the threshold it does not publish, and the creator sees which parts pulled the number down.",
  },
  {
    title: "Current, not frozen",
    body: "Positions are held with validity in time, so the AI can say what the creator used to think and what changed, instead of quoting a view they have already moved past.",
  },
  {
    title: "Thousands of separate confidences",
    body: "One persona, and one private scope for each follower. The separation is enforced where memory is written, not requested politely from a prompt at the end.",
  },
  {
    title: "It tells you when it drifts",
    body: "When what the creator says in public moves away from what their AI is saying, the creator is told on the day it happens, and which cards to correct.",
  },
] as const;

const TRUST = [
  {
    title: "Always AI",
    body: "Labelled on every screen. It never claims to be the creator in person, and it never claims to be a person at all.",
  },
  {
    title: "Memory you control",
    body: "What a room remembers is inspectable, correctable, exportable and erasable by the person it belongs to.",
  },
  {
    title: "Connection without capture",
    body: "No guilt, no coercion, no mechanics built to farm attention or manufacture dependence.",
  },
  {
    title: "Privacy as architecture",
    body: "Separation between rooms is a property of where data is written and retrieved, not a rule the system is asked to follow.",
  },
  {
    title: "Every generated voice says so",
    body: "A spoken disclosure in the clip itself, and a watermark in the audio.",
  },
  {
    title: "Yourself only, verified",
    body: "A creator can build an AI version of themselves and no one else. We verify who they are before anything is published.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <RelationalStory />

      <section id="rooms" className={styles.roomsSection}>
        <div className="shell">
          <h2 className={styles.sectionLead}>
            A creator can only talk to one person at a time.
          </h2>
          <p className={styles.roomsAnswer}>
            Here they talk to all of them, and none of them can hear each other.
          </p>

          <div className={styles.audienceSplit}>
            <article className={styles.audience}>
              <h3>For the creator</h3>
              <p>
                There are more people asking than there are hours in your week,
                and the questions repeat. Now something that measurably sounds
                like you answers them.
              </p>
              <p>
                You see one score, correct it a card at a time, and get told the
                day it starts to drift away from you.
              </p>
              <p className={styles.readiness}>
                <strong>Readiness</strong>
                <span>Five parts. One number. One thing to fix next.</span>
              </p>
            </article>

            <article className={styles.audience}>
              <h3>For the follower</h3>
              <p>
                Not a message that goes unread. Something that knows what you
                are working on, what you said three weeks ago, and what you keep
                avoiding.
              </p>
              <p>
                You can be honest with it, because it cannot repeat you. Not to
                another follower, and not to the creator.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.mechanismSection}>
        <div className="shell">
          <div className={styles.mechanismHeader}>
            <h2 className={styles.sectionLead}>
              What keeps this from being a chatbot with a face.
            </h2>
            <p className={styles.statusNote}>
              This is what we are building now. The first phase is hand-built,
              one creator at a time.
            </p>
          </div>

          <div className={styles.mechanismGrid}>
            {MECHANISMS.map((item) => (
              <article key={item.title} className={styles.mechanismItem}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="boundaries" className={styles.boundarySection}>
        <div className="shell">
          <h2 className={styles.sectionLead}>Where everything is allowed to go.</h2>

          <figure className={styles.boundaryFigure} aria-labelledby="boundary-caption">
            <div className={styles.boundaryTop}>
              <small>The creator</small>
              <p>Positions, work, answers, voice.</p>
            </div>

            <div className={styles.boundaryDown}>
              <span>Down into every room</span>
            </div>

            <div className={styles.boundaryRooms}>
              <div className={styles.boundaryRoom}>
                <small>A private room</small>
                <p>What this follower said today.</p>
              </div>
              <div className={styles.boundarySeal} aria-hidden="true">
                <span>No path</span>
              </div>
              <div className={styles.boundaryRoom}>
                <small>A private room</small>
                <p>What that one said three weeks ago.</p>
              </div>
              <div className={styles.boundarySeal} aria-hidden="true">
                <span>No path</span>
              </div>
              <div className={styles.boundaryRoom}>
                <small>A private room</small>
                <p>What another keeps avoiding.</p>
              </div>
            </div>

            <div className={styles.boundaryUp}>
              <span>Back up as counts only. No names. No quotes.</span>
            </div>

            <figcaption id="boundary-caption">
              Nothing a follower says writes to the creator&rsquo;s AI, and
              nothing crosses between rooms.
            </figcaption>
          </figure>

          <div className={styles.boundaryNotes}>
            <p>
              Two followers are introduced only when both say yes. Until then,
              neither of them learns the other exists.
            </p>
            <p>
              Export everything, or delete everything, whenever you want to.
            </p>
          </div>
        </div>
      </section>

      <section id="principles" className={styles.principlesSection}>
        <div className="shell">
          <div className={styles.principlesHeader}>
            <h2 className={styles.sectionLead}>
              The more it sounds like them, the clearer this has to be.
            </h2>
          </div>

          <div className={styles.principlesList}>
            {TRUST.map((principle) => (
              <article key={principle.title} className={styles.principle}>
                <h3>{principle.title}</h3>
                <p>{principle.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.proofSection}>
        <div className="shell">
          <div className={styles.proofSplit}>
            <div className={styles.proofCopy}>
              <h2>
                The engine was built on one person first.
              </h2>
              <p className={styles.sectionCopy}>
                <span className={styles.meeraWord}>Meera</span> is where the
                relational engine behind Rooms was built and measured: identity
                that holds its shape, memory with provenance, honest forgetting,
                and privacy enforced before anything is retrieved. She is the
                proof, not the product.
              </p>
              <div className={styles.proofLinks}>
                <Link href="/meera" className={styles.textLink}>
                  How Meera proved the engine
                </Link>
                <Link href="/research" className={styles.textLink}>
                  Read the research
                </Link>
              </div>
            </div>
            <figure className={styles.proofPortrait}>
              <MeeraPortrait sizes="(max-width: 980px) 92vw, 40vw" />
            </figure>
          </div>
        </div>
      </section>

      <section id="apply" className={styles.applySection}>
        <div className="shell">
          <h2 className={styles.sectionLead}>
            Apply for one of the first Rooms.
          </h2>
          <p className={styles.sectionCopy}>
            We are building these by hand, one creator at a time, so the list is
            short and we read all of it. Tell us three things.
          </p>

          <ol className={styles.applyQuestions}>
            {APPLY_QUESTIONS.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>

          <div className={styles.applyActions}>
            <Cta href={APPLY_MAILTO}>{APPLY_LABEL}</Cta>
            <p>
              Free to build. You set what your followers pay. Our share is one
              number, shown before you publish.
            </p>
          </div>

          <p className={styles.applyFooter}>
            India first, in Hindi, Hinglish and English. Everywhere else after
            that.
          </p>
        </div>
      </section>
    </>
  );
}
