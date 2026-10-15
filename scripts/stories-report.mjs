/**
 * Lista as histórias do rodízio, mostrando quais já têm imagem e quais
 * posições estão faltando.
 * Uso: npm run historias:relatorio
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const CONTENT_DIR = resolve(import.meta.dirname, '../src/content')
const STORIES_DIR = join(CONTENT_DIR, 'stories')
const IMAGES_DIR = join(CONTENT_DIR, 'images')

const imageIds = new Set(
  readdirSync(IMAGES_DIR)
    .filter((name) => /\.(webp|avif|jpe?g|png)$/i.test(name))
    .map((name) => name.replace(/\.[a-z]+$/i, '')),
)

const stories = []
for (const name of readdirSync(STORIES_DIR).filter((file) => file.endsWith('.json'))) {
  try {
    stories.push(JSON.parse(readFileSync(join(STORIES_DIR, name), 'utf8').replace(/^﻿/, '')))
  } catch {
    console.log(`Arquivo ilegível: ${name}`)
  }
}
stories.sort((a, b) => a.order - b.order)

console.log('Nº   Imagem  Título')
for (const story of stories) {
  const image = imageIds.has(story.id) ? '  sim ' : '  —   '
  console.log(`${String(story.order).padStart(2, '0')}  ${image}  ${story.title}${story.provisional ? '  (provisória)' : ''}`)
}

const max = stories.at(-1)?.order ?? 0
const orders = new Set(stories.map((story) => story.order))
const missing = Array.from({ length: max }, (_, i) => i + 1).filter((order) => !orders.has(order))
const withoutImage = stories.filter((story) => !imageIds.has(story.id)).length

console.log(`\nTotal: ${stories.length} história(s), ciclo de ${stories.length} dia(s). Sem imagem: ${withoutImage}.`)
if (missing.length > 0) console.log(`ATENÇÃO, posições faltando: ${missing.join(', ')}`)
