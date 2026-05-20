# clientes-view

## initials (nome)
RECEBE: nome (string)
RETORNA primeiras 2 iniciais em maiusculo

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
  SE search vazio → retornar todos os clientes
  SENAO filtrar por nome, whatsapp, placa de veiculo ou modelo de veiculo

RENDERIZA
  cabecalho: "Clientes", subtitulo com contagens, botao "Novo cliente" → setShowNew(true)
  campo busca (pill)
  lista de clientes (items):
    PARA cada cliente:
      botao-linha com avatar colorido (initials, cor ciclica 5 cores), nome, whatsapp (mono), placas dos veiculos, total_lavagens
      onClick → setSelectedId(c.id)
    SE lista vazia → "Ninguem aqui ainda"
  SE selectedId → ClienteDetalheModal(clienteId=selectedId, onClose=limpar selectedId)
  SE showNew → NovoClienteModal(onClose=fechar + router.refresh())

---

## ClienteDetalheModal

RECEBE: clienteId (string), onClose ()
ESTADO:
  cliente = { nome, whatsapp, veiculos[], lavagens[] } | null
  loading = true

useEffect ao montar (dep: clienteId):
  busca via supabase browser client:
    1. clientes WHERE id = clienteId
    2. veiculos WHERE cliente_id = clienteId
    3. lavagens WHERE cliente_id = clienteId ORDER BY entrada_em DESC
       com join veiculo, servico, cliente
  setCliente(dados combinados); setLoading(false)
  cancelavel (flag cancelled)

RENDERIZA Dialog
  SE loading → "Carregando..."
  SENAO:
    header com nome do cliente
    linha whatsapp + botao link WhatsApp verde
    secao "Veiculos": lista com placa + modelo + cor
    secao "Historico": lista de lavagens com servico.nome, veiculo.placa, hora, StatusBadge
      click em lavagem → onClose() + window.location.href = '/gestor/lavagens'
      SE sem lavagens → "Sem historico ainda"

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
    criarClienteComVeiculo(cli, vei com placa uppercase)
    SE result.error → setError; sair
    SENAO → onClose()

RENDERIZA Dialog
  campos: Nome, WhatsApp, Placa (mono uppercase), Cor, Modelo
  SE error → mensagem vermelha
  rodape: Cancelar | Salvar (disabled se !ok ou isPending)
