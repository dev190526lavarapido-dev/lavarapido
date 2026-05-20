# nova-lavagem-wizard

## WizardStep

RECEBE: n (number), label (string), current (number)
isActive = current == n
isDone = current > n
RENDERIZA indicador de passo com circulo numerado (check se isDone, brand se ativo/feito, muted se futuro)

## RowInfo

RECEBE: label (string), value (string), mono? (boolean), bold? (boolean)
RENDERIZA linha de resumo com label muted e valor (grande+bold se bold=true, mono se mono=true)

---

## avatarColor (index)
RECEBE: index (number)
RETORNA AVATAR_COLORS[index % 5]

---

## NovaLavagemWizard

RECEBE: clientes (ClienteComVeiculos[]), servicos (ServicoLavagem[])
→ BD [banco_de_dados.md](../../banco_de_dados.md) → clientes, veiculos, servicos_lavagem, lavagens

ESTADO:
  isPending = useTransition
  step = 1
  search = ''
  selectedCliente = ClienteComVeiculos | null
  selectedVeiculo = Veiculo | null
  selectedServico = ServicoLavagem | null
  obs = ''
  criandoCliente = false
  novoCli = { nome: '', whatsapp: '' }
  novoVei = { placa: '', modelo: '', cor: '' }
  formError = ''

clientesFiltrados = useMemo:
  SE search vazio → primeiros 10 clientes
  SENAO filtrar por nome, whatsapp, placa de veiculos

selectClienteVeiculo (cliente, veiculo)
  setSelectedCliente(cliente); setSelectedVeiculo(veiculo); setStep(2)

handleCriarCliente ()
  SE nome, whatsapp ou placa vazios → setFormError, sair
  setFormError('')
  startTransition:
    criarClienteComVeiculo(novoCli, novoVei com placa uppercase)
    SE error → setFormError; sair
    SENAO:
      montar ClienteComVeiculos com veiculos=[veiculo] total_lavagens=0
      setSelectedCliente; setSelectedVeiculo; setCriandoCliente(false); setStep(2)

handleConfirmar ()
  SE nao ha cliente, veiculo ou servico selecionado → sair
  startTransition:
    criarLavagem({ cliente_id, veiculo_id, servico_id, valor, observacao })
    SE error → setFormError; sair
    SENAO → router.push('/gestor/lavagens?whatsapp=new')

RENDERIZA
  cabecalho: link "Voltar" + titulo "Nova lavagem"
  barra de passos: WizardStep 1 "Cliente & veiculo" — WizardStep 2 "Servico" — WizardStep 3 "Confirmar"

  SE step == 1:
    card com:
      SE !criandoCliente:
        campo busca
        lista clientesFiltrados:
          PARA cada cliente: avatar (initials+cor ciclica), nome, whatsapp, veiculos como botoes
            onClick em veiculo → selectClienteVeiculo(cliente, veiculo)
        SE lista vazia → mensagem de estado vazio
        botao "Cadastrar cliente novo" → setCriandoCliente(true)
      SE criandoCliente:
        formulario inline: Nome, WhatsApp, Placa (uppercase), Cor, Modelo
        SE formError → mensagem vermelha
        botoes: "Salvar e seguir" (→ handleCriarCliente) | "Cancelar"

  SE step == 2:
    card com:
      cabecalho cliente selecionado: nome, PlacaTag, modelo · cor + botao "Trocar" → setStep(1)
      lista de servicos:
        PARA cada servico: nome, descricao, tempo estimado, valor
          borda brand SE selecionado; onClick → setSelectedServico(s)
      botoes nav: Voltar → setStep(1) | Continuar (disabled se !selectedServico) → setStep(3)

  SE step == 3 E cliente+veiculo+servico selecionados:
    card com:
      titulo "Tudo certo? Confere os dados"
      RowInfo: Cliente, WhatsApp (mono), Veiculo (placa·modelo·cor), Servico, Valor (bold)
      campo Observacao (Textarea, opcional)
      texto informativo sobre link de acompanhamento + WhatsApp
      SE formError → mensagem vermelha
      botoes nav: Voltar → setStep(2) | "Confirmar entrada" (→ handleConfirmar, disabled se isPending)
