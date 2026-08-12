import type { Metadata } from "next";
import { Cta } from "@/components/ui/cta";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Company",
  description:
    "Vyakti is a small AI research lab working on human indistinguishability in conversation. What we believe, how we work, and the roles we are hiring for.",
  alternates: { canonical: "/company" },
  openGraph: {
    title: "Company",
    description:
      "A small research lab working on what makes a conversation feel like a person.",
    url: "/company",
  },
};

const ROLES = [
  {
    title: "Research Engineer, Speech",
    detail:
      "Speech-to-speech modelling, prosody and expressive synthesis. You have shipped audio models and care about how they sound to a person, not only how they score.",
  },
  {
    title: "Research Engineer, Conversation",
    detail:
      "Turn-taking, endpointing and full-duplex dialogue. Comfortable with real-time constraints and with linguistics literature that predates deep learning.",
  },
  {
    title: "Research Scientist, Evaluation",
    detail:
      "Designing the studies that tell us whether any of this is working. Experimental design, human subjects, and a healthy suspicion of your own results.",
  },
  {
    title: "Design Engineer",
    detail:
      "The surfaces people meet these systems through. Interface, motion and sound, built to the standard the research is held to.",
  },
];

export default function CompanyPage() {
  return (
    <>
      <section className="border-b border-hairline bg-ink pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="shell">
          <h1 className="max-w-[20ch] text-bone">
            A small lab with one question.
          </h1>
          <p className="measure mt-8 text-lead text-ash">
            Vyakti takes its name from the Sanskrit word for a person: the
            individual, that which is made manifest. The question is whether a
            machine can be one in the only sense that matters to the person
            talking to it.
          </p>
        </div>
      </section>

      {/* Beliefs. Stacked entries. */}
      <section className="border-b border-hairline bg-void py-24 md:py-32">
        <div className="shell grid gap-12 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] md:gap-20">
          <div className="md:sticky md:top-28 md:self-start">
            <h2 className="text-bone" data-reveal="0">
              How we work.
            </h2>
          </div>

          <ul className="divide-y divide-hairline border-t border-hairline">
            {[
              {
                t: "Behaviour before benchmarks",
                d: "The score exists to describe the behaviour. When the two disagree, we believe the conversation and rewrite the metric.",
              },
              {
                t: "Say what does not work",
                d: "Every system has a range where it is convincing and a range where it is not. Publishing only the first is how this field lost credibility.",
              },
              {
                t: "One product, in the open",
                d: "Research that never reaches a person who did not ask for it stays theoretical. Meera is where the work has to survive contact.",
              },
              {
                t: "Culture is not a setting",
                d: "There is no neutral way to have a conversation. Building as though there is produces a system that is subtly wrong for everyone.",
              },
            ].map((row, i) => (
              <li key={row.t} className="py-8" data-reveal={i}>
                <h3 className="text-bone">{row.t}</h3>
                <p className="measure mt-3 text-body text-ash">{row.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Careers. */}
      <section
        id="careers"
        className="scroll-mt-24 border-b border-hairline bg-ink py-24 md:py-32"
      >
        <div className="shell">
          <p className="eyebrow">Careers</p>
          <h2 className="mt-4 max-w-[20ch] text-bone" data-reveal="0">
            Roles we are hiring for.
          </h2>
          <p className="measure mt-6 text-lead text-ash" data-reveal="1">
            We hire slowly and in person. If none of these is quite you but the
            problem is, write anyway and say what you would work on.
          </p>

          <ul className="mt-14 divide-y divide-hairline border-t border-b border-hairline">
            {ROLES.map((role, i) => (
              <li
                key={role.title}
                className="grid gap-3 py-8 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:gap-12"
                data-reveal={i}
              >
                <h3 className="text-body font-medium text-bone">
                  {role.title}
                </h3>
                <p className="measure text-small leading-relaxed text-ash">
                  {role.detail}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <Cta href={`mailto:${SITE.careers}?subject=Application`}>
              Write to us
            </Cta>
          </div>
        </div>
      </section>

      {/* Contact. */}
      <section id="contact" className="scroll-mt-24 bg-void py-20 md:py-28">
        <div className="shell grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-h3 font-medium text-bone">General</h2>
            <a
              href={`mailto:${SITE.email}`}
              className="mt-3 inline-block text-body text-ash underline decoration-hairline underline-offset-4 transition-colors duration-[var(--duration-fast)] hover:text-ember hover:decoration-ember"
            >
              {SITE.email}
            </a>
          </div>
          <div>
            <h2 className="text-h3 font-medium text-bone">Hiring</h2>
            <a
              href={`mailto:${SITE.careers}`}
              className="mt-3 inline-block text-body text-ash underline decoration-hairline underline-offset-4 transition-colors duration-[var(--duration-fast)] hover:text-ember hover:decoration-ember"
            >
              {SITE.careers}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
