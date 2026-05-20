# ocorrencia-modal

## OcorrenciaModal

RECEBE: lavagemId (string | null), descricaoAtual? (string), onClose (), onWhatsApp? ()

CONSTANTE SUGESTOES = [
  'Cliente esqueceu a chave',
  'Carro precisa de produto especial',
  'Cliente precisa confirmar servico extra',
  'Servico pausado por problema interno',
]

ESTADO:
  isPending = false
  desc = descricaoAtual || ''

SE lavagemId for null FACA retornar null

handleSalvar
  SE desc.trim() vazio FACA retornar
  chamar registrarOcorrencia(lavagemId, desc.trim()) → ver [server/actions/lavagens.md](../../server/actions/lavagens.md)
  SE erro FACA logar e retornar
  router.refresh() e onClose()
  chamar onWhatsApp?.() se fornecido

RENDERIZA
  overlay com click-fora fecha modal
  painel (max 520px, scroll)
    grab bar (so mobile)
    header: titulo "Marcar ocorrencia" + botao fechar (X)
    hint: "O cliente vai ver essa descricao na pagina de acompanhamento."
    textarea autoFocus: value=desc, onChange=setDesc, placeholder="O que aconteceu?"
    sugestoes rapidas:
      PARA CADA sugestao em SUGESTOES FACA
        botao que ao clicar seta desc = sugestao
    footer:
      botao "Cancelar" → onClose
      botao "Registrar ocorrencia" (vermelho, icone AlertTriangle)
        desabilitado SE desc.trim() vazio OU isPending
        SE isPending FACA texto "Registrando..."
        SENAO FACA texto "Registrar ocorrencia"
        → handleSalvar
