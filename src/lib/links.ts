/** Parâmetro da URL que identifica uma história: /?historia=o-relogio-parado */
export const STORY_PARAM = 'historia'

/** Parâmetro para simular outra data, aceito apenas em desenvolvimento: /?data=12-25 */
export const DATE_PARAM = 'data'

/** Link permanente de uma história a partir da origem do site. */
export function buildStoryUrl(storyId: string, origin: string): string {
  const url = new URL('/', origin)
  url.searchParams.set(STORY_PARAM, storyId)
  return url.toString()
}

/** Lê o id da história a partir da query string. Retorna null se ausente ou vazio. */
export function readStoryId(search: string): string | null {
  const value = new URLSearchParams(search).get(STORY_PARAM)?.trim().toLowerCase()
  return value ? value : null
}

export function readDateParam(search: string): string | null {
  return new URLSearchParams(search).get(DATE_PARAM)
}
