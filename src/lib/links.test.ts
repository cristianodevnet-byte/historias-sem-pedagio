import { describe, expect, it } from 'vitest'
import { buildStoryUrl, readStoryId } from './links'

describe('links permanentes', () => {
  it('monta o link da história a partir da raiz do site', () => {
    expect(buildStoryUrl('o-relogio-parado', 'https://historias-sem-pedagio.pages.dev')).toBe(
      'https://historias-sem-pedagio.pages.dev/?historia=o-relogio-parado',
    )
  })

  it('funciona em outro domínio e em desenvolvimento', () => {
    expect(buildStoryUrl('abc', 'http://localhost:5173')).toBe('http://localhost:5173/?historia=abc')
  })

  it('lê o id do link', () => {
    expect(readStoryId('?historia=o-relogio-parado')).toBe('o-relogio-parado')
  })

  it('tolera maiúsculas e espaços colados por engano', () => {
    expect(readStoryId('?historia=%20O-Relogio-Parado%20')).toBe('o-relogio-parado')
  })

  it('preserva outros parâmetros, como os de campanhas', () => {
    expect(readStoryId('?utm_source=qr&historia=abc')).toBe('abc')
  })

  it('sem parâmetro ou vazio, é a página do dia', () => {
    expect(readStoryId('')).toBeNull()
    expect(readStoryId('?historia=')).toBeNull()
    expect(readStoryId('?utm_source=qr')).toBeNull()
  })

  it('ida e volta: o link gerado leva à mesma história', () => {
    const url = new URL(buildStoryUrl('a-ultima-corrida-da-noite', 'https://exemplo.com'))
    expect(readStoryId(url.search)).toBe('a-ultima-corrida-da-noite')
  })
})
