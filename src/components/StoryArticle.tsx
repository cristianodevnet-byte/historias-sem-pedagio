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

export function StoryArticle({ story, eyebrow, dateLabel }: StoryArticleProps) {
  const headingId = `titulo-${story.id}`

  return (
    <article className={story.imageUrl ? 'story story--with-image' : 'story'} aria-labelledby={headingId}>
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

      {/* Ilustração horizontal (3:2) logo abaixo do título: título, imagem e
          começo do texto cabem juntos na primeira tela do celular. */}
      {story.imageUrl && (
        <figure className="story__figure">
          <img
            src={story.imageUrl}
            alt={story.imageAlt ?? ''}
            width="1200"
            height="800"
            decoding="async"
            fetchPriority="high"
          />
        </figure>
      )}

      <RoadLine />

      <div className="story__body">
        {story.paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
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
