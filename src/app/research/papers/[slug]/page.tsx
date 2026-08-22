import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AbstractTabs } from "@/components/research/abstract-tabs";
import { BibtexBlock } from "@/components/research/bibtex-block";
import { HashAnchors } from "@/components/research/hash-anchors";
import { PaperProse } from "@/components/research/paper-prose";
import { PaperToc, type TocEntry } from "@/components/research/paper-toc";
import { SeamNote } from "@/components/research/seam-note";
import { StatusChip } from "@/components/research/status-chip";
import { formatDate } from "@/components/research/measure";
import { parsePaper, sectionById } from "@/lib/paper-body";
import {
  AUTHOR_LINE,
  COMPLETION_RAIL,
  PAPERS,
  PRELIMINARY_OBSERVATION,
  RELEASES,
  STATUS_LABEL,
  paperBySlug,
} from "@/lib/research";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return PAPERS.map((paper) => ({ slug: paper.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/research/papers/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const paper = paperBySlug(slug);
  if (!paper) return {};

  const description =
    paper.status === "in_preparation"
      ? `${STATUS_LABEL[paper.status]}. ${paper.cardSummary}`
      : paper.cardSummary;

  return {
    title: paper.shortTitle,
    description,
    alternates: { canonical: `/research/papers/${paper.slug}` },
    openGraph: {
      title: paper.shortTitle,
      description,
      url: `/research/papers/${paper.slug}`,
      type: "article",
    },
  };
}

/**
 * One template, two states that look genuinely different because the
 * underlying truth is genuinely different: a finished paper reads end to end
 * on this page, and an unfinished one shows what exists, what is missing and
 * why, with nothing on it a reader could mistake for a result.
 */
export default async function PaperPage({
  params,
}: PageProps<"/research/papers/[slug]">) {
  const { slug } = await params;
  const paper = paperBySlug(slug);
  if (!paper) notFound();

  const sections = parsePaper(paper.bodyFile);
  const abstract = sectionById(sections, paper.abstractTechnicalSection);
  const body = sections.filter((section) => section.id !== abstract?.id);
  const release = RELEASES.find((entry) => entry.paperSlug === paper.slug);
  const isResearchNote = paper.status === "in_preparation";
  const hasLimitations = body.some(
    (section) =>
      section.id === "s6" || section.title.toLowerCase().includes("limitation"),
  );
  const hasArtifacts = body.some(
    (section) =>
      section.id === "s7" || section.title.toLowerCase().includes("artifact"),
  );

  const toc: TocEntry[] = [
    { id: "abstract", number: null, title: "Abstract" },
    ...body.map((section) => ({
      id: section.id,
      number: section.number,
      title: section.title,
      children: section.subsections,
    })),
    ...(!hasLimitations
      ? [{ id: "limitations", number: null, title: "What this does not show" }]
      : []),
    ...(!isResearchNote && !hasArtifacts
      ? [{ id: "artifacts", number: null, title: "Artifacts" }]
      : []),
    ...(!isResearchNote ? [{ id: "cite", number: null, title: "Cite" }] : []),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": isResearchNote ? "Article" : "ScholarlyArticle",
    headline: paper.title,
    author: paper.authors.map((name) => ({ "@type": "Person", name })),
    creativeWorkStatus: STATUS_LABEL[paper.status],
    inLanguage: "en",
    url: `${SITE.url}/research/papers/${paper.slug}`,
    ...(paper.date ? { datePublished: paper.date } : {}),
    sourceOrganization: { "@type": "Organization", name: paper.affiliation },
  };

  return (
    <>
      <HashAnchors />
      <script
        type="application/ld+json"
        // Static, server-serialised, no user input. No venue and no publisher
        // appear here: nothing has accepted this paper.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
                  href="/research#papers"
                  className="transition-colors hover:text-bone"
                >
                  Papers
                </Link>
              </li>
              <li aria-hidden className="text-hairline">
                /
              </li>
              <li aria-current="page" className="text-ash">
                {paper.shortTitle}
              </li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center gap-4">
            <StatusChip status={paper.status} />
            <p className="font-mono text-micro text-slate">
              Status as of {paper.statusAsOf}
            </p>
          </div>

          <h1 className="mt-8 max-w-[30ch] text-[clamp(2.1rem,5vw,4.25rem)] leading-[1.01] tracking-[-0.048em] text-balance text-bone">
            {paper.title}
          </h1>

          <p className="measure mt-8 text-lead text-ash">{paper.subtitle}</p>

          <div className="mt-10 flex flex-col gap-2 border-t border-hairline pt-6 font-mono text-micro text-slate sm:flex-row sm:items-baseline sm:justify-between">
            <p className="text-ash">
              {AUTHOR_LINE} · {paper.affiliation}
            </p>
            <p>{paper.date ? formatDate(paper.date) : "Unpublished draft"}</p>
          </div>

          <p className="measure mt-8 text-small leading-relaxed text-ash">
            {paper.venue.line}
            {paper.venue.deadline ? ` ${paper.venue.deadline}` : ""}
          </p>
          <p className="measure mt-3 font-mono text-micro leading-relaxed text-slate">
            {paper.statusNote}
          </p>
        </div>
      </section>

      <section className="bg-ink py-16 md:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-20">
          <div className="hidden lg:block">
            <PaperToc entries={toc} />
          </div>

          <div className="min-w-0">
            <details className="mb-10 border-y border-hairline py-4 lg:hidden">
              <summary className="cursor-pointer font-mono text-small text-bone">
                Paper contents
              </summary>
              <div className="mt-5 max-h-[55dvh] overflow-y-auto pr-2">
                <PaperToc entries={toc} />
              </div>
            </details>
            <div id="abstract" className="scroll-mt-28">
              <h2 className="text-h3 text-bone">Abstract</h2>
              <div className="mt-6">
                <AbstractTabs
                  plain={
                    <p className="measure text-body leading-[1.75] text-ash">
                      {paper.abstractPlain}
                    </p>
                  }
                  technical={
                    abstract ? (
                      <PaperProse blocks={abstract.blocks} />
                    ) : (
                      <p className="measure text-body text-ash">
                        No technical abstract yet.
                      </p>
                    )
                  }
                />
              </div>
            </div>

            {paper.status === "in_preparation" ? (
              <div className="mt-16 border-t border-hairline pt-10">
                <h2 className="text-h3 text-bone">Where this paper actually is</h2>

                {/* A track, not a progress bar, and it does not fill on
                    scroll. 3% is not an achievement to animate toward. */}
                <div aria-hidden className="mt-8 h-0.5 w-full bg-hairline">
                  <div
                    className="h-0.5 bg-slate"
                    style={{
                      width: `${(COMPLETION_RAIL.fraction * 100).toFixed(1)}%`,
                    }}
                  />
                </div>

                <dl className="mt-6 divide-y divide-hairline border-t border-hairline font-mono text-micro">
                  {COMPLETION_RAIL.rows.map((row) => (
                    <div
                      key={row.label}
                      className="grid gap-2 py-3 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)_auto] sm:gap-4"
                    >
                      <dt className="text-slate">{row.label}</dt>
                      <dd className="text-ash">
                        {row.href ? (
                          <Link
                            href={row.href}
                            className="text-ember underline decoration-hairline underline-offset-4 transition-colors hover:text-bone"
                          >
                            {row.value}
                          </Link>
                        ) : (
                          row.value
                        )}
                      </dd>
                      <dd className="text-right text-slate tabular-nums">
                        {row.note}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-10 border border-hairline bg-surface p-6 sm:p-8">
                  <p className="font-mono text-micro tracking-[0.16em] text-slate uppercase">
                    Not a finding
                  </p>
                  <p className="mt-4 text-body text-slate">
                    {PRELIMINARY_OBSERVATION.headline}
                  </p>
                  <p className="measure mt-4 text-small leading-relaxed text-ash">
                    {PRELIMINARY_OBSERVATION.meaning}
                  </p>
                  <SeamNote as="p" className="mt-5 max-w-[54ch]">
                    {PRELIMINARY_OBSERVATION.caveat}
                  </SeamNote>
                  <p className="mt-4 font-mono text-micro text-slate">
                    {PRELIMINARY_OBSERVATION.source}
                  </p>
                </div>
              </div>
            ) : null}

            {/* No `data-reveal` on a paper section: these run to thousands of
                pixels, and the shared observer's 8% threshold can never be met
                by an element taller than about ten viewports, which would
                leave the section permanently at opacity 0. A long read should
                also not fade in a paragraph at a time. */}
            {body.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="mt-20 scroll-mt-28 border-t border-hairline pt-10"
              >
                <h2 className="text-h3 text-bone">
                  {section.number ? (
                    <span className="mr-3 font-mono text-small tracking-[0.04em] text-slate tabular-nums">
                      {section.number}
                    </span>
                  ) : null}
                  {section.title}
                </h2>
                <PaperProse blocks={section.blocks} />
              </section>
            ))}

            {!hasLimitations ? (
              <section
                id="limitations"
                className="mt-20 scroll-mt-28 border-t border-hairline pt-10"
              >
                <h2 className="text-h3 text-bone">What this does not show</h2>
                <p className="measure mt-6 text-body leading-[1.75] text-ash">
                  {paper.limitations}
                </p>
              </section>
            ) : null}

            {!isResearchNote && !hasArtifacts ? (
              <section
                id="artifacts"
                className="mt-20 scroll-mt-28 border-t border-hairline pt-10"
              >
              <h2 className="text-h3 text-bone">Artifacts</h2>
              <p className="measure mt-6 text-body text-ash">
                Every slot renders whether or not it is filled, because what
                does not exist yet is part of the status.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {paper.links.map((slot) =>
                  slot.url ? (
                    <a
                      key={slot.key}
                      href={slot.url}
                      className="group border border-hairline p-5 transition-colors hover:border-ash"
                    >
                      <p className="flex items-center justify-between text-body text-bone">
                        {slot.label}
                        <span aria-hidden className="text-ember">
                          →
                        </span>
                      </p>
                      <p className="mt-3 font-mono text-micro leading-relaxed text-slate">
                        {slot.status}
                      </p>
                    </a>
                  ) : (
                    <div
                      key={slot.key}
                      className="cursor-default border border-hairline p-5"
                    >
                      <p className="text-body text-slate">{slot.label}</p>
                      <p className="mt-3 font-mono text-micro leading-relaxed text-slate">
                        {slot.status}
                      </p>
                    </div>
                  ),
                )}
              </div>

              {release ? (
                <p className="mt-8 text-small text-ash">
                  The release bundle behind this paper is described at{" "}
                  <Link
                    href={`/research/releases/${release.slug}`}
                    className="text-ember underline decoration-hairline underline-offset-4 transition-colors hover:text-bone"
                  >
                    {release.name}
                  </Link>
                  .
                </p>
              ) : null}
              </section>
            ) : null}

            {!isResearchNote ? (
              <section
                id="cite"
                className="mt-20 scroll-mt-28 border-t border-hairline pt-10"
              >
              <h2 className="text-h3 text-bone">Cite</h2>
              <div className="mt-6 max-w-[46rem]">
                {paper.bibtex ? (
                  <BibtexBlock bibtex={paper.bibtex} />
                ) : (
                  <p className="measure text-body text-ash">
                    Not citable yet. This page will carry a BibTeX entry when
                    there is a paper to cite.
                  </p>
                )}
              </div>
              </section>
            ) : null}

            <div className="mt-16 flex flex-wrap items-baseline justify-between gap-4 border-t border-hairline pt-8">
              <Link
                href="/research#papers"
                className="text-small text-ember transition-colors hover:text-bone"
              >
                ← Back to research
              </Link>
              <p className="font-mono text-micro text-slate">
                Page last updated {paper.statusAsOf}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
