"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as feedService from "../services/feedService";
import { isApiError } from "@/domain/shared/services/ApiError";
import type { FeedItem, ReactionCounts } from "@/domain/shared/types";
import type { FeedState, FeedStatus } from "../types";

/**
 * Feed paginado por cursor, com busca.
 *
 * A busca é debounced: `query` acompanha o input a cada tecla para o campo não
 * travar, e `appliedQuery` só muda depois da pausa — é ela que dispara a
 * requisição.
 *
 * Trocar a busca **descarta as páginas acumuladas e zera o cursor**. Cursor de
 * uma busca não vale para outra: ele aponta para uma posição dentro de um
 * conjunto de resultados, e o conjunto mudou.
 */

const DEBOUNCE_MS = 300;

const ESTADO_INICIAL: FeedState = {
  loadedQuery: null,
  status: "ready",
  items: [],
  nextCursor: null,
  error: null,
};

export interface UseFeedResult {
  status: FeedStatus;
  items: FeedItem[];
  error: string | null;
  /** Valor do input, sem debounce. */
  query: string;
  setQuery: (query: string) => void;
  hasMore: boolean;
  loadMore: () => void;
  retry: () => void;
  /** Aplica os contadores devolvidos por uma reação, sem refazer a busca. */
  applyReactionCounts: (itemId: string, counts: ReactionCounts) => void;
  /** Incrementa o contador de comentários de um item. */
  incrementCommentCount: (itemId: string) => void;
}

function mensagemDeErro(error: unknown): string {
  if (isApiError(error)) {
    return error.isNetworkError
      ? "Não foi possível carregar o feed. Verifique se o back-end está no ar."
      : error.message;
  }
  return "Não foi possível carregar o feed.";
}

export function useFeed(): UseFeedResult {
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [state, setState] = useState<FeedState>(ESTADO_INICIAL);

  /** Muda no retry para reexecutar o efeito com a mesma busca. */
  const [recarga, setRecarga] = useState(0);

  // Impede duas requisições de "carregar mais" ao mesmo tempo quando o
  // sentinela reaparece durante a rolagem.
  const carregandoMaisRef = useRef(false);

  // Espelho do estado para o `loadMore` ler sem virar dependência: se ele
  // dependesse de `state`, mudaria de identidade a cada página carregada e
  // faria o IntersectionObserver do useInfiniteScroll reassinar sem parar.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const timer = window.setTimeout(() => setAppliedQuery(query.trim()), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    carregandoMaisRef.current = false;

    feedService
      .getFeed({ q: appliedQuery === "" ? undefined : appliedQuery }, controller.signal)
      .then((response) => {
        setState({
          loadedQuery: appliedQuery,
          status: "ready",
          items: response.items,
          nextCursor: response.nextCursor,
          error: null,
        });
      })
      .catch((error: unknown) => {
        // Cancelamento é troca de busca, não falha: a próxima requisição já
        // está a caminho e vai pintar a tela.
        if (error instanceof DOMException && error.name === "AbortError") return;

        setState({
          loadedQuery: appliedQuery,
          status: "error",
          items: [],
          nextCursor: null,
          error: mensagemDeErro(error),
        });
      });

    return () => controller.abort();
  }, [appliedQuery, recarga]);

  const loadMore = useCallback(() => {
    // O estado vem de um ref, não do updater do setState: o React pode
    // executar updaters duas vezes em StrictMode, e disparar a requisição lá
    // dentro pediria a mesma página duas vezes.
    const atual = stateRef.current;

    if (carregandoMaisRef.current) return;
    if (atual.status !== "ready" || atual.nextCursor === null) return;
    if (atual.loadedQuery !== appliedQuery) return;

    carregandoMaisRef.current = true;
    setState((anterior) => ({ ...anterior, status: "loadingMore" }));

    feedService
      .getFeed({
        cursor: atual.nextCursor,
        q: appliedQuery === "" ? undefined : appliedQuery,
      })
      .then((response) => {
        setState((anterior) => ({
          ...anterior,
          status: "ready",
          // Concatena em vez de substituir — é o acúmulo de páginas.
          items: [...anterior.items, ...response.items],
          nextCursor: response.nextCursor,
          error: null,
        }));
      })
      .catch((error: unknown) => {
        // Mantém a lista: falhar a página seguinte não apaga o que já foi lido.
        setState((anterior) => ({
          ...anterior,
          status: "ready",
          error: mensagemDeErro(error),
        }));
      })
      .finally(() => {
        carregandoMaisRef.current = false;
      });
  }, [appliedQuery]);

  const retry = useCallback(() => {
    // Voltar `loadedQuery` para null faz o status derivado virar "loading" de
    // novo, sem precisar de setState dentro do efeito.
    setState((anterior) => ({ ...anterior, loadedQuery: null, error: null }));
    setRecarga((n) => n + 1);
  }, []);

  const applyReactionCounts = useCallback((itemId: string, counts: ReactionCounts) => {
    setState((atual) => ({
      ...atual,
      items: atual.items.map((item) =>
        item.id === itemId ? { ...item, reactionCounts: counts } : item,
      ),
    }));
  }, []);

  const incrementCommentCount = useCallback((itemId: string) => {
    setState((atual) => ({
      ...atual,
      items: atual.items.map((item) =>
        item.id === itemId ? { ...item, commentCount: item.commentCount + 1 } : item,
      ),
    }));
  }, []);

  // Enquanto os itens na mão forem de outra busca, a tela está carregando.
  const status: FeedStatus = state.loadedQuery === appliedQuery ? state.status : "loading";

  return {
    status,
    items: status === "loading" ? [] : state.items,
    error: status === "loading" ? null : state.error,
    query,
    setQuery,
    hasMore: state.nextCursor !== null,
    loadMore,
    retry,
    applyReactionCounts,
    incrementCommentCount,
  };
}
