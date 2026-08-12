"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const sentinel = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);
  const [open, setOpen] = useState(false);

  // A sentinel plus IntersectionObserver, rather than a scroll listener that
  // would run on every frame.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPinned(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const solid = pinned || open;

  return (
    <>
      <div ref={sentinel} aria-hidden className="absolute top-6 h-px w-full" />

      <header
        className={[
          "fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter]",
          "duration-[var(--duration-base)] ease-[var(--ease-out-quint)]",
          solid
            ? "border-b border-hairline bg-ink/70 backdrop-blur-xl backdrop-saturate-150"
            : "border-b border-transparent",
        ].join(" ")}
      >
        <div className="shell flex h-16 items-center justify-between gap-8 md:h-[68px]">
          <Link href="/" className="group flex items-baseline gap-2" aria-label="Vyakti home">
            <span className="text-[1.0625rem] font-medium tracking-[-0.03em] text-bone">
              Vyakti
            </span>
            <span
              aria-hidden
              className="text-[0.7rem] leading-none text-slate transition-colors duration-[var(--duration-fast)] group-hover:text-ember"
            >
              व्यक्ति
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Primary">
            {NAV.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "relative rounded-full px-3.5 py-2 text-small transition-colors duration-[var(--duration-fast)]",
                    active ? "text-bone" : "text-ash hover:text-bone",
                  ].join(" ")}
                >
                  {item.label}
                  <span
                    aria-hidden
                    className={[
                      "absolute inset-x-3.5 bottom-1 h-px origin-left bg-ember",
                      "transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-quint)]",
                      active ? "scale-x-100" : "scale-x-0",
                    ].join(" ")}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/meera#access"
              className={[
                "hidden rounded-full border border-hairline px-4 py-2 text-small text-bone sm:inline-flex",
                "transition-[border-color,color,transform] duration-[var(--duration-fast)]",
                "hover:border-ember hover:text-ember active:scale-[0.98]",
              ].join(" ")}
            >
              Request access
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="-mr-2 grid h-10 w-10 place-items-center rounded-full text-bone active:scale-[0.96] md:hidden"
            >
              <span aria-hidden className="relative block h-[11px] w-5">
                <span
                  className={[
                    "absolute left-0 h-px w-full bg-current",
                    "transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-quint)]",
                    open ? "top-[5px] rotate-45" : "top-0",
                  ].join(" ")}
                />
                <span
                  className={[
                    "absolute left-0 h-px w-full bg-current",
                    "transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-quint)]",
                    open ? "top-[5px] -rotate-45" : "top-[10px]",
                  ].join(" ")}
                />
              </span>
            </button>
          </div>
        </div>

        <div id="mobile-nav" hidden={!open} className="border-t border-hairline bg-ink md:hidden">
          <nav className="shell flex flex-col py-3" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-hairline py-4 text-h3 font-medium tracking-[-0.02em] text-bone"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/meera#access"
              className="mt-5 mb-2 rounded-full bg-ember px-5 py-3 text-center text-small font-medium text-on-ember"
            >
              Request access
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
