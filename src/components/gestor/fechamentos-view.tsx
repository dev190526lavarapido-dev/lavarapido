'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  Car,
  Banknote,
  UserPlus,
  ChevronRight,
  Lock,
  Check,
} from 'lucide-react'

import type { FechamentoDiario } from '@/lib/types'
import { fecharDiaAtual } from '@/server/actions/fechamentos'
import { moneyBR } from '@/components/money'
import { formatarDataBR, diaDaSemana } from '@/lib/datas'
import { cn } from '@/lib/utils'

interface FechamentosViewProps {
  fechamentos: FechamentoDiario[]
}

export function FechamentosView({ fechamentos }: FechamentosViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)

  const handleFechar = () => {
    setError(null)
    setOkMsg(null)
    startTransition(async () => {
      const result = await fecharDiaAtual()
      if (result.error) {
        setError(result.error)
        return
      }
      setOkMsg(`Dia ${result.data ? formatarDataBR(result.data) : 'de hoje'} consolidado.`)
      router.refresh()
    })
  }

  return (
    <div className={cn(isPending && 'pointer-events-none opacity-70')}>
      {/* Page head */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-[30px] font-bold leading-tight tracking-[-0.025em]">
            Fechamentos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Extrato do turno de cada dia. Toca num dia pra ver os detalhes.
          </p>
        </div>
        <button
          onClick={handleFechar}
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-[var(--brand)] px-4 text-sm font-semibold text-[var(--brand-ink)] shadow-[var(--shadow-sm)] transition-all hover:brightness-95 active:translate-y-px disabled:opacity-60"
        >
          <Lock size={16} />
          {isPending ? 'Fechando...' : 'Fechar dia de hoje'}
        </button>
      </div>

      {/* Feedback */}
      {error && (
        <div className="mb-3 rounded-xl border border-[var(--rose)] bg-[color-mix(in_oklab,var(--rose)_8%,transparent)] px-3.5 py-2 text-xs text-[var(--rose)]">
          {error}
        </div>
      )}
      {okMsg && (
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-xl border border-[var(--mint)] bg-[color-mix(in_oklab,var(--mint)_10%,transparent)] px-3.5 py-2 text-xs font-medium text-[#1A6E55]">
          <Check size={14} />
          {okMsg}
        </div>
      )}

      {/* Lista de dias (extrato) */}
      <div className="flex flex-col gap-2.5">
        {fechamentos.length === 0 && (
          <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--line)] bg-[var(--surface)] py-10 text-center text-muted-foreground">
            Nenhum dia fechado ainda. O fechamento roda automático à meia-noite —
            ou toca em <span className="font-semibold">“Fechar dia de hoje”</span> pra
            consolidar agora. 📋
          </div>
        )}

        {fechamentos.map((f) => (
          <Link
            key={f.id}
            href={`/gestor/fechamentos/${f.data}`}
            className="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--brand)]"
          >
            {/* Data */}
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[color-mix(in_oklab,var(--brand)_14%,transparent)] text-[var(--brand)]">
              <CalendarDays size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">{formatarDataBR(f.data)}</div>
              <div className="text-xs capitalize text-muted-foreground">
                {diaDaSemana(f.data)}
              </div>
            </div>

            {/* Métricas resumidas */}
            <div className="flex items-center gap-3 sm:gap-5">
              <Metric icon={Car} value={f.total_lavagens} label="lavagens" />
              <Metric
                icon={Banknote}
                value={moneyBR(Number(f.faturamento))}
                label="faturamento"
                emphasis
              />
              <Metric
                icon={UserPlus}
                value={f.novos_clientes}
                label="novos"
                className="hidden sm:flex"
              />
            </div>

            <ChevronRight size={16} className="shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  )
}

interface MetricProps {
  icon: typeof Car
  value: string | number
  label: string
  emphasis?: boolean
  className?: string
}

function Metric({ icon: Icon, value, label, emphasis, className }: MetricProps) {
  return (
    <div className={cn('flex flex-col items-end', className)}>
      <div
        className={cn(
          'inline-flex items-center gap-1 font-heading font-bold tabular-nums',
          emphasis ? 'text-[15px] text-[var(--brand)]' : 'text-[15px] text-[var(--ink)]',
        )}
      >
        <Icon size={14} className="opacity-70" />
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
        {label}
      </div>
    </div>
  )
}
