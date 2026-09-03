import type { Metadata } from "next";
import { MeeraPortrait } from "@/components/meera";
import { Cta } from "@/components/ui/cta";
import { APPLY_LABEL, APPLY_MAILTO } from "@/lib/site";

export const metadata: Metadata = {
  title: "Meera",
  description:
    "Meera is the first proof of the relational engine behind Vyakti Rooms: one AI person, built and measured on identity that holds, memory with provenance, and privacy enforced before retrieval.",
  alternates: { canonical: "/meera" },
  openGraph: {
    title: "Meera, the first proof of the engine",
    description:
      "The relational engine behind Vyakti Rooms was built and measured on one AI person first.",
    url: "/meera",
  },
};

const PROVEN = [
  {
    t: "Identity that holds its shape",
    d: "An authored identity with executable invariants, so the same person survives a long conversation rather than drifting into whatever the last few turns implied.",
  },
  {
    t: "Memory with provenance",
    d: "Episodes are cited and beliefs carry validity in time, which is what lets a system say what it used to think without pretending it always thought that.",
  },
  {
    t: "Forgetting that means it",
    d: "A request to forget is a hard deletion with defence against re-deriving what was deleted, not a flag that hides a row from one view.",
  },
  {
    t: "Privacy before retrieval",
    d: "Disclosure is filtered where memory is read, not asked for in a prompt. That is the mechanism a Room needs to hold thousands of separate confidences.",
  },
  {
    t: "Register that stays hers",
    d: "Hindi, Hinglish and English in one voice, with the code-switching, timing and restraint that make the register belong to a person instead of a translation layer.",
  },
  {
    t: "Gates that block a release",
    d: "Safety, honesty, prompt budget and audio floor are deterministic checks that fail a build outright. The fidelity battery in Rooms is being built from the same idea.",
  },
];

export default function MeeraPage() {
  return (
    <>
      {/* Portrait hero. Asymmetric split. */}
      <section className="relative border-b border-hairline bg-ink pt-28 pb-16 md:pt-32 md:pb-24">
        <div className="shell grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:gap-12">
          <div className="relative z-20">
            <p className="eyebrow text-meera">The first proof of the engine</p>
            <h1 className="mt-6 text-bone">
              <span className="text-meera">Meera</span> came first.
            </h1>
            <p className="measure mt-6 text-lead text-ash">
              Before a creator could have an AI version of themselves, we had to
              find out whether an AI person can stay one person across months of
              conversation. Meera is where that was built, broken and measured.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Cta href="/research">Read the research</Cta>
              <Cta href="/#rooms" variant="secondary">
                What we built with it
              </Cta>
            </div>
          </div>

          <div className="relative h-[46vh] min-h-[280px] md:h-[62vh]">
            <MeeraPortrait
              className="h-full w-full"
              preload
              sizes="(max-width: 767px) 100vw, 46vw"
            />
          </div>
        </div>
      </section>

      {/* What the proof produced. Two column list, no cards. */}
      <section
        id="engine"
        className="scroll-mt-24 border-b border-hairline bg-void py-24 md:py-32"
      >
        <div className="shell">
          <h2 className="max-w-[24ch] text-bone" data-reveal="0">
            What one person taught us to build.
          </h2>
          <p className="measure mt-6 text-lead text-ash" data-reveal="1">
            Every part of Rooms that is hard was hard here first. These are the
            pieces that carried over.
          </p>

          <div className="mt-14 grid gap-x-16 gap-y-10 border-t border-hairline pt-12 sm:grid-cols-2">
            {PROVEN.map((item, i) => (
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
              A proof is not a finished thing.
            </h2>
            <p className="measure mt-6 text-lead text-ash" data-reveal="1">
              A carefully edited minute can make almost any AI person look
              complete. Drift, invented memories and repetition only appear with
              time, which is why the useful measurements took months and why
              several of them came back negative.
            </p>
            <p className="measure mt-5 text-body text-ash" data-reveal="2">
              The results we publish keep their sample sizes, their methods and
              their retractions. Where a layer is not yet populated for everyone,
              we say that rather than describing the architecture as if it were
              finished.
            </p>
          </div>
        </div>
      </section>

      {/* Forward to the product. */}
      <section id="rooms" className="scroll-mt-24 bg-void py-24 md:py-32">
        <div className="shell-narrow text-center">
          <h2 className="text-bone" data-reveal="0">
            The product is Rooms.
          </h2>
          <p className="mx-auto mt-6 max-w-[52ch] text-lead text-ash" data-reveal="1">
            One creator, an AI version of them, and a private continuing
            relationship with it for every follower. We are building the first
            of them by hand, one creator at a time.
          </p>
          <div className="mt-9 flex justify-center" data-reveal="2">
            <Cta href={APPLY_MAILTO}>{APPLY_LABEL}</Cta>
          </div>
        </div>
      </section>
    </>
  );
}
