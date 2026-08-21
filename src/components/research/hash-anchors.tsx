"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Anchor landing, for a page whose section ids other pages link to.
 *
 * Lenis owns the scroll position when it is running, so a same-page hash
 * click is handed to it with an offset that clears the 68px header. When
 * Lenis is not running, which is every touch device and every reduced-motion
 * visit, the native jump plus the section's own `scroll-mt-24` is already
 * correct and this does nothing but set the hash.
 */
const HEADER_OFFSET = -96;

export function HashAnchors() {
  const pathname = usePathname();

  useEffect(() => {
    const land = (target: HTMLElement, immediate: boolean) => {
      const lenis = window.__lenis;
      if (lenis) {
        lenis.scrollTo(target, { offset: HEADER_OFFSET, immediate });
        return;
      }
      target.scrollIntoView({ behavior: "auto", block: "start" });
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href") ?? "";
      const hash = href.startsWith("#")
        ? href
        : href.startsWith(`${pathname}#`)
          ? href.slice(pathname.length)
          : "";
      if (hash.length < 2) return;

      const target = document.getElementById(hash.slice(1));
      if (!target) return;

      event.preventDefault();
      land(target, false);
      window.history.pushState(null, "", hash);
    };

    document.addEventListener("click", onClick);

    // Cross-page arrival: on a hard load the browser has already jumped, but
    // on a client-side navigation from another page nothing has, and Lenis may
    // not have existed either way. Land once layout has settled, then once
    // more after the router's own scroll handling has run.
    const timers: number[] = [];
    let abandoned = false;
    // Any deliberate scroll by the reader wins over the correction below.
    const abandon = () => {
      abandoned = true;
    };

    if (window.location.hash.length > 1) {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target) {
        // Three attempts, because the figures mount after hydration and the
        // document keeps growing under the target for a few hundred
        // milliseconds. Each attempt re-measures rather than reusing an
        // offset that was correct a moment ago.
        for (const delay of [0, 250, 700]) {
          timers.push(
            window.setTimeout(() => {
              if (!abandoned) land(target, true);
            }, delay),
          );
        }
        window.addEventListener("wheel", abandon, { passive: true });
        window.addEventListener("touchstart", abandon, { passive: true });
        window.addEventListener("keydown", abandon);
      }
    }

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("wheel", abandon);
      window.removeEventListener("touchstart", abandon);
      window.removeEventListener("keydown", abandon);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [pathname]);

  return null;
}
