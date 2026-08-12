import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-small font-medium " +
  "transition-[background-color,border-color,color,transform] duration-[var(--duration-fast)] " +
  "ease-[var(--ease-out-quint)] active:scale-[0.98] whitespace-nowrap";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ember text-on-ember hover:bg-ember/90",
  secondary: "border border-hairline text-bone hover:border-ash hover:bg-surface",
};

export function Cta({
  href,
  children,
  variant = "primary",
  ...rest
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
} & Omit<ComponentProps<typeof Link>, "href" | "children">) {
  return (
    <Link href={href} className={`${BASE} ${VARIANTS[variant]}`} {...rest}>
      {children}
    </Link>
  );
}
