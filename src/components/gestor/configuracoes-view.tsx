'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Check,
  Sun,
  Moon,
  Droplet,
  Car,
  Clock,
  AlertTriangle,
  Key,
  Upload,
  ExternalLink,
  RotateCcw,
} from 'lucide-react'
import type { ConfigLoja } from '@/lib/types'
import { DEFAULT_TEMPLATES } from '@/lib/constants'
import { fillTemplate, waHeader, waFooter } from '@/lib/whatsapp'
import { atualizarConfigLoja, atualizarAparencia, uploadLogo } from '@/server/actions/config'
import { PlacaTag } from '@/components/placa-tag'
import { cn } from '@/lib/utils'

/* ============================================================
   Constantes
   ============================================================ */
const PRESET_CORES = [
  '#FF6B47',
  '#FF3D71',
  '#FFC93B',
  '#11A37F',
  '#2A6FDB',
  '#7A5AE0',
  '#1A1413',
]

const ETAPAS = [
  { key: 'entrada', label: 'Entrada', icon: Car, desc: 'Quando o carro chega', vars: ['placa', 'servico'] },
  { key: 'lavando', label: 'Lavando', icon: Droplet, desc: 'Lavagem iniciou', vars: ['placa', 'servico'] },
  { key: 'concluida', label: 'Pronto', icon: Check, desc: 'Lavagem concluida', vars: ['placa'] },
  { key: 'retirado', label: 'Retirado', icon: Key, desc: 'Cliente levou o carro', vars: [] as string[] },
  { key: 'ocorrencia', label: 'Ocorrencia', icon: AlertTriangle, desc: 'Algo precisa de atencao', vars: ['placa', 'descricao'] },
  { key: 'aguardando', label: 'Pra fila', icon: Clock, desc: 'Voltou pra aguardando', vars: ['placa'] },
] as const

/* ============================================================
   ThemeOption
   ============================================================ */
function ThemeOption({
  active,
  onClick,
  variant,
}: {
  active: boolean
  onClick: () => void
  variant: 'claro' | 'escuro'
}) {
  const isDark = variant === 'escuro'
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-1 items-center gap-3 rounded-[14px] border px-3.5 py-3 transition-all min-w-[180px]',
        active
          ? 'border-2 border-[var(--brand)] bg-[color-mix(in_oklab,var(--brand)_8%,var(--surface))]'
          : 'border-[var(--line)] bg-[var(--surface)]',
      )}
    >
      <div
        className="relative flex-none overflow-hidden rounded-[10px] border"
        style={{
          width: 56,
          height: 40,
          background: isDark ? '#1A1816' : '#FFF6E8',
          borderColor: isDark ? '#2A2521' : '#EFE4D2',
        }}
      >
        <div
          className="absolute left-1.5 top-1.5 h-1 w-4 rounded-sm"
          style={{ background: isDark ? '#FFF8EE' : '#1A1413' }}
        />
        <div className="absolute left-1.5 top-3.5 h-[3px] w-7 rounded-sm bg-[#8A7D78]" />
        <div className="absolute bottom-1.5 right-1.5 h-2.5 w-2.5 rounded bg-[var(--brand)]" />
      </div>
      <div className="text-left">
        <div className="flex items-center gap-1 text-sm font-semibold">
          {isDark ? <Moon size={14} /> : <Sun size={14} />}
          {isDark ? 'Escuro' : 'Claro'}
        </div>
        <div className="text-xs text-[var(--muted-foreground)]">
          {isDark ? 'Pra trabalhar a noite' : 'Padrao de dia'}
        </div>
      </div>
    </button>
  )
}

/* ============================================================
   ConfiguracoesView
   ============================================================ */
interface Props {
  config: ConfigLoja | null
}

export function ConfiguracoesView({ config }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // --- form state ---
  const [nomeLoja, setNomeLoja] = useState(config?.nome_loja ?? '')
  const [descricao, setDescricao] = useState(config?.descricao ?? '')
  const [telefone, setTelefone] = useState(config?.telefone ?? '')
  const [whatsapp, setWhatsapp] = useState(config?.whatsapp ?? '')
  const [enderecoTexto, setEnderecoTexto] = useState(config?.endereco_texto ?? '')
  const [mapsUrl, setMapsUrl] = useState(config?.maps_url ?? '')
  const [horarioFuncionamento, setHorarioFuncionamento] = useState(config?.horario_funcionamento ?? '')
  const [instagramUrl, setInstagramUrl] = useState(config?.instagram_url ?? '')
  const [mensagemWhatsappPadrao, setMensagemWhatsappPadrao] = useState(config?.mensagem_whatsapp_padrao ?? '')
  const [mensagensEtapas, setMensagensEtapas] = useState<Record<string, string>>(config?.mensagens_etapas ?? {})
  const [logoUrl, setLogoUrl] = useState(config?.logo_url ?? '')

  // --- aparencia state ---
  const [tema, setTema] = useState<'claro' | 'escuro'>(config?.tema ?? 'claro')
  const [corPrimaria, setCorPrimaria] = useState(config?.cor_primaria ?? '#FF6B47')
  const [hexInput, setHexInput] = useState(corPrimaria)
  const [hexFocused, setHexFocused] = useState(false)

  // --- mensagens tab ---
  const [etapaTab, setEtapaTab] = useState('entrada')

  // Aplica tema em tempo real
  useEffect(() => {
    if (tema === 'escuro') {
      document.documentElement.setAttribute('data-theme', 'dark')
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      document.documentElement.classList.remove('dark')
    }
  }, [tema])

  // Aplica cor em tempo real
  useEffect(() => {
    document.documentElement.style.setProperty('--brand', corPrimaria)
    document.documentElement.style.setProperty('--primary', corPrimaria)
    const h = corPrimaria.replace('#', '')
    if (h.length === 6) {
      const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
      const brandInk = lum > 0.6 ? '#1A1413' : '#FFFFFF'
      document.documentElement.style.setProperty('--brand-ink', brandInk)
      document.documentElement.style.setProperty('--primary-foreground', brandInk)
    }
  }, [corPrimaria])

  // Salva aparencia no server ao mudar
  const salvarAparencia = (t: 'claro' | 'escuro', c: string) => {
    startTransition(async () => {
      await atualizarAparencia({ tema: t, cor_primaria: c })
    })
  }

  const handleTema = (t: 'claro' | 'escuro') => {
    setTema(t)
    salvarAparencia(t, corPrimaria)
  }

  const handleCor = (c: string) => {
    setCorPrimaria(c)
    salvarAparencia(tema, c)
  }

  const aplicaHex = (val: string) => {
    const v2 = val.startsWith('#') ? val : '#' + val
    if (/^#[0-9A-Fa-f]{6}$/.test(v2)) {
      handleCor(v2)
      setHexInput(v2)
    }
  }

  // Hex display: show input value when focused, otherwise corPrimaria
  const hexDisplay = hexFocused ? hexInput : corPrimaria

  // Upload logo
  const handleUploadLogo = async (file: File) => {
    const fd = new FormData()
    fd.append('logo', file)
    const result = await uploadLogo(fd)
    if (result.data) {
      setLogoUrl(result.data)
      router.refresh()
    }
  }

  // Salvar config geral
  const handleSalvar = () => {
    startTransition(async () => {
      const result = await atualizarConfigLoja({
        nome_loja: nomeLoja,
        descricao,
        telefone,
        whatsapp,
        endereco_texto: enderecoTexto,
        maps_url: mapsUrl,
        horario_funcionamento: horarioFuncionamento,
        instagram_url: instagramUrl,
        mensagem_whatsapp_padrao: mensagemWhatsappPadrao,
        mensagens_etapas: mensagensEtapas,
      })
      if (!result.error) {
        setSaved(true)
        setTimeout(() => setSaved(false), 1600)
        router.refresh()
      }
    })
  }

  // --- mensagens helpers ---
  const etapa = ETAPAS.find((e) => e.key === etapaTab)!
  const tmpl = mensagensEtapas[etapaTab] ?? DEFAULT_TEMPLATES[etapaTab] ?? ''

  const setTmpl = (texto: string) => {
    setMensagensEtapas({ ...mensagensEtapas, [etapaTab]: texto })
  }

  const resetarTmpl = () => {
    setTmpl(DEFAULT_TEMPLATES[etapaTab] || '')
  }

  const insertVar = (name: string) => {
    const tag = `{{${name}}}`
    setTmpl((tmpl || '') + (tmpl && !tmpl.endsWith(' ') && !tmpl.endsWith('\n') ? ' ' : '') + tag)
  }

  // Preview
  const previewVars = {
    nome: 'Marcelo',
    placa: 'RXY3A47',
    servico: 'Lavagem completa',
    lojaNome: nomeLoja || 'sua loja',
    link: 'https://seudominio.com/a/lr_demo123',
    descricao: 'Cliente esqueceu de deixar a chave reserva',
  }
  const bodyPreview = fillTemplate(tmpl, previewVars)
  const headerPreview = waHeader(previewVars.nome)
  const includeLink = etapaTab !== 'retirado'
  const footerPreview = waFooter(previewVars.lojaNome, includeLink ? previewVars.link : undefined)
  const fullPreview = `${headerPreview}\n\n${bodyPreview}\n\n${footerPreview}`

  // Classes reutilizaveis
  const inputCls =
    'w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 text-[15px] text-[var(--ink)] outline-none transition-all focus:border-[var(--brand)] focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand)_22%,transparent)] placeholder:text-[var(--muted-foreground)]'
  const textareaCls = inputCls + ' resize-y min-h-[88px]'
  const labelCls = 'text-[13px] font-medium text-[var(--ink-2)]'
  const sectionLabelCls = 'text-xs font-medium uppercase tracking-[.06em] text-[var(--muted-foreground)]'

  return (
    <div>
      {/* Page head */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-[30px] font-bold leading-tight tracking-tight">
            Configuracoes da loja
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Tudo o que aparece pro cliente na vitrine publica e nos avisos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSalvar}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-[var(--brand-ink)] shadow-[var(--shadow-sm)] transition-all hover:brightness-95 active:translate-y-px disabled:opacity-50"
          >
            <Check size={16} />
            {saved ? 'Salvo!' : 'Salvar alteracoes'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4" style={{ maxWidth: 720 }}>
        {/* ============================================================
           CARD: Aparencia
           ============================================================ */}
        <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-[18px]">
          <div>
            <h3 className="font-heading text-[19px] font-bold tracking-tight">Aparencia</h3>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Tema do app e a cor da sua marca — usadas em botoes, destaques e na vitrine publica.
            </p>
          </div>

          {/* Tema */}
          <div className="flex flex-col gap-2">
            <span className={sectionLabelCls}>Tema</span>
            <div className="flex flex-wrap gap-2.5">
              <ThemeOption active={tema === 'claro'} onClick={() => handleTema('claro')} variant="claro" />
              <ThemeOption active={tema === 'escuro'} onClick={() => handleTema('escuro')} variant="escuro" />
            </div>
          </div>

          {/* Cor da marca */}
          <div className="flex flex-col gap-2">
            <span className={sectionLabelCls}>Cor da marca</span>
            <div className="flex flex-wrap gap-2">
              {PRESET_CORES.map((c) => (
                <button
                  key={c}
                  type="button"
                  title={c}
                  onClick={() => handleCor(c)}
                  className="h-9 w-9 rounded-xl transition-shadow"
                  style={{
                    background: c,
                    border:
                      corPrimaria.toLowerCase() === c.toLowerCase()
                        ? '3px solid var(--ink)'
                        : '1px solid var(--line)',
                    boxShadow:
                      corPrimaria.toLowerCase() === c.toLowerCase()
                        ? '0 0 0 2px var(--bg)'
                        : 'none',
                  }}
                />
              ))}
              {/* Color picker */}
              <label
                title="Escolher uma cor customizada"
                className="relative grid h-9 w-9 cursor-pointer place-items-center overflow-hidden rounded-xl border border-[var(--line)]"
                style={{
                  background:
                    'conic-gradient(from 180deg, #FF6B47, #FFC93B, #11A37F, #2A6FDB, #7A5AE0, #FF3D71, #FF6B47)',
                }}
              >
                <input
                  type="color"
                  value={corPrimaria}
                  onChange={(e) => handleCor(e.target.value)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                <Droplet size={16} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,.5)]" />
              </label>
            </div>
            <div className="flex items-center gap-2.5">
              <div
                className="h-11 w-11 rounded-xl border border-[var(--line)]"
                style={{ background: corPrimaria }}
              />
              <input
                className={cn(inputCls, 'max-w-[140px] font-mono uppercase')}
                value={hexDisplay}
                onFocus={() => { setHexInput(corPrimaria); setHexFocused(true) }}
                onChange={(e) => setHexInput(e.target.value)}
                onBlur={() => { aplicaHex(hexInput); setHexFocused(false) }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    aplicaHex(hexInput)
                    ;(e.target as HTMLInputElement).blur()
                  }
                }}
                placeholder="#FF6B47"
              />
              <span className="text-xs text-[var(--muted-foreground)]">Cole o hex da sua marca aqui</span>
            </div>
          </div>

          {/* Preview */}
          <div className="flex flex-col gap-2">
            <span className={sectionLabelCls}>Preview</span>
            <div className="flex flex-wrap items-center gap-2.5 rounded-[14px] bg-[var(--bg-2)] p-3.5">
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-btn)] bg-[var(--brand)] px-4 text-sm font-semibold text-[var(--brand-ink)] shadow-[var(--shadow-sm)]"
              >
                Botao primario
              </button>
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-btn)] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--ink)]"
              >
                Secundario
              </button>
              <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
                style={{
                  background: 'color-mix(in oklab, var(--st-aguardando) 22%, transparent)',
                  color: '#8C6900',
                  borderColor: 'color-mix(in oklab, var(--st-aguardando) 50%, transparent)',
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-90" />
                Aguardando
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
                style={{
                  background: 'color-mix(in oklab, var(--st-lavando) 18%, transparent)',
                  color: '#1E5A85',
                  borderColor: 'color-mix(in oklab, var(--st-lavando) 40%, transparent)',
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-90" />
                Lavando
              </span>
              <PlacaTag placa="RXY3A47" />
            </div>
          </div>
        </div>

        {/* ============================================================
           CARD: Identidade
           ============================================================ */}
        <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-[18px]">
          <h3 className="font-heading text-[19px] font-bold tracking-tight">Identidade</h3>
          <div className="flex flex-wrap items-start gap-4">
            {/* Logo upload */}
            <div>
              <span className="mb-1.5 block text-xs text-[var(--muted-foreground)]">Logo</span>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative flex h-[132px] w-[132px] items-center justify-center overflow-hidden rounded-[20px] border-2 border-dashed border-[var(--line)] bg-[var(--bg-2)] text-[var(--muted-foreground)] transition-colors hover:border-[var(--brand)]"
              >
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Upload size={24} />
                    <span className="text-xs">Solte sua logo aqui</span>
                  </div>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file && file.size <= 2 * 1024 * 1024) {
                    handleUploadLogo(file)
                  }
                }}
              />
              <p className="mt-2 max-w-[132px] text-xs text-[var(--muted-foreground)]">
                PNG, JPG ou WEBP ate 2MB
              </p>
            </div>
            {/* Nome + Descricao */}
            <div className="flex min-w-[220px] flex-1 flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Nome da loja</label>
                <input className={inputCls} value={nomeLoja} onChange={(e) => setNomeLoja(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Descricao</label>
                <textarea className={textareaCls} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
           CARD: Contato e localizacao
           ============================================================ */}
        <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-[18px]">
          <h3 className="font-heading text-[19px] font-bold tracking-tight">Contato e localizacao</h3>
          <div className="flex flex-wrap gap-2.5">
            <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
              <label className={labelCls}>Telefone</label>
              <input className={cn(inputCls, 'font-mono')} value={telefone} onChange={(e) => setTelefone(e.target.value)} />
            </div>
            <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
              <label className={labelCls}>WhatsApp</label>
              <input className={cn(inputCls, 'font-mono')} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Endereco</label>
            <input className={inputCls} value={enderecoTexto} onChange={(e) => setEnderecoTexto(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Link Google Maps</label>
            <input
              className={inputCls}
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/?q=..."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Horario de funcionamento</label>
            <input className={inputCls} value={horarioFuncionamento} onChange={(e) => setHorarioFuncionamento(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Instagram (opcional)</label>
            <input
              className={inputCls}
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="@suamarca"
            />
          </div>
        </div>

        {/* ============================================================
           CARD: Mensagem da vitrine
           ============================================================ */}
        <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-[18px]">
          <h3 className="font-heading text-[19px] font-bold tracking-tight">Mensagem da vitrine</h3>
          <p className="text-xs text-[var(--muted-foreground)]">
            A primeira mensagem que abre quando o cliente clica em &quot;Falar no WhatsApp&quot; na vitrine publica.
          </p>
          <textarea
            className={textareaCls}
            value={mensagemWhatsappPadrao}
            onChange={(e) => setMensagemWhatsappPadrao(e.target.value)}
          />
        </div>

        {/* ============================================================
           CARD: Mensagens automaticas por etapa
           ============================================================ */}
        <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-[18px]">
          <div>
            <h3 className="font-heading text-[19px] font-bold tracking-tight">
              Mensagens automaticas por etapa
            </h3>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              A saudacao com o nome do cliente e o link de acompanhamento ficam fixos. Voce edita so o miolo de cada etapa.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {ETAPAS.map((e) => {
              const Icon = e.icon
              return (
                <button
                  key={e.key}
                  type="button"
                  onClick={() => setEtapaTab(e.key)}
                  className={cn(
                    'inline-flex h-[34px] items-center gap-1.5 rounded-[10px] border px-3 text-[13px] font-semibold transition-all',
                    etapaTab === e.key
                      ? 'border-transparent bg-[var(--brand)] text-[var(--brand-ink)] shadow-[var(--shadow-sm)]'
                      : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] hover:bg-[var(--bg-2)]',
                  )}
                >
                  <Icon size={14} />
                  {e.label}
                </button>
              )
            })}
          </div>

          {/* Header fixo */}
          <div className="flex flex-col gap-2">
            <span className={sectionLabelCls}>Saudacao (fixo)</span>
            <div className="rounded-xl bg-[var(--bg-2)] px-3.5 py-2.5 font-mono text-sm text-[var(--ink-2)]">
              Ola, <span className="font-bold text-[var(--brand)]">{'{nome_cliente}'}</span>! {'👋'}
            </div>
          </div>

          {/* Body editavel */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className={sectionLabelCls}>
                Mensagem da etapa <span className="text-[var(--brand)]">· {etapa.label}</span>
              </span>
              <button
                type="button"
                onClick={resetarTmpl}
                className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-medium text-[var(--ink-2)] transition-colors hover:bg-[var(--bg-2)]"
                title="Voltar ao padrao"
              >
                <RotateCcw size={12} />
                Resetar
              </button>
            </div>
            <textarea
              className={textareaCls}
              rows={4}
              value={tmpl}
              onChange={(e) => setTmpl(e.target.value)}
              placeholder="Escreva a mensagem dessa etapa..."
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-[var(--muted-foreground)]">Inserir:</span>
              {etapa.vars.map((varName) => (
                <button
                  key={varName}
                  type="button"
                  onClick={() => insertVar(varName)}
                  className="inline-flex h-7 items-center rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2 text-xs font-medium text-[var(--ink-2)] transition-colors hover:bg-[var(--bg-2)]"
                >
                  {`{{${varName}}}`}
                </button>
              ))}
            </div>
          </div>

          {/* Footer fixo */}
          <div className="flex flex-col gap-2">
            <span className={sectionLabelCls}>Assinatura (fixo)</span>
            <div className="rounded-xl bg-[var(--bg-2)] px-3.5 py-2.5 font-mono text-sm leading-relaxed text-[var(--ink-2)]">
              {includeLink && (
                <>
                  Acompanhe por aqui:
                  <br />
                  <span className="text-[var(--sky)]">{'{link_acompanhamento}'}</span>
                  <br />
                  <br />
                </>
              )}
              — Equipe <span className="font-bold text-[var(--brand)]">{'{nome_loja}'}</span>
            </div>
          </div>

          {/* Preview WhatsApp */}
          <div className="flex flex-col gap-2">
            <span className={sectionLabelCls}>Preview no WhatsApp</span>
            <div className="rounded-2xl bg-[#E5DDD5] p-3.5" style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath fill='%23000' fill-opacity='0.03' d='M20 0c11 0 20 9 20 20s-9 20-20 20S0 31 0 20 9 0 20 0z'/%3E%3C/svg%3E\")",
            }}>
              <div className="relative ml-auto max-w-[92%] whitespace-pre-wrap rounded-lg rounded-tr-none bg-[#DCF8C6] px-3 pb-6 pt-2.5 text-sm leading-relaxed text-[#1F2937] shadow-[0_1px_0.5px_rgba(11,20,26,.13)]">
                <div className="absolute -right-2 top-0 h-0 w-0 border-l-0 border-r-[8px] border-t-[8px] border-r-transparent border-t-[#DCF8C6]" />
                {fullPreview}
                <span className="absolute bottom-1 right-2.5 text-[11px] text-[#667781]">
                  {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  <span className="text-[#4FC3F7]"> {'✓✓'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
           Footer actions
           ============================================================ */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSalvar}
            disabled={isPending}
            className="inline-flex h-[52px] items-center gap-2 rounded-[14px] bg-[var(--brand)] px-5 text-base font-semibold text-[var(--brand-ink)] shadow-[var(--shadow-sm)] transition-all hover:brightness-95 active:translate-y-px disabled:opacity-50"
          >
            <Check size={16} />
            {saved ? 'Salvo com sucesso!' : 'Salvar alteracoes'}
          </button>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-[52px] items-center gap-2 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-5 text-base font-semibold text-[var(--ink)] transition-all hover:bg-[var(--bg-2)]"
          >
            <ExternalLink size={16} />
            Ver vitrine
          </a>
        </div>
      </div>
    </div>
  )
}
