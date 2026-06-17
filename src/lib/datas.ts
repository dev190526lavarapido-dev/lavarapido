/**
 * Helpers de data no fuso de Brasília (America/Sao_Paulo).
 *
 * O servidor (Vercel) roda em UTC, então "hoje" precisa ser calculado
 * explicitamente no fuso de Brasília — senão o dia "vira" às 21:00 local.
 * Brasil não tem horário de verão desde 2019 (UTC-3 fixo); ainda assim os
 * helpers usam o fuso nominal pra continuarem corretos caso o DST volte.
 */

const TZ = 'America/Sao_Paulo'

/** Data corrente em Brasília no formato `YYYY-MM-DD`. */
export function dataBrasilia(d: Date = new Date()): string {
  // 'en-CA' formata como YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

/** Instante UTC (ISO) do início do dia corrente em Brasília (00:00 -03). */
export function inicioDiaBrasiliaISO(d: Date = new Date()): string {
  // 00:00 de hoje em Brasília, convertido pra instante UTC.
  return new Date(`${dataBrasilia(d)}T00:00:00-03:00`).toISOString()
}

/** `'YYYY-MM-DD'` → `'DD/MM/YYYY'`. */
export function formatarDataBR(data: string): string {
  const [y, m, d] = data.split('-')
  return `${d}/${m}/${y}`
}

/** Dia da semana por extenso (pt-BR) a partir de `'YYYY-MM-DD'`. */
export function diaDaSemana(data: string): string {
  // meio-dia em Brasília evita virada de dia por fuso
  const d = new Date(`${data}T12:00:00-03:00`)
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', timeZone: TZ }).format(d)
}
