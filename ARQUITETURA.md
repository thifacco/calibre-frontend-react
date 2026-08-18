# Arquitetura — Calibre front-end

Documento de referência do front-end. A fonte da verdade do escopo é o brief de produto (`calibre-frontend-brief.md`, fora do repositório); este arquivo traduz o brief em decisões técnicas do repositório.

O back-end vive em repositório separado (`calibre-backend-node`) e roda em `http://localhost:4000`. A seção [Contrato de API](#contrato-de-api) aqui é **espelho** do contrato definido lá — não é a fonte da verdade. Se divergir, o back-end manda e este arquivo é que está desatualizado.

## Camadas

```
/app                    → SOMENTE rotas (Next.js App Router)
  layout.tsx            → shell: header fixo + ApiProvider
  page.tsx              → landing
  cadastro/page.tsx
  dashboard/page.tsx

/domain                 → features, organizadas por domínio de negócio
  /feed
    /components         → FeedList, FeedPost, FeedSearch, FeedEmpty
    /hooks              → useFeed, useInfiniteScroll
    /services           → feedService.ts
    types.ts
  /collection-item
    /components         → CollectionItemList, CollectionItemRow, NewItemForm,
                          ReactionBar, CommentForm
    /hooks              → useUserItems, useCreateItem, useReaction, useComment
    /services           → collectionItemService.ts, reactionService.ts,
                          commentService.ts
    types.ts
  /auth
    /components         → RegisterForm, LoginForm, RequireAuth
    /hooks              → useRegister, useLogin, useSession
    /services           → authService.ts
    types.ts
  /shared
    /services           → httpClient.ts (único ponto que sabe falar HTTP), ApiError.ts
    /context            → ApiContext.tsx
    /components         → AppHeader.tsx, MainNavSheet.tsx
    types.ts            → tipos do contrato, espelhados do back-end

/components/ui          → shadcn/ui (gerado pela CLI, não editar à mão)
```

`/shared/context` e `/shared/components` são extensão da estrutura do brief. O brief lista só `services` em `/shared`, mas o `ApiContext` e o header são compartilhados por todos os domínios e não pertencem a nenhum deles — pendurá-los em `/auth` ou `/feed` criaria dependência invertida entre domínios.

### Dependência entre domínios

```
feed → collection-item → shared
auth → shared
```

Unidirecional. `feed` compõe `ReactionBar` e `CommentForm` de `collection-item` porque reagir e comentar são operações **sobre um item**, não sobre o feed — o feed só é onde elas aparecem. `collection-item` nunca importa de `feed`.

## Fluxo de dados

```
componente → hook → service → httpClient → back-end
```

Regra não negociável, e cada seta existe por um motivo específico:

- **O componente nunca chama `fetch`/`axios`.** Ele recebe dados e callbacks prontos do hook.
- **O hook nunca sabe de URL nem de endpoint.** Ele orquestra estado (`loading`, `error`, dados) e chama o service. Trocar `/api/feed` de lugar não deve tocar em nenhum hook.
- **O service não conhece React.** Nenhum hook dentro dele, nenhum import de `react`. É função pura que recebe argumentos e devolve `Promise`. É o que permite testá-lo sem renderizar nada.
- **O token chega como parâmetro.** Nunca por import, variável de módulo ou global. Quem resolve o token é o hook, lendo o `ApiContext`.

Assinatura dos services — o token, quando existe, é sempre o último parâmetro e sempre explícito:

```ts
// público
feedService.getFeed(params: { cursor?: string; q?: string }): Promise<FeedResponse>
authService.register(input: RegisterInput): Promise<UserResponse>
authService.login(input: LoginInput): Promise<SessionResponse>

// autenticado
collectionItemService.listByUser(userId: string, token: string): Promise<UserItemsResponse>
collectionItemService.create(input: NewCollectionItemInput, token: string): Promise<FeedItem>
reactionService.react(itemId: string, type: ReactionType, token: string): Promise<ReactionResponse>
commentService.comment(itemId: string, content: string, token: string): Promise<CommentResponse>
```

Um service com `token: string` na assinatura torna impossível esquecer de passá-lo — o TypeScript reclama. Um service que lê o token de um singleton compila e falha em runtime.

### httpClient

Único módulo que conhece `fetch`, a base URL e o shape de erro do back-end.

```ts
request<T>(path: string, options?: {
  method?: "GET" | "POST";
  body?: unknown;
  token?: string;
  query?: Record<string, string | number | undefined>;
}): Promise<T>
```

Responsabilidades, e só estas:

- prefixar `process.env.NEXT_PUBLIC_API_URL` — local ela é **vazia**, e o caminho fica relativo (`/api/feed`), que é o que o proxy do Next intercepta (ver [Pendências com o back-end](#1-não-existe-cors-no-back-end--resolvido-por-proxy));
- montar query string ignorando chaves `undefined` (o `cursor` da primeira página é ausente, não vazio);
- montar `Authorization: Bearer <token>` quando `token` vier;
- traduzir resposta não-ok em `ApiError` e resposta ok em `T`.

Não faz retry, não faz cache, não redireciona. Redirecionar é decisão de UI e vive no hook.

### ApiError

O back-end responde erro sempre como `{ error: { message, details? } }`. O `httpClient` converte isso em uma classe:

```ts
class ApiError extends Error {
  status: number;
  details?: Array<{ field: string; message: string }>;
}
```

Sem essa tradução, cada hook precisaria destrinchar JSON de erro na mão. Com ela, o hook faz `if (err instanceof ApiError && err.status === 409)` e decide o que a tela mostra.

## Estado

- `useState` para estado local de componente.
- `ApiContext` (Context API) para sessão. **Sem Redux, sem Zustand, sem React Query** nesta fase — é decisão do brief, não omissão.
- `useCallback` em toda função passada como prop ou usada como dependência de outro hook. Sem isso, `useInfiniteScroll` reassina o `IntersectionObserver` a cada render e dispara paginação em loop.

### ApiContext e sessão

Guarda o que o login devolve, mais os comandos que o mudam:

```ts
{
  status: "loading" | "authenticated" | "anonymous";
  session: { token: string; userId: string; userName: string } | null;
  signIn(session): void;
  signOut(): void;
}
```

Persistido em `localStorage` sob a chave `calibre.session`, para o dashboard sobreviver a um F5.

**O `status: "loading"` não é decorativo.** No primeiro render o contexto ainda não leu o `localStorage` — isso só acontece no efeito, depois da hidratação. Um componente que trate "sem sessão no primeiro render" como "não autenticado" vai redirecionar o dashboard para `/cadastro` toda vez que a página recarregar, mesmo com sessão válida. `RequireAuth` só decide quando `status !== "loading"`.

### Expiração de token

O JWT do back-end expira. Qualquer `ApiError` com `status: 401` numa rota autenticada significa sessão morta: o hook chama `signOut()` e manda para `/cadastro`. Não existe refresh token no contrato.

## Roteamento e fronteira server/client

`/app/**/page.tsx` são Server Components finos — compõem componentes de `/domain` e nada mais. Todo componente de `/domain` que usa hook, estado ou evento carrega `"use client"`.

**Nesta fase nenhum dado é buscado no servidor.** O token vive no browser e todo hook depende dele; buscar dados no servidor exigiria um segundo caminho de dados que não passa por `componente → hook → service` — exatamente a regra que o brief marca como prioridade máxima.

O feed é público e poderia ser renderizado no servidor. É otimização de SEO e first paint deliberadamente adiada. Consequência aceita: a primeira pintura da landing é o esqueleto do feed, não o conteúdo.

## Contrato de API

Espelho do back-end. As rotas abaixo são o que o back-end expõe em `localhost:4000`; local o front as chama em caminho relativo e o proxy do Next encaminha.

| Método | Rota | Auth | Body / Query | Resposta |
|---|---|---|---|---|
| POST | `/api/users` | não | `{ name, email, password }` | 201 `{ id, name, email, createdAt }` |
| POST | `/api/session` | não | `{ email, password }` | 200 `{ token, userId, name }` |
| GET | `/api/feed` | não | `?cursor=&q=` | 200 `{ items, nextCursor }` |
| POST | `/api/items` | Bearer | `NewCollectionItemInput` | 201 `FeedItem` |
| GET | `/api/items` | Bearer | `?userId=` | 200 `{ items: FeedItem[] }` |
| POST | `/api/items/:id/reactions` | Bearer | `{ type }` | 201 `{ reactionCounts }` |
| POST | `/api/items/:id/comments` | Bearer | `{ content }` | 201 `CommentResponse` |

```ts
type ReactionType = "TOUCHED" | "CURIOUS" | "SAME_STORY";
type MovementType = "MANUAL" | "AUTOMATIC" | "QUARTZ" | "ECO_DRIVE" | "SPRING_DRIVE" | "OTHER";

interface FeedItem {
  id: string; userId: string; userName: string;
  brand: string; model: string;
  referenceNumber?: string; movementType?: MovementType;
  acquiredYear?: number; acquiredContext?: string;
  memoryStory: string; photos: string[];
  reactionCounts: { touched: number; curious: number; sameStory: number };
  commentCount: number; createdAt: string;
}
```

`userName` vem desnormalizado — o front não faz join nem busca usuário separado.

### Erros que a UI precisa tratar

| Status | Quando | O que a tela faz |
|---|---|---|
| 400 | validação | mostra `details[].message` no campo correspondente (`details[].field` casa com o `name` do input) |
| 401 | token ausente/expirado; credenciais erradas no login | login: erro no formulário. Rota autenticada: `signOut()` + `/cadastro` |
| 404 | item inexistente | remove o post da lista |
| 409 | e-mail já cadastrado; reação duplicada | cadastro: erro no campo e-mail. Reação: mantém o estado, não é falha de verdade |

O 409 de reação duplicada é comportamento normal, não erro: o usuário clicou duas vezes na mesma reação. A UI não mostra alerta vermelho para isso.

### Validações que o front replica

Espelham os schemas zod do back-end, para dar feedback antes do round-trip:

| Campo | Regra |
|---|---|
| `password` | mínimo 8 caracteres |
| confirmação de senha | idêntica a `password` — **só existe no front**, o back-end não conhece esse campo |
| `brand`, `model` | obrigatórios, máx. 120 |
| `memoryStory` | obrigatório, máx. 10000 |
| `acquiredYear` | inteiro, entre 1800 e o ano corrente |
| `photos` | array de URLs válidas, máx. 10 |
| `q` (busca) | máx. 100 |

### Paginação do feed

Cursor, não offset. O `nextCursor` é string opaca — o front devolve exatamente o que recebeu, sem interpretar. `nextCursor: null` é fim da lista.

`useFeed` acumula páginas em um array e `useInfiniteScroll` observa um sentinela no fim da lista com `IntersectionObserver`. Trocar o `q` **descarta as páginas acumuladas e zera o cursor** — cursor de uma busca não vale para outra. A busca é debounced (300ms) para não disparar uma requisição por tecla.

## Design system

**shadcn/ui** — componentes copiados para `/components/ui`, Tailwind para estilo, Radix garantindo ARIA nativo por baixo. Não é dependência de pacote fechado: o código é nosso e pode ser editado, mas só quando houver motivo — o padrão é usar como veio.

Tom "atelier de relojoaria":

| Papel | Escolha |
|---|---|
| Fundo | preto / grafite |
| Texto | neutros claros, com hierarquia primário / secundário / muted |
| Destaque | dourado envelhecido |
| Títulos | serifada — remete a mostrador clássico |
| Corpo | sans-serif |

Definidos como CSS variables no `globals.css` e expostos como tokens do Tailwind, para nenhuma cor literal aparecer em componente.

**Header fixo**: logo à esquerda, menu hambúrguer à direita — inclusive em desktop, é decisão de identidade, não de responsividade. O menu abre um `Sheet` do shadcn com Feed, Cadastro/Entrar e Dashboard.

## Requisito AI-first

O alvo é o agente **Claude in Chrome** operar o produto de ponta a ponta. Não é acessibilidade genérica: é um requisito funcional testável.

- HTML semântico real. `<button>`, `<form>`, `<input>` com `<label for>` associado. **Nunca `<div onClick>`** — é o erro que quebra navegação por DOM e o que shadcn/Radix já evita quando usado como veio.
- `aria-label` descritivo em todo botão de ícone.
- `id` e `name` **estáveis e previsíveis**. Nada de `useId()` nem id gerado em build para campo de formulário — o agente precisa que o seletor de hoje valha amanhã.
- `data-testid` nos elementos-chave.

Nomes fixados agora, para o scaffold não inventar variação depois:

| Elemento | `id` | `name` | `data-testid` |
|---|---|---|---|
| Busca do feed | `feed-busca` | `q` | `campo-busca` |
| Post do feed | — | — | `post-feed` |
| Reação "Me tocou" | — | — | `botao-reacao-touched` |
| Reação "Quero saber mais" | — | — | `botao-reacao-curious` |
| Reação "Tenho uma história parecida" | — | — | `botao-reacao-same-story` |
| Comentar | — | — | `botao-comentar` |
| Menu hambúrguer | — | — | `botao-menu` |
| Cadastro — nome | `cadastro-nome` | `name` | — |
| Cadastro — e-mail | `cadastro-email` | `email` | — |
| Cadastro — senha | `cadastro-senha` | `password` | — |
| Cadastro — confirmação | `cadastro-senha-confirmacao` | `passwordConfirmation` | — |
| Cadastro — enviar | — | — | `botao-cadastro` |
| Login — e-mail | `login-email` | `email` | — |
| Login — senha | `login-senha` | `password` | — |
| Login — enviar | — | — | `botao-login` |
| Item — marca | `item-marca` | `brand` | — |
| Item — modelo | `item-modelo` | `model` | — |
| Item — referência | `item-referencia` | `referenceNumber` | — |
| Item — movimento | `item-movimento` | `movementType` | — |
| Item — ano | `item-ano` | `acquiredYear` | — |
| Item — contexto | `item-contexto` | `acquiredContext` | — |
| Item — fotos | `item-fotos` | `photos` | — |
| Item — memória | `item-memoria` | `memoryStory` | — |
| Item — enviar | — | — | `botao-adicionar-item` |

Os `id` e `data-testid` do cadastro e do formulário de item vieram dos wireframes — mantidos literalmente para não quebrar continuidade.

## Pendências com o back-end

Três lacunas reais do contrato atual. Nenhuma se resolve dentro deste repositório sozinha.

### 1. Não existe CORS no back-end — resolvido por proxy

`src/app.ts` do `calibre-backend-node` não monta nenhum middleware de CORS. Front em `localhost:3000` chamando `localhost:4000` direto é cross-origin: **toda requisição do browser falharia**, inclusive o feed público.

**Decisão: proxy via `rewrites` do Next**, sem tocar no back-end.

```ts
// next.config.ts
async rewrites() {
  return [{
    source: "/api/:path*",
    destination: `${process.env.API_PROXY_TARGET ?? "http://localhost:4000"}/api/:path*`,
  }];
}
```

O browser passa a falar só com `localhost:3000`. Como é same-origin, não existe preflight nem cabeçalho de CORS para configurar.

Isso divide a configuração em duas variáveis com papéis distintos:

| Variável | Onde vive | Valor local | Papel |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | browser, lida pelo `httpClient` | vazio | prefixo das URLs. Vazio = same-origin, e o `httpClient` monta `/api/feed` |
| `API_PROXY_TARGET` | servidor Next, lida pelo `next.config.ts` | `http://localhost:4000` | para onde o rewrite encaminha |

`NEXT_PUBLIC_API_URL` continua existindo como o brief pede e não vira enfeite: preenchê-la com uma origem real faz o `httpClient` chamar o back-end direto e o proxy sair do caminho. É a saída quando houver deploy — aí sim o back-end precisa de `cors`.

Custo aceito: no ambiente local a fronteira entre os dois serviços fica invisível no DevTools — toda requisição aparece como `localhost:3000`. Quem for depurar erro de rede precisa olhar o log do `next dev`, não só a aba Network.

### 2. Foto é URL, não upload

`POST /api/items` valida `photos` como array de URLs (`z.url()`, máx. 10). Não existe endpoint de upload nem storage no back-end. O wireframe do dashboard mostra uma drop zone de arquivo — não é implementável nesta fase.

Nesta fase o campo é um input de URL. A drop zone volta quando houver upload no contrato.

### 3. Não existe rota para listar comentários

O contrato tem `POST /api/items/:id/comments`, mas nenhum `GET`. O `FeedItem` traz `commentCount`, não os comentários.

Nesta fase o usuário posta um comentário e vê o contador subir — não existe thread visível. Exibir conversa exige rota nova no back-end.

## Invariantes

Regras que se violam por padrão quando ninguém avisa.

- **Componente nunca chama HTTP.** Sempre componente → hook → service. Um `fetch` dentro de componente ou de hook quebra a única camada testável sem React.
- **Service não importa React.** Nem `useState`, nem `useCallback`, nem contexto. Se precisou, a lógica está na camada errada.
- **Token chega por parâmetro.** Nunca por import, módulo global ou leitura direta de `localStorage` dentro do service. Quem lê o `ApiContext` é o hook.
- **Página de `/app` é fina.** Só compõe componentes de `/domain`. Regra de negócio, estado e chamada de dados não moram em `page.tsx`.
- **`id` e `name` de formulário são estáveis.** Nada de `useId()` em campo de formulário — é requisito AI-first, não preferência estética.
- **Nada de `<div onClick>`.** Elemento interativo é `<button>`, `<a>` ou input real.
- **Mudar o contrato é breaking change.** O back-end vive em outro repositório — sincronizar antes, nunca depois.
- **Nada de dado físico nem de encontro.** Sem geolocalização, endereço ou dado físico de usuário em nenhuma tela; sem "match". O Calibre é um clube, não uma ferramenta de matching.
- **Nunca commitar direto na `main`.** Criar branch antes (`git checkout -b <tipo>/<descricao>`), commitar nela e abrir PR.
