import { Fragment } from 'react'
import type { Story } from '../content/types'
import { ChannelNote } from './ChannelNote'
import { RoadLine } from './RoadLine'
import { ShareButton } from './ShareButton'

interface StoryArticleProps {
  story: Story
  /** Rótulo acima do título, ex.: "A história de hoje". */
  eyebrow: string
  /** Data exibida ao lado do rótulo, quando fizer sentido. */
  dateLabel?: string
}

/**
 * A ilustração entra depois do segundo parágrafo: assim a leitura começa já
 * na primeira tela, e a imagem funciona como uma pausa.
 */
const IMAGE_AFTER_PARAGRAPH = 2

export function StoryArticle({ story, eyebrow, dateLabel }: StoryArticleProps) {
  const headingId = `titulo-${story.id}`
  const imagePosition = Math.min(IMAGE_AFTER_PARAGRAPH, story.paragraphs.length) - 1

  return (
    <article className="story" aria-labelledby={headingId}>
      <header className="story__header">
        <p className="eyebrow">
          <span>{eyebrow}</span>
          {dateLabel && (
            <>
              <span className="eyebrow__dot" aria-hidden="true">·</span>
              <span>{dateLabel}</span>
            </>
          )}
        </p>
        <h1 id={headingId} className="story__title">
          {story.title}
        </h1>
        {story.subtitle && <p className="story__subtitle">{story.subtitle}</p>}
        <p className="story__meta">
          {story.readingMinutes} min de leitura
          {story.provisional && <span className="tag">Texto de demonstração</span>}
        </p>
      </header>

      <RoadLine />

      <div className="story__body">
        {story.paragraphs.map((paragraph, index) => (
          <Fragment key={index}>
            <p>{paragraph}</p>
            {index === imagePosition && story.imageUrl && (
              <figure className="story__figure">
                <img src={story.imageUrl} alt={story.imageAlt ?? ''} decoding="async" />
              </figure>
            )}
          </Fragment>
        ))}
      </div>

      <footer className="story__ending">
        <RoadLine ending />
        <p className="story__end-mark">Fim da viagem</p>
        <ShareButton story={story} />
        <ChannelNote />
      </footer>
    </article>
  )
}
