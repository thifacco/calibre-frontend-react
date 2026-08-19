"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import * as reactionService from "../services/reactionService";
import { useSession } from "@/domain/auth/hooks/useSession";
import { isApiError } from "@/domain/shared/services/ApiError";
import type { ReactionCounts, ReactionType } from "@/domain/shared/types";

/**
 * Reagir a um item.
 *
 * Duas coisas que parecem erro e não são:
 *
 * - **Anônimo não é falha.** O feed é público de leitura, mas reagir exige
 *   sessão; o brief manda mandar para /cadastro em vez de mostrar mensagem.
 * - **409 não é falha.** É o índice único recusando a mesma reação repetida do
 *   mesmo usuário no mesmo item. A tela marca o botão como já usado e segue.
 *   Sem `GET` das minhas reações no contrato, esse estado só pode ser
 *   descoberto assim: reagindo. Por isso ele é local e some ao recarregar.
 */

export interface UseReactionResult {
  react: (type: ReactionType) => void;
  /** Reação em voo — desabilita o botão e evita clique duplo. */
  pending: ReactionType | null;
  /** Tipos que este usuário já usou neste item, até onde a tela sabe. */
  reacted: ReadonlySet<ReactionType>;
  error: string | null;
}

export function useReaction(
  itemId: string,
  onCounts: (counts: ReactionCounts) => void,
): UseReactionResult {
  const { token, handleUnauthorized } = useSession();
  const router = useRouter();

  const [pending, setPending] = useState<ReactionType | null>(null);
  const [reacted, setReacted] = useState<ReadonlySet<ReactionType>>(() => new Set());
  const [error, setError] = useState<string | null>(null);

  const react = useCallback(
    (type: ReactionType) => {
      if (token === null) {
        router.push("/cadastro");
        return;
      }

      setPending(type);
      setError(null);

      void reactionService
        .react(itemId, type, token)
        .then((response) => {
          setReacted((atual) => new Set(atual).add(type));
          onCounts(response.reactionCounts);
        })
        .catch((erro: unknown) => {
          // Sessão morta: o useSession desloga e redireciona.
          if (handleUnauthorized(erro)) return;

          if (isApiError(erro) && erro.status === 409) {
            setReacted((atual) => new Set(atual).add(type));
            return;
          }

          setError(isApiError(erro) ? erro.message : "Não foi possível registrar sua reação.");
        })
        .finally(() => setPending(null));
    },
    [itemId, token, onCounts, handleUnauthorized, router],
  );

  return { react, pending, reacted, error };
}
