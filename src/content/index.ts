import { siteConfig } from '../config/site'
import { parseIsoDate } from '../lib/calendar'
import { buildCatalog } from '../lib/catalog'

/**
 * Carrega automaticamente todos os arquivos de `./stories/*.json` e as imagens
 * de `./images/`, no build. Para publicar uma história nova, basta criar o
 * arquivo: nada aqui precisa mudar.
 */
const files = import.meta.glob<unknown>('./stories/*.json', { eager: true, import: 'default' })

/** Imagens nomeadas com o id da história, ex.: "o-relogio-parado.webp". */
const imageFiles = import.meta.glob<string>('./images/*.{webp,avif,jpg,jpeg,png}', {
  eager: true,
  query: '?url',
  import: 'default',
})

export const storySources = Object.entries(files).map(([path, data]) => ({
  source: path.replace('./stories/', ''),
  data,
}))

export const storyImages: Record<string, string> = Object.fromEntries(
  Object.entries(imageFiles).map(([path, url]) => [path.replace('./images/', '').replace(/\.[a-z]+$/, ''), url]),
)

const { catalog, problems } = buildCatalog(storySources, storyImages)

/** Dia em que a história nº 1 aparece. */
export const rotationStart = parseIsoDate(siteConfig.rotationStart)
if (!rotationStart) problems.push(`rotationStart inválido em site.ts: "${siteConfig.rotationStart}"`)

if (import.meta.env.DEV && problems.length > 0) {
  console.error(`[histórias] ${problems.length} problema(s) no conteúdo:\n- ${problems.join('\n- ')}`)
}

export { catalog, problems as catalogProblems }
