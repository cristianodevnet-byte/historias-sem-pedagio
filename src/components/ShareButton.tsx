import { useEffect, useState } from 'react'
import type { Story } from '../content/types'
import { buildStoryUrl } from '../lib/links'

type Feedback = 'idle' | 'copied' | 'failed'

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Alternativa para navegadores sem a API de área de transferência.
    const field = document.createElement('textarea')
    field.value = text
    field.setAttribute('readonly', '')
    field.style.position = 'fixed'
    field.style.opacity = '0'
    document.body.append(field)
    field.select()
    const copied = document.execCommand('copy')
    field.remove()
    return copied
  }
}

export function ShareButton({ story }: { story: Story }) {
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const url = buildStoryUrl(story.id, window.location.origin)

  useEffect(() => {
    if (feedback === 'idle') return
    const timer = window.setTimeout(() => setFeedback('idle'), 4000)
    return () => window.clearTimeout(timer)
  }, [feedback])

  const share = async () => {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: story.title, text: `${story.title}: uma história Sem Pedágio`, url })
        return
      } catch (error) {
        // O visitante fechou a janela de compartilhamento: nada a fazer.
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }
    setFeedback((await copyText(url)) ? 'copied' : 'failed')
  }

  return (
    <div className="share">
      <button type="button" className="button" onClick={share}>
        <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Compartilhar história
      </button>
      <p className="share__feedback" role="status" aria-live="polite">
        {feedback === 'copied' && 'Link copiado. É só colar onde quiser.'}
        {feedback === 'failed' && (
          <>
            Não foi possível copiar. O link é: <span className="share__url">{url}</span>
          </>
        )}
      </p>
    </div>
  )
}
