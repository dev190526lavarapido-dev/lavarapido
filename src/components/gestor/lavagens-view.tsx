'use client'

import { useState, useEffect, useMemo, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus } from 'lucide-react'
import { STATUS_META, STATUS_TRANSITIONS } from '@/lib/constants'
import type { LavagemStatus } from '@/lib/constants'
import type { LavagemComDetalhes, ConfigLoja } from '@/lib/types'
import { mudarStatus } from '@/server/actions/lavagens'
import { tipoMsgParaStatus } from '@/lib/whatsapp'
import { createClient } from '@/lib/supabase/client'
import { LavagemCard } from './lavagem-card'
import { LavagemDetalheModal } from '@/components/modals/lavagem-detalhe'
import { OcorrenciaModal } from '@/components/modals/ocorrencia-modal'
import { WhatsAppModal } from '@/components/modals/whatsapp-modal'
import { cn } from '@/lib/utils'

/* ============ Column config ============ */
const COLS: { key: LavagemStatus; title: string; short: string }[] = [
  { key: 'aguardando_lavagem', title: 'Aguardando', short: 'Aguardando' },
  { key: 'lavando', title: 'Lavando', short: 'Lavando' },
  { key: 'lavagem_concluida', title: 'Pronto', short: 'Pronto' },
  { key: 'ocorrencia', title: 'Ocorrência', short: 'Ocorrência' },
  { key: 'retirado', title: 'Retirado', short: 'Retirado' },
]

type FilterKey = 'todos' | LavagemStatus

interface LavagensViewProps {
  lavagens: LavagemComDetalhes[]
}

export function LavagensView({ lavagens }: LavagensViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterKey>('todos')
  const [dragId, setDragId] = useState<string | null>(null)
  const [hoverCol, setHoverCol] = useState<LavagemStatus | null>(null)
  const [selectedLavagem, setSelectedLavagem] = useState<LavagemComDetalhes | null>(null)
  const [ocorrenciaLavagemId, setOcorrenciaLavagemId] = useState<string | null>(null)
  const [whatsappState, setWhatsappState] = useState<{ lavagem: LavagemComDetalhes; tipo: string } | null>(null)
  const [loja, setLoja] = useState<ConfigLoja | null>(null)

  // Fetch config loja once
  useEffect(() => {
    createClient()
      .from('configuracoes_loja')
      .select('*')
      .single()
      .then(({ data }) => {
        if (data) setLoja(data as ConfigLoja)
      })
  }, [])

  /* ============ Client-side search filter ============ */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return lavagens
    return lavagens.filter((l) => {
      return (
        l.cliente.nome.toLowerCase().includes(q) ||
        l.veiculo.placa.toLowerCase().includes(q) ||
        l.veiculo.modelo?.toLowerCase().includes(q)
      )
    })
  }, [search, lavagens])

  const byStatus = useCallback(
    (key: LavagemStatus) => filtered.filter((l) => l.status_atual === key),
    [filtered],
  )

  const counts = useMemo(() => {
    const c: Record<string, number> = { todos: filtered.length }
    COLS.forEach((col) => {
      c[col.key] = byStatus(col.key).length
    })
    return c
  }, [filtered, byStatus])

  /* ============ WhatsApp callback ============ */
  const handleWhatsApp = useCallback(
    (lav: LavagemComDetalhes, tipo: string) => {
      setWhatsappState({ lavagem: lav, tipo })
    },
    [],
  )

  /* ============ Status change handler ============ */
  const handleStatusChange = useCallback(
    (lavagemId: string, novoStatus: LavagemStatus) => {
      startTransition(async () => {
        const result = await mudarStatus(lavagemId, novoStatus)
        if (result.error) {
          console.error('Erro ao mudar status:', result.error)
          return
        }
        router.refresh()
        // Open WhatsApp modal after status change
        const lav = lavagens.find((l) => l.id === lavagemId)
        if (lav) {
          const updatedLav = { ...lav, status_atual: novoStatus }
          setWhatsappState({ lavagem: updatedLav as LavagemComDetalhes, tipo: tipoMsgParaStatus(novoStatus) })
        }
      })
    },
    [router, lavagens],
  )

  /* ============ Drag & drop ============ */
  const handleDrop = useCallback(
    (colKey: LavagemStatus, e: React.DragEvent) => {
      e.preventDefault()
      setHoverCol(null)
      setDragId(null)

      const lavagemId = e.dataTransfer.getData('text/plain')
      if (!lavagemId) return

      const lav = lavagens.find((l) => l.id === lavagemId)
      if (!lav || lav.status_atual === colKey) return

      const transitions = STATUS_TRANSITIONS[lav.status_atual as LavagemStatus] ?? []
      if (!transitions.includes(colKey)) return

      if (colKey === 'ocorrencia') {
        setOcorrenciaLavagemId(lavagemId)
        return
      }

      handleStatusChange(lavagemId, colKey)
    },
    [lavagens, handleStatusChange],
  )

  /* ============ Visible columns ============ */
  const visibleCols = filter === 'todos' ? COLS : COLS.filter((c) => c.key === filter)

  /* ============ Render column ============ */
  const renderCol = (col: (typeof COLS)[number]) => {
    const items = byStatus(col.key)
    const meta = STATUS_META[col.key]

    return (
      <div
        key={col.key}
        className={cn(
          'flex min-h-[60vh] flex-col gap-2.5 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-3',
          hoverCol === col.key &&
            'border-[var(--brand)] bg-[color-mix(in_oklab,var(--brand)_8%,var(--surface-2))]',
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setHoverCol(col.key)
        }}
        onDragLeave={() => setHoverCol((prev) => (prev === col.key ? null : prev))}
        onDrop={(e) => handleDrop(col.key, e)}
      >
        {/* Column header */}
        <div className="flex items-center gap-2 px-1 pb-1.5 pt-0.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: meta.color }}
          />
          <h3 className="text-sm font-semibold">{col.title}</h3>
          <span className="inline-grid min-w-[22px] place-items-center rounded-full bg-[var(--bg-2)] px-2 py-0.5 font-mono text-xs font-bold text-[var(--ink-2)]">
            {items.length}
          </span>
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div className="text-center text-xs text-[var(--muted)]" style={{ padding: '14px 6px' }}>
            {filter === 'todos' ? 'Vazio' : 'Nenhuma lavagem aqui agora'}
          </div>
        )}

        {/* Cards */}
        {items.map((l) => (
          <LavagemCard
            key={l.id}
            lavagem={l}
            onStatusChange={handleStatusChange}
            onOpen={(lav) => setSelectedLavagem(lav)}
            onOcorrencia={(id) => setOcorrenciaLavagemId(id)}
            onWhatsApp={(lav, tipo) => handleWhatsApp(lav, tipo)}
            isDragging={dragId === l.id}
            onDragStart={() => setDragId(l.id)}
            onDragEnd={() => setDragId(null)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn(isPending && 'pointer-events-none opacity-70')}>
      {/* Page head */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-[30px] font-bold leading-tight tracking-tight">
            Lavagens
          </h1>
          <p className="mt-1 hidden text-sm text-[var(--muted)] sm:block">
            Arrasta o card pra outra coluna ou toca pra ver detalhes.
          </p>
          <p className="mt-1 text-sm text-[var(--muted)] sm:hidden">
            Toca o card pra ver detalhes e mudar status.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-[var(--brand-ink)] shadow-[var(--shadow-sm)] transition-all hover:brightness-95 active:translate-y-px"
            onClick={() => console.log('Nova lavagem')}
          >
            <Plus size={16} />
            Nova lavagem
          </button>
        </div>
      </div>

      {/* Search pill */}
      <div className="mb-2.5 flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2">
        <Search size={16} className="text-[var(--muted)]" />
        <input
          className="flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
          placeholder="Buscar por placa, cliente ou modelo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filter chips */}
      <div className="mb-3.5 flex flex-nowrap gap-1.5 overflow-x-auto py-0.5 scrollbar-none max-sm:[&::-webkit-scrollbar]:hidden sm:flex-wrap">
        <FilterChip
          active={filter === 'todos'}
          onClick={() => setFilter('todos')}
          count={counts.todos}
        >
          Todos
        </FilterChip>
        {COLS.map((col) => (
          <FilterChip
            key={col.key}
            active={filter === col.key}
            onClick={() => setFilter(col.key)}
            color={STATUS_META[col.key].color}
            count={counts[col.key]}
          >
            {col.short}
          </FilterChip>
        ))}
      </div>

      {/* Kanban or single column */}
      {filter === 'todos' ? (
        <div className="overflow-x-auto pb-3">
          <div className="grid auto-cols-[86vw] grid-flow-col gap-3 min-[700px]:auto-cols-[320px] min-[1200px]:grid-flow-row min-[1200px]:grid-cols-5">
            {visibleCols.map(renderCol)}
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-[560px]">
          {visibleCols.map((col) => {
            const items = byStatus(col.key)
            const meta = STATUS_META[col.key]
            return (
              <div
                key={col.key}
                className={cn(
                  'flex flex-col gap-2.5 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-3',
                  hoverCol === col.key &&
                    'border-[var(--brand)] bg-[color-mix(in_oklab,var(--brand)_8%,var(--surface-2))]',
                )}
                onDragOver={(e) => {
                  e.preventDefault()
                  setHoverCol(col.key)
                }}
                onDragLeave={() => setHoverCol((prev) => (prev === col.key ? null : prev))}
                onDrop={(e) => handleDrop(col.key, e)}
              >
                <div className="flex items-center gap-2 px-1 pb-1.5 pt-0.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} />
                  <h3 className="text-sm font-semibold">{col.title}</h3>
                  <span className="inline-grid min-w-[22px] place-items-center rounded-full bg-[var(--bg-2)] px-2 py-0.5 font-mono text-xs font-bold text-[var(--ink-2)]">
                    {items.length}
                  </span>
                </div>
                {items.length === 0 && (
                  <div className="py-3.5 px-1.5 text-center text-xs text-[var(--muted)]">
                    Nenhuma lavagem aqui agora
                  </div>
                )}
                {items.map((l) => (
                  <LavagemCard
                    key={l.id}
                    lavagem={l}
                    onStatusChange={handleStatusChange}
                    onOpen={(lav) => setSelectedLavagem(lav)}
                    onOcorrencia={(id) => setOcorrenciaLavagemId(id)}
                    onWhatsApp={(lav, tipo) => handleWhatsApp(lav, tipo)}
                    isDragging={dragId === l.id}
                    onDragStart={() => setDragId(l.id)}
                    onDragEnd={() => setDragId(null)}
                  />
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      {selectedLavagem && (
        <LavagemDetalheModal
          lavagem={selectedLavagem}
          onClose={() => setSelectedLavagem(null)}
          onOcorrencia={(id) => {
            setSelectedLavagem(null)
            setOcorrenciaLavagemId(id)
          }}
          onWhatsApp={(lav, tipo) => {
            setSelectedLavagem(null)
            handleWhatsApp(lav, tipo)
          }}
        />
      )}

      {ocorrenciaLavagemId && (
        <OcorrenciaModal
          lavagemId={ocorrenciaLavagemId}
          descricaoAtual={lavagens.find((l) => l.id === ocorrenciaLavagemId)?.ocorrencia_descricao || undefined}
          onClose={() => setOcorrenciaLavagemId(null)}
          onWhatsApp={() => {
            const lav = lavagens.find((l) => l.id === ocorrenciaLavagemId)
            if (lav) {
              setOcorrenciaLavagemId(null)
              handleWhatsApp(lav, 'ocorrencia')
            }
          }}
        />
      )}

      {whatsappState && (
        <WhatsAppModal
          lavagem={whatsappState.lavagem}
          tipo={whatsappState.tipo}
          loja={loja}
          onClose={() => setWhatsappState(null)}
        />
      )}
    </div>
  )
}

/* ============ FilterChip component ============ */

interface FilterChipProps {
  active: boolean
  onClick: () => void
  count: number
  color?: string
  children: React.ReactNode
}

function FilterChip({ active, onClick, count, color, children }: FilterChipProps) {
  return (
    <button
      className={cn(
        'inline-flex h-9 flex-none cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border px-3 text-[13px] font-medium transition-all',
        active
          ? 'border-[var(--brand)] bg-[var(--brand)] text-[var(--brand-ink)]'
          : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] hover:border-[var(--brand)]',
      )}
      onClick={onClick}
    >
      {color && (
        <span
          className="h-2 w-2 rounded-full"
          style={
            active
              ? { background: 'var(--brand-ink)', opacity: 0.8 }
              : { background: color }
          }
        />
      )}
      <span>{children}</span>
      <span
        className={cn(
          'inline-grid min-w-[22px] place-items-center rounded-full px-1.5 py-0 font-mono text-[11px] font-bold',
          active
            ? 'bg-[color-mix(in_oklab,var(--brand-ink)_22%,transparent)] text-[var(--brand-ink)]'
            : 'bg-[var(--bg-2)] text-[var(--ink-2)]',
        )}
      >
        {count}
      </span>
    </button>
  )
}
