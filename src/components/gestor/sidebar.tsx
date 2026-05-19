"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Columns3,
  Users,
  Tag,
  Settings,
  Plus,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/gestor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/gestor/lavagens", label: "Lavagens", icon: Columns3 },
  { href: "/gestor/clientes", label: "Clientes", icon: Users },
  { href: "/gestor/catalogo", label: "Catálogo", icon: Tag },
  { href: "/gestor/configuracoes", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="hidden border-r border-line bg-[var(--bg)] px-3.5 py-[18px] lg:flex lg:flex-col lg:gap-1">
      {/* Section label */}
      <div className="px-3 pb-1.5 pt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--muted-color)]">
        Operação
      </div>

      {/* CTA */}
      <Link
        href="/gestor/nova-lavagem"
        className="mb-3 inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-brand px-4 text-[14px] font-semibold text-brand-ink shadow-sm transition-[filter] hover:brightness-[0.96]"
      >
        <Plus size={16} />
        Nova lavagem
      </Link>

      {/* Nav items */}
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[14px] font-medium transition-colors ${
              isActive
                ? "bg-surface text-ink shadow-sm"
                : "text-ink-2 hover:bg-[var(--bg-2)] hover:text-ink"
            }`}
          >
            <Icon size={18} className="shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
