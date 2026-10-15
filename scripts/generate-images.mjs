/**
 * Gera as ilustrações das histórias com a API de imagens da OpenAI.
 *
 * Para cada história, usa o prompt de `meta.illustrationPrompt`, salva o
 * original em "imagens-originais/NN-id.png" e a versão do site, já otimizada,
 * em "src/content/images/<id>.webp", com o nome que o site reconhece sozinho.
 *
 * Uso:
 *   npm run imagens:gerar                 todas as histórias que ainda não têm imagem
 *   npm run imagens:gerar -- 7            só a história 7 (refaz, mesmo se já existir)
 *   npm run imagens:gerar -- 3 8 12       várias histórias (refaz essas)
 *   npm run imagens:gerar -- --qualidade high
 *
 * A chave fica em ".env.local" (OPENAI_API_KEY=...), que não vai para o GitHub.
 * O modelo pode ser trocado com OPENAI_IMAGE_MODEL no mesmo arquivo.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import sharp from 'sharp'

const ROOT = resolve(import.meta.dirname, '..')
const STORIES_DIR = join(ROOT, 'src/content/stories')
const OUTPUT_DIR = join(ROOT, 'src/content/images')
const ORIGINALS_DIR = join(ROOT, 'imagens-originais')
const ENV_FILE = join(ROOT, '.env.local')

// ---------- Configuração ----------

function loadEnvFile() {
  if (!existsSync(ENV_FILE)) return
  for (const line of readFileSync(ENV_FILE, 'utf8').replace(/^﻿/, '').split(/\r?\n/)) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line)
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, '')
  }
}

loadEnvFile()
const apiKey = process.env.OPENAI_API_KEY
const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1'

if (!apiKey || apiKey.includes('cole-sua-chave')) {
  console.error('Falta a chave da OpenAI. Abra o arquivo .env.local e cole a chave em OPENAI_API_KEY=')
  process.exit(1)
}

const args = process.argv.slice(2)
const qualityIndex = args.indexOf('--qualidade')
const quality = qualityIndex !== -1 ? args[qualityIndex + 1] : 'medium'
const requested = args.filter((arg, i) => /^\d+$/.test(arg) && args[i - 1] !== '--qualidade').map(Number)

// ---------- Histórias ----------

const stories = readdirSync(STORIES_DIR)
  .filter((name) => name.endsWith('.json'))
  .map((name) => JSON.parse(readFileSync(join(STORIES_DIR, name), 'utf8').replace(/^﻿/, '')))
  .sort((a, b) => a.order - b.order)

const hasImage = (story) => existsSync(join(OUTPUT_DIR, `${story.id}.webp`))
const queue =
  requested.length > 0
    ? stories.filter((story) => requested.includes(story.order))
    : stories.filter((story) => !hasImage(story))

const missingNumbers = requested.filter((n) => !stories.some((story) => story.order === n))
if (missingNumbers.length > 0) console.log(`Não existe história com número: ${missingNumbers.join(', ')}`)
if (queue.length === 0) {
  console.log('Nada a gerar: todas as histórias já têm imagem. Para refazer uma, informe o número.')
  process.exit(0)
}

mkdirSync(OUTPUT_DIR, { recursive: true })
mkdirSync(ORIGINALS_DIR, { recursive: true })

// ---------- Geração ----------

const pad = (n) => String(n).padStart(2, '0')
const wait = (ms) => new Promise((done) => setTimeout(done, ms))

async function requestImage(prompt) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, size: '1536x1024', quality, n: 1 }),
    })
    const body = await response.json().catch(() => ({}))
    if (response.ok && body.data?.[0]?.b64_json) return Buffer.from(body.data[0].b64_json, 'base64')

    const message = body.error?.message ?? `HTTP ${response.status}`
    const retryable = response.status === 429 || response.status >= 500
    if (!retryable || attempt === 3) throw new Error(message)
    console.log(`   aviso: ${message}. Tentando de novo em ${attempt * 20}s...`)
    await wait(attempt * 20_000)
  }
  throw new Error('sem resposta')
}

console.log(`Gerando ${queue.length} imagem(ns) com ${model}, qualidade ${quality}.\n`)
const failures = []

for (const story of queue) {
  const label = `${pad(story.order)} ${story.title}`
  const prompt = story.meta?.illustrationPrompt
  if (!prompt) {
    console.log(`${label}: sem illustrationPrompt, pulei.`)
    continue
  }
  try {
    const started = Date.now()
    const png = await requestImage(prompt)
    writeFileSync(join(ORIGINALS_DIR, `${pad(story.order)}-${story.id}.png`), png)
    const output = join(OUTPUT_DIR, `${story.id}.webp`)
    const info = await sharp(png).resize(1200, 800, { fit: 'cover', position: 'attention' }).webp({ quality: 74 }).toFile(output)
    console.log(`${label}: ok (${Math.round(info.size / 1024)} KB, ${Math.round((Date.now() - started) / 1000)}s)`)
  } catch (error) {
    failures.push(story.order)
    console.log(`${label}: ERRO: ${error.message}`)
    if (/billing|quota|credit/i.test(error.message)) {
      console.log('\nParece falta de créditos na conta da OpenAI. Parei para não acumular erros.')
      break
    }
    if (/verif/i.test(error.message)) {
      console.log('\nA OpenAI pede verificação da organização para este modelo. Parei.')
      break
    }
  }
}

console.log(failures.length > 0 ? `\nFalharam: ${failures.join(', ')}. Rode de novo informando esses números.` : '\nPronto.')
