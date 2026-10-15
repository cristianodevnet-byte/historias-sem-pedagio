import type { Story, StoryEntry } from '../content/types'
import { estimateReadingMinutes } from './readingTime'

export interface Catalog {
  /** Histórias na ordem do rodízio. */
  readonly stories: readonly Story[]
  readonly byId: ReadonlyMap<string, Story>
}

/** Conteúdo bruto de um arquivo de história, com o nome do arquivo para mensagens de erro. */
export interface StorySource {
  source: string
  data: unknown
}

export interface CatalogResult {
  catalog: Catalog
  /** Problemas encontrados. Entradas com problema são ignoradas. */
  problems: string[]
}

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1

/** Nome esperado do arquivo de uma história: "01-o-relogio-parado.json". */
export function storyFileName(order: number, id: string): string {
  return `${String(order).padStart(2, '0')}-${id}.json`
}

/** Valida um arquivo de história. Retorna a entrada ou a lista de problemas. */
export function parseStoryEntry(data: unknown): { entry: StoryEntry } | { problems: string[] } {
  if (!isRecord(data)) return { problems: ['o conteúdo não é um objeto JSON'] }

  const problems: string[] = []
  const { id, order, title, subtitle, paragraphs, imageAlt, provisional, readingMinutes, meta } = data

  if (!isNonEmptyString(id) || !ID_PATTERN.test(id)) {
    problems.push('"id" deve usar só letras minúsculas sem acento, números e hífens (ex.: "o-relogio-parado")')
  }
  if (!isPositiveInteger(order)) problems.push('"order" deve ser um número inteiro a partir de 1')
  if (!isNonEmptyString(title)) problems.push('"title" é obrigatório')
  if (subtitle !== undefined && typeof subtitle !== 'string') problems.push('"subtitle" deve ser texto')
  if (!Array.isArray(paragraphs) || paragraphs.length === 0 || !paragraphs.every(isNonEmptyString)) {
    problems.push('"paragraphs" deve ser uma lista de parágrafos não vazios')
  }
  if (imageAlt !== undefined && !isNonEmptyString(imageAlt)) problems.push('"imageAlt" deve ser um texto')
  if (provisional !== undefined && typeof provisional !== 'boolean') {
    problems.push('"provisional" deve ser true ou false')
  }
  if (readingMinutes !== undefined && !isPositiveInteger(readingMinutes)) {
    problems.push('"readingMinutes" deve ser um número inteiro maior que zero')
  }
  if (meta !== undefined && !isRecord(meta)) problems.push('"meta" deve ser um objeto')

  if (problems.length > 0) return { problems }
  return { entry: data as unknown as StoryEntry }
}

/**
 * Monta o catálogo a partir dos arquivos de histórias e das imagens disponíveis
 * (id da história → endereço da imagem).
 * Em caso de id ou posição repetidos, o primeiro arquivo (em ordem alfabética)
 * vale e os demais são relatados como problema.
 */
export function buildCatalog(
  sources: readonly StorySource[],
  images: Readonly<Record<string, string>> = {},
): CatalogResult {
  const problems: string[] = []
  const byId = new Map<string, Story>()
  const byOrder = new Map<number, Story>()

  const sorted = [...sources].sort((a, b) => a.source.localeCompare(b.source))

  for (const { source, data } of sorted) {
    const parsed = parseStoryEntry(data)
    if ('problems' in parsed) {
      problems.push(...parsed.problems.map((problem) => `${source}: ${problem}`))
      continue
    }
    const { entry } = parsed
    const duplicateId = byId.get(entry.id)
    if (duplicateId) {
      problems.push(`${source}: o id "${entry.id}" já é usado pela história nº ${duplicateId.order}`)
      continue
    }
    const duplicateOrder = byOrder.get(entry.order)
    if (duplicateOrder) {
      problems.push(`${source}: a posição ${entry.order} já pertence à história "${duplicateOrder.id}"`)
      continue
    }
    const imageUrl = images[entry.id]
    if (imageUrl && !entry.imageAlt) {
      problems.push(`${source}: a história tem imagem, mas falta a descrição "imageAlt"`)
    }
    const story: Story = {
      ...entry,
      readingMinutes: entry.readingMinutes ?? estimateReadingMinutes(entry.paragraphs),
      ...(imageUrl ? { imageUrl } : {}),
    }
    byId.set(story.id, story)
    byOrder.set(story.order, story)
  }

  const stories = [...byOrder.values()].sort((a, b) => a.order - b.order)
  const gap = stories.findIndex((story, index) => story.order !== index + 1)
  if (gap !== -1) {
    problems.push(`falta a história nº ${gap + 1}: as posições devem ser 1, 2, 3... sem pular números`)
  }

  for (const id of Object.keys(images)) {
    if (!byId.has(id)) problems.push(`imagem "${id}" não corresponde a nenhuma história`)
  }

  return { catalog: { stories, byId }, problems }
}
