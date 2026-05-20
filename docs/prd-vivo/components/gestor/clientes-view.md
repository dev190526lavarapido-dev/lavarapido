# clientes-view

## initials (nome)
RECEBE: nome (string)
RETORNA primeiras 2 iniciais em maiusculo (split por espaco, pega [0] de cada palavra, ate 2)

## formatHM (dateStr)
RECEBE: dateStr (string)
RETORNA hora:minuto em pt-BR

## WhatsAppIcon
RENDERIZA icone SVG do WhatsApp inline (16x16)

---

## ClientesView

RECEBE: clientes (ClienteComVeiculos[]), totalVeiculos (number)
→ BD [banco_de_dados.md](../../banco_de_dados.md) → clientes, veiculos

ESTADO:
  search = ''
  selectedId = string | null
  showNew = false

items = useMemo:
  q = search.trim().toLowerCase()
  SE search vazio → retornar todos os clientes
  SENAO filtrar por nome, whatsapp, placa de veiculo ou modelo de veiculo
  ordenar por nome (localeCompare)

RENDERIZA
  cabecalho: "Clientes", subtitulo com {clientes.length} no total e {totalVeiculos} veiculos, botao "Novo cliente" → setShowNew(true)
  campo busca (pill com icone Search)
  lista de clientes (items):
    PARA cada cliente (c, i):
      botao-linha com avatar colorido (initials, cor ciclica 5 cores usando i%5), nome, whatsapp (mono), placas dos veiculos, total_lavagens
      onClick → setSelectedId(c.id)
    SE lista vazia → "Ninguem aqui ainda"
  SE selectedId → ClienteDetalheModal(clienteId=selectedId, onClose=limpar selectedId)
  SE showNew → NovoClienteModal(onClose=fechar + router.refresh())

---

## ClienteDetalheModal

RECEBE: clienteId (string), onClose ()
ESTADO:
  isPending = useTransition
  cliente = ClienteDetalheData { id, nome, whatsapp, veiculos[], lavagens[] } | null
  loading = true
  editingPerfil = false
  perfilForm = { nome: '', whatsapp: '' }
  perfilError = ''
  editingVeiculoId = string | null
  veiculoForm = { placa: '', modelo: '', cor: '' }
  veiculoError = ''
  addingVeiculo = false
  novoVeiculoForm = { placa: '', modelo: '', cor: '' }

useEffect ao montar (dep: clienteId):
  busca via supabase browser client: → BD [banco_de_dados.md](../../banco_de_dados.md) → clientes, veiculos, lavagens
    1. clientes WHERE id = clienteId (single)
    2. veiculos WHERE cliente_id = clienteId
    3. lavagens WHERE cliente_id = clienteId ORDER BY entrada_em DESC
       com join veiculo:veiculos(*), servico:servicos_lavagem(*), cliente:clientes(*)
  SE c nao encontrado → setLoading(false); sair
  setCliente(dados combinados); setLoading(false)
  cancelavel (flag cancelled)

handleSavePerfil ()
  SE perfilForm.nome vazio OU perfilForm.whatsapp vazio → setPerfilError; sair
  setPerfilError('')
  startTransition:
    atualizarCliente(clienteId, { nome, whatsapp }) → ver [server/actions/clientes.md](../../server/actions/clientes.md)
    SE result.error → setPerfilError(result.error); sair
    SENAO → atualiza cliente local com novos dados; setEditingPerfil(false); router.refresh()

handleSaveVeiculo (veiculoId)
  SE veiculoForm.placa vazio → setVeiculoError; sair
  setVeiculoError('')
  startTransition:
    atualizarVeiculo(veiculoId, { placa, modelo, cor }) → ver [server/actions/clientes.md](../../server/actions/clientes.md)
    SE result.error → setVeiculoError(result.error); sair
    SENAO → atualiza veiculo local na lista; setEditingVeiculoId(null); router.refresh()

handleAddVeiculo ()
  SE novoVeiculoForm.placa vazio → setVeiculoError; sair
  setVeiculoError('')
  startTransition:
    adicionarVeiculo(clienteId, { placa, modelo, cor }) → ver [server/actions/clientes.md](../../server/actions/clientes.md)
    SE result.error → setVeiculoError(result.error); sair
    SE result.data → adiciona veiculo a lista local; limpa novoVeiculoForm; setAddingVeiculo(false); router.refresh()

handleRemoveVeiculo (veiculoId)
  startTransition:
    removerVeiculo(veiculoId) → ver [server/actions/clientes.md](../../server/actions/clientes.md)
    SE result.error → setVeiculoError(result.error); sair
    SENAO → remove veiculo da lista local; router.refresh()

formatDate (dateStr) → data em pt-BR dd/mm/aa

RENDERIZA Dialog
  SE loading OU !cliente → "Carregando..."
  SENAO:
    DialogHeader com nome do cliente
    secao "Perfil":
      SE !editingPerfil → botao "Editar" (Pencil) → setPerfilForm com dados atuais; setEditingPerfil(true)
      SE editingPerfil:
        form inline: Input Nome (autoFocus), Input WhatsApp
        SE perfilError → texto rose
        botoes: Salvar → handleSavePerfil | Cancelar → setEditingPerfil(false)
      SENAO:
        linha com nome + whatsapp (mono)
        link WhatsApp verde → waLink(whatsapp, 'Oi! Tudo bem?')
    secao "Veiculos":
      SE !addingVeiculo → botao "Adicionar" (Plus) → setAddingVeiculo(true); limpa novoVeiculoForm
      PARA cada veiculo:
        SE editingVeiculoId == v.id:
          form inline: campos Placa (uppercase/mono, autoFocus), Cor lado a lado; Modelo
          SE veiculoError → texto rose
          botoes: Salvar → handleSaveVeiculo(v.id) | Cancelar → limpar editingVeiculoId
        SENAO:
          linha com PlacaTag + modelo + cor (se existir)
          botao Pencil → setVeiculoForm com dados; setEditingVeiculoId(v.id)
          botao Trash2 (rose) → handleRemoveVeiculo(v.id)
      SE addingVeiculo:
        form inline tracejado: campos Placa (uppercase/mono, autoFocus), Cor lado a lado; Modelo
        SE veiculoError → texto rose
        botoes: "Adicionar" (Car icon) → handleAddVeiculo | Cancelar → setAddingVeiculo(false)
      SE sem veiculos E !addingVeiculo → "Nenhum veiculo cadastrado."
    secao "Extrato de lavagens":
      SE sem lavagens → "Sem historico ainda."
      SENAO → timeline vertical:
        PARA cada lavagem (l, idx):
          ponto colorido (brand normal, rose se teve ocorrencia) + linha vertical ate proximo
          servico.nome + valor (moneyBR)
          data (formatDate) · veiculo.placa · StatusBadge
          SE ocorrencia_descricao → caixa rose com texto

---

## NovoClienteModal

RECEBE: onClose ()
ESTADO:
  isPending = useTransition
  cli = { nome: '', whatsapp: '' }
  vei = { placa: '', modelo: '', cor: '' }
  error = null

ok = cli.nome.trim E cli.whatsapp.trim E vei.placa.trim

handleSave ()
  SE !ok → sair
  setError(null)
  startTransition:
    criarClienteComVeiculo(cli, { placa uppercase, modelo, cor }) → ver [server/actions/clientes.md](../../server/actions/clientes.md)
    SE result.error → setError; sair
    SENAO → onClose()

RENDERIZA Dialog
  campos: Nome (autoFocus), WhatsApp (mono), Placa+Cor lado a lado (placa mono uppercase), Modelo
  SE error → mensagem destructive
  DialogFooter: Cancelar (ghost, disabled se isPending) | Salvar (disabled se !ok ou isPending)
