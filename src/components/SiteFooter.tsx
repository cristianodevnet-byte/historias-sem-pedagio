import logoUrl from '../assets/sem-pedagio-logo.webp'
import { siteConfig } from '../config/site'

export function SiteFooter() {
  const { channel } = siteConfig
  const logo = <img src={logoUrl} alt={channel.name} width="180" height="103" loading="lazy" decoding="async" />

  return (
    <footer className="site-footer">
      <p className="site-footer__intro">Uma experiência do canal</p>
      {channel.url ? (
        <a className="channel-badge" href={channel.url} target="_blank" rel="noopener noreferrer">
          {logo}
          <span className="channel-badge__cta">
            Assistir no YouTube <span aria-hidden="true">↗</span>
          </span>
        </a>
      ) : (
        <div className="channel-badge">{logo}</div>
      )}
      <p className="site-footer__name">{siteConfig.name}</p>
      <p>Leitura gratuita, sem cadastro e sem anúncios.</p>
    </footer>
  )
}
