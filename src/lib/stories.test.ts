import { describe, expect, it } from 'vitest'
import { getBrazilDate, type CivilDate } from './calendar'
import { buildCatalog } from './catalog'
import { findStoryForDate, resolveView, rotationIndex } from './stories'

const entry = (order: number) => ({
  source: `${String(order).padStart(2, '0')}-h${order}.json`,
  data: { id: `h${order}`, order, title: `História ${order}`, paragraphs: ['Um parágrafo.'] },
})

const makeCatalog = (total: number) => buildCatalog(Array.from({ length: total }, (_, i) => entry(i + 1))).catalog

const start: CivilDate = { year: 2026, month: 10, day: 14 }
const catalog = makeCatalog(30)
const storyOn = (date: CivilDate) => findStoryForDate(catalog, start, date)?.id
const at = (iso: string) => getBrazilDate(new Date(iso))

describe('rodízio de histórias', () => {
  it('o dia de início mostra a história nº 1', () => {
    expect(storyOn(start)).toBe('h1')
  })

  it('avança uma história por dia', () => {
    expect(storyOn({ year: 2026, month: 10, day: 15 })).toBe('h2')
    expect(storyOn({ year: 2026, month: 10, day: 20 })).toBe('h7')
  })

  it('o 30º dia mostra a nº 30 e o 31º recomeça na nº 1', () => {
    expect(storyOn({ year: 2026, month: 11, day: 12 })).toBe('h30')
    expect(storyOn({ year: 2026, month: 11, day: 13 })).toBe('h1')
    expect(storyOn({ year: 2026, month: 12, day: 13 })).toBe('h1')
  })

  it('troca de história na meia-noite de Brasília', () => {
    expect(findStoryForDate(catalog, start, at('2026-10-15T02:59:59Z'))?.id).toBe('h1')
    expect(findStoryForDate(catalog, start, at('2026-10-15T03:00:00Z'))?.id).toBe('h2')
  })

  it('atravessa viradas de mês e de ano sem pular nem repetir', () => {
    // 31/12/2026 é o dia 78 desde o início (78 % 30 = 18 → nº 19); 01/01/2027 é a nº 20.
    expect(storyOn({ year: 2026, month: 12, day: 31 })).toBe('h19')
    expect(storyOn({ year: 2027, month: 1, day: 1 })).toBe('h20')
  })

  it('29 de fevereiro é um dia comum do ciclo', () => {
    const feb28 = rotationIndex(start, { year: 2028, month: 2, day: 28 }, 30)
    expect(rotationIndex(start, { year: 2028, month: 2, day: 29 }, 30)).toBe((feb28 + 1) % 30)
    expect(rotationIndex(start, { year: 2028, month: 3, day: 1 }, 30)).toBe((feb28 + 2) % 30)
  })

  it('cada história aparece exatamente uma vez a cada 30 dias', () => {
    const seen = Array.from({ length: 30 }, (_, i) => rotationIndex(start, { year: 2027, month: 6, day: 1 + i }, 30))
    expect(new Set(seen).size).toBe(30)
  })

  it('datas anteriores ao início seguem o mesmo ciclo, para trás', () => {
    expect(storyOn({ year: 2026, month: 10, day: 13 })).toBe('h30')
  })

  it('funciona com qualquer quantidade de histórias', () => {
    const three = makeCatalog(3)
    expect(findStoryForDate(three, start, { year: 2026, month: 10, day: 17 })?.id).toBe('h1')
    expect(findStoryForDate(makeCatalog(1), start, { year: 2030, month: 5, day: 9 })?.id).toBe('h1')
  })

  it('catálogo vazio não tem história do dia', () => {
    expect(findStoryForDate(buildCatalog([]).catalog, start, start)).toBeNull()
  })
})

describe('resolveView', () => {
  const today = { year: 2026, month: 10, day: 16 } // história nº 3

  it('sem link, mostra a história do dia', () => {
    expect(resolveView(catalog, { requestedId: null, today, start })).toMatchObject({
      kind: 'daily',
      story: { id: 'h3' },
    })
  })

  it('com link, mostra a história pedida em qualquer dia', () => {
    expect(resolveView(catalog, { requestedId: 'h25', today, start })).toMatchObject({
      kind: 'shared',
      story: { id: 'h25' },
      isToday: false,
    })
  })

  it('reconhece quando o link é da história de hoje', () => {
    expect(resolveView(catalog, { requestedId: 'h3', today, start })).toMatchObject({ kind: 'shared', isToday: true })
  })

  it('link para história inexistente', () => {
    expect(resolveView(catalog, { requestedId: 'nao-existe', today, start })).toEqual({
      kind: 'shared-missing',
      requestedId: 'nao-existe',
    })
  })

  it('sem nenhuma história cadastrada', () => {
    expect(resolveView(buildCatalog([]).catalog, { requestedId: null, today, start })).toEqual({
      kind: 'empty',
      date: today,
    })
  })
})
