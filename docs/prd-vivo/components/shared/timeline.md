# timeline

## formatHM

RECEBE: iso (string)
RETORNA: horario formatado HH:MM em pt-BR

---

## TimelineEvento (tipo interno)
- status: string
- descricao?: string
- created_at: string

---

## Timeline

RECEBE: eventos (TimelineEvento[]), animateLast? (boolean) = false

mapa titleMap:
  entrada              → "Carro deu entrada"
  aguardando_lavagem   → "Aguardando lavagem"
  lavando              → "Lavagem em andamento"
  lavagem_concluida    → "Lavagem concluida"
  ocorrencia           → "Ocorrencia"
  retirado             → "Carro retirado"

mapa markerColors por className:
  aguardando → fundo/borda st-aguardando, texto marrom
  lavando    → fundo/borda st-lavando, texto branco
  concluida  → fundo/borda st-concluida, texto branco
  ocorrencia → fundo/borda st-ocorrencia, texto branco
  retirado   → fundo/borda st-retirado, texto branco
  entrada    → fundo/borda foreground, texto background

RENDERIZA lista vertical com pl-3
  PARA CADA evento (indice i) FACA
    meta = STATUS_META[ev.status] → ver [lib/constants.md](../../lib/constants.md)
    klass = SE status = 'entrada' ENTAO 'entrada' SENAO meta.className ?? 'entrada'
    IconComponent = SE status = 'entrada' ENTAO Car SENAO meta.icon ?? Car
    isLast = i = ultimo indice
    isCurrent = isLast E status != 'retirado'

    SE animateLast E isLast FACA aplicar animacao fade-in + slide-in-from-top

    grid 2 colunas (marcador 28px | corpo):
      SE nao isLast FACA linha conectora vertical entre marcadores

      marcador circular h-7 w-7 com cor do klass
        SE isCurrent FACA animate-pulse + shadow anel
        IconComponent (size=14)

      corpo:
        titulo = titleMap[ev.status] ?? ev.status
        SE ev.descricao existe E != ev.status FACA mostrar descricao em muted-foreground
        horario = formatHM(ev.created_at) em font-mono text-xs muted-foreground
