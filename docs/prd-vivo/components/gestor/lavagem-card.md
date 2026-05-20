# lavagem-card

## getForwardStatus (status)
RECEBE: status (LavagemStatus)
RETORNA proximo status valido:
  aguardando_lavagem → lavando
  lavando → lavagem_concluida
  lavagem_concluida → retirado
  ocorrencia → lavando
  demais → null

## getForwardLabel (fwd)
RECEBE: fwd (LavagemStatus | null)
RETORNA label do botao de avanco:
  lavando → 'Iniciar'
  lavagem_concluida → 'Concluir'
  retirado → 'Retirar'
  demais → 'Avancar'

## getForwardIcon (fwd)
RECEBE: fwd (LavagemStatus | null)
RETORNA icone:
  retirado → Key, lavando → Play, lavagem_concluida → CheckCircle, demais → RotateCcw

## formatHM (dateStr)
RECEBE: dateStr (string)
RETORNA hora:minuto em pt-BR

---

## LavagemCard

RECEBE:
  lavagem (LavagemComDetalhes), onStatusChange (lavagemId, novoStatus), onOpen?,
  onOcorrencia?, onWhatsApp? (lavagem, tipo: string), isDragging?, onDragStart?, onDragEnd?
→ BD [banco_de_dados.md](../../banco_de_dados.md) → lavagens, veiculos, clientes, servicos_lavagem

DERIVADO:
  status = lavagem.status_atual
  transitions = STATUS_TRANSITIONS[status]
  fwd = getForwardStatus(status)
  isOcorrencia = status == 'ocorrencia'
  isRetirado = status == 'retirado'

RENDERIZA div draggable (se !isRetirado)
  onDragStart → seta effectAllowed='move', data=lavagem.id, chama onDragStart?
  onDragEnd → chama onDragEnd?
  onClick → chama onOpen?(lavagem)
  estilo especial SE isDragging (opacidade 50%) ou isOcorrencia (borda+fundo rose)

  linha 1: PlacaTag + valor formatado (moneyBR)
  linha 2: nome do cliente + servico.nome · veiculo.modelo
  SE isOcorrencia E ocorrencia_descricao → caixa de aviso laranja com texto
  linha hora: icone Clock + formatHM(entrada_em)
  SE !isRetirado → secao de acoes:
    SE fwd E fwd em transitions → botao de avanco primario (Iniciar/Concluir/Retirar)
      onClick stopPropagation → onStatusChange(lavagem.id, fwd)
    SE !isOcorrencia → botao AlertTriangle (ocorrencia)
      onClick stopPropagation → onOcorrencia?(lavagem.id)
    botao WhatsApp verde
      onClick stopPropagation → onWhatsApp?(lavagem, tipoMsgParaStatus(status))
