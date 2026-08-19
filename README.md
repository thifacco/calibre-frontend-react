# calibre-frontend-react

Front-end do **Calibre**, um clube de colecionadores de relógios onde cada item da coleção carrega uma história de memória emocional, não apenas dados técnicos.

> Toda coleção guarda uma conversa que ainda não aconteceu.

O Calibre não é uma ferramenta de matching ou encontro — a interação entre membros é social (comentar, reagir), nunca logística. Não existe geolocalização, endereço ou dado físico de usuário no produto.

O back-end vive em repositório separado (`calibre-backend-node`) e roda em `http://localhost:4000`. O contrato consumido está em [ARQUITETURA.md](ARQUITETURA.md).

## Escopo

Três páginas, e só:

| Rota | Auth | O que é |
|---|---|---|
| `/` | não | Landing — slogan, busca e feed de histórias com rolagem infinita |
| `/cadastro` | não | Formulário de entrada no clube: nome, e-mail, senha e confirmação |
| `/dashboard` | sim | Coleção do próprio usuário e formulário de novo relógio |

Nenhuma página além dessas nesta fase do MVP.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Linguagem | TypeScript 5 |
| Design system | shadcn/ui — Radix UI + Tailwind CSS 4 |
| Estado | `useState` + Context API (`ApiContext`) — sem Redux, sem Zustand, sem React Query |
| Execução | Localhost — sem deploy nesta fase |

## Como rodar

Requer Node 22 ou superior e o back-end no ar.

```bash
npm install
```

`.env.local` precisa de duas variáveis:

```
NEXT_PUBLIC_API_URL=
API_PROXY_TARGET=http://localhost:4000
```

O back-end não expõe CORS, então o Next proxia `/api/*` para ele: `API_PROXY_TARGET` diz para onde, e `NEXT_PUBLIC_API_URL` fica **vazia** de propósito — vazia significa same-origin, e o browser nunca fala com a porta 4000 diretamente. Preenchê-la com uma origem real faz o front chamar o back-end direto e o proxy sair do caminho; aí o back-end precisa de `cors`.

```bash
npm run dev
```

Sobe em `http://localhost:3000`.

### O back-end precisa estar no ar

Nesta fase não existe mock nem fixture: **todo dado da tela vem do back-end.** Com `calibre-backend-node` parado, a landing renderiza o esqueleto do feed e nada mais.

Subir o back-end exige, por sua vez, MongoDB configurado como replica set — as rotas de reação e comentário usam transação e falham em `mongod` standalone. O README daquele repositório explica a conversão.

## Arquitetura em uma frase

```
componente → hook → service → httpClient → back-end
```

O componente nunca chama `fetch`. O hook nunca sabe de URL. O service nunca conhece React. O token chega ao service como parâmetro, resolvido pelo hook a partir do `ApiContext` — nunca por import ou variável global.

Os detalhes, o porquê de cada regra e o contrato completo de API estão em [ARQUITETURA.md](ARQUITETURA.md). **Leia antes de criar rota, componente ou chamada de API.**

## AI-first

O produto precisa ser plenamente operável pelo agente **Claude in Chrome**, não só por humanos. Não é acessibilidade genérica: é requisito funcional.

Na prática — HTML semântico real (`<button>`, `<form>`, `<label for>`, nunca `<div onClick>`), `aria-label` em botão de ícone, `id`/`name` estáveis e previsíveis em formulário, `data-testid` nos elementos-chave. A tabela com os nomes fixados está em [ARQUITETURA.md](ARQUITETURA.md).

## Estado do repositório

Scaffold executado — o esqueleto do `create-next-app` está no ar e o build passa. Ainda não existe código de produto: `/domain` não foi criado, nenhuma das três páginas foi implementada e o proxy de `/api` ainda não está configurado.

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor local na porta 3000 |
| `npm run build` | build de produção |
| `npm start` | roda o build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | eslint |

## Documentação

- [ARQUITETURA.md](ARQUITETURA.md) — camadas, fluxo de dados, contrato de API, design system e requisito AI-first
- [CLAUDE.md](CLAUDE.md) — guia para desenvolvimento assistido por IA neste repositório

## Débitos técnicos conhecidos

Aceitos conscientemente nesta fase, documentados para não serem redescobertos como surpresa:

- **Sem CORS no back-end, contornado por proxy.** O front nunca chama `:4000` do browser — o Next proxia `/api/*`. Funciona local e não custa nada, mas o dia do deploy exige `cors` no back-end. Efeito colateral: no DevTools toda requisição aparece como `localhost:3000`, então erro de rede se depura no log do `next dev`.
- **Foto é URL, não upload.** O contrato aceita array de URLs; não existe endpoint de upload nem storage. A drop zone do wireframe fica para quando houver.
- **Comentário não tem thread visível.** Existe `POST` de comentário, não existe `GET` — o usuário posta e vê o contador subir, sem ler a conversa.
- **Sem verificação de e-mail no cadastro.** Depende do back-end; o usuário é criado e já pode logar.
- **Sem renderização no servidor de dados.** O feed é público e poderia ser SSR — adiado para manter um único caminho de dados.
- **Sem testes automatizados.** Não estão no escopo do brief nesta fase.
