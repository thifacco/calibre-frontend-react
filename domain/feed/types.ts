import type { FeedItem } from "@/domain/shared/types";

/**
 * Estado do feed como a UI precisa dele. `FeedItem` em si vem do contrato,
 * em shared/types.ts.
 */

/**
 * Um estado só, em vez de booleans soltos.
 *
 * `loading` e `loadingMore` são situações diferentes na tela: a primeira
 * mostra esqueleto no lugar da lista, a segunda mostra "carregando mais" com
 * a lista ainda visível. Dois booleans permitiriam os dois ligados ao mesmo
 * tempo, que é um estado que não existe.
 */
export type FeedStatus = "loading" | "loadingMore" | "ready" | "error";

export interface FeedState {
  /**
   * Qual busca os `items` representam; `null` = nada carregado ainda.
   *
   * É daqui que sai o `loading`, em vez de um `setState` no começo do efeito:
   * quando esta busca difere da busca atual, a lista na mão é de outra
   * pergunta e a tela está carregando. Derivar evita o `setState` síncrono em
   * efeito que o React 19 desaconselha por causar renders em cascata.
   */
  loadedQuery: string | null;
  status: Exclude<FeedStatus, "loading">;
  items: FeedItem[];
  /** `null` = fim da lista. É a resposta do back-end, não contagem local. */
  nextCursor: string | null;
  error: string | null;
}
