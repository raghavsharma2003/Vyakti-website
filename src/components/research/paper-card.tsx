import Link from "next/link";
import { StatusChip } from "@/components/research/status-chip";
import { AUTHOR_LINE, COMPLETION_RAIL, type Paper } from "@/lib/research";

/**
 * A paper as an artefact of the same lab: the container `turn-diagram.tsx`
 * uses, one tab stop, the title as the accessible name, and the card's own
 * status stated before anything else on it.
 */
export function PaperCard({ paper }: { paper: Paper }) {
  return (
    <article className="group relative flex h-full flex-col rounded-[var(--radius-lg)] border border-hairline bg-surface p-6 transition-colors duration-[var(--duration-fast)] hover:border-ash sm:p-8">
      <div className="flex items-center gap-3">
        <StatusChip status={paper.status} />
      </div>

      {/* The full title, unshortened. It is the paper's own words and a
          truncation would be a small edit to a citable string. */}
      <h3 className="mt-6 text-h3 text-balance text-bone">
        <Link
          href={`/research/papers/${paper.slug}`}
          className="after:absolute after:inset-0 after:content-['']"
        >
          {paper.title}
        </Link>
      </h3>

      <p className="mt-4 font-mono text-micro text-slate">{AUTHOR_LINE}</p>

      <p className="measure mt-5 text-body text-ash">{paper.cardSummary}</p>

      {paper.cardNumbers.length ? (
        <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-hairline pt-6">
          {paper.cardNumbers.map((entry) => (
            <div key={entry.label}>
              <dt className="font-mono text-h3 leading-none text-bone tabular-nums">
                {entry.value}
              </dt>
              <dd className="mt-2 font-mono text-micro leading-relaxed text-slate">
                {entry.label}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <dl className="mt-8 space-y-2 border-t border-hairline pt-6 font-mono text-micro">
          {COMPLETION_RAIL.rows.slice(0, 2).map((row) => (
            <div key={row.label} className="flex justify-between gap-4">
              <dt className="text-slate">{row.label}</dt>
              <dd className="text-right text-ash tabular-nums">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-auto flex flex-wrap items-baseline justify-between gap-3 pt-8">
        <span className="inline-flex items-center gap-1.5 text-small text-ember">
          {paper.status === "in_preparation" ? "Read the status" : "Read the paper"}
          <span
            aria-hidden
            className="transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-quint)] group-hover:translate-x-0.5"
          >
            →
          </span>
        </span>
        <span className="font-mono text-micro text-slate">
          {paper.status === "in_preparation"
            ? "In preparation, no submission target"
            : "Submission target: JUDGe 2026, NeurIPS workshop"}
        </span>
      </div>
    </article>
  );
}
