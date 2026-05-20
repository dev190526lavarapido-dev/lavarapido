import Link from "next/link";
import {
  Car,
  Clock,
  Droplet,
  Check,
  Key,
  AlertTriangle,
  Tag,
  Banknote,
  Plus,
  ChevronRight,
} from "lucide-react";

import { getDashboardStats } from "@/server/queries/dashboard";
import { getLavagensAtivas } from "@/server/queries/lavagens";
import { StatCard } from "@/components/gestor/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { PlacaTag } from "@/components/placa-tag";
import { moneyBR } from "@/components/money";

function saudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function DashboardPage() {
  const [stats, lavagensAtivas] = await Promise.all([
    getDashboardStats(),
    getLavagensAtivas(),
  ]);

  const top5 = lavagensAtivas.slice(0, 5);

  return (
    <div>
      {/* Page head */}
      <div className="mb-5 flex flex-col gap-3 max-md:items-stretch md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[13px] font-medium text-[var(--muted)]">
            {saudacao()}, Marquinhos ☀️
          </div>
          <h1 className="font-heading text-[30px] font-bold leading-tight tracking-[-0.025em]">
            Como ta o dia hoje?
          </h1>
        </div>
        <div className="flex gap-2 max-md:[&>*]:flex-1">
          <Link
            href="/gestor/nova-lavagem"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-btn)] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-2)]"
          >
            <Plus size={16} />
            Nova lavagem
          </Link>
        </div>
      </div>

      {/* Stats grid 1 */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Entradas hoje"
          value={stats.entradas}
          icon={Car}
          accent="default"
        />
        <StatCard
          label="Aguardando"
          value={stats.aguardando}
          icon={Clock}
          accent="yellow"
        />
        <StatCard
          label="Lavando agora"
          value={stats.lavando}
          icon={Droplet}
          accent="sky"
        />
        <StatCard
          label="Concluídas"
          value={stats.concluidas}
          icon={Check}
          accent="mint"
        />
      </div>

      {/* Stats grid 2 */}
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Retirados"
          value={stats.retirados}
          icon={Key}
          accent="default"
        />
        <StatCard
          label="Ocorrências abertas"
          value={stats.ocorrencias}
          icon={AlertTriangle}
          accent="rose"
        />
        <StatCard
          label="Faturamento previsto"
          value={moneyBR(stats.faturamentoPrevisto)}
          icon={Tag}
          big
        />
        <StatCard
          label="Dinheiro recebido"
          value={moneyBR(stats.dinheiroRecebido)}
          icon={Banknote}
          accent="money"
          big
        />
      </div>

      {/* Lavagens ativas */}
      <div className="mt-6">
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--line)] px-[18px] py-3.5">
            <div>
              <h3 className="font-heading text-base font-bold">
                Lavagens ativas agora
              </h3>
              <div className="text-xs text-[var(--muted)]">
                As {Math.min(5, lavagensAtivas.length)} mais recentes
              </div>
            </div>
            <Link
              href="/gestor/lavagens"
              className="inline-flex h-[34px] items-center gap-1 rounded-[10px] px-3 text-[13px] font-semibold text-[var(--ink-2)] hover:bg-[var(--bg-2)] hover:text-[var(--ink)]"
            >
              Ver tudo
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* List */}
          <div className="flex flex-col gap-2 p-3.5">
            {top5.length === 0 && (
              <div className="py-5 text-center text-[var(--muted)]">
                Sem lavagens ativas agora. Bora puxar a primeira do dia! 🧽
              </div>
            )}
            {top5.map((l) => (
              <Link
                key={l.id}
                href="/gestor/lavagens"
                className="flex items-center gap-3 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-3 hover:border-[var(--brand)]"
              >
                <PlacaTag placa={l.veiculo?.placa ?? "---"} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">
                    {l.cliente?.nome}
                  </div>
                  <div className="truncate text-xs text-[var(--muted)]">
                    {l.servico?.nome} · {l.veiculo?.modelo}
                  </div>
                </div>
                <StatusBadge status={l.status_atual} size="sm" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
