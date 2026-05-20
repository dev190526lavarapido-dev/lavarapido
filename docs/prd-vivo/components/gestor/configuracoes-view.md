# configuracoes-view

## ThemeOption

RECEBE: active (boolean), onClick (), variant ('claro' | 'escuro')
isDark = variant == 'escuro'
RENDERIZA botao de selecao de tema
  SE active → borda brand, fundo brand tenue
  SENAO → borda line, fundo surface
  miniatura visual do tema (clara ou escura) + icone Sun/Moon + label + descricao

---

## ConfiguracoesView

RECEBE: config (ConfigLoja | null)
→ BD [banco_de_dados.md](../../banco_de_dados.md) → configuracoes_loja

CONSTANTES:
  PRESET_CORES = lista de 7 cores hex predefinidas
  ETAPAS = lista de 6 etapas com key, label, icon, desc, vars:
    entrada (Car), lavando (Droplet), concluida/Pronto (Check),
    retirado (Key), ocorrencia (AlertTriangle), aguardando/Pra fila (Clock)

ESTADO:
  isPending = useTransition
  saved = false
  fileRef = useRef<HTMLInputElement>
  nomeLoja, descricao, telefone, whatsapp, enderecoTexto, mapsUrl,
    horarioFuncionamento, instagramUrl, mensagemWhatsappPadrao = campos de texto
  mensagensEtapas = Record<string, string> (inicializado de config?.mensagens_etapas)
  logoUrl = string
  tema = 'claro' | 'escuro'
  corPrimaria = string (hex)
  hexInput = string (igual a corPrimaria)
  hexFocused = false
  etapaTab = 'entrada'

useEffect (dep: tema):
  SE tema == 'escuro' → setAttribute data-theme=dark, classList.add('dark')
  SENAO → removeAttribute data-theme, classList.remove('dark')

useEffect (dep: corPrimaria):
  setProperty('--brand', corPrimaria)
  setProperty('--primary', corPrimaria)

salvarAparencia (t, c)
  startTransition: atualizarAparencia({ tema: t, cor_primaria: c })

handleTema (t)
  setTema(t); salvarAparencia(t, corPrimaria)

handleCor (c)
  setCorPrimaria(c); salvarAparencia(tema, c)

aplicaHex (val)
  SE val nao começa com '#' → prepend '#'
  SE formato #RRGGBB valido → handleCor(v2); setHexInput(v2)

hexDisplay = SE hexFocused → hexInput SENAO corPrimaria

handleUploadLogo (file)
  montar FormData com 'logo'
  uploadLogo(fd)
  SE result.data → setLogoUrl(result.data); router.refresh()

handleSalvar ()
  startTransition:
    atualizarConfigLoja({ nomeLoja, descricao, telefone, whatsapp,
      enderecoTexto, mapsUrl, horarioFuncionamento, instagramUrl,
      mensagemWhatsappPadrao, mensagensEtapas })
    SE !result.error → setSaved(true); timeout 1600ms setSaved(false); router.refresh()

helpers mensagens:
  etapa = ETAPAS.find(e.key == etapaTab)
  tmpl = mensagensEtapas[etapaTab] ?? DEFAULT_TEMPLATES[etapaTab] ?? ''
  setTmpl (texto) → setMensagensEtapas com key=etapaTab
  resetarTmpl () → setTmpl(DEFAULT_TEMPLATES[etapaTab] || '')
  insertVar (name) → appenda {{name}} ao tmpl atual

preview:
  previewVars = { nome, placa, servico, lojaNome, link, descricao }
  bodyPreview = fillTemplate(tmpl, previewVars)
  headerPreview = waHeader(previewVars.nome)
  includeLink = etapaTab != 'retirado'
  footerPreview = waFooter(lojaNome, link SE includeLink)
  fullPreview = header + corpo + footer

RENDERIZA
  cabecalho: "Configuracoes da loja" + botao "Salvar alteracoes" (disabled se isPending, mostra "Salvo!" se saved)

  CARD Aparencia:
    secao Tema: ThemeOption claro | ThemeOption escuro → handleTema
    secao Cor da marca:
      PARA cada PRESET_CORES → botao colorido, borda destacada SE selecionado → handleCor
      label color picker → input type=color oculto → handleCor
    linha hex: preview da cor, input texto hex (mono uppercase), onBlur/Enter → aplicaHex
    secao Preview: botao primario, botao secundario, badge Aguardando, badge Lavando, PlacaTag exemplo

  CARD Identidade:
    upload logo (botao 132x132 com fileRef oculto, aceita PNG/JPG/WEBP ate 2MB)
      SE logoUrl → mostrar img SENAO → icone Upload
    campos: Nome da loja, Descricao (textarea)

  CARD Contato e localizacao:
    campos lado a lado: Telefone (mono), WhatsApp (mono)
    campos: Endereco, Link Google Maps, Horario de funcionamento, Instagram (opcional)

  CARD Mensagem da vitrine:
    textarea de mensagemWhatsappPadrao

  CARD Mensagens automaticas por etapa:
    tabs por ETAPAS → setEtapaTab
    secao "Saudacao (fixo)" → mostra "Ola, {nome_cliente}! 👋"
    secao "Mensagem da etapa": textarea editavel (tmpl) + botao Resetar → resetarTmpl
      botoes de variavel disponiveis (etapa.vars) → insertVar
    secao "Assinatura (fixo)":
      SE includeLink → mostra linha do link de acompanhamento
      mostra "— Equipe {nome_loja}"
    secao "Preview no WhatsApp": burbulha estilo WhatsApp com fullPreview

  rodape:
    botao "Salvar alteracoes" (h-[52px], disabled se isPending, mostra "Salvo com sucesso!" se saved)
    link "Ver vitrine" → / (target=_blank, icone ExternalLink)
