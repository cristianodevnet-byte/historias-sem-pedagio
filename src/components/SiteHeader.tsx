import type { ReactNode } from 'react'
import { siteConfig } from '../config/site'

export function SiteHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label={`${siteConfig.name}: página inicial`}>
        <span className="brand__kicker">Histórias</span>
        <span className="brand__name">Sem Pedágio</span>
      </a>
      {children}
    </header>
  )
}
