import { siteConfig } from '../config/site'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p className="site-footer__name">{siteConfig.name}</p>
      <p>Uma experiência do canal {siteConfig.channel.name}.</p>
      <p>Leitura gratuita, sem cadastro e sem anúncios.</p>
    </footer>
  )
}
