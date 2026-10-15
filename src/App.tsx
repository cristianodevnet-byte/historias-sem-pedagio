import { FontSizeControl } from './components/FontSizeControl'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import { HomePage } from './pages/HomePage'

export default function App() {
  return (
    <div className="page">
      <a className="skip-link" href="#conteudo">
        Ir para a história
      </a>
      <SiteHeader>
        <FontSizeControl />
      </SiteHeader>
      <main id="conteudo" className="content" tabIndex={-1}>
        <HomePage />
      </main>
      <SiteFooter />
    </div>
  )
}
