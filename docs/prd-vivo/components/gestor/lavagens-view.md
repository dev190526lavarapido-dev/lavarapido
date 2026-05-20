# lavagens-view

## FilterChip

RECEBE: active (boolean), onClick (), count (number), color? (string), children (ReactNode)
RENDERIZA
  button pill com label + contador
  SE active → fundo brand, texto brand-ink
  SENAO → borda line, texto ink-2, hover borda brand
  SE color existir → bolinha colorida (brand-ink se active, color senao)

---

## LavagensView

RECEBE: lavagens (LavagemComDetalhes[])
→ BD [banco_de_dados.md](../../banco_de_dados.md) → lavagens, veiculos, clientes, servicos_lavagem

CONSTANTE COLS = colunas do kanban:
  aguardando_lavagem, lavando, lavagem_concluida, ocorrencia, retirado

ESTADO:
  isPending = useTransition
  search = ''
  filter = 'todos' | LavagemStatus
  dragId = string | null
  hoverCol = LavagemStatus | null
  selectedLavagem = LavagemComDetalhes | null
  ocorrenciaLavagemId = string | null
  whatsappState = { lavagem: LavagemComDetalhes; tipo: string } | null
  loja = ConfigLoja | null

useEffect ao montar:
  busca configuracoes_loja via supabase browser client (single)
  SE data → setLoja(data)

useEffect (dep: searchParams, lavagens, router):
  whatsappParamHandled = useRef(false) — garante execucao unica
  SE searchParams.get('whatsapp') != 'new' OU lavagens vazio → sair
  latest = lavagem mais recente com status aguardando_lavagem
  queueMicrotask:
    SE latest → setWhatsappState({ lavagem: latest, tipo: 'entrada' })
    router.replace('/gestor/lavagens', { scroll: false })

filtered = useMemo:
  SE search vazio → lavagens completas
  SENAO filtrar por cliente.nome, veiculo.placa, veiculo.modelo

byStatus(key) = filtered filtrados por status_atual == key

counts = useMemo: { todos: filtered.length, [col.key]: byStatus(col.key).length, ... }

handleWhatsApp (lav, tipo)
  setWhatsappState({ lavagem: lav, tipo })

handleStatusChange (lavagemId, novoStatus)
  startTransition:
    mudarStatus(lavagemId, novoStatus)
    SE error → console.error, sair
    SENAO:
      router.refresh()
      SE lavagem encontrada → montar updatedLav com novoStatus; setWhatsappState({ lavagem: updatedLav, tipo: tipoMsgParaStatus(novoStatus) })

handleDrop (colKey, event)
  preventDefault; limpar hoverCol e dragId
  pegar lavagemId do dataTransfer
  SE lavagem nao existe OU ja esta no colKey → sair
  SE colKey nao esta em STATUS_TRANSITIONS[status] → sair
  SE colKey == 'ocorrencia' → setOcorrenciaLavagemId(lavagemId), sair
  SENAO → handleStatusChange(lavagemId, colKey)

visibleCols = SE filter=='todos' → todos COLS SENAO apenas col matching filter

renderCol (col)
  items = byStatus(col.key)
  meta = STATUS_META[col.key]
  RENDERIZA coluna kanban com drag-over highlight
    cabecalho: bolinha colorida + titulo + contador
    SE items vazio → mensagem estado vazio
    PARA cada item → LavagemCard
      onStatusChange=handleStatusChange
      onOpen=setSelectedLavagem
      onOcorrencia=setOcorrenciaLavagemId
      onWhatsApp=handleWhatsApp
      isDragging=(dragId==l.id)
      onDragStart/End

RENDERIZA
  wrapper com pointer-events-none + opacidade SE isPending
  cabecalho: "Lavagens" + subtitulo + botao "Nova lavagem" → router.push('/gestor/nova-lavagem')
  campo busca pill
  filter chips: "Todos" + um chip por COLS
  SE filter=='todos' → grid horizontal scrollavel 5 colunas (renderCol para cada)
  SENAO → coluna unica centralizada (renderiza items sem usar renderCol, replica logica inline)
  SE selectedLavagem → LavagemDetalheModal
    onClose=limpar
    onOcorrencia=fechar modal + abrir ocorrencia
    onWhatsApp=fechar modal + handleWhatsApp
  SE ocorrenciaLavagemId → OcorrenciaModal
    lavagemId; descricaoAtual de lavagens; onClose=limpar
    onWhatsApp=fechar ocorrencia + handleWhatsApp(lav, 'ocorrencia')
  SE whatsappState → WhatsAppModal
    lavagem=whatsappState.lavagem; tipo=whatsappState.tipo; loja=loja
    onClose=limpar whatsappState
