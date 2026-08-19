"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { FeedEmpty } from "./FeedEmpty";
import { FeedPost } from "./FeedPost";
import type { FeedItem } from "@/domain/shared/types";
import type { FeedStatus } from "../types";

export interface FeedListProps {
  items: FeedItem[];
  status: FeedStatus;
  error: string | null;
  hasMore: boolean;
  query: string;
  onLoadMore: () => void;
  onRetry: () => void;
}

function FeedSkeleton() {
  return (
    <div className="border-t border-border px-5 py-4" aria-hidden="true">
      <Skeleton className="h-4 w-52" />
      <Skeleton className="mt-2.5 h-4 w-full" />
      <Skeleton className="mt-1.5 h-4 w-3/4" />
    </div>
  );
}

export function FeedList({
  items,
  status,
  error,
  hasMore,
  query,
  onLoadMore,
  onRetry,
}: FeedListProps) {
  // Desligado enquanto já há requisição em curso: sem isso o sentinela
  // continua visível e pede a mesma página várias vezes.
  const sentinelRef = useInfiniteScroll({
    onLoadMore,
    enabled: hasMore && status === "ready",
  });

  if (status === "loading") {
    return (
      <div aria-busy="true" aria-live="polite">
        <span className="sr-only">Carregando histórias</span>
        <FeedSkeleton />
        <FeedSkeleton />
        <FeedSkeleton />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        role="alert"
        data-testid="feed-erro"
        className="border-t border-border px-5 py-10 text-center"
      >
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button type="button" variant="outline" onClick={onRetry} className="mt-4">
          Tentar de novo
        </Button>
      </div>
    );
  }

  if (items.length === 0) return <FeedEmpty query={query} />;

  return (
    <>
      {/* `feed` é o role da ARIA para lista que cresce por rolagem — avisa ao
          leitor de tela e ao agente que o conteúdo é paginado. */}
      <div role="feed" aria-busy={status === "loadingMore"} aria-label="Histórias do clube">
        {items.map((item) => (
          <FeedPost key={item.id} item={item} />
        ))}
      </div>

      {/* Erro de página seguinte não derruba o que já está na tela. */}
      {error !== null && (
        <p role="alert" className="border-t border-border px-5 py-4 text-center text-sm text-muted-foreground">
          {error}
        </p>
      )}

      {hasMore && (
        <div ref={sentinelRef} className="border-t border-border px-5 py-4 text-center">
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {status === "loadingMore" ? "Carregando mais histórias..." : ""}
          </span>
          {/*
            O botão é a rede de segurança da rolagem infinita: se o
            IntersectionObserver não disparar — aba em segundo plano, agente
            que não rola a página —, ainda existe um alvo clicável.
          */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            disabled={status === "loadingMore"}
            data-testid="botao-carregar-mais"
            className="mt-1 text-muted-foreground"
          >
            Carregar mais histórias
          </Button>
        </div>
      )}
    </>
  );
}
