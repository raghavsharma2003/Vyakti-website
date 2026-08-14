"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * One IntersectionObserver for every `[data-reveal]` on the page.
 *
 * Elements reveal once and stay revealed. Re-animating on scroll-back is the
 * single most reliable tell of a template. Stagger comes from `data-reveal`
 * carrying a numeric index, which becomes a delay.
 */
export function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!nodes.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      nodes.forEach((n) => n.classList.add("is-revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const index = Number(el.dataset.reveal) || 0;
          el.style.setProperty("--reveal-delay", `${index * 80}ms`);
          el.classList.add("is-revealed");
          observer.unobserve(el);
        }
      },
      // Fire a little before the element is fully on screen so motion feels
      // like it belongs to the scroll rather than trailing it.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
