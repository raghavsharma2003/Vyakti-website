import Link from "next/link";
import { Measure } from "@/components/research/measure";
import { SeamNote } from "@/components/research/seam-note";
import {
  COMMIT_CHAIN,
  COMMIT_CHAIN_SOURCE,
  DEIDENTIFICATION,
  NOISE_FLOOR_NOTE,
  RESULTS,
  RETRACTIONS,
} from "@/lib/research";

/**
 * How we work, evidenced rather than listed.
 *
 * Four practices, and each one shows the artifact instead of describing it: a
 * commit chain with timestamps, two claims struck through with the control
 * that killed them, a worked provenance line taken apart label by label, and
 * the leak a de-identification sweep actually caught.
 */
function CommitLedger() {
  return (
    <div className="border-t border-hairline">
      <ol className="divide-y divide-hairline">
        {COMMIT_CHAIN.map((row) => (
          <li
            key={row.hash}
            className="grid grid-cols-[auto_auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1 py-3 font-mono text-micro sm:gap-x-6"
          >
            <span className="text-slate tabular-nums">{row.date}</span>
            <span className="text-slate tabular-nums">{row.hash}</span>
            <span className="col-span-3 text-ash sm:col-span-1">
              {row.delta ? (
                <SeamNote tone="ember" className="py-0 text-bone">
                  <span className="tabular-nums">{row.delta}</span>
                  {"  "}
                  {row.message}
                </SeamNote>
              ) : (
                row.message
              )}
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-6 max-w-[54ch] text-small leading-relaxed text-ash">
        We cite the hashes rather than assert the sequence, because a claim
        about pre-registration that cannot be checked is not one.
      </p>
      <p className="mt-3 font-mono text-micro text-slate">
        {COMMIT_CHAIN_SOURCE}
      </p>
    </div>
  );
}

function Retractions() {
  return (
    <div className="space-y-14">
      {RETRACTIONS.map((retraction) => (
        <div key={retraction.id}>
          <p className="font-mono text-micro tracking-[0.16em] text-ember uppercase">
            Retracted
          </p>
          <p className="mt-5 max-w-[24ch] text-h2 leading-[0.98] font-[530] tracking-[-0.052em] text-slate line-through decoration-ember decoration-1 underline-offset-[0.18em] sm:decoration-1">
            {retraction.claim}
          </p>
          <SeamNote as="p" tone="ember" className="mt-6 max-w-[54ch]">
            {retraction.control}
          </SeamNote>
          <p className="mt-3 font-mono text-micro text-slate">
            {retraction.source}
          </p>
        </div>
      ))}
      <p className="max-w-[54ch] text-small leading-relaxed text-ash">
        Both were reasonable readings of the evidence at the time. Both were
        wrong. That is the paper&rsquo;s argument, not an exception to it.
      </p>
    </div>
  );
}

function ProvenanceExample() {
  const worked = RESULTS[0];

  return (
    <div>
      <p className="measure text-body leading-relaxed text-ash">
        Every number in this section carries its sample size, its method, and
        the date it was measured. That is not a claim about our standards.
        Scroll back and check any of them.
      </p>

      <div className="mt-8 border border-hairline bg-surface p-6 sm:p-8">
        <Measure
          value={worked.number}
          n={worked.provenance.n}
          method={worked.provenance.method}
          date={worked.provenance.date}
          source={worked.provenance.source}
          annotated
        />
      </div>

      <p className="measure mt-8 text-small leading-relaxed text-ash">
        {NOISE_FLOOR_NOTE}
      </p>
    </div>
  );
}

function ReleaseDiscipline() {
  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-16">
      <div>
        <p className="border-l-2 border-hairline pl-5 text-lead leading-relaxed text-bone">
          {DEIDENTIFICATION.datasheetSummary}
        </p>
        <p className="mt-4 pl-5 font-mono text-micro text-slate">
          {DEIDENTIFICATION.datasheetAttribution}
        </p>
      </div>

      <dl className="divide-y divide-hairline border-t border-hairline">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-6 py-5">
          <dt className="font-mono text-h3 text-bone tabular-nums">
            {DEIDENTIFICATION.gates}
          </dt>
          <dd className="text-small leading-relaxed text-ash">
            {DEIDENTIFICATION.gatesNote}
          </dd>
        </div>
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-6 py-5">
          <dt className="font-mono text-h3 text-bone tabular-nums">
            {DEIDENTIFICATION.leaks}
          </dt>
          <dd className="text-small leading-relaxed text-ash">
            {DEIDENTIFICATION.leaksNote}
          </dd>
        </div>
        <div className="py-5">
          <p className="font-mono text-micro text-slate">
            {DEIDENTIFICATION.source}
          </p>
        </div>
      </dl>
    </div>
  );
}

const PRACTICES = [
  {
    id: "pre-registration",
    label: "Pre-registration",
    heading: "We fix the bar before we see the data.",
    body: CommitLedger,
  },
  {
    id: "retractions",
    label: "Retractions",
    heading: "We retract our own findings when our own controls refute them.",
    body: Retractions,
  },
  {
    id: "provenance",
    label: "Provenance",
    heading: "Every number carries n, method and date.",
    body: ProvenanceExample,
  },
  {
    id: "datasheets",
    label: "Datasheets",
    heading: "Releases state their limits in their own first section.",
    body: ReleaseDiscipline,
  },
] as const;

export function MethodModule() {
  return (
    <div id="method" className="scroll-mt-24 border-t border-hairline bg-void">
      <div className="shell py-20 md:py-28">
        <h2 className="max-w-[16ch] text-bone" data-reveal="0">
          Why any of this should be believed.
        </h2>
        <p className="measure mt-6 text-lead text-ash" data-reveal="1">
          Four practices, each measured against our own record rather than
          asserted about it.
        </p>

        <div className="mt-16 space-y-20 md:space-y-28">
          {PRACTICES.map((practice) => {
            const Body = practice.body;
            return (
              <section
                key={practice.id}
                className="grid gap-8 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] md:gap-20"
              >
                <div className="md:sticky md:top-28 md:self-start">
                  <p className="font-mono text-micro tracking-[0.16em] text-slate uppercase">
                    {practice.label}
                  </p>
                  <h3 className="mt-4 max-w-[18ch] text-bone" data-reveal="0">
                    {practice.heading}
                  </h3>
                </div>
                <div data-reveal="1">
                  <Body />
                </div>
              </section>
            );
          })}
        </div>

        <p className="measure mt-20 border-t border-hairline pt-8 text-small leading-relaxed text-ash">
          A fifth rule follows from the four: where privacy or safety can be
          enforced structurally, we do not rely on instructing the model
          instead.{" "}
          <Link
            href="#gate0-structural-privacy"
            className="text-ember underline decoration-hairline underline-offset-4 transition-colors hover:text-bone"
          >
            The measurement behind that
          </Link>{" "}
          is the first result above.
        </p>
      </div>
    </div>
  );
}
