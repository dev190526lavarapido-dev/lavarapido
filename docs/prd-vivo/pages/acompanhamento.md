# (public)/a/[token]/page.tsx

## AcompanhamentoPage

RECEBE: params (Promise<{ token: string }>)

BUSCA paralela (Promise.all)
  lavagem = getLavagemPorToken(token) → ver [server/queries/publicas.md](../../server/queries/publicas.md) → BD [banco_de_dados.md](../../banco_de_dados.md) → lavagens
  loja = getConfigLoja() → ver [server/queries/config.md](../../server/queries/config.md) → BD [banco_de_dados.md](../../banco_de_dados.md) → config_loja

SE lavagem == null OU lavagem.ativa == false OU lavagem.status_atual == "retirado" FACA
  redirect("/?lavagem=encerrada")

meta = STATUS_META[lavagem.status_atual]
IconStatus = meta.icon
primeiroNome = lavagem.cliente?.nome.split(" ")[0]

whatsHref
  SE loja?.whatsapp FACA waLink(loja.whatsapp, "Oi! Sou o(a) {nome}, queria falar sobre meu carro {placa}.")
  SENAO "#"
telHref = loja?.telefone ? "tel:{onlyDigits(loja.telefone)}" : "#"
mapsHref = loja?.maps_url ?? "#"

RENDERIZA
  div flex min-h-dvh flex-col bg-[--bg] pb-6

    HEADER px-[18px] pt-[18px]
      div logo 44x44 rounded-xl bg-brand font-heading font-extrabold
        loja?.nome_loja[0] (fallback "L")
      div
        div font-heading 16px font-bold tracking-[-0.02em] → loja?.nome_loja (fallback "Lava Rapido")
        div 11px muted → "Acompanhamento ao vivo"

    HERO CARD mx-[18px] mt-4 rounded-[22px] border surface shadow

      SAUDACAO
        div 13px muted → "Fala, {primeiroNome}!"
        div font-heading 30px font-bold → "A gente ta cuidando do seu carro 🚗"

      VEICULO flex items-center gap-3
        PlacaTag placa=lavagem.veiculo?.placa size="big" → ver [components/shared/placa-tag.md](../../components/shared/placa-tag.md)
        div
          div font-semibold → lavagem.veiculo?.modelo
          div 12px muted → lavagem.veiculo?.cor

      SERVICO TAG inline-flex rounded-full bg-[--bg-2] px-3 py-1.5 13px font-semibold
        Droplet size=12
        "{lavagem.servico?.nome} · {moneyBR(lavagem.valor)}"

      STATUS BANNER gradient 135deg brand → brand/yellow rounded-[18px] p-[18px] text-brand-ink
        div h-16 w-16 rounded-[18px] bg-white/18 (+ pulse-ring animado border-2 white/35)
          IconStatus size=32
        div
          div 12px uppercase tracking-[0.08em] opacity-80 → "Status agora"
          div font-heading 24px font-bold → meta.label
          SE lavagem.status_atual == "ocorrencia" E lavagem.ocorrencia_descricao FACA
            div 13px opacity-0.92 → lavagem.ocorrencia_descricao

    LINHA DO TEMPO px-[18px] pt-1 pb-[18px]
      h3 18px font-bold "Linha do tempo"
      Timeline eventos=lavagem.eventos animateLast=true → ver [components/shared/timeline.md](../../components/shared/timeline.md)

    CTAs px-[18px]
      h3 18px font-bold "Precisa falar com a gente?"
      div grid grid-cols-3 gap-2
        a href=whatsHref target=_blank bg-[#25D366] text-white rounded-[14px] py-3.5
          MessageCircle size=22 "WhatsApp"
        a href=telHref border surface rounded-[14px] py-3.5
          Phone size=22 "Ligar"
        a href=mapsHref target=_blank border surface rounded-[14px] py-3.5
          MapPin size=22 "Como chegar"

    FOOTER px-4 pt-[22px] pb-9 text-center 12px muted
      "Link unico e temporario · expira quando a lavagem e finalizada"
