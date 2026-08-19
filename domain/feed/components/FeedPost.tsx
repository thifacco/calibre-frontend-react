import type { FeedItem } from "@/domain/shared/types";

/**
 * Um post do feed, no formato "Twitter V1" do brief: só texto, sem card
 * elaborado, sem foto. `photos` existe no contrato mas não entra aqui — o
 * feed é deliberadamente textual.
 *
 * Server Component: não tem estado nem evento. As reações e o comentário
 * chegam por `actions`, vindas do domínio `collection-item`, porque reagir e
 * comentar são operações sobre um item e não sobre o feed.
 */

export interface FeedPostProps {
  item: FeedItem;
  actions?: React.ReactNode;
}

export function FeedPost({ item, actions }: FeedPostProps) {
  return (
    <article
      data-testid="post-feed"
      data-item-id={item.id}
      className="border-t border-border px-5 py-4"
    >
      <p className="text-sm">
        <span className="font-medium text-foreground">{item.userName}</span>
        <span className="text-muted-foreground">
          {" "}
          usa {item.brand} {item.model}:
        </span>
      </p>

      {/* <q> em vez de aspas digitadas: o texto do usuário fica marcado como
          citação, e o browser desenha as aspas conforme o idioma da página. */}
      <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-foreground">
        <q>{item.memoryStory}</q>
      </p>

      {actions}
    </article>
  );
}
