# layout.tsx

DEFINE fontes (modulo — nao dentro de componente)
  geistSans = Geist variavel "--font-geist-sans" subsets latin
  geistMono = Geist_Mono variavel "--font-geist-mono" subsets latin
  bricolage = Bricolage_Grotesque variavel "--font-display" subsets latin pesos 500/700/800

## generateMetadata (async)

BUSCA
  config = getConfigLojaPublica() → ver [server/queries/config.md](../server/queries/config.md)
  → BD [banco_de_dados.md](../banco_de_dados.md) → config_loja

nomeLoja = config?.nome_loja ?? "Lava Rápido"

RETORNA Metadata
  title = nomeLoja
  description = "Gestão de lava-rápido com acompanhamento em tempo real"
  manifest = "/manifest.json"
  appleWebApp: capable=true statusBarStyle="default" title=nomeLoja
  icons: [{ url: "/icon.svg", type: "image/svg+xml" }]

## brandInkFor

RECEBE: hex (string)

FACA
  h = hex sem "#"
  SE h.length != 6 ENTAO retorna "#FFFFFF"
  [r, g, b] = parse dos pares hex / 255
  lum = 0.2126*r + 0.7152*g + 0.0722*b (luminancia relativa)
  SE lum > 0.6 ENTAO retorna "#1A1413"
  SENAO retorna "#FFFFFF"

## RootLayout (async)

RECEBE: children (ReactNode)

BUSCA
  config = getConfigLojaPublica() → BD [banco_de_dados.md](../banco_de_dados.md) → config_loja

CALCULA
  tema = config?.tema ?? "claro"
  paleta = config?.paleta ?? "esmeralda" (como PaletaKey)
  corPrimaria = config?.cor_primaria ?? "#11A37F"
  isDark = tema == "escuro"
  paletaClass = paleta != "esmeralda" ? "palette-{paleta}" : ""
  htmlClasses = [geistSans.variable, geistMono.variable, bricolage.variable, "h-full antialiased", isDark ? "dark" : "", paletaClass] filtrados e unidos por espaço

RENDERIZA
  html lang="pt-BR" className=htmlClasses data-theme={isDark ? "dark" : undefined}
    style: --brand=corPrimaria, --brand-ink=brandInkFor(corPrimaria)
    head
      meta name="theme-color" content=corPrimaria
      meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"
    body min-h-full flex flex-col
      children
