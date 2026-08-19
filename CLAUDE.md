# CLAUDE.md

Este arquivo orienta o Claude Code (claude.ai/code) ao trabalhar com o código deste repositório.

## Estado do repositório

Em construção. Já existem o scaffold, o proxy de `/api`, a paleta com shadcn/ui, a camada `/domain/shared` (`httpClient`, `ApiError`, tipos do contrato, `ApiContext`) e o shell (header fixo com menu hambúrguer, skip link, `AppHeader` e `MainNavSheet`).

Falta o conteúdo das páginas: `app/page.tsx` tem só o H1 do slogan, `/cadastro` e `/dashboard` **ainda não existem como rota** (os links do menu apontam para elas e dão 404), e os domínios `feed`, `collection-item` e `auth` não foram criados. `README.md` e `ARQUITETURA.md` são a especificação a partir da qual o resto será construído.

O `httpClient` ainda não foi exercitado contra o back-end em runtime: até agora só passou por typecheck, lint e build. A primeira chamada real acontece quando o domínio `auth` existir.

```bash
npm run dev        # servidor local na porta 3000
npm run build      # build de produção
npm start          # roda o build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

Sem suíte de testes — está fora do escopo desta fase.

### É Next 16, não 15

Instalado: **Next 16.3.1**, React 19.2.8, Tailwind **4**, TypeScript 5, Node 22+.

O `AGENTS.md` na raiz é gerado pelo próprio Next e avisa que esta versão tem breaking changes em relação ao que modelos de linguagem têm de treinamento. **Consulte `node_modules/next/dist/docs/` antes de escrever código de rota, layout ou configuração** — não assuma convenções de Next 15. O arquivo é reescrito a cada `next dev`; commitá-lo junto com o trabalho evita que reapareça como mudança suja.

Tailwind 4 muda a configuração em relação à 3 (sem `tailwind.config.js`, tema em CSS). Isso afeta a instalação do shadcn/ui e a definição da paleta.

## O que é este produto

Front-end do **Calibre**, um clube de colecionadores de relógios onde cada item da coleção carrega uma história de memória emocional, não apenas dados técnicos. Explicitamente *não* é um app de matching ou encontro — a interação entre membros é só social (comentar, reagir), nunca logística. Sem geolocalização, endereço ou dado físico de usuário em lugar nenhum do produto.

Exatamente três rotas, nada além disso nesta fase do MVP:

| Rota | Auth | O que é |
|---|---|---|
| `/` | não | Landing — slogan, busca, feed de histórias com rolagem infinita |
| `/cadastro` | não | Formulário de entrada no clube: nome, e-mail, senha, confirmação |
| `/dashboard` | sim | Coleção do próprio usuário + formulário de novo relógio |

## Contrato com o back-end

O back-end vive em repositório separado (`calibre-backend-node`), roda em `http://localhost:4000` e é a **fonte da verdade** da API — o `ARQUITETURA.md` daqui espelha aquilo, e em caso de divergência quem manda é o back-end.

O back-end não tem middleware de CORS, então o front nunca chama a porta 4000 a partir do browser: o Next proxia `/api/*` para lá.

```
# next.config.ts
rewrites: "/api/:path*" -> `${API_PROXY_TARGET ?? "http://localhost:4000"}/api/:path*`
```

Duas variáveis de ambiente com papéis distintos, ambas necessárias no `.env.local` (ver `.env.example`):

| Variável | Lida por | Valor local | Papel |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | browser, via `httpClient` | **vazia** | Prefixo das URLs. Vazia = same-origin, e o `httpClient` monta `/api/feed`. Preenchê-la com uma origem real faz o front chamar o back-end direto e o proxy sair do caminho — é o caminho do dia do deploy, e aí o back-end precisa de `cors`. |
| `API_PROXY_TARGET` | servidor Next, via `next.config.ts` | `http://localhost:4000` | Para onde o rewrite encaminha. |

Consequência: no DevTools toda requisição aparece como `localhost:3000` — erro de rede se depura no log do `next dev`, não na aba Network.

Sem mock nem fixture nesta fase: **todo dado de tela vem do back-end no ar.** Com `calibre-backend-node` parado, a landing renderiza só o esqueleto do feed. O back-end, por sua vez, exige MongoDB como replica set (as rotas de reação e comentário usam transação e falham em `mongod` standalone).

Superfície da API (shapes completos de request/response, tipo `FeedItem`, tabela de status de erro e regras de validação espelhadas dos schemas zod estão no `ARQUITETURA.md`):

| Método | Rota | Auth |
|---|---|---|
| POST | `/api/users` | não |
| POST | `/api/session` | não |
| GET | `/api/feed` | não |
| POST | `/api/items` | Bearer |
| GET | `/api/items` | Bearer |
| POST | `/api/items/:id/reactions` | Bearer |
| POST | `/api/items/:id/comments` | Bearer |

## Arquitetura — fluxo de dados não negociável

```
componente → hook → service → httpClient → back-end
```

Cada seta existe por um motivo específico e é tratada como invariante, não como preferência de estilo:

- **Componente nunca chama `fetch`/`axios`.** Ele recebe dados e callbacks já resolvidos pelo hook.
- **Hook nunca sabe de URL nem de endpoint.** Ele orquestra estado de `loading`/`error`/dados e chama um service. Mover `/api/feed` de lugar não pode tocar em nenhum hook.
- **Service nunca importa React.** Sem hooks, sem import de `react` dentro de service — é função pura `(args) => Promise`, testável sem renderizar nada.
- **Token chega como parâmetro explícito, sempre por último.** Nunca por import, singleton de módulo, nem service lendo `localStorage`/`ApiContext` direto. Só o hook resolve o token, a partir do `ApiContext`.

```ts
// público
feedService.getFeed(params: { cursor?: string; q?: string }): Promise<FeedResponse>
authService.register(input: RegisterInput): Promise<UserResponse>
authService.login(input: LoginInput): Promise<SessionResponse>

// autenticado — o token é sempre o último parâmetro, sempre explícito
collectionItemService.listByUser(userId: string, token: string): Promise<UserItemsResponse>
collectionItemService.create(input: NewCollectionItemInput, token: string): Promise<FeedItem>
reactionService.react(itemId: string, type: ReactionType, token: string): Promise<ReactionResponse>
commentService.comment(itemId: string, content: string, token: string): Promise<CommentResponse>
```

### Estrutura de pastas (planejada)

```
/app                    → SOMENTE rotas (App Router), Server Components finos
  layout.tsx            → shell: header fixo + ApiProvider
  page.tsx / cadastro/page.tsx / dashboard/page.tsx

/domain                 → features, organizadas por domínio de negócio
  /feed              /collection-item        /auth              /shared
    /components        /components             /components        /services   → httpClient.ts, ApiError.ts
    /hooks             /hooks                  /hooks             /context    → ApiContext.tsx
    /services          /services               /services          /components → AppHeader, MainNavSheet
    types.ts           types.ts                types.ts           types.ts    → tipos do contrato, espelhados do back-end

/components/ui          → shadcn/ui, gerado pela CLI — não editar à mão
```

Dependência entre domínios é unidirecional: `feed → collection-item → shared`, `auth → shared`. `collection-item` nunca importa de `feed` — é `feed` que compõe `ReactionBar`/`CommentForm` de `collection-item`, porque reagir e comentar são operações **sobre um item**, não sobre o feed.

`/app/**/page.tsx` são Server Components finos que só compõem componentes de `/domain` — sem regra de negócio, estado ou busca de dados em arquivo de página. Todo componente de `/domain` que usa hook, estado ou evento precisa de `"use client"`. Nenhum dado é buscado no servidor nesta fase (adiado de propósito, para existir um caminho de dados só).

### httpClient / ApiError

`httpClient.request<T>(path, { method, body, token, query })` é o **único** módulo que conhece `fetch`, a base URL e o shape de erro do back-end. Ele prefixa `NEXT_PUBLIC_API_URL`, monta a query string (descartando chaves `undefined`), põe `Authorization: Bearer <token>` quando recebe um, e traduz resposta não-ok em `ApiError` (`{ status, details?: Array<{field, message}> }`). Sem retry, sem cache, sem lógica de redirecionamento — redirecionar é decisão de UI e vive no hook.

### Estado

- `useState` para estado local de componente.
- `ApiContext` (Context API) para sessão — **sem Redux, sem Zustand, sem React Query** nesta fase; é decisão de escopo, não esquecimento.
- `useCallback` em toda função passada como prop ou usada como dependência de outro hook — sem isso, `useInfiniteScroll` reassina o `IntersectionObserver` a cada render e pode entrar em loop de paginação.
- Shape da sessão: `{ status: "loading" | "authenticated" | "anonymous", session: {token, userId, userName} | null, signIn(), signOut() }`, persistida em `localStorage` sob `calibre.session`.
- `status: "loading"` importa: no primeiro render o contexto ainda não leu o `localStorage` (isso só acontece num efeito, depois da hidratação). Tratar "sem sessão no primeiro render" como "anônimo" joga um dashboard autenticado para `/cadastro` a cada F5. `RequireAuth` precisa esperar `status !== "loading"`.
- Qualquer `401` em rota autenticada significa sessão morta: o hook chama `signOut()` e redireciona para `/cadastro`. Não existe fluxo de refresh token.

## Requisito AI-first

O produto precisa ser plenamente operável de ponta a ponta pelo agente **Claude in Chrome**, não só por humanos — isso é requisito funcional, não polimento genérico de acessibilidade:

- HTML semântico real (`<button>`, `<form>`, `<label for>`) — **nunca `<div onClick>`**.
- `aria-label` em todo botão que é só ícone.
- **`id`/`name` estáveis e previsíveis** em campo de formulário — nada de `useId()` nem id gerado em build, para o seletor de hoje continuar valendo amanhã.
- `data-testid` nos elementos-chave.

A tabela completa de nomes fixados (campo de busca, botões de reação, campos de cadastro/login/formulário de item etc.) está no `ARQUITETURA.md`, em "Requisito AI-first" — trate aqueles nomes literais como fixos, não os reinvente durante a implementação.

## Lacunas conhecidas do back-end (aceitas nesta fase)

- Sem CORS no back-end → contornado pelo proxy do Next (acima); um deploy real vai exigir `cors` do lado de lá.
- Foto é só URL — não existe endpoint de upload nem storage; a drop zone do wireframe não é implementável ainda.
- Sem `GET` de comentários — só `POST`; a UI mostra o `commentCount` subindo, sem thread visível.
- Sem verificação de e-mail no cadastro.
- Sem renderização no servidor dos dados do feed (adiado de propósito, para manter um caminho de dados só).
- Sem testes automatizados (fora do escopo desta fase).

## Invariantes

Regras que se violam por padrão quando ninguém avisa.

- **Componente nunca faz chamada HTTP** — sempre componente → hook → service.
- **Service nunca importa React.**
- **Token só chega como parâmetro** — nunca lido de `localStorage` ou de global dentro de um service.
- **Página de `/app` é fina** — sem regra de negócio.
- **`id`/`name` de formulário são estáveis** — nada de `useId()`.
- **Nada de `<div onClick>`** — usar elemento interativo real.
- **Mudar o contrato da API é breaking change** — o back-end vive em outro repositório; sincronizar lá antes, nunca depois.
- **Nada de dado físico nem de encontro** — o Calibre é um clube, não uma ferramenta de matching ou logística.
- **Nunca commitar direto na `main`** — criar branch antes (`git checkout -b <tipo>/<descricao>`), commitar nela e abrir PR.

## Documentos de referência

- [ARQUITETURA.md](ARQUITETURA.md) — camadas, fluxo de dados, contrato de API completo, design system e tabela de nomes AI-first. **Leia antes de criar rota, componente ou chamada de API.**
- [README.md](README.md) — produto, stack, como rodar, débitos técnicos aceitos.

O brief de produto (fora do repositório: `Documentos/Projetos Claude/Calibre/calibre-frontend-brief.md`) é a fonte da verdade do escopo. Não é espaço para reabrir decisões de produto ou arquitetura.
