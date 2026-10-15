/**
 * Configuração central do projeto.
 *
 * Tudo o que identifica o site (nome, textos, endereços) fica aqui, para que
 * possa ser alterado sem mexer nos componentes.
 */
export const siteConfig = {
  name: 'Histórias Sem Pedágio',
  /** Linha curta usada abaixo do nome e nos metadados. */
  tagline: 'Uma história curta por dia, para ler no caminho.',

  /**
   * Dia em que a história nº 1 aparece (AAAA-MM-DD, horário de Brasília).
   * A partir dele, uma história por dia, em ordem; ao chegar na última, o
   * ciclo recomeça na nº 1. Alterar esta data muda a história de todos os dias.
   */
  rotationStart: '2026-10-14',

  /**
   * Endereço público do site (Cloudflare Workers).
   * PROVISÓRIO: só passe `siteUrlConfirmed` para `true` depois que o projeto
   * estiver publicado e o endereço abrir de verdade.
   */
  siteUrl: 'https://historias-sem-pedagio.workers.dev',
  siteUrlConfirmed: false,

  channel: {
    name: 'Sem Pedágio',
    /**
     * PENDENTE: endereço do canal no YouTube.
     * Enquanto for `null`, o site cita o canal apenas pelo nome, sem link.
     * Exemplo de preenchimento: 'https://www.youtube.com/@seu-canal'
     */
    url: null as string | null,
  },
} as const
