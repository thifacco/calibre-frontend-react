"use client";

import { useEffect, useRef } from "react";

/**
 * Observa um sentinela no fim da lista e chama `onLoadMore` quando ele entra
 * na viewport.
 *
 * `onLoadMore` **precisa** vir de `useCallback`. Se a identidade mudar a cada
 * render, o efeito reassina o observer sem parar; e como o observer dispara
 * assim que o alvo está visível, isso vira um laço de paginação. É por isso
 * que o `loadMore` do useFeed lê o estado de um ref em vez de depender dele.
 */

export interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  /** Falso quando não há próxima página ou já existe carregamento em curso. */
  enabled: boolean;
  /** Antecipação: dispara antes do sentinela aparecer de fato. */
  rootMargin?: string;
}

export function useInfiniteScroll({
  onLoadMore,
  enabled,
  rootMargin = "300px",
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (node === null || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [onLoadMore, enabled, rootMargin]);

  return sentinelRef;
}
