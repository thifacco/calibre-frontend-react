import { request } from "@/domain/shared/services/httpClient";
import type { FeedResponse } from "@/domain/shared/types";

/**
 * GET /api/feed — público, sem token. Sem React aqui.
 */

export interface FeedParams {
  /** String opaca vinda do `nextCursor` anterior. Ausente = primeira página. */
  cursor?: string;
  /** Filtro por marca/modelo. Ausente = feed inteiro. */
  q?: string;
}

/**
 * O `signal` é opcional e existe por causa da busca: ao digitar, cada tecla
 * debounced pode deixar uma requisição anterior em voo, e a resposta antiga
 * chegando depois da nova pintaria o resultado errado. O httpClient deixa o
 * `AbortError` passar cru para o hook distinguir cancelamento de falha.
 */
export function getFeed(params: FeedParams, signal?: AbortSignal): Promise<FeedResponse> {
  return request<FeedResponse>("/api/feed", {
    // `cursor` e `q` ausentes viram `undefined` e o httpClient os descarta —
    // é o hook que decide que busca vazia é "sem filtro".
    query: { cursor: params.cursor, q: params.q },
    ...(signal !== undefined ? { signal } : {}),
  });
}
