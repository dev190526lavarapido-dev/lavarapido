# gestor/layout.tsx

## GestorLayout

RECEBE: children (ReactNode)

RENDERIZA
  div grid min-h-dvh
    cols mobile: 1 coluna, rows: [auto, 1fr, auto]
    cols min-[900px]: [240px, 1fr], rows: [auto, 1fr]

    Topbar (→ ver componente gestor/topbar)
    Sidebar (→ ver componente gestor/sidebar)
    main p-4 pb-6 md:p-6 min-[900px]:p-7
      children
    BottomBar (→ ver componente gestor/bottom-bar)
