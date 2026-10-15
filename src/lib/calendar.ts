/**
 * Utilitários de calendário.
 *
 * Toda a seleção usa a data civil de Brasília (America/Sao_Paulo), nunca a
 * data do aparelho nem UTC. As funções recebem a data atual como parâmetro
 * para poderem ser testadas sem depender do relógio real.
 */

export const BRAZIL_TIME_ZONE = 'America/Sao_Paulo'

/** Data civil: ano, mês (1–12) e dia, sem hora nem fuso. */
export interface CivilDate {
  year: number
  month: number
  day: number
}

const brazilDateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: BRAZIL_TIME_ZONE,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
})

/** Data civil em Brasília no instante informado. */
export function getBrazilDate(now: Date = new Date()): CivilDate {
  const parts = brazilDateFormatter.formatToParts(now)
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value)
  return { year: read('year'), month: read('month'), day: read('day') }
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

export function isValidCivilDate({ year, month, day }: CivilDate): boolean {
  return (
    Number.isInteger(year) &&
    Number.isInteger(month) &&
    Number.isInteger(day) &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth(year, month)
  )
}

export function isSameCivilDate(a: CivilDate, b: CivilDate): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day
}

/** Converte "AAAA-MM-DD" em data civil. Retorna null se inválida. */
export function parseIsoDate(value: string): CivilDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) }
  return isValidCivilDate(date) ? date : null
}

const MS_PER_DAY = 86_400_000
const civilToUtc = ({ year, month, day }: CivilDate) => Date.UTC(year, month - 1, day)

/** Quantos dias civis separam `from` de `to` (negativo se `to` for anterior). */
export function daysBetween(from: CivilDate, to: CivilDate): number {
  return Math.round((civilToUtc(to) - civilToUtc(from)) / MS_PER_DAY)
}

// Formatada em UTC ao meio-dia para que nenhum fuso do aparelho desloque o dia exibido.
const longDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

/** Ex.: "terça-feira, 13 de outubro". */
export function formatLongDate(date: CivilDate): string {
  return longDateFormatter.format(new Date(civilToUtc(date) + MS_PER_DAY / 2))
}

/**
 * Lê uma data de teste no formato "MM-DD" (usa o ano de `today`) ou
 * "AAAA-MM-DD". Retorna null para valores ausentes ou inválidos.
 */
export function parseDateOverride(value: string | null, today: CivilDate): CivilDate | null {
  if (!value) return null
  const short = /^(\d{2})-(\d{2})$/.exec(value)
  if (short) {
    const candidate = { year: today.year, month: Number(short[1]), day: Number(short[2]) }
    return isValidCivilDate(candidate) ? candidate : null
  }
  return parseIsoDate(value)
}
