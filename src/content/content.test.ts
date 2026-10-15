/**
 * Verifica as histórias reais em src/content/stories.
 * Se algum destes testes falhar, o build também falha e nada é publicado.
 */
import { describe, expect, it } from 'vitest'
import { catalog, catalogProblems, rotationStart, storyImages, storySources } from '.'
import { storyFileName } from '../lib/catalog'

describe('integridade do conteúdo editorial', () => {
  it('nenhum arquivo de história ou imagem tem problema', () => {
    expect(catalogProblems).toEqual([])
  })

  it('a data de início do rodízio é válida', () => {
    expect(rotationStart).not.toBeNull()
  })

  it('todos os arquivos foram carregados', () => {
    expect(catalog.stories).toHaveLength(storySources.length)
  })

  it('o nome de cada arquivo é "NN-id.json"', () => {
    for (const story of catalog.stories) {
      const expected = storyFileName(story.order, story.id)
      expect(storySources.map((file) => file.source), `a história "${story.id}"`).toContain(expected)
    }
  })

  it('cada imagem pertence a uma história', () => {
    for (const id of Object.keys(storyImages)) expect(catalog.byId.has(id), `imagem "${id}"`).toBe(true)
  })

  it('nenhum parágrafo tem espaços sobrando nas pontas', () => {
    for (const story of catalog.stories) {
      for (const paragraph of story.paragraphs) {
        expect(paragraph, `história "${story.id}"`).toBe(paragraph.trim())
      }
    }
  })
})
