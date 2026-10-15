/**
 * Registro editorial: informações internas que NÃO aparecem no site.
 * Todos os campos são opcionais.
 */
export interface StoryMeta {
  /** Questão humana predominante. */
  theme?: string
  /** Descoberta central que a história revela. */
  truth?: string
  /** Passagem que inspirou a história, ex.: "Mateus 6:1-4". */
  bibleReference?: string
  /** Como a história se relaciona com o ensinamento. */
  bibleRelation?: string
  emotion?: string
  narrativeType?: string
  /** Prompt para gerar a ilustração em outra ferramenta. */
  illustrationPrompt?: string
  /** Avaliação editorial de 0 a 50. */
  score?: number
  notes?: string
}

/**
 * Formato de cada arquivo em `src/content/stories/*.json`.
 * Veja o README para exemplos e regras.
 */
export interface StoryEntry {
  /** Identificador único e permanente, usado no link: letras minúsculas, números e hífens. */
  id: string
  /** Posição no rodízio: 1, 2, 3... sem pular números. */
  order: number
  title: string
  subtitle?: string
  /** O texto da história, um item por parágrafo. */
  paragraphs: string[]
  /** Descrição da ilustração para leitores de tela. Obrigatória quando houver imagem. */
  imageAlt?: string
  /** Marque como `true` para conteúdo de demonstração ou rascunho. */
  provisional?: boolean
  /** Tempo de leitura em minutos. Se omitido, é calculado automaticamente. */
  readingMinutes?: number
  meta?: StoryMeta
}

/** História pronta para exibição. */
export interface Story extends Readonly<StoryEntry> {
  readonly readingMinutes: number
  /** Endereço da ilustração, quando existir um arquivo com o id da história. */
  readonly imageUrl?: string
}
