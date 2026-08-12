import type { Metadata } from "next";
import { HeadPortrait } from "@/components/head-portrait";
import { Cta } from "@/components/ui/cta";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Meera",
  description:
    "Meera is Vyakti's conversational system: a voice you talk to out loud that predicts the end of your turn, yields the moment you speak, and stays the same person between conversations.",
  alternates: { canonical: "/meera" },
  openGraph: {
    title: "Meera, by Vyakti",
    description:
      "A conversational system built to be indistinguishable from a person on the phone.",
    url: "/meera",
  },
};

const CAPABILITIES = [
  {
    t: "Predicted turn ends",
    d: "The end of your sentence is anticipated from pitch, pace and grammar, so replies land in the gap a person would use instead of a beat after it.",
  },
  {
    t: "Instant yielding",
    d: "Start talking and it stops mid-word. What it had left to say is kept, and reconsidered against what you just said rather than replayed at you.",
  },
  {
    t: "Comfortable silence",
    d: "Not every pause is an invitation. It can wait while you think, and it does not fill the space with an acknowledgement noise to prove it is listening.",
  },
  {
    t: "Continuous affect",
    d: "Mood carries across the conversation and moves for a reason. It is expressed in timing and stress rather than announced in the words.",
  },
  {
    t: "One consistent person",
    d: "A fixed history, fixed preferences, and positions it will hold when you push back. It does not become whoever the last message implied it should be.",
  },
  {
    t: "Memory that accrues",
    d: "What you said weeks ago shapes today's answers. Recall shows up as familiarity, not as a summary of your file read back to you.",
  },
];

export default function MeeraPage() {
  return (
    <>
      {/* Portrait hero. Asymmetric split. */}
      <section className="relative border-b border-hairline bg-ink pt-28 pb-16 md:pt-32 md:pb-24">
        <div className="shell grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:gap-12">
          <div className="relative z-20">
            <h1 className="text-bone">Meera</h1>
            <p className="measure mt-6 text-lead text-ash">
              A conversational system you talk to out loud. Built to be
              indistinguishable from a person on the other end of a phone call.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Cta href="#access">Request access</Cta>
              <Cta href="/research" variant="secondary">
                The research behind it
              </Cta>
            </div>
          </div>

          <div className="relative order-first h-[46vh] min-h-[280px] md:order-none md:h-[62vh]">
            <HeadPortrait className="absolute inset-0" />
          </div>
        </div>
      </section>

      {/* Capabilities. Two column list, no cards. */}
      <section
        id="capabilities"
        className="scroll-mt-24 border-b border-hairline bg-void py-24 md:py-32"
      >
        <div className="shell">
          <h2 className="max-w-[22ch] text-bone" data-reveal="0">
            What it does that other voice systems do not.
          </h2>

          <div className="mt-14 grid gap-x-16 gap-y-10 border-t border-hairline pt-12 sm:grid-cols-2">
            {CAPABILITIES.map((item, i) => (
              <div key={item.t} data-reveal={i}>
                <h3 className="text-body font-medium text-bone">{item.t}</h3>
                <p className="measure mt-2 text-small leading-relaxed text-ash">
                  {item.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Honest limits. Full width statement. */}
      <section className="border-b border-hairline bg-ink py-24 md:py-32">
        <div className="shell md:grid md:grid-cols-12 md:gap-16">
          <div className="md:col-span-7 md:col-start-4">
            <h2 className="text-bone" data-reveal="0">
              It is not finished, and we will say so.
            </h2>
            <p className="measure mt-6 text-lead text-ash" data-reveal="1">
              Meera is convincing in some conversations and not in others. It
              handles interruption well and still misreads a certain kind of
              hesitation. Long sessions expose repetition we have not solved.
            </p>
            <p className="measure mt-5 text-body text-ash" data-reveal="2">
              We would rather be specific about that than ship a demo tuned to
              the ninety seconds you are most likely to try. Access is limited
              while we work on the parts that break.
            </p>
          </div>
        </div>
      </section>

      {/* Access. */}
      <section id="access" className="scroll-mt-24 bg-void py-24 md:py-32">
        <div className="shell-narrow text-center">
          <h2 className="text-bone" data-reveal="0">
            Request access.
          </h2>
          <p className="mx-auto mt-6 max-w-[48ch] text-lead text-ash" data-reveal="1">
            We are letting people in gradually and talking to each of them. Tell
            us who you are and what you would use it for.
          </p>
          <div className="mt-9 flex justify-center" data-reveal="2">
            <Cta href={`mailto:${SITE.email}?subject=Meera%20access`}>
              Email the team
            </Cta>
          </div>
          <p className="mt-6 text-small text-slate" data-reveal="3">
            {SITE.email}
          </p>
        </div>
      </section>
    </>
  );
}
