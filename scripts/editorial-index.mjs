/**
 * Gera o INDICE_EDITORIAL.md a partir dos arquivos de histórias: número,
 * título, verdade explorada, referência bíblica, emoção e nota.
 * Uso: npm run historias:indice
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const STORIES_DIR = join(ROOT, 'src/content/stories')

const stories = readdirSync(STORIES_DIR)
  .filter((name) => name.endsWith('.json'))
  .map((name) => JSON.parse(readFileSync(join(STORIES_DIR, name), 'utf8').replace(/^﻿/, '')))
  .sort((a, b) => a.order - b.order)

const cell = (value) => String(value ?? '—').replaceAll('|', '/').replaceAll('\n', ' ')
const words = (story) => story.paragraphs.join(' ').split(/\s+/).filter(Boolean).length

const lines = [
  '# Índice editorial: Histórias Sem Pedágio',
  '',
  `${stories.length} histórias em rodízio. Gerado por \`npm run historias:indice\`; não edite à mão.`,
  '',
  '| Nº | Título | Verdade explorada | Referência bíblica | Emoção | Palavras | Nota |',
  '| --- | --- | --- | --- | --- | --- | --- |',
  ...stories.map((story) => {
    const meta = story.meta ?? {}
    return `| ${story.order} | ${cell(story.title)} | ${cell(meta.truth)} | ${cell(meta.bibleReference)} | ${cell(meta.emotion)} | ${words(story)} | ${cell(meta.score)} |`
  }),
  '',
]

writeFileSync(join(ROOT, 'INDICE_EDITORIAL.md'), lines.join('\n'), 'utf8')
console.log(`INDICE_EDITORIAL.md atualizado com ${stories.length} histórias.`)
