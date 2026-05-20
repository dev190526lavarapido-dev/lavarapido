import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import { getConfigLojaPublica } from "@/server/queries/config";
import type { PaletaKey } from "@/lib/palettes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfigLojaPublica()
  const nomeLoja = config?.nome_loja || "Lava Rápido"
  return {
    title: nomeLoja,
    description: "Gestão de lava-rápido com acompanhamento em tempo real",
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: nomeLoja,
    },
    icons: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  }
}

function brandInkFor(hex: string): string {
  const h = hex.replace('#', '')
  if (h.length !== 6) return '#FFFFFF'
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return lum > 0.6 ? '#1A1413' : '#FFFFFF'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getConfigLojaPublica()

  const tema = config?.tema ?? 'claro'
  const paleta = (config?.paleta ?? 'esmeralda') as PaletaKey
  const corPrimaria = config?.cor_primaria ?? '#11A37F'

  const isDark = tema === 'escuro'
  const paletaClass = paleta !== 'esmeralda' ? `palette-${paleta}` : ''

  const htmlClasses = [
    geistSans.variable,
    geistMono.variable,
    bricolage.variable,
    'h-full antialiased',
    isDark ? 'dark' : '',
    paletaClass,
  ].filter(Boolean).join(' ')

  return (
    <html
      lang="pt-BR"
      className={htmlClasses}
      data-theme={isDark ? 'dark' : undefined}
      style={{
        '--brand': corPrimaria,
        '--brand-ink': brandInkFor(corPrimaria),
      } as React.CSSProperties}
    >
      <head>
        <meta name="theme-color" content={corPrimaria} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
