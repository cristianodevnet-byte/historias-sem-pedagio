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
   * Endereço público do site (Cloudflare Workers). É o endereço do QR Code:
   * não mude o nome do projeto nem o subdomínio "sempedagio" da conta, ou o
   * QR Code impresso deixa de funcionar.
   */
  siteUrl: 'https://historias-sem-pedagio.sempedagio.workers.dev',
  siteUrlConfirmed: true,

  channel: {
    name: 'Sem Pedágio',
    /** Endereço do canal no YouTube. Com `null`, o site cita o canal só pelo nome, sem link. */
    url: 'https://www.youtube.com/@SemPed%C3%A1gio-h5c' as string | null,
  },
} as const
