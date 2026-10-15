/**
 * Prepara as ilustrações para o site.
 *
 * 1. Coloque as imagens geradas na pasta "imagens-originais/", com o número
 *    da história no começo do nome: "01.png", "1.jpg", "01-qualquer-coisa.webp"...
 * 2. Rode: npm run imagens:otimizar
 *
 * Cada imagem é recortada em formato vertical 4:5, reduzida para 900 px de
 * largura e salva em WebP (geralmente menos de 150 KB) em
 * src/content/images/<id-da-historia>.webp. As originais não são alteradas.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import sharp from 'sharp'

const ROOT = resolve(import.meta.dirname, '..')
const INPUT_DIR = join(ROOT, 'imagens-originais')
const STORIES_DIR = join(ROOT, 'src/content/stories')
const OUTPUT_DIR = join(ROOT, 'src/content/images')
const WIDTH = 900
const HEIGHT = 1125 // 4:5

if (!existsSync(INPUT_DIR)) {
  mkdirSync(INPUT_DIR)
  console.log('Criei a pasta "imagens-originais". Coloque as imagens nela, com o número da história no nome (ex.: 01.png).')
  process.exit(0)
}

const idByOrder = new Map()
for (const name of readdirSync(STORIES_DIR).filter((file) => file.endsWith('.json'))) {
  const { id, order } = JSON.parse(readFileSync(join(STORIES_DIR, name), 'utf8').replace(/^﻿/, ''))
  idByOrder.set(order, id)
}

mkdirSync(OUTPUT_DIR, { recursive: true })
const files = readdirSync(INPUT_DIR).filter((name) => /\.(png|jpe?g|webp|avif)$/i.test(name))
if (files.length === 0) console.log('Nenhuma imagem em "imagens-originais".')

for (const name of files) {
  const order = Number(/^(\d+)/.exec(name)?.[1])
  const id = idByOrder.get(order)
  if (!id) {
    console.log(`Pulei ${name}: o nome deve começar com o número de uma história existente.`)
    continue
  }
  const output = join(OUTPUT_DIR, `${id}.webp`)
  await sharp(join(INPUT_DIR, name))
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'attention' })
    .webp({ quality: 74 })
    .toFile(output)
  console.log(`${name} → ${id}.webp (${Math.round(statSync(output).size / 1024)} KB)`)
}
