import type { ReactNode } from "react";

/**
 * The only way a number renders in the research section.
 *
 * `n`, `method`, `date` and `source` are required and non-nullable, so a
 * number cannot reach the page without the line that makes it comparable to a
 * future re-measurement. The provenance sits inside the same block as the
 * number, always visible, never behind an interaction.
 */
export type MeasureProps = {
  value: string;
  /** The remainder of the measured value, at reading size under the number. */
  valueNote?: string;
  n: string;
  method: string;
  date: string;
  source: string;
  comparison?: ReactNode;
  /** The one accent number on the page. Spent once. */
  accent?: boolean;
  /** Annotates each part of the provenance line, for the method module. */
  annotated?: boolean;
  /**
   * `split` puts the number and its comparison in a left column and the
   * reading of it on the right, with the provenance line running full width
   * beneath both. Still one component, so the number still cannot be rendered
   * without it.
   */
  variant?: "stacked" | "split";
  className?: string;
  children?: ReactNode;
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** 2026-08-18 becomes 18 Aug 2026. Anything else passes through untouched. */
export function formatDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const [, year, month, day] = match;
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
}

export function provenanceLine({
  n,
  method,
  date,
  source,
}: {
  n: string;
  method: string;
  date: string;
  source: string;
}): string {
  return `n = ${n} · ${method} · ${formatDate(date)} · ${source}`;
}

export function Measure({
  value,
  valueNote,
  n,
  method,
  date,
  source,
  comparison,
  accent = false,
  annotated = false,
  variant = "stacked",
  className = "",
  children,
}: MeasureProps) {
  const number = (
    <>
      <p
        className={[
          "font-mono leading-none tracking-[-0.02em] tabular-nums",
          variant === "split" ? "text-[clamp(1.5rem,2.1vw,2.3rem)]" : "text-h2",
          accent ? "text-ember" : "text-bone",
        ].join(" ")}
      >
        {value}
      </p>
      {valueNote ? (
        <p className="mt-3 max-w-[30ch] font-mono text-small leading-relaxed text-ash">
          {valueNote}
        </p>
      ) : null}
      {comparison ? (
        <p className="mt-4 max-w-[34ch] font-mono text-small leading-relaxed text-slate">
          {comparison}
        </p>
      ) : null}
    </>
  );

  return (
    <div className={className}>
      {variant === "split" ? (
        <div className="grid gap-6 md:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] md:gap-16">
          <div>{number}</div>
          <div>{children}</div>
        </div>
      ) : (
        <>
          {number}
          {children}
        </>
      )}
      {annotated ? (
        <dl className="mt-6 border-l border-hairline pl-4 font-mono text-micro leading-relaxed text-slate">
          {[
            { term: "n", value: n },
            { term: "method", value: method },
            { term: "date", value: formatDate(date) },
            { term: "source", value: source },
          ].map((row) => (
            <div key={row.term} className="flex gap-3 py-1">
              <dt className="w-14 flex-none tracking-[0.16em] text-ash uppercase">
                {row.term}
              </dt>
              <dd className="min-w-0">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-6 max-w-[110ch] font-mono text-micro leading-relaxed text-slate">
          {provenanceLine({ n, method, date, source })}
        </p>
      )}
    </div>
  );
}
