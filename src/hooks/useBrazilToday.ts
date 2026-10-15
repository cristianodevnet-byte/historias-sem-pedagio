import { useEffect, useState } from 'react'
import { getBrazilDate, isSameCivilDate, type CivilDate } from '../lib/calendar'

/** Intervalo de verificação da virada do dia. */
const CHECK_INTERVAL_MS = 30_000

/**
 * Data atual em Brasília, atualizada sozinha quando o dia muda, inclusive com
 * a página aberta. Também verifica ao voltar para a aba, pois celulares
 * suspendem temporizadores de páginas em segundo plano.
 */
export function useBrazilToday(): CivilDate {
  const [today, setToday] = useState(() => getBrazilDate())

  useEffect(() => {
    const refresh = () => {
      const now = getBrazilDate()
      setToday((current) => (isSameCivilDate(current, now) ? current : now))
    }
    const timer = window.setInterval(refresh, CHECK_INTERVAL_MS)
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  return today
}
