"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV } from "@/lib/site";
import { VyaktiLogo } from "@/components/vyakti-logo";

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function SiteHeader() {
  const pathname = usePathname();
  const sentinel = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [pinned, setPinned] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const element = sentinel.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      setPinned(!entry.isIntersecting);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const panel = menu.current;
    const main = document.querySelector<HTMLElement>("#main");
    const footer = document.querySelector<HTMLElement>("[data-site-footer]");
    const trigger = menuButton.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (main) main.inert = true;
    if (footer) footer.inert = true;

    const frame = window.requestAnimationFrame(() => {
      panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (main) main.inert = false;
      if (footer) footer.inert = false;
      trigger?.focus({ preventScroll: true });
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <>
      <div ref={sentinel} aria-hidden className="absolute top-6 h-px w-full" />
      <header
        className={[
          "site-header fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-[var(--duration-base)] ease-[var(--ease-out-quint)]",
          pinned || open
            ? "border-b border-hairline bg-ink/82 backdrop-blur-xl backdrop-saturate-150"
            : "border-b border-transparent",
        ].join(" ")}
      >
        <div className="shell flex h-[68px] items-center justify-between gap-8">
          <Link href="/" className="group" aria-label="Vyakti home">
            <VyaktiLogo
              markClassName="text-bone group-hover:text-ember"
              wordmarkClassName="text-bone"
            />
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Primary">
            {NAV.map((item) => {
              const basePath = item.href.split("#")[0] || "/";
              const active =
                basePath !== "/" &&
                (pathname === basePath || pathname.startsWith(`${basePath}/`));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "relative rounded-full px-3.5 py-2 text-small transition-colors duration-[var(--duration-fast)]",
                    active ? "text-bone" : "text-ash hover:text-ember",
                  ].join(" ")}
                >
                  {item.label}
                  <span
                    aria-hidden
                    className={[
                      "absolute inset-x-3.5 bottom-1 h-px origin-left bg-ember transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-quint)]",
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
              className="hidden rounded-full border border-bone px-4 py-2 text-small font-medium text-bone transition-[background-color,color,transform] duration-[var(--duration-fast)] hover:bg-bone hover:text-ink active:scale-[0.98] sm:inline-flex"
            >
              Meet Meera
            </Link>
            <button
              ref={menuButton}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="-mr-2 grid h-11 w-11 place-items-center rounded-full text-bone active:scale-[0.96] md:hidden"
            >
              <span aria-hidden className="relative block h-[11px] w-5">
                <span
                  className={[
                    "absolute left-0 h-px w-full bg-current transition-transform duration-[var(--duration-base)]",
                    open ? "top-[5px] rotate-45" : "top-0",
                  ].join(" ")}
                />
                <span
                  className={[
                    "absolute left-0 h-px w-full bg-current transition-transform duration-[var(--duration-base)]",
                    open ? "top-[5px] -rotate-45" : "top-[10px]",
                  ].join(" ")}
                />
              </span>
            </button>
          </div>
        </div>

        <div
          ref={menu}
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          hidden={!open}
          className="max-h-[calc(100dvh-68px)] overflow-y-auto overscroll-contain border-t border-hairline bg-ink md:hidden"
        >
          <nav className="shell flex min-h-[calc(100dvh-69px)] flex-col py-5" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="border-b border-hairline py-4 text-h3 font-medium text-bone"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/meera#access"
              onClick={closeMenu}
              className="mt-6 rounded-full bg-ember px-5 py-3 text-center text-small font-medium text-on-ember"
            >
              Meet Meera
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
