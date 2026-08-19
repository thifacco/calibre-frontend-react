import { request } from "@/domain/shared/services/httpClient";
import type { CommentResponse } from "@/domain/shared/types";

/**
 * POST /api/items/:id/comments — exige Bearer.
 *
 * Não existe `GET` de comentários no contrato. O comentário é gravado e o
 * `commentCount` do item sobe, mas a conversa não tem como ser exibida — é
 * lacuna conhecida do back-end, não esquecimento da tela.
 */
export function comment(
  itemId: string,
  content: string,
  token: string,
): Promise<CommentResponse> {
  return request<CommentResponse>(`/api/items/${encodeURIComponent(itemId)}/comments`, {
    method: "POST",
    body: { content },
    token,
  });
}
