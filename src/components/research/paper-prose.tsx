import { Fragment } from "react";
import { ResearchFigure } from "@/components/research/figures";
import type { Block, Inline } from "@/lib/paper-body";

/**
 * The reading layer for a paper.
 *
 * Long-form settings, not marketing settings: the site's own `.measure`
 * (62ch) for prose, a looser leading than the page default because this is a
 * six-thousand-word read, run-in bold lead-ins in `bone` against body copy in
 * `ash` so a reader can find the argument by scanning, and mono tabular
 * numerals wherever a figure is a figure.
 */
function Spans({ spans }: { spans: Inline[] }) {
  return (
    <>
      {spans.map((span, index) => {
        if (span.code) {
          return (
            <code
              key={index}
              className="font-mono text-[0.9em] break-words text-bone"
            >
              {span.text}
            </code>
          );
        }
        if (span.bold) {
          return (
            <strong key={index} className="font-medium text-bone">
              {span.italic ? <em>{span.text}</em> : span.text}
            </strong>
          );
        }
        if (span.italic) {
          return (
            <em key={index} className="italic">
              {span.text}
            </em>
          );
        }
        return <Fragment key={index}>{span.text}</Fragment>;
      })}
    </>
  );
}

const NUMERIC = /^[\d[(−+*.]|^—$|%|pp$/;

function cellIsNumeric(spans: Inline[]): boolean {
  const text = spans.map((span) => span.text).join("").trim();
  return NUMERIC.test(text);
}

function PaperTable({
  head,
  rows,
}: {
  head: Inline[][];
  rows: Inline[][][];
}) {
  return (
    <div className="mt-10 mb-4">
      <div
        className="overflow-x-auto"
        data-lenis-prevent
        tabIndex={0}
        role="region"
        aria-label="Table, scrollable"
      >
        <table className="w-full min-w-[42rem] border-collapse text-left">
          <thead>
            <tr className="border-y border-hairline">
              {head.map((cell, index) => (
                <th
                  key={index}
                  scope="col"
                  className="py-3 pr-5 align-bottom font-mono text-micro font-normal tracking-[0.1em] text-slate uppercase"
                >
                  <Spans spans={cell} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, index) => (
                  <td
                    key={index}
                    className={[
                      "py-3 pr-5 align-top text-small leading-relaxed",
                      index === 0 || !cellIsNumeric(cell)
                        ? "text-bone"
                        : "font-mono whitespace-nowrap text-ash tabular-nums",
                    ].join(" ")}
                  >
                    <Spans spans={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 font-mono text-micro text-slate sm:hidden">
        Table scrolls sideways.
      </p>
    </div>
  );
}

export function PaperProse({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.kind) {
          case "h3":
            return (
              <h3
                key={index}
                id={block.id}
                className="mt-16 scroll-mt-28 text-bone first:mt-0"
              >
                {block.number ? (
                  <span className="mr-3 font-mono text-small tracking-[0.04em] text-slate tabular-nums">
                    {block.number}
                  </span>
                ) : null}
                {block.title}
              </h3>
            );
          case "p":
            return block.note ? (
              <p
                key={index}
                className="mt-4 max-w-[68ch] border-l border-hairline pl-4 font-mono text-micro leading-relaxed text-slate"
              >
                <Spans spans={block.spans} />
              </p>
            ) : (
              <p
                key={index}
                className="measure mt-6 text-body leading-[1.75] text-ash"
              >
                <Spans spans={block.spans} />
              </p>
            );
          case "quote":
            return (
              <p
                key={index}
                className="mt-7 max-w-[62ch] border-l-2 border-hairline py-2 pl-4 font-mono text-small leading-relaxed text-bone"
              >
                <Spans spans={block.spans} />
              </p>
            );
          case "table":
            return <PaperTable key={index} head={block.head} rows={block.rows} />;
          case "figure":
            return (
              <div key={index} className="my-12">
                <ResearchFigure figure={block.figure} />
              </div>
            );
          case "hr":
            return <hr key={index} className="mt-10 border-hairline" />;
          default:
            return null;
        }
      })}
    </>
  );
}
