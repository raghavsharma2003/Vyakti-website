import Link from "next/link";
import { FOOTER_GROUPS, SITE } from "@/lib/site";
import { VyaktiLogo } from "@/components/vyakti-logo";

export function SiteFooter() {
  return (
    <footer data-site-footer className="border-t border-hairline bg-void text-bone">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.5fr_repeat(3,1fr)] md:gap-8">
          <div className="max-w-xs">
            <VyaktiLogo
              className="gap-3"
              markClassName="text-ember"
              wordmarkClassName="text-h3 font-medium text-bone"
            />
            <p className="mt-4 text-small leading-relaxed text-ash">
              A relational intelligence lab studying how an AI identity can
              build shared context and remain recognizably itself over time.
            </p>
            <a href={`mailto:${SITE.email}`} className="mt-6 inline-block text-small text-ash underline decoration-hairline underline-offset-4 transition-colors hover:text-ember">{SITE.email}</a>
          </div>

          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="font-mono text-micro font-normal tracking-[0.14em] text-slate uppercase">{group.title}</h2>
              <ul className="mt-5 space-y-3">
                {group.links.map((link) => <li key={link.href + link.label}><Link href={link.href} className="text-small text-ash transition-colors hover:text-ember">{link.label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 h-px bg-hairline" />
        <div className="mt-8 flex flex-col gap-3 text-micro text-slate sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p className="max-w-md sm:text-right">
            3D geometry: <a href="https://github.com/mrdoob/three.js" className="underline decoration-hairline underline-offset-4 transition-colors hover:text-ash" rel="noopener noreferrer" target="_blank">Infinite head scan</a>, CC BY 3.0, and <a href="https://github.com/google/GNM" className="underline decoration-hairline underline-offset-4 transition-colors hover:text-ash" rel="noopener noreferrer" target="_blank">Google GNM Head</a>, Apache 2.0.
          </p>
        </div>
      </div>
    </footer>
  );
}
