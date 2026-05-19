import { redirect } from 'next/navigation'
import { Droplet, Phone, MapPin, MessageCircle } from 'lucide-react'

import { getLavagemPorToken } from '@/server/queries/publicas'
import { getConfigLoja } from '@/server/queries/config'
import { STATUS_META, type LavagemStatus } from '@/lib/constants'
import { waLink, onlyDigits } from '@/lib/whatsapp'
import { moneyBR } from '@/components/money'
import { PlacaTag } from '@/components/placa-tag'
import { Timeline } from '@/components/timeline'

export default async function AcompanhamentoPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const [lavagem, loja] = await Promise.all([
    getLavagemPorToken(token),
    getConfigLoja(),
  ])

  if (!lavagem || !lavagem.ativa || lavagem.status_atual === 'retirado') {
    redirect('/?lavagem=encerrada')
  }

  const meta = STATUS_META[lavagem.status_atual as LavagemStatus]
  const IconStatus = meta.icon
  const primeiroNome = (lavagem.cliente?.nome ?? '').split(' ')[0]

  const whatsHref = loja?.whatsapp
    ? waLink(
        loja.whatsapp,
        `Oi! Sou o(a) ${lavagem.cliente?.nome}, queria falar sobre meu carro ${lavagem.veiculo?.placa}.`,
      )
    : '#'
  const telHref = loja?.telefone ? `tel:${onlyDigits(loja.telefone)}` : '#'
  const mapsHref = loja?.maps_url ?? '#'

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg)] pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-[18px] pt-[18px]">
        <div className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-brand font-heading text-lg font-extrabold text-brand-ink">
          {(loja?.nome_loja ?? 'L')[0]}
        </div>
        <div>
          <div className="font-heading text-[16px] font-bold tracking-[-0.02em]">
            {loja?.nome_loja ?? 'Lava Rapido'}
          </div>
          <div className="text-[11px] text-[var(--muted-color)]">
            Acompanhamento ao vivo
          </div>
        </div>
      </div>

      {/* Hero Card */}
      <div className="mx-[18px] mt-4 flex flex-col gap-3.5 rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-[18px] shadow-[var(--shadow)]">
        {/* Saudacao */}
        <div>
          <div className="text-[13px] text-[var(--muted-color)]">
            Fala, {primeiroNome}!
          </div>
          <div className="font-heading text-[30px] font-bold leading-[1.05] tracking-[-0.02em]">
            A gente ta cuidando do seu carro 🚗
          </div>
        </div>

        {/* Veiculo */}
        <div className="flex flex-wrap items-center gap-3">
          <PlacaTag placa={lavagem.veiculo?.placa ?? ''} size="big" />
          <div>
            <div className="font-semibold">{lavagem.veiculo?.modelo}</div>
            <div className="text-[12px] text-[var(--muted-color)]">
              {lavagem.veiculo?.cor}
            </div>
          </div>
        </div>

        {/* Servico tag */}
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-2)] px-3 py-1.5 text-[13px] font-semibold">
            <Droplet size={12} /> {lavagem.servico?.nome} &middot;{' '}
            {moneyBR(lavagem.valor)}
          </span>
        </div>

        {/* Status atual — banner gradiente */}
        <div
          className="relative flex items-center gap-4 rounded-[18px] p-[18px] text-[var(--brand-ink)]"
          style={{
            background:
              'linear-gradient(135deg, var(--brand) 0%, color-mix(in oklab, var(--brand) 80%, var(--yellow)) 100%)',
          }}
        >
          <div className="relative grid h-16 w-16 flex-none place-items-center rounded-[18px] bg-white/[.18]">
            {/* pulse ring */}
            <span
              className="absolute -inset-1.5 rounded-[22px] border-2 border-white/35 animate-[pulse-ring_1.8s_ease-out_infinite]"
              aria-hidden
            />
            <IconStatus size={32} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] uppercase tracking-[0.08em] opacity-80">
              Status agora
            </div>
            <div className="font-heading text-[24px] font-bold leading-[1.1]">
              {meta.label}
            </div>
            {lavagem.status_atual === 'ocorrencia' &&
              lavagem.ocorrencia_descricao && (
                <div className="mt-1.5 text-[13px] opacity-[0.92]">
                  {lavagem.ocorrencia_descricao}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Linha do tempo */}
      <div className="px-[18px] pt-1 pb-[18px]">
        <h3 className="mb-2.5 text-[18px] font-bold">Linha do tempo</h3>
        <Timeline eventos={lavagem.eventos} animateLast />
      </div>

      {/* CTAs */}
      <div className="px-[18px]">
        <h3 className="mb-2.5 text-[18px] font-bold">
          Precisa falar com a gente?
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <a
            href={whatsHref}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-1 rounded-[14px] bg-[#25D366] px-2.5 py-3.5 text-[13px] font-semibold text-white"
          >
            <MessageCircle size={22} /> WhatsApp
          </a>
          <a
            href={telHref}
            className="flex flex-col items-center gap-1 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-2.5 py-3.5 text-[13px] font-semibold text-[var(--ink)]"
          >
            <Phone size={22} /> Ligar
          </a>
          <a
            href={mapsHref}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-1 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] px-2.5 py-3.5 text-[13px] font-semibold text-[var(--ink)]"
          >
            <MapPin size={22} /> Como chegar
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pt-[22px] pb-9 text-center text-[12px] text-[var(--muted-color)]">
        Link unico e temporario &middot; expira quando a lavagem e finalizada
      </div>
    </div>
  )
}
