# whatsapp-modal

## WhatsAppIcon

RENDERIZA
  SVG inline do icone WhatsApp (16x16)

---

## initials

RECEBE: name (string)
RETORNA: ate 2 iniciais maiusculas das palavras do nome

---

## PRESETS (constante)

lista de objetos { key, label }:
  entrada    → "Entrada"
  lavando    → "Lavando"
  concluida  → "Pronto"
  aguardando → "Fila"
  ocorrencia → "Ocorrencia"
  retirado   → "Retirado"
  manual     → "Outro"

---

## WhatsAppModal

RECEBE: lavagem (LavagemComDetalhes | null), tipo (string), loja (ConfigLoja | null), onClose ()

AO MONTAR
  registrar listener keydown no document
  SE tecla = Escape FACA onClose()
  AO DESMONTAR → remover listener

buildMsg (t)
  SE sem lavagem ou sem loja FACA retornar string vazia
  montar link = origin + /a/ + lavagem.token_publico
  templates = DEFAULT_TEMPLATES mesclado com loja.mensagens_etapas
  RETORNA buildWaMessage(t, { clienteNome, placa, servicoNome, lojaNome, link, descricao, templates })

ESTADO:
  activeTipo = tipoProp
  msg = buildMsg(tipoProp)
  prevKey = "{tipoProp}-{lavagem.id}"

SE prevKey != currentKey (mudanca de props externas) FACA
  setPrevKey(currentKey)
  setActiveTipo(tipoProp)
  setMsg(buildMsg(tipoProp))

handlePreset (t)
  setActiveTipo(t)
  setMsg(buildMsg(t))

handleOpen
  SE sem lavagem FACA retornar
  montar link = origin + /a/ + lavagem.token_publico
  montar url = waLink(lavagem.cliente.whatsapp, msg)
  abrir url em nova aba
  chamar registrarMensagem(lavagem.id, activeTipo, msg, link) em background (fire and forget)
  onClose()

SE lavagem ou loja for null FACA retornar null

RENDERIZA
  overlay com click-fora fecha modal
  painel (max 520px, scroll)
    grab bar (so mobile)
    header: titulo = tituloPorTipo(activeTipo) + botao fechar (X)
    info cliente:
      avatar circular com initials(cliente.nome)
      nome e whatsapp do cliente
    preset chips:
      PARA CADA preset em PRESETS FACA
        botao chip: SE p.key = activeTipo FACA estilo ativo (brand), SENAO estilo padrao
        ao clicar → handlePreset(p.key)
    preview WhatsApp (classe wa-chat / wa-bubble):
      texto da mensagem (msg)
      horario atual formatado HH:MM
    textarea "Editar mensagem":
      value=msg, onChange=setMsg, rows=6
    hint: "wa.me abre o WhatsApp com a mensagem pronta — voce precisa clicar em enviar la."
    footer:
      botao "Pular aviso" → onClose
      botao "Abrir no WhatsApp" (verde #25D366) → handleOpen
