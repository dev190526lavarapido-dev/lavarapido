# (public)/page.tsx

## VitrinePage

RECEBE: searchParams (Promise<{ lavagem?: string }>)

ESTADO derivado
  params = await searchParams
  encerrada = params.lavagem === "encerrada"

BUSCA paralela (Promise.all)
  config = getConfigLojaPublica() → ver [server/queries/config.md](../server/queries/config.md) → BD [banco_de_dados.md](../banco_de_dados.md) → config_loja
  servicos = getServicosPublicos() → ver [server/queries/publicas.md](../server/queries/publicas.md) → BD [banco_de_dados.md](../banco_de_dados.md) → servicos

SE config == null FACA
  RENDERIZA
    div pub-shell items-center justify-center
      Droplets size=48 muted
      h1 "Nenhuma loja configurada"
      p aviso para dono acessar painel
      Link href="/login" icone Key "Acessar painel"

whatsHref = waLink(config.whatsapp, config.mensagem_whatsapp_padrao)
telHref = "tel:" + onlyDigits(config.telefone)

RENDERIZA
  div pub-shell
    HEADER pub-header
      div flex items-center gap-3
        LogoOrInitial config=config
        div
          div font-display font-700 18px tracking -0.02em → config.nome_loja
          div text-xs muted → config.horario_funcionamento
      Link href="/login" hidden md:inline-flex icone Key "Sou da equipe"

    SE encerrada FACA
      div pub-banner-encerrada
        icone Info size=14
        "Essa lavagem ja foi encerrada. Olha embaixo os servicos que a gente tem disponivel ;)"

    SECTION pub-hero
      div nome-loja → config.nome_loja
      div desc → config.descricao
      div pub-cta-row
        a href=whatsHref target=_blank classe "pub-cta whats" → MessageCircle size=22 "WhatsApp"
        a href=telHref classe "pub-cta" → Phone size=22 "Ligar"
        SE config.maps_url FACA
          a href=config.maps_url target=_blank classe "pub-cta" → MapPin size=22 "Como chegar"

    SE servicos.length > 0 FACA
      SECTION pub-section
        h2 "Nossos servicos"
        div pub-svc-grid
          PARA CADA servico
            div pub-svc key=s.id
              div
                div nome → s.nome
                div desc → s.descricao
                SE s.tempo_estimado_minutos FACA
                  div meta mt-2 → Clock size=12 "~{s.tempo_estimado_minutos} min"
              div preco → moneyBR(s.valor)

    SECTION pub-section
      h2 "A gente fica aqui"
      div pub-info
        info-card MapPin size=20 label="Endereco" value=config.endereco_texto
        info-card Clock size=20 label="Horario" value=config.horario_funcionamento
        info-card Phone size=20 label="Telefone" value=config.telefone (font-mono)
        SE config.instagram_url FACA
          info-card AtSign size=20 label="Instagram" value=config.instagram_url

    FOOTER pub-foot
      "Feito com 💧 e muita espuma · {config.nome_loja}"

---

## LogoOrInitial

RECEBE: config (ConfigLoja)

SE config.logo_url FACA
  img src=config.logo_url alt=config.nome_loja 56x56 rounded-[14px] object-cover
SENAO FACA
  div 56x56 rounded-[14px] bg-brand text-brand-ink font-display font-800 22px
    config.nome_loja.charAt(0)
