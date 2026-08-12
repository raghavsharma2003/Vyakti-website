import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { HeroStage } from "@/components/hero-stage";
import { TurnDiagram } from "@/components/turn-diagram";
import { Cta } from "@/components/ui/cta";
import { PILLARS, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.name}, an AI research lab for human indistinguishability`,
  description: SITE.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <HeroStage />

      {/* Thesis. Full-width editorial statement. */}
      <section className="border-t border-hairline bg-ink py-24 md:py-36">
        <div className="shell">
          <h2 className="max-w-[20ch] text-bone" data-reveal="0">
            Everything in a conversation that is not the words.
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-[1fr_1fr] md:gap-16">
            <p className="measure text-lead text-ash" data-reveal="1">
              A transcript is the smallest part of what passes between two
              people. The rest is timing. How long you waited before answering.
              Whether you let them finish. What your voice did on the word
              &ldquo;fine&rdquo;.
            </p>
            <p className="measure text-lead text-ash" data-reveal="2">
              Models have become very good at the words. Almost nothing has been
              built for the rest, which is the part people actually respond to,
              and the reason talking to software still feels like talking to
              software.
            </p>
          </div>
        </div>
      </section>

      {/* Research tracks. Sticky heading beside stacked entries. */}
      <section
        id="research"
        className="border-t border-hairline bg-void py-24 md:py-32"
      >
        <div className="shell grid gap-12 md:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] md:gap-16">
          <div className="md:sticky md:top-28 md:self-start">
            <p className="eyebrow">Research</p>
            <h2 className="mt-4 text-bone" data-reveal="0">
              Four things people do that machines do not.
            </h2>
            <p className="measure mt-6 text-body text-ash" data-reveal="1">
              These are the tracks the lab is organised around. Each one is a
              separate problem, and a system is only convincing when all four
              hold at once.
            </p>
            <Link
              href="/research"
              className="mt-8 inline-flex items-center gap-2 text-small text-ember underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-[var(--duration-fast)] hover:decoration-ember"
            >
              How we work on them
              <ArrowRightIcon size={14} weight="bold" aria-hidden />
            </Link>
          </div>

          <ul className="divide-y divide-hairline border-t border-hairline">
            {PILLARS.map((pillar, i) => (
              <li key={pillar.id} className="py-8 first:pt-8" data-reveal={i}>
                <h3 className="text-bone">{pillar.title}</h3>
                <p className="measure mt-3 text-body text-ash">
                  {pillar.summary}
                </p>
                <ul className="mt-5 flex flex-wrap gap-x-2 gap-y-2">
                  {pillar.terms.map((term) => (
                    <li
                      key={term}
                      className="rounded-full border border-hairline px-3 py-1 font-mono text-micro text-slate"
                    >
                      {term}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Turn-taking, shown rather than described. Asymmetric split. */}
      <section className="border-t border-hairline bg-ink py-24 md:py-32">
        <div className="shell grid items-center gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-16">
          <div data-reveal="0">
            <h2 className="text-bone">The seams are the whole problem.</h2>
            <p className="measure mt-6 text-lead text-ash">
              A voice system that waits for silence will always be a beat late,
              because silence arrives after the turn has already ended. People
              predict the ending from pitch and grammar and start moving before
              it lands.
            </p>
            <p className="measure mt-5 text-body text-ash">
              We treat the boundary between turns as the object of study: when
              to come in, when to hold back, when overlapping is warmth and when
              it is rudeness.
            </p>
          </div>
          <div data-reveal="1">
            <TurnDiagram />
          </div>
        </div>
      </section>

      {/* Meera. Full-bleed panel, two-column capability list. */}
      <section className="border-t border-hairline bg-void py-24 md:py-32">
        <div className="shell">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-[16ch] text-bone" data-reveal="0">
              Meera is the first thing we have built.
            </h2>
            <Cta href="/meera" variant="secondary">
              About Meera
            </Cta>
          </div>

          <p className="measure mt-8 text-lead text-ash" data-reveal="1">
            A conversational system you talk to out loud. It is where the four
            research tracks stop being separate papers and have to work
            together, in real time, with someone who did not read them.
          </p>

          <div className="mt-14 grid gap-x-16 gap-y-10 border-t border-hairline pt-10 sm:grid-cols-2">
            {[
              {
                h: "It hears the end coming",
                p: "Turn boundaries are predicted from prosody and syntax rather than detected by a silence timer.",
              },
              {
                h: "It yields immediately",
                p: "Speak over it and it stops, keeps what it had left to say, and decides whether that still matters.",
              },
              {
                h: "It stays the same person",
                p: "A fixed history and set of opinions that hold across a conversation and across weeks of them.",
              },
              {
                h: "It remembers in the ordinary way",
                p: "What you told it last month shapes how it answers today, without being recited back at you.",
              },
            ].map((item, i) => (
              <div key={item.h} data-reveal={i}>
                <h3 className="text-body font-medium text-bone">{item.h}</h3>
                <p className="measure mt-2 text-small leading-relaxed text-ash">
                  {item.p}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Evaluation. Offset column with a lead statement. */}
      <section className="border-t border-hairline bg-ink py-24 md:py-32">
        <div className="shell md:grid md:grid-cols-12">
          <div className="md:col-span-7 md:col-start-4">
            <h2 className="text-bone" data-reveal="0">
              A system is convincing or it is not. That has to be measured.
            </h2>
            <p className="measure mt-6 text-lead text-ash" data-reveal="1">
              Speech quality scores tell you a voice sounds clean. They tell you
              nothing about whether a person felt heard, and a system can score
              well on every one of them while remaining obviously a machine.
            </p>
            <p className="measure mt-5 text-body text-ash" data-reveal="2">
              We evaluate the way the question is actually asked: put a person
              in a real conversation, at length, and find out whether they can
              tell. Then look at where it broke, which is almost always a seam,
              a flattened emotion, or a moment the system forgot who it was.
            </p>
          </div>
        </div>
      </section>

      {/* Closing. */}
      <section className="border-t border-hairline bg-void py-24 md:py-32">
        <div className="shell-narrow text-center">
          <h2 className="text-bone" data-reveal="0">
            We are early, and we are hiring.
          </h2>
          <p className="mx-auto mt-6 max-w-[48ch] text-lead text-ash" data-reveal="1">
            The lab is small. If you work on speech, conversation, or the
            uncomfortable question of what makes something feel like a person,
            we would like to hear from you.
          </p>
          <div
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
            data-reveal="2"
          >
            <Cta href="/meera#access">Request access</Cta>
            <Cta href="/company#careers" variant="secondary">
              Open roles
            </Cta>
          </div>
        </div>
      </section>
    </>
  );
}
