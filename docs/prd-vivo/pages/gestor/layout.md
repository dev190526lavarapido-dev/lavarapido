# gestor/layout.tsx

## GestorLayout

RECEBE: children (ReactNode)

RENDERIZA
  div grid min-h-dvh
    cols mobile: 1 coluna, rows: [auto, 1fr, auto]
    cols min-[900px]: [240px, 1fr], rows: [auto, 1fr]

    Topbar → ver [components/gestor/topbar.md](../../components/gestor/topbar.md)
    Sidebar → ver [components/gestor/sidebar.md](../../components/gestor/sidebar.md)
    main p-4 pb-6 md:p-6 min-[900px]:p-7
      children
    BottomBar → ver [components/gestor/bottom-bar.md](../../components/gestor/bottom-bar.md)
