import type { Metadata } from "next";
import Link from "next/link";
import { RelationalStory } from "@/components/home/relational-story";
import { PersonMap } from "@/components/home/person-map";
import { LivingTheory } from "@/components/home/living-theory";
import styles from "@/components/home/home.module.css";
import v from "@/components/home/vision.module.css";
import { Cta } from "@/components/ui/cta";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.name} | ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: "/" },
};

const PROPOSAL_URL = "https://lossfunk.vyakti.ai";

/* External, published results only. Each bar is a citation, not a Vyakti claim. */
const LADDER = [
  {
    label: "Remember you",
    detail: "Recall what you said",
    bars: [{ cls: v.barKnown, w: "90%" }],
    figure: <>90%+</>,
    source: "LongMemEval",
  },
  {
    label: "Infer you",
    detail: "Work out what you know, want or believe",
    bars: [
      { cls: v.barHalf, w: "37%" },
      { cls: `${v.barHalf} ${v.barSoft}`, l: "37%", w: "28%" },
    ],
    figure: <>37–65%</>,
    source: "PersonaMem-v2 · CUPID",
  },
  {
    label: "Act on it",
    detail: "Use what it inferred",
    bars: [
      { cls: v.barReach, l: "15%", w: "80%" },
      { cls: v.barLost, w: "15%" },
    ],
    figure: (
      <>
        15% <small>→ 95% if reminded</small>
      </>
    ),
    source: "SimpleToM",
  },
] as const;

const KNOWING = [
  "What they really understand",
  "How they think and learn",
  "What they feel, and what they avoid",
  "What goes unsaid in how they talk",
  "How much they trust, and why",
] as const;

const BEING = [
  "Memory with provenance, and real forgetting",
  "One steady point of view",
  "Boundaries that hold",
  "Change that has a reason",
  "The same someone on a better model",
] as const;

const THEORY_RULES = [
  { t: "Evidence, not impressions", d: "Every belief cites what it saw." },
  { t: "Confidence that moves", d: "Each interaction nudges it up or down." },
  { t: "Fades without fresh proof", d: "Old beliefs decay unless reality confirms them again." },
  { t: "Yours to read and correct", d: "The person can see it, fix it, or delete it." },
] as const;

const FRONTIERS = [
  {
    name: "Learning",
    status: "First proving ground",
    tone: v.statusFirst,
    body: "The one domain with an answer key. A fresh problem a week later shows whether the AI was right about the learner, so understanding a person can finally be measured instead of asserted.",
    link: { href: PROPOSAL_URL, label: "Read the research proposal" },
  },
  {
    name: "Maya",
    status: "Live, early",
    tone: v.statusLive,
    body: "Our first AI person, live in an early version. A companion built to remember what mattered, keep one recognizable self, and say plainly what she is.",
    link: { href: SITE.maya, label: "Talk to Maya" },
  },
  {
    name: "Groups",
    status: "Active research",
    tone: "",
    body: "One relational layer holding separate relationships with a couple, a family or a friend group. What one person shares stays theirs unless they grant it, enforced before retrieval rather than requested of the model.",
  },
  {
    name: "Mentors, elder care, health",
    status: "Later",
    tone: "",
    body: "Wherever being understood across months matters more than a fast answer. We widen only as the evidence does.",
  },
] as const;

const RESEARCH = [
  {
    title: "Understanding the person",
    body: "Can an AI read what someone really understands, feels and needs from ordinary interaction, and be scored against what they do next?",
  },
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
  {
    title: "Learning from being wrong",
    body: "When its predictions about a person miss, does the system rewrite its methods and get measurably better at the next person?",
  },
] as const;

const PRINCIPLES = [
  {
    title: "Always AI",
    body: "Maya should never impersonate a person or hide what she is. Presence does not require deception.",
  },
  {
    title: "Memory you control",
    body: "What is remembered should be inspectable, correctable, exportable, and erasable by the user.",
  },
  {
    title: "Beliefs, not labels",
    body: "What the system believes about you cites its evidence, stays open to correction, and fades unless reality keeps confirming it.",
  },
  {
    title: "Connection without capture",
    body: "No guilt, coercion, or dependence mechanics designed to monopolize attention. Success is your growth, never your time spent.",
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

      {/* ------------------------------------------------ the vision */}
      <section id="vision" className={v.vision} aria-labelledby="vision-title">
        <div className="shell">
          <p className={`eyebrow ${v.kicker}`}>The vision</p>
          <div className={v.headSplit}>
            <h2 id="vision-title" className={styles.sectionLead}>
              AI knows almost everything. <span className={v.signal}>Except you.</span>
            </h2>
            <p className={styles.sectionCopy}>
              Models now write production code, and an AI system has produced a
              machine-checked proof for Navier–Stokes, a Millennium Prize problem. Yet
              a tutor still can’t tell whether a child understood, a coach
              can’t tell when someone is about to quit, and an assistant agrees
              when it should push back. Vyakti works on what intelligence alone
              does not solve: understanding a particular person, and staying
              someone to them over time.
            </p>
          </div>

          <div className={v.ladder} data-reveal="0">
            <div className={v.ladderHead}>
              <span>How far AI has climbed toward a person</span>
              <span>Published results</span>
            </div>
            {LADDER.map((rung, i) => (
              <div key={rung.label} className={v.rung}>
                <div className={v.rungLabel}>
                  <b>{rung.label}</b>
                  <span>{rung.detail}</span>
                </div>
                <div className={v.bar}>
                  {rung.bars.map((bar, j) => (
                    <b
                      key={j}
                      className={bar.cls}
                      style={{
                        ["--w" as string]: bar.w,
                        ["--l" as string]: "l" in bar ? bar.l : "0%",
                        ["--d" as string]: i * 220 + j * 120,
                      }}
                    />
                  ))}
                </div>
                <div className={v.rungFig}>
                  <b>{rung.figure}</b>
                  <span>{rung.source}</span>
                </div>
              </div>
            ))}
            <div className={`${v.rung} ${v.rungOpen}`}>
              <div className={v.rungLabel}>
                <b>Get better at you</b>
                <span>Improve with every conversation</span>
              </div>
              <div className={`${v.bar} ${v.barNone}`}>no benchmark exists</div>
              <div className={v.rungFig}>
                <b>?</b>
                <span>Vyakti’s question</span>
              </div>
            </div>
            <p className={v.ladderNote}>
              Remembering a person is close to solved. Understanding one, acting
              on that understanding, and getting better at it over time are not,
              and almost nobody measures them.
            </p>
          </div>

          <div className={v.halves}>
            <article className={v.half} data-reveal="0">
              <span className={v.halfNum}>01 · Knowing someone</span>
              <h3>A living theory of each person.</h3>
              <p>
                Not a profile and not a memory dump: beliefs about a person,
                each with its evidence and its confidence, scored against what
                they actually do next.
              </p>
              <ul>
                {KNOWING.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <div className={v.bridge} aria-hidden="true">
              <div className={v.bridgeTrack}>
                <i />
                <i />
              </div>
              <span>one loop</span>
            </div>
            <article className={v.half} data-reveal="1">
              <span className={v.halfNum}>02 · Being someone</span>
              <h3>One identity that persists.</h3>
              <p>
                The same character next month and next year, carrying a shared
                history forward, while the intelligence beneath it keeps
                improving.
              </p>
              <ul>
                {BEING.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ the map */}
      <section id="person" className={v.mapSection} aria-labelledby="map-title">
        <div className="shell">
          <p className={`eyebrow ${v.kicker}`}>A person, mapped</p>
          <div className={v.headSplit}>
            <h2 id="map-title" className={styles.sectionLead}>
              Seven families. <span className={v.signal}>Twenty&#8209;five open questions.</span>
            </h2>
            <p className={styles.sectionCopy}>
              Understanding a person is not one skill. We break it into seven
              families, from what someone knows to how the relationship itself
              changes what they reveal. Every dimension has a core question, a
              reason it is still open, and a ground truth that could prove an AI
              right or wrong. That last column decides where research starts.
            </p>
          </div>
          <PersonMap />
        </div>
      </section>

      {/* ------------------------------------------------ the instrument */}
      <section className={v.instrument} aria-labelledby="instrument-title">
        <div className="shell">
          <p className="eyebrow">The insight that ties it together</p>
          <h2 id="instrument-title">
            People reveal more to someone they trust.{" "}
            <span>So the relationship is part of the instrument.</span>
          </h2>
          <div className={v.instrumentGrid}>
            <div>
              <div className={v.stat}>
                <strong>.28</strong>
                <p>
                  How strongly the strength of the relationship predicts
                  outcomes in psychotherapy, across nearly 300 studies and more
                  than 30,000 patients.
                  <cite>Flückiger et al., Psychotherapy, 2018</cite>
                </p>
              </div>
              <p className={v.instrumentCopy}>
                For an AI, memory, one steady personality and a bond that grows
                are not product features. They are how honest signals get in.
                Knowing someone and staying someone to them are one loop.
              </p>
            </div>
            <TrustLoop />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ persistence */}
      <section id="persistence" className={v.persist} aria-labelledby="persist-title">
        <div className="shell">
          <p className={`eyebrow ${v.kicker}`}>Persistent, never fixed</p>
          <div className={v.headSplit}>
            <h2 id="persist-title" className={styles.sectionLead}>
              The identity persists. <span className={v.signal}>Its beliefs about you never set.</span>
            </h2>
            <p className={styles.sectionCopy}>
              Two things should last: who the AI is, and the history you share.
              One thing should never harden: its picture of you. The system
              keeps growing and changing with every interaction, so no belief
              becomes a label.
            </p>
          </div>

          <div className={v.persistGrid}>
            <div className={v.persistSide}>
              <h3>A theory that is rewritten, not stored.</h3>
              <ul className={v.rules}>
                {THEORY_RULES.map((rule) => (
                  <li key={rule.t}>
                    <b>{rule.t}</b>
                    <span>{rule.d}</span>
                  </li>
                ))}
              </ul>
            </div>
            <LivingTheory />
          </div>

          <h3 className={v.continuityLead}>
            A prompt shapes one reply. A relationship shapes what comes next.
          </h3>
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
                <li>A living theory of the person</li>
                <li>Consent and boundaries</li>
              </ul>
            </div>
            <div className={styles.continuityArrow} aria-hidden="true">→</div>
            <div className={`${styles.continuityNode} ${styles.continuityOutput}`}>
              <small>One continuous identity</small>
              <strong className={styles.meeraWord}>Maya</strong>
              <p>More capable over time. Still recognizably herself.</p>
            </div>
            <figcaption id="continuity-caption">
              Our research asks whether the engine can change without breaking the identity above it. Today the base model still sets a strong ceiling, which is why we measure it rather than promise it.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ------------------------------------------------ where it begins */}
      <section id="frontiers" className={v.frontiers} aria-labelledby="frontiers-title">
        <div className="shell">
          <p className={`eyebrow ${v.kicker}`}>Where it begins</p>
          <div className={v.headSplit}>
            <h2 id="frontiers-title" className={styles.sectionLead}>
              One relational layer. <span className={v.signal}>Many kinds of relationship.</span>
            </h2>
            <p className={styles.sectionCopy}>
              The same layer that learns a person can teach them, keep them
              company, or hold a family’s shared history. We start where being
              right about someone can be proven.
            </p>
          </div>
          <div className={v.frontierGrid}>
            <RelationalHub />
            <ol className={v.frontierList}>
              {FRONTIERS.map((f) => (
                <li key={f.name}>
                  <span className={`${v.status} ${f.tone}`}>{f.status}</span>
                  <div>
                    <h3>{f.name}</h3>
                    <p>{f.body}</p>
                    {"link" in f ? (
                      f.link.href.startsWith("http") ? (
                        <a href={f.link.href} target="_blank" rel="noopener">
                          {f.link.label}
                        </a>
                      ) : (
                        <Link href={f.link.href}>{f.link.label}</Link>
                      )
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ research */}
      <section className={styles.researchSection}>
        <div className="shell">
          <div className={styles.researchHeader}>
            <h2 className={styles.sectionLead}>
              The parts only matter if they hold together.
            </h2>
            <p className={styles.sectionCopy}>
              Understanding, identity, memory, culture, and expression are not
              separate product features. They are one system viewed from
              different moments.
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

      {/* ------------------------------------------------ evaluation */}
      <section className={styles.evidenceSection}>
        <div className="shell">
          <div className={styles.evidenceIntro}>
            <h2 className={styles.sectionLead}>
              Feeling human is not a metric. Being right about someone is.
            </h2>
            <p className={styles.sectionCopy}>
              The difficult failures appear across time. We evaluate where a
              one-minute demo cannot hide the seams: the system writes down what
              it believes, and reality grades it later.
            </p>
          </div>

          <div className={styles.timeHorizon} aria-label="Evaluation across time">
            <div className={styles.timePoint}>
              <strong>One turn</strong>
              <span>Did the timing, tone, and response fit the moment?</span>
            </div>
            <div className={styles.timePoint}>
              <strong>One week</strong>
              <span>Did what it predicted about the person come true?</span>
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
            <p>What did it get wrong about you?</p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ principles */}
      <section id="principles" className={styles.principlesSection}>
        <div className="shell">
          <div className={styles.principlesHeader}>
            <h2 className={styles.sectionLead}>
              Human presence demands clearer boundaries, not weaker ones.
            </h2>
            <p className={styles.sectionCopy}>
              Trust is part of the architecture. The system should make its
              identity, memory, beliefs, uncertainty, and permissions legible.
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
                Understand one person truly.{" "}
                <span className={v.signal}>Then everyone.</span>
              </h2>
              <p className={styles.sectionCopy}>
                Maya is our first AI person, live in an early version. The
                research is open about what works and what breaks.
              </p>
            </div>
            <div className={styles.finalActions}>
              <Cta href={SITE.maya}>Talk to Maya</Cta>
              <Cta href="/research" variant="secondary">
                Follow the research
              </Cta>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* The trust loop: a lit arc travels the ring while each stage takes its turn. */
function TrustLoop() {
  const CX = 310;
  const CY = 260;
  const R = 178;
  const NODES = [
    { label: "Trust", x: CX, y: CY - R },
    { label: "Honest signals", x: CX + R, y: CY },
    { label: "A truer theory", x: CX, y: CY + R },
    { label: "Feeling understood", x: CX - R, y: CY },
  ];
  return (
    <div className={v.loop}>
      <svg
        viewBox="0 0 620 520"
        role="img"
        aria-label="The loop: trust leads to honest signals, honest signals to a truer theory of the person, a truer theory to feeling understood, and feeling understood back to trust."
      >
        <circle cx={CX} cy={CY} r={R} className={v.loopTrack} />
        {/* the group sets the start at twelve o'clock; the circle's own
            animation owns its transform */}
        <g transform={`rotate(-90 ${CX} ${CY})`}>
          <circle cx={CX} cy={CY} r={R} pathLength={1} className={v.loopLit} />
        </g>
        {NODES.map((n, i) => {
          const w = n.label.length * 9.2 + 40;
          return (
            <g key={n.label} className={v.loopNode} style={{ ["--n" as string]: i }}>
              <rect x={n.x - w / 2} y={n.y - 24} width={w} height={48} rx={24} />
              <text x={n.x} y={n.y}>
                {n.label}
              </text>
            </g>
          );
        })}
        <text x={CX} y={CY + 4} className={v.loopCentre}>
          one loop
        </text>
        <text x={CX} y={CY + 34} className={v.loopCentreSub}>
          KNOWING · BEING
        </text>
      </svg>
    </div>
  );
}

/* One relational core with bounded relationships around it. */
function RelationalHub() {
  const C = 260;
  const R = 186;
  const SATS = [
    { label: "Learning", kind: "first" },
    { label: "Maya", kind: "live" },
    { label: "Groups", kind: "live" },
    { label: "Mentors", kind: "later" },
    { label: "Elder care", kind: "later" },
    { label: "Health", kind: "later" },
  ] as const;
  return (
    <div className={v.hubVis}>
      <svg
        viewBox="0 0 520 520"
        role="img"
        aria-label="One relational layer at the centre, connected to learning first, then Maya and groups, with mentors, elder care and health later."
      >
        {SATS.map((s, i) => {
          const a = -Math.PI / 2 + (i * Math.PI * 2) / SATS.length;
          const x = Number((C + Math.cos(a) * R).toFixed(1));
          const y = Number((C + Math.sin(a) * R).toFixed(1));
          return (
            <line
              key={`l-${s.label}`}
              x1={C}
              y1={C}
              x2={x}
              y2={y}
              className={[v.hubSpoke, s.kind === "later" ? v.hubSpokeLater : ""].join(" ")}
            />
          );
        })}
        <circle cx={C} cy={C} r={92} className={v.hubCoreRing} />
        <circle cx={C} cy={C} r={74} className={v.hubCore} />
        <text x={C} y={C - 4} className={v.hubCoreText}>
          Vyakti
        </text>
        <text x={C} y={C + 18} className={v.hubCoreText} style={{ fontSize: 13, opacity: 0.7 }}>
          relational layer
        </text>
        {SATS.map((s, i) => {
          const a = -Math.PI / 2 + (i * Math.PI * 2) / SATS.length;
          const x = Number((C + Math.cos(a) * R).toFixed(1));
          const y = Number((C + Math.sin(a) * R).toFixed(1));
          const r = Math.max(44, s.label.length * 4.6 + 12);
          return (
            <g
              key={s.label}
              className={[
                v.hubSat,
                s.kind === "first" ? v.hubSatFirst : "",
                s.kind === "later" ? v.hubSatLater : "",
              ].join(" ")}
            >
              <circle cx={x} cy={y} r={r} />
              <text x={x} y={y}>
                {s.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
