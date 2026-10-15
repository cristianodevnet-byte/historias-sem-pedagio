import type { Story } from '../content/types'
import { daysBetween, type CivilDate } from './calendar'
import type { Catalog } from './catalog'

/**
 * Índice (a partir de 0) da história do dia no rodízio.
 * O dia de início mostra a nº 1; depois da última, o ciclo recomeça.
 * Datas anteriores ao início seguem o mesmo ciclo, contado para trás.
 */
export function rotationIndex(start: CivilDate, today: CivilDate, total: number): number {
  const days = daysBetween(start, today)
  return ((days % total) + total) % total
}

/** História do dia, ou null se o catálogo estiver vazio. */
export function findStoryForDate(catalog: Catalog, start: CivilDate, today: CivilDate): Story | null {
  const { stories } = catalog
  if (stories.length === 0) return null
  return stories[rotationIndex(start, today, stories.length)]
}

export type StoryView =
  | { kind: 'daily'; story: Story; date: CivilDate }
  | { kind: 'empty'; date: CivilDate }
  | { kind: 'shared'; story: Story; isToday: boolean; date: CivilDate }
  | { kind: 'shared-missing'; requestedId: string }

/** Decide o que a página mostra: a história de um link ou a história do dia. */
export function resolveView(
  catalog: Catalog,
  { requestedId, today, start }: { requestedId: string | null; today: CivilDate; start: CivilDate },
): StoryView {
  const daily = findStoryForDate(catalog, start, today)

  if (requestedId !== null) {
    const story = catalog.byId.get(requestedId)
    if (!story) return { kind: 'shared-missing', requestedId }
    return { kind: 'shared', story, isToday: daily?.id === story.id, date: today }
  }

  return daily ? { kind: 'daily', story: daily, date: today } : { kind: 'empty', date: today }
}
