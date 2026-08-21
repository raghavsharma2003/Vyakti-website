"use client";

import { useEffect, useState } from "react";

/**
 * Contents for a long read.
 *
 * The site's existing secondary-navigation idiom is a sticky left column
 * (`/company`'s "How we work" heading), so this is that column with the
 * paper's own section numbering in it, driven by one IntersectionObserver
 * rather than a scroll listener. Only the active item's colour transitions;
 * the rail itself never moves.
 */
export type TocEntry = {
  id: string;
  number: string | null;
  title: string;
  children?: { id: string; number: string | null; title: string }[];
};

export function PaperToc({ entries }: { entries: TocEntry[] }) {
  const [active, setActive] = useState<string>(entries[0]?.id ?? "");

  useEffect(() => {
    const ids = entries.flatMap((entry) => [
      entry.id,
      ...(entry.children ?? []).map((child) => child.id),
    ]);
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (records) => {
        const visible = records
          .filter((record) => record.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [entries]);

  return (
    <nav aria-label="Paper contents" className="lg:sticky lg:top-28">
      <p className="font-mono text-micro tracking-[0.16em] text-slate uppercase">
        Contents
      </p>
      <ul className="mt-5 space-y-2.5 border-l border-hairline">
        {entries.map((entry) => {
          const activeHere =
            active === entry.id ||
            (entry.children ?? []).some((child) => child.id === active);
          return (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                aria-current={active === entry.id ? "true" : undefined}
                className={[
                  "-ml-px block border-l py-0.5 pl-4 text-small transition-colors duration-[var(--duration-base)] ease-[var(--ease-out-quint)]",
                  activeHere
                    ? "border-ember text-bone"
                    : "border-transparent text-slate hover:text-ash",
                ].join(" ")}
              >
                {entry.number ? (
                  <span className="mr-2 font-mono text-micro tabular-nums">
                    {entry.number}
                  </span>
                ) : null}
                {entry.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
