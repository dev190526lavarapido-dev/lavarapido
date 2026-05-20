# status-badge

## StatusBadge

RECEBE: status (LavagemStatus), size? ('sm'|'default') = 'default'

mapa statusStyles por meta.className:
  aguardando  → fundo/texto/borda amarelo-ambar
  lavando     → fundo/texto/borda azul
  concluida   → fundo/texto/borda verde
  ocorrencia  → fundo/texto/borda vermelho-rosa
  retirado    → fundo muted, texto muted-foreground, borda border

buscar meta = STATUS_META[status]
SE meta nao existe FACA retornar null

SE size = 'sm' FACA px-2 py-0.5 text-[11px]
SE size = 'default' FACA px-2.5 py-1 text-xs

RENDERIZA
  span pill (rounded-full, border, font-semibold)
    ponto circular h-1.5 w-1.5 bg-current opacity-90 (aria-hidden)
    meta.label
