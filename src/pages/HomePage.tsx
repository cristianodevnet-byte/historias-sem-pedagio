import { useEffect, useMemo } from 'react'
import { NoticePanel } from '../components/NoticePanel'
import { StoryArticle } from '../components/StoryArticle'
import { siteConfig } from '../config/site'
import { catalog, rotationStart } from '../content'
import { useBrazilToday } from '../hooks/useBrazilToday'
import { formatLongDate, parseDateOverride } from '../lib/calendar'
import { readDateParam, readStoryId } from '../lib/links'
import { resolveView, type StoryView } from '../lib/stories'

function pageTitle(view: StoryView): string {
  if (view.kind === 'daily' || view.kind === 'shared') return `${view.story.title} | ${siteConfig.name}`
  return siteConfig.name
}

export function HomePage() {
  const realToday = useBrazilToday()
  const search = window.location.search
  const requestedId = useMemo(() => readStoryId(search), [search])

  // Em desenvolvimento, ?data=MM-DD (ou AAAA-MM-DD) simula outro dia. Ignorado em produção.
  const override = import.meta.env.DEV ? parseDateOverride(readDateParam(search), realToday) : null
  const today = override ?? realToday

  const view = resolveView(catalog, { requestedId, today, start: rotationStart ?? today })
  const title = pageTitle(view)

  useEffect(() => {
    document.title = title
  }, [title])

  switch (view.kind) {
    case 'daily':
      return (
        <StoryArticle
          key={view.story.id}
          story={view.story}
          eyebrow="A história de hoje"
          dateLabel={formatLongDate(view.date)}
        />
      )

    case 'shared':
      return (
        <>
          <StoryArticle
            key={view.story.id}
            story={view.story}
            eyebrow={view.isToday ? 'A história de hoje' : 'Uma história Sem Pedágio'}
            dateLabel={view.isToday ? formatLongDate(view.date) : undefined}
          />
          {!view.isToday && (
            <p className="return-link">
              <a href="/">Ler a história de hoje →</a>
            </p>
          )}
        </>
      )

    case 'empty':
      return (
        <NoticePanel eyebrow={formatLongDate(view.date)} title="A primeira história ainda está a caminho.">
          <p>Volte em breve: o endereço é sempre o mesmo.</p>
        </NoticePanel>
      )

    case 'shared-missing':
      return (
        <NoticePanel eyebrow="Link sem destino" title="Esta história saiu da estrada.">
          <p>O endereço pode ter sido digitado incompleto, ou a história foi retirada.</p>
          <p>
            <a href="/">Ler a história de hoje →</a>
          </p>
        </NoticePanel>
      )
  }
}
