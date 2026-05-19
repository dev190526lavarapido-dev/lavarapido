'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Droplet, Pencil, Plus, X } from 'lucide-react'
import type { ServicoLavagem } from '@/lib/types'
import { criarServico, atualizarServico, toggleServico } from '@/server/actions/servicos'
import { moneyBR } from '@/components/money'
import { cn } from '@/lib/utils'

/* ============================================================
   Toggle estilizado (sem pacote extra)
   ============================================================ */
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-[26px] w-[46px] flex-none cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
        checked ? 'bg-[var(--brand)]' : 'bg-[var(--line,#E0D5CE)]',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200',
          checked ? 'translate-x-[22px]' : 'translate-x-[2px]',
        )}
      />
    </button>
  )
}

/* ============================================================
   Modal de Serviço
   ============================================================ */
interface ServicoModalProps {
  servico: ServicoLavagem | null
  onClose: () => void
  onSaved: () => void
}

function ServicoModal({ servico, onClose, onSaved }: ServicoModalProps) {
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    nome: servico?.nome ?? '',
    descricao: servico?.descricao ?? '',
    valor: servico?.valor != null ? String(servico.valor) : '',
    tempo_estimado_minutos: servico?.tempo_estimado_minutos != null
      ? String(servico.tempo_estimado_minutos)
      : '',
    ativo: servico ? servico.ativo : true,
  })
  const [error, setError] = useState<string | null>(null)

  const ok = form.nome.trim().length >= 2 && Number(form.valor) > 0

  const handleSalvar = () => {
    if (!ok) return
    startTransition(async () => {
      const payload = {
        nome: form.nome.trim(),
        descricao: form.descricao.trim(),
        valor: Number(form.valor),
        tempo_estimado_minutos: form.tempo_estimado_minutos
          ? Number(form.tempo_estimado_minutos)
          : null,
        ativo: form.ativo,
      }

      const result = servico
        ? await atualizarServico(servico.id, payload)
        : await criarServico(payload)

      if (result.error) {
        setError(result.error)
        return
      }
      onSaved()
      onClose()
    })
  }

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-end sm:place-items-center bg-black/45 animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-[520px] max-h-[92dvh] overflow-auto rounded-t-[22px] sm:rounded-[22px] bg-[var(--surface)] p-[18px] pb-[22px] shadow-[var(--shadow-lg)] animate-in slide-in-from-bottom-5 duration-250">
        {/* Grab bar mobile */}
        <div className="mx-auto mb-2.5 h-1 w-10 rounded-full bg-[var(--line)] sm:hidden" />

        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-heading text-[22px] font-bold tracking-tight">
            {servico ? 'Editar serviço' : 'Novo serviço'}
          </h2>
          <button
            className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] transition-colors hover:bg-[var(--bg-2)]"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-3">
          {/* Nome */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[var(--ink)]">Nome</label>
            <input
              autoFocus
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-[15px] text-[var(--ink)] outline-none transition-all focus:border-[var(--brand)] focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand)_22%,transparent)] placeholder:text-[var(--muted-foreground)]"
              placeholder="Ex: Lavagem com cera"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
          </div>

          {/* Descrição */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[var(--ink)]">Descrição</label>
            <textarea
              className="w-full resize-y rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-[15px] text-[var(--ink)] outline-none transition-all min-h-[80px] focus:border-[var(--brand)] focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand)_22%,transparent)] placeholder:text-[var(--muted-foreground)]"
              placeholder="Pra ajudar o cliente a entender..."
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
          </div>

          {/* Valor + Tempo lado a lado */}
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[var(--ink)]">Valor (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 font-mono text-[15px] text-[var(--ink)] outline-none transition-all focus:border-[var(--brand)] focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand)_22%,transparent)] placeholder:text-[var(--muted-foreground)]"
                placeholder="45"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[var(--ink)]">Tempo estimado (min)</label>
              <input
                type="number"
                min="0"
                step="1"
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 font-mono text-[15px] text-[var(--ink)] outline-none transition-all focus:border-[var(--brand)] focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand)_22%,transparent)] placeholder:text-[var(--muted-foreground)]"
                placeholder="60"
                value={form.tempo_estimado_minutos}
                onChange={(e) => setForm({ ...form, tempo_estimado_minutos: e.target.value })}
              />
            </div>
          </div>

          {/* Toggle ativo */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-3">
            <span className="text-[13px] text-[var(--muted-foreground)]">
              Ativo (aparece na vitrine)
            </span>
            <Toggle checked={form.ativo} onChange={() => setForm({ ...form, ativo: !form.ativo })} />
          </div>

          {/* Error */}
          {error && (
            <p className="text-[13px] text-red-500">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between gap-2">
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-btn)] px-4 text-sm font-semibold text-[var(--ink-2)] transition-all hover:bg-[var(--bg-2)]"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            disabled={!ok || isPending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-btn)] bg-[var(--brand)] px-5 text-sm font-semibold text-[var(--brand-ink)] shadow-[var(--shadow-sm)] transition-all hover:brightness-95 active:translate-y-px disabled:pointer-events-none disabled:opacity-50"
            onClick={handleSalvar}
          >
            {isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   Catálogo View
   ============================================================ */
interface CatalogoViewProps {
  servicos: ServicoLavagem[]
}

export function CatalogoView({ servicos }: CatalogoViewProps) {
  const router = useRouter()
  const [editing, setEditing] = useState<ServicoLavagem | 'new' | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const handleToggle = async (id: string) => {
    setTogglingId(id)
    await toggleServico(id)
    setTogglingId(null)
    router.refresh()
  }

  const handleSaved = () => {
    router.refresh()
  }

  return (
    <div>
      {/* Page head */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-[30px] font-bold leading-tight tracking-tight">
            Catálogo
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Os serviços que aparecem na vitrine pública e em Nova Lavagem.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 self-start rounded-[var(--radius-btn)] bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-[var(--brand-ink)] shadow-[var(--shadow-sm)] transition-all hover:brightness-95 active:translate-y-px sm:self-auto"
          onClick={() => setEditing('new')}
        >
          <Plus size={16} />
          Novo serviço
        </button>
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-2">
        {servicos.length === 0 && (
          <p className="py-10 text-center text-sm text-[var(--muted-foreground)]">
            Nenhum serviço cadastrado. Clique em &quot;Novo serviço&quot; para começar.
          </p>
        )}
        {servicos.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-3.5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3.5 transition-opacity"
            style={{ opacity: s.ativo ? 1 : 0.6 }}
          >
            {/* Ícone */}
            <div
              className="flex-none"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'var(--bg-2)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--brand)',
              }}
            >
              <Droplet size={20} />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-[var(--ink)]">{s.nome}</span>
                {!s.ativo && (
                  <span className="inline-flex h-5 items-center rounded-full bg-[var(--line)] px-2 text-[11px] font-semibold text-[var(--muted-foreground)]">
                    Inativo
                  </span>
                )}
                {s.tempo_estimado_minutos && (
                  <span className="text-xs text-[var(--muted-foreground)]">
                    · ~{s.tempo_estimado_minutos} min
                  </span>
                )}
              </div>
              {s.descricao && (
                <p className="mt-0.5 truncate text-[13px] text-[var(--muted-foreground)]">
                  {s.descricao}
                </p>
              )}
            </div>

            {/* Ações */}
            <div className="flex flex-none items-center gap-2.5">
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 20,
                  color: 'var(--ink)',
                }}
              >
                {moneyBR(s.valor)}
              </span>
              <Toggle
                checked={s.ativo}
                onChange={() => {
                  if (!togglingId) handleToggle(s.id)
                }}
              />
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] transition-colors hover:bg-[var(--bg-2)]"
                onClick={() => setEditing(s)}
                title="Editar"
              >
                <Pencil size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {editing !== null && (
        <ServicoModal
          servico={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
