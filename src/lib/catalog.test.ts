import { describe, expect, it } from 'vitest'
import { buildCatalog, parseStoryEntry, storyFileName } from './catalog'
import { estimateReadingMinutes } from './readingTime'

const valid = { id: 'uma-historia', order: 1, title: 'Uma história', paragraphs: ['Texto.'] }
const source = (data: object, name = 'a.json') => ({ source: name, data })

describe('parseStoryEntry', () => {
  it('aceita uma entrada mínima válida', () => {
    expect(parseStoryEntry(valid)).toEqual({ entry: valid })
  })

  it.each([
    ['id com maiúscula', { ...valid, id: 'Uma-Historia' }],
    ['id com acento', { ...valid, id: 'história' }],
    ['id com espaço', { ...valid, id: 'uma historia' }],
    ['posição zero', { ...valid, order: 0 }],
    ['posição decimal', { ...valid, order: 1.5 }],
    ['posição como texto', { ...valid, order: '1' }],
    ['sem título', { ...valid, title: '   ' }],
    ['sem parágrafos', { ...valid, paragraphs: [] }],
    ['parágrafo vazio', { ...valid, paragraphs: ['Texto.', ''] }],
    ['parágrafos como texto único', { ...valid, paragraphs: 'Texto.' }],
    ['descrição da imagem vazia', { ...valid, imageAlt: '' }],
    ['tempo de leitura inválido', { ...valid, readingMinutes: 0 }],
  ])('rejeita: %s', (_, data) => {
    expect(parseStoryEntry(data)).toHaveProperty('problems')
  })
})

describe('buildCatalog', () => {
  it('ordena pelo campo "order"', () => {
    const { catalog, problems } = buildCatalog([
      source({ ...valid, id: 'b', order: 2 }, 'x.json'),
      source({ ...valid, id: 'a', order: 1 }, 'y.json'),
    ])
    expect(problems).toEqual([])
    expect(catalog.stories.map((story) => story.id)).toEqual(['a', 'b'])
  })

  it('calcula o tempo de leitura quando não informado', () => {
    const paragraphs = [Array.from({ length: 400 }, () => 'palavra').join(' ')]
    const { catalog } = buildCatalog([source({ ...valid, paragraphs })])
    expect(catalog.byId.get(valid.id)?.readingMinutes).toBe(estimateReadingMinutes(paragraphs))
    expect(estimateReadingMinutes(paragraphs)).toBe(3)
  })

  it('respeita o tempo de leitura informado', () => {
    const { catalog } = buildCatalog([source({ ...valid, readingMinutes: 7 })])
    expect(catalog.byId.get(valid.id)?.readingMinutes).toBe(7)
  })

  it('aponta id duplicado e mantém o primeiro arquivo', () => {
    const { catalog, problems } = buildCatalog([source({ ...valid, order: 2 }, 'b.json'), source(valid, 'a.json')])
    expect(catalog.stories).toHaveLength(1)
    expect(catalog.byId.get(valid.id)?.order).toBe(1)
    expect(problems).toEqual([expect.stringContaining('b.json: o id "uma-historia" já é usado')])
  })

  it('aponta posição duplicada', () => {
    const { catalog, problems } = buildCatalog([source(valid, 'a.json'), source({ ...valid, id: 'outra' }, 'b.json')])
    expect(catalog.stories).toHaveLength(1)
    expect(problems).toEqual([expect.stringContaining('b.json: a posição 1 já pertence')])
  })

  it('aponta número faltando na sequência', () => {
    const { problems } = buildCatalog([source(valid, 'a.json'), source({ ...valid, id: 'c', order: 3 }, 'c.json')])
    expect(problems).toEqual([expect.stringContaining('falta a história nº 2')])
  })

  it('ignora arquivos inválidos e informa o motivo', () => {
    const { catalog, problems } = buildCatalog([source({ title: 'x' }, 'ruim.json')])
    expect(catalog.stories).toHaveLength(0)
    expect(problems.every((problem) => problem.startsWith('ruim.json:'))).toBe(true)
  })

  it('associa a imagem pelo id da história', () => {
    const { catalog, problems } = buildCatalog([source({ ...valid, imageAlt: 'Descrição' })], {
      'uma-historia': '/assets/uma-historia.webp',
    })
    expect(problems).toEqual([])
    expect(catalog.byId.get(valid.id)?.imageUrl).toBe('/assets/uma-historia.webp')
  })

  it('exige descrição quando há imagem', () => {
    const { problems } = buildCatalog([source(valid)], { 'uma-historia': '/x.webp' })
    expect(problems).toEqual([expect.stringContaining('falta a descrição "imageAlt"')])
  })

  it('aponta imagem sem história correspondente', () => {
    const { problems } = buildCatalog([source(valid)], { 'nome-errado': '/x.webp' })
    expect(problems).toEqual([expect.stringContaining('imagem "nome-errado"')])
  })

  it('sem imagem, a história não tem imageUrl', () => {
    expect(buildCatalog([source(valid)]).catalog.byId.get(valid.id)).not.toHaveProperty('imageUrl')
  })
})

describe('storyFileName', () => {
  it('usa dois dígitos para a posição', () => {
    expect(storyFileName(1, 'o-relogio')).toBe('01-o-relogio.json')
    expect(storyFileName(30, 'x')).toBe('30-x.json')
    expect(storyFileName(120, 'x')).toBe('120-x.json')
  })
})
