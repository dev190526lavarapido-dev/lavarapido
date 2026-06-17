import Link from 'next/link'
import { ArrowLeft, Car, Banknote, UserPlus } from 'lucide-react'

import { getFechamento } from '@/server/queries/fechamentos'
import { StatCard } from '@/components/gestor/stat-card'
import { StatusBadge } from '@/components/status-badge'
import { PlacaTag } from '@/components/placa-tag'
import { moneyBR } from '@/components/money'
import { formatarDataBR, diaDaSemana } from '@/lib/datas'
import type { LavagemStatus } from '@/lib/constants'

export default async function FechamentoDetalhePage({
  params,
}: {
  params: Promise<{ data: string }>
}) {
  const { data } = await params
  const fechamento = await getFechamento(data)

  return (
    <div>
      {/* Voltar */}
      <Link
        href="/gestor/fechamentos"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--ink-2)] hover:text-[var(--ink)]"
      >
        <ArrowLeft size={16} />
        Fechamentos
      </Link>

      {!fechamento ? (
        <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--line)] bg-[var(--surface)] py-10 text-center text-muted-foreground">
          Nenhum fechamento encontrado para {formatarDataBR(data)}.
        </div>
      ) : (
        <>
          {/* Head */}
          <div className="mb-5">
            <h1 className="font-heading text-[30px] font-bold leading-tight tracking-[-0.025em]">
              {formatarDataBR(fechamento.data)}
            </h1>
            <p className="mt-1 text-sm capitalize text-muted-foreground">
              {diaDaSemana(fechamento.data)}
            </p>
          </div>

          {/* Resumo */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <StatCard label="Lavagens" value={fechamento.total_lavagens} icon={Car} />
            <StatCard
              label="Faturamento"
              value={moneyBR(Number(fechamento.faturamento))}
              icon={Banknote}
              accent="money"
              big
            />
            <StatCard
              label="Novos clientes"
              value={fechamento.novos_clientes}
              icon={UserPlus}
              accent="mint"
            />
          </div>

          {/* Lista de lavagens do dia */}
          <div className="mt-6 overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)]">
            <div className="border-b border-[var(--line)] px-[18px] py-3.5">
              <h3 className="font-heading text-base font-bold">Lavagens do dia</h3>
              <div className="text-xs text-muted-foreground">
                {fechamento.detalhe.length} no total
              </div>
            </div>

            <div className="flex flex-col gap-2 p-3.5">
              {fechamento.detalhe.length === 0 && (
                <div className="py-5 text-center text-muted-foreground">
                  Nenhuma lavagem registrada nesse dia.
                </div>
              )}
              {fechamento.detalhe.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center gap-3 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-3"
                >
                  <PlacaTag placa={l.placa ?? '---'} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{l.cliente}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {l.servico}
                      {l.modelo ? ` · ${l.modelo}` : ''}
                    </div>
                  </div>
                  <StatusBadge status={l.status as LavagemStatus} size="sm" />
                  <div className="shrink-0 font-heading text-sm font-bold tabular-nums">
                    {moneyBR(Number(l.valor))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
