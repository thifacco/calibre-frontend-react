"use client";

import { useCallback, useEffect, useState } from "react";
import * as collectionItemService from "../services/collectionItemService";
import { useSession } from "@/domain/auth/hooks/useSession";
import { isApiError } from "@/domain/shared/services/ApiError";
import type { FeedItem } from "@/domain/shared/types";

/**
 * Coleção do usuário autenticado.
 *
 * Não há `setState` no corpo do efeito: o estado já nasce em `loading` e só é
 * escrito nos callbacks da promise. O `retry` volta para `loading` de dentro
 * de um handler de evento, onde isso é permitido.
 */

export type UserItemsStatus = "loading" | "ready" | "error";

export interface UseUserItemsResult {
  items: FeedItem[];
  status: UserItemsStatus;
  error: string | null;
  retry: () => void;
  /** Põe um item recém-criado no topo, sem refazer a requisição. */
  prepend: (item: FeedItem) => void;
}

interface Estado {
  status: UserItemsStatus;
  items: FeedItem[];
  error: string | null;
}

const ESTADO_INICIAL: Estado = { status: "loading", items: [], error: null };

export function useUserItems(): UseUserItemsResult {
  const { session, token, handleUnauthorized } = useSession();
  const userId = session?.userId ?? null;

  const [estado, setEstado] = useState<Estado>(ESTADO_INICIAL);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    if (userId === null || token === null) return;

    let cancelado = false;

    void collectionItemService
      .listByUser(userId, token)
      .then((response) => {
        if (cancelado) return;
        setEstado({ status: "ready", items: response.items, error: null });
      })
      .catch((erro: unknown) => {
        if (cancelado) return;
        if (handleUnauthorized(erro)) return;

        setEstado({
          status: "error",
          items: [],
          error: isApiError(erro)
            ? erro.message
            : "Não foi possível carregar sua coleção.",
        });
      });

    return () => {
      cancelado = true;
    };
  }, [userId, token, recarga, handleUnauthorized]);

  const retry = useCallback(() => {
    setEstado(ESTADO_INICIAL);
    setRecarga((n) => n + 1);
  }, []);

  const prepend = useCallback((item: FeedItem) => {
    setEstado((atual) => ({ ...atual, items: [item, ...atual.items] }));
  }, []);

  return { items: estado.items, status: estado.status, error: estado.error, retry, prepend };
}
