"use client";

import { useCallback, useState } from "react";
import { MessageCircleIcon } from "lucide-react";
import { CommentForm } from "./CommentForm";
import { ReactionBar } from "./ReactionBar";
import type { FeedItem, ReactionCounts } from "@/domain/shared/types";

/**
 * Barra de ações de um item: as três reações à esquerda e "Comentar" à
 * direita, com o painel de comentário abrindo abaixo.
 *
 * Existe porque o botão de comentar mora na mesma linha das reações mas o
 * painel abre fora dela — quem guarda esse "aberto/fechado" precisa enxergar
 * as duas partes. É extensão da estrutura do ARQUITETURA.md, que lista só
 * `ReactionBar` e `CommentForm`.
 *
 * Vive em `collection-item` e não em `feed` porque reagir e comentar são
 * operações **sobre um item** — o feed é só onde elas aparecem.
 */

export interface ItemActionsProps {
  item: FeedItem;
  onReactionCounts: (itemId: string, counts: ReactionCounts) => void;
  onCommented: (itemId: string) => void;
}

export function ItemActions({ item, onReactionCounts, onCommented }: ItemActionsProps) {
  const [comentando, setComentando] = useState(false);

  const handleCounts = useCallback(
    (counts: ReactionCounts) => onReactionCounts(item.id, counts),
    [onReactionCounts, item.id],
  );

  const handleCommented = useCallback(() => onCommented(item.id), [onCommented, item.id]);

  const abrir = useCallback(() => setComentando(true), []);
  const fechar = useCallback(() => setComentando(false), []);

  const painelId = `painel-comentario-${item.id}`;

  return (
    <div className="mt-2.5">
      <div className="flex items-center gap-3">
        <ReactionBar itemId={item.id} counts={item.reactionCounts} onCounts={handleCounts} />

        <button
          type="button"
          onClick={comentando ? fechar : abrir}
          aria-expanded={comentando}
          aria-controls={painelId}
          data-testid="botao-comentar"
          className="ml-auto flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[0.8125rem] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <MessageCircleIcon aria-hidden="true" className="size-4" />
          {item.commentCount > 0 ? `Comentar (${item.commentCount})` : "Comentar"}
        </button>
      </div>

      <div id={painelId}>
        {comentando && (
          <CommentForm itemId={item.id} onCommented={handleCommented} onClose={fechar} />
        )}
      </div>
    </div>
  );
}
