# configuracoes-view

## ThemeOption

RECEBE: active (boolean), onClick (), variant ('claro' | 'escuro'), paleta (PaletaKey)
isDark = variant == 'escuro'
RENDERIZA botao de selecao de tema
  SE active → borda brand 2px, fundo brand tenue
  SENAO → borda line, fundo surface
  miniatura visual 56x40 (fundo escuro fixo SE isDark, SENAO usa p.preview.bg da paleta)
  icone Sun ou Moon + label "Claro"/"Escuro" + descricao

---

## PaletaOption

RECEBE: paletaKey (PaletaKey), active (boolean), onClick ()
p = PALETAS[paletaKey]
RENDERIZA botao de selecao de paleta
  SE active → borda brand 2px, fundo brand tenue
  SENAO → borda line, fundo surface, hover fundo bg-2
  miniatura visual 48x36 com preview de bg/ink/line/brand da paleta
  label p.label + descricao p.desc

---

## ConfiguracoesView

RECEBE: config (ConfigLoja | null)
→ BD [banco_de_dados.md](../../banco_de_dados.md) → configuracoes_loja

CONSTANTES:
  PRESET_CORES = lista de 7 cores hex predefinidas
  ETAPAS = lista de 6 etapas com key, label, icon, desc, vars:
    entrada (Car), lavando (Droplet), concluida/Pronto (Check),
    retirado (Key), ocorrencia (AlertTriangle), aguardando/Pra fila (Clock)
  PALETA_KEYS = chaves de PALETAS

ESTADO:
  isPending = useTransition
  saved = false
  fileRef = useRef<HTMLInputElement>
  nomeLoja, descricao, telefone, whatsapp, enderecoTexto, mapsUrl,
    horarioFuncionamento, instagramUrl, mensagemWhatsappPadrao = campos de texto
  mensagensEtapas = Record<string, string> (inicializado de config?.mensagens_etapas ?? {})
  logoUrl = string (config?.logo_url ?? '')
  cropImage = string | null
  logoSaved = false
  logoError = ''
  tema = 'claro' | 'escuro' (config?.tema ?? 'claro')
  paleta = PaletaKey (config?.paleta ?? 'esmeralda')
  corPrimaria = string (config?.cor_primaria ?? '#11A37F')
  hexInput = string (igual a corPrimaria)
  hexFocused = false
  etapaTab = 'entrada'

useEffect (dep: tema):
  SE tema == 'escuro' → setAttribute data-theme=dark, classList.add('dark')
  SENAO → removeAttribute data-theme, classList.remove('dark')

useEffect (dep: paleta):
  remove todas as classes palette-* do html
  SE paleta != 'esmeralda' → adiciona classe palette-{paleta}

useEffect (dep: corPrimaria):
  setProperty('--brand', corPrimaria)
  setProperty('--brand-ink', brandInkFor(corPrimaria))

salvarAparencia (t, p, c)
  startTransition: atualizarAparencia({ tema: t, paleta: p, cor_primaria: c }) → ver [server/actions/config.md](../../server/actions/config.md)

handleTema (t)
  setTema(t); salvarAparencia(t, paleta, corPrimaria)

handlePaleta (p)
  setPaleta(p)
  novaCor = PALETAS[p].brand
  setCorPrimaria(novaCor); setHexInput(novaCor)
  salvarAparencia(tema, p, novaCor)

handleCor (c)
  setCorPrimaria(c); setHexInput(c); salvarAparencia(tema, paleta, c)

aplicaHex (val)
  SE val nao começa com '#' → prepend '#'
  SE formato #RRGGBB valido → handleCor(v2)

hexDisplay = SE hexFocused → hexInput SENAO corPrimaria

handleUploadLogo (blob: Blob)
  setLogoError('')
  cria File a partir do blob com nome logo_{timestamp}.webp
  monta FormData com chave 'logo'
  uploadLogo(fd) → ver [server/actions/config.md](../../server/actions/config.md)
  SE result.error → setLogoError(result.error); sair
  SE result.data → setLogoUrl(result.data); setLogoSaved(true); timeout 2500ms setLogoSaved(false); router.refresh()

handleFileSelect (file: File)
  url = URL.createObjectURL(file)
  setCropImage(url)

handleSalvar ()
  startTransition:
    atualizarConfigLoja({ nomeLoja, descricao, telefone, whatsapp,
      enderecoTexto, mapsUrl, horarioFuncionamento, instagramUrl,
      mensagemWhatsappPadrao, mensagensEtapas }) → ver [server/actions/config.md](../../server/actions/config.md)
    SE !result.error → setSaved(true); timeout 1600ms setSaved(false); router.refresh()

helpers mensagens:
  etapa = ETAPAS.find(e.key == etapaTab)
  tmpl = mensagensEtapas[etapaTab] ?? DEFAULT_TEMPLATES[etapaTab] ?? ''
  setTmpl (texto) → setMensagensEtapas com key=etapaTab
  resetarTmpl () → setTmpl(DEFAULT_TEMPLATES[etapaTab] || '')
  insertVar (name) → appenda {{name}} ao tmpl atual (com espaco se necessario)

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
    secao Tema:
      ThemeOption claro (recebe paleta atual) → handleTema('claro')
      ThemeOption escuro (recebe paleta atual) → handleTema('escuro')
    secao Paleta de cores:
      grid 1 col (sm: 2 cols) com PaletaOption para cada PALETA_KEY → handlePaleta
    secao Cor da marca:
      PARA cada PRESET_CORES → botao colorido, borda destacada SE selecionado → handleCor
      label color picker → input type=color oculto → handleCor
    linha hex: preview da cor (div 44x44), input texto hex (mono uppercase)
      onFocus → setHexInput(corPrimaria); setHexFocused(true)
      onChange → setHexInput(valor)
      onBlur → aplicaHex(hexInput); setHexFocused(false)
      onKeyDown Enter → aplicaHex(hexInput); blur
    secao Preview: botao primario, botao secundario, badge Aguardando, badge Lavando, PlacaTag exemplo

  CARD Identidade:
    upload logo: botao 132x132 com fileRef oculto, aceita PNG/JPG/WEBP ate 10MB
      onClick → fileRef.current?.click()
      SE logoUrl → img full com overlay "Trocar" no hover
      SENAO → icone Upload + texto
      input file oculto (onChange → SE file.size <= 10MB → handleFileSelect)
      SE logoSaved → "Logo salvo!" em mint
      SE logoError → texto erro em rose
      SENAO → "PNG, JPG ou WEBP ate 10MB"
    campos: Nome da loja (input), Descricao (textarea)

  CARD Contato e localizacao:
    campos lado a lado: Telefone (mono), WhatsApp (mono)
    campos: Endereco, Link Google Maps, Horario de funcionamento, Instagram (opcional)

  CARD Mensagem da vitrine:
    textarea de mensagemWhatsappPadrao

  CARD Mensagens automaticas por etapa:
    tabs por ETAPAS → setEtapaTab
    secao "Saudacao (fixo)" → mostra "Ola, {nome_cliente}! 👋"
    secao "Mensagem da etapa": textarea editavel (tmpl) + botao "Resetar" → resetarTmpl
      botoes de variavel disponiveis (etapa.vars) → insertVar
    secao "Assinatura (fixo)":
      SE includeLink → mostra linha do link de acompanhamento
      mostra "— Equipe {nome_loja}"
    secao "Preview no WhatsApp": bolha estilo WhatsApp com fullPreview

  rodape:
    botao "Salvar alteracoes" (h-[52px], disabled se isPending, mostra "Salvo com sucesso!" se saved)
    link "Ver vitrine" → / (target=_blank, icone ExternalLink)

  SE cropImage → LogoCropModal
    imageUrl=cropImage
    onConfirm(blob): setCropImage(null); handleUploadLogo(blob) → ver [components/gestor/logo-crop-modal.md](logo-crop-modal.md)
    onClose: setCropImage(null)

---

## brandInkFor (hex)

RECEBE: hex (string)
RETORNA '#1A1413' SE luminancia > 0.6, SENAO '#FFFFFF'
calcula lum = 0.2126*R + 0.7152*G + 0.0722*B (normalizado)
