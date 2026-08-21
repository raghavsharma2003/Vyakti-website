import { Fragment } from "react";
import { SeamNote } from "@/components/research/seam-note";

/**
 * A conversation annotated the way a conversation analyst would annotate it:
 * who holds the floor, and what happens in the seams between turns. The
 * figures are an illustration of the notation, not measurements from a run.
 */
const EXCHANGE = [
  { who: "Person", line: "so I did end up quitting, which I know sounds" },
  { seam: "overlap", note: "Meera comes in on the last word, not after it" },
  { who: "Meera", line: "wait, you actually did it?" },
  { who: "Person", line: "yeah. yeah, on Tuesday." },
  { seam: "gap", note: "It lets the pause sit instead of filling it" },
  { who: "Meera", line: "okay. how do you feel this morning?" },
] as const;

export function TurnDiagram() {
  return (
    <figure className="rounded-[var(--radius-lg)] border border-hairline bg-surface p-6 sm:p-8">
      <div className="space-y-0">
        {EXCHANGE.map((row, i) => (
          <Fragment key={i}>
            {"seam" in row ? (
              <div className="py-2.5 pl-0 sm:pl-[5.5rem]">
                <SeamNote tone={row.seam === "overlap" ? "ember" : "hairline"}>
                  {row.note}
                </SeamNote>
              </div>
            ) : (
              <div className="flex flex-col gap-1 py-1.5 sm:flex-row sm:gap-6">
                <span className="w-[4.5rem] flex-none font-mono text-micro tracking-[0.08em] text-slate uppercase sm:pt-1">
                  {row.who}
                </span>
                <span
                  className={
                    row.who === "Meera"
                      ? "text-body text-ember"
                      : "text-body text-bone"
                  }
                >
                  {row.line}
                </span>
              </div>
            )}
          </Fragment>
        ))}
      </div>

      <figcaption className="mt-6 border-t border-hairline pt-4 text-micro leading-relaxed text-slate">
        An illustration of how we annotate turn boundaries. Overlap and gap are
        properties of the exchange, not errors in it.
      </figcaption>
    </figure>
  );
}
