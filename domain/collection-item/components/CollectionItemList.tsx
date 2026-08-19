"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CollectionItemRow } from "./CollectionItemRow";
import type { UserItemsStatus } from "../hooks/useUserItems";
import type { FeedItem } from "@/domain/shared/types";

export interface CollectionItemListProps {
  items: FeedItem[];
  status: UserItemsStatus;
  error: string | null;
  onRetry: () => void;
}

export function CollectionItemList({ items, status, error, onRetry }: CollectionItemListProps) {
  if (status === "loading") {
    return (
      <div aria-busy="true" aria-live="polite">
        <span className="sr-only">Carregando sua coleção</span>
        <Skeleton className="mb-2 h-14 w-full rounded-lg" />
        <Skeleton className="mb-2 h-14 w-full rounded-lg" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div role="alert" data-testid="colecao-erro" className="py-6 text-center">
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button type="button" variant="outline" size="sm" onClick={onRetry} className="mt-3">
          Tentar de novo
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p data-testid="colecao-vazia" className="py-6 text-sm text-muted-foreground">
        Sua coleção está vazia. Comece pelo relógio que tem a história mais difícil de contar.
      </p>
    );
  }

  return (
    <ul className="list-none" data-testid="lista-colecao">
      {items.map((item) => (
        <li key={item.id}>
          <CollectionItemRow item={item} />
        </li>
      ))}
    </ul>
  );
}
