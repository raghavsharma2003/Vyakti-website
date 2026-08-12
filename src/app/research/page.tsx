import type { Metadata } from "next";
import { Cta } from "@/components/ui/cta";
import { TurnDiagram } from "@/components/turn-diagram";
import { PILLARS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Research",
  description:
    "The four tracks Vyakti works on: turn-taking, affect, persona and culture. How we define human indistinguishability in conversation, and how we measure it.",
  alternates: { canonical: "/research" },
  openGraph: {
    title: "Research at Vyakti",
    description:
      "Turn-taking, affect, persona and culture. The four problems between a language model and a person.",
    url: "/research",
  },
};

export default function ResearchPage() {
  return (
    <>
      <section className="border-b border-hairline bg-ink pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="shell">
          <h1 className="max-w-[18ch] text-bone">
            The gap is not intelligence. It is behaviour.
          </h1>
          <p className="measure mt-8 text-lead text-ash">
            A large model can already reason, recall and write better than most
            people it talks to. It still does not feel like one, and the reasons
            are specific enough to work on separately.
          </p>
        </div>
      </section>

      {/* The four tracks, in depth. */}
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

                {pillar.id === "turn-taking" ? (
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
              Standard speech metrics measure fidelity. They ask whether the
              audio is clean and whether the words came out right. Both can be
              excellent while the experience remains obviously synthetic.
            </p>

            <dl className="mt-10 divide-y divide-hairline border-t border-hairline">
              {[
                {
                  t: "Held conversation, not single turns",
                  d: "Most failures need time to appear. Identity drifts, memory contradicts itself, and the same three sentence rhythms start repeating. A one minute demo hides all of it.",
                },
                {
                  t: "Judgement by the person in the conversation",
                  d: "Not a rater scoring a clip afterwards. The question is whether the participant could tell, and at which moment they became sure.",
                },
                {
                  t: "Failure located, not just counted",
                  d: "A score that says sixty per cent is not useful. We want the timestamp where it broke and the reason, because those are the only things you can fix.",
                },
                {
                  t: "Adversarial partners",
                  d: "People who are trying to catch it out behave differently from people having a chat. Both matter, and the first is harder.",
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
            We are looking for people in speech, conversation analysis and
            real-time systems.
          </p>
          <div className="mt-8 flex justify-center" data-reveal="2">
            <Cta href="/company#careers">Open roles</Cta>
          </div>
        </div>
      </section>
    </>
  );
}
