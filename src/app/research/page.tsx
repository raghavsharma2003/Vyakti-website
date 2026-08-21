import type { Metadata } from "next";
import Link from "next/link";
import { Cta } from "@/components/ui/cta";
import { TurnDiagram } from "@/components/turn-diagram";
import { EvidenceRail } from "@/components/research/evidence-rail";
import { HashAnchors } from "@/components/research/hash-anchors";
import { Measure } from "@/components/research/measure";
import { MethodModule } from "@/components/research/method-module";
import { PaperCard } from "@/components/research/paper-card";
import { ResearchFigure } from "@/components/research/figures";
import { PILLARS } from "@/lib/site";
import { HERO_COUNTS, LAB, PAPERS, RELEASES, RESULTS } from "@/lib/research";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Vyakti researches identity continuity, relational memory, multimodal expression and user-controlled agency for persistent AI identities. Two papers, four standalone results, two retractions and one released benchmark.",
  alternates: { canonical: "/research" },
  openGraph: {
    title: "Research at Vyakti",
    description:
      "Identity continuity, relational memory and multimodal expression. The architecture beneath persistent AI identities, with the measurements under it.",
    url: "/research",
  },
};

const release = RELEASES[0];

export default function ResearchPage() {
  return (
    <>
      <HashAnchors />

      <section className="border-b border-hairline bg-ink pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="shell">
          <h1 className="max-w-[18ch] text-bone">
            Personality is not a system prompt.
          </h1>
          <p className="measure mt-8 text-lead text-ash">
            It is the continuity between memory, perception, expression and
            action. We study the systems that let a character hold together
            across situations and over time.
          </p>
          {/* Four counts, all derived from the content module, all a count of
              a thing you can click. */}
          <p className="mt-10 font-mono text-micro tracking-[0.06em] text-slate">
            {HERO_COUNTS}
          </p>
        </div>
      </section>

      {/* The five tracks, in depth, each carrying what we have measured on it. */}
      <section className="bg-ink">
        {PILLARS.map((pillar, i) => (
          <article
            key={pillar.id}
            id={pillar.id}
            className={[
              "scroll-mt-24 border-b border-hairline py-20 md:py-28",
              i % 2 === 1 ? "bg-void" : "bg-ink",
            ].join(" ")}
          >
            <div className="shell grid gap-10 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:gap-20">
              <div>
                <h2 className="text-bone" data-reveal="0">
                  {pillar.title}
                </h2>
                <ul className="mt-6 flex flex-wrap gap-2" data-reveal="1">
                  {pillar.terms.map((term) => (
                    <li
                      key={term}
                      className="rounded-full border border-hairline px-3 py-1 font-mono text-micro text-slate"
                    >
                      {term}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="measure text-lead text-bone" data-reveal="0">
                  {pillar.summary}
                </p>
                <p className="measure mt-6 text-body text-ash" data-reveal="1">
                  {pillar.detail}
                </p>

                {pillar.id === "expression" ? (
                  <div className="mt-10" data-reveal="2">
                    <TurnDiagram />
                  </div>
                ) : null}

                <EvidenceRail pillar={pillar.id} />
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Papers. Two cards that state their own status. */}
      <section
        id="papers"
        className="scroll-mt-24 border-b border-hairline bg-ink py-24 md:py-32"
      >
        <div className="shell">
          <p className="eyebrow">Papers</p>
          <h2 className="mt-4 max-w-[24ch] text-bone" data-reveal="0">
            Two papers. One of them is not finished, and it says so on its own
            page.
          </h2>
          <p className="measure mt-6 text-lead text-ash" data-reveal="1">
            {LAB.standfirst}
          </p>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {PAPERS.map((paper, i) => (
              <div key={paper.id} data-reveal={i} className="h-full">
                <PaperCard paper={paper} />
              </div>
            ))}
          </div>

          <div className="mt-12 max-w-4xl">
            <ResearchFigure figure="fig-f1-agreement-forest" />
          </div>
        </div>
      </section>

      {/* Standalone results. A hairline-divided list, not four cards. */}
      <section
        id="results"
        className="scroll-mt-24 border-b border-hairline bg-void py-24 md:py-32"
      >
        <div className="shell">
          <p className="eyebrow">Results</p>
          <h2 className="mt-4 max-w-[22ch] text-bone" data-reveal="0">
            Four measurements that stand on their own.
          </h2>
          <p className="measure mt-6 text-lead text-ash" data-reveal="1">
            Findings outside either paper, cited with the same discipline: n,
            method, date, source.
          </p>

          <div className="mt-14 divide-y divide-hairline border-t border-hairline">
            {RESULTS.map((result, i) => (
              <div
                key={result.id}
                id={result.id}
                className="scroll-mt-24 py-10 md:py-12"
                data-reveal={i % 3}
              >
                <Measure
                  variant="split"
                  value={result.number}
                  valueNote={result.numberNote}
                  comparison={result.comparisonNumber}
                  n={result.provenance.n}
                  method={result.provenance.method}
                  date={result.provenance.date}
                  source={result.provenance.source}
                  accent={result.accent}
                >
                  {result.label ? (
                    <p className="mb-3 font-mono text-micro tracking-[0.16em] text-slate uppercase">
                      {result.label}
                    </p>
                  ) : null}
                  <h3 className="text-lead leading-snug text-bone">
                    {result.headline}
                  </h3>
                  <p className="measure mt-4 text-body text-ash">
                    {result.meaning}
                  </p>
                </Measure>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Evaluation, and the method module that sits inside it. */}
      <section
        id="evaluation"
        className="scroll-mt-24 border-b border-hairline bg-ink py-24 md:py-32"
      >
        <div className="shell md:grid md:grid-cols-12 md:gap-16">
          <div className="md:col-span-4">
            <p className="eyebrow">Evaluation</p>
            <h2 className="mt-4 text-bone" data-reveal="0">
              How we know it is working.
            </h2>
          </div>

          <div className="mt-8 md:col-span-7 md:col-start-6 md:mt-0">
            <p className="measure text-lead text-ash" data-reveal="0">
              Most model evaluations measure a single response. Relational
              intelligence has to be evaluated across conversations, changing
              contexts and the systems underneath them.
            </p>

            <dl className="mt-10 divide-y divide-hairline border-t border-hairline">
              {[
                {
                  t: "Held conversation, not single turns",
                  d: "Most failures need time to appear. Identity drifts, memory contradicts itself and familiar response patterns begin to repeat. A one-minute demo hides all of it.",
                },
                {
                  t: "Continuity over shared history",
                  d: "We look for whether preferences, boundaries and prior moments shape later conversations coherently, without turning the relationship into a retrieved transcript.",
                },
                {
                  t: "Memory that remains legible",
                  d: "Useful recall is only part of the test. People also need to understand what was remembered, correct it and decide what should be forgotten.",
                },
                {
                  t: "Identity through model change",
                  d: "A stronger underlying model should make an identity more capable without quietly replacing its voice, history or point of view.",
                },
              ].map((row, i) => (
                <div key={row.t} className="py-6" data-reveal={i}>
                  <dt className="text-body font-medium text-bone">{row.t}</dt>
                  <dd className="measure mt-2 text-small leading-relaxed text-ash">
                    {row.d}
                  </dd>
                </div>
              ))}
            </dl>

            <EvidenceRail pillar="evaluation" />
          </div>
        </div>
      </section>

      <MethodModule />

      {/* The release. What is not in it, at equal weight to what is. */}
      <section
        id="release"
        className="scroll-mt-24 border-t border-b border-hairline bg-ink py-24 md:py-32"
      >
        <div className="shell grid gap-12 md:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] md:gap-20">
          <div>
            <p className="eyebrow">Release</p>
            <h2 className="mt-4 max-w-[16ch] text-bone" data-reveal="0">
              The harness, the verdicts, and the mistakes.
            </h2>
            <p className="measure mt-6 text-body text-ash" data-reveal="1">
              {release.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-2" data-reveal="2">
              <span className="border border-hairline px-3 py-1 font-mono text-micro text-slate">
                {release.licenses.code} code
              </span>
              <span className="border border-hairline px-3 py-1 font-mono text-micro text-slate">
                {release.licenses.data} data
              </span>
            </div>

            <p className="mt-6 font-mono text-micro leading-relaxed text-slate">
              {release.status}
            </p>

            {/* No public URL exists yet, so this is a state, not a link. */}
            <p className="mt-6 inline-flex cursor-default items-center rounded-full border border-hairline px-5 py-2.5 text-small text-slate">
              {release.ctaLabel}
            </p>

            <p className="mt-8">
              <Link
                href={`/research/releases/${release.slug}`}
                className="group inline-flex items-center gap-1.5 text-small text-ember transition-colors hover:text-bone"
              >
                Read the datasheet summary
                <span
                  aria-hidden
                  className="transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-quint)] group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
            <div>
              <p className="font-mono text-micro tracking-[0.16em] text-slate uppercase">
                In the release
              </p>
              <ul className="mt-5 divide-y divide-hairline border-t border-hairline">
                {release.contents.map((item) => (
                  <li
                    key={item}
                    className="py-4 text-small leading-relaxed text-ash"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-mono text-micro tracking-[0.16em] text-slate uppercase">
                Not in the release
              </p>
              <ul className="mt-5 divide-y divide-hairline border-t border-hairline">
                {release.exclusions.map((item) => (
                  <li
                    key={item}
                    className="py-4 text-small leading-relaxed text-ash"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 font-mono text-micro leading-relaxed text-slate">
                {release.source}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-void py-20 md:py-28">
        <div className="shell-narrow text-center">
          <h2 className="text-bone" data-reveal="0">
            Work on this with us.
          </h2>
          <p className="mx-auto mt-5 max-w-[46ch] text-body text-ash" data-reveal="1">
            If your work spans speech, conversation analysis or long-horizon
            systems, we would like to hear from you.
          </p>
          <div className="mt-8 flex justify-center" data-reveal="2">
            <Cta href="/company#careers">Work with us</Cta>
          </div>
        </div>
      </section>
    </>
  );
}
