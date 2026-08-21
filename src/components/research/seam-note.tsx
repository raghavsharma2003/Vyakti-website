import type { ReactNode } from "react";

/**
 * The seam annotation: a left-ruled mono note in the margin of a claim.
 *
 * `turn-diagram.tsx` invented this to mark what happens between two turns of a
 * conversation. The research section uses the identical treatment one level
 * up, for what happens between a claim and the control that tested it, so
 * both go through this component rather than through two copies of the same
 * class string.
 */
export function SeamNote({
  tone = "hairline",
  as: Tag = "span",
  className = "",
  children,
}: {
  tone?: "hairline" | "ember";
  as?: "span" | "p" | "div";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={[
        "block border-l-2 py-1 pl-3 font-mono text-micro leading-relaxed tracking-[0.04em] text-slate",
        tone === "ember" ? "border-ember" : "border-hairline",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Tag>
  );
}
