import type { Metadata } from "next";
import { Cta } from "@/components/ui/cta";
import { APPLY_LABEL, APPLY_MAILTO, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Company",
  description:
    "Vyakti is an independent lab building Vyakti Rooms: an AI version of a creator, and a private, continuing relationship with it for every follower.",
  alternates: { canonical: "/company" },
  openGraph: {
    title: "Company",
    description:
      "An independent lab building an AI version of a creator, and a private room with it for every follower.",
    url: "/company",
  },
};

const ROLES = [
  {
    title: "Relational systems",
    detail:
      "Memory, provenance, belief validity in time, and the write-time rules that keep thousands of private scopes separate. The interesting part is what must never leak, not what can be retrieved.",
  },
  {
    title: "Fidelity and evaluation",
    detail:
      "Designing the battery that decides whether an AI version of a person is close enough to publish. Experimental design, human raters, and a healthy suspicion of your own results.",
  },
  {
    title: "Speech and voice",
    detail:
      "Expressive synthesis, disclosure and watermarking in the same pipeline. You have shipped audio and care how it sounds to a person, not only how it scores.",
  },
  {
    title: "Design engineering",
    detail:
      "The surfaces creators and followers meet this through. Interface, motion and sound, built to the standard the research is held to.",
  },
];

export default function CompanyPage() {
  return (
    <>
      <section className="border-b border-hairline bg-ink pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="shell">
          <h1 className="max-w-[20ch] text-bone">
            A small lab, one question at a time.
          </h1>
          <p className="measure mt-8 text-lead text-ash">
            Vyakti takes its name from the Sanskrit word for a person: the
            individual, that which is made manifest. We spent a year on whether
            an AI can be someone in particular and stay that way. Now we are
            building what that is for.
          </p>
          <p className="measure mt-5 text-body text-ash">
            Vyakti Rooms gives a creator an AI version of themselves, and gives
            every follower a private, continuing relationship with it. India
            first, in Hindi, Hinglish and English.
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
                d: "Every system has a range where it works reliably and a range where it does not. Reporting only the first obscures the work still required.",
              },
              {
                t: "Separation is a structure, not a promise",
                d: "A rule that lives only in a prompt is a request. What a follower says stays in their room because of where it is written, not because the system was asked nicely.",
              },
              {
                t: "One creator at a time, by hand",
                d: "The first Rooms are built with the person whose name is on them. Scale is what you earn after the thing is good, not the plan for making it good.",
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
            People we hope to meet.
          </h2>
          <p className="measure mt-6 text-lead text-ash" data-reveal="1">
            If your work overlaps with these areas, write and tell us which part
            of the problem you would take on.
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
              Introduce yourself
            </Cta>
          </div>
        </div>
      </section>

      {/* Contact. */}
      <section id="contact" className="scroll-mt-24 bg-void py-20 md:py-28">
        <div className="shell grid gap-8 sm:grid-cols-3">
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
          <div>
            <h2 className="text-h3 font-medium text-bone">Creators</h2>
            <div className="mt-3">
              <Cta href={APPLY_MAILTO}>{APPLY_LABEL}</Cta>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
