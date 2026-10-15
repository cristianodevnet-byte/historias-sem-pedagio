import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Fonte hospedada junto com o site (sem serviço externo). O navegador só baixa
// o subconjunto latino; os demais idiomas ficam no build, mas não são carregados.
import '@fontsource-variable/literata/wght.css'
import '@fontsource-variable/literata/wght-italic.css'
import './styles/global.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
