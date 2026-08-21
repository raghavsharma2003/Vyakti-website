import Link from "next/link";
import { SeamNote } from "@/components/research/seam-note";
import type { EvidenceRow, PillarId } from "@/lib/research";
import { OPEN_RAIL, STRUCK_RAIL, evidenceFor } from "@/lib/research";

/**
 * A pillar is a claim, so it carries its evidence in the same block.
 *
 * Four states, and the two that look like failures are the point: a track
 * with nothing measured says so in the same typography and the same place,
 * and a claim this lab retracted renders struck rather than deleted.
 */
function RailRow({ row }: { row: EvidenceRow }) {
  const struck = row.state === "struck";

  return (
    <li className="py-6">
      {row.state === "in_preparation" ? (
        <p className="inline-flex items-center border border-hairline bg-surface px-2.5 py-1 font-mono text-micro tracking-[0.16em] text-slate uppercase">
          In preparation
        </p>
      ) : row.number ? (
        <p className="font-mono text-h3 leading-none tracking-[-0.01em] text-bone tabular-nums">
          {row.number}
        </p>
      ) : null}

      <p
        className={[
          "measure mt-3 text-body",
          struck
            ? "text-slate line-through decoration-ember decoration-1 underline-offset-[0.22em]"
            : "text-bone",
        ].join(" ")}
      >
        {row.claim}
      </p>

      {row.control ? (
        <SeamNote as="p" tone="ember" className="mt-3 max-w-[52ch]">
          {row.control}
        </SeamNote>
      ) : null}

      <p className="mt-3 font-mono text-micro leading-relaxed text-slate">
        {row.meta}
      </p>

      {row.href && row.linkLabel ? (
        <p className="mt-3">
          <Link
            href={row.href}
            className="group inline-flex items-center gap-1.5 text-small text-ember transition-colors hover:text-bone"
          >
            {row.linkLabel}
            <span
              aria-hidden
              className="transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-quint)] group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </p>
      ) : null}
    </li>
  );
}

export function EvidenceRail({ pillar }: { pillar: PillarId }) {
  const rows = [...evidenceFor(pillar)];
  const struck = STRUCK_RAIL[pillar];
  if (struck) rows.push(struck);
  const open = OPEN_RAIL[pillar];

  return (
    <div className="mt-10 border-t border-hairline pt-5" data-reveal="2">
      <p className="font-mono text-micro tracking-[0.16em] text-slate uppercase">
        Evidence
      </p>

      {open ? (
        <SeamNote as="p" className="mt-5 max-w-[56ch]">
          {open}
        </SeamNote>
      ) : (
        <ul className="mt-1 divide-y divide-hairline">
          {rows.map((row) => (
            <RailRow key={row.id} row={row} />
          ))}
        </ul>
      )}
    </div>
  );
}
