"use client";

import { useFeed } from "../hooks/useFeed";
import { FeedList } from "./FeedList";
import { FeedSearch } from "./FeedSearch";

/**
 * Junta busca e lista. Existe porque as duas compartilham o mesmo `useFeed` e
 * a página de `/app` precisa continuar fina — colocar o hook lá dentro faria
 * de `app/page.tsx` um Client Component com estado, que é o que a arquitetura
 * proíbe.
 */
export function Feed() {
  const {
    items,
    status,
    error,
    query,
    setQuery,
    hasMore,
    loadMore,
    retry,
    applyReactionCounts,
    incrementCommentCount,
  } = useFeed();

  return (
    <>
      <div className="px-6 pb-6">
        <FeedSearch value={query} onChange={setQuery} />
      </div>

      <FeedList
        items={items}
        status={status}
        error={error}
        hasMore={hasMore}
        query={query}
        onLoadMore={loadMore}
        onRetry={retry}
        onReactionCounts={applyReactionCounts}
        onCommented={incrementCommentCount}
      />
    </>
  );
}
