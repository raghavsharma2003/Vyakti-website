import type { Metadata } from "next";
import { MeeraPortrait } from "@/components/meera";
import { Cta } from "@/components/ui/cta";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Meera",
  description:
    "Meera is Vyakti's first consumer product in development: an AI companion designed around identity continuity, shared history and multimodal expression.",
  alternates: { canonical: "/meera" },
  openGraph: {
    title: "Meera, by Vyakti",
    description:
      "An AI companion in development, designed to build shared context over time while remaining clearly AI.",
    url: "/meera",
  },
};

const CAPABILITIES = [
  {
    t: "Conversation that breathes",
    d: "We are building voice around turn prediction, interruption and comfortable silence, so talking can feel fluid instead of request and response.",
  },
  {
    t: "A shared history",
    d: "The aim is memory with judgement: what mattered can shape the next conversation, without turning every personal detail into permanent storage.",
  },
  {
    t: "Context she can see",
    d: "When you choose to share a view, an object or an expression, vision should become part of the same conversation rather than a separate feature.",
  },
  {
    t: "Expression that agrees",
    d: "Voice, words, timing, gaze and facial response should express one underlying state, without the seams between models showing through.",
  },
  {
    t: "A recognisable identity",
    d: "A point of view, tastes, humour, boundaries and contradictions that remain coherent while leaving room for genuine change.",
  },
  {
    t: "Clearly AI",
    d: "Presence should not depend on deception. Meera will identify as AI and communicate uncertainty, memory limits and perceptual boundaries plainly.",
  },
];

export default function MeeraPage() {
  return (
    <>
      {/* Portrait hero. Asymmetric split. */}
      <section className="relative border-b border-hairline bg-ink pt-28 pb-16 md:pt-32 md:pb-24">
        <div className="shell grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:gap-12">
          <div className="relative z-20">
            <p className="eyebrow">Our first product</p>
            <h1 className="mt-6 text-bone">Meet Meera.</h1>
            <p className="measure mt-6 text-lead text-ash">
              An AI companion designed to be known, and to know you over time.
              The first consumer expression of our relational intelligence research.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Cta href="#access">Request early access</Cta>
              <Cta href="/research" variant="secondary">
                The research behind it
              </Cta>
            </div>
          </div>

          <div className="relative h-[46vh] min-h-[280px] md:h-[62vh]">
            <MeeraPortrait className="absolute inset-0" />
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
            The companion we are building.
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
              This is early work. We will say so.
            </h2>
            <p className="measure mt-6 text-lead text-ash" data-reveal="1">
              A carefully edited minute can make almost any companion look
              complete. Identity drift, false memories and repetitive behaviour
              only appear with time. That is the real test.
            </p>
            <p className="measure mt-5 text-body text-ash" data-reveal="2">
              We will describe what Meera can perceive, remember and do, publish
              meaningful limitations, and expand access as the experience earns it.
            </p>
          </div>
        </div>
      </section>

      {/* Access. */}
      <section id="access" className="scroll-mt-24 bg-void py-24 md:py-32">
        <div className="shell-narrow text-center">
          <h2 className="text-bone" data-reveal="0">
            Request early access.
          </h2>
          <p className="mx-auto mt-6 max-w-[48ch] text-lead text-ash" data-reveal="1">
            When access begins, we will invite people gradually and learn from
            long-term use. Tell us who you are and what you hope a companion
            could become.
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
