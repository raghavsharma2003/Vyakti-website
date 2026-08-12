import Link from "next/link";
import { FOOTER_GROUPS, SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-void">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.5fr_repeat(3,1fr)] md:gap-8">
          <div className="max-w-xs">
            <div className="flex items-baseline gap-2">
              <span className="text-h3 font-medium tracking-[-0.03em] text-bone">
                Vyakti
              </span>
              <span aria-hidden className="text-small text-slate">
                व्यक्ति
              </span>
            </div>
            <p className="mt-4 text-small leading-relaxed text-ash">
              Sanskrit for a person, the individual, that which is made
              manifest.
            </p>
            <a
              href={`mailto:${SITE.email}`}
              className="mt-6 inline-block text-small text-ash underline decoration-hairline underline-offset-4 transition-colors duration-[var(--duration-fast)] hover:text-ember hover:decoration-ember"
            >
              {SITE.email}
            </a>
          </div>

          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="font-mono text-micro font-normal tracking-[0.14em] text-slate uppercase">
                {group.title}
              </h2>
              <ul className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-small text-ash transition-colors duration-[var(--duration-fast)] hover:text-bone"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="rule mt-14" />

        <div className="mt-8 flex flex-col gap-3 text-micro text-slate sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p className="max-w-sm sm:text-right">
            Head geometry from the{" "}
            <a
              href="https://github.com/mrdoob/three.js"
              className="underline decoration-hairline underline-offset-4 transition-colors hover:text-ash"
              rel="noopener noreferrer"
              target="_blank"
            >
              Infinite head scan
            </a>{" "}
            by Lee Perry-Smith, Infinite-Realities, licensed CC BY 3.0.
          </p>
        </div>
      </div>
    </footer>
  );
}
