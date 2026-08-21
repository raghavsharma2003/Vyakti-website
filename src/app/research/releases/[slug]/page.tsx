import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HashAnchors } from "@/components/research/hash-anchors";
import { SeamNote } from "@/components/research/seam-note";
import {
  DEIDENTIFICATION,
  RELEASES,
  paperBySlug,
  releaseBySlug,
} from "@/lib/research";

export function generateStaticParams() {
  return RELEASES.map((release) => ({ slug: release.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/research/releases/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const release = releaseBySlug(slug);
  if (!release) return {};

  return {
    title: release.name,
    description: release.description,
    alternates: { canonical: `/research/releases/${release.slug}` },
    openGraph: {
      title: release.name,
      description: release.description,
      url: `/research/releases/${release.slug}`,
    },
  };
}

/**
 * The datasheet page, limits first.
 *
 * What the data is not comes before what it is, at the same weight, because
 * that is the order the release's own datasheet uses and the order that stops
 * an agreement figure being read as an accuracy figure.
 */
export default async function ReleasePage({
  params,
}: PageProps<"/research/releases/[slug]">) {
  const { slug } = await params;
  const release = releaseBySlug(slug);
  if (!release) notFound();

  const paper = paperBySlug(release.paperSlug);

  return (
    <>
      <HashAnchors />

      <section className="border-b border-hairline bg-ink pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="shell">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 font-mono text-micro text-slate">
              <li>
                <Link href="/research" className="transition-colors hover:text-bone">
                  Research
                </Link>
              </li>
              <li aria-hidden className="text-hairline">
                /
              </li>
              <li>
                <Link
                  href="/research#release"
                  className="transition-colors hover:text-bone"
                >
                  Releases
                </Link>
              </li>
              <li aria-hidden className="text-hairline">
                /
              </li>
              <li aria-current="page" className="text-ash">
                {release.name}
              </li>
            </ol>
          </nav>

          <h1 className="font-mono text-h2 tracking-[-0.03em] text-bone">
            {release.name}
          </h1>

          <p className="measure mt-8 text-lead text-ash">{release.description}</p>

          <div className="mt-10 flex flex-wrap gap-2">
            <span className="border border-hairline px-3 py-1 font-mono text-micro text-slate">
              {release.licenses.code} code
            </span>
            <span className="border border-hairline px-3 py-1 font-mono text-micro text-slate">
              {release.licenses.data} data
            </span>
          </div>

          <p className="measure mt-6 font-mono text-micro leading-relaxed text-slate">
            {release.status}
          </p>

          {/* No public URL exists yet. This is a state, never a dead link. */}
          <p className="mt-6 inline-flex cursor-default items-center rounded-full border border-hairline px-5 py-2.5 text-small text-slate">
            {release.ctaLabel}
          </p>
        </div>
      </section>

      {/* Limits first. */}
      <section
        id="limits"
        className="scroll-mt-24 border-b border-hairline bg-void py-20 md:py-28"
      >
        <div className="shell grid gap-10 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:gap-20">
          <div>
            <h2 className="text-bone" data-reveal="0">
              What this data is not.
            </h2>
            <p className="measure mt-6 text-body text-ash" data-reveal="1">
              The datasheet states its limits in its own first section, so this
              page does too.
            </p>
          </div>

          <ul className="divide-y divide-hairline border-t border-hairline">
            {release.limitsFirst.map((limit, i) => (
              <li
                key={limit}
                className="py-5 text-body leading-relaxed text-ash"
                data-reveal={i % 3}
              >
                {limit}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="contents"
        className="scroll-mt-24 border-b border-hairline bg-ink py-20 md:py-28"
      >
        <div className="shell grid gap-12 lg:grid-cols-2 lg:gap-20">
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

            <div className="mt-10 border border-hairline bg-surface p-6 sm:p-8">
              <p className="font-mono text-micro tracking-[0.16em] text-slate uppercase">
                De-identification record
              </p>
              <dl className="mt-5 divide-y divide-hairline border-t border-hairline">
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-5 py-4">
                  <dt className="font-mono text-h3 text-bone tabular-nums">
                    {DEIDENTIFICATION.gates}
                  </dt>
                  <dd className="text-small leading-relaxed text-ash">
                    {DEIDENTIFICATION.gatesNote}
                  </dd>
                </div>
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-5 py-4">
                  <dt className="font-mono text-h3 text-bone tabular-nums">
                    {DEIDENTIFICATION.leaks}
                  </dt>
                  <dd className="text-small leading-relaxed text-ash">
                    {DEIDENTIFICATION.leaksNote}
                  </dd>
                </div>
              </dl>
              <SeamNote as="p" className="mt-5">
                A sweep that finds nothing proves nothing. This one found
                something.
              </SeamNote>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink pb-24 md:pb-32">
        <div className="shell">
          <div className="grid gap-10 border-t border-hairline pt-10 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:gap-20">
            <h2 className="text-h3 text-bone">How to cite it</h2>
            <div>
              <p className="measure text-body text-ash">
                Cite the paper the release accompanies. Its citation block, and
                the honest note about what has and has not been posted, live on
                the paper page.
              </p>
              {paper ? (
                <p className="mt-6">
                  <Link
                    href={`/research/papers/${paper.slug}`}
                    className="group inline-flex items-center gap-1.5 text-small text-ember transition-colors hover:text-bone"
                  >
                    Read the paper
                    <span
                      aria-hidden
                      className="transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-quint)] group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </Link>
                </p>
              ) : null}
              <p className="mt-8 font-mono text-micro text-slate">
                {release.source}
              </p>
              <p className="mt-8">
                <Link
                  href="/research#release"
                  className="text-small text-ember transition-colors hover:text-bone"
                >
                  ← Back to research
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
