# Histórias Sem Pedágio

Uma história curta por dia, para ler no caminho.

Os passageiros escaneiam um QR Code dentro do carro e caem direto na história do dia: sem cadastro, sem anúncio, sem instalar nada. O projeto é ligado ao canal do YouTube **Sem Pedágio**, que aparece apenas de forma discreta no fim da leitura.

- As histórias se revezam em rodízio, uma por dia. Ao chegar na última, o ciclo recomeça.
- A história muda sozinha à meia-noite de Brasília, mesmo com a página aberta.
- Cada história tem um link permanente para compartilhar.
- O site é estático: funciona de graça na Cloudflare, sem servidor nem banco de dados.

---

## Tecnologias

| Item | Uso |
| --- | --- |
| React 19 + TypeScript | Interface |
| Vite | Servidor local e build |
| Vitest | Testes automatizados |
| Oxlint | Verificação de código |
| Literata (via Fontsource) | Fonte de leitura, hospedada junto com o site |

## Requisitos

- [Node.js](https://nodejs.org) 22 ou superior (o projeto foi feito com o Node 24; o arquivo `.node-version` informa a versão à Cloudflare)
- npm, que já vem com o Node
- [Git](https://git-scm.com/download/win), para enviar ao GitHub

## Instalação e execução local

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente `http://localhost:5173`).

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Abre o site localmente, atualizando a cada alteração |
| `npm test` | Roda os testes |
| `npm run lint` | Procura problemas no código |
| `npm run build` | Verifica tipos, roda os testes e gera o site em `dist/` |
| `npm run preview` | Abre localmente o site já gerado em `dist/` |
| `npm run historias:relatorio` | Lista as histórias do rodízio e quais já têm imagem |
| `npm run historias:importar -- arquivo.json` | Importa várias histórias de uma vez |
| `npm run historias:indice` | Atualiza o `INDICE_EDITORIAL.md` (títulos, verdades, referências, notas) |
| `npm run imagens:gerar` | Gera as ilustrações que faltam com a API da OpenAI |
| `npm run imagens:otimizar` | Prepara ilustrações feitas em outra ferramenta (`imagens-originais/`) |

> O `build` roda os testes antes de gerar o site. Se alguma história tiver erro (número repetido ou faltando, imagem sem descrição, etc.), o build falha e **nada quebrado é publicado**.

## Estrutura do projeto

```
├── index.html                 Página base: idioma, título, descrição, metadados
├── public/
│   ├── favicon.svg            Ícone do site
│   ├── _headers               Cabeçalhos de cache da Cloudflare
│   └── robots.txt
├── imagens-originais/         Imagens em alta resolução (não vão para o GitHub)
├── scripts/
│   ├── import-stories.mjs     Importação de histórias em lote
│   ├── stories-report.mjs     Relatório do rodízio
│   └── optimize-images.mjs    Otimização das ilustrações
└── src/
    ├── config/site.ts         ⚙️ Nome, textos, início do rodízio, site e canal
    ├── content/
    │   ├── stories/           ✍️ As histórias: um arquivo JSON por história
    │   ├── images/            🖼️ Ilustrações otimizadas (geradas pelo script)
    │   ├── types.ts           Formato de uma história
    │   ├── index.ts           Carrega histórias e imagens automaticamente
    │   └── content.test.ts    Verifica as histórias reais
    ├── lib/
    │   ├── calendar.ts        Data de Brasília, contagem de dias, formatação
    │   ├── catalog.ts         Validação e montagem do catálogo
    │   ├── stories.ts         Rodízio: escolha da história do dia e do link
    │   ├── links.ts           Links permanentes (?historia=...)
    │   ├── readingTime.ts     Tempo de leitura
    │   └── *.test.ts          Testes de cada parte
    ├── hooks/
    │   ├── useBrazilToday.ts  Troca automática do dia
    │   └── useFontScale.ts    Ajuste do tamanho do texto
    ├── components/            Peças visuais (cabeçalho, história, botão...)
    ├── pages/HomePage.tsx     Decide o que a página mostra
    ├── styles/global.css      Identidade visual (cores, tipografia)
    ├── App.tsx
    └── main.tsx
```

---

## Histórias

### Formato de uma história

Cada história é um arquivo em `src/content/stories/`, chamado **`NN-id.json`**, em que `NN` é a posição no rodízio. Exemplo: `01-o-que-a-mao-esquerda-sabia.json`.

```json
{
  "id": "o-que-a-mao-esquerda-sabia",
  "order": 1,
  "title": "O que a mão esquerda sabia",
  "paragraphs": [
    "Primeiro parágrafo.",
    "— Um diálogo também é um parágrafo.",
    "Último parágrafo."
  ],
  "imageAlt": "Descrição da ilustração para quem usa leitor de tela.",
  "meta": {
    "bibleReference": "Mateus 6:1-4",
    "illustrationPrompt": "..."
  }
}
```

| Campo | Obrigatório | Descrição |
| --- | --- | --- |
| `id` | sim | Identificador **permanente**, usado no link e no nome da imagem. Só letras minúsculas sem acento, números e hífens. |
| `order` | sim | Posição no rodízio: 1, 2, 3... sem pular números. |
| `title` | sim | Título. |
| `subtitle` | não | Linha de apoio abaixo do título. |
| `paragraphs` | sim | Lista com o texto, um item por parágrafo. |
| `imageAlt` | se houver imagem | Descrição da ilustração, lida por leitores de tela. |
| `provisional` | não | `true` mostra a etiqueta "Texto de demonstração". |
| `readingMinutes` | não | Tempo de leitura. Se omitido, é calculado (180 palavras/minuto). |
| `meta` | não | Registro editorial: tema, verdade explorada, referência bíblica, prompt da ilustração, nota. **Não aparece no site.** |

O texto é exibido exatamente como está no arquivo, sem nenhuma reescrita automática.

### Adicionar uma história

1. Crie o arquivo `src/content/stories/NN-id.json` no formato acima, com o próximo número livre em `order`.
2. Rode `npm test` para conferir.
3. Publique (veja [Atualizar o site](#atualizar-o-site)).

Não é preciso mexer em nenhum código: o site encontra o arquivo sozinho e o ciclo passa a ter um dia a mais.

### Corrigir uma história

Edite o arquivo e publique. **Não mude o `id`** de uma história já divulgada, ou os links compartilhados deixarão de funcionar (quem abrir um link antigo verá a mensagem "Esta história saiu da estrada").

### Substituir uma história

Apague o arquivo antigo e crie o novo com o mesmo `order`. Cada posição só pode ter uma história: os testes acusam números repetidos ou faltando.

### Importar várias histórias de uma vez

Peça ao gerador editorial um **único arquivo JSON com uma lista** de histórias, cada uma no formato acima:

```json
[
  { "id": "...", "order": 1, "title": "...", "paragraphs": ["..."] },
  { "id": "...", "order": 2, "title": "...", "paragraphs": ["..."] }
]
```

Depois rode:

```bash
npm run historias:importar -- caminho/historias.json
```

- Posições que já têm história são **puladas**. Para trocá-las, acrescente `--substituir`.
- Em seguida, rode `npm test` e `npm run historias:relatorio` para conferir o resultado.

---

## Ilustrações

O site mostra uma ilustração horizontal (3:2) por história, logo abaixo do título. No celular, título, imagem e começo do texto cabem juntos na primeira tela. Histórias sem imagem aparecem só com o texto.

### Geração automática (OpenAI)

As imagens são geradas a partir do `illustrationPrompt` de cada história, já com o nome certo, sem nenhum passo manual.

1. Crie uma chave em [platform.openai.com](https://platform.openai.com) (mesmo login do ChatGPT; a API é cobrada à parte, com créditos pré-pagos).
2. Cole a chave no arquivo `.env.local`, na raiz do projeto: `OPENAI_API_KEY=sk-...`. Esse arquivo **não vai para o GitHub**.
3. Rode:

   ```bash
   npm run imagens:gerar
   ```

   - Sem números, gera só as histórias que **ainda não têm imagem**.
   - `npm run imagens:gerar -- 7` refaz a imagem da história 7 (aceita vários números).
   - `--qualidade high` gera com mais qualidade (mais caro); o padrão é `medium`.

O original fica em `imagens-originais/NN-id.png` (fora do GitHub) e a versão do site, recortada em 3:2 com 1200 px de largura em WebP, em `src/content/images/<id>.webp`. Confira as imagens antes de publicar: às vezes o gerador coloca letras ou placas mesmo com o pedido para não colocar. Nesse caso, refaça a imagem daquela história.

### Imagens feitas em outra ferramenta

Salve em `imagens-originais/` com o número da história no começo do nome (`01.png`, `02-gaveta.jpg`...) e rode `npm run imagens:otimizar`.

---

## Como funciona o rodízio

- O dia de início fica em `rotationStart`, no arquivo [`src/config/site.ts`](src/config/site.ts). Hoje está em **14/10/2026**.
- Nesse dia aparece a história nº 1, no dia seguinte a nº 2 e assim por diante. Depois da última, o ciclo recomeça na nº 1. Com 30 histórias, cada uma volta a cada 30 dias.
- O site sempre usa a **data de Brasília** (`America/Sao_Paulo`), não importa o fuso configurado no celular do visitante.
- A página verifica a data a cada 30 segundos e sempre que o visitante volta para a aba. Se o dia virou, a nova história aparece sozinha. Não existe tarefa agendada nem publicação diária.
- **Nunca há dia sem história**, a não ser que a pasta de histórias esteja vazia.
- **Ao adicionar histórias**, o ciclo fica maior e a sequência se reorganiza a partir daquele dia. O QR Code e os links de compartilhamento continuam funcionando normalmente.
- **Ao mudar `rotationStart`**, a história de todos os dias muda. Mude só se quiser reiniciar o ciclo.

### Testar outras datas

Com `npm run dev` rodando, acrescente `?data=` ao endereço:

- `http://localhost:5173/?data=10-15`: simula 15 de outubro deste ano (história nº 2)
- `http://localhost:5173/?data=2026-11-13`: simula o 31º dia, quando o ciclo de 30 recomeça

Esse parâmetro **só funciona no ambiente local**. No site publicado ele é ignorado.

### Links permanentes

- Página inicial (`/`): sempre a história do dia. **É esse endereço que vai no QR Code.**
- `/?historia=id`: uma história específica, em qualquer data. É o link gerado pelo botão "Compartilhar história".

O botão usa o compartilhamento nativo do celular e, quando ele não existe, copia o link.

---

## Configurar o site e o canal

Tudo fica em [`src/config/site.ts`](src/config/site.ts):

```ts
siteUrl: 'https://historias-sem-pedagio.sempedagio.workers.dev',
siteUrlConfirmed: true,           // endereço publicado e testado
channel: {
  name: 'Sem Pedágio',
  url: "https://www.youtube.com/@SemPed%C3%A1gio-h5c",
},
```

O link aparece no fim de cada história e no rodapé, junto com o logo do canal. Se `url` for `null`, o site cita o canal só pelo nome, sem link.

O logo do rodapé fica em `src/assets/sem-pedagio-logo.webp`, exibido sobre uma placa escura porque o "SEM" do logo é branco. Para trocá-lo, substitua esse arquivo (de preferência com fundo transparente, cerca de 360 px de largura).

A identidade do site em si é tipográfica. Cores e fontes ficam em [`src/styles/global.css`](src/styles/global.css), e o ícone em `public/favicon.svg`.

---

## Publicar na Cloudflare

### 1. Enviar o projeto ao GitHub (primeira vez)

Instale o [Git](https://git-scm.com/download/win) e, na pasta do projeto, rode:

```bash
git init -b main
git add .
git commit -m "Primeira versão do Histórias Sem Pedágio"
git remote add origin https://github.com/cristianodevnet-byte/historias-sem-pedagio.git
git push -u origin main
```

> Se o repositório no GitHub já tiver algum arquivo (por exemplo, um README criado pelo site), o `push` será recusado. Nesse caso, rode antes `git pull origin main --allow-unrelated-histories`.

### 2. Criar o projeto na Cloudflare (Workers)

O site é publicado como **Worker com arquivos estáticos**, o caminho atual da Cloudflare (o antigo Pages virou "legado"). A configuração fica no arquivo [`wrangler.jsonc`](wrangler.jsonc): nome do projeto e pasta `dist`.

1. Entre em [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers e Pages** → **Criar aplicativo** → **Importar um repositório**.
2. Escolha o repositório `historias-sem-pedagio`.
3. Configure:
   - **Nome do projeto:** `historias-sem-pedagio` (precisa ser igual ao `name` do `wrangler.jsonc`)
   - **Comando de build:** `npm run build`
   - **Comando de implantação:** `npx wrangler deploy`
4. Clique em **Implantar**.

O plano gratuito é suficiente: arquivos estáticos não têm cobrança nem limite de acessos.

### 3. Depois da primeira publicação

1. Abra o endereço publicado, `https://historias-sem-pedagio.sempedagio.workers.dev`, e confira se tudo funciona. Ele é formado pelo nome do projeto (`historias-sem-pedagio`) e pelo subdomínio da conta (`sempedagio`): **não mude nenhum dos dois** depois de imprimir o QR Code.
2. O endereço já está registrado em `src/config/site.ts` (`siteUrl`) e no `og:url` do `index.html`.

### Atualizar o site

A cada alteração (nova história, correção, etc.):

```bash
npm test
git add .
git commit -m "Adiciona histórias 6 a 10"
git push
```

A Cloudflare publica sozinha em um ou dois minutos.

---

## Gerar o QR Code definitivo

Só gere o QR Code **depois** que o endereço estiver publicado e testado.

1. Use exatamente o endereço da página inicial, sem parâmetros, como está em `siteUrl` no `src/config/site.ts`.
2. Gere um **QR Code estático**. Evite geradores "dinâmicos": eles redirecionam por um serviço de terceiros e podem expirar ou passar a cobrar. Uma opção simples: abra o site no Chrome ou no Edge do computador e use **Compartilhar → Criar código QR**.
3. Teste o código impresso com dois ou três celulares diferentes, em luz forte e fraca.

Como o endereço nunca muda, o mesmo QR Code serve para sempre: a história é que muda a cada dia. Se um dia você usar um domínio próprio, o endereço `.workers.dev` continua funcionando, e o QR Code antigo não perde a validade.

---

## Limitações conhecidas

- **Prévia ao compartilhar:** WhatsApp e redes sociais mostram o mesmo título e a mesma descrição para todas as histórias. Uma prévia própria por história exigiria gerar uma página por história no build. Fica como evolução futura.
- **Imagem de prévia:** ainda não há imagem de prévia do site (`og:image`). Ela pode ser adicionada quando existir uma arte oficial.
- **JavaScript:** o site precisa de JavaScript ativo, o que é o padrão em todos os celulares.
