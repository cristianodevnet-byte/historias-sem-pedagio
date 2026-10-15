/**
 * Importa várias histórias de um único arquivo JSON (uma lista) para
 * src/content/stories, criando um arquivo "NN-id.json" para cada uma.
 *
 * Uso:
 *   npm run historias:importar -- caminho/historias.json
 *   npm run historias:importar -- caminho/historias.json --substituir
 *
 * Sem --substituir, posições que já têm história são puladas.
 * Com --substituir, o arquivo antigo daquela posição é trocado pelo novo.
 * Depois de importar, rode `npm test` para validar tudo.
 */
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const STORIES_DIR = resolve(import.meta.dirname, '../src/content/stories')
const args = process.argv.slice(2)
const replace = args.includes('--substituir')
const inputPath = args.find((arg) => !arg.startsWith('--'))

if (!inputPath || !existsSync(inputPath)) {
  console.error('Informe o arquivo a importar: npm run historias:importar -- caminho/historias.json')
  process.exit(1)
}

let entries
try {
  // Remove o BOM que o Bloco de Notas e o PowerShell costumam gravar no início do arquivo.
  entries = JSON.parse(readFileSync(inputPath, 'utf8').replace(/^﻿/, ''))
} catch (error) {
  console.error(`Não foi possível ler o JSON: ${error.message}`)
  process.exit(1)
}

if (!Array.isArray(entries)) {
  console.error('O arquivo deve conter uma lista de histórias: [ { ... }, { ... } ]')
  process.exit(1)
}

const pad = (order) => String(order).padStart(2, '0')
const existing = readdirSync(STORIES_DIR).filter((name) => name.endsWith('.json'))
let created = 0
let replaced = 0
const skipped = []

for (const [index, entry] of entries.entries()) {
  const { id, order } = entry ?? {}
  if (typeof id !== 'string' || !Number.isInteger(order) || order < 1) {
    skipped.push(`item ${index + 1}: falta "id" ou "order" (número a partir de 1)`)
    continue
  }
  const prefix = `${pad(order)}-`
  const sameOrder = existing.filter((name) => name.startsWith(prefix))
  if (sameOrder.length > 0 && !replace) {
    skipped.push(`nº ${order}: já existe (${sameOrder.join(', ')}). Use --substituir para trocar.`)
    continue
  }
  for (const name of sameOrder) rmSync(join(STORIES_DIR, name))
  writeFileSync(join(STORIES_DIR, `${prefix}${id}.json`), `${JSON.stringify(entry, null, 2)}\n`, 'utf8')
  if (sameOrder.length > 0) replaced++
  else created++
}

console.log(`Criadas: ${created}. Substituídas: ${replaced}. Puladas: ${skipped.length}.`)
for (const reason of skipped) console.log(`  - ${reason}`)
console.log('Agora rode "npm test" para validar o conteúdo.')
