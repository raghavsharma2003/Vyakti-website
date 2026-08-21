import { FigEnglishControl } from "@/components/figures/FigEnglishControl";
import { FigJudgeCeiling } from "@/components/figures/FigJudgeCeiling";
import { FigOrderEvacuation } from "@/components/figures/FigOrderEvacuation";
import { FIGURES, type FigureId } from "@/lib/research";

/**
 * The figure registry, and the data table that ships under every figure.
 *
 * Each figure component owns its own frame, caption and per-instance element
 * ids (`useFigureId`), which is what keeps two figures on one page from
 * sharing a hatch pattern. The table beneath is not a fallback: it is the only
 * form of the figure a screen reader can read row by row, and it is the form
 * that stays legible on a phone.
 */
const COMPONENTS: Record<FigureId, (props: { revealIndex?: number }) => React.ReactElement> = {
  "fig-f1-agreement-forest": FigJudgeCeiling,
  "fig-f2-slot-a-evacuation": FigOrderEvacuation,
  "fig-f3-english-recovery": FigEnglishControl,
};

export function FigureDataTable({ figure }: { figure: FigureId }) {
  const { table } = FIGURES[figure];

  return (
    <details className="mt-4 border-t border-hairline pt-4">
      <summary className="cursor-pointer font-mono text-micro tracking-[0.16em] text-slate uppercase marker:text-hairline hover:text-bone">
        Figure data
      </summary>
      <div
        className="mt-4 overflow-x-auto"
        data-lenis-prevent
        tabIndex={0}
        role="region"
        aria-label={table.caption}
      >
        <table className="w-full min-w-[34rem] border-collapse text-left">
          <caption className="sr-only">{table.caption}</caption>
          <thead>
            <tr className="border-b border-hairline">
              {table.columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="py-2 pr-6 font-mono text-micro font-normal tracking-[0.1em] text-slate uppercase"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {table.rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, index) => (
                  <td
                    key={index}
                    className={[
                      "py-2.5 pr-6 align-top text-small",
                      index === 0
                        ? "text-bone"
                        : "font-mono text-slate tabular-nums",
                    ].join(" ")}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.note ? (
        <p className="mt-4 max-w-[62ch] font-mono text-micro leading-relaxed text-slate">
          {table.note}
        </p>
      ) : null}
    </details>
  );
}

export function ResearchFigure({
  figure,
  revealIndex = 0,
  withTable = true,
}: {
  figure: FigureId;
  revealIndex?: number;
  withTable?: boolean;
}) {
  const Component = COMPONENTS[figure];

  return (
    <div className="not-prose">
      <Component revealIndex={revealIndex} />
      {withTable ? <FigureDataTable figure={figure} /> : null}
    </div>
  );
}
