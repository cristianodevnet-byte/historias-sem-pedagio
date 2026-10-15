/** Velocidade média de leitura silenciosa em português, em palavras por minuto. */
export const WORDS_PER_MINUTE = 180

export function countWords(paragraphs: readonly string[]): number {
  return paragraphs.reduce((total, paragraph) => total + (paragraph.match(/\S+/g)?.length ?? 0), 0)
}

/** Minutos estimados de leitura, arredondados para cima, com mínimo de 1. */
export function estimateReadingMinutes(paragraphs: readonly string[]): number {
  return Math.max(1, Math.ceil(countWords(paragraphs) / WORDS_PER_MINUTE))
}
