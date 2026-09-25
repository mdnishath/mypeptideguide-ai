"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays } from "lucide-react";
import type { Plan } from "@/core/plan/plan";
import { KEYS, useStored } from "@/state/store";
import { Container, Wordmark } from "./primitives";

const NAV = [
  { label: "Library", href: "/compounds" },
  { label: "Calculators", href: "/calculators" },
  { label: "Guides", href: "/guides" },
  { label: "Glossary", href: "/glossary" },
];

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative shrink-0 py-2 text-[14px] font-medium transition-colors ${active ? "text-ink" : "text-body hover:text-ink"}`}
    >
      {label}
      {active && <span aria-hidden="true" className="absolute inset-x-0 -bottom-[1px] h-[2px] rounded-full bg-blue" />}
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [plan] = useStored<Plan | null>(KEYS.plan, null);
  const hasPlan = !!plan?.items.length;
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header data-print="hide" className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center gap-6">
          <Link href="/" aria-label="mypeptideguide.ai home" className="shrink-0">
            <Wordmark />
          </Link>

          <nav aria-label="Main" className="hidden flex-1 items-center gap-7 pl-6 md:flex">
            {NAV.map((n) => (
              <NavLink key={n.href} {...n} active={isActive(n.href)} />
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-5">
            {hasPlan && (
              <Link
                href="/calendar"
                className={`inline-flex items-center gap-1.5 text-[14px] font-medium ${isActive("/calendar") || isActive("/protocol") ? "text-ink" : "text-body hover:text-ink"}`}
              >
                <CalendarDays size={16} strokeWidth={2} aria-hidden="true" />
                My plan
              </Link>
            )}
            <Link
              href="/guide"
              className="btn-primary inline-flex h-10 items-center rounded-full px-5 text-[14px] font-semibold text-white"
            >
              Start the guide
            </Link>
          </div>
        </div>

        <nav aria-label="Main" className="-mx-5 flex gap-6 overflow-x-auto px-5 pb-3 md:hidden">
          {NAV.map((n) => (
            <NavLink key={n.href} {...n} active={isActive(n.href)} />
          ))}
        </nav>
      </Container>
    </header>
  );
}
