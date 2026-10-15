import { afterEach, describe, expect, it, vi } from 'vitest'
import { daysBetween, formatLongDate, getBrazilDate, parseDateOverride, parseIsoDate } from './calendar'

describe('getBrazilDate: fuso de Brasília', () => {
  it('usa a data de Brasília, não a de UTC', () => {
    // 02:59 UTC = 23:59 do dia anterior em Brasília (UTC-3)
    expect(getBrazilDate(new Date('2026-10-14T02:59:59Z'))).toEqual({ year: 2026, month: 10, day: 13 })
  })

  it('muda o dia exatamente à meia-noite de Brasília', () => {
    expect(getBrazilDate(new Date('2026-10-14T02:59:59.999Z')).day).toBe(13)
    expect(getBrazilDate(new Date('2026-10-14T03:00:00Z')).day).toBe(14)
  })

  it('vira o mês corretamente', () => {
    expect(getBrazilDate(new Date('2026-11-01T02:30:00Z'))).toEqual({ year: 2026, month: 10, day: 31 })
    expect(getBrazilDate(new Date('2026-11-01T03:00:00Z'))).toEqual({ year: 2026, month: 11, day: 1 })
  })

  it('vira o ano corretamente', () => {
    expect(getBrazilDate(new Date('2027-01-01T02:59:59Z'))).toEqual({ year: 2026, month: 12, day: 31 })
    expect(getBrazilDate(new Date('2027-01-01T03:00:00Z'))).toEqual({ year: 2027, month: 1, day: 1 })
  })

  it('respeita o antigo horário de verão (UTC-2) em datas históricas', () => {
    // Em 31/12/2018 Brasília estava em UTC-2: a virada ocorreu às 02:00 UTC.
    expect(getBrazilDate(new Date('2019-01-01T01:59:59Z'))).toEqual({ year: 2018, month: 12, day: 31 })
    expect(getBrazilDate(new Date('2019-01-01T02:00:00Z'))).toEqual({ year: 2019, month: 1, day: 1 })
  })

  describe('independe do fuso configurado no aparelho', () => {
    afterEach(() => {
      vi.unstubAllEnvs()
    })

    it.each(['Asia/Tokyo', 'America/Los_Angeles', 'Europe/Lisbon'])('fuso do aparelho: %s', (tz) => {
      vi.stubEnv('TZ', tz)
      expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe(tz)
      expect(getBrazilDate(new Date('2026-10-14T02:59:59Z')).day).toBe(13)
      expect(getBrazilDate(new Date('2026-10-14T03:00:00Z')).day).toBe(14)
    })
  })
})

describe('daysBetween', () => {
  const start = { year: 2026, month: 10, day: 14 }

  it('conta dias civis, inclusive em viradas de mês e ano', () => {
    expect(daysBetween(start, start)).toBe(0)
    expect(daysBetween(start, { year: 2026, month: 10, day: 15 })).toBe(1)
    expect(daysBetween(start, { year: 2026, month: 11, day: 1 })).toBe(18)
    expect(daysBetween(start, { year: 2027, month: 1, day: 1 })).toBe(79)
  })

  it('considera 29 de fevereiro', () => {
    expect(daysBetween({ year: 2028, month: 2, day: 28 }, { year: 2028, month: 3, day: 1 })).toBe(2)
    expect(daysBetween({ year: 2027, month: 2, day: 28 }, { year: 2027, month: 3, day: 1 })).toBe(1)
  })

  it('é negativo para datas anteriores', () => {
    expect(daysBetween(start, { year: 2026, month: 10, day: 10 })).toBe(-4)
  })
})

describe('formatação em português', () => {
  it('formata a data longa sem deslocar o dia', () => {
    expect(formatLongDate({ year: 2026, month: 10, day: 13 })).toBe('terça-feira, 13 de outubro')
    expect(formatLongDate({ year: 2027, month: 1, day: 1 })).toBe('sexta-feira, 1 de janeiro')
    expect(formatLongDate({ year: 2028, month: 2, day: 29 })).toBe('terça-feira, 29 de fevereiro')
  })
})

describe('leitura de datas', () => {
  const today = { year: 2026, month: 10, day: 13 }

  it('parseIsoDate aceita AAAA-MM-DD válida', () => {
    expect(parseIsoDate('2026-10-14')).toEqual({ year: 2026, month: 10, day: 14 })
    expect(parseIsoDate('2028-02-29')).toEqual({ year: 2028, month: 2, day: 29 })
  })

  it('parseIsoDate rejeita datas inválidas', () => {
    expect(parseIsoDate('2027-02-29')).toBeNull()
    expect(parseIsoDate('14/10/2026')).toBeNull()
  })

  it('parseDateOverride aceita MM-DD usando o ano atual, ou AAAA-MM-DD', () => {
    expect(parseDateOverride('12-25', today)).toEqual({ year: 2026, month: 12, day: 25 })
    expect(parseDateOverride('2028-02-29', today)).toEqual({ year: 2028, month: 2, day: 29 })
  })

  it('parseDateOverride rejeita valores inválidos ou ausentes', () => {
    expect(parseDateOverride(null, today)).toBeNull()
    expect(parseDateOverride('02-29', today)).toBeNull() // 2026 não é bissexto
    expect(parseDateOverride('amanha', today)).toBeNull()
  })
})
