import { STATUS_LABEL, type PaperStatus } from "@/lib/research";

/**
 * The chip carries the status and nothing else. The venue lives on the next
 * line, prefixed "Submission target" until a venue has actually accepted,
 * because a chip reading "Under review at X" is a claim about a third party.
 */
const STYLE: Record<PaperStatus, string> = {
  in_preparation: "border-hairline text-slate",
  preprint: "border-hairline text-bone",
  submitted: "border-ember text-bone",
  under_review: "border-ember text-bone",
  accepted: "border-ember bg-ember text-on-ember",
  published: "border-ember bg-ember text-on-ember",
};

export function StatusChip({ status }: { status: PaperStatus }) {
  return (
    <span
      className={[
        "inline-flex items-center border px-3 py-1 font-mono text-micro tracking-[0.16em] uppercase",
        STYLE[status],
      ].join(" ")}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
