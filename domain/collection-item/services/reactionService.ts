import { request } from "@/domain/shared/services/httpClient";
import type { ReactionResponse, ReactionType } from "@/domain/shared/types";

/**
 * POST /api/items/:id/reactions — exige Bearer.
 *
 * Devolve os contadores **já atualizados**, então a tela não precisa recarregar
 * o feed depois de reagir: aplica o que voltou no item correspondente.
 *
 * 409 quando o mesmo usuário repete o mesmo tipo de reação no mesmo item. É
 * comportamento esperado, não falha — quem decide o que fazer com isso é o hook.
 */
export function react(
  itemId: string,
  type: ReactionType,
  token: string,
): Promise<ReactionResponse> {
  return request<ReactionResponse>(`/api/items/${encodeURIComponent(itemId)}/reactions`, {
    method: "POST",
    body: { type },
    token,
  });
}
