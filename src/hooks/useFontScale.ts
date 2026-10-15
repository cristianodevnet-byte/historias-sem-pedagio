import { useEffect, useState } from 'react'

/** Escalas do texto da história, relativas ao tamanho padrão. */
export const FONT_SCALES = [0.9, 1, 1.12, 1.25, 1.4] as const
const DEFAULT_INDEX = 1
const STORAGE_KEY = 'hsp:font-scale'

function readStoredIndex(): number {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) return DEFAULT_INDEX
    const stored = Number(raw)
    return Number.isInteger(stored) && stored >= 0 && stored < FONT_SCALES.length ? stored : DEFAULT_INDEX
  } catch {
    return DEFAULT_INDEX
  }
}

/** Controle do tamanho do texto, lembrado neste aparelho quando possível. */
export function useFontScale() {
  const [index, setIndex] = useState(readStoredIndex)

  useEffect(() => {
    document.documentElement.style.setProperty('--reading-scale', String(FONT_SCALES[index]))
    try {
      window.localStorage.setItem(STORAGE_KEY, String(index))
    } catch {
      // Armazenamento indisponível (ex.: navegação privada): a escolha vale só nesta visita.
    }
  }, [index])

  return {
    canDecrease: index > 0,
    canIncrease: index < FONT_SCALES.length - 1,
    decrease: () => setIndex((current) => Math.max(0, current - 1)),
    increase: () => setIndex((current) => Math.min(FONT_SCALES.length - 1, current + 1)),
  }
}
