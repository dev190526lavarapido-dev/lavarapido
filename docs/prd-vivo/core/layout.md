# layout.tsx

## RootLayout

RECEBE: children (ReactNode)

DEFINE fontes
  geistSans = Geist variavel "--font-geist-sans" subsets latin
  geistMono = Geist_Mono variavel "--font-geist-mono" subsets latin
  bricolage = Bricolage_Grotesque variavel "--font-display" subsets latin pesos 500/700/800

EXPORTA metadata
  title = "Lava Rápido Marquinhos"
  description = "Gestão de lava-rápido com acompanhamento em tempo real"
  manifest = "/manifest.json"
  appleWebApp: capable=true statusBarStyle="default" title="Lava Rápido"
  icons: [{ url: "/icon.svg", type: "image/svg+xml" }]

RENDERIZA
  html lang="pt-BR" classes das 3 fontes + h-full antialiased
    head
      meta name="theme-color" content="#FF6B47"
      meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"
    body min-h-full flex flex-col
      children
