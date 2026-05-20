# lavagem-detalhe

## WhatsAppIcon

RENDERIZA
  SVG inline do icone WhatsApp (16x16)

---

## formatHM

RECEBE: dateStr (string)
RETORNA: horario formatado HH:MM em pt-BR

---

## LavagemDetalheModal

RECEBE: lavagem (LavagemComDetalhes | null), onClose (), onOcorrencia? (lavagemId, descricaoAtual), onWhatsApp? (lavagem, tipo)

ESTADO:
  isPending = false
  eventos = []
  loadingEventos = false
  copied = false
  showOcorrenciaInterna = false

SE lavagemId mudar FACA
  SE sem lavagemId FACA retornar
  cancelar fetch anterior (flag cancelled)
  marcar loadingEventos = true (via microtask)
  buscar → BD [banco_de_dados.md](../../banco_de_dados.md) → eventos_lavagem
    WHERE lavagem_id = lavagemId ORDER BY created_at ASC
  SE nao cancelado FACA setEventos(data) e setLoadingEventos(false)

handleStatusChange (novoStatus)
  SE sem lavagem FACA retornar
  chamar mudarStatus(lavagem.id, novoStatus) → ver [server/actions/lavagens.md](../../server/actions/lavagens.md)
  SE erro FACA logar e retornar
  router.refresh() e onClose()
  SE onWhatsApp fornecido FACA
    montar updatedLav = { ...lavagem, status_atual: novoStatus }
    chamar onWhatsApp(updatedLav, tipoMsgParaStatus(novoStatus))

handleCopy
  SE sem lavagem FACA retornar
  montar url = origin + /a/ + lavagem.token_publico
  copiar url para clipboard
  setCopied(true); apos 1500ms setCopied(false)

handleOpenOcorrencia
  SE sem lavagem FACA retornar
  SE onOcorrencia fornecido FACA chamar onOcorrencia(lavagem.id, ocorrencia_descricao)
  SENAO FACA setShowOcorrenciaInterna(true)

SE lavagem for null FACA retornar null

extrair: cliente, veiculo, servico, status, transitions = STATUS_TRANSITIONS[status]
montar pubUrl = origin + /a/ + token_publico

RENDERIZA
  overlay com click-fora fecha modal
  painel (max 520px, scroll, opacity 0.7 e pointer-events none se isPending)
    grab bar (so mobile)
    header: titulo "Lavagem · {veiculo.placa}" + botao fechar
    linha: → ver [status-badge.md](../shared/status-badge.md) + horario de entrada (formatHM)
    info principal:
      → ver [placa-tag.md](../shared/placa-tag.md) (size=big)
      nome e whatsapp do cliente
      modelo, cor e valor (moneyBR)
    servico: nome — descricao
    SE lavagem.observacao FACA mostrar bloco de observacao
    SE status = 'ocorrencia' E ocorrencia_descricao FACA mostrar bloco vermelho com descricao

    secao ACOES:
      SE status = 'retirado' FACA
        mostrar "Lavagem encerrada · HH:MM" (retirada_em ou '--:--')
      SENAO FACA mostrar botoes por status:
        SE aguardando_lavagem FACA
          ActionBtn primary "Iniciar lavagem" → handleStatusChange('lavando')
          ActionBtn "Marcar ocorrencia" → handleOpenOcorrencia
        SE lavando FACA
          ActionBtn success "Concluir lavagem" → handleStatusChange('lavagem_concluida')
          SE transitions inclui aguardando_lavagem FACA
            ActionBtn "Voltar pra aguardando" → handleStatusChange('aguardando_lavagem')
          ActionBtn "Marcar ocorrencia" → handleOpenOcorrencia
        SE lavagem_concluida FACA
          ActionBtn primary "Marcar como retirado" → handleStatusChange('retirado')
          SE transitions inclui lavando FACA
            ActionBtn "Voltar pra lavando" → handleStatusChange('lavando')
          ActionBtn "Marcar ocorrencia" → handleOpenOcorrencia
        SE ocorrencia FACA
          SE transitions inclui lavando FACA
            ActionBtn primary "Retomar lavagem" → handleStatusChange('lavando')
          SE transitions inclui aguardando_lavagem FACA
            ActionBtn "Voltar pra aguardando" → handleStatusChange('aguardando_lavagem')
          ActionBtn "Editar ocorrencia" → handleOpenOcorrencia

      botoes gerais (sempre):
        botao WhatsApp "Avisar cliente no WhatsApp" → onWhatsApp(lavagem, 'manual')
        botao "Copiar link do cliente" → handleCopy
          SE copied FACA texto "Link copiado!"
        link "Abrir como cliente" → pubUrl

    secao LINHA DO TEMPO:
      SE loadingEventos FACA mostrar "Carregando..."
      SE eventos vazio FACA mostrar "Nenhum evento"
      SENAO FACA → ver [timeline.md](../shared/timeline.md)

  SE showOcorrenciaInterna FACA
    → ver [ocorrencia-modal.md](ocorrencia-modal.md)
    ao fechar: setShowOcorrenciaInterna(false), router.refresh(), onClose()

---

## ActionBtn

RECEBE: kind? ('primary'|'success'|'danger'), icon? (ReactNode), onClick (), children (ReactNode)

ESTADO: sem estado proprio

variantes:
  primary = fundo brand, texto brand-ink, sem borda
  success = fundo mint, texto branco, sem borda
  danger = fundo rose, texto branco, sem borda
  default = fundo surface, texto ink, borda line, hover bg-2

RENDERIZA botao com icone + children, estilo conforme kind (default se kind omitido)
