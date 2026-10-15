import type { ReactNode } from 'react'
import { RoadLine } from './RoadLine'

interface NoticePanelProps {
  eyebrow: string
  title: string
  children: ReactNode
}

/** Estado sem história: dia ainda sem conteúdo ou link inexistente. */
export function NoticePanel({ eyebrow, title, children }: NoticePanelProps) {
  return (
    <section className="notice" aria-labelledby="notice-title">
      <p className="eyebrow">{eyebrow}</p>
      <h1 id="notice-title" className="notice__title">
        {title}
      </h1>
      <RoadLine ending />
      <div className="notice__body">{children}</div>
    </section>
  )
}
