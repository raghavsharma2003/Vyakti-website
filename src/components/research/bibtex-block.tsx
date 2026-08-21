"use client";

import { useEffect, useRef, useState } from "react";

/**
 * One collapsed citation block per paper, at the bottom of the page, with a
 * real button and a polite announcement. Never expanded by default, and never
 * on the index.
 */
export function BibtexBlock({ bibtex }: { bibtex: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(bibtex);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <details className="border border-hairline bg-surface">
      <summary className="cursor-pointer px-5 py-4 font-mono text-micro tracking-[0.16em] text-slate uppercase marker:text-hairline hover:text-bone">
        BibTeX
      </summary>
      <div className="border-t border-hairline p-5">
        <div className="overflow-x-auto" data-lenis-prevent tabIndex={0}>
          <pre className="font-mono text-micro leading-relaxed text-ash">
            {bibtex}
          </pre>
        </div>
        <div className="mt-5 flex items-center gap-4">
          <button
            type="button"
            onClick={copy}
            className="border border-hairline px-4 py-2 text-small text-bone transition-colors duration-[var(--duration-fast)] hover:border-ash hover:bg-raised active:scale-[0.98]"
          >
            Copy
          </button>
          <span
            aria-live="polite"
            className={[
              "font-mono text-micro text-slate transition-opacity duration-[140ms]",
              copied ? "opacity-100" : "opacity-0",
            ].join(" ")}
          >
            {copied ? "Copied" : ""}
          </span>
        </div>
      </div>
    </details>
  );
}
