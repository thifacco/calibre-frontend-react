import { request } from "@/domain/shared/services/httpClient";
import type {
  FeedItem,
  NewCollectionItemInput,
  UserItemsResponse,
} from "@/domain/shared/types";

/**
 * Itens de coleção. Ambas as rotas exigem Bearer — inclusive a listagem, que
 * é pública em conteúdo mas fechada em acesso pelo back-end.
 */

/** GET /api/items?userId= — 200 `{ items }`. */
export function listByUser(userId: string, token: string): Promise<UserItemsResponse> {
  return request<UserItemsResponse>("/api/items", {
    query: { userId },
    token,
  });
}

/** POST /api/items — 201 com o `FeedItem` já criado, contadores zerados. */
export function create(input: NewCollectionItemInput, token: string): Promise<FeedItem> {
  return request<FeedItem>("/api/items", {
    method: "POST",
    body: input,
    token,
  });
}
