"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Columns3, Plus, Users, Tag, Receipt } from "lucide-react";

const TABS = [
  { href: "/gestor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/gestor/lavagens", label: "Lavagens", icon: Columns3 },
  { href: "/gestor/nova-lavagem", label: "Nova", icon: Plus, cta: true },
  { href: "/gestor/clientes", label: "Clientes", icon: Users },
  { href: "/gestor/catalogo", label: "Catálogo", icon: Tag },
  { href: "/gestor/fechamentos", label: "Extrato", icon: Receipt },
];

export function BottomBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-30 flex items-center justify-around border-t border-line bg-surface px-2 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 min-[900px]:hidden">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");

        if (tab.cta) {
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="mx-1 flex -translate-y-1.5 flex-col items-center gap-[3px] rounded-[16px] bg-brand px-3.5 py-2.5 text-[11px] font-medium text-brand-ink shadow-[var(--shadow)]"
            >
              <Icon size={24} />
              <span>{tab.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex min-w-[48px] flex-col items-center gap-[3px] rounded-[12px] px-1.5 py-2 text-[11px] font-medium ${
              isActive ? "text-ink" : "text-[var(--muted-color)]"
            }`}
          >
            <Icon size={22} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
