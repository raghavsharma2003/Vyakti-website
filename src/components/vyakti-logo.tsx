type VyaktiLogoProps = {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
};

/**
 * The institutional mark is rooted in the opening sound of the company name:
 * `व्य`, the first cluster in व्यक्ति. Its continuous headline becomes the
 * visual shorthand for identity that persists while expression changes.
 *
 * Keep the mark typographic and unboxed. The domain suffix is the only signal
 * accent, so the lockup stays institutional rather than becoming an AI icon.
 */
export function VyaktiLogo({
  className = "",
  markClassName = "",
  wordmarkClassName = "",
  showWordmark = true,
}: VyaktiLogoProps) {
  return (
    <span className={["inline-flex items-center gap-2.5", className].join(" ")}>
      <span
        aria-hidden
        lang="hi"
        className={[
          "grid h-8 min-w-8 place-items-center text-[1.55rem] leading-none font-semibold tracking-[-0.12em] transition-colors duration-[var(--duration-fast)]",
          markClassName,
        ].join(" ")}
        style={{ fontFamily: "var(--font-devanagari), sans-serif" }}
      >
        व्य
      </span>
      {showWordmark ? (
        <span
          className={[
            "inline-flex items-baseline text-[1.0625rem] font-semibold tracking-[-0.045em] lowercase",
            wordmarkClassName,
          ].join(" ")}
        >
          <span>vyakti</span>
          <span className="ml-[0.16em] font-mono text-[0.56em] font-medium tracking-[-0.02em] text-ember">
            .ai
          </span>
        </span>
      ) : null}
    </span>
  );
}
