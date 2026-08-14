import type { Metadata } from "next";
import { Cta } from "@/components/ui/cta";
import { TurnDiagram } from "@/components/turn-diagram";
import { PILLARS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Vyakti researches identity continuity, relational memory, multimodal expression and user-controlled agency for persistent AI identities.",
  alternates: { canonical: "/research" },
  openGraph: {
    title: "Research at Vyakti",
    description:
      "Identity continuity, relational memory and multimodal expression. The architecture beneath persistent AI identities.",
    url: "/research",
  },
};

export default function ResearchPage() {
  return (
    <>
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
        </div>
      </section>

      {/* The five tracks, in depth. */}
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
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Evaluation. */}
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
