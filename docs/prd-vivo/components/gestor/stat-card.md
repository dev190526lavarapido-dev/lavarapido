# stat-card

## StatCard

RECEBE:
  label (string), value (string | number), icon (LucideIcon),
  accent? ('default'|'yellow'|'sky'|'mint'|'rose'|'money') = 'default',
  big? (boolean) = false

isMoney = accent == 'money'

estilos do icone por accent:
  default → fundo brand 14%, texto brand
  yellow  → fundo yellow 22%, texto #8C6900
  sky     → fundo sky 18%, texto sky
  mint    → fundo mint 18%, texto mint
  rose    → fundo rose 14%, texto rose
  money   → fundo white/18%, texto brand-ink

RENDERIZA
  card com borda e fundo:
    SE isMoney → gradiente brand → #ff8867, sem borda
    SENAO → borda line, fundo surface
  icone posicionado absoluto canto superior direito (opacidade 85)
  label (xs, muted ou brand-ink se money)
  value (font-heading bold, 34px normal ou 28px se big=true)
