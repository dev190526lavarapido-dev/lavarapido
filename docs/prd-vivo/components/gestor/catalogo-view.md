# catalogo-view

## Toggle

RECEBE: checked (boolean), onChange ()
RENDERIZA
  button role=switch com bolinha deslizante
  SE checked → fundo brand, bolinha direita
  SENAO → fundo line, bolinha esquerda

---

## ServicoModal

RECEBE: servico (ServicoLavagem | null), onClose (), onSaved ()
ESTADO:
  isPending = useTransition
  form = { nome, descricao, valor, tempo_estimado_minutos, ativo }
    inicializado com dados do servico se existir, senao defaults vazios/true
  error = null

ok = nome.trim >= 2 chars E valor > 0

handleSalvar ()
  SE !ok → sair
  startTransition:
    payload = { nome, descricao, valor (Number), tempo_estimado_minutos (Number|null), ativo }
    SE servico existir → atualizarServico(servico.id, payload)
    SENAO → criarServico(payload)
    SE result.error → setError(result.error), sair
    SENAO → onSaved(); onClose()

RENDERIZA
  modal overlay (fecha ao clicar fora)
  sheet bottom mobile / dialog centro desktop
  campos: Nome, Descricao, Valor, Tempo estimado, Toggle ativo
  SE error → mostrar mensagem
  botoes: Cancelar | Salvar (disabled se !ok ou isPending)

---

## CatalogoView

RECEBE: servicos (ServicoLavagem[])
→ BD [banco_de_dados.md](../../banco_de_dados.md) → servicos_lavagem

ESTADO:
  editing = ServicoLavagem | 'new' | null
  togglingId = string | null

handleToggle (id)
  setTogglingId(id)
  await toggleServico(id)
  setTogglingId(null)
  router.refresh()

handleSaved ()
  router.refresh()

RENDERIZA
  cabecalho com titulo "Catalogo" + botao "Novo servico" → setEditing('new')
  lista de servicos:
    SE lista vazia → mensagem de estado vazio
    PARA cada servico:
      card com: icone Droplet, nome, badge "Inativo" SE !ativo, tempo se existir, descricao se existir
      acoes: valor formatado, Toggle (chama handleToggle se !togglingId), botao Editar → setEditing(s)
      opacidade 0.6 se inativo
  SE editing != null → ServicoModal
    SE editing == 'new' → servico=null
    SENAO → servico=editing
