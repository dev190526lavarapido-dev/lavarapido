"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Store, Settings, LogOut } from "lucide-react";
import { logout } from "@/server/actions/auth";
import { createClient } from "@/lib/supabase/client";

export function Topbar() {
  const [nomeLoja, setNomeLoja] = useState("Lava Rápido");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .from("configuracoes_loja")
      .select("nome_loja, logo_url")
      .single()
      .then(({ data }) => {
        if (data?.nome_loja) setNomeLoja(data.nome_loja);
        if (data?.logo_url) setLogoUrl(data.logo_url);
      });
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-[var(--bg)] px-4 py-3.5 min-[900px]:col-span-2 min-[900px]:px-6">
      {/* Brand */}
      <div className="flex items-center gap-2.5 font-heading text-[17px] font-bold tracking-tight">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={nomeLoja}
            width={32}
            height={32}
            className="h-8 w-8 rounded-[10px] object-cover"
          />
        ) : (
          <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-brand font-heading text-[17px] font-extrabold text-brand-ink shadow-sm">
            {nomeLoja.charAt(0)}
          </span>
        )}
        <span>{nomeLoja}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-[10px] px-3 py-1.5 text-[13px] font-semibold text-ink-2 transition-colors hover:bg-[var(--bg-2)] hover:text-ink"
        >
          <Store size={14} />
          <span className="hidden md:inline-flex">Vitrine</span>
        </Link>
        <Link
          href="/gestor/configuracoes"
          className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[10px] text-ink-2 transition-colors hover:bg-[var(--bg-2)] hover:text-ink"
          title="Configurações"
          aria-label="Configurações"
        >
          <Settings size={16} />
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[10px] text-ink-2 transition-colors hover:bg-[var(--bg-2)] hover:text-ink"
            title="Sair"
            aria-label="Sair"
          >
            <LogOut size={16} />
          </button>
        </form>
      </div>
    </header>
  );
}
